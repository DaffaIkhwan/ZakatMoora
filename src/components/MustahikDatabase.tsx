import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UserPlus, Edit, Trash2, Search, AlertCircle, Eye, Database, Filter, TrendingUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MustahikForm } from './MustahikForm';
import { MonitoringForm } from './MonitoringForm';
import { PaginationControls } from './ui/pagination-controls';
import type { Mustahik, RecipientHistory, UserRole, AidProgram, MonitoringData, Criterion } from '../types';
import { ICON_MAP } from './CriteriaInfo';

interface MustahikDatabaseProps {
  mustahikList: Mustahik[];
  onAdd: (mustahik: Mustahik) => void;
  onUpdate: (id: string, mustahik: Mustahik) => void;
  onDelete: (id: string) => void;
  recipientHistory: RecipientHistory[];
  aidPrograms: AidProgram[];
  criteriaList: Criterion[];
  monitoringData: MonitoringData[];
  onAddMonitoring: (data: MonitoringData) => void;
  userRole: UserRole;
}

export function MustahikDatabase({
  mustahikList,
  onAdd,
  onUpdate,
  onDelete,
  recipientHistory,
  aidPrograms,
  criteriaList,
  monitoringData,
  onAddMonitoring,
  userRole
}: MustahikDatabaseProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMustahik, setEditingMustahik] = useState<Mustahik | null>(null);
  const [viewingMustahik, setViewingMustahik] = useState<Mustahik | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Role-based permissions
  const canAdd = userRole === 'super_admin' || userRole === 'surveyor' || userRole === 'mustahik';
  const canEdit = userRole === 'super_admin' || userRole === 'surveyor';
  const canDelete = userRole === 'super_admin' || userRole === 'surveyor';
  const canAddMonitoring = userRole === 'super_admin' || userRole === 'surveyor' || userRole === 'manajer';

  const getLatestProgramId = (mustahikId: string) => {
    if (!recipientHistory) return undefined;
    const history = recipientHistory
      .filter(h => h.mustahikId === mustahikId)
      .sort((a, b) => new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime());
    return history.length > 0 ? history[0].programId : undefined;
  };

  const filteredMustahik = mustahikList.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm);

    let matchesProgram = true;
    if (programFilter !== 'all') {
      const latestProgramId = getLatestProgramId(m.id);
      if (programFilter === 'unassigned') {
        matchesProgram = !latestProgramId; // Not in any program
      } else {
        const participatedPrograms = recipientHistory
          .filter(h => h.mustahikId === m.id)
          .map(h => h.programId);
        matchesProgram = participatedPrograms.includes(programFilter);
      }
    }

    return matchesSearch && matchesProgram;
  });

  const getReceivedCount = (mustahikId: string) => {
    if (!recipientHistory) return 0;
    return recipientHistory.filter(h => h.mustahikId === mustahikId).length;
  };

  const getTotalReceived = (mustahikId: string) => {
    if (!recipientHistory) return 0;
    return recipientHistory
      .filter(h => h.mustahikId === mustahikId)
      .reduce((sum, h) => sum + (h.amount || 0), 0);
  };

  const handleAdd = (mustahik: Mustahik) => {
    onAdd(mustahik);
    setIsAddDialogOpen(false);
  };

  const handleUpdate = (mustahik: Mustahik) => {
    if (editingMustahik) {
      onUpdate(editingMustahik.id, mustahik);
      setEditingMustahik(null);
    }
  };

  // Helper for Monitoring Form Submission
  const handleMonitoringSubmit = (data: Partial<MonitoringData>, mustahikId: string, programId?: string) => {
    const mustahik = mustahikList.find(m => m.id === mustahikId);
    if (!mustahik) return;

    // Construct full MonitoringData
    const newMonitoring: MonitoringData = {
      id: Date.now().toString(),
      mustahikId: mustahikId,
      mustahikName: mustahik.name,
      programId: data.programId || programId || '',
      programName: aidPrograms.find(p => p.id === (data.programId || programId))?.name || 'Unknown',
      monitoringDate: data.monitoringDate || new Date().toISOString(),
      businessProgress: {
        businessType: data.businessProgress?.businessType || '',
        revenue: data.businessProgress?.revenue || 0,
        profit: data.businessProgress?.profit || 0,
        employeeCount: data.businessProgress?.employeeCount || 0,
        businessStatus: data.businessProgress?.businessStatus || 'stabil',
      },
      socialEconomicCondition: {
        monthlyIncome: data.socialEconomicCondition?.monthlyIncome || 0,
        monthlyExpenditure: data.socialEconomicCondition?.monthlyExpenditure || 0,
        dependentCount: data.socialEconomicCondition?.dependentCount || 0,
        housingCondition: data.socialEconomicCondition?.housingCondition || 'sedang',
        healthCondition: data.socialEconomicCondition?.healthCondition || 'sehat',
        educationLevel: data.socialEconomicCondition?.educationLevel || 'tetap',
      },
      challenges: data.challenges || '',
      achievements: data.achievements || '',
      nextPlan: data.nextPlan || '',
      surveyor: 'System', // Should be passed or current user
      notes: data.notes || '',
    };
    onAddMonitoring(newMonitoring);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Database Mustahik</h2>
          <p className="text-slate-500">
            Kelola data calon penerima dan penerima zakat produktif
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Program Filter */}
          <div className="w-full md:w-48">
            <Select value={programFilter} onValueChange={setProgramFilter}>
              <SelectTrigger className="bg-white">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <SelectValue placeholder="Filter Program" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Program</SelectItem>
                <SelectItem value="unassigned">Belum Menerima</SelectItem>
                {aidPrograms.map(prog => (
                  <SelectItem key={prog.id} value={prog.id}>{prog.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>


          <Input
            placeholder="Cari mustahik..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 bg-white border-slate-200 focus:border-blue-500 transition-colors"
          />
          {canAdd && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 !bg-blue-600 hover:!bg-blue-700 !text-white !border-blue-600 shadow-md hover:shadow-lg transition-all">
                  <UserPlus className="w-4 h-4" />
                  Tambah
                </Button>
              </DialogTrigger>
              <DialogContent className="!max-w-[calc(100vw-8rem)] max-h-[90vh] overflow-y-auto !bg-white !dark:bg-slate-900 !px-16 !pb-14">
                <DialogHeader>
                  <DialogTitle>Tambah Data Mustahik</DialogTitle>
                  <DialogDescription>
                    Lengkapi data pribadi dan penilaian kriteria mustahik
                  </DialogDescription>
                </DialogHeader>
                <MustahikForm onSubmit={handleAdd} criteriaList={criteriaList} userRole={userRole} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Mustahik</CardTitle>
            <Database className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{mustahikList.length}</div>
            <p className="text-xs text-slate-500 mt-1">Terdaftar dalam sistem</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pernah Menerima</CardTitle>
            <div className="h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {mustahikList.filter(m => getReceivedCount(m.id) > 0).length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Penerima bantuan aktif</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Belum Menerima</CardTitle>
            <div className="h-4 w-4 rounded-full bg-slate-100 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {mustahikList.filter(m => getReceivedCount(m.id) === 0).length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Menunggu seleksi</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      {filteredMustahik.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {mustahikList.length === 0
              ? 'Belum ada data mustahik. Klik tombol "Tambah Mustahik" untuk menambahkan data.'
              : 'Tidak ada data yang sesuai dengan pencarian atau filter.'}
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Alamat</TableHead>
                    <TableHead>No. Telepon</TableHead>
                    <TableHead className="text-center">Pernah Terima</TableHead>
                    <TableHead className="text-center">Total Diterima</TableHead>
                    <TableHead className="text-center">Monitoring</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMustahik
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((mustahik) => {
                      const receivedCount = getReceivedCount(mustahik.id);
                      const totalReceived = getTotalReceived(mustahik.id);
                      const latestProgramId = getLatestProgramId(mustahik.id);

                      return (
                        <TableRow key={mustahik.id}>
                          <TableCell>
                            <div className="font-medium text-slate-900">{mustahik.name}</div>
                          </TableCell>
                          <TableCell className="text-gray-600 max-w-xs truncate">{mustahik.address}</TableCell>
                          <TableCell>{mustahik.phone}</TableCell>
                          <TableCell className="text-center">
                            {receivedCount > 0 ? (
                              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200">{receivedCount}x</Badge>
                            ) : (
                              <Badge variant="outline">Belum</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {totalReceived > 0 ? (
                              <span className="text-sm font-mono text-emerald-600 font-bold">
                                Rp {totalReceived.toLocaleString('id-ID')}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {canAddMonitoring && receivedCount > 0 ? (
                              <MonitoringForm
                                mustahikId={mustahik.id}
                                mustahikName={mustahik.name}
                                programId={latestProgramId}
                                programs={aidPrograms.map(p => ({ id: p.id, name: p.name }))}
                                onSubmit={(data) => handleMonitoringSubmit(data, mustahik.id, latestProgramId)}
                              />
                            ) : (
                              <span className="text-xs text-slate-400">Belum Menerima</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              {/* View Dialog */}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-slate-100"
                                    onClick={() => setViewingMustahik(mustahik)}
                                  >
                                    <Eye className="w-4 h-4 text-slate-500" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="!max-w-[calc(100vw-8rem)] max-h-[90vh] overflow-y-auto !bg-white !dark:bg-slate-900 !px-16 !pb-14">
                                  <DialogHeader>
                                    <DialogTitle>Detail Mustahik - {mustahik.name}</DialogTitle>
                                    <DialogDescription>
                                      Informasi lengkap mustahik
                                    </DialogDescription>
                                  </DialogHeader>
                                  {viewingMustahik && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-sm text-gray-500">Nama Lengkap</p>
                                          <p className="font-medium">{viewingMustahik.name}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-500">No. Telepon</p>
                                          <p>{viewingMustahik.phone}</p>
                                        </div>
                                        <div className="col-span-2">
                                          <p className="text-sm text-gray-500">Alamat</p>
                                          <p>{viewingMustahik.address}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-500">Tanggal Daftar</p>
                                          <p>{viewingMustahik.registeredDate ? new Date(viewingMustahik.registeredDate).toLocaleDateString('id-ID') : '-'}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-500">Pernah Menerima</p>
                                          <p className="font-bold text-blue-600">{getReceivedCount(viewingMustahik.id)}x</p>
                                        </div>
                                      </div>

                                      <div className="border-t pt-6 mt-6">
                                        {/* Monitoring Metrics Section */}
                                        <div className="mb-8">
                                          <div className="mb-4">
                                            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                              <TrendingUp className="w-4 h-4 text-emerald-600" />
                                              Metrik Usaha & Profit
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                              Perkembangan usaha dan pendapatan bulanan
                                            </p>
                                          </div>

                                          {(() => {
                                            const mustahikMonitoring = monitoringData
                                              .filter(m => m.mustahikId === viewingMustahik.id)
                                              .sort((a, b) => new Date(b.monitoringDate).getTime() - new Date(a.monitoringDate).getTime());

                                            const latestMonitoring = mustahikMonitoring[0];

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

                                            if (!latestMonitoring) {
                                              return (
                                                <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                                  <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada data monitoring usaha untuk mustahik ini.</p>
                                                </div>
                                              );
                                            }

                                            return (
                                              <div className="space-y-6">
                                                {/* Metrics Grid */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                                  <div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Omzet Terakhir</p>
                                                    <p className="font-bold text-emerald-600 dark:text-emerald-400">
                                                      Rp {(latestMonitoring.businessProgress?.revenue || 0).toLocaleString('id-ID')}
                                                    </p>
                                                  </div>
                                                  <div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Profit Terakhir</p>
                                                    <p className="font-bold text-blue-600 dark:text-blue-400">
                                                      Rp {(latestMonitoring.businessProgress?.profit || 0).toLocaleString('id-ID')}
                                                    </p>
                                                  </div>
                                                  <div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Status Usaha</p>
                                                    <div className="mt-1">{getBusinessStatusBadge(latestMonitoring.businessProgress?.businessStatus)}</div>
                                                  </div>
                                                  <div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Jenis Usaha</p>
                                                    <p className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                                                      {latestMonitoring.businessProgress?.businessType || '-'}
                                                    </p>
                                                  </div>
                                                </div>

                                                {/* Profit Trend Chart */}
                                                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-900">
                                                  <h4 className="font-semibold mb-4 text-sm text-slate-700 dark:text-slate-300">Tren Profit Bulanan</h4>
                                                  {(() => {
                                                    const trendData = mustahikMonitoring
                                                      .sort((a, b) => new Date(a.monitoringDate).getTime() - new Date(b.monitoringDate).getTime()) // Sort by date ascending for chart
                                                      .map(m => ({
                                                        date: new Date(m.monitoringDate).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
                                                        profit: m.businessProgress?.profit || 0
                                                      }));

                                                    if (trendData.length < 2) {
                                                      return (
                                                        <div className="h-[200px] flex flex-col items-center justify-center text-center p-4">
                                                          {trendData.length === 1 ? (
                                                            <>
                                                              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                                Rp {trendData[0].profit.toLocaleString('id-ID')}
                                                              </p>
                                                              <p className="text-sm text-slate-400 mt-1">Profit pada {trendData[0].date}</p>
                                                              <p className="text-xs text-slate-400 mt-2">Perlu minimal 2 data monitoring untuk menampilkan grafik tren</p>
                                                            </>
                                                          ) : (
                                                            <p className="text-slate-400 text-sm">Belum ada data untuk ditampilkan</p>
                                                          )}
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
                                                              <linearGradient id={`colorProfit-${viewingMustahik.id}`} x1="0" y1="0" x2="0" y2="1">
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
                                                              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}jt`}
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
                                                              fill={`url(#colorProfit-${viewingMustahik.id})`}
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
                                            );
                                          })()}
                                        </div>

                                        <div className="mb-4">
                                          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Penilaian Kriteria</h4>
                                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Evaluasi berdasarkan {criteriaList.length} kriteria penilaian</p>
                                        </div>

                                        {(() => {
                                          let grandTotal = 0;
                                          let grandMax = 0;
                                          const allSubDetails: {
                                            criteriaName: string;
                                            aspectCode: string;
                                            aspectName: string;
                                            selectedLabel: string;
                                            selectedValue: number;
                                            maxValue: number
                                          }[] = [];

                                          criteriaList.forEach((criteria) => {
                                            let totalValue = 0;

                                            if (viewingMustahik.criteria && viewingMustahik.criteria[criteria.code as keyof typeof viewingMustahik.criteria]) {
                                              totalValue = Number(viewingMustahik.criteria[criteria.code as keyof typeof viewingMustahik.criteria]) || 0;
                                            }

                                            const subDetails: { aspectCode: string; aspectName: string; selectedLabel: string; selectedValue: number; maxValue: number }[] = [];

                                            if (viewingMustahik.subCriteria && criteria.aspects?.length > 0) {
                                              criteria.aspects.forEach((aspect) => {
                                                const subValue = Number(viewingMustahik.subCriteria?.[aspect.code as keyof typeof viewingMustahik.subCriteria]) || 0;
                                                const matchedOption = aspect.options.find(opt => opt.value === subValue);
                                                const maxValue = Math.max(...aspect.options.map(o => o.value), 1);

                                                subDetails.push({
                                                  aspectCode: aspect.code,
                                                  aspectName: aspect.name,
                                                  selectedLabel: matchedOption?.label || `Nilai: ${subValue}`,
                                                  selectedValue: subValue,
                                                  maxValue,
                                                });

                                                allSubDetails.push({
                                                  criteriaName: `${criteria.code} - ${criteria.name}`,
                                                  aspectCode: aspect.code,
                                                  aspectName: aspect.name,
                                                  selectedLabel: matchedOption?.label || `Nilai: ${subValue}`,
                                                  selectedValue: subValue,
                                                  maxValue,
                                                });
                                              });

                                              if (totalValue === 0) {
                                                totalValue = subDetails.reduce((sum, d) => sum + d.selectedValue, 0);
                                              }
                                            }

                                            const maxCriteriaTotal = subDetails.reduce((sum, d) => sum + d.maxValue, 0) || 1;
                                            grandTotal += totalValue;
                                            grandMax += maxCriteriaTotal;
                                          });

                                          return (
                                            <div className="space-y-6">
                                              {/* Grand Total - Summarized at the top */}
                                              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                                <div>
                                                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total Skor Keseluruhan</div>
                                                  <div className="flex items-baseline gap-2">
                                                    <span className="text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">{grandTotal}</span>
                                                    <span className="text-sm text-slate-400 dark:text-slate-500">/ {grandMax}</span>
                                                  </div>
                                                </div>
                                                <div className="text-right">
                                                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Persentase Kelayakan</div>
                                                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                                                    {grandMax > 0 ? Math.round((grandTotal / grandMax) * 100) : 0}%
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Single Combined Table */}
                                              {allSubDetails.length > 0 && (
                                                <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                                  <Table>
                                                    <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                                                      <TableRow>
                                                        <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">Sub Kriteria</TableHead>
                                                        <TableHead className="w-[150px] text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">Kriteria Utama</TableHead>
                                                        <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">Keterangan</TableHead>
                                                        <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 w-[100px]">Nilai</TableHead>
                                                      </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                      {allSubDetails.map((detail, index) => (
                                                        <TableRow key={`${detail.aspectCode}-${index}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                          <TableCell>
                                                            <div className="flex flex-col">
                                                              <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                                                                {detail.aspectName}
                                                              </span>
                                                              <span className="text-[10px] font-mono text-slate-700 dark:text-slate-300 mt-0.5">
                                                                {detail.aspectCode}
                                                              </span>
                                                            </div>
                                                          </TableCell>
                                                          <TableCell className="text-xs text-slate-900 dark:text-slate-100 font-medium">
                                                            {detail.criteriaName}
                                                          </TableCell>
                                                          <TableCell className="text-sm text-slate-900 dark:text-slate-100">
                                                            {detail.selectedLabel}
                                                          </TableCell>
                                                          <TableCell className="text-right">
                                                            <div className="flex items-baseline justify-end gap-1">
                                                              <span className="font-bold text-slate-900 dark:text-slate-100">{detail.selectedValue}</span>
                                                              <span className="text-xs text-slate-700 dark:text-slate-300">/ {detail.maxValue}</span>
                                                            </div>
                                                          </TableCell>
                                                        </TableRow>
                                                      ))}
                                                    </TableBody>
                                                  </Table>
                                                </div>
                                              )}

                                              {allSubDetails.length === 0 && (
                                                <div className="text-center py-8 text-slate-500">
                                                  Tidak ada data detail kriteria yang tersedia.
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })()}
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>

                              {/* Edit Dialog */}
                              {canEdit && (
                                <Dialog open={editingMustahik?.id === mustahik.id} onOpenChange={(open: boolean) => !open && setEditingMustahik(null)}>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                                      onClick={() => setEditingMustahik(mustahik)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="!max-w-[calc(100vw-8rem)] max-h-[90vh] overflow-y-auto !bg-white !dark:bg-slate-900 !px-16 !pb-14">
                                    <DialogHeader>
                                      <DialogTitle>Edit Data Mustahik</DialogTitle>
                                      <DialogDescription>
                                        Perbarui data pribadi dan penilaian kriteria mustahik
                                      </DialogDescription>
                                    </DialogHeader>
                                    <MustahikForm
                                      initialData={editingMustahik || undefined}
                                      onSubmit={handleUpdate}
                                      criteriaList={criteriaList}
                                      userRole={userRole}
                                    />
                                  </DialogContent>
                                </Dialog>
                              )}

                              {/* Delete Button */}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-rose-50 hover:text-rose-600"
                                  onClick={() => {
                                    if (confirm(`Hapus data ${mustahik.name}?`)) {
                                      onDelete(mustahik.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 px-4 pb-4">
              <PaginationControls
                currentPage={currentPage}
                totalPages={Math.ceil(filteredMustahik.length / itemsPerPage)}
                onPageChange={setCurrentPage}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}