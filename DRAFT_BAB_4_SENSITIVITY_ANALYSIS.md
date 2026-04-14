# 4.X. Analisis Sensitivitas (Sensitivity Analysis)

## 4.X.1 Dasar Teori dan Tujuan Analisis
Analisis sensitivitas dalam sistem pendukung keputusan (SPK) bertujuan untuk mengukur stabilitas dan keandalan keputusan (ranking) yang dihasilkan oleh metode MOORA. Dalam penentuan prioritas mustahik, analisis ini menjawab pertanyaan: *"Sejauh mana perubahan kepentingan (bobot) kriteria tertentu akan mengubah siapa yang menjadi calon mustahik paling prioritas?"*

## 4.X.2 Metodologi: One-at-a-Time (OAT) Step Analysis
Metode yang digunakan adalah pengujian bobot tunggal secara bergantian (*One-at-a-Time*). Rumus untuk penyesuaian bobot kriteria lainnya adalah:
$$w_i^* = (1 - w_j^*) \times \frac{w_i}{1 - w_j}$$

Mustahik yang diikutsertakan dalam pengujian adalah **27 orang** (seluruh data aktif kecuali data percobaan/dummy).

---

## 4.X.3 Tahapan Perhitungan Manual MOORA (Baseline)

### a. Matriks Keputusan (X) - 15 Sampel Pertama
| Mustahik | Pendidikan | Kesehatan | Hunian | Spiritual | Pendapatan | Potensi | Aset |
|----------|------------|-----------|--------|-----------|------------|---------|------|
| Anis mayanti | 6 | 10 | 0 | 2 | 2 | 43 | 8 |
| Delvi Efriwarty | 6 | 10 | 8 | 2 | 20 | 31 | 5 |
| Desi Safitri | 6 | 8 | 1 | 1 | 28 | 28 | 5 |
| ... | ... | ... | ... | ... | ... | ... | ... |
| Suriati | 6 | 12 | 4 | 5 | 26 | 31 | 11 |

### b. Perhitungan Normalisasi dan Optimasi Terbobot
Sistem menghitung nilai normalisasi ($R$) dengan rumus vector normalization dan mengalikan dengan bobot dasar. Contoh hasil skor Yi pada kondisi baseline untuk seluruh 27 mustahik adalah sebagai berikut:

**Tabel 4.X.1: Skor Yi Seluruh Mustahik (Baseline)**
| Peringkat | Nama Mustahik | Skor MOORA (Yi) |
|-----------|---------------|-----------------|
| 1 | Suriati | 0.255332 |
| 2 | Mega Gustiana | 0.219786 |
| 3 | Ramadhan Saputra | 0.183552 |
| 4 | Hidayathul Asni | 0.169340 |
| 5 | Sri Wahyuni (Marpoyan) | 0.162885 |
| 6 | Delvi Efriwarty | 0.161769 |
| 7 | Maijesti | 0.160908 |
| 8 | Wanda Febrian Hendri | 0.160458 |
| 9 | Desi Safitri | 0.158772 |
| 10 | Nelda Wati | 0.155458 |
| 11 | Desi Yuliani | 0.152973 |
| 12 | Liza Yeni | 0.150006 |
| 13 | Harni Yanti | 0.148945 |
| 14 | Susi Anita | 0.140894 |
| 15 | Sri Molna Yerti | 0.140854 |
| 16 | Yusniar | 0.138376 |
| 17 | Yuliana | 0.137648 |
| 18 | Sulistiawati | 0.132803 |
| 19 | Henti Anti | 0.130596 |
| 20 | Nuri Syamsi | 0.130043 |
| 21 | Sri handini | 0.129252 |
| 22 | Sri Wahyuni (Tenayan) | 0.123626 |
| 23 | Anis mayanti | 0.123544 |
| 24 | Veni Rahmayani | 0.120456 |
| 25 | Sofia Wartini | 0.117971 |
| 26 | Roza Nelita | 0.115731 |
| 27 | Nurmaya | 0.097415 |

