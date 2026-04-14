## 4.X Logika Perhitungan Status Monitoring dan Evaluasi (MONEV)

Dalam perancangan sistem ini, kapabilitas evaluasi dampak zakat produktif diukur secara komputasi (melalui *Back-end*) pada fitur Monitoring dan Evaluasi (MONEV). Fitur ini mengadopsi formulasi teoritis Model CIBEST dan Indeks Kesejahteraan BAZNAS (IKB) ke dalam bentuk aturan logika (*Business Logic*). 

Secara garis besar, proses penentuan status kesejahteraan mustahik pasca-penyaluran dibagi ke dalam dua tahap algoritma berurutan, yaitu perhitungan Rasio Had Kifayah (Tahap Pertama) dan pengujian Stabilitas Kemandirian (Tahap Kedua).

### A. Tahap Pertama: Perhitungan Pemenuhan Kebutuhan Material (CIBEST)

Sistem akan terlebih dahulu mengukur nilai kecukupan *Material Value* ($MV$) mustahik pada saat periode evaluasi. Pengukuran ini dihitung dengan membandingkan **Total Pemasukan/Pendapatan Bulanan** terhadap **Total Pengeluaran Kebutuhan Pokok** (yang diasumsikan sebagai batas *Had Kifayah* atau batas miskin materi).

Secara sistematis, algoritma menghitung rasio ekonomi dengan rumusan berikut:

$$ Rasio\_Ekonomi = \frac{Pendapatan\_Bulanan}{Pengeluaran\_Kebutuhan\_Pokok} $$

Hasil perhitungan rasio matematis ini bertindak sebagai gerbang pengujian awal:
* Jika rasio **kurang dari 1.0**, maka mustahik secara materiil masih berada dalam kondisi defisit absolut (Pengeluaran > Pemasukan).
* Jika rasio **sama dengan atau lebih dari 1.0**, maka kebutuhan minimum mustahik untuk bertahan hidup sebenarnya telah terpenuhi.

### B. Tahap Kedua: Evaluasi Kemandirian dan Predikat Akhir (IKB)

Nilai rasio pengujian dari Tahap Pertama selanjutnya akan diproses paralel bersama dengan dua indikator Boolean (Benar/Salah) yang berasal dari Indeks Kemandirian riil BAZNAS:
1. **Adanya Hutang Baru:** Melambangkan pengeluaran "siluman" dan kerentanan keuangan yang salah urus.
2. **Tumbuhnya Tabungan/Aset:** Melambangkan penyisihan modal dan kemampuan protektif.

Sistem kemudian mengeksekusi struktur algoritma pengkondisian (`If-Else Statement`) untuk melahirkan salah satu dari tiga predikat final *Status Kesejahteraan* berikut:

#### 1. Kategori Status "Menurun" (Rentan Mutlak)
Status ini disematkan secara mutlak oleh sistem jika mustahik melanggar indikator keamanan finansial:
* **Kondisi Dasar:** Rasio Ekonomi $< 1.0$ (Besar pasak daripada tiang).
* **Kondisi Alternatif:** Jika rasio sebenarnya baik ($\ge 1.0$) *namun* mustahik justru melaporkan jerat **Hutang Konsumtif Baru**. Dalam ilmu manajemen zakat, pembukaan hutang konsumerisme baru diartikan sebagai kegagalan mandiri pasca-zakat berapapun pendapatannya.

#### 2. Kategori Status "Stabil" (Tercukupi Pangan)
Sistem menetapkan predikat "Stabil" jika penyaluran zakat produktif berhasil membuat mustahik merdeka dari kemiskinan kelaparan, namun secara performa industri belum beranjak naik:
* **Syarat 1:** Rasio Ekonomi $\ge 1.0$ (Pendapatan mengungguli kebutuhan pokok).
* **Syarat 2:** Sepenuhnya terbebas dari *Hutang Lanjutan* (Hutang tambahan = Salah).
* **Syarat 3:** Belum mampu mengamankan *Tabungan Baru* atau modal ekspansi lanjutan secara nyata (Tabungan tambahan = Salah).

#### 3. Kategori Status "Berkembang" (Tahap Menuju Mandiri / Muzakki)
Status ini merupakan predikat keberhasilan tertinggi sistem yang disematkan apabila profil Mustahik dinilai telah kokoh ketahanan ekonominya. Syarat ketat berantai yang harus dilewati adalah:
* **Syarat 1:** Rasio Ekonomi $\ge 1.0$.
* **Syarat 2:** Sepenuhnya terbebas dari jerat *Hutang*.
* **Syarat 3:** Mampu membuktikan keberadaan *Tabungan Ekstra* dari laba bersih usaha. Status puncak ini adalah muara validasi di mana Mustahik dapat direkomendasikan sistem untuk naik pangkat/dikeluarkan dari daftar penerima rutin tahun depan.
