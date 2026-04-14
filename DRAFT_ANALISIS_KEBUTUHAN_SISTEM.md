# 3.X Analisis Kebutuhan Sistem

Analisis kebutuhan sistem merupakan tahapan yang bertujuan untuk mengidentifikasi dan mendefinisikan seluruh kebutuhan fungsional maupun non-fungsional yang harus dipenuhi oleh Sistem Seleksi Zakat Produktif MOORA. Analisis ini mencakup identifikasi aktor (pengguna sistem), kebutuhan fungsional setiap modul, serta kebutuhan non-fungsional yang menjamin kualitas dan keandalan sistem secara keseluruhan.

---

## 3.X.1 Identifikasi Aktor

Sistem Seleksi Zakat Produktif MOORA melibatkan enam aktor dengan peran dan hak akses yang berbeda. Identifikasi aktor disajikan pada Tabel 3.X.

**Tabel 3.X Identifikasi Aktor Sistem**

| No. | Aktor | Deskripsi |
|-----|-------|-----------|
| 1 | Surveyor | Petugas lapangan yang bertugas melakukan survei, mengelola data mustahik, menginput penilaian kriteria, mengelola program bantuan, serta melakukan monitoring perkembangan usaha mustahik. |
| 2 | Manajer | Pengelola sistem dengan hak akses penuh. Memiliki seluruh akses yang dimiliki Surveyor, ditambah kemampuan mengelola kriteria dan bobot MOORA, melihat hasil perangkingan, mencatat zakat, serta mengelola akun pengguna. |
| 3 | Mustahik | Calon atau penerima bantuan zakat produktif yang dapat mendaftarkan diri secara mandiri, memantau status pendaftaran, melihat riwayat penerimaan bantuan, serta melaporkan perkembangan usaha melalui fitur monitoring. |
| 4 | Muzakki | Donatur atau pemberi zakat yang dapat mendaftarkan diri secara mandiri, mencatat pembayaran zakat melalui *payment gateway*, serta memantau riwayat zakat dan program yang didukung. |
| 5 | Sistem | Aktor internal yang menjalankan perhitungan perangkingan MOORA secara otomatis setiap kali terjadi perubahan data penilaian mustahik. |
| 6 | Pengunjung Publik | Pengguna anonim (belum login) yang mengakses sistem untuk melihat informasi umum, statistik penyaluran zakat, dokumentasi program, dan panduan penggunaan aplikasi. |

---

## 3.X.2 Kebutuhan Fungsional

Kebutuhan fungsional mendeskripsikan fungsi-fungsi yang harus disediakan oleh sistem untuk memenuhi kebutuhan pengguna. Berdasarkan hasil analisis, kebutuhan fungsional dikelompokkan ke dalam delapan modul utama sebagai berikut.

### A. Modul Autentikasi

Modul autentikasi menangani proses identifikasi dan otorisasi pengguna yang mengakses sistem. Kebutuhan fungsional modul ini disajikan pada Tabel 3.X.

**Tabel 3.X Kebutuhan Fungsional Modul Autentikasi**

| ID | Kebutuhan Fungsional | Deskripsi | Aktor |
|----|----------------------|-----------|-------|
| KF-01 | Login | Sistem menyediakan halaman login yang memungkinkan pengguna masuk menggunakan email/username dan password. Sistem memvalidasi kredensial dan memeriksa status keaktifan akun sebelum memberikan akses. Sistem menghasilkan token JWT untuk autentikasi sesi. | Surveyor, Manajer, Mustahik, Muzakki |
| KF-02 | Registrasi Akun | Sistem menyediakan halaman registrasi yang memungkinkan calon pengguna mendaftarkan akun baru dengan memilih role (Mustahik atau Muzakki). Formulir pendaftaran mencakup NIK, nama lengkap, email, alamat, nomor telepon, dan password. Sistem memvalidasi keunikan email dan NIK. | Mustahik, Muzakki |

