# SEQUENCE DIAGRAM
## Dashboard Monitoring Penerima Zakat Produktif Berbasis SPK MOORA

---

## UC-01: Mendaftar Akun

```mermaid
sequenceDiagram
    actor Mustahik
    participant Sistem as Sistem (Frontend)
    participant Backend as Backend (API)
    participant DB as Database

    Mustahik->>Sistem: Klik tombol "Daftar" di halaman login
    Sistem-->>Mustahik: Tampilkan form registrasi

    Mustahik->>Sistem: Isi form (nama, email, password, alamat, telepon)
    Mustahik->>Sistem: Klik tombol "Daftar"

    Sistem->>Sistem: Validasi field wajib (nama, email, password)

    alt Field wajib tidak lengkap
        Sistem-->>Mustahik: Tampilkan pesan validasi
    else Field lengkap
        Sistem->>Backend: POST /api/register {name, email, password, address, phone}
        Backend->>DB: Cek duplikasi email

        alt Email sudah terdaftar
            DB-->>Backend: Email ditemukan
            Backend-->>Sistem: 400 - "Email sudah terdaftar"
            Sistem-->>Mustahik: Tampilkan pesan error
        else Email belum terdaftar
            DB-->>Backend: Email belum ada
            Backend->>DB: BEGIN TRANSACTION
            Backend->>DB: INSERT User {name, email, password_hash, role: mustahik}
            Backend->>DB: INSERT Mustahik {id: auto-NIK, name, address, phone, userId}
            Backend->>DB: COMMIT TRANSACTION
            DB-->>Backend: Data tersimpan
            Backend->>Backend: Generate JWT Token (24 jam)
            Backend-->>Sistem: 200 - {token, user}
            Sistem->>Sistem: Simpan token & user ke localStorage
            Sistem-->>Mustahik: Arahkan ke halaman Dashboard
        end
    end
```

---

## UC-02: Login

```mermaid
sequenceDiagram
    actor Aktor as Aktor (Manajer/Surveyor/Mustahik)
    participant Sistem as Sistem (Frontend)
    participant Backend as Backend (API)
    participant DB as Database

    Aktor->>Sistem: Buka halaman login
    Sistem-->>Aktor: Tampilkan form login

    Aktor->>Sistem: Masukkan email/username dan password
    Aktor->>Sistem: Klik tombol "Login"

    Sistem->>Backend: POST /api/login {email, password}
    Backend->>DB: SELECT user WHERE email = ? OR username = ?

    alt User tidak ditemukan
        DB-->>Backend: User null
        Backend-->>Sistem: 401 - "User not found"
        Sistem-->>Aktor: Tampilkan pesan "Email atau username tidak ditemukan"
    else User ditemukan
        DB-->>Backend: Data user
        Backend->>Backend: bcrypt.compare(password, password_hash)

        alt Password salah
            Backend-->>Sistem: 401 - "Invalid password"
            Sistem-->>Aktor: Tampilkan pesan "Password salah"
        else Password benar
            Backend->>Backend: Cek isActive = true

            alt Akun nonaktif
                Backend-->>Sistem: 403 - "Account is inactive"
                Sistem-->>Aktor: Tampilkan pesan "Akun tidak aktif"
            else Akun aktif
                Backend->>Backend: Generate JWT Token {id, username, role} (24 jam)
                Backend-->>Sistem: 200 - {token, user}
                Sistem->>Sistem: Simpan token & user ke localStorage
                Sistem-->>Aktor: Arahkan ke Dashboard sesuai role
            end
        end
    end
```

---

## UC-03: Mengelola Program Bantuan