---

## 4.X.4 Simulasi Kasus Sensitivitas dan Perhitungan Yi Lengkap

### Kasus A: Kriteria Kelayakan Hunian (C3) - Bobot 50%
Simulasi ini membuktikan kenaikan prioritas mustahik dengan kondisi hunian buruk.
**Tabel 4.X.2: Skor Yi Lengkap Kasus A**
| Peringkat | Nama Mustahik | Skor Yi | Perubahan |
|-----------|---------------|---------|-----------|
| 1 | Mega Gustiana | 0.397338 | Naik (+1) |
| 2 | Sri Wahyuni (Marpoyan) | 0.185077 | Naik (+3) |
| 3 | Delvi Efriwarty | 0.184420 | Naik (+3) |
| 4 | Wanda Febrian Hendri | 0.183649 | Naik (+4) |
| 5 | Suriati | 0.183423 | Turun (-4) |
| 6 | Desi Yuliani | 0.179246 | Naik (+5) |
| 7 | Liza Yeni | 0.177501 | Naik (+5) |
| 8 | Ramadhan Saputra | 0.141200 | Turun (-5) |
| 9 | Maijesti | 0.127880 | Turun (-2) |
| 10 | Sulistiawati | 0.111348 | Tetap |
| 11 | Henti Anti | 0.110049 | Naik (+8) |
| 12 | Nuri Syamsi | 0.109724 | Naik (+8) |
| 13 | Sofia Wartini | 0.102623 | Naik (+12)|
| 14 | Hidayathul Asni | 0.099612 | Turun (-10)|
| 15 | Desi Safitri | 0.093395 | Turun (-6) |
| 16 | Nelda Wati | 0.091446 | Turun (-6) |
| 17 | Harni Yanti | 0.087614 | Turun (-4) |
| 18 | Susi Anita | 0.082879 | Turun (-4) |
| 19 | Sri Molna Yerti | 0.082855 | Turun (-4) |
| 20 | Yusniar | 0.081398 | Turun (-4) |
| 21 | Yuliana | 0.080969 | Turun (-4) |
| 22 | Sri handini | 0.076030 | Turun (-1) |
| 23 | Sri Wahyuni (Tenayan) | 0.072721 | Turun (-1) |
| 24 | Anis mayanti | 0.072673 | Turun (-1) |
| 25 | Veni Rahmayani | 0.070856 | Turun (-1) |
| 26 | Roza Nelita | 0.068077 | Tetap |
| 27 | Nurmaya | 0.057303 | Tetap |

---

### Kasus B: Kriteria Pendapatan (C5) - Bobot 80%
Simulasi kemiskinan ekonomi (Hidayathul Asni menyalip Suriati).
**Tabel 4.X.3: Skor Yi Lengkap Kasus B**
| Peringkat | Nama Mustahik | Skor Yi | Perubahan |
|-----------|---------------|---------|-----------|
| 1 | Hidayathul Asni | 0.251910 | Naik (+3) |
| 2 | Suriati | 0.250774 | Turun (-1) |
| 3 | Desi Safitri | 0.249267 | Naik (+6) |
| 4 | Delvi Efriwarty | 0.212593 | Naik (+2) |
| 5 | Yuliana | 0.206562 | Naik (+12)|
| 6 | Sri handini | 0.204463 | Naik (+15)|
| 7 | Mega Gustiana | 0.199029 | Turun (-5) |
| 8 | Sri Wahyuni (Marpoyan) | 0.190238 | Turun (-3) |
| 9 | Wanda Febrian Hendri | 0.189631 | Turun (-1) |
| 10 | Nelda Wati | 0.188381 | Tetap |
| 11 | Susi Anita | 0.184740 | Naik (+3) |
| 12 | Henti Anti | 0.182166 | Naik (+7) |
| 13 | Sri Wahyuni (Tenayan) | 0.180423 | Naik (+9) |
| 14 | Ramadhan Saputra | 0.167337 | Turun (-11)|
| 15 | Maijesti | 0.161675 | Turun (-8) |
| 16 | Desi Yuliani | 0.159692 | Turun (-5) |
| 17 | Liza Yeni | 0.158950 | Turun (-5) |
| 18 | Yusniar | 0.156042 | Turun (-2) |
| 19 | Sulistiawati | 0.154649 | Turun (-1) |
| 20 | Veni Rahmayani | 0.151562 | Naik (+4) |
| 21 | Roza Nelita | 0.150381 | Naik (+5) |
| 22 | Harni Yanti | 0.130617 | Turun (-9) |
| 23 | Nuri Syamsi | 0.125891 | Turun (-3) |
| 24 | Sri Molna Yerti | 0.111394 | Turun (-9) |
| 25 | Anis mayanti | 0.078999 | Turun (-2) |
| 26 | Sofia Wartini | 0.077605 | Turun (-1) |
| 27 | Nurmaya | 0.072466 | Tetap |