### B. Modul Dashboard

Modul dashboard menyajikan ringkasan informasi dan statistik yang relevan sesuai peran pengguna. Kebutuhan fungsional modul ini disajikan pada Tabel 3.X.

**Tabel 3.X Kebutuhan Fungsional Modul Dashboard**

| ID | Kebutuhan Fungsional | Deskripsi | Aktor |
|----|----------------------|-----------|-------|
| KF-03 | Lihat Dashboard | Sistem menampilkan halaman dashboard dengan konten yang adaptif berdasarkan role pengguna: (a) **Surveyor** — statistik progres survei mustahik yang sudah dan belum disurvei; (b) **Manajer** — statistik keseluruhan meliputi total mustahik, jumlah program, total penerima, distribusi status usaha, dan ringkasan skor MOORA tertinggi; (c) **Mustahik** — status pendaftaran, riwayat penerimaan bantuan, dan ringkasan monitoring pribadi; (d) **Muzakki** — ringkasan total zakat yang telah disalurkan, daftar program yang didukung, dan riwayat zakat terkini. | Surveyor, Manajer, Mustahik, Muzakki |

### C. Modul Pengelolaan Data Mustahik

Modul ini menangani seluruh operasi yang berkaitan dengan data calon dan penerima zakat produktif. Kebutuhan fungsional modul ini disajikan pada Tabel 3.X.

**Tabel 3.X Kebutuhan Fungsional Modul Pengelolaan Data Mustahik**

| ID | Kebutuhan Fungsional | Deskripsi | Aktor |
|----|----------------------|-----------|-------|
| KF-04 | Kelola Data Mustahik | Sistem menyediakan fungsi untuk menambah, mengubah, dan menghapus data mustahik yang meliputi NIK, nama, alamat, nomor telepon, jenis kelamin, status pernikahan, dan status usaha. Mustahik hanya dapat melihat data miliknya sendiri. | Surveyor, Manajer, Mustahik |
| KF-05 | Input Survei dan Penilaian Kriteria | Sistem menyediakan formulir penilaian yang menampilkan seluruh kriteria dan sub-kriteria aktif. Surveyor/Manajer mengisi nilai berdasarkan hasil observasi lapangan. Setelah disimpan, sistem secara otomatis memicu perhitungan MOORA. | Surveyor, Manajer |
| KF-06 | Lihat Detail Mustahik | Sistem menampilkan halaman detail yang mencakup profil lengkap mustahik, nilai per kriteria penilaian, persentase skor MOORA, serta grafik tren profit dari data monitoring. | Surveyor, Manajer, Mustahik |
| KF-07 | Filter dan Pencarian Mustahik | Sistem menyediakan fitur pencarian berdasarkan nama atau alamat secara *real-time*, serta filter berdasarkan program bantuan, status survei, dan rentang skor MOORA. | Surveyor, Manajer, Mustahik |

### D. Modul Pengelolaan Muzakki dan Zakat

Modul ini menangani pengelolaan data donatur dan proses pencatatan zakat. Kebutuhan fungsional modul ini disajikan pada Tabel 3.X.

**Tabel 3.X Kebutuhan Fungsional Modul Pengelolaan Muzakki dan Zakat**

| ID | Kebutuhan Fungsional | Deskripsi | Aktor |
|----|----------------------|-----------|-------|
| KF-08 | Kelola Data Muzakki | Sistem menyediakan fungsi untuk menambah, mengubah, dan menghapus data muzakki yang meliputi NIK, nama, email, nomor telepon, pekerjaan, dan instansi. Muzakki hanya dapat mengelola data profilnya sendiri. | Manajer, Muzakki |
| KF-09 | Catat Zakat | Sistem menyediakan fitur pencatatan zakat yang terintegrasi dengan *payment gateway* Midtrans. Muzakki memilih program tujuan dan memasukkan nominal zakat. Sistem memproses pembayaran melalui Midtrans Snap dan memperbarui status transaksi (*paid*, *pending*, atau *failed*) berdasarkan *callback* dari Midtrans. Manajer dapat mencatat zakat yang diterima langsung mewakili muzakki. | Manajer, Muzakki |
| KF-10 | Lihat Riwayat Zakat | Sistem menampilkan daftar riwayat transaksi zakat yang mencakup program tujuan, nominal, tanggal, dan metode pembayaran. Muzakki hanya melihat riwayat miliknya, sedangkan Surveyor dan Manajer dapat melihat riwayat seluruh muzakki. | Surveyor, Manajer, Muzakki |