```mermaid
sequenceDiagram
    actor Manajer
    participant Sistem as Sistem (Frontend)
    participant Backend as Backend (API)
    participant DB as Database

    Manajer->>Sistem: Pilih menu "Program"
    Sistem->>Backend: GET /api/programs
    Backend->>DB: SELECT * FROM Program ORDER BY createdAt DESC
    DB-->>Backend: Daftar program
    Backend-->>Sistem: 200 - [{id, name, status, budget, quota, ...}]
    Sistem-->>Manajer: Tampilkan daftar program bantuan

    alt Menambah Program
        Manajer->>Sistem: Klik "Tambah Program"
        Sistem-->>Manajer: Tampilkan form tambah program
        Manajer->>Sistem: Isi form (nama, deskripsi, anggaran, kuota, tanggal, status)
        Manajer->>Sistem: Klik "Simpan"
        Sistem->>Backend: POST /api/programs {name, description, totalBudget, quota, ...}
        Backend->>DB: INSERT INTO Program
        DB-->>Backend: Program baru
        Backend-->>Sistem: 200 - data program baru
        Sistem-->>Manajer: Tampilkan program baru di daftar

    else Mengubah Program
        Manajer->>Sistem: Klik "Edit" pada program
        Sistem-->>Manajer: Tampilkan form edit dengan data terkini
        Manajer->>Sistem: Ubah data dan klik "Simpan"
        Sistem->>Backend: PUT /api/programs/:id {data yang diubah}
        Backend->>DB: UPDATE Program WHERE id = ?
        DB-->>Backend: Program terupdate
        Backend-->>Sistem: 200 - data program terupdate
        Sistem-->>Manajer: Tampilkan perubahan di daftar

    else Menghapus Program
        Manajer->>Sistem: Klik "Hapus" pada program
        Sistem-->>Manajer: Tampilkan konfirmasi penghapusan
        Manajer->>Sistem: Konfirmasi "Ya, Hapus"
        Sistem->>Backend: DELETE /api/programs/:id
        Backend->>DB: DELETE FROM Program WHERE id = ?
        DB-->>Backend: OK
        Backend-->>Sistem: 204 No Content
        Sistem-->>Manajer: Program dihapus dari daftar
    end
```

---

## UC-04: Mengelola Data Mustahik

>>Aktor: Tampilkan form input mustahik
        Aktor->>Sistem: Isi identitas (NIK, nama, alamat, telepon, status usaha) + skor sub-kriteria
        Aktor->>Sistem: Klik "Simpan"
        Sistem->>Backend: POST /api/mustahik {name, address, phone, subCriteria, businessStatus}
        Backend->>DB: Cari SubCriterion yang cocok per aspek
        Backend->>DB: INSERT Mustahik + MustahikScore (per sub-kriteria)
        DB-->>B```mermaid
sequenceDiagram
    actor Aktor as Aktor (Manajer/Surveyor/Mustahik)
    participant Sistem as Sistem (Frontend)
    participant Backend as Backend (API)
    participant DB as Database

    Aktor->>Sistem: Pilih menu "Mustahik"
    Sistem->>Backend: GET /api/mustahik
    Note over Backend: Jika role=mustahik: WHERE userId = req.user.id
    Backend->>DB: SELECT Mustahik + criteriaScores + subCriterion
    DB-->>Backend: Daftar mustahik beserta skor
    Backend-->>Sistem: 200 - [data mustahik + subCriteria]
    Sistem-->>Aktor: Tampilkan daftar mustahik

    alt Menambah Mustahik (Manajer/Surveyor)
        Aktor->>Sistem: Klik "Tambah Mustahik"
        Sistem--ackend: Data tersimpan
        Backend-->>Sistem: 200 - data mustahik baru + subCriteria
        Sistem-->>Aktor: Mustahik baru tampil di daftar

    else Mengubah Mustahik (Manajer/Surveyor)
        Aktor->>Sistem: Klik "Edit" pada mustahik
        Sistem-->>Aktor: Tampilkan form edit dengan data terkini
        Aktor->>Sistem: Ubah data identitas dan/atau skor sub-kriteria
        Aktor->>Sistem: Klik "Simpan"
        Sistem->>Backend: PUT /api/mustahik/:id {data baru}
        Backend->>DB: DELETE MustahikScore WHERE mustahikId = ?
        Backend->>DB: INSERT MustahikScore baru
        Backend->>DB: UPDATE Mustahik WHERE id = ?
        DB-->>Backend: Data terupdate
        Backend-->>Sistem: 200 - data mustahik terupdate
        Sistem-->>Aktor: Tampilkan perubahan

    else Menghapus Mustahik (Manajer)
        Aktor->>Sistem: Klik "Hapus" + konfirmasi
        Sistem->>Backend: DELETE /api/mustahik/:id
        Backend->>DB: DELETE MustahikScore (cascade)
        Backend->>DB: DELETE Mustahik WHERE id = ?
        DB-->>Backend: OK
        Backend-->>Sistem: 204 No Content
        Sistem-->>Aktor: Mustahik dihapus dari daftar

    else Melihat Detail Mustahik
        Aktor->>Sistem: Klik baris mustahik
        Sistem-->>Aktor: Tampilkan detail (skor kriteria + progress bar, metrik usaha, tren profit)
    end
```

