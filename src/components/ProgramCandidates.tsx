import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Trophy, Medal, Award, AlertCircle, CheckCircle, Calculator, Search, Filter, Save, Users, BarChart3, Gift } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { PaginationControls } from './ui/pagination-controls';
import { MonitoringForm } from './MonitoringForm';
import type { AidProgram, Mustahik, RecipientHistory, CandidateWithScore, MonitoringData, Criterion } from '../types';
import { calculateMOORA, getSubCriteriaWeights } from './mooraCalculations';

interface ProgramCandidatesProps {
  program: AidProgram;
  mustahikList: Mustahik[];
  criteriaList: Criterion[];
  onUpdateProgram: (id: string, program: AidProgram) => void;
  onAddRecipientHistory: (history: RecipientHistory) => void;
  recipientHistory: RecipientHistory[];
  onAddMonitoring: (data: MonitoringData) => void;
}

export function ProgramCandidates({
  program,
  mustahikList,
  criteriaList,
  onUpdateProgram,
  onAddRecipientHistory,
  recipientHistory,
  onAddMonitoring,
}: ProgramCandidatesProps) {

  if (!program || !mustahikList || !Array.isArray(mustahikList) || !criteriaList || !Array.isArray(criteriaList)) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Data Error</AlertTitle>
        <AlertDescription>Data program atau kriteria tidak valid (Corrupted). Silakan refresh halaman.</AlertDescription>
      </Alert>
    );
  }

  const [selectedMustahikIds, setSelectedMustahikIds] = useState<string[]>(program.selectedCandidates || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortFilter, setSortFilter] = useState<string>('default');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get candidates from selected mustahik
  const candidates = useMemo(() => {
    return mustahikList.filter(m => (selectedMustahikIds || []).includes(m.id));
  }, [mustahikList, selectedMustahikIds]);

  // Calculate MOORA results for selected candidates
  const results: CandidateWithScore[] = useMemo(() => {
    if (candidates.length === 0) return [];
    return calculateMOORA(candidates, criteriaList);
  }, [candidates, criteriaList]);

  // Calculate MOORA for ALL mustahik (for sorting)
  const allMooraResults = useMemo(() => {
    if (mustahikList.length === 0) return [];
    return calculateMOORA(mustahikList, criteriaList);
  }, [mustahikList, criteriaList]);

  // Get mustahik IDs who have received from ANY program
  const receivedMustahikIds = useMemo(() => {
    return new Set(recipientHistory.map(h => h.mustahikId));
  }, [recipientHistory]);

  // Filter and sort mustahik list
  const filteredMustahik = useMemo(() => {
    let filtered = mustahikList.filter(m =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply sorting
    if (sortFilter === 'moora_highest') {
      // Sort by MOORA score (all mustahik)
      filtered = filtered.sort((a, b) => {
        const scoreA = allMooraResults.find(r => r.id === a.id)?.mooraScore || 0;
        const scoreB = allMooraResults.find(r => r.id === b.id)?.mooraScore || 0;
        return scoreB - scoreA;
      });
    } else if (sortFilter === 'never_received_highest') {
      // Filter to only those who never received, then sort by MOORA
      filtered = filtered
        .filter(m => !receivedMustahikIds.has(m.id))
        .sort((a, b) => {
          const scoreA = allMooraResults.find(r => r.id === a.id)?.mooraScore || 0;
          const scoreB = allMooraResults.find(r => r.id === b.id)?.mooraScore || 0;
          return scoreB - scoreA;
        });
    }

    return filtered;
  }, [mustahikList, searchTerm, sortFilter, allMooraResults, receivedMustahikIds]);

  // Get finalized recipients for this program
  const programRecipients = useMemo(() => {
    return recipientHistory.filter(h => h.programId === program.id);
  }, [recipientHistory, program.id]);

  const subCriteriaWeights = useMemo(() => getSubCriteriaWeights(criteriaList), [criteriaList]);

  const handleToggleCandidate = (mustahikId: string) => {
    setSelectedMustahikIds(prev => {
      const current = prev || [];
      if (current.includes(mustahikId)) {
        return current.filter(id => id !== mustahikId);
      } else {
        return [...current, mustahikId];
      }
    });
  };

  const handleSaveCandidates = () => {
    const updatedProgram = {
      ...program,
      selectedCandidates: selectedMustahikIds,
    };
    onUpdateProgram(program.id, updatedProgram);
    alert('Calon penerima berhasil disimpan!');
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleFinalizeRecipients = async () => {
    if (results.length === 0) {
      alert('Tidak ada calon penerima yang dipilih!');
      return;
    }

    setIsSaving(true);
    try {
      // Take top N recipients based on quota
      const recipients = results.slice(0, program.quota);

      // Add to recipient history sequentially or in parallel
      const promises = recipients.map((recipient) => {
        const history: RecipientHistory = {
          id: Date.now().toString() + Math.random(), // Frontend ID, backend usually ignores or overwrites
          mustahikId: recipient.id,
          mustahikName: recipient.name,
          programId: program.id,
          programName: program.name,
          amount: program.budgetPerRecipient,
          receivedDate: new Date().toISOString(),
          mooraScore: recipient.mooraScore,
          rank: recipient.rank,
          notes: `Rank ${recipient.rank} dari ${results.length} calon penerima`,
        };
        return onAddRecipientHistory(history);
      });

      await Promise.all(promises);

      // Update program status
      const updatedProgram = {
        ...program,
        status: 'completed' as const,
      };
      onUpdateProgram(program.id, updatedProgram);

      alert(`${recipients.length} penerima berhasil ditetapkan!`);
    } catch (error) {
      console.error('Failed to finalize recipients:', error);
      alert('Gagal menetapkan penerima. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMonitoringSubmit = (data: Partial<MonitoringData>, recipient: RecipientHistory) => {
    // Construct full MonitoringData
    const newMonitoring: MonitoringData = {
      id: Date.now().toString(),
      mustahikId: recipient.mustahikId,
      mustahikName: recipient.mustahikName,
      programId: program.id,
      programName: program.name,
      monitoringDate: data.monitoringDate || new Date().toISOString(),
      businessProgress: {
        businessType: data.businessProgress?.businessType || '',
        revenue: data.businessProgress?.revenue || 0,
        profit: data.businessProgress?.profit || 0,
        employeeCount: 0,
        businessStatus: data.businessProgress?.businessStatus || 'stabil',
      },
      socialEconomicCondition: {
        monthlyIncome: data.socialEconomicCondition?.monthlyIncome || 0,
        monthlyExpenditure: data.socialEconomicCondition?.monthlyExpenditure || 0,
        dependentCount: 0,
        housingCondition: data.socialEconomicCondition?.housingCondition || 'sedang',
        healthCondition: 'sehat',
        educationLevel: 'tetap',
      },
      challenges: data.challenges || '',
      achievements: data.achievements || '',
      nextPlan: data.nextPlan || '',
      surveyor: 'System',
      notes: data.notes || '',
    };
    onAddMonitoring(newMonitoring);
  };

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

  // Check if mustahik has received from this program
  const hasReceivedFromProgram = (mustahikId: string) => {
    return recipientHistory.some(h => h.mustahikId === mustahikId && h.programId === program.id);
  };

  return (
    <Tabs defaultValue="selection" className="space-y-4">
      {/* Tab Header - All 4 buttons in one row */}
      <div className="flex items-center gap-2 flex-wrap">
        <TabsList className="bg-transparent p-0 h-auto gap-2">
          <TabsTrigger
            value="selection"
            className="gap-2 px-4 py-2 rounded-lg border-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
          >
            <Users className="w-4 h-4" />
            <span>Pilih Calon</span>
            <span className="ml-1 text-xs opacity-80">({selectedMustahikIds.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="results"
            className="gap-2 px-4 py-2 rounded-lg border-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Hasil MOORA</span>
          </TabsTrigger>
          <TabsTrigger
            value="recipients"
            className="gap-2 px-4 py-2 rounded-lg border-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 data-[state=active]:bg-amber-600 data-[state=active]:text-white transition-all"
          >
            <Gift className="w-4 h-4" />
            <span>Penerima</span>
            <span className="ml-1 text-xs opacity-80">({programRecipients.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Save Button - Same row, at the end */}
        <Button
          onClick={handleSaveCandidates}
          className="gap-2 ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
        >
          <Save className="w-4 h-4" />
          Simpan Pilihan ({selectedMustahikIds.length})
        </Button>
      </div>

      {/* Selection Tab */}
      <TabsContent value="selection" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Pilih Calon Penerima dari Database Mustahik</CardTitle>
            <CardDescription>
              Pilih mustahik yang akan menjadi calon penerima untuk program ini. Kuota: <span className="font-bold text-blue-600">{program.quota}</span> orang
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mustahikList.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Belum ada data mustahik. Silakan tambahkan mustahik terlebih dahulu di menu "Mustahik".
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {/* Search and Filter Controls */}
                <div className="flex flex-col md:flex-row gap-3 mb-4">
                  <Input
                    placeholder="Cari nama atau alamat mustahik..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="flex-1"
                  />
                  <Select value={sortFilter} onValueChange={(val: string) => { setSortFilter(val); setCurrentPage(1); }}>
                    <SelectTrigger className="w-full md:w-64">
                      <Filter className="w-4 h-4 mr-2 text-slate-400" />
                      <SelectValue placeholder="Urutkan..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Urutan Default</SelectItem>
                      <SelectItem value="moora_highest">Skor MOORA Tertinggi</SelectItem>
                      <SelectItem value="never_received_highest">Belum Terima + MOORA Tertinggi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Alamat</TableHead>
                        <TableHead>No. Telepon</TableHead>
                        <TableHead className="text-center">Skor MOORA</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMustahik
                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                        .map((mustahik) => {
                          const isSelected = selectedMustahikIds.includes(mustahik.id);
                          const hasReceived = hasReceivedFromProgram(mustahik.id);
                          const mooraScore = allMooraResults.find(r => r.id === mustahik.id)?.mooraScore || 0;

                          return (
                            <TableRow
                              key={mustahik.id}
                              className={isSelected ? 'bg-slate-100 dark:bg-slate-800' : ''}
                            >
                              <TableCell>
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => handleToggleCandidate(mustahik.id)}
                                  disabled={hasReceived}
                                />
                              </TableCell>
                              <TableCell className="font-medium">{mustahik.name}</TableCell>
                              <TableCell>{mustahik.address}</TableCell>
                              <TableCell>{mustahik.phone}</TableCell>
                              <TableCell className="text-center">
                                <Badge variant="secondary" className="font-mono">
                                  {mooraScore.toFixed(4)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                {hasReceived ? (
                                  <Badge className="bg-emerald-500 hover:bg-emerald-600 gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Sudah Terima
                                  </Badge>
                                ) : isSelected ? (
                                  <Badge className="bg-blue-500 hover:bg-blue-600">Terpilih</Badge>
                                ) : (
                                  <Badge variant="outline">Tersedia</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      {filteredMustahik.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                            Tidak ada mustahik yang sesuai dengan pencarian/filter
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {filteredMustahik.length > itemsPerPage && (
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={Math.ceil(filteredMustahik.length / itemsPerPage)}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Results Tab */}
      <TabsContent value="results" className="space-y-4">
        {results.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Pilih calon penerima terlebih dahulu untuk melihat hasil analisis MOORA.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Calon</CardDescription>
                  <CardTitle className="text-3xl">{results.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Akan Ditetapkan</CardDescription>
                  <CardTitle className="text-3xl">{Math.min(program.quota, results.length)}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Skor Tertinggi</CardDescription>
                  <CardTitle className="text-3xl">{results[0]?.mooraScore.toFixed(4)}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Results Table */}
            <Card>
              <CardHeader>
                <CardTitle>Hasil Perangkingan MOORA</CardTitle>
                <CardDescription>
                  Ranking calon penerima berdasarkan analisis metode MOORA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead className="text-center">Skor MOORA</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result) => {
                        const willReceive = result.rank <= program.quota;
                        return (
                          <TableRow key={result.id}>
                            <TableCell>{getRankBadge(result.rank)}</TableCell>
                            <TableCell className="font-medium">{result.name}</TableCell>
                            <TableCell className="text-center">{result.mooraScore.toFixed(4)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end mt-4">
                  <Button
                    onClick={handleFinalizeRecipients}
                    disabled={program.status === 'completed' || isSaving}
                    className="gap-2"
                  >
                    {program.status === 'completed' ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Sudah Ditetapkan
                      </>
                    ) : (
                      <>{isSaving ? 'Menyimpan...' : `Tetapkan ${Math.min(program.quota, results.length)} Penerima`}</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Calculations */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-indigo-600" />
                  <CardTitle>Detail Perhitungan MOORA</CardTitle>
                </div>
                <CardDescription>
                  Langkah-langkah perhitungan metode MOORA secara detail
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full space-y-2">
                  {/* Step 1: Decision Matrix with Sub-Criteria */}
                  <AccordionItem value="decision-matrix" className="border border-slate-200 dark:border-slate-800 rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline text-slate-900 dark:text-slate-100">
                      <span className="flex items-center gap-2">
                        <Badge variant="outline" className="text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-600">Step 1</Badge>
                        Matriks Keputusan (Nilai Sub-Kriteria)
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Nilai setiap sub-kriteria (aspek) yang diinput untuk masing-masing calon penerima.
                      </p>
                      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                              <TableHead className="sticky left-0 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Nama</TableHead>
                              {criteriaList?.map(c => (
                                c.aspects?.map(aspect => (
                                  <TableHead key={aspect.code} className="text-center text-xs px-2 text-slate-700 dark:text-slate-300">
                                    <div className="flex flex-col items-center">
                                      <span className="font-mono">{aspect.code}</span>
                                      <span className="text-[10px] text-slate-400 truncate max-w-[60px]" title={aspect.name}>{aspect.name}</span>
                                    </div>
                                  </TableHead>
                                ))
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {results.map(r => (
                              <TableRow key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <TableCell className="font-medium sticky left-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100">{r.name}</TableCell>
                                {criteriaList?.map(c => (
                                  c.aspects?.map(aspect => (
                                    <TableCell key={aspect.code} className="text-center font-mono text-sm text-slate-600 dark:text-slate-400">
                                      {r.subCriteria?.[aspect.code] ?? 0}
                                    </TableCell>
                                  ))
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Step 2: Normalized Matrix with Sub-Criteria */}
                  <AccordionItem value="normalized-matrix" className="border border-slate-200 dark:border-slate-800 rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline text-slate-900 dark:text-slate-100">
                      <span className="flex items-center gap-2">
                        <Badge variant="outline" className="text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-600">Step 2</Badge>
                        Matriks Ternormalisasi (Per Sub-Kriteria)
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Normalisasi vektor untuk setiap sub-kriteria: xij* = xij / √(Σxij²)
                      </p>
                      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                              <TableHead className="sticky left-0 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Nama</TableHead>
                              {criteriaList?.map(c => (
                                c.aspects?.map(aspect => (
                                  <TableHead key={aspect.code} className="text-center text-xs px-2 text-slate-700 dark:text-slate-300">
                                    <span className="font-mono">{aspect.code}</span>
                                  </TableHead>
                                ))
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {results.map(r => (
                              <TableRow key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <TableCell className="font-medium sticky left-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100">{r.name}</TableCell>
                                {criteriaList?.map(c => (
                                  c.aspects?.map(aspect => (
                                    <TableCell key={aspect.code} className="text-center font-mono text-xs text-slate-600 dark:text-slate-400">
                                      {(r.normalizedSubCriteria?.[aspect.code] ?? 0).toFixed(4)}
                                    </TableCell>
                                  ))
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Step 3: Criteria Normalization (Average of Sub-Criteria) */}
                  <AccordionItem value="criteria-normalization" className="border border-slate-200 dark:border-slate-800 rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline text-slate-900 dark:text-slate-100">
                      <span className="flex items-center gap-2">
                        <Badge variant="outline" className="text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-600">Step 3</Badge>
                        Nilai Normalisasi Kriteria (Rata-rata Sub-Kriteria)
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Nilai normalisasi setiap kriteria diperoleh dari rata-rata nilai normalisasi sub-kriteria yang dimilikinya.
                      </p>
                      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                              <TableHead className="sticky left-0 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Nama</TableHead>
                              {criteriaList?.map(c => (
                                <TableHead key={c.code} className="text-center text-xs px-2 text-slate-700 dark:text-slate-300">
                                  <div className="flex flex-col items-center">
                                    <span className="font-mono">{c.code}</span>
                                    <span className="text-[10px] text-slate-400">Avg(Sub)</span>
                                  </div>
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {results.map(r => (
                              <TableRow key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <TableCell className="font-medium sticky left-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100">{r.name}</TableCell>
                                {criteriaList?.map(c => (
                                  <TableCell key={c.code} className="text-center font-mono text-xs text-slate-600 dark:text-slate-400">
                                    {(r.avgNormalizedCriteria?.[c.code] ?? 0).toFixed(4)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Step 4: Weighted Normalized Matrix with Criteria */}
                  <AccordionItem value="weighted-matrix" className="border border-slate-200 dark:border-slate-800 rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline text-slate-900 dark:text-slate-100">
                      <span className="flex items-center gap-2">
                        <Badge variant="outline" className="text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-600">Step 4</Badge>
                        Matriks Ternormalisasi Terbobot (Per Kriteria)
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                        Nilai rata-rata ternormalisasi (Step 3) dikalikan dengan bobot kriteria utama.
                      </p>
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Bobot per Kriteria:</p>
                        <div className="flex flex-wrap gap-2">
                          {criteriaList?.map(c => (
                            <Badge key={c.code} variant="secondary" className="font-mono text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {c.code}: {(c.weight * 100).toFixed(0)}%
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                              <TableHead className="sticky left-0 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Nama</TableHead>
                              {criteriaList?.map(c => (
                                <TableHead key={c.code} className="text-center text-xs px-2 text-slate-700 dark:text-slate-300">
                                  <div className="flex flex-col items-center">
                                    <span className="font-mono">{c.code}</span>
                                    <span className="text-[10px] text-slate-400">Step 3 × {(c.weight * 100).toFixed(0)}%</span>
                                  </div>
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {results.map(r => (
                              <TableRow key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <TableCell className="font-medium sticky left-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100">{r.name}</TableCell>
                                {criteriaList?.map(c => (
                                  <TableCell key={c.code} className="text-center font-mono text-xs text-slate-600 dark:text-slate-400">
                                    {(r.weightedNormalized?.[c.code] ?? 0).toFixed(4)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Step 4: Optimization Value (Yi) */}
                  <AccordionItem value="optimization" className="border border-slate-200 dark:border-slate-800 rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline text-slate-900 dark:text-slate-100">
                      <span className="flex items-center gap-2">
                        <Badge variant="outline" className="text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-600">Step 5</Badge>
                        Nilai Optimasi (Yi)
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Yi = Σ(nilai terbobot semua kriteria). Karena semua kriteria benefit, skor MOORA = jumlah total.
                      </p>
                      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                              <TableHead className="text-slate-700 dark:text-slate-300">Nama</TableHead>
                              <TableHead className="text-center text-slate-700 dark:text-slate-300">Σ Weighted Criteria</TableHead>
                              <TableHead className="text-center text-slate-700 dark:text-slate-300">Skor MOORA (Yi)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {results.map(r => {
                              const sumWeighted = Object.values(r.weightedNormalized || {}).reduce((sum, val) => sum + val, 0);
                              return (
                                <TableRow key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">{r.name}</TableCell>
                                  <TableCell className="text-center font-mono text-sm text-slate-600 dark:text-slate-400">
                                    {sumWeighted.toFixed(4)}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono hover:bg-slate-200 dark:hover:bg-slate-700">
                                      {r.mooraScore.toFixed(4)}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Step 5: Final Ranking */}
                  <AccordionItem value="final-ranking" className="border border-slate-200 dark:border-slate-800 rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline text-slate-900 dark:text-slate-100">
                      <span className="flex items-center gap-2">
                        <Badge variant="outline" className="text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-600">Step 6</Badge>
                        Perangkingan Akhir
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Calon diurutkan berdasarkan skor MOORA tertinggi. Skor tertinggi = prioritas tertinggi.
                      </p>
                      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                              <TableHead className="w-20 text-slate-700 dark:text-slate-300">Rank</TableHead>
                              <TableHead className="text-slate-700 dark:text-slate-300">Nama</TableHead>
                              <TableHead className="text-center text-slate-700 dark:text-slate-300">Skor MOORA</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {results.map(r => (
                              <TableRow key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <TableCell>{getRankBadge(r.rank)}</TableCell>
                                <TableCell className="font-medium text-slate-900 dark:text-slate-100">{r.name}</TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="secondary" className="font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                    {r.mooraScore.toFixed(4)}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </>
        )}
      </TabsContent>

      {/* Recipients Tab */}
      <TabsContent value="recipients" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Daftar Penerima Bantuan - {program.name}</CardTitle>
            <CardDescription>
              Daftar mustahik yang telah resmi menerima bantuan dari program ini.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {programRecipients.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Belum ada penerima yang ditetapkan untuk program ini. Silakan tetapkan penerima di tab "Hasil MOORA".
                </AlertDescription>
              </Alert>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Nama Mustahik</TableHead>
                      <TableHead>Total Diterima</TableHead>
                      <TableHead>Tanggal Terima</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...programRecipients]
                      .sort((a, b) => a.rank - b.rank)
                      .map((recipient) => (
                        <TableRow key={recipient.id}>
                          <TableCell>{getRankBadge(recipient.rank)}</TableCell>
                          <TableCell className="font-medium">{recipient.mustahikName}</TableCell>
                          <TableCell>Rp {recipient.amount.toLocaleString('id-ID')}</TableCell>
                          <TableCell>{new Date(recipient.receivedDate).toLocaleDateString('id-ID')}</TableCell>
                          <TableCell className="text-right">
                            <MonitoringForm
                              mustahikId={recipient.mustahikId}
                              mustahikName={recipient.mustahikName}
                              programId={program.id}
                              programs={[program]} // Lock to this program
                              onSubmit={(data) => handleMonitoringSubmit(data, recipient)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
