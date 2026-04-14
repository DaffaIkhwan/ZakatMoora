import random

names = [
    'Suriati', 'Mega Gustiana', 'Ramadhan Saputra', 'Hidayathul Asni', 'Sri Wahyuni (Marpoyan)',
    'Delvi Efriwarty', 'Maijesti', 'Wanda Febrian Hendri', 'Desi Safitri', 'Nelda Wati',
    'Desi Yuliani', 'Liza Yeni', 'Harni Yanti', 'Susi Anita', 'Sri Molna Yerti',
    'Yusniar', 'Yuliana', 'Sulistiawati', 'Henti Anti', 'Nuri Syamsi',
    'Sri handini', 'Sri Wahyuni (Tenayan)', 'Anis mayanti', 'Veni Rahmayani', 'Sofia Wartini',
    'Roza Nelita', 'Nurmaya'
]

cases = [
    ('C', 'Pendidikan (C1)', '30%', '4', 'sangat mengutamakan aspek pendidikan anak dan anggota keluarga mustahik'),
    ('D', 'Kesehatan (C2)', '35%', '5', 'kondisi gangguan kesehatan yang kronis pada mustahik atau riwayat penyakit keluarganya diberikan prioritas yang sangat tinggi dibanding kriteria lainnya'),
    ('E', 'Kemampuan Spiritual (C4)', '25%', '6', 'kemampuan spiritual (seperti rajin ibadah, mengaji, dan keaktifan masjid) diberikan penegasan sebagai syarat penyaluran zakat produktif di LAZISMU'),
    ('F', 'Potensi Usaha (C6)', '40%', '7', 'bantuan difokuskan pada mustahik yang secara evaluasi memiliki potensi kelayakan usaha paling menjanjikan agar investasi bantuan tepat sasaran dan produktif'),
    ('G', 'Kepemilikan Aset (C7)', '35%', '8', 'semakin tinggi nilai aset (barang mewah/kendaraan/tabungan) maka skor Yi akan di-penalti lebih banyak secara signifikan')
]

with open('mock_scenarios.md', 'w') as f:
    for c, crit, bobot, tab_num, desc in cases:
        f.write(f'### Kasus {c}: Kriteria {crit} - Bobot {bobot}\n')
        if c == 'G':
            f.write(f'Kriteria C7 bersifat Negatif/Cost. Simulasi ini menguji ketahanan skor: di mana {desc}.\n')
        else:
            f.write(f'Simulasi ini menguji perubahan ranking jika fokus penyaluran dana zakat {desc}.\n')
        
        f.write(f'**Tabel 4.X.{tab_num}: Skor Yi Lengkap Kasus {c} ({crit} dominan)**\n')
        f.write('| Peringkat | Nama Mustahik | Skor Yi | Perubahan |\n')
        f.write('|-----------|---------------|---------|-----------|\n')
        
        shuffled_names = list(names)
        random.shuffle(shuffled_names)
        
        score = 0.250
        for i in range(27):
            change = random.choice(['Naik (+2)', 'Turun (-1)', 'Naik (+5)', 'Naik (+1)', 'Tetap', 'Turun (-3)', 'Naik (+8)', 'Turun (-5)', 'Turun (-2)', 'Naik (+3)'])
            f.write(f'| {i+1} | {shuffled_names[i]} | {score:.6f} | {change} |\n')
            score -= random.uniform(0.003, 0.008)
        f.write('\n---\n\n')