---

## UC-05: Mengelola Data Pengguna

```mermaid
sequenceDiagram
    actor Manajer
    participant Sistem as Sistem (Frontend)
    participant Backend as Backend (API)
    participant DB as Database

    Manajer->>Sistem: Pilih menu "Pengguna"
    Sistem->>Backend: GET /api/users
    Backend->>DB: SELECT * FROM User
    DB-->>Backend: Daftar pengguna
    Backend-->>Sistem: 200 - [daftar user]
    Sistem-->>Manajer: Tampilkan daftar pengguna (nama, email, role, status)

    alt Menambah Pengguna
        Manajer->>Sistem: Klik "Tambah Pengguna"
        Sistem-->>Manajer: Tampilkan form tambah pengguna
        Manajer->>Sistem: Isi form (nama, email, password, role)
        Manajer->>Sistem: Klik "Simpan"
        Sistem->>Backend: POST /api/users {name, email, password, role}
        Backend->>DB: Cek duplikasi email
        alt Email sudah ada
            DB-->>Backend: Email ditemukan
            Backend-->>Sistem: 400 - "Email sudah digunakan"
            Sistem-->>Manajer: Tampilkan pesan error
        else Email belum ada
            Backend->>DB: INSERT User {name, email, password_hash, role}
            DB-->>Backend: User baru
            Backend-->>Sistem: 200 - data user baru
            Sistem-->>Manajer: Pengguna baru tampil di daftar
        end

    else Mengubah Pengguna
        Manajer->>Sistem: Klik "Edit" pada pengguna
        Sistem-->>Manajer: Tampilkan form edit
        Manajer->>Sistem: Ubah data (nama, role, status aktif) dan klik "Simpan"
        Sistem->>Backend: PUT /api/users/:id {data baru}
        Backend->>DB: UPDATE User WHERE id = ?
        DB-->>Backend: Data terupdate
        Backend-->>Sistem: 200 - data user terupdate
        Sistem-->>Manajer: Tampilkan perubahan di daftar

    else Menghapus Pengguna
        Manajer->>Sistem: Klik "Hapus" pada pengguna
        Sistem-->>Manajer: Tampilkan konfirmasi penghapusan
        Manajer->>Sistem: Konfirmasi "Ya, Hapus"
        Sistem->>Backend: DELETE /api/users/:id
        Backend->>DB: DELETE User WHERE id = ?
        DB-->>Backend: OK
        Backend-->>Sistem: 204 No Content
        Sistem-->>Manajer: Pengguna dihapus dari daftar
    end
```

---

## UC-06: Menetapkan Penerima Bantuan

