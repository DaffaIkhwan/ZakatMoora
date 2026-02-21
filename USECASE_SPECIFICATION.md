# SPESIFIKASI USE CASE
## Dashboard Monitoring Penerima Zakat Produktif Berbasis SPK MOORA

---

## UC-01: Mendaftar Akun

| | |
|---|---|
| **Nama Use Case** | Mendaftar Akun |
| **Aktor** | Mustahik |
| **Kondisi Awal** | Mustahik belum memiliki akun dan belum masuk ke dalam sistem. |
| **Skenario Utama** | 1. Mustahik membuka halaman registrasi dengan mengklik tombol "Daftar" di halaman login. <br> 2. Mustahik mengisi formulir pendaftaran dengan memasukkan nama lengkap, email, password, alamat, dan nomor telepon. <br> 3. Sistem memvalidasi kelengkapan dan keunikan data (email belum terdaftar). <br> 4. Sistem membuat akun pengguna baru dengan role *mustahik* dan secara otomatis membuat data mustahik yang terhubung ke akun tersebut. <br> 5. Sistem menghasilkan token autentikasi dan mengarahkan mustahik langsung ke halaman utama. |
| **Skenario Alternatif** | Jika email yang dimasukkan sudah terdaftar di sistem, sistem menampilkan pesan "Email sudah terdaftar" dan mustahik diminta menggunakan email lain atau masuk melalui halaman login. Jika terdapat field wajib yang tidak diisi, sistem menampilkan pesan validasi dan meminta mustahik melengkapi data. |
| **Kondisi Akhir** | Akun mustahik berhasil dibuat, data mustahik tersimpan di database, dan mustahik berhasil masuk ke dalam sistem. |

---

## UC-02: Login

| | |
|---|---|
| **Nama Use Case** | Login |
| **Aktor** | Manajer, Surveyor, Mustahik |
| **Kondisi Awal** | Aktor belum masuk ke dalam sistem dan telah memiliki akun yang aktif. |
| **Skenario Utama** | 1. Aktor membuka halaman login sistem. <br> 2. Aktor memasukkan email atau username beserta password. <br> 3. Sistem memvalidasi kredensial yang dimasukkan dengan data yang tersimpan di database. <br> 4. Sistem memeriksa status keaktifan akun (*isActive = true*). <br> 5. Jika valid, sistem menghasilkan token JWT (berlaku 24 jam) dan menyimpannya di *localStorage*. <br> 6. Sistem mengarahkan aktor ke halaman utama sesuai dengan role yang dimiliki. |
| **Skenario Alternatif** | Jika email atau password yang dimasukkan salah, sistem menampilkan pesan error dan aktor diminta untuk mengulang proses login. Jika akun dalam kondisi nonaktif, sistem menampilkan pesan "Akun tidak aktif" dan aktor tidak dapat masuk ke sistem. |
| **Kondisi Akhir** | Aktor berhasil masuk ke dalam sistem dan dapat mengakses fitur sesuai dengan role yang dimiliki. |

---

## UC-03: Mengelola Program Bantuan

| | |
|---|---|
| **Nama Use Case** | Mengelola Program Bantuan |
| **Aktor** | Manajer |
| **Kondisi Awal** | Manajer telah masuk ke dalam sistem dan berada di halaman Program Bantuan. |
| **Skenario Utama** | 1. Manajer memilih menu "Program" pada navigasi utama. <br> 2. Sistem menampilkan daftar seluruh program bantuan yang tersedia beserta detail status, anggaran, kuota, dan periode. <br> 3. Untuk **menambah** program: Manajer mengklik tombol "Tambah Program", mengisi formulir (nama, deskripsi, total anggaran, anggaran per penerima, kuota, tanggal mulai dan selesai, status), lalu menyimpan data. <br> 4. Untuk **mengubah** program: Manajer mengklik tombol "Edit" pada program yang dipilih, memperbarui data yang diperlukan, lalu menyimpan perubahan. <br> 5. Untuk **menghapus** program: Manajer mengklik tombol "Hapus" pada program yang dipilih dan mengonfirmasi tindakan penghapusan. <br> 6. Sistem memproses setiap operasi dan memperbarui tampilan daftar program secara otomatis. |
| **Skenario Alternatif** | Jika terdapat field wajib yang tidak diisi saat menambah atau mengubah program, sistem menampilkan pesan validasi dan meminta manajer melengkapi data. Jika program yang akan dihapus sudah memiliki penerima yang ditetapkan, sistem menampilkan peringatan sebelum penghapusan dilanjutkan. |
| **Kondisi Akhir** | Data program bantuan berhasil ditambahkan, diubah, atau dihapus dari sistem sesuai operasi yang dilakukan. |

