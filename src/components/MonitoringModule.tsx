import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, Search, AlertCircle, CheckCircle2, TrendingUp, TrendingDown, CalendarClock, ChevronLeft, ChevronRight } from 'lucide-react';
import { MonitoringForm } from './MonitoringForm';
import { PaginationControls } from './ui/pagination-controls';
import type { MonitoringData, RecipientHistory, UserRole, User as UserType, AidProgram } from '../types';

interface MonitoringModuleProps {
  monitoringData: MonitoringData[];
  recipientHistory: RecipientHistory[];
  aidPrograms: AidProgram[];
  onAdd: (data: MonitoringData) => void;
  userRole: UserRole;
  currentUser: UserType;
  selectedId?: string | null;
  onClearSelection?: () => void;
}

export function MonitoringModule({
  monitoringData,
  recipientHistory,
  aidPrograms,
  onAdd,
  userRole,
  currentUser,
  selectedId,
  onClearSelection
}: MonitoringModuleProps) {
  const [viewingData, setViewingData] = useState<MonitoringData | null>(null);
  const [historyViewingMustahikId, setHistoryViewingMustahikId] = useState<string | null>(null);
  const [historyCurrentIndex, setHistoryCurrentIndex] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [inputCurrentPage, setInputCurrentPage] = useState(1);
  const [monitoringStatusFilter, setMonitoringStatusFilter] = useState<string>('all'); // all, monitored, unmonitored
  const itemsPerPage = 10;

  // Handle Deep Linking
  useEffect(() => {
    // Check for monitoring ID from DashboardModule navigation
    const storedMonitoringId = localStorage.getItem('viewMonitoringId');
    if (storedMonitoringId) {
      const target = monitoringData.find(m => m.id === storedMonitoringId);
      if (target) {
        setViewingData(target);
      }
      localStorage.removeItem('viewMonitoringId');
    }

    // Check for history open deep link
    const storedHistoryId = localStorage.getItem('viewMonitoringHistoryMustahikId');
    if (storedHistoryId) {
      setHistoryViewingMustahikId(storedHistoryId);
      setHistoryCurrentIndex(0);
      setViewingData(null);
      localStorage.removeItem('viewMonitoringHistoryMustahikId');
    }

    // Handle selectedId prop
    if (selectedId) {
      const target = monitoringData.find(m => m.id === selectedId);
      if (target) {
        setViewingData(target);
      }
      onClearSelection?.();
    }
  }, [selectedId, monitoringData, onClearSelection]);

  const canAdd = userRole === 'super_admin' || userRole === 'surveyor' || userRole === 'manajer';

  const checkMonitoringStatus = (mustahikId: string) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const hasMonitoringThisMonth = monitoringData.some(m => {
      const mDate = new Date(m.monitoringDate);
      return m.mustahikId === mustahikId &&
        mDate.getMonth() === currentMonth &&
        mDate.getFullYear() === currentYear;
    });

    return hasMonitoringThisMonth;
  };

  const calculateEconomicStatus = (currentId: string, mustahikId: string) => {
    // get current and previous
    const history = monitoringData
      .filter(m => m.mustahikId === mustahikId)
      .sort((a, b) => {
        const timeDiff = new Date(a.monitoringDate).getTime() - new Date(b.monitoringDate).getTime();
        if (timeDiff !== 0) return timeDiff;
        return a.id.localeCompare(b.id);
      });
      
    const currentIndex = history.findIndex(m => m.id === currentId);
    if (currentIndex <= 0) {
        return <Badge variant="outline" className="bg-slate-100 text-slate-700">Data Awal</Badge>;
    }
    
    const current = history[currentIndex];
    const prev = history[currentIndex - 1];
    
    // Y_t (Pendapatan Bersih)
    const yt = current.businessProgress?.netIncome ?? current.businessProgress?.profit ?? 0;
    const yt_prev = prev.businessProgress?.netIncome ?? prev.businessProgress?.profit ?? 0;
    
    // C_t (Konsumsi Esensial)
    const ct = current.socialEconomicCondition?.monthlyExpenditure ?? 0;
    const ct_prev = prev.socialEconomicCondition?.monthlyExpenditure ?? 0;
    
    // Gy (Laju Pertumbuhan Pendapatan)
    const gy = yt_prev > 0 ? ((yt - yt_prev) / yt_prev) * 100 : (yt > 0 ? 100 : 0);
    
    // Gc (Laju Pertumbuhan Konsumsi)
    const gc = ct_prev > 0 ? ((ct - ct_prev) / ct_prev) * 100 : (ct > 0 ? 100 : 0);
    
    // Logic: 
    // Gy > Gc = Ekonomi Membaik
    // Gy = Gc = Stagnan
    // Gy < Gc = Memburuk
    
    if (gy > gc) {
      return <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 font-semibold" title={`Gy: ${gy.toFixed(1)}%, Gc: ${gc.toFixed(1)}%`}>🟢 Ekonomi Membaik</Badge>;
    } else if (gy === gc) {
      return <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800 font-semibold" title={`Gy: ${gy.toFixed(1)}%, Gc: ${gc.toFixed(1)}%`}>🔵 Stagnan</Badge>;
    } else {
      return <Badge variant="outline" className="bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800 font-semibold" title={`Gy: ${gy.toFixed(1)}%, Gc: ${gc.toFixed(1)}%`}>🔴 Memburuk</Badge>;
    }
  };

  const handleAddMonitoring = (data: Partial<MonitoringData>) => {
    // Generate ID and complete the object
    const newMonitoring: MonitoringData = {
      id: Date.now().toString(),
      mustahikId: data.mustahikId!,
      mustahikName: recipientHistory.find(r => r.mustahikId === data.mustahikId)?.mustahikName || 'Unknown',
      programId: data.programId!,
      programName: aidPrograms.find(p => p.id === data.programId)?.name || 'Unknown',
      monitoringDate: data.monitoringDate ? new Date(data.monitoringDate).toISOString() : new Date().toISOString(),
      businessProgress: {
        businessType: data.businessProgress?.businessType || '',
        revenue: data.businessProgress?.revenue || 0,
        operationalCost: data.businessProgress?.operationalCost || 0,
        netIncome: data.businessProgress?.netIncome || 0,
        profit: data.businessProgress?.profit || 0,
        employeeCount: 0,
        businessStatus: 'stabil',
      },
      socialEconomicCondition: {
        monthlyExpenditure: data.socialEconomicCondition?.monthlyExpenditure || 0,
        monthlyIncome: data.socialEconomicCondition?.monthlyIncome || 0,
        dependentCount: 0,
        housingCondition: data.socialEconomicCondition?.housingCondition || 'sedang',
        healthCondition: 'sehat',
        educationLevel: 'tetap',
      },
      challenges: data.challenges || '',
      achievements: data.achievements || '',
      nextPlan: data.nextPlan || '',
      surveyor: currentUser.name,
      notes: data.notes || '',
    };
    onAdd(newMonitoring);
  };

  // Eliminasi duplikat agar 1 Mustahik hanya muncul 1 kali di tabel input
  const uniqueRecipientsMap = new Map();
  recipientHistory.forEach(r => {
    if (!uniqueRecipientsMap.has(r.mustahikId)) {
      uniqueRecipientsMap.set(r.mustahikId, r);
    }
  });

  const filteredRecipients = Array.from(uniqueRecipientsMap.values()).filter(r => {
    const matchesSearch = r.mustahikName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (monitoringStatusFilter === 'all') return true;

    const isMonitored = checkMonitoringStatus(r.mustahikId);
    if (monitoringStatusFilter === 'monitored') return isMonitored;
    if (monitoringStatusFilter === 'unmonitored') return !isMonitored;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {userRole === 'mustahik' ? 'Monitoring Usaha Saya' : 'Monitoring Mustahik'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            {userRole === 'mustahik'
              ? 'Pantau dan laporkan perkembangan usaha Anda'
              : 'Pantau perkembangan usaha dan pendapatan penerima bantuan'}
          </p>
        </div>

        {userRole !== 'mustahik' && (
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="w-full md:w-48">
              <Select value={monitoringStatusFilter} onValueChange={setMonitoringStatusFilter}>
                <SelectTrigger className="bg-white dark:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="w-4 h-4 text-slate-500" />
                    <SelectValue placeholder="Status Monitoring" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="monitored">Sudah Dimonitoring</SelectItem>
                  <SelectItem value="unmonitored">Belum Dimonitoring</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <Input
              placeholder="Cari mustahik..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-blue-500 transition-colors"
            />
          </div>
        )}
      </div>

      {/* Stats Cards - Simplified for Mustahik (maybe hide total recipients since it's just 1) */}
      <div className={`grid gap-4 ${userRole === 'mustahik' ? 'md:grid-cols-2' : 'md:grid-cols-4'}`}>
        {userRole !== 'mustahik' && (
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Penerima</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{recipientHistory.length}</div>
              <p className="text-xs text-slate-500 mt-1">Mustahik yang menerima bantuan</p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {userRole === 'mustahik' ? 'Status Bulan Ini' : 'Sudah Dimonitoring'}
            </CardTitle>
            <div className="h-4 w-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            {userRole === 'mustahik' ? (
              <div className="flex flex-col gap-1">
                {/* Check if user's own mustahik record is monitored */}
                {(() => {
                  const myRecord = recipientHistory.length > 0 ? recipientHistory[0] : null;
                  const isMonitored = myRecord ? checkMonitoringStatus(myRecord.mustahikId) : false;
                  return (
                    <>
                      <div className={`text-2xl font-bold ${isMonitored ? "text-emerald-600" : "text-amber-500"}`}>
                        {isMonitored ? "Sudah Lapor" : "Belum Lapor"}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Status laporan bulan ini</p>
                    </>
                  );
                })()}
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {recipientHistory.filter(r => checkMonitoringStatus(r.mustahikId)).length}
                </div>
                <p className="text-xs text-slate-500 mt-1">Bulan ini</p>
              </>
            )}
          </CardContent>
        </Card>

        {userRole !== 'mustahik' && (
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Belum Dimonitoring</CardTitle>
              <div className="h-4 w-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {recipientHistory.filter(r => !checkMonitoringStatus(r.mustahikId)).length}
              </div>
              <p className="text-xs text-slate-500 mt-1">Perlu perhatian</p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Riwayat</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{monitoringData.length}</div>
            <p className="text-xs text-slate-500 mt-1">Record monitoring</p>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 1: Input Data Monitoring */}
      {/* If mustahik, enable input for themselves even if canAdd=false in original logic (override) */}
      {(canAdd || userRole === 'mustahik') && (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              {userRole === 'mustahik' ? 'Update Laporan Usaha' : 'Input Data Monitoring'}
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              {userRole === 'mustahik'
                ? 'Laporkan perkembangan usaha dan pendapatan Anda bulan ini'
                : 'Pilih mustahik untuk mencatat perkembangan usaha dan pendapatan'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead>Nama Mustahik</TableHead>
                    <TableHead className="text-center">Status Ekonomi</TableHead>
                    <TableHead className="text-center">Status Bulan Ini</TableHead>
                    <TableHead className="text-center">Riwayat</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecipients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        {userRole === 'mustahik'
                          ? 'Anda belum terdaftar sebagai penerima bantuan aktif.'
                          : 'Tidak ada data penerima bantuan yang cocok'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecipients
                      .slice((inputCurrentPage - 1) * 10, inputCurrentPage * 10)
                      .map((recipient) => {
                        const isMonitored = checkMonitoringStatus(recipient.mustahikId);
                        
                        // Cek status ekonomi terakhir menggunakan kalkulasi yang sama dengan Riwayat Monitoring
                        const getLatestEconomicStatusBadge = (mustahikId: string) => {
                          const records = monitoringData.filter(m => m.mustahikId === mustahikId);
                          if (records.length === 0) {
                            return <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">Belum Ada Data</Badge>;
                          }
                          
                          // Urutkan dari yang terbaru, jika tanggal sama persis (kasus dummy data) gunakan ID sebagai fallback pengurutan
                          records.sort((a, b) => {
                            const timeDiff = new Date(b.monitoringDate).getTime() - new Date(a.monitoringDate).getTime();
                            if (timeDiff !== 0) return timeDiff;
                            return b.id.localeCompare(a.id); // Stabil sort
                          });
                          
                          const latest = records[0];
                          return calculateEconomicStatus(latest.id, mustahikId);
                        };

                        return (
                          <TableRow key={recipient.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                            <TableCell className="font-medium">{recipient.mustahikName}</TableCell>
                            <TableCell className="text-center">{getLatestEconomicStatusBadge(recipient.mustahikId)}</TableCell>
                            <TableCell className="text-center">
                              {isMonitored ? (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Sudah
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 inline-flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> Belum
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all active:scale-95"
                                onClick={() => {
                                  setHistoryViewingMustahikId(recipient.mustahikId);
                                  setHistoryCurrentIndex(0);
                                }}
                              >
                                <Eye className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                              </Button>
                            </TableCell>
                            <TableCell className="text-center">
                              <MonitoringForm
                                mustahikId={recipient.mustahikId}
                                mustahikName={recipient.mustahikName}
                                programId={recipient.programId}
                                programs={aidPrograms.map(p => ({ id: p.id, name: p.name }))}
                                onSubmit={handleAddMonitoring}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                  )}
                </TableBody>
              </Table>
            </div>
            {userRole !== 'mustahik' && (
              <div className="px-4 border-t border-slate-100 dark:border-slate-800">
                <PaginationControls
                  currentPage={inputCurrentPage}
                  totalPages={Math.ceil(filteredRecipients.length / 10)}
                  onPageChange={setInputCurrentPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SECTION 2: History (Existing) */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Riwayat Monitoring
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            Log aktivitas monitoring yang telah dilakukan
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead className="text-center">Tanggal</TableHead>
                  <TableHead>Nama Mustahik</TableHead>
                  <TableHead className="text-center">Jenis Usaha</TableHead>
                  <TableHead className="text-center">Status Ekonomi</TableHead>
                  <TableHead className="text-center">Surveyor</TableHead>
                  <TableHead className="text-center">Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monitoringData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      Belum ada data monitoring
                    </TableCell>
                  </TableRow>
                ) : (
                  [...monitoringData]
                    .reverse()
                    .sort((a, b) => new Date(b.monitoringDate).getTime() - new Date(a.monitoringDate).getTime())
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((data) => (
                      <TableRow key={data.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <TableCell className="text-center text-sm">
                          {data.monitoringDate ? new Date(data.monitoringDate).toLocaleDateString('id-ID') : '-'}
                        </TableCell>
                        <TableCell className="font-medium">{data.mustahikName}</TableCell>
                        <TableCell className="text-center">{data.businessProgress?.businessType || '-'}</TableCell>
                        <TableCell className="text-center">{calculateEconomicStatus(data.id, data.mustahikId)}</TableCell>
                        <TableCell className="text-center text-sm text-slate-500">{data.surveyor}</TableCell>
                        <TableCell className="text-center">
                          <Dialog open={viewingData?.id === data.id} onOpenChange={(open: boolean) => !open && setViewingData(null)}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all active:scale-95" onClick={() => setViewingData(data)}>
                                <Eye className="w-4 h-4 text-slate-400" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[580px] w-[95vw] h-[700px] max-h-[90vh] dialog-bg-navy dialog-border-navy border-0 shadow-2xl p-0 overflow-hidden flex flex-col">
                              <div className="bg-green-600 px-6 py-4 text-white relative shrink-0 overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                                <DialogHeader className="pt-0">
                                  <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">Detail Monitoring - {data.mustahikName}</DialogTitle>
                                  <DialogDescription className="text-green-50/90 font-medium">
                                    Tercatat pada {new Date(data.monitoringDate).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                                  </DialogDescription>
                                </DialogHeader>
                              </div>
                              {/* Detail Content */}
                              <div className="flex-1 overflow-y-auto p-6">
                                {/* Detail Content */}
                                <div className="space-y-6 pt-4">
                                  <div className="grid grid-cols-1 gap-4 text-sm">
                                    <div className="space-y-1">
                                      <p className="text-slate-500">Surveyor</p>
                                      <p className="font-medium">{data.surveyor}</p>
                                    </div>
                                  </div>

                                  <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50">
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                                      Metrik Usaha
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                      <div>
                                        <p className="text-xs text-slate-500">Omzet</p>
                                        <p className="font-bold text-emerald-600">Rp {(data.businessProgress?.revenue || 0).toLocaleString('id-ID')}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-500">Operasional</p>
                                        <p className="font-bold text-rose-600">Rp {(data.businessProgress?.operationalCost || 0).toLocaleString('id-ID')}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-500">Netto</p>
                                        <p className="font-bold text-blue-600">Rp {(() => {
                                            const bp = data.businessProgress || {} as any;
                                            if (bp.netIncome !== undefined) return bp.netIncome;
                                            if (bp.revenue !== undefined && bp.operationalCost !== undefined) return bp.revenue - bp.operationalCost;
                                            return bp.profit ?? 0;
                                        })().toLocaleString('id-ID')}</p>
                                      </div>
                                      <div className="col-span-2 md:col-span-1">
                                        <p className="text-xs text-slate-500">Status Ekonomi (Gy vs Gc)</p>
                                        <div className="mt-1">{calculateEconomicStatus(data.id, data.mustahikId)}</div>
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-500">Jenis</p>
                                        <p className="font-medium max-w-full overflow-hidden text-ellipsis whitespace-nowrap">{data.businessProgress?.businessType}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Revenue Trend Chart */}
                                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50">
                                    <h4 className="font-semibold mb-4 text-sm text-slate-700 dark:text-slate-300">Tren Profit Bulanan</h4>
                                    {(() => {
                                      const trendData = monitoringData
                                        .filter(m => m.mustahikId === data.mustahikId)
                                        .sort((a, b) => new Date(a.monitoringDate).getTime() - new Date(b.monitoringDate).getTime())
                                        .map(m => ({
                                          date: new Date(m.monitoringDate).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
                                          netIncome: (() => {
                                              const bp = m.businessProgress || {} as any;
                                              if (bp.netIncome !== undefined) return bp.netIncome;
                                              if (bp.revenue !== undefined && bp.operationalCost !== undefined) return bp.revenue - bp.operationalCost;
                                              return bp.profit ?? 0;
                                          })()
                                        }));

                                      if (trendData.length === 0) {
                                        return (
                                          <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">
                                            Belum ada data tren pendapatan
                                          </div>
                                        );
                                      }

                                      if (trendData.length === 1) {
                                        return (
                                          <div className="h-[200px] flex flex-col items-center justify-center">
                                            <p className="text-2xl font-bold text-blue-600">Rp {trendData[0].netIncome.toLocaleString('id-ID')}</p>
                                            <p className="text-sm text-slate-400 mt-1">Netto pada {trendData[0].date}</p>
                                            <p className="text-xs text-slate-400 mt-2">Perlu minimal 2 data monitoring untuk menampilkan grafik tren</p>
                                          </div>
                                        );
                                      }

                                      return (
                                        <div style={{ width: '100%', height: 200, minHeight: 200 }}>
                                          <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart
                                              data={trendData}
                                              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                            >
                                              <defs>
                                                <linearGradient id={`colorRevenue-${data.id}`} x1="0" y1="0" x2="0" y2="1">
                                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                              </defs>
                                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                              <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 11, fill: '#64748b' }}
                                              />
                                              <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}jt`}
                                                width={40}
                                              />
                                              <Tooltip
                                                contentStyle={{
                                                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                  borderRadius: '8px',
                                                  border: '1px solid #e2e8f0',
                                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                                }}
                                                itemStyle={{ color: '#3b82f6', fontWeight: 600 }}
                                                formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Netto']}
                                                labelStyle={{ color: '#64748b', fontWeight: 500 }}
                                              />
                                              <Area
                                                type="monotone"
                                                dataKey="netIncome"
                                                stroke="#3b82f6"
                                                fillOpacity={1}
                                                fill={`url(#colorRevenue-${data.id})`}
                                                strokeWidth={2}
                                                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                                                activeDot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                                              />
                                            </AreaChart>
                                          </ResponsiveContainer>
                                        </div>
                                      );
                                    })()}
                                  </div>

                                  <div>
                                    <h4 className="font-semibold mb-3">Kondisi Sosial Ekonomi</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <p className="text-slate-500">Pendapatan RT</p>
                                        <p>Rp {(data.socialEconomicCondition?.monthlyIncome || 0).toLocaleString('id-ID')}</p>
                                      </div>
                                      <div>
                                        <p className="text-slate-500">Konsumsi Esensial</p>
                                        <p>Rp {(data.socialEconomicCondition?.monthlyExpenditure || 0).toLocaleString('id-ID')}</p>
                                      </div>
                                      <div>
                                        <p className="text-slate-500">Hunian</p>
                                        <p className="capitalize">{data.socialEconomicCondition?.housingCondition}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {(data.notes || data.challenges) && (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg text-sm space-y-3">
                                      {data.challenges && (
                                        <div>
                                          <p className="font-semibold text-slate-700 dark:text-slate-300">Tantangan</p>
                                          <p className="text-slate-600 dark:text-slate-400">{data.challenges}</p>
                                        </div>
                                      )}
                                      {data.notes && (
                                        <div>
                                          <p className="font-semibold text-slate-700 dark:text-slate-300">Catatan</p>
                                          <p className="text-slate-600 dark:text-slate-400">{data.notes}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="px-4 border-t border-slate-100 dark:border-slate-800">
            <PaginationControls
              currentPage={currentPage}
              totalPages={Math.ceil(monitoringData.length / itemsPerPage)}
              onPageChange={setCurrentPage}
            />
          </div>
        </CardContent>
      </Card>

      {/* History Navigator Dialog */}
      {(() => {
        const historyData = historyViewingMustahikId
          ? [...monitoringData]
            .reverse()
            .filter((m) => m.mustahikId === historyViewingMustahikId)
            .sort((a, b) => new Date(b.monitoringDate).getTime() - new Date(a.monitoringDate).getTime())
          : [];
        const currentData = historyData[historyCurrentIndex];

        return (
          <Dialog open={!!historyViewingMustahikId} onOpenChange={(open) => !open && setHistoryViewingMustahikId(null)}>
            <DialogContent className="max-w-[800px] w-[95vw] max-h-[85vh] dialog-bg-navy dialog-border-navy border-0 shadow-2xl p-0 overflow-hidden flex flex-col">
              {historyData.length === 0 ? (
                <>
                  <div className="bg-green-600 px-6 py-4 text-white relative shrink-0 overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <DialogHeader className="pt-0 relative z-10 w-full">
                      <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">Riwayat Kosong</DialogTitle>
                    </DialogHeader>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
                    <div className="text-center text-slate-500">
                      <Eye className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                      <p>Belum ada data riwayat monitoring untuk mustahik ini.</p>
                    </div>
                  </div>
                </>
              ) : currentData && (
                <>
                  <div className="bg-green-600 px-6 py-4 text-white relative shrink-0 overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <DialogHeader className="pt-0 relative z-10 w-full mb-4">
                      <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">Riwayat - {currentData.mustahikName}</DialogTitle>
                      <DialogDescription className="text-green-50/90 font-medium">
                        Catatan bulan {new Date(currentData.monitoringDate).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                      </DialogDescription>
                    </DialogHeader>
                    {historyData.length > 1 && (
                      <div className="flex items-center justify-between bg-green-700/50 rounded-lg p-1.5 relative z-10 text-sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-white hover:bg-white/20 hover:text-white"
                          disabled={historyCurrentIndex === historyData.length - 1}
                          onClick={() => setHistoryCurrentIndex(prev => prev + 1)}
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Bulan Sebelumnya
                        </Button>
                        <span className="font-medium px-2">
                          {historyData.length - historyCurrentIndex} / {historyData.length}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-white hover:bg-white/20 hover:text-white"
                          disabled={historyCurrentIndex === 0}
                          onClick={() => setHistoryCurrentIndex(prev => prev - 1)}
                        >
                          Bulan Selanjutnya
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {/* Detail Content */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6 pt-2">
                      {/* Header Info - Full Width Container */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm p-5 rounded-xl bg-white border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700">
                        <div className="space-y-1.5">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Surveyor</p>
                          <p className="font-bold text-slate-900 dark:text-white text-base">{currentData.surveyor}</p>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tanggal Pengamatan</p>
                          <p className="font-bold text-slate-900 dark:text-white text-base">
                            {new Date(currentData.monitoringDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      {/* Main Data Split - 2 Columns */}
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Kolom Kiri: 2 Container Vertikal */}
                        <div className="flex flex-col gap-6 h-full">
                          <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50 flex-1">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-green-600" />
                              Metrik Usaha Saat Itu
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-slate-500">Omzet</p>
                                <p className="font-bold text-emerald-600">Rp {(currentData.businessProgress?.revenue || 0).toLocaleString('id-ID')}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Operasional</p>
                                <p className="font-bold text-rose-600">Rp {(currentData.businessProgress?.operationalCost || 0).toLocaleString('id-ID')}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Netto Usaha</p>
                                <p className="font-bold text-blue-600">Rp {(() => {
                                    const bp = currentData.businessProgress || {} as any;
                                    if (bp.netIncome !== undefined) return bp.netIncome;
                                    if (bp.revenue !== undefined && bp.operationalCost !== undefined) return bp.revenue - bp.operationalCost;
                                    return bp.profit ?? 0;
                                })().toLocaleString('id-ID')}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Status Ekonomi (Gy vs Gc)</p>
                                <div className="mt-1">{calculateEconomicStatus(currentData.id, currentData.mustahikId)}</div>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Pendapatan RT</p>
                                <p className="font-medium text-slate-900 dark:text-slate-100 mt-1">Rp {(currentData.socialEconomicCondition?.monthlyIncome || 0).toLocaleString('id-ID')}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Konsumsi Esensial</p>
                                <p className="font-medium text-slate-900 dark:text-slate-100 mt-1">Rp {(currentData.socialEconomicCondition?.monthlyExpenditure || 0).toLocaleString('id-ID')}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-xs text-slate-500">Jenis Usaha</p>
                                <p className="font-medium text-slate-900 dark:text-slate-100 mt-1">{currentData.businessProgress?.businessType || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Kolom Kanan: 1 Container Grafik (Sejajar dgn Kiri) */}
                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50 flex flex-col h-full min-h-[250px]">
                          <h4 className="font-semibold mb-4 text-sm text-slate-700 dark:text-slate-300 shrink-0">Tren Netto Bulanan</h4>
                          <div className="flex-1 w-full h-full flex flex-col justify-center">
                            {(() => {
                              const trendData = monitoringData
                                .filter(m => m.mustahikId === historyViewingMustahikId)
                                .sort((a, b) => new Date(a.monitoringDate).getTime() - new Date(b.monitoringDate).getTime())
                                .map(m => ({
                                  date: new Date(m.monitoringDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' }),
                                  netIncome: (() => {
                                      const bp = m.businessProgress || {} as any;
                                      if (bp.netIncome !== undefined) return bp.netIncome;
                                      if (bp.revenue !== undefined && bp.operationalCost !== undefined) return bp.revenue - bp.operationalCost;
                                      return bp.profit ?? 0;
                                  })()
                                }));

                              if (trendData.length === 0) {
                                return (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                                    Belum ada data tren pendapatan
                                  </div>
                                );
                              }

                              if (trendData.length === 1) {
                                return (
                                  <div className="w-full h-full flex flex-col items-center justify-center">
                                    <p className="text-2xl font-bold text-blue-600">Rp {trendData[0].netIncome.toLocaleString('id-ID')}</p>
                                    <p className="text-sm text-slate-400 mt-1">Netto pada {trendData[0].date}</p>
                                    <p className="text-xs text-slate-400 mt-2 text-center break-words max-w-xs">Perlu minimal 2 data monitoring untuk menampilkan grafik tren</p>
                                  </div>
                                );
                              }

                              return (
                                <div style={{ width: '100%', height: '100%', minHeight: '200px' }}>
                                  <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                      data={trendData}
                                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                    >
                                      <defs>
                                        <linearGradient id={`colorRevenueHist-${currentData.id}`} x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                      </defs>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                      <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#64748b' }}
                                      />
                                      <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                                        tickFormatter={(value) => `${(value / 100000).toFixed(0)}jt`}
                                        width={40}
                                      />
                                      <Tooltip
                                        contentStyle={{
                                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                          borderRadius: '8px',
                                          border: '1px solid #e2e8f0',
                                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                        itemStyle={{ color: '#3b82f6', fontWeight: 600 }}
                                        formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Netto']}
                                        labelStyle={{ color: '#64748b', fontWeight: 500 }}
                                      />
                                      <Area
                                        type="monotone"
                                        dataKey="netIncome"
                                        stroke="#3b82f6"
                                        fillOpacity={1}
                                        fill={`url(#colorRevenueHist-${currentData.id})`}
                                        strokeWidth={2}
                                        dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                                      />
                                    </AreaChart>
                                  </ResponsiveContainer>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* Catatan Bawah - Full Width */}
                      {(currentData.notes || currentData.challenges) && (
                        <div className="bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-lg text-sm space-y-3 border border-amber-100 dark:border-amber-900/30">
                          {currentData.challenges && (
                            <div>
                              <p className="font-semibold text-amber-800 dark:text-amber-500 text-xs uppercase tracking-wider mb-1">Tantangan</p>
                              <p className="text-slate-700 dark:text-slate-300">{currentData.challenges}</p>
                            </div>
                          )}
                          {currentData.notes && (
                            <div>
                              <p className="font-semibold text-slate-500 text-xs uppercase tracking-wider mb-1">Catatan</p>
                              <p className="text-slate-700 dark:text-slate-300">{currentData.notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}
