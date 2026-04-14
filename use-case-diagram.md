# Use Case Diagram — Sistem Seleksi Zakat Produktif MOORA

## Identifikasi Aktor

| Aktor | Deskripsi |
|-------|-----------|
| **Pengunjung Publik** | Pengguna anonim. Mengakses Landing Page untuk melihat informasi statistik LAZISMU, daftar penerima bantuan dan muzakki per program, serta panduan fitur. |
| **Surveyor** | Petugas lapangan. Bertugas melakukan survei, mengelola data mustahik, program, monitoring, dan pengguna. |
| **Manajer** | Pengelola sistem. Memiliki akses manajerial penuh termasuk kelola kriteria MOORA, catat donasi, dan seluruh fitur Surveyor. |
| **Mustahik** | Calon/penerima bantuan. Mendaftar mandiri, pantau status, laporkan usaha. |
| **Muzakki** | Donatur/pemberi zakat. Mendaftar mandiri, pantau donasi dan program. |
| **Sistem** | Menjalankan perhitungan MOORA secara otomatis. |

---

## Diagram Use Case (PlantUML)

```plantuml
@startuml
left to right direction
skinparam actorStyle awesome
skinparam packageStyle rectangle
skinparam usecase {
  BackgroundColor #EAF7EF
  BorderColor #27AE60
  ArrowColor #2C3E50
}
skinparam actor {
  BackgroundColor #D5F5E3
  BorderColor #1E8449
}

actor "Pengunjung Publik" as Pengunjung
actor "Surveyor" as Surveyor
actor "Manajer" as Manajer
actor "Mustahik" as Mustahik
actor "Muzakki" as Muzakki
actor "Sistem" as Sistem

rectangle "Sistem Seleksi Zakat Produktif MOORA" {

  ' === INFORMASI PUBLIK ===
  package "Landing Page / Publik" {
    usecase "Lihat Informasi Publik" as UC_Landing
  }

  ' === AUTENTIKASI ===
  package "Autentikasi" {
    usecase "Login" as UC_Login
    usecase "Register Akun" as UC_Register
  }

  ' === DASHBOARD ===
  package "Dashboard & Statistik" {
    usecase "Lihat Dashboard" as UC_Dashboard
  }

  ' === MUSTAHIK ===
  package "Pengelolaan Data Mustahik" {
    usecase "Kelola Data Mustahik" as UC_Mustahik
    usecase "Input Survei & Penilaian Kriteria" as UC_Survei
    usecase "Lihat Detail Mustahik" as UC_ViewMustahik
    usecase "Filter & Cari Mustahik" as UC_FilterMustahik
  }

  ' === MUZAKKI ===
  package "Pengelolaan Muzakki & Donasi" {
    usecase "Kelola Data Muzakki" as UC_MuzakkiMgmt
    usecase "Catat Donasi" as UC_Donasi
    usecase "Lihat Riwayat Donasi" as UC_RiwayatDonasi
  }

  ' === PROGRAM ===
  package "Pengelolaan Program Bantuan" {
    usecase "Kelola Program Bantuan" as UC_Program
    usecase "Kelola Calon & Penerima Program" as UC_ProgramCandidates
  }

  ' === MOORA ===
  package "Perhitungan MOORA" {
    usecase "Hitung Perangkingan MOORA" as UC_MOORA
    usecase "Lihat Hasil Perangkingan" as UC_HasilMOORA
    usecase "Lihat Detail Perhitungan" as UC_DetailMOORA
    usecase "Kelola Kriteria & Bobot" as UC_Kriteria
  }

  ' === MONITORING ===
  package "Monitoring Mustahik" {
    usecase "Input Data Monitoring" as UC_InputMonitoring
    usecase "Lihat Riwayat Monitoring" as UC_RiwayatMonitoring
    usecase "Lihat Detail Monitoring" as UC_DetailMonitoring
  }

  ' === USER MANAGEMENT ===
  package "Manajemen Pengguna" {
    usecase "Kelola Pengguna" as UC_User
  }

  ' === TRACKING ===
  package "Riwayat Penerimaan Bantuan" {
    usecase "Lihat Riwayat Penerimaan" as UC_Tracking
  }
}

' --- PENGUNJUNG PUBLIK ---
Pengunjung --> UC_Landing
Pengunjung --> UC_Login
Pengunjung --> UC_Register

' --- SURVEYOR (AKSES OPERASIONAL LAPANGAN) ---
Surveyor --> UC_Dashboard
Surveyor --> UC_Mustahik
Surveyor --> UC_Survei
Surveyor --> UC_ViewMustahik
Surveyor --> UC_FilterMustahik
Surveyor --> UC_RiwayatDonasi
Surveyor --> UC_Program
Surveyor --> UC_ProgramCandidates
Surveyor --> UC_InputMonitoring
Surveyor --> UC_RiwayatMonitoring
Surveyor --> UC_DetailMonitoring
Surveyor --> UC_Tracking

' --- MANAJER (FULL ACCESS) ---
Manajer --> UC_Dashboard
Manajer --> UC_Mustahik
Manajer --> UC_Survei
Manajer --> UC_ViewMustahik
Manajer --> UC_FilterMustahik
Manajer --> UC_MuzakkiMgmt
Manajer --> UC_Donasi
Manajer --> UC_RiwayatDonasi
Manajer --> UC_Program
Manajer --> UC_ProgramCandidates
Manajer --> UC_HasilMOORA
Manajer --> UC_DetailMOORA
Manajer --> UC_Kriteria
Manajer --> UC_InputMonitoring
Manajer --> UC_RiwayatMonitoring
Manajer --> UC_DetailMonitoring
Manajer --> UC_User
Manajer --> UC_Tracking

' --- MUSTAHIK ---
Mustahik --> UC_Dashboard
Mustahik --> UC_Mustahik
Mustahik --> UC_ViewMustahik
Mustahik --> UC_FilterMustahik
Mustahik --> UC_InputMonitoring
Mustahik --> UC_RiwayatMonitoring
Mustahik --> UC_Tracking
UC_Register ..> Mustahik : <<role: mustahik>>

' --- MUZAKKI ---
Muzakki --> UC_Dashboard
Muzakki --> UC_MuzakkiMgmt
Muzakki --> UC_Donasi
Muzakki --> UC_RiwayatDonasi
UC_Register ..> Muzakki : <<role: muzakki>>

' === <<include>> — use case yang SELALU dipanggil oleh use case lain ===
UC_ProgramCandidates ..> UC_HasilMOORA : <<include>>
' Kelola Calon & Penerima HARUS melihat hasil MOORA terlebih dahulu

UC_Survei ..> UC_MOORA : <<include>>
' Setiap input penilaian kriteria SELALU memicu kalkulasi MOORA

UC_MOORA ..> UC_HasilMOORA : <<include>>
' Kalkulasi MOORA SELALU menghasilkan tampilan hasil perangkingan

' === <<extend>> — use case opsional yang memperluas use case dasar ===
UC_ViewMustahik ..> UC_Mustahik : <<extend>>
' Lihat Detail Mustahik adalah opsi saat mengelola data mustahik

UC_FilterMustahik ..> UC_Mustahik : <<extend>>
' Filter & Cari adalah opsi tambahan saat mengelola data mustahik

UC_DetailMOORA ..> UC_HasilMOORA : <<extend>>
' Lihat Detail Perhitungan adalah opsi dari halaman hasil perangkingan

UC_DetailMonitoring ..> UC_RiwayatMonitoring : <<extend>>
' Lihat Detail Monitoring adalah opsi saat membuka riwayat monitoring

@enduml
```

