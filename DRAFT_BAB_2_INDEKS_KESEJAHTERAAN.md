## 2.X Indeks Kesejahteraan Mustahik

Dalam pengelolaan dana zakat, pengukuran kesejahteraan mustahik (penerima zakat) merupakan indikator krusial untuk mengevaluasi ketepatan sasaran dan keberhasilan program pendayagunaan zakat. Berbeda dengan pandangan ekonomi konvensional yang seringkali hanya mengukur garis kemiskinan berdasarkan material (pendapatan), ekonomi Islam menilai kesejahteraan melalui pendekatan holistik yang mencakup aspek material dan kelayakan hidup yang mandiri secara syariah [^1]. 

Untuk memberikan fitur pemantauan (*Monitoring dan Evaluasi / MONEV*) yang terkomputerisasi dan tidak subjektif, penelitian ini mengadopsi sintesis (gabungan) dari dua model pengukuran terkemuka yang diakui secara nasional, yaitu **Model CIBEST** (*Center of Islamic Business and Economic Studies*) dan **Indeks Kesejahteraan BAZNAS (IKB)**.

### 2.X.1 Model CIBEST (Pendekatan Material)

Model CIBEST yang dikembangkan oleh Beik dan Arsyianti (2015) adalah alat ukur kemiskinan dan kesejahteraan yang didesain khusus berdasarkan prinsip Islam [^2]. Model ini membagi kondisi mustahik ke dalam empat kuadran berdasarkan dua variabel utama: Nilai Material (*Material Value*/MV) dan Nilai Spiritual (*Spiritual Value*/SV). 

Dalam konteks evaluasi pasca-penyaluran dana zakat pada sistem ini, parameter utama yang diadopsi adalah rasio **Kebutuhan Material Dasar (Had Kifayah)**. Had Kifayah merupakan kecukupan batas dasar bagi seseorang untuk memenuhi kebutuhan pokok dirinya dan keluarganya secara wajar [^3]. 

Secara matematis, penentuan garis kemiskinan material pada Model CIBEST dirumuskan sebagai berikut:

$$ MV = \sum_{i=1}^{n} P_i Q_i $$

*Keterangan:*
- $MV$ = Total pendapatan material aktual keluarga.
- $P_i$ = Harga barang/jasa kebutuhan pokok ke-$i$.
- $Q_i$ = Kuantitas barang/jasa kebutuhan pokok ke-$i$ (standar minimum).

Seseorang dikategorikan sebagai "Miskin Material" jika total pendapatannya ($MV$) lebih kecil dari Standar Had Kifayah ($MV^*$). Konsep rasio antara Pendapatan Aktual ($MV$) dibandingkan dengan Had Kifayah ($MV^*$) ini digunakan sebagai indikator utama dalam mengukur dampak penyaluran zakat.

### 2.X.2 Indeks Kesejahteraan BAZNAS (Pendekatan Kemandirian)

Untuk mengukur apakah kondisi ekonomi mustahik berada dalam status "Menurun", "Stabil", atau "Berkembang", pendekatan material dari CIBEST disempurnakan menggunakan konsep **Indeks Kesejahteraan BAZNAS (IKB)**. IKB dirancang oleh Pusat Kajian Strategis (Puskas) BAZNAS sebagai indikator ukuran kinerja program zakat di Indonesia [^4].

IKB merupakan angka indeks komposit yang terdiri dari Indeks CIBEST, Modifikasi Indeks Pembangunan Manusia (Kesehatan dan Pendidikan), dan **Indeks Kemandirian**. Indeks Kemandirian sendiri memiliki peran sentral dalam menentukan ketahanan (resiliensi) ekonomi mustahik. 

Parameter Indeks Kemandirian mengukur kemampuan mustahik untuk keluar dari jerat kemiskinan dan tidak bergantung kembali pada bantuan eksternal [^5]. Variabel pembentuk kemandirian ini melingkupi:
1. **Pekerjaan / Bisnis:** Keberlanjutan sumber penghasilan.
2. **Skala Aset dan Tabungan:** Kemampuan untuk menyisihkan kelebihan pendapatan menjadi aset likuid maupun non-likuid.
3. **Stabilitas Rasio Hutang:** Kemampuan bertahan dari kebutuhan konsumtif tanpa menambah hutang tak tertolong.

