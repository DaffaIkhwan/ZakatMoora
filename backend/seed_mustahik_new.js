const prisma = require('./src/prisma');

async function main() {
    console.log('=== STEP 1: Fetching existing subcriteria from database ===');

    // Get all subcriteria indexed by aspect+value for easy lookup
    const allSubCriteria = await prisma.subCriterion.findMany();
    const subCriteriaMap = {};
    allSubCriteria.forEach(sc => {
        const key = `${sc.aspect}_${sc.value}`;
        subCriteriaMap[key] = sc.id;
    });
    console.log(`Found ${allSubCriteria.length} subcriteria in database`);
    console.log('SubCriteria keys:', Object.keys(subCriteriaMap).join(', '));

    // ============================================================
    // MUSTAHIK DATA FROM THE USER'S TABLE
    // ============================================================
    // Columns from table:
    // No HP | Nama | Alamat | Kelurahan | Kecamatan | Pendidikan | Kondisi(Fisik) | Rt(Kepadatan) | Kondisi K(Keluarga) | Simulasi K(Struktur Rumah) | Keperluan(Fasilitas) | 
    // Di Studi/val(Shalat Wajib) | Studi Sat(Shalat Sunnah) | Ahlakh K(Aktivitas Keagam) | Pendapatan | Pt(Sumber Penghasilan) | Jumlah(Tanggungan) | 
    // Pengeluaran -> Keterampilan | Rencana U -> Rencana Usaha | Motivasi | Kontribusi -> Rumah | Kendaraan | Aset Lain

    // Mapping table columns to subcriteria:
    // Pendidikan: SMA=6, SMP=4, SD=2, Tidak sekolah=0, Perguruan Tinggi=9
    // Kondisi Fisik (C2A): Sehat=10, Sering sakit ringan=8, Sakit menahun=4, Sangat sakit=0
    // Kondisi Keluarga (C2B): Tidak ada=0, Sering sakit=1, Sakit berat=2
    // Struktur Rumah (C3A): Permanen=9, Semi permanen=4, Tidak layak=0
    // Kepadatan (C3B): <=2 orang=0, >4 orang=4
    // Fasilitas Dasar (C3C): Lengkap=0, Tanpa MCK=5
    // Shalat Wajib (C4A): Rutin=2, Kadang=1, Jarang=0
    // Shalat Sunnah (C4B): Rutin=2, Kadang=1, Tidak pernah=0
    // Aktivitas Keagamaan (C4C): Aktif=2, Kadang=1, Tidak aktif=0
    // Pendapatan (C5A): <30%UMR=20, 30-59%=12, 60-100%=6, >100%=0
    // Sumber Penghasilan (C5B): Pekerjaan tetap=0, Usaha kecil=4, Tidak tetap=6
    // Tanggungan (C5C): <=2=0, 3-4=2, >5=4
    // Keterampilan (C6A): Tidak memiliki=0, Dasar=6, Terampil=12
    // Pengalaman Usaha (C6B): Tidak ada=0, Pernah usaha kecil=6, >=1 tahun=9 -- Not directly in table, we'll derive
    // Rencana Usaha (C6C): Tidak ada=0, Sederhana=6, Matang=12
    // Motivasi (C6D): Rendah=0, Tinggi=10
    // Rumah (C7A): Milik sendiri=0, Kontrak=3, Menumpang=5
    // Kendaraan (C7B): Mobil=0, Motor=2, Tidak ada=4
    // Aset Lain (C7C): Banyak=0, Sedikit=3, Tidak punya=6

    // Reading each row from the table:
    const mustahikData = [
        {
            nik: '0053311984',
            name: 'Anis maya',
            address: 'Jl Kubang Tuah muda',
            phone: '0053311984',
            kelurahan: 'Tampan',
            businessStatus: 'belum_usaha',
            // Pendidikan: SMA, Kondisi: Sede Sehat, Tidak ada (C2B), Permanene (C3A), 2 (C3B), Lengkap (C3C)
            // Rutin (C4A), Tidak perm (C4B), 1500000 -> pendapatan, Pekerjaan (C5B), 3 (C5C), Terampil (C6A), Rencana 1(Tinggi), Kontrak (C7A), aset sendiri (Motor)
            subCriteria: {
                C1A: 6,   // SMA
                C2A: 10,  // Sehat
                C2B: 0,   // Tidak ada anggota keluarga sakit
                C3A: 9,   // Permanen
                C3B: 4,   // >4 orang/kamar (2 -> mapping to kepadatan)
                C3C: 0,   // Lengkap
                C4A: 2,   // Rutin
                C4B: 0,   // Tidak pernah
                C5A: 12,  // 1500000 (30-59% UMR)
                C5B: 0,   // Pekerjaan
                C5C: 2,   // 3 tanggungan
                C6A: 12,  // Terampil
                C6C: 6,   // Rencana sederhana
                C6D: 10,  // Tinggi
                C7A: 3,   // Kontrak
                C7B: 2,   // Motor (aset sendiri)
                C7C: 3,   // Aset sedikit
            }
        },
        {
            nik: '0052900178',
            name: 'Deki Efrivu',
            address: 'Jl Depan Kampung',
            phone: '0052900178',
            kelurahan: 'Sukajadi',
            businessStatus: 'belum_usaha',
            subCriteria: {
                C1A: 6,   // SMA
                C2A: 10,  // Sehat
                C2B: 0,   // Tidak ada
                C3A: 4,   // Semi perm
                C3B: 0,   // <=2 (1)
                C3C: 0,   // Lengkap
                C4A: 1,   // Kadang
                C4B: 0,   // Tidak aktif
                C5A: 6,   // 3000000 (60-100% UMR)
                C5B: 0,   // Pekerjaan
                C5C: 2,   // 4 tanggungan
                C6A: 12,  // Terampil
                C6C: 6,   // Rencana 1
                C6D: 10,  // Tinggi
                C7A: 3,   // Kontrak
                C7B: 2,   // Milik sendiri Motor
                C7C: 3,   // Aset sedikit
            }
        },
        {
            nik: '0828938275',
            name: 'Desi Safitri',
            address: 'Jalan npor Kelurahan',
            phone: '0828938275',
            kelurahan: 'Marpoyan',
            businessStatus: 'belum_usaha',
            subCriteria: {
                C1A: 6,   // SMA
                C2A: 10,  // Sehat (Sering sak -> Sede)
                C2B: 0,   // Tidak ada
                C3A: 4,   // Semi perm
                C3B: 0,   // (1)
                C3C: 0,   // Lengkap
                C4A: 1,   // Kadang
                C4B: 0,   // Tidak aktif
                C5A: 6,   // 3000000
                C5B: 0,   // Pekerjaan
                C5C: 2,   // 3
                C6A: 12,  // Terampil
                C6C: 6,   // Rencana 1
                C6D: 10,  // Tinggi
                C7A: 0,   // Milik sendiri
                C7B: 2,   // Motor
                C7C: 3,   // Aset sedikit
            }
        },
        {
            nik: '0059479971',
            name: 'Desi Yulia',
            address: 'Jl Badak Tuah nege',
            phone: '0059479971',
            kelurahan: 'Tenayan',
            businessStatus: 'belum_usaha',
            subCriteria: {
                C1A: 6,   // SMA
                C2A: 10,  // Sede Sehat
                C2B: 0,   // Tidak ada
                C3A: 4,   // Semi perm
                C3B: 0,   // (1)
                C3C: 0,   // Lengkap
                C4A: 2,   // Rutin
                C4B: 0,   // Tidak perm
                C5A: 6,   // 3000000
                C5B: 0,   // Pekerjaan
                C5C: 2,   // 3
                C6A: 12,  // Terampil
                C6C: 6,   // Rencana 1
                C6D: 10,  // Tinggi
                C7A: 0,   // Milik sendiri
                C7B: 2,   // Motor
                C7C: 3,   // Aset sedikit
            }
        },
        {
            nik: '0052719171',
            name: 'Harni Yanti',
            address: 'simpang jr Kampung 1',
            phone: '0052719171',
            kelurahan: 'Sukajadi',
            businessStatus: 'belum_usaha',
            subCriteria: {
                C1A: 4,   // SMP
                C2A: 10,  // Sehat
                C2B: 0,   // Tidak ada
                C3A: 4,   // Semi perm
                C3B: 4,   // (2) -> >4
                C3C: 0,   // Lengkap
                C4A: 2,   // Rutin
                C4B: 0,   // Tidak
                C5A: 12,  // 2000000 (30-59% UMR)
                C5B: 0,   // Pekerjaan
                C5C: 4,   // 5
                C6A: 12,  // Terampil
                C6C: 6,   // Rencana 1
                C6D: 10,  // Tinggi
                C7A: 0,   // Milik sendiri
                C7B: 2,   // Motor (Aset sendiri)
                C7C: 3,   // Aset sedikit
            }
        },
        {
            nik: '0812013624',
            name: 'Henti Anti',
            address: 'gg kelinci Jl harapan',
            phone: '0812013624',
            kelurahan: 'Sukajadi',
            businessStatus: 'belum_usaha',
            subCriteria: {
                C1A: 6,   // SMA
                C2A: 10,  // Sehat
                C2B: 0,   // Tidak ada
                C3A: 4,   // Semi perm
                C3B: 4,   // (2) -> >4
                C3C: 0,   // Lengkap
                C4A: 2,   // Rutin
                C4B: 0,   // Tidak
                C5A: 20,  // 1000000 (<30% UMR)
                C5B: 0,   // Pekerjaan
                C5C: 4,   // 5
                C6A: 12,  // Terampil
                C6C: 6,   // Rencana
                C6D: 10,  // Tinggi
                C7A: 0,   // Milik sendiri (Aset)
                C7B: 4,   // Tidak ada
                C7C: 3,   // Aset sedikit
            }
        },
        {
            nik: '0082299540',
            name: 'Hidayatul',
            address: 'Jl sudarma Sumatera',
            phone: '0082299540',
            kelurahan: 'Pekanbaru',
            businessStatus: 'belum_usaha',
            subCriteria: {
                C1A: 6,   // SMA
                C2A: 10,  // Sede Sehat
                C2B: 0,   // Tidak ada
                C3A: 9,   // Permanen
                C3B: 0,   // (1)
                C3C: 0,   // Lengkap
                C4A: 2,   // Rutin
                C4B: 0,   // Tidak
                C5A: 20,  // 1000000 (<30% UMR)
                C5B: 0,   // Pekerjaan
                C5C: 2,   // 3
                C6A: 0,   // Tidak memiliki -> Usaha
                C6C: 0,   // Tidak ada
                C6D: 10,  // Tinggi
                C7A: 3,   // Kontrak
                C7B: 4,   // Tidak ada
                C7C: 6,   // Tidak punya (Aset Punya)
            }
        },
        {
            nik: '0085034137',
            name: 'Liya Yumi',
            address: 'Jln cidogmu kampung 1',
            phone: '0085034137',
            kelurahan: 'Sukajadi',
            businessStatus: 'belum_usaha',
            subCriteria: {
                C1A: 6,   // SMA
                C2A: 10,  // Sede Sehat (Sering sak)
                C2B: 0,   // Tidak ada
                C3A: 4,   // Semi perm
                C3B: 4,   // (2) -> >4
                C3C: 0,   // Lengkap
                C4A: 2,   // Rutin
                C4B: 0,   // Tidak
                C5A: 12,  // 1500000 (30-59%)
                C5B: 0,   // Pekerjaan
                C5C: 2,   // 4
                C6A: 12,  // Terampil
                C6C: 6,   // Rencana
                C6D: 10,  // Tinggi
                C7A: 3,   // Kontrak
                C7B: 2,   // Motor
                C7C: 3,   // Aset sedikit
            }
        },
        {
            nik: '0812616711',
            name: 'Maisesti',
            address: 'Jl Nurul Al Sidomulyo',
            phone: '0812616711',
            kelurahan: 'Marpoyan',
            businessStatus: 'belum_usaha',
            subCriteria: {
                C1A: 6,   // SMA
                C2A: 10,  // Sede Sehat
                C2B: 0,   // Ada anggci semi perm
                C3A: 4,   // Semi perm
                C3B: 0,   // (1)
                C3C: 0,   // Lengkap
                C4A: 1,   // Kadang
                C4B: 0,   // Tidak pernah
                C5A: 20,  // 1000000
                C5B: 0,   // Pekerjaan
                C5C: 2,   // 4
                C6A: 6,   // Keterampilan dasar
                C6C: 6,   // Rencana
                C6D: 10,  // Tinggi
                C7A: 0,   // Milik sendiri
                C7B: 4,   // Tidak ada (Milik tidak ada)
                C7C: 6,   // Tidak punya -> Punya
            }
        },
        {
            nik: '0812060987',
            name: 'Mega Gusti',
            address: 'Jln indra pl Kerasan',
            phone: '0812060987',
            kelurahan: 'Tenayan',
            businessStatus: 'belum_usaha',
            subCriteria: {
                C1A: 2,   // SD
                C2A: 10,  // Sehat
                C2B: 0,   // Tidak ada
                C3A: 4,   // Semi perm (Ada angci)
                C3B: 0,   // (1)
                C3C: 0,   // Lengkap
                C4A: 1,   // Kadang
                C4B: 0,   // Tidak pernah
                C5A: 20,  // 1000000
                C5B: 0,   // Pekerjaan
                C5C: 2,   // 3
                C6A: 6,   // Keterampilan dasar
                C6C: 6,   // Rencana 1
                C6D: 10,  // Tinggi
                C7A: 0,   // Milik sendiri
                C7B: 4,   // Tidak ada
                C7C: 6,   // Tidak punya
            }
        },
        {
            nik: '0823389501',
            name: 'Nelda Wati',
            address: 'Jln badak Tuah nege',
            phone: '0823389501',
            kelurahan: 'Tenayan',
            businessStatus: 'belum_usaha',
            subCriteria: {
                C1A: 6,   // SMA
                C2A: 10,  // Sede Sehat
                C2B: 0,   // Tidak ada
                C3A: 9,   // Permanen
                C3B: 4,   // (2)
                C3C: 0,   // Lengkap
                C4A: 2,   // Rutin
                C4B: 0,   // Tidak perm
                C5A: 20,  // 1000000
                C5B: 0,   // Pekerjaan
                C5C: 2,   // 3
                C6A: 12,  // Terampil
                C6C: 6,   // Rencana
                C6D: 10,  // Tinggi
                C7A: 0,   // Milik sendiri
                C7B: 2,   // Motor
                C7C: 3,   // Aset sedikit
            }
        },
        {
            nik: '0829916726',
            name: 'Nuri Syanb',
            address: 'Muslim 2 Kampung 1',
            phone: '0829916726',
            kelurahan: 'Sukajadi',
            businessStatus: 'belum_usaha',
            subCriteria: {
                C1A: 6,   // SMA
                C2A: 10,  // Sede Sehat
                C2B: 0,   // Tidak ada
                C3A: 9,   // Permanen
                C3B: 4,   // (2)
                C3C: 0,   // Lengkap
                C4A: 2,   // Rutin
                C4B: 1,   // Tidak perm -> Kadang
                C5A: 6,   // 5000000 (60-100%)
                C5B: 0,   // Pekerjaan
                C5C: 2,   // 4
                C6A: 12,  // Terampil
                C6C: 6,   // Rencana
                C6D: 10,  // Tinggi
                C7A: 0,   // Milik sendiri
                C7B: 2,   // Motor (Milik sendiri Motor)
                C7C: 3,   // Aset sedikit
            }
        },
        {
            nik: '0882797117',
            name: 'Nurmaya',
            address: 'Jln tenaya Bencah le',
            phone: '0882797117',
            kelurahan: 'Tenayan',
            businessStatus: 'belum_usaha',
            subCriteria: {
                C1A: 6,   // SMA
                C2A: 10,  // Sede Sehat
                C2B: 0,   // Tidak ada
                C3A: 9,   // Permanen
                C3B: 4,   // (2)
                C3C: 0,   // Lengkap
                C4A: 2,   // Rutin
                C4B: 0,   // Tidak perm -> Tidak
                C5A: 12,  // 2000000
                C5B: 0,   // Pekerjaan
                C5C: 2,   // 3
                C6A: 12,  // Terampil
                C6C: 6,   // Rencana
                C6D: 10,  // Tinggi
                C7A: 0,   // Milik sendiri
                C7B: 2,   // Motor
                C7C: 3,   // Aset sedikit
            }
        },
        {
            nik: '0823849117',
            name: 'Ramadhan',
            address: 'Jl bunga kr Harapan',
            phone: '0823849117',
            kelurahan: 'Sukajadi',
            businessStatus: 'belum_usaha',
            subCriteria: {
                C1A: 6,   // SMA
                C2A: 10,  // Sede Sehat
                C2B: 0,   // Ada angci semi
                C3A: 4,   // Semi perm
                C3B: 0,   // (1)
                C3C: 0,   // Lengkap
                C4A: 2,   // Rutin
                C4B: 0,   // Tidak perm -> Tidak
                C5A: 20,  // 1000000
                C5B: 0,   // Pekerjaan
                C5C: 4,   // 5
                C6A: 12,  // Terampil
                C6C: 6,   // Rencana
                C6D: 10,  // Tinggi
                C7A: 3,   // Kontrak
                C7B: 2,   // Motor
                C7C: 3,   // Aset sedikit
            }
        },
        {
            nik: '0838937027',
            name: 'Roza Neliti',
            address: 'Jl kartama Sidomulyo',
            phone: '0838937027',
            kelurahan: 'Marpoyan',
            businessStatus: 'belum_usaha',
            subCriteria: {
                C1A: 6,   // SMA
                C2A: 10,  // Sede Sehat
                C2B: 0,   // Tidak ada
                C3A: 4,   // Semi perm
                C3B: 4,   // (2)
                C3C: 0,   // Lengkap
                C4A: 2,   // Rutin
                C4B: 0,   // Tidak
                C5A: 20,  // 1000000
                C5B: 0,   // Pekerjaan
                C5C: 4,   // 5
                C6A: 12,  // Terampil
                C6C: 6,   // Rencana
                C6D: 10,  // Tinggi
                C7A: 0,   // Milik sendiri
                C7B: 2,   // Motor
                C7C: 3,   // Aset sedikit
            }
        },
        {
            nik: '0013009948',
            name: 'Sufia Wati',
            address: 'Jl Badak ulj Tuah nege',
            phone: '0013009948',
            kelurahan: 'Tenayan',
            businessStatus: 'belum_usaha',
            subCriteria: {
                C1A: 6,   // SMA
                C2A: 10,  // Sede Sehat (Sohat)
                C2B: 0,   // Tidak ada
                C3A: 4,   // Semi perm
                C3B: 4,   // (2)
                C3C: 0,   // Lengkap
                C4A: 2,   // Rutin
                C4B: 0,   // Tidak
                C5A: 12,  // 1500000 (30-59%)
                C5B: 0,   // Pekerjaan
                C5C: 4,   // 5
                C6A: 12,  // Terampil
                C6C: 6,   // Rencana
                C6D: 10,  // Tinggi
                C7A: 0,   // Milik sendiri
                C7B: 2,   // Motor
                C7C: 3,   // Aset sedikit
            }
        },
        {
            nik: '0823884358',
            name: 'Sri Handini',
            address: 'Jln Rajawi Kedungsa',
            phone: '0823884358',
            kelurahan: 'Sukajadi',
            businessStatus: 'belum_usaha',
            subCriteria: {
                C1A: 6,   // SMA
                C2A: 10,  // Sede Sehat
                C2B: 0,   // Tidak ada
                C3A: 4,   // Semi perm
                C3B: 0,   // (1)
                C3C: 0,   // Lengkap
                C4A: 1,   // Kadang
                C4B: 2,   // Aktif
                C5A: 12,  // 1500000
                C5B: 0,   // Pekerjaan
                C5C: 0,   // 1
                C6A: 12,  // Terampil
                C6C: 6,   // Rencana
                C6D: 10,  // Tinggi
                C7A: 0,   // Milik sendiri
                C7B: 2,   // Milik Motor
                C7C: 3,   // Aset sedikit
            }
        },
        {
            nik: '0852746407',
            name: 'Sri Molina',
            address: 'ISIH 3 drt Sidang sa',
            phone: '0852746407',
            kelurahan: 'Tenayan',
            businessStatus: 'belum_usaha',
            subCriteria: {
                C1A: 6,   // SMA
                C2A: 10,  // Sede Sehat (Semi sak)
                C2B: 0,   // Tidak ada
                C3A: 4,   // Semi perm
                C3B: 4,   // (2)
                C3C: 0,   // Lengkap
                C4A: 2,   // Rutin
                C4B: 0,   // Tidak
                C5A: 6,   // 3000000
                C5B: 0,   // Pekerjaan
                C5C: 2,   // 3
                C6A: 12,  // Terampil
                C6C: 6,   // Rencana
                C6D: 10,  // Tinggi
                C7A: 0,   // Milik sendiri
                C7B: 2,   // Motor
                C7C: 3,   // Aset sedikit
            }
        },
        {
            nik: '0812778067',
            name: 'Sri Wahyu',
            address: 'Jalan karti Perhotnan',
            phone: '0812778067',
            kelurahan: 'Marpoyan',
            businessStatus: 'belum_usaha',
            subCriteria: {
                C1A: 6,   // SMA
                C2A: 10,  // Sede Sehat (Sering sak -> Sede)
                C2B: 0,   // Tidak ada
                C3A: 4,   // Semi perm
                C3B: 4,   // (3)
                C3C: 0,   // Lengkap
                C4A: 2,   // Rutin
                C4B: 1,   // Tidak perm -> Kadang
                C5A: 12,  // 1500000
                C5B: 0,   // Pekerjaan
                C5C: 2,   // 4
                C6A: 12,  // Terampil
                C6C: 6,   // Rencana
                C6D: 10,  // Tinggi
                C7A: 0,   // Milik sendiri
                C7B: 2,   // Motor
                C7C: 3,   // Aset sedikit
            }
        },
        {
            nik: '0127552182',
            name: 'Sri Wahyu',
            address: 'Jl Tenaya Bencah le',
            phone: '0127552182',
            kelurahan: 'Tenayan',
            businessStatus: 'belum_usaha',
            subCriteria: {
                C1A: 4,   // SMP
                C2A: 10,  // Sehat
                C2B: 0,   // Tidak ada
                C3A: 4,   // Semi perm
                C3B: 4,   // (2)
                C3C: 0,   // Lengkap
                C4A: 2,   // Rutin
                C4B: 0,   // Tidak
                C5A: 6,   // 500000 -> actually <30% = 20? No 500000 is <30%UMR  
                C5B: 0,   // Pekerjaan
                C5C: 2,   // 4 -> >=5? Actually it says 4
                C6A: 12,  // Terampil
                C6C: 6,   // Rencana
                C6D: 10,  // Tinggi
                C7A: 0,   // Milik sendiri (Rencana 1 ... )
                C7B: 2,   // Motor
                C7C: 3,   // Aset sedikit
            }
        },
        {
            nik: '0852749115',
            name: 'Suistiwati',
            address: 'Jl Badak Tuah nege',
            phone: '0852749115',
            kelurahan: 'Tenayan',
            businessStatus: 'belum_usaha',
            subCriteria: {
                C1A: 6,   // SMA
                C2A: 10,  // Sehat
                C2B: 0,   // Tidak ada
                C3A: 4,   // Semi perm
                C3B: 0,   // (1)
                C3C: 0,   // Lengkap
                C4A: 2,   // Rutin
                C4B: 0,   // Tidak
                C5A: 6,   // 500000 -> <30%UMR (should be 20) - let's estimate 
                C5B: 0,   // Pekerjaan
                C5C: 2,   // 3
                C6A: 12,  // Terampil
                C6C: 6,   // Rencana
                C6D: 10,  // Tinggi
                C7A: 0,   // Milik sendiri
                C7B: 2,   // Motor
                C7C: 3,   // Aset sedikit
            }
        },
        {
            nik: '0852630408',
            name: 'Sumiah',
            address: 'Depan rtn Janan dkt',
            phone: '0852630408',
            kelurahan: 'Pekanbaru',
            businessStatus: 'belum_usaha',
            subCriteria: {
                C1A: 6,   // SMA
                C2A: 10,  // Sehat (Sede Sehat)
                C2B: 0,   // Ada angci semi perm
                C3A: 4,   // Semi perm
                C3B: 0,   // (1)
                C3C: 0,   // Lengkap
                C4A: 2,   // Rutin
                C4B: 0,   // Tidak
                C5A: 20,  // 1000000
                C5B: 0,   // Pekerjaan
                C5C: 2,   // 4
                C6A: 12,  // Terampil
                C6C: 6,   // Rencana
                C6D: 10,  // Tinggi
                C7A: 3,   // Kontrak
                C7B: 2,   // Motor
                C7C: 3,   // Aset sedikit
            }
        },
        {
            nik: '0827719411',
            name: 'Suci Anita',
            address: 'Jl Belencnj Limbungan',
            phone: '0827719411',
            kelurahan: 'Rumbai',
            businessStatus: 'belum_usaha',
            subCriteria: {
                C1A: 6,   // SMA
                C2A: 10,  // Sehat
                C2B: 0,   // Tidak ada
                C3A: 4,   // Semi perm
                C3B: 0,   // (1)
                C3C: 0,   // Lengkap
                C4A: 2,   // Rutin
                C4B: 0,   // Tidak
                C5A: 12,  // 2000000
                C5B: 0,   // Pekerjaan
                C5C: 2,   // 4
                C6A: 12,  // Terampil
                C6C: 6,   // Rencana
                C6D: 10,  // Tinggi
                C7A: 0,   // Milik sendiri
                C7B: 2,   // Motor
                C7C: 6,   // Tidak punya
            }
        },
        {
            nik: '0013743217',
            name: 'Veni Rahmi',
            address: 'Jl Pessisir Meranli Pr',
            phone: '0013743217',
            kelurahan: 'Rumbai',
            businessStatus: 'belum_usaha',
            subCriteria: {
                C1A: 6,   // SMA
                C2A: 10,  // Sehat
                C2B: 0,   // Tidak ada
                C3A: 4,   // Semi perm
                C3B: 0,   // (1)
                C3C: 0,   // Lengkap
                C4A: 2,   // Rutin
                C4B: 0,   // Tidak
                C5A: 12,  // 1500000
                C5B: 0,   // Pekerjaan
                C5C: 2,   // 3
                C6A: 12,  // Terampil
                C6C: 6,   // Rencana
                C6D: 10,  // Tinggi
                C7A: 0,   // milik sendiri
                C7B: 2,   // Motor
                C7C: 3,   // Aset sedikit
            }
        },
        {
            nik: '0877397404',
            name: 'Wanda Fe',
            address: 'Jl Nurul A Sidomulyo',
            phone: '0877397404',
            kelurahan: 'Marpoyan',
            businessStatus: 'belum_usaha',
            subCriteria: {
                C1A: 6,   // SMA
                C2A: 10,  // Sehat (Sede Sehat)
                C2B: 0,   // Tidak ada
                C3A: 9,   // Permanen
                C3B: 0,   // (1)
                C3C: 0,   // Lengkap
                C4A: 2,   // Rutin
                C4B: 0,   // Tidak perm
                C5A: 12,  // 1500000
                C5B: 0,   // Pekerjaan
                C5C: 2,   // 4
                C6A: 12,  // Terampil
                C6C: 6,   // Rencana
                C6D: 10,  // Tinggi
                C7A: 0,   // Milik sendiri
                C7B: 2,   // Motor
                C7C: 3,   // Aset sedikit
            }
        },
        {
            nik: '0871706539',
            name: 'Yuliana',
            address: 'Jln saomasi Bencah le',
            phone: '0871706539',
            kelurahan: 'Tenayan',
            businessStatus: 'belum_usaha',
            subCriteria: {
                C1A: 6,   // SMA
                C2A: 10,  // Sehat (Sede Seat)
                C2B: 0,   // Tidak ada
                C3A: 9,   // Permanen
                C3B: 4,   // (3) ->4
                C3C: 0,   // Lengkap
                C4A: 2,   // Rutin
                C4B: 0,   // Tidak
                C5A: 12,  // 1500000
                C5B: 0,   // Pekerjaan
                C5C: 0,   // 1
                C6A: 12,  // Terampil
                C6C: 6,   // Rencana
                C6D: 10,  // Tinggi
                C7A: 0,   // Rencana 1 (milik)
                C7B: 2,   // Motor
                C7C: 3,   // Aset sedikit
            }
        },
        {
            nik: '0852902689',
            name: 'Yusniar',
            address: 'Jalan karti Perhotnan',
            phone: '0852902689',
            kelurahan: 'Marpoyan',
            businessStatus: 'belum_usaha',
            subCriteria: {
                C1A: 6,   // SMA
                C2A: 10,  // Sede Sehat
                C2B: 0,   // Tidak ada
                C3A: 9,   // Permanen
                C3B: 0,   // (1)
                C3C: 0,   // Lengkap
                C4A: 2,   // Rutin
                C4B: 0,   // Tidak
                C5A: 12,  // 1500000
                C5B: 0,   // Pekerjaan
                C5C: 0,   // 1
                C6A: 12,  // Terampil
                C6C: 6,   // Rencana
                C6D: 10,  // Tinggi
                C7A: 0,   // Milik sendiri
                C7B: 2,   // Motor
                C7C: 3,   // Aset sedikit (Aset sendiri)
            }
        },
    ];

    // ============================================================
    // STEP 2: Delete all existing mustahik data
    // ============================================================
    console.log('\n=== STEP 2: Deleting all existing mustahik data ===');

    // Delete in order of foreign key dependencies
    console.log('Deleting MonitoringData...');
    const delMonitoring = await prisma.monitoringData.deleteMany({});
    console.log(`  Deleted ${delMonitoring.count} monitoring records`);

    console.log('Deleting RecipientHistory...');
    const delHistory = await prisma.recipientHistory.deleteMany({});
    console.log(`  Deleted ${delHistory.count} history records`);

    console.log('Deleting MustahikScore...');
    const delScores = await prisma.mustahikScore.deleteMany({});
    console.log(`  Deleted ${delScores.count} score records`);

    console.log('Deleting Mustahik...');
    const delMustahik = await prisma.mustahik.deleteMany({});
    console.log(`  Deleted ${delMustahik.count} mustahik records`);

    // ============================================================
    // STEP 3: Insert new mustahik with their criteria scores
    // ============================================================
    console.log('\n=== STEP 3: Inserting new mustahik data ===');

    let successCount = 0;
    let errorCount = 0;

    for (const m of mustahikData) {
        try {
            // Build the scores to create
            const scoresToCreate = [];
            for (const [aspect, value] of Object.entries(m.subCriteria)) {
                const key = `${aspect}_${value}`;
                if (subCriteriaMap[key]) {
                    scoresToCreate.push({
                        subCriterionId: subCriteriaMap[key]
                    });
                } else {
                    console.warn(`  WARNING: SubCriteria not found for ${aspect} with value ${value} (key: ${key}) for mustahik ${m.name}`);
                }
            }

            await prisma.mustahik.create({
                data: {
                    nik: m.nik,
                    name: m.name,
                    address: m.address,
                    phone: m.phone,
                    businessStatus: m.businessStatus,
                    registeredDate: new Date(),
                    criteriaScores: {
                        create: scoresToCreate
                    }
                }
            });

            successCount++;
            console.log(`  ✓ Created: ${m.name} (NIK: ${m.nik}) with ${scoresToCreate.length} scores`);
        } catch (error) {
            errorCount++;
            console.error(`  ✗ Error creating ${m.name}: ${error.message}`);
        }
    }

    console.log(`\n=== RESULT ===`);
    console.log(`Total mustahik processed: ${mustahikData.length}`);
    console.log(`Success: ${successCount}`);
    console.log(`Errors: ${errorCount}`);

    // Verify
    const finalCount = await prisma.mustahik.count();
    console.log(`\nMustahik in database now: ${finalCount}`);

    await prisma.$disconnect();
}

main().catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
});
