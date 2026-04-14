# DRAFT BLACK BOX TESTING - SISTEM ZAKATMOORA

Berikut adalah tabel hasil pengujian Black Box (fungsionalitas) sistem ZakatMOORA. Pengujian dilakukan berdasarkan modul tampilan (modul navigasi) yang tersedia dalam sistem untuk memastikan seluruh fitur berjalan sesuai dengan alur logika yang telah dirancang.

---

## Modul 1: Halaman Landing Page

| No | Skenario Pengujian | Aksi yang Dilakukan | Hasil yang Diharapkan | Hasil yang Didapatkan | Status |
|----|-------------------|--------------------|-----------------------|-----------------------|--------|
| 1 | Menampilkan halaman publik | Pengguna mengakses URL utama tanpa login | Halaman landing page tampil dengan informasi program zakat, daftar donatur, dan tombol "Masuk" / "Daftar" | Sesuai Harapan | Berhasil |
| 2 | Navigasi ke halaman login | Klik tombol "Masuk" pada landing page | Halaman login tampil dengan form email dan password | Sesuai Harapan | Berhasil |
| 3 | Navigasi ke halaman registrasi | Klik tombol "Daftar" atau "Register" pada landing page | Halaman registrasi tampil dengan form pendaftaran akun baru | Sesuai Harapan | Berhasil |
| 4 | Menampilkan riwayat donasi publik | Halaman landing page dimuat secara penuh | Daftar donatur dan nominal zakat tampil pada bagian "Donasi Terbaru" (nama anonim ditampilkan sebagai "Hamba Allah") | Sesuai Harapan | Berhasil |

---

## Modul 2: Autentikasi (Login & Registrasi)

| No | Skenario Pengujian | Aksi yang Dilakukan | Hasil yang Diharapkan | Hasil yang Didapatkan | Status |
|----|-------------------|--------------------|-----------------------|-----------------------|--------|
| 1 | Login dengan kredensial valid | Mengisi email dan password yang benar lalu klik "Masuk" | Pengguna berhasil masuk dan diarahkan ke dashboard sesuai rolenya | Sesuai Harapan | Berhasil |
| 2 | Login dengan password salah | Mengisi email benar dan password salah lalu klik "Masuk" | Muncul pesan error "Email atau password salah" | Sesuai Harapan | Berhasil |
| 3 | Login dengan field kosong | Klik "Masuk" tanpa mengisi email/password | Muncul validasi bahwa field tidak boleh kosong | Sesuai Harapan | Berhasil |
| 4 | Registrasi akun muzakki baru | Mengisi form registrasi lengkap (nama, email, password) dan klik "Daftar" | Akun Muzakki berhasil dibuat dan pengguna langsung masuk ke dashboard muzakki | Sesuai Harapan | Berhasil |
| 5 | Registrasi dengan email yang sudah terdaftar | Mengisi email yang sudah ada di sistem lalu klik "Daftar" | Muncul pesan error bahwa email sudah terdaftar | Sesuai Harapan | Berhasil |
| 6 | Logout dari sistem | Klik tombol "Keluar" pada navbar | Muncul dialog konfirmasi logout; setelah konfirmasi, sesi pengguna dihapus dan diarahkan ke landing page | Sesuai Harapan | Berhasil |

---

## Modul 3: Dashboard

### 3a. Dashboard Admin / Manajer

| No | Skenario Pengujian | Aksi yang Dilakukan | Hasil yang Diharapkan | Hasil yang Didapatkan | Status |
|----|-------------------|--------------------|-----------------------|-----------------------|--------|
| 1 | Menampilkan ringkasan statistik sistem | Login sebagai Admin/Manajer dan buka tab "Dashboard" | Kartu statistik (total mustahik, total program, total dana tersalurkan, jumlah penerima aktif) tampil dengan data terkini | Sesuai Harapan | Berhasil |
| 2 | Menampilkan ringkasan monitoring ekonomi | Lihat bagian monitoring pada dashboard | Grafik atau ringkasan status ekonomi mustahik (Membaik/Stabil/Memburuk/Double Shock) tampil dengan benar | Sesuai Harapan | Berhasil |
| 3 | Navigasi cepat ke modul lain | Klik salah satu kartu/tombol shortcut di dashboard | Sistem berpindah ke tab modul yang sesuai (misal klik "Lihat Program" → berpindah ke tab Program) | Sesuai Harapan | Berhasil |
| 4 | Menampilkan tabel analisis MOORA | Scroll ke bawah bagian "Analisis Kelayakan Kandidat" | Tabel hasil peringkat MOORA untuk semua mustahik terdaftar tampil dengan skor Yi yang terurut | Sesuai Harapan | Berhasil |

### 3b. Dashboard Surveyor