### E. Modul Pengelolaan Program Bantuan

Modul ini menangani pengelolaan program penyaluran zakat produktif dan penetapan penerima. Kebutuhan fungsional modul ini disajikan pada Tabel 3.X.

**Tabel 3.X Kebutuhan Fungsional Modul Pengelolaan Program Bantuan**

| ID | Kebutuhan Fungsional | Deskripsi | Aktor |
|----|----------------------|-----------|-------|
| KF-11 | Kelola Program Bantuan | Sistem menyediakan fungsi untuk menambah, mengubah, dan menghapus program bantuan yang meliputi nama program, deskripsi, total anggaran, anggaran per penerima, kuota penerima, tanggal mulai, tanggal selesai, dan status program. | Surveyor, Manajer |
| KF-12 | Kelola Calon dan Penerima Program | Sistem menampilkan daftar seluruh mustahik beserta skor MOORA hasil perangkingan. Pengguna dapat menyaring kandidat berdasarkan skor tertinggi, mencentang mustahik yang dipilih sebagai kandidat, dan menetapkan penerima sesuai kuota program. Sistem menyimpan riwayat penerimaan bantuan untuk setiap penerima yang ditetapkan. | Surveyor, Manajer |

### F. Modul Perhitungan MOORA

Modul ini merupakan inti dari sistem pendukung keputusan yang menerapkan metode *Multi-Objective Optimization by Ratio Analysis* (MOORA) untuk perangkingan mustahik. Kebutuhan fungsional modul ini disajikan pada Tabel 3.X.

**Tabel 3.X Kebutuhan Fungsional Modul Perhitungan MOORA**

| ID | Kebutuhan Fungsional | Deskripsi | Aktor |
|----|----------------------|-----------|-------|
| KF-13 | Hitung Perangkingan MOORA | Sistem menghitung skor MOORA secara otomatis setiap terjadi perubahan data penilaian. Proses perhitungan meliputi: (1) pembentukan matriks keputusan dari nilai sub-kriteria; (2) normalisasi vektor menggunakan rumus x*ij = xij / √(Σxij²); (3) penghitungan rata-rata nilai normalisasi sub-kriteria per kriteria utama; (4) perkalian rata-rata normalisasi dengan bobot kriteria untuk memperoleh matriks terbobot; (5) penghitungan nilai optimasi Yi = Σ(terbobot *benefit*) − Σ(terbobot *cost*); dan (6) pengurutan kandidat berdasarkan nilai Yi dari tertinggi ke terendah. | Sistem |
| KF-14 | Lihat Hasil Perangkingan | Sistem menampilkan daftar mustahik yang diurutkan berdasarkan skor MOORA (Yi) dari tertinggi ke terendah. Setiap baris menampilkan peringkat, nama mustahik, skor Yi, dan status survei. Manajer dapat menggunakan filter program dan pencarian nama. | Manajer |
| KF-15 | Lihat Detail Perhitungan | Sistem menampilkan seluruh tahapan kalkulasi MOORA secara transparan, meliputi: matriks keputusan (nilai asli), normalisasi vektor per sub-kriteria, rata-rata normalisasi per kriteria utama, matriks ternormalisasi terbobot, nilai Yi beserta rincian penjumlahan *benefit* dan *cost*, serta peringkat akhir. | Manajer |
| KF-16 | Kelola Kriteria dan Bobot | Sistem menyediakan fungsi untuk menambah, mengubah, dan menghapus kriteria penilaian MOORA. Setiap kriteria memiliki atribut: kode, nama, bobot (%), jenis (*benefit* atau *cost*), deskripsi, ikon, dan warna. Manajer juga dapat mendefinisikan sub-kriteria beserta opsi jawaban untuk setiap kriteria. | Manajer |