---

## UC-04: Mengelola Data Mustahik

| | |
|---|---|
| **Nama Use Case** | Mengelola Data Mustahik |
| **Aktor** | Manajer, Surveyor, Mustahik |
| **Kondisi Awal** | Aktor telah masuk ke dalam sistem. Untuk Surveyor: berada di halaman Mustahik. Untuk Mustahik: hanya dapat melihat data miliknya sendiri. |
| **Skenario Utama** | 1. Aktor memilih menu "Mustahik" pada navigasi utama. <br> 2. Sistem menampilkan daftar mustahik beserta data identitas dan skor sub-kriteria (khusus mustahik: hanya data miliknya sendiri). <br> 3. Untuk **menambah** mustahik (Manajer/Surveyor): Aktor mengklik tombol "Tambah Mustahik", mengisi formulir identitas (NIK, nama, alamat, nomor telepon, status usaha) beserta skor setiap sub-kriteria penilaian, lalu menyimpan data. <br> 4. Untuk **mengubah** mustahik (Manajer/Surveyor): Aktor mengklik tombol "Edit", memperbarui data identitas dan/atau skor sub-kriteria, lalu menyimpan perubahan. <br> 5. Untuk **menghapus** mustahik (Manajer): Aktor mengklik tombol "Hapus" pada data mustahik yang dipilih dan mengonfirmasi tindakan. <br> 6. Untuk **melihat detail** mustahik: Aktor mengklik baris mustahik untuk melihat skor per kriteria, progres usaha, dan tren profit bulanan. <br> 7. Sistem memproses setiap operasi dan memperbarui tampilan secara otomatis. |
| **Skenario Alternatif** | Jika field wajib tidak diisi saat menambah atau mengubah, sistem menampilkan pesan validasi. Jika NIK yang dimasukkan sudah terdaftar, sistem menampilkan pesan bahwa data sudah ada. Mustahik tidak dapat mengubah atau menghapus data miliknya sendiri melalui antarmuka ini. |
| **Kondisi Akhir** | Data mustahik beserta skor sub-kriteria berhasil dikelola dan tersimpan di database, siap digunakan dalam proses penilaian MOORA. |

---

## UC-05: Mengelola Data Pengguna

| | |
|---|---|
| **Nama Use Case** | Mengelola Data Pengguna |
| **Aktor** | Manajer |
| **Kondisi Awal** | Manajer telah masuk ke dalam sistem dan berada di halaman Pengguna. |
| **Skenario Utama** | 1. Manajer memilih menu "Pengguna" pada navigasi utama. <br> 2. Sistem menampilkan daftar seluruh pengguna beserta nama, email, role, dan status keaktifan. <br> 3. Untuk **menambah** pengguna: Manajer mengklik "Tambah Pengguna", mengisi formulir (nama, email, password, role: manajer/surveyor/mustahik), lalu menyimpan data. <br> 4. Untuk **mengubah** pengguna: Manajer mengklik "Edit" pada pengguna yang dipilih, memperbarui data yang diperlukan termasuk mengaktifkan atau menonaktifkan akun, lalu menyimpan perubahan. <br> 5. Untuk **menghapus** pengguna: Manajer mengklik "Hapus" pada pengguna yang dipilih dan mengonfirmasi penghapusan. <br> 6. Sistem memproses setiap operasi dan memperbarui daftar pengguna. |
| **Skenario Alternatif** | Jika email yang dimasukkan sudah terdaftar, sistem menampilkan pesan bahwa email sudah digunakan. Jika manajer mencoba menghapus akun yang sedang aktif digunakan, sistem menampilkan peringatan. |
| **Kondisi Akhir** | Data pengguna berhasil dikelola dan tersimpan di database sesuai operasi yang dilakukan. |