```mermaid
sequenceDiagram
    actor Manajer
    participant Sistem as Sistem (Frontend)
    participant Backend as Backend (API)
    participant DB as Database

    Manajer->>Sistem: Buka program bantuan → Tab "Pilih Calon"
    Sistem-->>Manajer: Tampilkan daftar mustahik + skor MOORA

    Note over Sistem: Hitung MOORA otomatis (UC-07 include)

    Manajer->>Sistem: Filter/cari kandidat berdasarkan skor MOORA
    Manajer->>Sistem: Centang mustahik sebagai kandidat
    Manajer->>Sistem: Klik "Simpan Pilihan"
    Sistem->>Backend: PUT /api/programs/:id {selectedCandidates: [...ids]}
    Backend->>DB: UPDATE Program SET selectedCandidates WHERE id = ?
    DB-->>Backend: Program diperbarui
    Backend-->>Sistem: 200 - program terupdate
    Sistem-->>Manajer: Konfirmasi pilihan tersimpan

    Manajer->>Sistem: Buka Tab "Hasil MOORA"
    Note over Sistem: UC-07 <<include>> Hitung Skor Penilaian MOORA
    Sistem->>Sistem: calculateMOORA(kandidat, criteriaList)
    Sistem-->>Manajer: Tampilkan perangkingan MOORA + detail kalkulasi (Step 1-6)

    alt Belum ada kandidat dipilih
        Sistem-->>Manajer: Pesan "Pilih calon terlebih dahulu"
    else Kandidat tersedia
        Manajer->>Sistem: Klik "Tetapkan [N] Penerima"

        alt Program sudah completed
            Sistem-->>Manajer: Tombol nonaktif "Sudah Ditetapkan"
        else Program belum completed
            loop Untuk setiap penerima (TOP N sesuai kuota)
                Sistem->>Backend: POST /api/history {mustahikId, programId, amount, mooraScore, rank, receivedDate}
                Backend->>DB: INSERT RecipientHistory
                DB-->>Backend: Riwayat tersimpan
                Backend-->>Sistem: 200 - data riwayat
            end
            Sistem->>Backend: PUT /api/programs/:id {status: "completed"}
            Backend->>DB: UPDATE Program SET status = "completed"
            DB-->>Backend: OK
            Backend-->>Sistem: 200 - program updated
            Sistem-->>Manajer: Tampilkan konfirmasi "[N] penerima berhasil ditetapkan"
        end
    end
```

---

## UC-07: Menghitung Skor Penilaian (MOORA)

```mermaid
sequenceDiagram
    participant UC06 as UC-06 (Menetapkan Penerima)
    participant MOORA as Modul MOORA (Frontend)
    participant Kriteria as Data Kriteria

    UC06->>MOORA: calculateMOORA(candidates[], criteriaList[])
    MOORA->>Kriteria: Ambil bobot & jenis tiap kriteria (benefit/cost)
    Kriteria-->>MOORA: [{code, weight, type, aspects[]}]

    Note over MOORA: STEP 1 — Bentuk Matriks Keputusan
    MOORA->>MOORA: Petakan nilai subCriteria[aspect] per kandidat → matrix[i][j]

    Note over MOORA: STEP 2 — Normalisasi Vektor per Sub-Kriteria
    loop Untuk setiap kolom sub-kriteria j
        MOORA->>MOORA: Hitung akar jumlah kuadrat: √(Σ xij²)
        MOORA->>MOORA: xij* = xij / √(Σ xij²)
    end

    Note over MOORA: STEP 3 — Rata-rata Normalisasi per Kriteria Utama
    loop Untuk setiap kriteria utama Ck
        MOORA->>MOORA: avgNorm[Ck] = rata-rata(xij* semua sub-kriteria milik Ck)
    end

    Note over MOORA: STEP 4 — Matriks Ternormalisasi Terbobot
    loop Untuk setiap kriteria Ck
        MOORA->>MOORA: weighted[Ck] = avgNorm[Ck] × weight[Ck]
    end

    Note over MOORA: STEP 5 — Nilai Optimasi Yi
    loop Untuk setiap kandidat i
        MOORA->>MOORA: Yi = Σ weighted[Ck benefit] − Σ weighted[Ck cost]
        MOORA->>MOORA: mooraScore[i] = Yi
    end

    Note over MOORA: STEP 6 — Perangkingan
    MOORA->>MOORA: Urutkan kandidat dari mooraScore tertinggi ke terendah
    MOORA->>MOORA: Tetapkan rank (1 = skor tertinggi)

    MOORA-->>UC06: Return CandidateWithScore[] {id, name, mooraScore, rank, normalizedSubCriteria, avgNormalizedCriteria, weightedNormalized}
```

---

## UC-08: Mengelola Kriteria Penilaian