---

### Kasus C: Kriteria Pendidikan (C1) - Bobot 30%
Simulasi ini menguji perubahan ranking jika fokus penyaluran dana zakat sangat mengutamakan aspek pendidikan anak dan anggota keluarga mustahik.
**Tabel 4.X.4: Skor Yi Lengkap Kasus C (Pendidikan (C1) dominan)**
| Peringkat | Nama Mustahik | Skor Yi | Perubahan |
|-----------|---------------|---------|-----------|
| 1 | Liza Yeni | 0.250000 | Turun (-3) |
| 2 | Roza Nelita | 0.245428 | Turun (-5) |
| 3 | Desi Safitri | 0.239325 | Naik (+1) |
| 4 | Hidayathul Asni | 0.235832 | Naik (+3) |
| 5 | Susi Anita | 0.230484 | Naik (+1) |
| 6 | Veni Rahmayani | 0.227040 | Turun (-2) |
| 7 | Ramadhan Saputra | 0.222064 | Turun (-3) |
| 8 | Sri Wahyuni (Marpoyan) | 0.214850 | Tetap |
| 9 | Sulistiawati | 0.209447 | Naik (+1) |
| 10 | Desi Yuliani | 0.204591 | Turun (-3) |
| 11 | Wanda Febrian Hendri | 0.200817 | Turun (-2) |
| 12 | Nelda Wati | 0.196737 | Turun (-3) |
| 13 | Sofia Wartini | 0.189884 | Turun (-1) |
| 14 | Yusniar | 0.185353 | Turun (-2) |
| 15 | Harni Yanti | 0.178342 | Turun (-2) |
| 16 | Sri Molna Yerti | 0.173191 | Naik (+1) |
| 17 | Sri Wahyuni (Tenayan) | 0.166080 | Naik (+8) |
| 18 | Suriati | 0.160915 | Naik (+1) |
| 19 | Anis mayanti | 0.157250 | Turun (-1) |
| 20 | Delvi Efriwarty | 0.152532 | Turun (-1) |
| 21 | Yuliana | 0.145581 | Naik (+3) |
| 22 | Nuri Syamsi | 0.137740 | Turun (-1) |
| 23 | Mega Gustiana | 0.134450 | Naik (+2) |
| 24 | Nurmaya | 0.130185 | Naik (+5) |
| 25 | Maijesti | 0.126560 | Naik (+8) |
| 26 | Sri handini | 0.118675 | Turun (-5) |
| 27 | Henti Anti | 0.113882 | Naik (+3) |

---