---

## UC-06: Menetapkan Penerima Bantuan

| | |
|---|---|
| **Nama Use Case** | Menetapkan Penerima Bantuan |
| **Aktor** | Manajer |
| **Kondisi Awal** | Manajer telah masuk ke dalam sistem. Program bantuan telah dibuat dan terdapat minimal satu mustahik dengan skor sub-kriteria di database. |
| **Skenario Utama** | 1. Manajer membuka salah satu program bantuan dan memilih tab "Pilih Calon". <br> 2. Sistem menampilkan daftar seluruh mustahik beserta skor MOORA yang telah dihitung. <br> 3. Manajer menggunakan fitur pencarian dan filter untuk menyaring kandidat (berdasarkan skor MOORA tertinggi atau yang belum pernah menerima bantuan). <br> 4. Manajer mencentang mustahik yang dipilih sebagai kandidat penerima, lalu menyimpan pilihan. <br> 5. Manajer membuka tab "Hasil MOORA" untuk melihat perangkingan hasil perhitungan MOORA. <br> 6. Sistem memanggil UC-07 *«include»* untuk menghitung skor MOORA seluruh kandidat yang dipilih dan menampilkan detail kalkulasi. <br> 7. Manajer mengklik tombol "Tetapkan [N] Penerima" sesuai kuota program. <br> 8. Sistem menyimpan riwayat penerimaan bantuan untuk setiap penerima terpilih dan mengubah status program menjadi *completed*. <br> 9. Sistem menampilkan konfirmasi bahwa penerima berhasil ditetapkan. |
| **Skenario Alternatif** | Jika tidak ada kandidat yang dipilih saat menetapkan penerima, sistem menampilkan pesan "Tidak ada calon penerima yang dipilih". Jika program sudah berstatus *completed*, tombol penetapan dinonaktifkan dan sistem menampilkan keterangan "Sudah Ditetapkan". Mustahik yang sudah menerima dari program yang sama tidak dapat dipilih kembali. |
| **Kondisi Akhir** | Penerima bantuan berhasil ditetapkan berdasarkan peringkat skor MOORA tertinggi, riwayat penerimaan tersimpan, dan status program diperbarui menjadi selesai. |

---

## UC-07: Menghitung Skor Penilaian

| | |
|---|---|
| **Nama Use Case** | Menghitung Skor Penilaian |
| **Aktor** | Sistem (dipanggil otomatis melalui «include» dari UC-06) |
| **Kondisi Awal** | Terdapat minimal satu kandidat mustahik dengan skor sub-kriteria. Kriteria penilaian beserta bobot telah tersedia di sistem. |
| **Skenario Utama** | 1. Sistem menerima daftar kandidat mustahik yang telah dipilih oleh manajer. <br> 2. Sistem membentuk matriks keputusan dari nilai sub-kriteria setiap kandidat (Step 1). <br> 3. Sistem menghitung normalisasi vektor setiap sub-kriteria menggunakan rumus: *xij\* = xij / √(Σxij²)* (Step 2). <br> 4. Sistem merata-rata nilai normalisasi sub-kriteria per kriteria utama untuk menghasilkan nilai normalisasi kriteria (Step 3). <br> 5. Sistem mengalikan nilai rata-rata normalisasi dengan bobot masing-masing kriteria utama untuk mendapatkan matriks ternormalisasi terbobot (Step 4). <br> 6. Sistem menghitung nilai optimasi Yi untuk setiap kandidat dengan menjumlahkan seluruh nilai terbobot kriteria benefit dan mengurangkan nilai terbobot kriteria cost: *Yi = Σ(terbobot benefit) − Σ(terbobot cost)* (Step 5). <br> 7. Sistem mengurutkan kandidat berdasarkan nilai Yi dari tertinggi ke terendah dan menetapkan peringkat (Step 6). <br> 8. Sistem mengembalikan hasil berupa daftar kandidat beserta skor MOORA dan peringkat kepada UC-06. |
| **Skenario Alternatif** | Jika tidak ada kandidat yang memiliki skor sub-kriteria, sistem mengembalikan daftar kosong dan tidak melanjutkan proses perhitungan. |
| **Kondisi Akhir** | Setiap kandidat mustahik mendapatkan nilai skor MOORA (Yi) dan peringkat yang dapat digunakan sebagai dasar penetapan penerima bantuan. |

