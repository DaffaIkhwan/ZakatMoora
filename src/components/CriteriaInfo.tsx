import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Button } from './ui/button';
import { BookOpen, Heart, Home, Sparkles, DollarSign, TrendingUp, Briefcase, Settings, AlertCircle, Circle, Star, Activity, User, Users } from 'lucide-react';
import type { Criterion } from '../types';

// Map string icon names to components
export const ICON_MAP: Record<string, any> = {
  BookOpen, Heart, Home, Sparkles, DollarSign, TrendingUp, Briefcase,
  Settings, AlertCircle, Circle, Star, Activity, User, Users
};

// Sub-criteria structure sesuai tabel user (Default Data)
export const DEFAULT_CRITERIA: Criterion[] = [
  {
    code: 'C1',
    name: 'Pendidikan',
    weight: 0.10,
    icon: 'BookOpen',
    color: 'bg-sky-400',
    description: 'Menilai tingkat pendidikan kepala keluarga',
    aspects: [
      {
        code: 'C1A',
        name: 'Tingkat Pendidikan',
        options: [
          { label: 'Tidak sekolah / buta huruf', value: 0 },
          { label: 'Tamat SD', value: 2 },
          { label: 'Tamat SMP', value: 4 },
          { label: 'Tamat SMA', value: 6 },
          { label: 'Perguruan Tinggi', value: 9 },
        ]
      }
    ]
  },
  {
    code: 'C2',
    name: 'Kesehatan',
    weight: 0.15,
    icon: 'Heart',
    color: 'bg-rose-400',
    description: 'Menilai kondisi fisik dan kesehatan keluarga',
    aspects: [
      {
        code: 'C2A',
        name: 'Kondisi Fisik',
        options: [
          { label: 'Sangat sakit / tidak mampu bekerja', value: 0 },
          { label: 'Sakit menahun', value: 4 },
          { label: 'Sering sakit ringan', value: 8 },
          { label: 'Sehat & produktif', value: 10 },
        ]
      },
      {
        code: 'C2B',
        name: 'Kondisi Keluarga',
        options: [
          { label: 'Tidak ada anggota keluarga sakit', value: 0 },
          { label: 'Ada anggota keluarga sering sakit', value: 1 },
          { label: 'Ada anggota keluarga sakit berat', value: 2 },
        ]
      }
    ]
  },
  {
    code: 'C3',
    name: 'Kelayakan Hunian',
    weight: 0.15,
    icon: 'Home',
    color: 'bg-amber-400',
    description: 'Menilai kondisi fisik, kepadatan, dan fasilitas rumah',
    aspects: [
      {
        code: 'C3A',
        name: 'Struktur Rumah',
        options: [
          { label: 'Tidak layak (bambu/tanah)', value: 0 },
          { label: 'Semi permanen', value: 4 },
          { label: 'Permanen sederhana', value: 9 },
        ]
      },
      {
        code: 'C3B',
        name: 'Kepadatan',
        options: [
          { label: '≤ 2 orang/kamar', value: 0 },
          { label: '≥ 3 orang/kamar', value: 4 },
        ]
      },
      {
        code: 'C3C',
        name: 'Fasilitas Dasar',
        options: [
          { label: 'Fasilitas lengkap', value: 0 },
          { label: 'Tanpa MCK/air bersih', value: 5 },
        ]
      }
    ]
  },
  {
    code: 'C4',
    name: 'Spiritual',
    weight: 0.10,
    icon: 'Sparkles',
    color: 'bg-violet-400',
    description: 'Menilai konsistensi ibadah dan keaktifan keagamaan',
    aspects: [
      {
        code: 'C4A',
        name: 'Shalat Wajib',
        options: [
          { label: 'Jarang (<25x/minggu)', value: 0 },
          { label: 'Kadang (25–34x/minggu)', value: 1 },
          { label: 'Rutin (≥35x/minggu)', value: 2 },
        ]
      },
      {
        code: 'C4B',
        name: 'Shalat Sunnah',
        options: [
          { label: 'Tidak pernah', value: 0 },
          { label: 'Kadang (1–4x/minggu)', value: 1 },
          { label: 'Rutin (≥5x/minggu)', value: 2 },
        ]
      },
      {
        code: 'C4C',
        name: 'Aktivitas Keagamaan',
        options: [
          { label: 'Tidak aktif', value: 0 },
          { label: 'Kadang (1–2x/bulan)', value: 1 },
          { label: 'Aktif (≥3x/bulan)', value: 2 },
        ]
      }
    ]
  },
  {
    code: 'C5',
    name: 'Pendapatan',
    weight: 0.20,
    icon: 'DollarSign',
    color: 'bg-emerald-400',
    description: 'Mengukur kemampuan ekonomi rumah tangga',
    aspects: [
      {
        code: 'C5A',
        name: 'Pendapatan Bulanan',
        options: [
          { label: '< 30% UMR', value: 20 },
          { label: '30–59% UMR', value: 12 },
          { label: '60–100% UMR', value: 6 },
          { label: '> 100% UMR', value: 0 },
        ]
      },
      {
        code: 'C5B',
        name: 'Sumber Penghasilan',
        options: [
          { label: 'Pekerjaan tetap', value: 0 },
          { label: 'Usaha kecil stabil', value: 4 },
          { label: 'Tidak tetap', value: 6 },
        ]
      },
      {
        code: 'C5C',
        name: 'Jumlah Tanggungan',
        options: [
          { label: '≤ 2 orang', value: 0 },
          { label: '3–4 orang', value: 2 },
          { label: '> 5 orang', value: 4 },
        ]
      }
    ]
  },
  {
    code: 'C6',
    name: 'Potensi Kemandirian',
    weight: 0.15,
    icon: 'TrendingUp',
    color: 'bg-cyan-400',
    description: 'Menilai kemampuan, keterampilan, dan motivasi untuk mandiri',
    aspects: [
      {
        code: 'C6A',
        name: 'Keterampilan',
        options: [
          { label: 'Tidak memiliki', value: 0 },
          { label: 'Keterampilan dasar', value: 6 },
          { label: 'Terampil & siap usaha', value: 12 },
        ]
      },
      {
        code: 'C6B',
        name: 'Pengalaman Usaha',
        options: [
          { label: 'Tidak ada', value: 0 },
          { label: 'Pernah usaha kecil', value: 6 },
          { label: 'Usaha ≥ 1 tahun', value: 9 },
        ]
      },
      {
        code: 'C6C',
        name: 'Rencana Usaha',
        options: [
          { label: 'Tidak ada', value: 0 },
          { label: 'Rencana sederhana', value: 6 },
          { label: 'Rencana matang & realistis', value: 12 },
        ]
      },
      {
        code: 'C6D',
        name: 'Motivasi',
        options: [
          { label: 'Rendah', value: 0 },
          { label: 'Tinggi & berkomitmen', value: 10 },
        ]
      }
    ]
  },
  {
    code: 'C7',
    name: 'Kepemilikan Aset',
    weight: 0.15,
    icon: 'Briefcase',
    color: 'bg-orange-400',
    description: 'Menilai jumlah dan jenis aset yang dimiliki',
    aspects: [
      {
        code: 'C7A',
        name: 'Rumah',
        options: [
          { label: 'Milik sendiri', value: 0 },
          { label: 'Kontrak', value: 3 },
          { label: 'Menumpang', value: 5 },
        ]
      },
      {
        code: 'C7B',
        name: 'Kendaraan',
        options: [
          { label: 'Mobil', value: 0 },
          { label: 'Motor', value: 2 },
          { label: 'Tidak ada', value: 4 },
        ]
      },
      {
        code: 'C7C',
        name: 'Aset Lain',
        options: [
          { label: 'Aset banyak', value: 0 },
          { label: 'Aset sedikit', value: 3 },
          { label: 'Tidak punya tabungan/lahan', value: 6 },
        ]
      }
    ]
  },
];