```mermaid
sequenceDiagram
    actor Manajer
    participant Sistem as Sistem (Frontend)
    participant Backend as Backend (API)
    participant DB as Database

    Manajer->>Sistem: Pilih menu "Kriteria"
    Sistem->>Backend: GET /api/criteria
    Backend->>DB: SELECT Criterion + SubCriterion ORDER BY code ASC
    DB-->>Backend: Daftar kriteria + sub-kriteria
    Backend-->>Sistem: 200 - [kriteria yang diformat]
    Sistem-->>Manajer: Tampilkan kartu per kriteria (kode, nama, bobot, jenis, sub-kriteria)

    alt Hanya Melihat (Manajer/Mustahik)
        Note over Manajer,Sistem: Menampilkan progress bar bobot + badge warna per kriteria
    
    else Mengubah Kriteria (Manajer)
        Manajer->>Sistem: Klik "Kelola Kriteria"
        Sistem-->>Manajer: Tampilkan form CriteriaManager (semua kriteria dapat diedit)
        
        loop Untuk setiap kriteria
            Manajer->>Sistem: Ubah nama / bobot / jenis (benefit|cost) / deskripsi / ikon / warna
        end

        Manajer->>Sistem: Klik "Simpan Perubahan"
        Sistem->>Sistem: Validasi total bobot

        alt Validasi gagal
            Sistem-->>Manajer: Tampilkan pesan validasi bobot
        else Validasi berhasil
            Sistem->>Backend: PUT /api/criteria [{code, name, weight, type, description, icon, color}]
            Backend->>DB: BEGIN TRANSACTION
            loop Untuk setiap kriteria dalam array
                Backend->>DB: UPDATE Criterion SET name, weight, type, ... WHERE code = ?
            end
            Backend->>DB: COMMIT TRANSACTION
            DB-->>Backend: Semua kriteria terupdate
            Backend-->>Sistem: 200 - {success: true, count: N}
            Sistem-->>Manajer: Tampilkan konfirmasi "Kriteria berhasil diperbarui"
        end
    end
```

---

## UC-09: Mengelola Data Monitoring

```mermaid
sequenceDiagram
    actor Aktor as Aktor (Manajer/Surveyor/Mustahik)
    participant Sistem as Sistem (Frontend)
    participant Backend as Backend (API)
    participant DB as Database

    Aktor->>Sistem: Pilih menu "Monitoring"
    Sistem->>Backend: GET /api/monitoring
    Note over Backend: Jika role=mustahik: WHERE mustahikId = mustahik milik user
    Backend->>DB: SELECT MonitoringData + mustahik.name + program.name
    DB-->>Backend: Daftar data monitoring
    Backend-->>Sistem: 200 - [data monitoring]
    Sistem-->>Aktor: Tampilkan daftar monitoring (filter program + cari nama)

    alt Melihat Detail Monitoring
        Aktor->>Sistem: Klik salah satu data monitoring
        Sistem-->>Aktor: Tampilkan detail (metrik usaha, tren profit bulanan, kondisi sosial-ekonomi, catatan lapangan)

    else Mencatat Data Monitoring (Manajer/Surveyor)
        Aktor->>Sistem: Klik "Tambah Data Monitoring"
        Sistem-->>Aktor: Tampilkan form MonitoringForm

        Aktor->>Sistem: Isi form Perkembangan Usaha\n(jenis usaha, status, omzet, keuntungan, jml karyawan)
        Aktor->>Sistem: Isi form Kondisi Sosial-Ekonomi\n(pendapatan, pengeluaran, tanggungan, kondisi rumah)
        Aktor->>Sistem: Isi Catatan Lapangan\n(tantangan, pencapaian, rencana, nama surveyor)
        Aktor->>Sistem: Klik "Simpan"

        Sistem->>Sistem: Validasi field wajib

        alt Field tidak lengkap
            Sistem-->>Aktor: Tampilkan pesan validasi
        else Field lengkap
            Sistem->>Backend: POST /api/monitoring {mustahikId, programId, monitoringDate, businessProgress, socialEconomicCondition, ...}
            Backend->>DB: INSERT MonitoringData
            DB-->>Backend: Data tersimpan
            Backend-->>Sistem: 200 - data monitoring baru
            Sistem-->>Aktor: Data monitoring tampil di daftar
        end
    end
```

---

## UC-10: Melihat Dashboard