---

## UC-08: Mengelola Kriteria Penilaian

| | |
|---|---|
| **Nama Use Case** | Mengelola Kriteria Penilaian |
| **Aktor** | Manajer |
| **Kondisi Awal** | Manajer telah masuk ke dalam sistem dan berada di halaman Kriteria. |
| **Skenario Utama** | 1. Manajer memilih menu "Kriteria" pada navigasi utama. <br> 2. Sistem menampilkan seluruh kriteria penilaian yang digunakan dalam perhitungan MOORA, mencakup kode, nama, bobot (%), jenis (*benefit/cost*), deskripsi, dan daftar sub-kriteria beserta opsi nilainya. <br> 3. Manajer mengklik tombol "Kelola Kriteria" untuk masuk ke mode pengelolaan. <br> 4. Manajer mengubah atribut kriteria yang diperlukan seperti nama, bobot, jenis, deskripsi, ikon, dan warna. <br> 5. Manajer menyimpan perubahan. <br> 6. Sistem memperbarui seluruh kriteria di database dalam satu transaksi dan menampilkan konfirmasi perubahan berhasil disimpan. |
| **Skenario Alternatif** | Jika total bobot seluruh kriteria tidak sesuai dengan ketentuan yang berlaku, sistem menampilkan pesan validasi dan perubahan tidak disimpan. Jika terjadi kegagalan saat menyimpan ke database, sistem menampilkan pesan error dan data sebelumnya tetap dipertahankan. |
| **Kondisi Akhir** | Kriteria penilaian berhasil diperbarui dan tersimpan di database. Perhitungan MOORA selanjutnya akan menggunakan bobot dan konfigurasi kriteria yang baru. |

---

## UC-09: Mengelola Data Monitoring

| | |
|---|---|
| **Nama Use Case** | Mengelola Data Monitoring |
| **Aktor** | Manajer, Surveyor, Mustahik |
| **Kondisi Awal** | Aktor telah masuk ke dalam sistem. Untuk Mustahik: hanya dapat melihat data monitoring miliknya sendiri. |
| **Skenario Utama** | 1. Aktor memilih menu "Monitoring" pada navigasi utama. <br> 2. Sistem menampilkan daftar data monitoring (khusus mustahik: hanya data miliknya) dengan filter berdasarkan program dan pencarian nama. <br> 3. Untuk **melihat detail** monitoring: Aktor mengklik salah satu data untuk melihat detail perkembangan usaha (jenis usaha, status, omzet, keuntungan, jumlah karyawan), tren profit bulanan, kondisi sosial-ekonomi, dan catatan lapangan surveyor. <br> 4. Untuk **mencatat** monitoring baru (Manajer/Surveyor): Aktor mengklik "Tambah Data Monitoring", memilih mustahik yang akan dimonitor, lalu mengisi formulir yang mencakup: <br> &nbsp;&nbsp;&nbsp;&nbsp;a. **Perkembangan Usaha**: jenis usaha, status usaha, omzet, keuntungan, jumlah karyawan. <br> &nbsp;&nbsp;&nbsp;&nbsp;b. **Kondisi Sosial-Ekonomi**: pendapatan dan pengeluaran bulanan, jumlah tanggungan, kondisi rumah dan kesehatan. <br> &nbsp;&nbsp;&nbsp;&nbsp;c. **Catatan Lapangan**: tantangan yang dihadapi, pencapaian, rencana ke depan, nama surveyor, dan catatan tambahan. <br> 5. Aktor menyimpan data; sistem memproses penyimpanan dan menampilkan data monitoring yang baru pada daftar. |
| **Skenario Alternatif** | Jika field wajib pada formulir pencatatan tidak diisi, sistem menampilkan pesan validasi. Mustahik tidak dapat mencatat data monitoring; akses hanya sebatas melihat data miliknya sendiri. |
| **Kondisi Akhir** | Data monitoring berhasil dicatat dan tersimpan di database, atau data monitoring berhasil ditampilkan sesuai hak akses aktor. |

