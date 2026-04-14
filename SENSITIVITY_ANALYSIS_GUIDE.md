# Panduan Analisis Sensitivitas (Sensitivity Analysis) - Sistem Zakat MOORA

Dokumen ini menjelaskan dasar teori dan langkah-langkah perhitungan analisis sensitivitas yang telah diimplementasikan ke dalam sistem. Dokumen ini dapat digunakan sebagai referensi untuk penulisan **Bab IV (Hasil dan Pembahasan)** pada skripsi Anda.

## 1. Definisi Analisis Sensitivitas
Analisis sensitivitas dalam Sistem Pendukung Keputusan (SPK) bertujuan untuk mengetahui seberapa stabil atau kuat (robust) hasil perangkingan yang dihasilkan oleh metode MOORA ketika terjadi perubahan pada bobot kriteria.

Jika perubahan kecil pada bobot kriteria menyebabkan perubahan pada urutan alternatif terbaik (Rank 1), maka kriteria tersebut dikatakan **Sensitif**. Sebaliknya, jika urutan tetap sama meskipun bobot diubah, maka sistem dikatakan **Kokoh (Robust)**.

## 2. Metodologi: One-at-a-Time (OAT)
Metode yang diimplementasikan adalah **OAT Step Analysis**, di mana kita mengubah satu bobot kriteria sementara bobot lainnya disesuaikan secara proporsional agar total bobot tetap konstan (misal: tetap berjumlah 1.0 atau 100%).

### Rumus Penyesuaian Bobot
Jika bobot kriteria ke-j ($w_j$) diubah menjadi $w_j^*$, maka bobot kriteria lainnya ($w_i^*$) dihitung dengan:

$$w_i^* = (1 - w_j^*) \times \frac{w_i}{1 - w_j}$$

Dimana:
- $w_j^*$ = Bobot baru kriteria yang sedang diuji.
- $w_i$ = Bobot awal kriteria lainnya.
- $w_j$ = Bobot awal kriteria yang sedang diuji.

## 3. Langkah Perhitungan MOORA (Ulasan)
Untuk setiap skenario perubahan bobot, sistem menghitung ulang:
1. **Normalisasi Matrix (Vector):** $x_{ij}^* = \frac{x_{ij}}{\sqrt{\sum_{i=1}^m x_{ij}^2}}$
2. **Optimasi (Weighted Score):** $y_{ij} = w_j \cdot x_{ij}^*$
3. **Nilai Yi (MOORA Score):** $y_i = \sum \text{Benefit} - \sum \text{Cost}$

## 4. Implementasi File Baru
Saya telah menambahkan dua file utama:
- `src/components/sensitivityAnalysis.ts`: Berisi logika algoritma perhitungan otomatis.
- `src/components/SensitivityAnalysisTester.tsx`: Komponen UI untuk memvisualisasikan data dalam bentuk grafik (`recharts`) dan tabel untuk laporan Anda.

## 5. Cara Penggunaan di Frontend
Anda dapat memanggil komponen tester di halaman mana saja (misal: Dashboard atau Monitoring) dengan cara:

```tsx
import { SensitivityAnalysisTester } from './components/SensitivityAnalysisTester';

// Gunakan di dalam komponen Anda
<SensitivityAnalysisTester 
  candidates={mustahikList} 
  criteria={criteriaList} 
/>
```

## 6. Contoh Interpretasi Data
| Skenario | Bobot C1 | Alternatif Terbaik | Skor MOORA |
|----------|----------|-------------------|------------|
| Baseline | 25% | Mustahik A | 0.4567 |
| Skenario 1 | 40% | Mustahik A | 0.4890 |
| Skenario 2 | 60% | Mustahik B | 0.5120 |

**Analisis:** Karena pada bobot 60% terjadi perubahan rangking (dari A ke B), maka Kriteria C1 dinyatakan memiliki pengaruh yang signifikan terhadap keputusan akhir pemilihan mustahik.