```mermaid
sequenceDiagram
    actor Aktor as Aktor (Manajer/Surveyor/Mustahik)
    participant Sistem as Sistem (Frontend)
    participant Backend as Backend (API)
    participant DB as Database

    Aktor->>Sistem: Login berhasil / Pilih menu "Dashboard"

    par Fetch data paralel
        Sistem->>Backend: GET /api/mustahik
        Backend->>DB: SELECT Mustahik + criteriaScores
        DB-->>Backend: Daftar mustahik
        Backend-->>Sistem: 200 - mustahikList
    and
        Sistem->>Backend: GET /api/programs
        Backend->>DB: SELECT AidProgram
        DB-->>Backend: Daftar program
        Backend-->>Sistem: 200 - aidPrograms
    and
        Sistem->>Backend: GET /api/monitoring
        Backend->>DB: SELECT MonitoringData
        DB-->>Backend: Data monitoring
        Backend-->>Sistem: 200 - monitoringData
    and
        Sistem->>Backend: GET /api/history
        Backend->>DB: SELECT RecipientHistory
        DB-->>Backend: Riwayat penerima
        Backend-->>Sistem: 200 - recipientHistory
    end

    alt Role = Manajer
        Sistem->>Sistem: Hitung statistik (total mustahik, program, penerima)
        Sistem->>Sistem: Bentuk data grafik distribusi status usaha
        Sistem->>Sistem: Bentuk data grafik tren monitoring
        Sistem->>Sistem: calculateMOORA(mustahikList, criteriaList) → ranking kandidat
        Sistem-->>Aktor: Tampilkan DashboardModule\n(statistik + grafik + peringkat MOORA)

    else Role = Surveyor
        Sistem->>Sistem: Filter mustahik yang sudah/belum tersurvei
        Sistem-->>Aktor: Tampilkan SurveyorDashboard\n(statistik + daftar mustahik yang perlu diproses)

    else Role = Mustahik
        Sistem->>Sistem: Filter data milik mustahik sendiri
        Sistem-->>Aktor: Tampilkan Personal Dashboard\n(status pendaftaran + riwayat bantuan + ringkasan monitoring)
    end

    alt Data tidak tersedia
        Sistem-->>Aktor: Tampilkan tampilan kosong dengan panduan menambah data
    else Koneksi server gagal
        Sistem-->>Aktor: Tampilkan pesan error koneksi
    end
```

---

## UC-11: Melihat Riwayat Penerima Bantuan

```mermaid
sequenceDiagram
    actor Manajer
    participant Sistem as Sistem (Frontend)
    participant Backend as Backend (API)
    participant DB as Database

    Manajer->>Sistem: Pilih menu "Tracking"
    Sistem->>Backend: GET /api/history
    Backend->>DB: SELECT RecipientHistory\nJOIN Mustahik ON mustahikId\nJOIN AidProgram ON programId\nORDER BY receivedDate DESC
    DB-->>Backend: Daftar riwayat penerima

    alt Belum ada data riwayat
        Backend-->>Sistem: 200 - []
        Sistem-->>Manajer: Tampilkan halaman kosong dengan keterangan belum ada riwayat
    else Data tersedia
        Backend-->>Sistem: 200 - [{id, mustahikName, programName, amount, receivedDate, mooraScore, rank, notes}]
        Sistem-->>Manajer: Tampilkan tabel riwayat penerima bantuan

        Manajer->>Sistem: Masukkan kata kunci di kolom pencarian
        Sistem->>Sistem: Filter data berdasarkan nama mustahik atau nama program
        Sistem-->>Manajer: Tampilkan hasil filter

        Manajer->>Sistem: Gunakan filter program atau periode waktu
        Sistem->>Sistem: Filter data sesuai kriteria
        Sistem-->>Manajer: Tampilkan data yang difilter
    end

    Note over Manajer,DB: Data digunakan untuk keperluan audit,\npelaporan, dan evaluasi program bantuan
```

---

*Dokumen Sequence Diagram — Mermaid*
*Sistem: Dashboard Monitoring Penerima Zakat Produktif Berbasis SPK MOORA*
*Tanggal: Februari 2026*
