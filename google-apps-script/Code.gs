/**
 * ============================================================================
 *  AURELAX FAMILY MASSAGE — Google Apps Script Backend
 *  Versi: 2.0 (Fully Structured & Styled)
 *  Fungsi: Menerima data booking dari landing page dan menyimpannya ke
 *          Google Sheets dengan 3 tab terstruktur + dashboard ringkasan.
 * ============================================================================
 *
 *  CARA DEPLOY:
 *  1. Buka Google Sheets baru  →  Extensions  →  Apps Script
 *  2. Paste seluruh isi file ini, lalu Save (Ctrl+S)
 *  3. Deploy  →  New deployment  →  Web app
 *     - Execute as   : Me
 *     - Who has access : Anyone
 *  4. Copy "Web app URL" hasil deploy
 *  5. Paste URL tersebut ke variabel GOOGLE_SCRIPT_WEBAPP_URL di index.html
 * ============================================================================
 */

// ─────────────────────────────────────────────
//  KONFIGURASI UTAMA  (edit sesuai kebutuhan)
// ─────────────────────────────────────────────
const CONFIG = {
  SHEET_RESERVASI  : "📋 Data Reservasi",
  SHEET_DASHBOARD  : "📊 Dashboard",
  SHEET_LOG        : "🔧 Log Sistem",
  BOOKING_PREFIX   : "ARX",
  TIMEZONE         : "GMT+7",
  NOTIF_EMAIL      : "",           // Isi email pemilik jika ingin notifikasi
  WA_NUMBER        : "6281234567890",
  COLOR_GOLD       : "#C5A880",
  COLOR_GOLD_DARK  : "#9F8055",
  COLOR_GREEN      : "#4EAB59",
  COLOR_DARK       : "#1A1A1E",
};

// ─────────────────────────────────────────────
//  doGet — Health Check
// ─────────────────────────────────────────────
function doGet(e) {
  return _jsonResponse({
    status    : "ok",
    service   : "Aurelax Family Massage Booking API v2.0",
    timestamp : _now()
  });
}

