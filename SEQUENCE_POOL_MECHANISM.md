# Sequence Diagram: Mekanisme Pool Dana Zakat

Dokumen ini memuat urutan langkah (sequence) untuk dua proses utama dalam alur manajemen dana tersentralisasi (Pool) pada sistem ZakatMOORA:
1. **Membayar Zakat** oleh Muzakki, yang menambah Saldo Pool.
2. **Membuat Program Bantuan** oleh Admin/Manajer, yang mengalokasikan dan mengurangi Saldo Pool.

---

## 1. Membayar Zakat (Muzakki)

Proses ketika Muzakki menyetorkan dana zakat. Dana ini masuk ke dalam entitas `Donation` dengan penanda `isAllocation=false`. Jika sukses (via webhook Midtrans), saldo "Pool" akan bertambah secara otomatis.

```plantuml
@startuml UC-12_Membayar_Zakat
title UC-12: Membayar Zakat

actor Muzakki
participant "Sistem (Frontend)" as Sistem
participant "Backend (API)" as Backend
participant "Midtrans (Gateway)" as Midtrans
participant "Database" as DB

Muzakki -> Sistem: Pilih "Salurkan Dana" / "Bayar Zakat"
Sistem --> Muzakki: Tampilkan modal pembayaran
Muzakki -> Sistem: Masukkan nominal zakat, opsi anonim, pesan\nKlik "Lanjut Pembayaran"

Sistem -> Backend: POST /api/donations {amount, isAnonymous, notes}
Backend -> DB: INSERT Donation (isAllocation=false, status='pending')
DB --> Backend: donationId

Backend -> Midtrans: Request Snap Token (amount, donationId)
Midtrans --> Backend: snapToken
Backend -> DB: UPDATE Donation SET snapToken = ?
Backend --> Sistem: 200 - {snapToken}

Sistem -> Midtrans: Tampilkan Popup Midtrans (window.snap.pay)
Muzakki -> Midtrans: Selesaikan pembayaran (Transfer/E-Wallet)
Midtrans --> Sistem: onSuccess Callback

Midtrans -> Backend: POST /api/webhooks/midtrans (Notification)
Backend -> Backend: Verifikasi Signature Key
Backend -> DB: UPDATE Donation SET status = 'success'
DB --> Backend: OK (Saldo Pool Otomatis Bertambah)
Backend --> Midtrans: 200 OK

Sistem -> Backend: GET /api/donations/status/:id
Backend --> Sistem: status = 'success'
Sistem --> Muzakki: Tampilkan Sukses & Saldo Pool Bertambah
@enduml
```

---

## 2. Membuat Program Bantuan (Admin/Manajer)

Proses ketika Manajer/Admin menyiapkan suatu program bantuan baru. Sistem akan mengecek ketersediaan `poolBalance` terlebih dahulu. Jika cukup, sistem akan membuat `Program` bersamaan dengan transaksi otomatis di `Donation` bersimbol `isAllocation=true`, yang mengurangi Pool.

```plantuml
@startuml UC-03b_Buat_Program
title UC-03b: Membuat Program Bantuan (Alokasi Pool)

actor Manajer
participant "Sistem (Frontend)" as Sistem
participant "Backend (API)" as Backend
participant "Database" as DB

Manajer -> Sistem: Klik "Tambah Program"
Sistem --> Manajer: Tampilkan form tambah program
Manajer -> Sistem: Isi form (nama, deskripsi, anggaran, kuota, tanggal, status)\nKlik "Simpan"
Sistem -> Backend: POST /api/programs {name, description, totalBudget, quota, ...}

Backend -> DB: Hitung Saldo Pool (Σ Zakat - Σ Alokasi)
DB --> Backend: poolBalance

alt poolBalance < totalBudget
    Backend --> Sistem: 400 - "Saldo Pool tidak mencukupi"
    Sistem --> Manajer: Tampilkan pesan error
else poolBalance >= totalBudget
    Backend -> DB: BEGIN TRANSACTION
    Backend -> DB: INSERT INTO Program
    DB --> Backend: newProgramId
    Backend -> DB: INSERT INTO Donation (isAllocation=true, programId=newProgramId, amount=totalBudget, status='success')
    Backend -> DB: COMMIT TRANSACTION
    DB --> Backend: Program & Alokasi tersimpan
    Backend --> Sistem: 200 - data program baru
    Sistem --> Manajer: Tampilkan program baru di daftar
end
@enduml
```