---

## UC-10: Melihat Dashboard

| | |
|---|---|
| **Nama Use Case** | Melihat Dashboard |
| **Aktor** | Manajer, Surveyor, Mustahik |
| **Kondisi Awal** | Aktor telah masuk ke dalam sistem. |
| **Skenario Utama** | 1. Aktor memilih menu "Dashboard" pada navigasi utama atau langsung diarahkan ke halaman ini setelah login. <br> 2. Sistem memuat data sesuai dengan role aktor: <br> &nbsp;&nbsp;&nbsp;&nbsp;a. **Manajer**: Sistem menampilkan statistik keseluruhan (total mustahik, total program, total penerima bantuan), grafik distribusi status usaha mustahik, grafik tren perkembangan usaha dari data monitoring, daftar mustahik berperforma terbaik, dan ringkasan analisis kelayakan kandidat berdasarkan skor MOORA. <br> &nbsp;&nbsp;&nbsp;&nbsp;b. **Surveyor**: Sistem menampilkan statistik jumlah mustahik yang sudah dan belum diinput datanya, serta daftar tugas yang perlu diselesaikan. <br> &nbsp;&nbsp;&nbsp;&nbsp;c. **Mustahik**: Sistem menampilkan informasi status pendaftaran, riwayat penerimaan bantuan, dan ringkasan data monitoring pribadi. <br> 3. Aktor melihat informasi yang ditampilkan dan dapat berpindah ke menu lain melalui navigasi. |
| **Skenario Alternatif** | Jika data belum tersedia (database kosong atau belum ada transaksi), sistem menampilkan tampilan kosong dengan pesan panduan untuk mulai menambahkan data. Jika terjadi kegagalan koneksi ke server, sistem menampilkan pesan error dan meminta aktor untuk memuat ulang halaman. |
| **Kondisi Akhir** | Aktor mendapatkan gambaran menyeluruh tentang kondisi sistem sesuai dengan role dan hak akses yang dimiliki. |

---

## UC-11: Melihat Riwayat Penerima Bantuan

| | |
|---|---|
| **Nama Use Case** | Melihat Riwayat Penerima Bantuan |
| **Aktor** | Manajer |
| **Kondisi Awal** | Manajer telah masuk ke dalam sistem dan terdapat data riwayat penerimaan bantuan di sistem. |
| **Skenario Utama** | 1. Manajer memilih menu "Tracking" pada navigasi utama. <br> 2. Sistem mengambil seluruh riwayat penerimaan bantuan dari database dan menampilkannya dalam bentuk tabel. <br> 3. Sistem menampilkan informasi setiap riwayat yang mencakup: nama mustahik, nama program bantuan, nominal bantuan yang diterima, tanggal penerimaan, skor MOORA saat penetapan, peringkat, dan catatan. <br> 4. Manajer dapat menggunakan fitur pencarian untuk menyaring riwayat berdasarkan nama mustahik atau nama program. <br> 5. Manajer menggunakan informasi ini untuk keperluan audit, pelaporan, dan evaluasi efektivitas program bantuan. |
| **Skenario Alternatif** | Jika belum ada penerima bantuan yang ditetapkan, sistem menampilkan halaman kosong dengan keterangan bahwa belum ada riwayat penerimaan. |
| **Kondisi Akhir** | Manajer berhasil melihat seluruh riwayat penerimaan bantuan dan dapat menggunakan data tersebut sebagai bahan evaluasi dan pelaporan program. |

---

*Dokumen Spesifikasi Use Case*
*Sistem: Dashboard Monitoring Penerima Zakat Produktif Berbasis SPK MOORA*
*Tanggal: Februari 2026*