// ─────────────────────────────────────────────
//  doPost — Endpoint Utama
// ─────────────────────────────────────────────
function doPost(e) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(12000)) {
    return _jsonResponse({ status: "error", message: "Server sedang sibuk, coba lagi." });
  }

  try {
    const data = _parsePayload(e);
    if (!data) throw new Error("Payload kosong atau tidak valid.");

    const validationError = _validateData(data);
    if (validationError) throw new Error(validationError);

    const ss             = SpreadsheetApp.getActiveSpreadsheet();
    const sheetReservasi = _getOrCreateSheet(ss, CONFIG.SHEET_RESERVASI);
    const sheetDashboard = _getOrCreateSheet(ss, CONFIG.SHEET_DASHBOARD);
    const sheetLog       = _getOrCreateSheet(ss, CONFIG.SHEET_LOG);

    _initReservasiSheet(sheetReservasi);
    _initDashboardSheet(sheetDashboard);
    _initLogSheet(sheetLog);

    const now         = new Date();
    const bookingId   = _generateBookingId(now);
    const tsFormatted = _formatDate(now, "dd/MM/yyyy HH:mm:ss");
    const dateFormatted = _formatDate(now, "dd/MM/yyyy");
    const harga       = _estimasiHarga(data.layanan || "");

    const newRow = [
      bookingId,
      tsFormatted,
      dateFormatted,
      data.nama          || "-",
      `'${(data.whatsapp || "-").replace(/\D/g, "")}`,
      data.layanan       || "-",
      data.jumlah_tamu   || "1 Orang",
      data.tanggal       || "-",
      data.jam           || "-",
      data.catatan       || "-",
      harga,
      "Landing Page",
      "Menunggu Konfirmasi",
      "-",
    ];

    sheetReservasi.appendRow(newRow);

    const lastRow = sheetReservasi.getLastRow();
    _styleDataRow(sheetReservasi, lastRow);
    sheetReservasi.getRange(lastRow, 11).setNumberFormat('"Rp "#,##0');

    _updateDashboard(sheetDashboard, ss);
    _appendLog(sheetLog, bookingId, data.nama, "SUCCESS", "Reservasi berhasil disimpan");

    if (CONFIG.NOTIF_EMAIL && CONFIG.NOTIF_EMAIL.trim() !== "") {
      _sendEmail(data, bookingId, harga);
    }

    return _jsonResponse({
      status    : "success",
      message   : "Reservasi berhasil disimpan.",
      bookingId : bookingId,
      harga     : harga
    });

  } catch (err) {
    try {
      const ss  = SpreadsheetApp.getActiveSpreadsheet();
      const log = _getOrCreateSheet(ss, CONFIG.SHEET_LOG);
      _initLogSheet(log);
      _appendLog(log, "-", "-", "ERROR", err.message);
    } catch (_) {}
    return _jsonResponse({ status: "error", message: err.message });
  } finally {
    lock.releaseLock();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  INISIALISASI: 📋 Data Reservasi
// ─────────────────────────────────────────────────────────────────────────────
function _initReservasiSheet(sheet) {
  if (sheet.getLastRow() > 0) return;

  // Baris 1: Judul besar
  sheet.getRange("A1:N1").merge()
    .setValue("🌿  AURELAX FAMILY MASSAGE  —  Sistem Manajemen Reservasi")
    .setBackground(CONFIG.COLOR_DARK)
    .setFontColor(CONFIG.COLOR_GOLD)
    .setFontSize(14).setFontWeight("bold")
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.setRowHeight(1, 44);

  // Baris 2: Sub-info
  sheet.getRange("A2:N2").merge()
    .setValue("Data dikelola otomatis oleh sistem booking online. Kolom 'Status' & 'Catatan CS' dapat diedit manual oleh tim.")
    .setBackground("#22222A").setFontColor("#888888")
    .setFontSize(9).setHorizontalAlignment("center")
    .setVerticalAlignment("middle").setFontStyle("italic");
  sheet.setRowHeight(2, 26);

  // Baris 3: Header kolom
  const headers = [
    "ID Booking",
    "Waktu Submit",
    "Tgl Diterima",
    "Nama Lengkap",
    "No. WhatsApp",
    "Jenis Layanan / Paket",
    "Jumlah Tamu",
    "Tgl Reservasi",
    "Jam Datang",
    "Catatan / Preferensi",
    "Estimasi Harga (Rp)",
    "Sumber",
    "Status Reservasi",
    "Catatan CS",
  ];

  const hRange = sheet.getRange(3, 1, 1, headers.length);
  hRange.setValues([headers])
    .setBackground(CONFIG.COLOR_GOLD)
    .setFontColor(CONFIG.COLOR_DARK)
    .setFontWeight("bold").setFontSize(10)
    .setHorizontalAlignment("center").setVerticalAlignment("middle")
    .setBorder(true,true,true,true,true,true,
      CONFIG.COLOR_GOLD_DARK, SpreadsheetApp.BorderStyle.SOLID);
  sheet.setRowHeight(3, 36);

  // Lebar kolom
  const colWidths = [120, 150, 110, 165, 135, 230, 110, 115, 95, 230, 135, 100, 155, 200];
  colWidths.forEach((w, i) => sheet.setColumnWidth(i + 1, w));

  // Freeze
  sheet.setFrozenRows(3);
  sheet.setFrozenColumns(1);

  // Dropdown Status (kolom 13 / M)
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList([
      "Menunggu Konfirmasi",
      "Terkonfirmasi ✓",
      "Proses Perawatan 💆",
      "Selesai ✅",
      "Dibatalkan ✗"
    ], true)
    .setAllowInvalid(false).build();
  sheet.getRange("M4:M2000").setDataValidation(statusRule);

  // Conditional formatting untuk Status
  const cfRules = sheet.getConditionalFormatRules();
  const cfDefs = [
    { text: "Terkonfirmasi ✓",    bg: "#1E4D2B", fg: "#7FD99A" },
    { text: "Proses Perawatan 💆",bg: "#1A3A5C", fg: "#7EC8F4" },
    { text: "Selesai ✅",          bg: "#1E3D1E", fg: "#4EAB59" },
    { text: "Dibatalkan ✗",        bg: "#4D1E1E", fg: "#F47E7E" },
    { text: "Menunggu Konfirmasi", bg: "#3D3A28", fg: "#C5A880" },
  ];
  cfDefs.forEach(def => {
    cfRules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo(def.text)
        .setBackground(def.bg).setFontColor(def.fg)
        .setRanges([sheet.getRange("M4:M2000")]).build()
    );
  });
  sheet.setConditionalFormatRules(cfRules);

  // Tab color
  sheet.setTabColor(CONFIG.COLOR_GOLD);
}