---

## Deskripsi Use Case

### 🌍 Landing Page / Informasi Publik

| ID | Use Case | Aktor | Deskripsi |
|----|----------|-------|-----------|
| UC-00 | Lihat Informasi Publik | Pengunjung Publik, Mustahik, Muzakki | Melihat statistik penyaluran dana LAZISMU, daftar program unggulan, simulasi donasi, beserta profil penerima bantuan (Mustahik) & donatur (Muzakki) setiap program |

---

### 🔐 Autentikasi

| ID | Use Case | Aktor | Deskripsi |
|----|----------|-------|-----------|
| UC-01 | Login | Semua | Masuk ke sistem menggunakan username dan password |
| UC-02 | Register Akun | Mustahik, Muzakki | Mendaftarkan akun baru dengan memilih role (Mustahik / Muzakki), mengisi NIK, nama, email, alamat, dan password |

---

### 📊 Dashboard & Statistik

| ID | Use Case | Aktor | Deskripsi |
|----|----------|-------|-----------|
| UC-03 | Lihat Dashboard | Semua | Tampilan dashboard disesuaikan per role: Surveyor/Manajer melihat statistik progres survei & MOORA; Mustahik melihat status penerimaan & monitoring; Muzakki melihat riwayat donasi |

---

### 👥 Pengelolaan Data Mustahik