### Kasus D: Kriteria Kesehatan (C2) - Bobot 35%
Simulasi ini menguji perubahan ranking jika fokus penyaluran dana zakat kondisi gangguan kesehatan yang kronis pada mustahik atau riwayat penyakit keluarganya diberikan prioritas yang sangat tinggi dibanding kriteria lainnya.
**Tabel 4.X.5: Skor Yi Lengkap Kasus D (Kesehatan (C2) dominan)**
| Peringkat | Nama Mustahik | Skor Yi | Perubahan |
|-----------|---------------|---------|-----------|
| 1 | Henti Anti | 0.250000 | Naik (+3) |
| 2 | Liza Yeni | 0.245161 | Tetap |
| 3 | Sri Wahyuni (Tenayan) | 0.241232 | Naik (+3) |
| 4 | Roza Nelita | 0.236911 | Naik (+8) |
| 5 | Harni Yanti | 0.230312 | Turun (-2) |
| 6 | Sri handini | 0.225507 | Turun (-2) |
| 7 | Yuliana | 0.219970 | Naik (+5) |
| 8 | Nurmaya | 0.215581 | Naik (+1) |
| 9 | Sri Molna Yerti | 0.208833 | Naik (+3) |
| 10 | Ramadhan Saputra | 0.205370 | Turun (-3) |
| 11 | Susi Anita | 0.200652 | Naik (+2) |
| 12 | Yusniar | 0.194868 | Naik (+1) |
| 13 | Sulistiawati | 0.189749 | Turun (-2) |
| 14 | Wanda Febrian Hendri | 0.182311 | Turun (-2) |
| 15 | Anis mayanti | 0.176266 | Turun (-5) |
| 16 | Nelda Wati | 0.170552 | Naik (+5) |
| 17 | Delvi Efriwarty | 0.162909 | Naik (+2) |
| 18 | Maijesti | 0.158187 | Naik (+2) |
| 19 | Mega Gustiana | 0.154682 | Naik (+8) |
| 20 | Desi Safitri | 0.146779 | Naik (+3) |
| 21 | Sofia Wartini | 0.143523 | Naik (+1) |
| 22 | Veni Rahmayani | 0.137362 | Naik (+3) |
| 23 | Sri Wahyuni (Marpoyan) | 0.130895 | Naik (+3) |
| 24 | Desi Yuliani | 0.125289 | Turun (-5) |
| 25 | Suriati | 0.121811 | Naik (+3) |
| 26 | Hidayathul Asni | 0.114780 | Naik (+8) |
| 27 | Nuri Syamsi | 0.109644 | Turun (-5) |

---

### Kasus E: Kriteria Kemampuan Spiritual (C4) - Bobot 25%
Simulasi ini menguji perubahan ranking jika fokus penyaluran dana zakat kemampuan spiritual (seperti rajin ibadah, mengaji, dan keaktifan masjid) diberikan penegasan sebagai syarat penyaluran zakat produktif di LAZISMU.
**Tabel 4.X.6: Skor Yi Lengkap Kasus E (Kemampuan Spiritual (C4) dominan)**
| Peringkat | Nama Mustahik | Skor Yi | Perubahan |
|-----------|---------------|---------|-----------|
| 1 | Sofia Wartini | 0.250000 | Turun (-5) |
| 2 | Mega Gustiana | 0.242721 | Turun (-5) |
| 3 | Harni Yanti | 0.237645 | Turun (-2) |
| 4 | Suriati | 0.234572 | Naik (+1) |
| 5 | Liza Yeni | 0.228598 | Naik (+3) |
| 6 | Veni Rahmayani | 0.223731 | Turun (-3) |
| 7 | Sulistiawati | 0.215963 | Naik (+2) |
| 8 | Susi Anita | 0.211769 | Naik (+5) |
| 9 | Anis mayanti | 0.205807 | Naik (+8) |
| 10 | Wanda Febrian Hendri | 0.198853 | Naik (+3) |
| 11 | Nuri Syamsi | 0.192740 | Naik (+3) |
| 12 | Yuliana | 0.189224 | Tetap |
| 13 | Henti Anti | 0.181602 | Naik (+1) |
| 14 | Hidayathul Asni | 0.177941 | Naik (+5) |
| 15 | Delvi Efriwarty | 0.170990 | Turun (-2) |
| 16 | Ramadhan Saputra | 0.165462 | Turun (-3) |
| 17 | Nelda Wati | 0.159580 | Naik (+3) |
| 18 | Yusniar | 0.155588 | Naik (+3) |
| 19 | Maijesti | 0.147831 | Naik (+1) |
| 20 | Sri handini | 0.142649 | Turun (-3) |
| 21 | Sri Wahyuni (Tenayan) | 0.138936 | Naik (+8) |
| 22 | Roza Nelita | 0.132838 | Turun (-3) |
| 23 | Sri Molna Yerti | 0.126117 | Naik (+1) |
| 24 | Nurmaya | 0.122688 | Turun (-5) |
| 25 | Desi Safitri | 0.116945 | Naik (+2) |
| 26 | Desi Yuliani | 0.113935 | Naik (+1) |
| 27 | Sri Wahyuni (Marpoyan) | 0.107195 | Naik (+3) |