| No | Skenario Pengujian | Aksi yang Dilakukan | Hasil yang Diharapkan | Hasil yang Didapatkan | Status |
|----|-------------------|--------------------|-----------------------|-----------------------|--------|
| 1 | Menampilkan ringkasan tugas surveyor | Login sebagai Surveyor dan buka tab "Dashboard" | Tampil ringkasan jumlah mustahik yang sudah/belum disurvey dan ringkasan data monitoring | Sesuai Harapan | Berhasil |
| 2 | Navigasi ke modul Mustahik dari dashboard | Klik tombol shortcut "Kelola Mustahik" pada dashboard surveyor | Sistem berpindah ke tab Mustahik | Sesuai Harapan | Berhasil |

### 3c. Dashboard Muzakki

| No | Skenario Pengujian | Aksi yang Dilakukan | Hasil yang Diharapkan | Hasil yang Didapatkan | Status |
|----|-------------------|--------------------|-----------------------|-----------------------|--------|
| 1 | Menampilkan ringkasan donasi muzakki | Login sebagai Muzakki dan buka tab "Dashboard" | Tampil total zakat yang telah disalurkan, riwayat transaksi terakhir, dan status pembayaran | Sesuai Harapan | Berhasil |
| 2 | Melakukan pembayaran zakat | Klik tombol "Bayar Zakat" / "Salurkan Zakat", isi form dan klik "Konfirmasi" | Redirect ke halaman pembayaran Midtrans; setelah pembayaran berhasil, saldo pool bertambah dan riwayat ter-update | Sesuai Harapan | Berhasil |
| 3 | Memilih opsi anonim saat berzakat | Centang opsi "Hamba Allah" pada form pembayaran zakat | Nama pengirim tampil sebagai "Hamba Allah" pada landing page dan riwayat publik | Sesuai Harapan | Berhasil |

---

## Modul 4: Program Bantuan

| No | Skenario Pengujian | Aksi yang Dilakukan | Hasil yang Diharapkan | Hasil yang Didapatkan | Status |
|----|-------------------|--------------------|-----------------------|-----------------------|--------|
| 1 | Menampilkan daftar program | Buka tab "Program" | Semua program bantuan tampil dalam bentuk kartu beserta status (Draft/Aktif/Selesai), anggaran, kuota, dan periode | Sesuai Harapan | Berhasil |
| 2 | Membuat program baru | Klik tombol "Buat Program", isi form lengkap (nama, deskripsi, anggaran, kuota, periode), klik "Simpan" | Program baru tersimpan dan muncul di daftar program dengan status "Draft" | Sesuai Harapan | Berhasil |
| 3 | Mengedit program | Klik ikon edit (pensil) pada salah satu program, ubah data, klik "Simpan" | Data program ter-update dengan nilai baru | Sesuai Harapan | Berhasil |
| 4 | Menghapus program | Klik ikon hapus (tempat sampah) pada salah satu program lalu konfirmasi penghapusan | Program terhapus dan hilang dari daftar | Sesuai Harapan | Berhasil |
| 5 | Filter program berdasarkan status | Pilih filter "Aktif" pada dropdown filter status | Hanya program dengan status "Aktif" yang tampil | Sesuai Harapan | Berhasil |
| 6 | Pencarian program | Ketik nama program pada kolom pencarian | Daftar program tersaring sesuai kata kunci yang diinput | Sesuai Harapan | Berhasil |
| 7 | Menampilkan dana pool | Lihat kartu "Dana Terkumpul" di atas daftar program | Tampil saldo dana pool (belum disalurkan), dana tersalurkan, dan zakat kumulatif dengan nilai yang akurat | Sesuai Harapan | Berhasil |

### 4a. Sub-Modul: Kelola Calon & Penerima Program

| No | Skenario Pengujian | Aksi yang Dilakukan | Hasil yang Diharapkan | Hasil yang Didapatkan | Status |
|----|-------------------|--------------------|-----------------------|-----------------------|--------|
| 1 | Membuka halaman kelola kandidat program | Klik tombol "Kelola Calon & Penerima" pada salah satu program | Halaman manajemen kandidat program tampil beserta daftar mustahik dan skor MOORA | Sesuai Harapan | Berhasil |
| 2 | Menjalankan seleksi MOORA | Klik tombol "Pilih Pemenang" / "Jalankan Seleksi MOORA" | Sistem memproses data kriteria dan menampilkan peringkat mustahik terbaik berdasarkan skor Yi | Sesuai Harapan | Berhasil |
| 3 | Menetapkan penerima program | Pilih beberapa mustahik dari daftar peringkat lalu klik "Tetapkan sebagai Penerima" | Status mustahik terpilih terupdate sebagai penerima manfaat program dan data tersimpan ke riwayat | Sesuai Harapan | Berhasil |
| 4 | Menyalurkan dana ke program | Klik tombol "Salurkan Dana" dan isi nominal, klik "Konfirmasi" | Saldo pool berkurang sesuai nominal, dana tercatat masuk ke program, dan status program terupdate | Sesuai Harapan | Berhasil |
| 5 | Kembali ke daftar program | Klik tombol "Kembali ke Daftar Program" | Halaman kembali ke tab Program dengan daftar program | Sesuai Harapan | Berhasil |

