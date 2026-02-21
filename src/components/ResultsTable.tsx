import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Trash2, Trophy, Medal, Award, AlertCircle, Eye, Calculator } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import type { Candidate } from '../App';
import { calculateMOORA, getCalculationSteps } from './mooraCalculations';
import { CRITERIA_DATA } from './CriteriaInfo';

interface ResultsTableProps {
  candidates: Candidate[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export function ResultsTable({ candidates, onDelete, onClearAll }: ResultsTableProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

  const results = useMemo(() => {
    return calculateMOORA(candidates);
  }, [candidates]);

  const calculationSteps = useMemo(() => {
    return getCalculationSteps(candidates);
  }, [candidates]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <Badge className="bg-amber-500 hover:bg-amber-600 gap-1">
          <Trophy className="w-3 h-3" />
          Rank {rank}
        </Badge>
      );
    } else if (rank === 2) {
      return (
        <Badge className="bg-slate-400 hover:bg-slate-500 gap-1">
          <Medal className="w-3 h-3" />
          Rank {rank}
        </Badge>
      );
    } else if (rank === 3) {
      return (
        <Badge className="bg-orange-500 hover:bg-orange-600 gap-1">
          <Award className="w-3 h-3" />
          Rank {rank}
        </Badge>
      );
    }
    return <Badge variant="outline">Rank {rank}</Badge>;
  };

