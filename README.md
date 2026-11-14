# 🌿 Aurelax Family Massage - Landing Page Web Responsif

Landing page web premium dan modern untuk bisnis pijat dan refleksi keluarga **Aurelax Family Massage**. Dibuat dengan mengacu pada gaya estetika modern berkelas (dark mode, ambient lighting, layout grid bersih, dan tipografi tegas) serta palet warna dan logo resmi brand Aurelax (Hitam Elegan, Emas Hangat `#C5A880`, dan Aksen Hijau Daun Alami `#4EAB59`).

---

## 🎨 Palet Warna & Identitas Brand
- **Dark Luxury Background**: `#0C0C0E` / `#141418` (memberikan kesan privat, tenang, dan eksklusif)
- **Warm Gold Accent**: `#C5A880` / `#9F8055` (mengacu pada warna teks dan aksen logo resmi Aurelax)
- **Natural Leaf Green**: `#4EAB59` / `#398444` (aksen bunga lotus, status higienis, dan tombol WhatsApp)
- **Typography**: 
  - Headline: *Plus Jakarta Sans* (Modern, bold, rapi)
  - Logo Accent: *Playfair Display* (Anggun & berkelas)

---

## 📁 Struktur Berkas Proyek

```
aurelax-landing-page/
├── index.html                           # Halaman utama landing page responsif (Tailwind CSS)
├── README.md                            # Panduan utama proyek
├── assets/
│   └── logo.png                         # Logo resmi Aurelax Family Massage
└── google-apps-script/
    ├── Code.gs                          # Draf kode backend Google Apps Script (GAS)
    └── PANDUAN_SETUP_GOOGLE_SHEETS.md   # Panduan integrasi formulir ke Google Sheets
```

---

## ✨ Fitur-Fitur Unggulan

1. **Header & Navigasi Interaktif**:
   - Logo vektor SVG + branding Aurelax.
   - Menu navigasi mulus (*smooth scrolling* ke setiap section).
   - Tombol CTA berbentuk pil dengan ikon panah melingkar (`->`) bergaya modern.
   - Menu drawer responsif untuk perangkat ponsel (HP).

2. **Hero Section dengan Ambient Glow**:
   - Kontainer rounded besar (`rounded-[2.5rem]`) dengan efek pencahayaan gradien radial hangat (*warm glow* seperti referensi).
   - Headline tegas: *"Relaksasi Sempurna Tubuh & Pikiran Anda"*.
   - 4 Poin keunggulan bernomor (*#01 Terapis Berlisensi, #02 Minyak Herbal Alami, #03 Ruang Privat Mewah, #04 Ramah Anak & Lansia*).

3. **Katalog Menu Perawatan (Services Grid)**:
   - 6 Pilihan layanan lengkap:
     1. *Traditional Body Massage*
     2. *Aromatherapy Relaxing*
     3. *Hot Stone Herbal Therapy*
     4. *Reflexology & Foot Spa*
     5. *Happy Family Harmony Suite (Keluarga)*
     6. *Mom & Kids Gentle Care (Ibu & Anak)*
   - Tombol **"Pilih Layanan"** interaktif yang otomatis memilih opsi perawatan di form pemesanan dan menggulirkan layar ke form.
   - Filter tab kategori (*Semua, Favorit, Paket Keluarga, Terapi Khusus*).

4. **Section Filosofi & Fasilitas**:
   - Layout asimetris modern dengan 3 kartu foto bersudut membulat (*rounded-3xl*).

5. **Formulir Booking Interaktif & Google Sheets Ready**:
   - Input: Nama Lengkap, Nomor WhatsApp, Pilihan Layanan, Jumlah Orang, Tanggal (dengan proteksi tanggal minimal hari ini), Jam Kedatangan (berbentuk pill slot waktu interaktif), dan Catatan Khusus.
   - Tombol konfirmasi dengan animasi status loading.
   - Tombol **"Kirim via WhatsApp"** instan dengan format pesan otomatis terisi lengkap.
   - Terhubung dengan Google Apps Script Web App untuk penyimpanan otomatis ke Google Spreadsheet.

6. **Social Proof & Lokasi**:
   - Rating ulasan pelanggan & testimoni nyata.
   - Kartu lokasi terintegrasi Google Maps dan jam operasional.
   - Tombol WhatsApp melayang (*floating button*) di pojok kanan bawah dengan indikator hijau aktif.

---

## 🚀 Cara Menjalankan

1. **Buka Langsung**: Cukup klik ganda berkas `index.html` untuk langsung melihat tampilan di browser (Google Chrome, Edge, Firefox, Safari).
2. **Via Local Server (VS Code Live Server)**:
   - Buka folder `aurelax-landing-page` di VS Code.
   - Klik kanan pada `index.html` dan pilih **Open with Live Server**.

---

## ⚙️ Kustomisasi Nomor WhatsApp & Google Sheets
Buka file `index.html`, gulir ke bagian `<script>` di baris ~570:
- Ubah nomor WhatsApp resmi:
  ```javascript
  const OFFICIAL_WHATSAPP_NUMBER = "6281234567890";
  ```
- Hubungkan URL Web App Google Sheets Anda (lihat panduan lengkap di `google-apps-script/PANDUAN_SETUP_GOOGLE_SHEETS.md`):
  ```javascript
  const GOOGLE_SCRIPT_WEBAPP_URL = "URL_HASIL_DEPLOY_APPS_SCRIPT_ANDA";
  ```