### 2.X.3 Sintesis Indikator untuk Monitoring dan Evaluasi (MONEV)

Berdasarkan kombinasi Model CIBEST dan IKB, penelitian ini merumuskan gabungan metrik indikator untuk menjalankan fitur *Monitoring dan Evaluasi (MONEV)* pasca-penyaluran. Penggabungan rumusan ini dirancang agar sistem terkomputerisasi dapat mengkategorikan status perkembangan profil mustahik berdasarkan indeks kesejahteraan secara spesifik:

1. **Rasio Kecukupan Pendapatan Material:** 
   Merupakan adaptasi nilai $MV$ pada Model CIBEST. Mengukur rasio antara total pendapatan keluarga terhadap pengeluaran kebutuhan pokok bulanan pada periode evaluasi. Rasio $< 1$ menunjukkan profil defisit (Menurun), rasio $= 1$ menunjukkan titik stabil, dan rasio $> 1$ menunjukkan ekonomi yang berkembang [^2].
   
2. **Perkembangan Pemenuhan Kualitas Hidup Dasar:**
   Adopsi dari pilar kesehatan dan pendidikan (Modifikasi IPM) dalam IKB. Diukur dari kemampuan mustahik membiayai utilitas dasar pendidikan dan kesehatan tanpa terbebani [^4].

3. **Stabilitas Beban Hutang Konsumtif:**
   Turunan dari indikator kemandirian IKB sisi beban. Digunakan untuk mendeteksi beban ekonomi yang menyertai pendapatan. Semakin tinggi rasio hutang baru pasca-penyaluran terhadap pendapatan bulanan, maka status ketahanan ekonomi mustahik dinilai "Menurun" [^5].

4. **Pertumbuhan Aset Likuid / Tabungan:**
   Turunan positif dari indikator kemandirian IKB. Mustahik dengan ekonomi "Berkembang" secara empiris diidentifikasi dari ada atau tidaknya kemampuan mereka menyisihkan tabungan darurat dari pendapatan modal zakat produktif [^4].

Dengan mengintegrasikan kedua pendekatan akademik tersebut ke dalam modul MONEV, Sistem Zakat ini memiliki kapabilitas lebih dari sekadar penyeleksian penerima, melainkan juga melacak dampak keberhasilan program dana zakat (*Zakat Produktif*) dalam mengentaskan keterpurukan secara multidimensi, valid, dan berlandaskan akuntansi syariah.

---

### Referensi dan Catatan Kaki

[^1]: Obaidullah, M. (2005). *Islamic Financial Services*. King Abdulaziz University, Jeddah. (Pengantar bahwa ekonomi Islam holistik pada ibadah dan material).
[^2]: Beik, I. S., & Arsyianti, L. D. (2015). "CIBEST model as a measurement of poverty and welfare indices from an Islamic perspective". *Al-Iqtishad: Jurnal Ilmu Ekonomi Syariah*, 7(2), 191-204. Tautan: [https://www.researchgate.net/publication/313467406_CIBEST_Model_as_a_Measurement_of_Poverty_and_Welfare_Indices_from_Islamic_Perspective](https://doi.org/10.15408/aiq.v7i2.1586)
[^3]: PUSKAS BAZNAS. (2018). *Kajian Had Kifayah 2018*. Pusat Kajian Strategis BAZNAS RI, Jakarta. Tautan Utama Puskas: [https://puskasbaznas.com/publications/books](https://puskasbaznas.com/publications/books)
[^4]: PUSKAS BAZNAS. (2020). *Indeks Kesejahteraan BAZNAS (IKB)*. Pusat Kajian Strategis Badan Amil Zakat Nasional (BAZNAS) Republik Indonesia, Jakarta. Tautan: [https://puskasbaznas.com/index.php/puskasprojects/ikb](https://puskasbaznas.com/publications/books/1368-indeks-kesejahteraan-baznas-ikb-2020)
[^5]: Pratama, Y. C. (2015). "Peran Zakat Dalam Menanggulangi Kemiskinan (Studi Kasus Program Zakat Produktif Pada Badan Amil Zakat Nasional)". *Tauhidinomics*, 1(1), 93-104. Tautan alternatif Jurnal Kebaznasan: [https://jurnal.baznas.go.id/](https://e-journal.unair.ac.id/JESTT)