interface CriteriaInfoProps {
  criteriaList?: Criterion[];
  userRole?: string;
  onManageCriteria?: () => void;
}

export function CriteriaInfo({ criteriaList = DEFAULT_CRITERIA, userRole, onManageCriteria }: CriteriaInfoProps) {
  const totalWeight = criteriaList.reduce((sum, c) => sum + c.weight, 0);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Kriteria Penilaian</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Sistem menggunakan {criteriaList.length} kriteria dengan bobot berbeda untuk menilai kelayakan
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Total Weight Badge */}
          <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${Math.abs(totalWeight - 1.0) < 0.001
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
            }`}>
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Total Bobot: {(totalWeight * 100).toFixed(0)}%</span>
          </div>

          {/* Kelola Kriteria Button */}
          {userRole === 'super_admin' && onManageCriteria && (
            <Button
              onClick={onManageCriteria}
              className="gap-2 !bg-blue-600 hover:!bg-blue-700 !text-white !border-blue-600 shadow-md hover:shadow-lg transition-all"
            >
              <Settings className="w-4 h-4" />
              <span className="font-medium">Kelola Kriteria</span>
            </Button>
          )}
        </div>
      </div>

      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-100">Detail Indikator & Sub-Kriteria</CardTitle>
          <CardDescription>
            Rincian poin penilaian untuk setiap aspek dalam kriteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {criteriaList.map((criteria) => {
              const Icon = ICON_MAP[criteria.icon] || BookOpen;
              return (
                <AccordionItem key={criteria.code} value={criteria.code} className="border border-slate-200 dark:border-slate-700 rounded-lg px-4 bg-slate-50/50 dark:bg-slate-800/50">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-md ${criteria.color.replace('400', '100').replace('bg-', 'bg-')}`}>
                        <Icon className={`w-4 h-4 ${criteria.color.replace('bg-', 'text-').replace('400', '600')}`} />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{criteria.code} - {criteria.name}</span>
                          <Badge
                            variant="outline"
                            className="text-xs ml-2 font-bold"
                            style={criteria.type === 'cost'
                              ? { color: '#f43f5e', backgroundColor: 'rgba(244,63,94,0.15)', borderColor: 'rgba(244,63,94,0.4)' }
                              : { color: '#10b981', backgroundColor: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.4)' }
                            }
                          >
                            {criteria.type === 'cost' ? 'COST' : 'BENEFIT'}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">Bobot: {(criteria.weight * 100).toFixed(0)}%</Badge>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm bg-white dark:bg-slate-900 p-3 rounded border border-slate-100 dark:border-slate-700">
                      {criteria.description}
                    </p>
                    <div className="space-y-4">
                      {criteria.aspects.map((aspect) => (
                        <div key={aspect.code} className="space-y-2">
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-xs font-mono">{aspect.code}</span>
                            {aspect.name}
                          </p>
                          <ul className="space-y-1 ml-4">
                            {aspect.options.map((opt, idx) => (
                              <li key={idx} className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700 transition-colors">
                                <span className="text-sm text-slate-700 dark:text-slate-300">{opt.label}</span>
                                <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                                  {opt.value} poin
                                </Badge>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}