| ID | Use Case | Aktor | Deskripsi |
|----|----------|-------|-----------|
| UC-04 | Kelola Data Mustahik | Surveyor, Manajer, Mustahik | Tambah, edit, dan hapus data calon penerima zakat (profil, NIK, alamat, telepon) |
| UC-05 | Input Survei & Penilaian Kriteria | Surveyor, Manajer | Mengisi nilai sub-kriteria (aspek penilaian) untuk masing-masing mustahik sesuai kriteria MOORA |
| UC-06 | Lihat Detail Mustahik | Surveyor, Manajer, Mustahik | Melihat profil lengkap, hasil penilaian kriteria, persentase skor, dan tren profit |
| UC-07 | Filter & Cari Mustahik | Surveyor, Manajer, Mustahik | Menyaring data mustahik berdasarkan nama/alamat, program, dan status survei |

---

### 💰 Pengelolaan Muzakki & Donasi

| ID | Use Case | Aktor | Deskripsi |
|----|----------|-------|-----------|
| UC-08 | Kelola Data Muzakki | Manajer, Muzakki | Tambah, edit, dan hapus data donatur (NIK, nama, email, telepon, pekerjaan, instansi) |
| UC-09 | Catat Donasi | Manajer, Muzakki | Muzakki dapat mencatat donasinya sendiri; Manajer dapat menginput donasi mewakili muzakki (pencatatan langsung oleh admin) |
| UC-10 | Lihat Riwayat Donasi | Surveyor, Manajer, Muzakki | Melihat histori donasi: program tujuan, nominal, tanggal, dan metode pembayaran |

---

### 🎁 Pengelolaan Program Bantuan

| ID | Use Case | Aktor | Deskripsi |
|----|----------|-------|-----------|
| UC-11 | Kelola Program Bantuan | Surveyor, Manajer | Buat, edit, dan hapus program bantuan zakat (nama, deskripsi, anggaran, kuota, periode, status) |
| UC-12 | Kelola Calon & Penerima Program | Surveyor, Manajer | Memilih calon penerima dari hasil perangkingan MOORA dan mengelola daftar penerima aktif |

---

### 🧮 Perhitungan MOORA

| ID | Use Case | Aktor | Deskripsi |
|----|----------|-------|-----------|
| UC-13 | Hitung Perangkingan MOORA | Sistem | Menghitung skor MOORA secara otomatis (normalisasi vektor + pembobotan) setiap data berubah |
| UC-14 | Lihat Hasil Perangkingan | Manajer | Melihat daftar mustahik yang diurutkan berdasarkan skor MOORA tertinggi ke terendah |
| UC-15 | Lihat Detail Perhitungan | Manajer | Melihat tahapan kalkulasi: nilai kriteria asli → normalisasi → pembobotan → skor Y_i |
| UC-16 | Kelola Kriteria & Bobot | Manajer | Tambah, edit, dan hapus kriteria, aspek penilaian, bobot (%), tipe (benefit/cost), dan opsi jawaban |

---

### 📈 Monitoring Mustahik

| ID | Use Case | Aktor | Deskripsi |
|----|----------|-------|-----------|
| UC-17 | Input Data Monitoring | Surveyor, Manajer, Mustahik | Mencatat laporan perkembangan usaha: omzet, profit, status usaha, pendapatan/pengeluaran RT |
| UC-18 | Lihat Riwayat Monitoring | Surveyor, Manajer, Mustahik | Melihat daftar riwayat semua laporan monitoring (tanggal, program, status, omzet) |
| UC-19 | Lihat Detail Monitoring | Surveyor, Manajer, Mustahik | Melihat detail laporan: metrik usaha, kondisi sosial ekonomi, grafik tren profit, catatan surveyor |

---

### 👤 Manajemen Pengguna

| ID | Use Case | Aktor | Deskripsi |
|----|----------|-------|-----------|
| UC-20 | Kelola Pengguna | Manajer | Tambah, edit, hapus, dan aktifkan/nonaktifkan akun pengguna sistem (username, password, nama, email, role) |