// ─────────────────────────────────────────────────────────────────────────────
//  INISIALISASI: 📊 Dashboard
// ─────────────────────────────────────────────────────────────────────────────
function _initDashboardSheet(sheet) {
  if (sheet.getLastRow() > 0) return;

  sheet.setColumnWidth(1, 30);
  sheet.setColumnWidth(2, 230);
  sheet.setColumnWidth(3, 150);
  sheet.setColumnWidth(4, 30);
  sheet.setColumnWidth(5, 230);
  sheet.setColumnWidth(6, 150);

  // Judul
  sheet.getRange("B1:F1").merge()
    .setValue("📊  DASHBOARD RINGKASAN — AURELAX FAMILY MASSAGE")
    .setBackground(CONFIG.COLOR_DARK).setFontColor(CONFIG.COLOR_GOLD)
    .setFontSize(13).setFontWeight("bold")
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.setRowHeight(1, 44);

  sheet.getRange("B2:F2").merge()
    .setValue("Diperbarui otomatis setiap kali ada booking baru masuk dari website")
    .setBackground("#1A1A20").setFontColor("#888888")
    .setFontSize(9).setHorizontalAlignment("center").setFontStyle("italic");
  sheet.setRowHeight(2, 24);
  sheet.setRowHeight(3, 14);

  sheet.setTabColor(CONFIG.COLOR_GREEN);
}