  if (candidates.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Belum ada data calon penerima. Silakan input data pada tab "Input Data" terlebih dahulu.
        </AlertDescription>
      </Alert>
    );
  }

  const selectedResult = selectedCandidate
    ? results.find(r => r.id === selectedCandidate)
    : null;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Calon Penerima</CardDescription>
            <CardTitle className="text-3xl">{candidates.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Prioritas Tertinggi</CardDescription>
            {results[0] && (
              <CardTitle className="text-2xl truncate">{results[0].name}</CardTitle>
            )}
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Skor Tertinggi</CardDescription>
            {results[0] && (
              <CardTitle className="text-3xl">{results[0].mooraScore.toFixed(4)}</CardTitle>
            )}
          </CardHeader>
        </Card>
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Hasil Perangkingan MOORA</CardTitle>
              <CardDescription>
                Urutan prioritas calon penerima zakat produktif berdasarkan metode MOORA
              </CardDescription>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm('Yakin ingin menghapus semua data?')) {
                  onClearAll();
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus Semua
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Rank</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead className="text-center">Skor MOORA</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.id} className={result.rank <= 3 ? 'bg-emerald-50' : ''}>
                    <TableCell>{getRankBadge(result.rank)}</TableCell>
                    <TableCell>
                      {result.name}
                    </TableCell>
                    <TableCell className="text-gray-600">{result.address}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="tabular-nums">
                        {result.mooraScore.toFixed(4)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedCandidate(result.id)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="!max-w-[calc(100vw-8rem)] max-h-[90vh] overflow-y-auto !bg-white !dark:bg-slate-900 !px-16 !pb-14">
                            <DialogHeader>
                              <DialogTitle>Detail Penilaian - {result.name}</DialogTitle>
                              <DialogDescription>
                                Rank {result.rank} | Skor MOORA: {result.mooraScore.toFixed(4)}
                              </DialogDescription>
                            </DialogHeader>

                            {selectedResult && (
                              <Tabs defaultValue="criteria" className="mt-4">
                                <TabsList className="grid w-full grid-cols-3">
                                  <TabsTrigger value="criteria">Nilai Kriteria</TabsTrigger>
                                  <TabsTrigger value="normalized">Normalisasi</TabsTrigger>
                                  <TabsTrigger value="weighted">Pembobotan</TabsTrigger>
                                </TabsList>

                                <TabsContent value="criteria" className="space-y-4 mt-4">
                                  {CRITERIA_DATA.map((criteria) => {
                                    const value = selectedResult.criteria[criteria.code as keyof typeof selectedResult.criteria];
                                    const Icon = criteria.icon;
                                    return (
                                      <div key={criteria.code} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                          <div className={`${criteria.color} p-2 rounded-lg`}>
                                            <Icon className="w-4 h-4 text-white" />
                                          </div>
                                          <div>
                                            <p>{criteria.code} - {criteria.name}</p>
                                            <p className="text-sm text-gray-500">Bobot: {(criteria.weight * 100).toFixed(0)}%</p>
                                          </div>
                                        </div>
                                        <Badge variant="secondary" className="text-lg">
                                          {value}
                                        </Badge>
                                      </div>
                                    );
                                  })}
                                </TabsContent>

                                <TabsContent value="normalized" className="space-y-4 mt-4">
                                  <p className="text-sm text-gray-600 mb-4">
                                    Nilai setelah normalisasi vektor (x<sub>ij</sub>* = x<sub>ij</sub> / √Σx<sub>ij</sub>²)
                                  </p>
                                  {CRITERIA_DATA.map((criteria) => {
                                    const value = selectedResult.normalizedCriteria[criteria.code];
                                    const Icon = criteria.icon;
                                    return (
                                      <div key={criteria.code} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                          <div className={`${criteria.color} p-2 rounded-lg`}>
                                            <Icon className="w-4 h-4 text-white" />
                                          </div>
                                          <span>{criteria.code} - {criteria.name}</span>
                                        </div>
                                        <Badge variant="secondary" className="tabular-nums">
                                          {value.toFixed(6)}
                                        </Badge>
                                      </div>
                                    );
                                  })}
                                </TabsContent>

                                <TabsContent value="weighted" className="space-y-4 mt-4">
                                  <p className="text-sm text-gray-600 mb-4">
                                    Nilai setelah dikalikan bobot (w<sub>i</sub> × x<sub>ij</sub>*)
                                  </p>
                                  {CRITERIA_DATA.map((criteria) => {
                                    const value = selectedResult.weightedNormalized[criteria.code];
                                    const Icon = criteria.icon;
                                    return (
                                      <div key={criteria.code} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                          <div className={`${criteria.color} p-2 rounded-lg`}>
                                            <Icon className="w-4 h-4 text-white" />
                                          </div>
                                          <span>{criteria.code} - {criteria.name}</span>
                                        </div>
                                        <Badge variant="secondary" className="tabular-nums">
                                          {value.toFixed(6)}
                                        </Badge>
                                      </div>
                                    );
                                  })}
                                  <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                                    <div className="flex items-center justify-between">
                                      <span>Total Skor MOORA (Y<sub>i</sub>):</span>
                                      <Badge className="bg-emerald-600 text-lg">
                                        {selectedResult.mooraScore.toFixed(6)}
                                      </Badge>
                                    </div>
                                  </div>
                                </TabsContent>
                              </Tabs>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Hapus data ${result.name}?`)) {
                              onDelete(result.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Calculation Details */}
      {calculationSteps && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Detail Perhitungan MOORA
            </CardTitle>
            <CardDescription>
              Langkah-langkah perhitungan metode MOORA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4>Langkah-langkah Perhitungan:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>Pembentukan Matriks Keputusan - Menyusun matriks {candidates.length} alternatif × 7 kriteria</li>
                <li>Normalisasi Matriks - Menggunakan vector normalization: x<sub>ij</sub>* = x<sub>ij</sub> / √Σx<sub>ij</sub>²</li>
                <li>Pembobotan - Mengalikan nilai ternormalisasi dengan bobot kriteria (w<sub>i</sub>)</li>
                <li>Optimasi - Menghitung Y<sub>i</sub> = Σ(w<sub>i</sub> × x<sub>ij</sub>*) untuk semua kriteria benefit</li>
                <li>Perangkingan - Mengurutkan alternatif berdasarkan nilai Y<sub>i</sub> tertinggi</li>
              </ol>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Catatan:</strong> Semua kriteria dalam sistem ini adalah kriteria benefit (semakin tinggi nilai, semakin baik).
                Nilai tertinggi menunjukkan prioritas tertinggi untuk menerima zakat produktif.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}