---

## Modul 5: Database Mustahik

| No | Skenario Pengujian | Aksi yang Dilakukan | Hasil yang Diharapkan | Hasil yang Didapatkan | Status |
|----|-------------------|--------------------|-----------------------|-----------------------|--------|
| 1 | Menampilkan daftar mustahik | Buka tab "Mustahik" | Semua data mustahik tampil dalam tabel dengan informasi nama, kriteria penilaian, dan skor total | Sesuai Harapan | Berhasil |
| 2 | Menambah mustahik baru | Klik tombol "Tambah Mustahik", isi form data lengkap, klik "Simpan" | Data mustahik baru tersimpan dan muncul di daftar | Sesuai Harapan | Berhasil |
| 3 | Mengedit data mustahik | Klik ikon edit pada salah satu mustahik, ubah data, klik "Simpan" | Data mustahik ter-update; skor MOORA otomatis dihitung ulang | Sesuai Harapan | Berhasil |
| 4 | Menghapus data mustahik | Klik ikon hapus pada salah satu mustahik dan konfirmasi | Data mustahik terhapus dari daftar | Sesuai Harapan | Berhasil |
| 5 | Melihat detail mustahik | Klik nama atau ikon detail pada salah satu mustahik | Modal detail mustahik tampil beserta semua sub-kriteria dan skor penilaian | Sesuai Harapan | Berhasil |
| 6 | Pencarian mustahik | Ketik nama mustahik pada kolom pencarian | Daftar tersaring menampilkan mustahik yang namanya cocok dengan kata kunci | Sesuai Harapan | Berhasil |
| 7 | Mengubah nilai sub-kriteria mustahik | Edit salah satu sub-kriteria pada profil mustahik dan simpan | Skor Yi dan peringkat mustahik berubah secara otomatis sesuai perhitungan MOORA terbaru | Sesuai Harapan | Berhasil |

---

## Modul 6: Monitoring Ekonomi

| No | Skenario Pengujian | Aksi yang Dilakukan | Hasil yang Diharapkan | Hasil yang Didapatkan | Status |
|----|-------------------|--------------------|-----------------------|-----------------------|--------|
| 1 | Menampilkan daftar data monitoring | Buka tab "Monitoring" | Semua data monitoring penerima program tampil beserta status ekonomi (Membaik/Stabil/Memburuk/Double Shock) | Sesuai Harapan | Berhasil |
| 2 | Menambah data monitoring baru | Klik tombol "Tambah Data Monitoring", isi form (mustahik, periode, pendapatan, pengeluaran), klik "Simpan" | Data monitoring tersimpan dan status ekonomi dikalkulasi otomatis berdasarkan pertumbuhan pendapatan (gy) dan pengeluaran (gc) | Sesuai Harapan | Berhasil |
| 3 | Menampilkan status "Membaik" | Input data dengan gy > 0 dan gc ≤ gy | Status ekonomi mustahik ditampilkan sebagai "Membaik" dengan indikator hijau | Sesuai Harapan | Berhasil |
| 4 | Menampilkan status "Double Shock" | Input data dengan gy < 0 dan gc > 0 (pendapatan turun, pengeluaran naik) | Status ekonomi ditampilkan sebagai "Double Shock" dengan indikator merah | Sesuai Harapan | Berhasil |
| 5 | Filter monitoring per mustahik | Pilih nama mustahik pada dropdown filter | Hanya data monitoring milik mustahik terpilih yang tampil | Sesuai Harapan | Berhasil |
| 6 | Melihat detail riwayat monitoring | Klik baris data monitoring untuk melihat detail | Modal detail menampilkan seluruh riwayat periode monitoring mustahik beserta tren ekonominya | Sesuai Harapan | Berhasil |

---

## Modul 7: Tracking Penyaluran

| No | Skenario Pengujian | Aksi yang Dilakukan | Hasil yang Diharapkan | Hasil yang Didapatkan | Status |
|----|-------------------|--------------------|-----------------------|-----------------------|--------|
| 1 | Menampilkan riwayat penyaluran | Buka tab "Tracking" | Semua riwayat penyaluran zakat ke mustahik tampil beserta nama program, nominal, dan tanggal | Sesuai Harapan | Berhasil |
| 2 | Pencarian riwayat per mustahik | Ketik nama mustahik pada kolom pencarian | Riwayat penyaluran untuk nama mustahik tersebut tampil (jika ada data) | Sesuai Harapan | Berhasil |
| 3 | Menampilkan riwayat donasi muzakki | Buka tab "Tracking" sebagai Muzakki | Riwayat transaksi zakat yang pernah dilakukan oleh muzakki yang login tampil dengan status pembayaran | Sesuai Harapan | Berhasil |