// ─────────────────────────────────────────────────────────────────────────────
//  INISIALISASI: 🔧 Log Sistem
// ─────────────────────────────────────────────────────────────────────────────
function _initLogSheet(sheet) {
  if (sheet.getLastRow() > 0) return;

  const headers = ["Timestamp", "Booking ID", "Nama", "Status", "Pesan"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
    .setBackground("#1A1A20").setFontColor("#AAAAAA")
    .setFontWeight("bold").setFontSize(9).setHorizontalAlignment("center");

  [150, 130, 150, 90, 350].forEach((w, i) => sheet.setColumnWidth(i + 1, w));
  sheet.setFrozenRows(1);
  sheet.setTabColor("#555555");
  sheet.hideSheet();
}

// ─────────────────────────────────────────────────────────────────────────────
//  HELPER: Styling baris data (alternating)
// ─────────────────────────────────────────────────────────────────────────────
function _styleDataRow(sheet, rowNum) {
  const isEven = (rowNum % 2 === 0);
  const bg     = isEven ? "#1C1C22" : "#141418";

  sheet.getRange(rowNum, 1, 1, 14)
    .setBackground(bg).setFontColor("#E0E0E0").setFontSize(10)
    .setVerticalAlignment("middle")
    .setBorder(false,false,true,false,false,false,"#2A2A35", SpreadsheetApp.BorderStyle.SOLID);
  sheet.setRowHeight(rowNum, 32);

  // A: Booking ID — gold bold center
  sheet.getRange(rowNum, 1)
    .setFontColor(CONFIG.COLOR_GOLD).setFontWeight("bold").setHorizontalAlignment("center");
  // B, C: center
  sheet.getRange(rowNum, 2, 1, 2).setHorizontalAlignment("center");
  // G, H, I: center
  sheet.getRange(rowNum, 7, 1, 3).setHorizontalAlignment("center");
  // K: harga — right, gold bold
  sheet.getRange(rowNum, 11)
    .setHorizontalAlignment("right").setFontColor(CONFIG.COLOR_GOLD).setFontWeight("bold");
  // L: sumber — center
  sheet.getRange(rowNum, 12).setHorizontalAlignment("center");
  // M: status — center bold
  sheet.getRange(rowNum, 13).setHorizontalAlignment("center").setFontWeight("bold");
}

// ─────────────────────────────────────────────────────────────────────────────
//  HELPER: Update Dashboard dengan statistik terkini
// ─────────────────────────────────────────────────────────────────────────────
function _updateDashboard(dashSheet, ss) {
  const resSheet = ss.getSheetByName(CONFIG.SHEET_RESERVASI);
  if (!resSheet || resSheet.getLastRow() < 4) return;

  const lastRow    = resSheet.getLastRow();
  const statusData = resSheet.getRange(4, 13, lastRow - 3, 1).getValues().flat();
  const priceData  = resSheet.getRange(4, 11, lastRow - 3, 1).getValues().flat();

  const total      = statusData.length;
  const menunggu   = statusData.filter(s => s === "Menunggu Konfirmasi").length;
  const confirmed  = statusData.filter(s => s === "Terkonfirmasi ✓").length;
  const selesai    = statusData.filter(s => s === "Selesai ✅").length;
  const totalHarga = priceData.reduce((acc, v) => acc + (Number(v) || 0), 0);

  _setDashCard(dashSheet, "B4:C6",   "📋 Total Reservasi",           total,     "#1E1E28");
  _setDashCard(dashSheet, "E4:F6",   "⏳ Menunggu Konfirmasi",        menunggu,  "#2A2318");
  _setDashCard(dashSheet, "B8:C10",  "✅ Terkonfirmasi",              confirmed, "#1A2E1A");
  _setDashCard(dashSheet, "E8:F10",  "🎉 Selesai",                   selesai,   "#1A2A1A");
  _setDashCard(dashSheet, "B12:F14", "💰 Estimasi Total Pendapatan",
               "Rp " + totalHarga.toLocaleString("id-ID"), "#1E1A10");

  dashSheet.getRange("B16:F16").merge()
    .setValue("⏱ Terakhir diperbarui: " + _now())
    .setFontColor("#555555").setFontSize(9)
    .setHorizontalAlignment("center").setFontStyle("italic");

  [4,8,12].forEach(r => dashSheet.setRowHeight(r, 36));
  [5,9,13].forEach(r => dashSheet.setRowHeight(r, 36));
  [6,10,14].forEach(r => dashSheet.setRowHeight(r, 36));
}

function _setDashCard(sheet, range, label, value, bgColor) {
  const display = (typeof value === "number")
    ? `${label}\n${value}`
    : `${label}\n${value}`;
  sheet.getRange(range).merge()
    .setValue(display)
    .setBackground(bgColor || "#1E1E24")
    .setFontColor(CONFIG.COLOR_GOLD)
    .setFontSize(14).setFontWeight("bold")
    .setHorizontalAlignment("center").setVerticalAlignment("middle")
    .setWrap(true)
    .setBorder(true,true,true,true,false,false,
      CONFIG.COLOR_GOLD_DARK, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
}

// ─────────────────────────────────────────────────────────────────────────────
//  HELPER: Append log entry
// ─────────────────────────────────────────────────────────────────────────────
function _appendLog(logSheet, bookingId, nama, status, message) {
  logSheet.appendRow([_now(), bookingId, nama, status, message]);
  const r = logSheet.getLastRow();
  logSheet.getRange(r, 1, 1, 5).setFontSize(9)
    .setFontColor(status === "ERROR" ? "#F47E7E" : "#888888");
  logSheet.getRange(r, 4).setFontWeight("bold")
    .setFontColor(status === "ERROR" ? "#F47E7E" : "#7FD99A");
}

// ─────────────────────────────────────────────────────────────────────────────
//  HELPER: Estimasi harga berdasarkan layanan
// ─────────────────────────────────────────────────────────────────────────────
function _estimasiHarga(layanan) {
  const map = {
    "Traditional Body Massage"  : 135000,
    "Aromatherapy Relaxing"     : 160000,
    "Hot Stone Herbal Therapy"  : 210000,
    "Reflexology & Foot Spa"    : 110000,
    "Happy Family Harmony Suite": 480000,
    "Mom & Kids Gentle Care"    : 175000,
  };
  for (const key in map) {
    if (layanan.toLowerCase().includes(key.toLowerCase())) return map[key];
  }
  return 0;
}

// ─────────────────────────────────────────────────────────────────────────────
//  HELPER: Generate Booking ID
// ─────────────────────────────────────────────────────────────────────────────
function _generateBookingId(now) {
  const dateCode = Utilities.formatDate(now, CONFIG.TIMEZONE, "yyyyMMdd");
  const rand     = Math.floor(100 + Math.random() * 900);
  return `${CONFIG.BOOKING_PREFIX}-${dateCode}-${rand}`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  HELPER: Parse payload
// ─────────────────────────────────────────────────────────────────────────────
function _parsePayload(e) {
  if (!e) return null;
  if (e.postData && e.postData.contents) {
    try { return JSON.parse(e.postData.contents); } catch (_) {}
  }
  return e.parameter || null;
}

// ─────────────────────────────────────────────────────────────────────────────
//  HELPER: Validasi field wajib
// ─────────────────────────────────────────────────────────────────────────────
function _validateData(data) {
  if (!data.nama     || !data.nama.trim())    return "Nama tidak boleh kosong.";
  if (!data.whatsapp || !data.whatsapp.trim())return "Nomor WhatsApp tidak boleh kosong.";
  if (!data.layanan  || !data.layanan.trim()) return "Pilihan layanan tidak boleh kosong.";
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
//  HELPER: Get or Create sheet
// ─────────────────────────────────────────────────────────────────────────────
function _getOrCreateSheet(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

// ─────────────────────────────────────────────────────────────────────────────
//  HELPER: Format date & timestamp
// ─────────────────────────────────────────────────────────────────────────────
function _formatDate(date, fmt) {
  return Utilities.formatDate(date, CONFIG.TIMEZONE, fmt);
}
function _now() {
  return _formatDate(new Date(), "dd/MM/yyyy HH:mm:ss");
}

// ─────────────────────────────────────────────────────────────────────────────
//  HELPER: JSON response
// ─────────────────────────────────────────────────────────────────────────────
function _jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─────────────────────────────────────────────────────────────────────────────
//  HELPER: Kirim email notifikasi
// ─────────────────────────────────────────────────────────────────────────────
function _sendEmail(data, bookingId, harga) {
  const hargaStr = "Rp " + Number(harga).toLocaleString("id-ID");
  const cleanWA  = (data.whatsapp || "").replace(/\D/g, "");
  const waLink   = `https://wa.me/${cleanWA}?text=Halo%20${encodeURIComponent(data.nama || "")}%2C%20reservasi%20Aurelax%20Anda%20(${bookingId})%20telah%20kami%20terima.%20Mohon%20konfirmasi%20kedatangan.`;

  MailApp.sendEmail({
    to      : CONFIG.NOTIF_EMAIL,
    subject : `[🌿 BOOKING BARU] ${bookingId} — ${data.nama || "Pelanggan"}`,
    htmlBody: `
      <div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;border-radius:12px;overflow:hidden;border:1px solid #C5A880">
        <div style="background:#0C0C0E;padding:22px;text-align:center">
          <p style="color:#C5A880;font-size:10px;letter-spacing:3px;margin:0 0 6px;text-transform:uppercase">Aurelax Family Massage</p>
          <h2 style="color:#fff;margin:0;font-size:18px">Reservasi Baru Masuk!</h2>
          <span style="display:inline-block;margin-top:10px;padding:4px 16px;border-radius:999px;background:#C5A880;color:#000;font-weight:bold;font-size:12px">${bookingId}</span>
        </div>
        <div style="padding:22px;background:#fafaf8">
          <table style="width:100%;border-collapse:collapse;font-size:13px">
            <tr><td style="padding:7px 12px 7px 0;font-weight:bold;color:#666;width:150px;border-bottom:1px solid #eee">👤 Nama</td><td style="padding:7px 0;border-bottom:1px solid #eee">${data.nama}</td></tr>
            <tr><td style="padding:7px 12px 7px 0;font-weight:bold;color:#666;border-bottom:1px solid #eee">📱 WhatsApp</td><td style="padding:7px 0;border-bottom:1px solid #eee">${data.whatsapp}</td></tr>
            <tr><td style="padding:7px 12px 7px 0;font-weight:bold;color:#666;border-bottom:1px solid #eee">💆 Layanan</td><td style="padding:7px 0;border-bottom:1px solid #eee">${data.layanan}</td></tr>
            <tr><td style="padding:7px 12px 7px 0;font-weight:bold;color:#666;border-bottom:1px solid #eee">👥 Jumlah Tamu</td><td style="padding:7px 0;border-bottom:1px solid #eee">${data.jumlah_tamu}</td></tr>
            <tr><td style="padding:7px 12px 7px 0;font-weight:bold;color:#666;border-bottom:1px solid #eee">📅 Tanggal</td><td style="padding:7px 0;border-bottom:1px solid #eee">${data.tanggal}</td></tr>
            <tr><td style="padding:7px 12px 7px 0;font-weight:bold;color:#666;border-bottom:1px solid #eee">⏰ Jam Datang</td><td style="padding:7px 0;border-bottom:1px solid #eee">${data.jam}</td></tr>
            <tr><td style="padding:7px 12px 7px 0;font-weight:bold;color:#666;border-bottom:1px solid #eee">💰 Est. Harga</td><td style="padding:7px 0;font-weight:bold;color:#9F8055;border-bottom:1px solid #eee">${hargaStr}</td></tr>
            <tr><td style="padding:7px 12px 7px 0;font-weight:bold;color:#666">📝 Catatan</td><td style="padding:7px 0">${data.catatan || "-"}</td></tr>
          </table>
          <div style="margin-top:22px;text-align:center">
            <a href="${waLink}" style="background:#4EAB59;color:#fff;padding:12px 28px;border-radius:999px;font-weight:bold;font-size:13px;text-decoration:none;display:inline-block">
              💬 Hubungi Pelanggan via WhatsApp
            </a>
          </div>
          <p style="margin-top:18px;font-size:11px;color:#aaa;text-align:center">Segera konfirmasi ketersediaan ruangan dan terapis. — Aurelax Team</p>
        </div>
      </div>
    `
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  🧪 TEST — Jalankan dari editor Apps Script
// ─────────────────────────────────────────────────────────────────────────────
function testBooking() {
  const dummy = {
    postData: {
      contents: JSON.stringify({
        nama        : "Sinta Rahayu",
        whatsapp    : "081234567890",
        layanan     : "Happy Family Harmony Suite (3 Orang)",
        jumlah_tamu : "3 Orang (Keluarga Kecil)",
        tanggal     : "2026-11-15",
        jam         : "14:00",
        catatan     : "Mohon terapis wanita untuk istri. AC lebih dingin ya."
      })
    }
  };
  const result = doPost(dummy);
  Logger.log(result.getContent());
}