### G. Modul Monitoring Mustahik

Modul ini menangani pencatatan dan pemantauan perkembangan usaha mustahik setelah menerima bantuan. Kebutuhan fungsional modul ini disajikan pada Tabel 3.X.

**Tabel 3.X Kebutuhan Fungsional Modul Monitoring Mustahik**

| ID | Kebutuhan Fungsional | Deskripsi | Aktor |
|----|----------------------|-----------|-------|
| KF-17 | Input Data Monitoring | Sistem menyediakan formulir monitoring yang mencakup: (a) Perkembangan Usaha — jenis usaha, status usaha, omzet, keuntungan, dan jumlah karyawan; (b) Kondisi Sosial-Ekonomi — pendapatan dan pengeluaran bulanan, jumlah tanggungan, kondisi rumah, dan kondisi kesehatan; (c) Catatan Lapangan — tantangan yang dihadapi, pencapaian, rencana ke depan, dan catatan surveyor. Mustahik dapat mengisi data miliknya sendiri, namun tidak dapat menambahkan catatan surveyor. | Surveyor, Manajer, Mustahik |
| KF-18 | Lihat Riwayat Monitoring | Sistem menampilkan daftar riwayat seluruh laporan monitoring. Setiap baris menampilkan nama mustahik, program terkait, tanggal monitoring, status usaha, dan omzet. Mustahik hanya melihat riwayat miliknya. | Surveyor, Manajer, Mustahik |
| KF-19 | Lihat Detail Monitoring | Sistem menampilkan halaman detail monitoring yang mencakup metrik usaha, kondisi sosial-ekonomi, grafik tren profit bulanan dari seluruh riwayat monitoring, serta catatan lapangan. | Surveyor, Manajer, Mustahik |

### H. Modul Manajemen Pengguna dan Riwayat Penerimaan

Modul ini menangani administrasi akun pengguna dan pelacakan riwayat distribusi bantuan. Kebutuhan fungsional modul ini disajikan pada Tabel 3.X.

**Tabel 3.X Kebutuhan Fungsional Modul Manajemen Pengguna dan Riwayat Penerimaan**

| ID | Kebutuhan Fungsional | Deskripsi | Aktor |
|----|----------------------|-----------|-------|
| KF-20 | Kelola Pengguna | Sistem menyediakan fungsi untuk menambah, mengubah, menghapus, serta mengaktifkan dan menonaktifkan akun pengguna. Formulir penambahan pengguna mencakup nama, email, password, dan role (Manajer atau Surveyor). Akun yang dinonaktifkan tidak dapat digunakan untuk login. | Manajer |
| KF-21 | Lihat Riwayat Penerimaan | Sistem menampilkan histori penerimaan bantuan yang mencakup nama mustahik, nama program bantuan, nominal bantuan, tanggal penerimaan, skor MOORA pada saat penetapan, dan peringkat. Mustahik hanya melihat riwayat miliknya sendiri. | Surveyor, Manajer, Mustahik |

### I. Modul Landing Page (Informasi Publik)

Modul ini berfungsi sebagai halaman beranda awalan (*public front*) yang memberikan informasi umum sebelum pengguna masuk ke dalam sistem atau mendaftar. Kebutuhan fungsional modul ini disajikan pada Tabel 3.X.

**Tabel 3.X Kebutuhan Fungsional Modul Landing Page**