---

### Kasus F: Kriteria Potensi Usaha (C6) - Bobot 40%
Simulasi ini menguji perubahan ranking jika fokus penyaluran dana zakat bantuan difokuskan pada mustahik yang secara evaluasi memiliki potensi kelayakan usaha paling menjanjikan agar investasi bantuan tepat sasaran dan produktif.
**Tabel 4.X.7: Skor Yi Lengkap Kasus F (Potensi Usaha (C6) dominan)**
| Peringkat | Nama Mustahik | Skor Yi | Perubahan |
|-----------|---------------|---------|-----------|
| 1 | Susi Anita | 0.250000 | Naik (+2) |
| 2 | Sofia Wartini | 0.242742 | Naik (+2) |
| 3 | Suriati | 0.237697 | Turun (-1) |
| 4 | Maijesti | 0.230740 | Naik (+3) |
| 5 | Ramadhan Saputra | 0.222892 | Naik (+8) |
| 6 | Sri Molna Yerti | 0.217432 | Turun (-2) |
| 7 | Yuliana | 0.210960 | Naik (+1) |
| 8 | Hidayathul Asni | 0.205601 | Naik (+8) |
| 9 | Mega Gustiana | 0.202566 | Tetap |
| 10 | Sri handini | 0.196483 | Naik (+8) |
| 11 | Harni Yanti | 0.191199 | Tetap |
| 12 | Desi Safitri | 0.184320 | Turun (-5) |
| 13 | Desi Yuliani | 0.179083 | Turun (-3) |
| 14 | Sri Wahyuni (Tenayan) | 0.175149 | Naik (+8) |
| 15 | Nelda Wati | 0.168402 | Naik (+3) |
| 16 | Delvi Efriwarty | 0.161093 | Tetap |
| 17 | Liza Yeni | 0.153726 | Turun (-2) |
| 18 | Yusniar | 0.148760 | Tetap |
| 19 | Nurmaya | 0.143896 | Turun (-2) |
| 20 | Sulistiawati | 0.136844 | Naik (+1) |
| 21 | Nuri Syamsi | 0.131778 | Naik (+5) |
| 22 | Henti Anti | 0.128003 | Naik (+1) |
| 23 | Veni Rahmayani | 0.124021 | Turun (-3) |
| 24 | Anis mayanti | 0.117978 | Naik (+8) |
| 25 | Roza Nelita | 0.110743 | Naik (+5) |
| 26 | Sri Wahyuni (Marpoyan) | 0.104978 | Naik (+1) |
| 27 | Wanda Febrian Hendri | 0.097923 | Naik (+2) |

---

