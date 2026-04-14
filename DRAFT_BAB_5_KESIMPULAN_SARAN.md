# BAB V
# KESIMPULAN DAN SARAN

## 5.1 Kesimpulan
Berdasarkan hasil perancangan, implementasi, dan pengujian yang telah dilakukan pada Sistem Penyeleksi Mustahik Penerima Zakat menggunakan metode MOORA, maka dapat ditarik beberapa kesimpulan sebagai berikut:

1.  **Keberhasilan Pengembangan Sistem:** Telah berhasil dibangun sistem pendukung keputusan (SPK) berbasis web yang mampu mengotomatisasi proses seleksi prioritas penerima manfaat zakat di LAZISMU. Sistem ini mengintegrasikan peran Manajer, Surveyor, Mustahik, dan Muzakki dalam satu platform yang terpadu.
2.  **Efektivitas Metode MOORA:** Implementasi algoritma MOORA terbukti efektif dalam memberikan rekomendasi peringkat mustahik secara objektif dan akurat. Metode ini mampu mengolah berbagai sub-kriteria kompleks (kualitatif dan kuantitatif) menjadi skor optimasi tunggal (Yi) yang memudahkan pengambilan keputusan.
3.  **Stabilitas dan Sensitivitas Keputusan:** Melalui analisis sensitivitas, ditemukan bahwa kriteria **Kelayakan Hunian (C3)** merupakan indikator paling sensitif yang mampu mengubah konstelasi peringkat utama, sedangkan kriteria **Pendidikan (C1)** dan **Kesehatan (C2)** bersifat kokoh (*robust*) terhadap perubahan bobot.
4.  **Tingkat Penerimaan Pengguna (UAT):** Berdasarkan pengujian *User Acceptance Testing*, sistem mendapatkan respon positif dari seluruh pemangku kepentingan dengan persentase skor rata-rata di atas **80% (Kategori Baik s.d Sangat Baik)**. Hal ini menunjukkan bahwa sistem mudah digunakan, transparan, dan sesuai dengan kebutuhan operasional LAZISMU.
5.  **Validitas Fungsional:** Hasil pengujian *Black Box* menunjukkan bahwa seluruh fitur inti sistem, mulai dari manajemen program, input survei, hingga modul penentuan pemenang, telah berfungsi 100% sesuai dengan hasil yang diharapkan tanpa ditemukan error kritikal.
6.  **Manajemen Kriteria Dinamis:** Sistem memberikan fleksibilitas penuh bagi pengguna (Admin/Manajer) untuk menambah, menghapus, atau mengedit kriteria beserta bobot dan aspek penilaian secara *real-time* melalui antarmuka, tanpa memerlukan modifikasi pada kode sumber dasar (source code).

## 5.2 Saran
Meskipun sistem telah berjalan dengan baik, terdapat beberapa saran untuk pengembangan lebih lanjut guna meningkatkan kualitas dan cakupan pemanfaatan sistem:

1.  **Pengembangan Platform Mobile:** Mengembangkan aplikasi versi mobile (Android/iOS) khusus untuk role Surveyor guna memudahkan proses input data survei secara langsung di lokasi mustahik tanpa bergantung pada peramban web desktop.
2.  **Integrasi Geolocation:** Menambahkan fitur pemetaan (GIS) untuk memvisualisasikan sebaran lokasi mustahik secara geografis, sehingga pihak LAZISMU dapat melakukan analisis sebaran bantuan yang lebih merata tiap wilayah.
3.  **Sinkronisasi API:** Melakukan integrasi data melalui API dengan database internal Muhammadiyah atau instansi pemerintah terkait untuk memvalidasi data mustahik secara *real-time* (seperti data kependudukan atau bantuan sosial lainnya).
4.  **Peningkatan Keamanan Data:** Menerapkan enkripsi data yang lebih ketat pada dokumen bukti pendukung mustahik guna menjaga kerahasiaan informasi sensitif sesuai dengan standar perlindungan data pribadi.
5.  **Otomatisasi Laporan Berkala:** Menambahkan modul laporan komprehensif (export otomatis ke PDF/Excel) untuk pelaporan rutin bulanan/tahunan kepada pimpinan LAZISMU maupun stakeholder eksternal dengan format yang terstandarisasi.
