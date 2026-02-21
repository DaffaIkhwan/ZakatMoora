import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, Search, AlertCircle, CheckCircle2, TrendingUp, TrendingDown, CalendarClock } from 'lucide-react';
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

  const getBusinessStatusBadge = (status: string = '') => {
    switch (status.toLowerCase()) {
      case 'naik':
      case 'berkembang':
        return <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200">Naik</Badge>;
      case 'stabil':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">Stabil</Badge>;
      case 'turun':
      case 'menurun':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Turun</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
        profit: data.businessProgress?.profit || 0,
        employeeCount: 0, // Default or add to form if critical
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
      surveyor: currentUser.name,
      notes: data.notes || '',
    };
    onAdd(newMonitoring);
  };

  const filteredRecipients = recipientHistory.filter(r => {
    const matchesSearch = r.mustahikName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.programName.toLowerCase().includes(searchTerm.toLowerCase());

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
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
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

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
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
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
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

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
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
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
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
                    <TableHead className="text-center">Program Bantuan</TableHead>
                    <TableHead className="text-center">Status Bulan Ini</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecipients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-slate-500">
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
                        return (
                          <TableRow key={recipient.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                            <TableCell className="font-medium">{recipient.mustahikName}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 bg-blue-100/50">
                                {recipient.programName}
                              </Badge>
                            </TableCell>
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
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
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
                  <TableHead className="text-center">Program</TableHead>
                  <TableHead className="text-center">Jenis Usaha</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Omzet</TableHead>
                  <TableHead className="text-center">Surveyor</TableHead>
                  <TableHead className="text-center">Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monitoringData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                      Belum ada data monitoring
                    </TableCell>
                  </TableRow>
                ) : (
                  monitoringData
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((data) => (
                      <TableRow key={data.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <TableCell className="text-center text-sm">
                          {data.monitoringDate ? new Date(data.monitoringDate).toLocaleDateString('id-ID') : '-'}
                        </TableCell>
                        <TableCell className="font-medium">{data.mustahikName}</TableCell>
                        <TableCell className="text-center text-sm text-slate-500">{data.programName}</TableCell>
                        <TableCell className="text-center">{data.businessProgress?.businessType || '-'}</TableCell>
                        <TableCell className="text-center">{getBusinessStatusBadge(data.businessProgress?.businessStatus)}</TableCell>
                        <TableCell className="text-center font-mono text-sm">
                          Rp {(data.businessProgress?.revenue || 0).toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell className="text-center text-sm text-slate-500">{data.surveyor}</TableCell>
                        <TableCell className="text-center">
                          <Dialog open={viewingData?.id === data.id} onOpenChange={(open: boolean) => !open && setViewingData(null)}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setViewingData(data)}>
                                <Eye className="w-4 h-4 text-slate-400 hover:text-blue-600" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="!max-w-[calc(100vw-8rem)] max-h-[90vh] overflow-y-auto !bg-white !dark:bg-slate-900 !px-16 !pb-14">
                              <DialogHeader>
                                <DialogTitle>Detail Monitoring - {data.mustahikName}</DialogTitle>
                                <DialogDescription>
                                  Tercatat pada {new Date(data.monitoringDate).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                                </DialogDescription>
                              </DialogHeader>
                              {/* Detail Content */}
                              <div className="space-y-6 pt-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div className="space-y-1">
                                    <p className="text-slate-500">Program</p>
                                    <p className="font-medium">{data.programName}</p>
                                  </div>
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
                                      <p className="text-xs text-slate-500">Profit</p>
                                      <p className="font-bold text-blue-600">Rp {(data.businessProgress?.profit || 0).toLocaleString('id-ID')}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-500">Status</p>
                                      <div className="mt-1">{getBusinessStatusBadge(data.businessProgress?.businessStatus)}</div>
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-500">Jenis</p>
                                      <p className="font-medium">{data.businessProgress?.businessType}</p>
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
                                        profit: m.businessProgress?.profit || 0
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
                                          <p className="text-2xl font-bold text-blue-600">Rp {trendData[0].profit.toLocaleString('id-ID')}</p>
                                          <p className="text-sm text-slate-400 mt-1">Profit pada {trendData[0].date}</p>
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
                                              formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Profit']}
                                              labelStyle={{ color: '#64748b', fontWeight: 500 }}
                                            />
                                            <Area
                                              type="monotone"
                                              dataKey="profit"
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
                                      <p className="text-slate-500">Pengeluaran RT</p>
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
    </div>
  );
}
