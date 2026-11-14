# 📋 Panduan Integrasi Formulir Booking Aurelax ke Google Sheets

Panduan langkah-demi-langkah ini memandu Anda menghubungkan formulir reservasi pada landing page **Aurelax Family Massage** ke **Google Sheets** secara gratis menggunakan **Google Apps Script (GAS)**.

---

## 🛠️ Langkah 1: Buat Google Spreadsheet Baru
1. Buka browser dan kunjungi [Google Sheets](https://sheets.new).
2. Beri nama spreadsheet Anda, misalnya: `Data Reservasi - Aurelax Family Massage`.
3. Anda tidak perlu membuat header kolom secara manual, karena skrip akan membuatnya otomatis dengan warna tema resmi Aurelax (Emas `#C5A880` & Hitam Elegan).

---

## 💻 Langkah 2: Buka Apps Script
1. Pada menu atas Google Sheets, klik **Extensions** (Ekstensi) > **Apps Script**.
2. Hapus semua baris kode bawaan yang ada di editor (`function myFunction() { ... }`).
3. Buka file `Code.gs` yang ada di folder ini, lalu salin (**Copy**) seluruh isinya dan tempel (**Paste**) ke editor Apps Script.
4. *(Opsional)* Jika Anda ingin menerima email pemberitahuan setiap ada pemesanan baru, isi variabel `NOTIFICATION_EMAIL` di baris ke-13 dengan alamat email Anda:
   ```javascript
   const NOTIFICATION_EMAIL = "email_anda@gmail.com";
   ```
5. Klik ikon **Simpan** (ikon disket / `Ctrl + S`).

---

## 🚀 Langkah 3: Deploy sebagai Web App
1. Di pojok kanan atas editor Apps Script, klik tombol biru **Deploy** > pilih **New deployment** (Penerapan baru).
2. Klik ikon gerigi ⚙️ di sebelah *Select type*, lalu pilih **Web app**.
3. Isi kolom konfigurasi berikut dengan teliti:
   - **Description**: `Aurelax Booking API v1`
   - **Execute as**: `Me (email_anda@gmail.com)` *(Artinya skrip dijalankan atas izin akun Anda)*
   - **Who has access**: **`Anyone`** *(PENTING! Wajib dipilih "Anyone" agar pengunjung landing page dapat mengirim data tanpa perlu login ke Google)*.
4. Klik tombol **Deploy**.
5. Google akan meminta izin akses (*Authorization Required*):
   - Klik **Authorize access**.
   - Pilih akun Google Anda.
   - Jika muncul peringatan *"Google hasn't verified this app"*, klik **Advanced** (Lanjutan) di kiri bawah, lalu klik **Go to Untitled project (unsafe)**.
   - Klik **Allow**.
6. Setelah selesai, salin URL yang ada di bawah label **Web app URL** (formatnya seperti: `https://script.google.com/macros/s/AKfycb.../exec`).

---

## 🔗 Langkah 4: Hubungkan ke Landing Page (`index.html`)
1. Buka file `index.html` menggunakan editor teks (VS Code, Notepad, dll).
2. Cari baris berikut (sekitar baris 570):
   ```javascript
   const GOOGLE_SCRIPT_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbz_SAMPLE_DEPLOYMENT_ID/exec";
   ```
3. Ganti URL contoh tersebut dengan **Web app URL** yang Anda salin pada **Langkah 3**.
4. Ubah juga nomor WhatsApp resmi pada variabel:
   ```javascript
   const OFFICIAL_WHATSAPP_NUMBER = "6281234567890"; // Format internasional tanpa simbol '+'
   ```
5. Simpan file `index.html`.

---

## ✅ Langkah 5: Uji Coba Pemesanan
1. Buka `index.html` di browser Anda (cukup klik ganda filenya).
2. Masuk ke section **Booking Sekarang**, isi formulir data diri dan pilih jenis pijat, tanggal, serta jam.
3. Klik tombol **Konfirmasi Reservasi Saya**.
4. Buka kembali Google Sheets Anda:
   - Baris data baru akan muncul secara otomatis lengkap dengan **Waktu**, **ID Booking Unik** (misal: `ARX-20261105-824`), **Nama**, **WhatsApp**, **Layanan**, dan **Status: Menunggu Konfirmasi**.
5. Pelanggan juga dapat mengklik tombol **Buka Konfirmasi di WhatsApp** untuk langsung mengirimkan ringkasan pesanan ke WhatsApp admin dengan template pesan yang rapi!
