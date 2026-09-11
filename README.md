# Shiratha Spin Wheel

Website spin wheel frontend-only (Vue + Vite) dengan stok terbatas. Tanpa backend server — opsional pakai **Firebase Firestore + Hosting** (gratis / Spark).

## Fitur
- Roda spin dari hadiah yang `aktif` dan `stok > 0`
- Stok berkurang otomatis saat menang
- Siapa saja bisa edit nama, stok (+/−), warna, aktif, hapus/tambah di halaman
- Tanpa config Firebase: **mode lokal** (data di `localStorage`) supaya bisa dicoba dulu

## Jalankan di local

```bash
cd spin-wheel-shiratha
npm install
npm run dev
```

Buka URL yang muncul (biasanya http://localhost:5173).

## Login (statis)

Default:
- Username: `shiratha`
- Password: `spinwheel2026`

Ubah di `.env`:

```env
VITE_LOGIN_USER=username_kamu
VITE_LOGIN_PASS=password_rahasia
```

Session tersimpan di browser (tetap login saat reload). Klik **Keluar** untuk logout.

> Catatan: login frontend-statis menahan orang awam, bukan keamanan tingkat server. Jangan bagikan URL + password ke sembarang orang.

## Hubungkan Firebase (opsional)

1. Buat project di [Firebase Console](https://console.firebase.google.com/) (paket Spark/gratis)
2. Tambah **Web app**, salin config
3. Buat **Firestore** database (mode production, lalu deploy rules di bawah)
4. Salin `.env.example` → `.env` dan isi:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

5. Deploy rules:

```bash
npm install -g firebase-tools
firebase login
firebase use <project-id>
firebase deploy --only firestore:rules
```

6. Restart `npm run dev` — badge jadi **Terhubung Firebase**

## Deploy Hosting

```bash
npm run build
firebase deploy --only hosting
```

## Catatan keamanan
Rules Firestore di repo ini **publik read/write** karena pilihan “siapa saja bisa edit”. Cocok untuk event internal/booth. Untuk produksi terbuka, aktifkan Auth dan ketatkan rules.