| ID | Kebutuhan Fungsional | Deskripsi | Aktor |
|----|----------------------|-----------|-------|
| KF-22 | Lihat Informasi Publik | Sistem menampilkan halaman utama (*Landing Page*) yang memuat informasi statistik LAZISMU (total donasi, jumlah program aktif, total mustahik terbantu), dokumentasi program unggulan, panduan pendaftaran donasi, serta *call to action* (CTA) menuju menu login dan register. | Pengunjung Publik |
| KF-23 | Lihat Detail Program Publik | Sistem menampilkan rincian transparansi dari suatu program secara publik. Pengunjung dapat melihat secara langsung daftar nama mustahik yang telah menerima zakat dari program tersebut beserta status usahanya, serta daftar nama muzakki (donatur) yang mendukung program tersebut. | Pengunjung Publik |

---

## 3.X.3 Kebutuhan Non-Fungsional

Kebutuhan non-fungsional mendefinisikan karakteristik kualitas yang harus dimiliki oleh sistem di luar fungsionalitas utamanya. Kebutuhan non-fungsional sistem ini disajikan pada Tabel 3.X.

**Tabel 3.X Kebutuhan Non-Fungsional Sistem**

| ID | Kategori | Kebutuhan Non-Fungsional | Deskripsi |
|----|----------|--------------------------|-----------|
| KNF-01 | Keamanan (*Security*) | Autentikasi Berbasis Token | Sistem menggunakan JSON Web Token (JWT) untuk autentikasi dan otorisasi pengguna. Token disimpan di *localStorage* pada sisi klien dan disertakan pada setiap permintaan API melalui *header* Authorization. |
| KNF-02 | Keamanan (*Security*) | Enkripsi Password | Sistem menyimpan password pengguna dalam bentuk *hash* menggunakan algoritma bcrypt, sehingga password asli tidak tersimpan di database. |
| KNF-03 | Keamanan (*Security*) | Kontrol Akses Berbasis Peran | Sistem menerapkan *Role-Based Access Control* (RBAC) yang membatasi akses fitur berdasarkan peran pengguna (Surveyor, Manajer, Mustahik, Muzakki). Setiap *endpoint* API memeriksa peran pengguna sebelum memberikan akses. |
| KNF-04 | Kegunaan (*Usability*) | Antarmuka Responsif | Sistem memiliki antarmuka yang responsif dan dapat diakses melalui berbagai perangkat (desktop, tablet, dan *smartphone*) dengan tampilan yang menyesuaikan ukuran layar. |
| KNF-05 | Kegunaan (*Usability*) | Tema Gelap dan Terang | Sistem menyediakan opsi tampilan tema gelap (*dark mode*) dan tema terang (*light mode*) yang dapat dipilih oleh pengguna sesuai preferensi. |
| KNF-06 | Kegunaan (*Usability*) | Notifikasi Interaktif | Sistem menampilkan notifikasi *toast* untuk memberikan umpan balik atas setiap aksi pengguna, seperti keberhasilan penyimpanan data, peringatan validasi, atau pesan error. |
| KNF-07 | Kinerja (*Performance*) | Perhitungan MOORA Reaktif | Perhitungan perangkingan MOORA dilakukan secara reaktif di sisi klien menggunakan mekanisme *memoization* (useMemo), sehingga hasil perangkingan diperbarui secara otomatis setiap kali data penilaian berubah tanpa memerlukan interaksi manual. |
| KNF-08 | Kinerja (*Performance*) | Pencarian *Real-Time* | Fitur pencarian dan filter pada daftar mustahik, program, dan monitoring merespons input pengguna secara *real-time* tanpa memerlukan pengiriman ulang halaman. |
| KNF-09 | Kompatibilitas (*Compatibility*) | Kompatibilitas Peramban | Sistem dapat dijalankan pada peramban web modern seperti Google Chrome, Mozilla Firefox, Microsoft Edge, dan Safari dengan performa yang konsisten. |
| KNF-10 | Keandalan (*Reliability*) | Validasi Data | Sistem melakukan validasi data pada sisi klien dan sisi server untuk memastikan integritas data yang disimpan ke dalam database, termasuk validasi keunikan NIK, email, serta kelengkapan *field* wajib. |
| KNF-11 | Keandalan (*Reliability*) | Integrasi *Payment Gateway* | Sistem terintegrasi dengan Midtrans Snap sebagai *payment gateway* untuk memproses transaksi zakat secara aman. Sistem menangani *callback* pembayaran (*success*, *pending*, *error*, *close*) dan memperbarui status transaksi di database. |
| KNF-12 | Pemeliharaan (*Maintainability*) | Arsitektur Modular | Sistem dibangun dengan arsitektur modular yang memisahkan antara *frontend* (React + Vite), *backend* (Express.js), dan *database* (PostgreSQL), sehingga memudahkan proses pengembangan, pengujian, dan pemeliharaan. |