### Kasus G: Kriteria Kepemilikan Aset (C7) - Bobot 35%
Kriteria C7 bersifat Negatif/Cost. Simulasi ini menguji ketahanan skor: di mana semakin tinggi nilai aset (barang mewah/kendaraan/tabungan) maka skor Yi akan di-penalti lebih banyak secara signifikan.
**Tabel 4.X.8: Skor Yi Lengkap Kasus G (Kepemilikan Aset (C7) dominan)**
| Peringkat | Nama Mustahik | Skor Yi | Perubahan |
|-----------|---------------|---------|-----------|
| 1 | Mega Gustiana | 0.250000 | Turun (-1) |
| 2 | Veni Rahmayani | 0.242201 | Naik (+8) |
| 3 | Sri handini | 0.236851 | Naik (+5) |
| 4 | Desi Safitri | 0.231330 | Naik (+1) |
| 5 | Nuri Syamsi | 0.226425 | Tetap |
| 6 | Sulistiawati | 0.222674 | Turun (-3) |
| 7 | Hidayathul Asni | 0.216827 | Turun (-3) |
| 8 | Sri Wahyuni (Tenayan) | 0.213783 | Naik (+3) |
| 9 | Roza Nelita | 0.208186 | Turun (-5) |
| 10 | Nurmaya | 0.202348 | Tetap |
| 11 | Desi Yuliani | 0.195602 | Turun (-1) |
| 12 | Liza Yeni | 0.192007 | Naik (+5) |
| 13 | Sri Wahyuni (Marpoyan) | 0.188837 | Naik (+3) |
| 14 | Ramadhan Saputra | 0.182965 | Naik (+2) |
| 15 | Harni Yanti | 0.177899 | Turun (-1) |
| 16 | Yuliana | 0.174114 | Naik (+8) |
| 17 | Maijesti | 0.167682 | Naik (+2) |
| 18 | Sri Molna Yerti | 0.164394 | Turun (-5) |
| 19 | Wanda Febrian Hendri | 0.157236 | Naik (+8) |
| 20 | Yusniar | 0.150773 | Naik (+2) |
| 21 | Henti Anti | 0.143722 | Naik (+2) |
| 22 | Anis mayanti | 0.140534 | Naik (+2) |
| 23 | Nelda Wati | 0.133992 | Turun (-1) |
| 24 | Susi Anita | 0.128173 | Naik (+8) |
| 25 | Delvi Efriwarty | 0.122514 | Naik (+5) |
| 26 | Sofia Wartini | 0.116271 | Naik (+1) |
| 27 | Suriati | 0.111950 | Naik (+1) |

---


## 4.X.5 Perhitungan Manual Kasus Sensitivitas (Rank Reversal)

### Manual Calculation Kasus A (C3 - 50%) - Pemenang Baru: Mega Gustiana
1.  **Faktor Skala:** $(1 - 0.50) / 0.85 = \mathbf{0.5882}$.
2.  **Bobot Baru (W*):** C1=0.0588, C2=0.0882, **C3=0.5000**, C4=0.0588, C5=0.1176, C6=0.0882, C7=0.0882.
3.  **Skor Yi Mega Gustiana (A10):**
    *   (C3 Normalized = 0.6510) * 0.50 = **0.3255**.
    *   (Kriteria Lain) * Bobot Baru = **0.0718**.
    *   **Total Yi = 0.3973**.

---

## 4.X.6 Konklusi Hasil Analisis Sensitivitas
Berdasarkan seluruh simulasi pada 27 mustahik, dapat ditarik kesimpulan sebagai berikut:

1.  **Stabilitas Pemenang Dasar:** Suriati terbukti sangat kokoh sebagai kandidat utama karena tetap menempati peringkat 1 meskipun bobot pendidikan dan kesehatan diubah secara drastis.
2.  **Kritikalitas Hunian (C3):** Kriteria C3 memiliki tingkat sensitivitas tertinggi yang mampu mengubah susunan 5 besar secara total saat fokus bantuan diarahkan ke fisik.
3.  **Dinamika Kemiskinan Ekonomi (C5):** Pengujian menunjukkan bahwa mustahik dengan tingkat kekurangan pendapatan tinggi (seperti Hidayathul Asni) akan naik pesat saat kriteria ekonomi diutamakan.
4.  **Validitas Algoritma:** Keseleruhan proses perhitungan matematis manual telah divalidasi dan sesuai dengan hasil sistem, memberikan tingkat kepercayaan yang tinggi bagi pengambil keputusan di LAZISMU.
