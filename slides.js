/* ==========================================================
   Data Image Slider - IMT Trade & Investment Fair Riau Expo 2026

   Cara mengelola slide:
   - Urutan slide = urutan item pada array "slides" di bawah.
   - Tambah slide  : salin satu blok { ... } lalu ubah isinya.
   - Hapus slide   : hapus satu blok { ... }.
   - Ganti foto    : ubah nilai "src" (taruh file di folder assets/slider/).
   - Atur urutan   : pindahkan posisi blok.
   - Cara mudah    : buka admin-slider.html, atur di sana, lalu unduh
                     paket ZIP dan salin isinya ke folder proyek.

   Kolom tiap slide:
     src          (wajib)  path gambar: JPG, JPEG, PNG, atau WEBP
     alt          (opsional) teks alternatif gambar
     title        (opsional) judul
     description  (opsional) deskripsi singkat
     buttonText   (opsional) teks tombol
     buttonUrl    (opsional) link tombol (https://..., #bagian, atau path)
     position     (opsional) object-position gambar, mis. "50% 50%",
                  "center top", "20% 40%"
     fit          (opsional) "cover" (default, memenuhi slider, bisa terpotong)
                  atau "contain" (tampil utuh, cocok untuk poster/flyer;
                  klik gambar untuk memperbesar)
   ========================================================== */
window.IMT_SLIDER = {
  "interval": 4500,
  "slides": [
    {
      "src": "assets/slider/poster-01-riau-expo-blue.webp",
      "alt": "IMT Trade & Investment Fair 2026 – Riau Expo, 15–16 December 2026, Pekanbaru, Riau",
      "title": "",
      "description": "",
      "buttonText": "",
      "buttonUrl": "",
      "position": "50% 50%",
      "fit": "contain"
    },
    {
      "src": "assets/slider/poster-02-riau-expo-green.webp",
      "alt": "IMT Trade & Investment Fair 2026 – Riau Expo: Indonesia – Malaysia – Thailand",
      "title": "",
      "description": "",
      "buttonText": "",
      "buttonUrl": "",
      "position": "50% 50%",
      "fit": "contain"
    },
    {
      "src": "assets/slider/poster-03-opening-ceremony.webp",
      "alt": "Opening Ceremony, 15 December 2026, 08.00–11.15 WIB, Hotel Pangeran Pekanbaru",
      "title": "",
      "description": "",
      "buttonText": "",
      "buttonUrl": "",
      "position": "50% 50%",
      "fit": "contain"
    },
    {
      "src": "assets/slider/poster-04-trade-investment-forum.webp",
      "alt": "IMT Trade & Investment Forum, 15 December 2026, 13.00–15.10 WIB, Hotel Pangeran Pekanbaru",
      "title": "",
      "description": "",
      "buttonText": "",
      "buttonUrl": "",
      "position": "50% 50%",
      "fit": "contain"
    },
    {
      "src": "assets/slider/poster-05-health-tourism.webp",
      "alt": "IMT Health Tourism & Tourism Prospect, 15 December 2026, 15.30–18.00 WIB, Hotel Pangeran Pekanbaru",
      "title": "",
      "description": "",
      "buttonText": "",
      "buttonUrl": "",
      "position": "50% 50%",
      "fit": "contain"
    },
    {
      "src": "assets/slider/poster-06-business-matching.webp",
      "alt": "Business Matching, 16 December 2026, 10.00–15.15 WIB, Hotel Pangeran Pekanbaru",
      "title": "",
      "description": "",
      "buttonText": "",
      "buttonUrl": "",
      "position": "50% 50%",
      "fit": "contain"
    },
    {
      "src": "assets/slider/poster-07-tor-business-matching.webp",
      "alt": "Term of Reference (TOR) Business Matching, 15–16 December 2026, Hotel Pangeran Pekanbaru",
      "title": "",
      "description": "",
      "buttonText": "",
      "buttonUrl": "",
      "position": "50% 50%",
      "fit": "contain"
    },
    {
      "src": "assets/slider/poster-08-register-now.webp",
      "alt": "Register Now: https://bit.ly/RiauExpo2026",
      "title": "",
      "description": "",
      "buttonText": "",
      "buttonUrl": "",
      "position": "50% 50%",
      "fit": "contain"
    }
  ]
};