---

## 3.X.4 Rekapitulasi Hak Akses

Matriks hak akses menunjukkan relasi antara setiap kebutuhan fungsional dengan aktor yang memiliki wewenang untuk mengaksesnya. Rekapitulasi hak akses disajikan pada Tabel 3.X.

**Tabel 3.X Matriks Hak Akses Pengguna**

| ID | Kebutuhan Fungsional | Surveyor | Manajer | Mustahik | Muzakki | Pengunjung Publik |
|----|----------------------|:--------:|:-------:|:--------:|:-------:|:---------:|
| KF-01 | Login | ✅ | ✅ | ✅ | ✅ | ✅ |
| KF-02 | Registrasi Akun | — | — | ✅ | ✅ | ✅ |
| KF-03 | Lihat Dashboard | ✅ | ✅ | ✅ | ✅ | — |
| KF-04 | Kelola Data Mustahik | ✅ | ✅ | ✅* | — | — |
| KF-05 | Input Survei dan Penilaian Kriteria | ✅ | ✅ | — | — | — |
| KF-06 | Lihat Detail Mustahik | ✅ | ✅ | ✅* | — | — |
| KF-07 | Filter dan Pencarian Mustahik | ✅ | ✅ | ✅* | — | — |
| KF-08 | Kelola Data Muzakki | — | ✅ | — | ✅* | — |
| KF-09 | Catat Zakat | — | ✅ | — | ✅ | — |
| KF-10 | Lihat Riwayat Zakat | ✅ | ✅ | — | ✅* | — |
| KF-11 | Kelola Program Bantuan | ✅ | ✅ | — | — | — |
| KF-12 | Kelola Calon dan Penerima Program | ✅ | ✅ | — | — | — |
| KF-13 | Hitung Perangkingan MOORA | — | — | — | — | — |
| KF-14 | Lihat Hasil Perangkingan | — | ✅ | — | — | — |
| KF-15 | Lihat Detail Perhitungan | — | ✅ | — | — | — |
| KF-16 | Kelola Kriteria dan Bobot | — | ✅ | — | — | — |
| KF-17 | Input Data Monitoring | ✅ | ✅ | ✅* | — | — |
| KF-18 | Lihat Riwayat Monitoring | ✅ | ✅ | ✅* | — | — |
| KF-19 | Lihat Detail Monitoring | ✅ | ✅ | ✅* | — | — |
| KF-20 | Kelola Pengguna | — | ✅ | — | — | — |
| KF-21 | Lihat Riwayat Penerimaan | ✅ | ✅ | ✅* | — | — |
| KF-22 | Lihat Informasi Publik | — | — | — | — | ✅ |
| KF-23 | Lihat Detail Program Publik | — | — | — | — | ✅ |

> **Keterangan:**
> - ✅ = Memiliki akses penuh
> - ✅* = Akses terbatas (hanya data milik sendiri)
> - — = Tidak memiliki akses
> - Peran *Pengunjung Publik* secara teknis adalah state ketika user belum terautentikasi (belum login).
> - KF-13 dijalankan secara otomatis oleh Sistem, bukan oleh aktor manusia.