---

## Modul 8: Manajemen Kriteria

| No | Skenario Pengujian | Aksi yang Dilakukan | Hasil yang Diharapkan | Hasil yang Didapatkan | Status |
|----|-------------------|--------------------|-----------------------|-----------------------|--------|
| 1 | Menampilkan daftar kriteria | Buka tab "Kriteria" | Semua kriteria penilaian tampil beserta bobot (weight), tipe (benefit/cost), dan sub-kriteria | Sesuai Harapan | Berhasil |
| 2 | Membuka mode kelola kriteria | Klik tombol "Kelola Kriteria" pada halaman kriteria | Tampil form manajemen kriteria dengan field bobot yang bisa diubah | Sesuai Harapan | Berhasil |
| 3 | Mengubah bobot kriteria | Ubah nilai bobot salah satu kriteria pada form manajemen, klik "Simpan" | Bobot kriteria terupdate dan total bobot semua kriteria tetap 1.0 (100%) | Sesuai Harapan | Berhasil |
| 4 | Mencegah total bobot melebihi 100% | Input bobot kriteria sehingga totalnya >1.0 | Sistem menampilkan pesan error/validasi bahwa total bobot tidak boleh melebihi 100% | Sesuai Harapan | Berhasil |
| 5 | Simulasi sensitivitas bobot | Ubah bobot kriteria dan lihat perubahan pada tabel MOORA di dashboard | Peringkat mustahik bergeser (rank reversal) sesuai perubahan bobot yang diinput | Sesuai Harapan | Berhasil |

---

## Modul 9: Manajemen Pengguna

| No | Skenario Pengujian | Aksi yang Dilakukan | Hasil yang Diharapkan | Hasil yang Didapatkan | Status |
|----|-------------------|--------------------|-----------------------|-----------------------|--------|
| 1 | Menampilkan daftar pengguna | Buka tab "Pengguna" (hanya Admin/Manajer) | Semua akun pengguna sistem tampil beserta nama, email, role, dan status aktif | Sesuai Harapan | Berhasil |
| 2 | Menambah pengguna baru | Klik tombol "Tambah Pengguna", isi form (nama, email, password, role), klik "Simpan" | Akun pengguna baru tersimpan, tampil di daftar, dan dapat digunakan untuk login | Sesuai Harapan | Berhasil |
| 3 | Mengedit data pengguna | Klik ikon edit pada salah satu pengguna, ubah data, klik "Simpan" | Data pengguna terupdate sesuai perubahan yang dilakukan | Sesuai Harapan | Berhasil |
| 4 | Menonaktifkan akun pengguna | Ubah status pengguna dari "Aktif" menjadi "Non-Aktif" | Akun tersebut tidak dapat digunakan untuk login; sistem menampilkan error saat percobaan login | Sesuai Harapan | Berhasil |
| 5 | Menghapus pengguna | Klik ikon hapus pada salah satu pengguna dan konfirmasi | Akun pengguna terhapus dari daftar | Sesuai Harapan | Berhasil |

---

## Modul 10: Manajemen Muzakki

| No | Skenario Pengujian | Aksi yang Dilakukan | Hasil yang Diharapkan | Hasil yang Didapatkan | Status |
|----|-------------------|--------------------|-----------------------|-----------------------|--------|
| 1 | Menampilkan daftar muzakki | Buka tab "Muzakki" (hanya Admin/Manajer) | Semua akun muzakki tampil beserta nama, total donasi, dan jumlah transaksi | Sesuai Harapan | Berhasil |
| 2 | Melihat riwayat transaksi muzakki | Klik nama/detail salah satu muzakki | Modal riwayat transaksi tampil dengan semua data pembayaran zakat yang pernah dilakukan | Sesuai Harapan | Berhasil |
| 3 | Verifikasi pembayaran pending | Klik tombol "Verifikasi" pada transaksi berstatus "Pending" | Status transaksi berubah menjadi "Verified" dan saldo pool dana zakat bertambah | Sesuai Harapan | Berhasil |
| 4 | Filter muzakki berdasarkan program | Pilih program pada dropdown filter | Daftar muzakki yang berafiliasi dengan program tersebut muncul | Sesuai Harapan | Berhasil |

---

**Penyusun:** Daffa Ikhwan — ZakatMOORA System  
**Tanggal Pengujian:** April 2026  
**Total Skenario Uji:** 52 skenario  
**Hasil:** Seluruh skenario berhasil sesuai harapan ✅
