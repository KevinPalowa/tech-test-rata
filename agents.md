# Mini Frontend Klinik App

Mini aplikasi frontend untuk sistem klinik yang dibangun menggunakan **React**, **Tailwind CSS**, **GraphQL**, dan **state management** pilihan. Aplikasi ini mensimulasikan fitur utama sistem klinik dari sisi frontend dengan fokus pada struktur data, UX, dan integrasi GraphQL.

---

## Tech Stack

- React
- Tailwind CSS
- GraphQL (Apollo Client)
- State Management (Zustand / Redux Toolkit / Context API)
- React Router

---

## Fitur Utama

### 1. Daftar Pasien
- Menampilkan list pasien
- Fitur pencarian pasien (search)
- Data diambil melalui GraphQL Query

---

### 2. Detail Pasien
- Menampilkan informasi lengkap pasien
- Menampilkan riwayat kunjungan pasien
- Data diambil berdasarkan ID pasien melalui GraphQL Query

---

### 3. Form Pasien (Create & Edit)
- Form untuk menambah dan mengubah data pasien
- Validasi dasar (required field, format sederhana)
- Submit data menggunakan GraphQL Mutation
- Mode Create dan Edit menggunakan komponen yang sama

---

### 4. Calendar View (Appointment)
- Menampilkan jadwal janji pasien
- Bentuk calendar bebas (daily / weekly / monthly)
- Data appointment diambil melalui GraphQL Query
- Menampilkan nama pasien dan waktu janji

---

### 5. Workflow Builder Sederhana
- Menyusun alur workflow klinik, contoh:
  - Registrasi → Pemeriksaan → Obat → Pembayaran
- Fitur:
  - Menambah langkah workflow
  - Menghapus langkah workflow
  - Mengubah urutan langkah (drag & drop optional)
- Data workflow disimpan menggunakan:
  - GraphQL Mutation **atau**
  - State persistence (local storage)

---

## Teknis & Arsitektur

- GraphQL digunakan untuk:
  - List pasien
  - Detail pasien
  - List appointment
  - Create & edit pasien
- State management digunakan untuk:
  - Search & filter pasien
  - Workflow state
  - Role / akses user
- UI:
  - Rapi
  - Konsisten
  - Responsive (mobile & desktop)

---

## Kompleksitas Tambahan (Dipilih)

### ✅ Debounced Search
- Search pasien menggunakan debounce (±300–500ms)
- Mengurangi jumlah request GraphQL
- Meningkatkan performa dan UX


● Pagination pada list pasien ● Debounced search ● Role-based UI sederhana (contoh: staff tidak boleh edit)
*(Alternatif kompleksitas lain yang tidak dipilih: Pagination atau Role-based UI)*

---

## Catatan Tambahan
- Backend tidak wajib diimplementasikan (boleh menggunakan mock GraphQL / dummy API)
- Fokus pada struktur frontend, state management, dan integrasi GraphQL
- Clean code dan reusable component menjadi nilai tambah

---

## Enhancement
- Role-based UI (admin vs staff)
- Pagination pada list pasien
- Form validation library (Formik / React Hook Form)
- GraphQL Code Generator
- Unit testing (Jest / React Testing Library)

---

## Author
Mini project frontend – Sistem Klinik