---

### 📋 Riwayat Penerimaan Bantuan

| ID | Use Case | Aktor | Deskripsi |
|----|----------|-------|-----------|
| UC-21 | Lihat Riwayat Penerimaan | Surveyor, Manajer, Mustahik | Melihat histori penerimaan bantuan: nama program, jumlah bantuan, tanggal penerimaan |

---

## Rekapitulasi Hak Akses

| # | Use Case | Pengunjung | Surveyor | Manajer | Mustahik | Muzakki |
|---|----------|:----------:|:--------:|:-------:|:--------:|:-------:|
| UC-00 | Lihat Informasi Publik | ✅ | — | — | ✅ | ✅ |
| UC-01 | Login | ✅ | ✅ | ✅ | ✅ | ✅ |
| UC-02 | Register Akun | ✅ | — | — | ✅ | ✅ |
| UC-03 | Lihat Dashboard | — | ✅ | ✅ | ✅ | ✅ |
| UC-04 | Kelola Data Mustahik | — | ✅ | ✅ | ✅ | — |
| UC-05 | Input Penilaian Kriteria| — | ✅ | ✅ | — | — |
| UC-06 | Lihat Detail Mustahik | — | ✅ | ✅ | ✅ | — |
| UC-07 | Filter & Cari Mustahik | — | ✅ | ✅ | ✅ | — |
| UC-08 | Kelola Data Muzakki | — | — | ✅ | — | ✅ |
| UC-09 | Catat Donasi | — | — | ✅ | — | ✅ |
| UC-10 | Lihat Riwayat Donasi | — | ✅ | ✅ | — | ✅ |
| UC-11 | Kelola Program Bantuan | — | ✅ | ✅ | — | — |
| UC-12 | Kelola Penerima Program | — | ✅ | ✅ | — | — |
| UC-13 | Hitung MOORA (otomatis) | — | — | — | — | — |
| UC-14 | Lihat Hasil Perangkingan| — | — | ✅ | — | — |
| UC-15 | Lihat Detail Perhitungan| — | — | ✅ | — | — |
| UC-16 | Kelola Kriteria & Bobot | — | — | ✅ | — | — |
| UC-17 | Input Data Monitoring | — | ✅ | ✅ | ✅ | — |
| UC-18 | Lihat Riwayat Monitoring| — | ✅ | ✅ | ✅ | — |
| UC-19 | Lihat Detail Monitoring | — | ✅ | ✅ | ✅ | — |
| UC-20 | Kelola Pengguna | — | — | ✅ | — | — |
| UC-21 | Lihat Riwayat Terima | — | ✅ | ✅ | ✅ | — |

> ✅ = Memiliki akses &nbsp;&nbsp; — = Tidak memiliki akses

---

## Catatan Desain

- **Surveyor ≠ Admin**: Surveyor adalah petugas lapangan dengan akses operasional (survei, data mustahik, program, monitoring, pengguna). Surveyor **bukan** admin sistem dan tidak memiliki hak manajerial.
- **Manajer = akses penuh**: Manajer memiliki semua akses Surveyor ditambah akses eksklusif: **Kelola Kriteria & Bobot (UC-16)** dan **Catat Donasi (UC-09)**.
- **Admin tidak dimasukkan dalam use case diagram**: Sesuai ruang lingkup sistem, role admin tidak dimodelkan sebagai aktor use case.
- **Register dibedakan per role**: Dari halaman Register, pengguna memilih peran sebagai **Mustahik** atau **Muzakki** sebelum mengisi data.
- **Dashboard adaptif (1 use case)**: Konten dashboard menyesuaikan role yang sedang login (statistik survei untuk Surveyor/Manajer, status bantuan untuk Mustahik, riwayat donasi untuk Muzakki).
- **Kelola = CRUD dikonsolidasi**: Aksi Create/Read/Update/Delete pada objek yang sama disatukan menjadi satu use case "Kelola [Objek]", termasuk Kelola Pengguna yang mencakup aktivasi/nonaktivasi.
- **MOORA otomatis**: Perhitungan MOORA bersifat reaktif — tidak ada tombol "hitung ulang" oleh pengguna, sistem menghitung sendiri via `useMemo` setiap data berubah.
