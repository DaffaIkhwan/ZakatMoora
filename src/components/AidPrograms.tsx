import { useState, useEffect } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Gift, Plus, Edit, Trash2, AlertCircle, Users, Search, PlusCircle, Wallet, Banknote, Loader2 } from 'lucide-react';
import { AidProgramForm } from './AidProgramForm';
import { PaginationControls } from './ui/pagination-controls';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { AidProgram, Mustahik, RecipientHistory, UserRole, MonitoringData, Criterion } from '../types';
import { api } from '../services/api';
import { toast } from 'sonner';
import { Label } from './ui/label';
import { useConfirm } from '../hooks/use-confirm';

interface AidProgramsProps {
  programs: AidProgram[];
  mustahikList: Mustahik[];
  criteriaList: Criterion[];
  onAddProgram: (program: AidProgram) => void;
  onUpdateProgram: (id: string, program: AidProgram) => void;
  onDeleteProgram: (id: string) => void;
  onAddRecipientHistory: (history: RecipientHistory) => void;
  recipientHistory: RecipientHistory[];
  onAddMonitoring: (data: MonitoringData) => void;
  userRole: UserRole;
  onManageProgram?: (id: string) => void;
}

export function AidPrograms({
  programs,
  mustahikList,
  criteriaList,
  onAddProgram,
  onUpdateProgram,
  onDeleteProgram,
  onAddRecipientHistory,
  recipientHistory,
  onAddMonitoring,
  userRole,
  onManageProgram,
}: AidProgramsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  // State for specific action dialogs
  const [editingProgram, setEditingProgram] = useState<AidProgram | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [poolBalance, setPoolBalance] = useState<number>(0);
  const { confirm: confirmAction } = useConfirm();
  const itemsPerPage = 5;

  useEffect(() => {
    if (canManage) {
      api.getPoolBalance().then(d => setPoolBalance(d.poolBalance)).catch(() => { });
    }
  }, [programs]);

  const filteredPrograms = programs.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Role-based permissions
  const canManage = userRole === 'super_admin' || userRole === 'manajer';
  const canView = true; // All roles can view

  // Derived financial statistics
  const totalDisbursed = programs.reduce((sum, p) => sum + (p.collectedDonations || 0), 0);
  const cumulativeFunds = poolBalance + totalDisbursed;

  console.log('AidPrograms render. Editing:', editingProgram?.id);

  const formatIDR = (value: string) => {
    if (!value) return '';
    const num = value.replace(/[^0-9]/g, '');
    if (!num) return '';
    return new Intl.NumberFormat('id-ID').format(parseInt(num));
  };

  const handleAdd = (program: AidProgram) => {
    onAddProgram(program);
    setIsAddDialogOpen(false);
  };

  const handleUpdate = (program: AidProgram) => {
    if (editingProgram) {
      onUpdateProgram(editingProgram.id, program);
      setEditingProgram(null);
    }
  };

  const getStatusBadge = (status: AidProgram['status']) => {
    const variants: Record<string, { label: string; className: string }> = {
      draft: { label: 'Draft', className: 'bg-slate-100 text-slate-600 border-slate-200' },
      active: { label: 'Aktif', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      completed: { label: 'Selesai', className: 'bg-green-50 text-green-700 border-green-200' },
    };
    const variant = variants[status] || { label: status || 'Unknown', className: 'bg-slate-100 text-slate-600' };
    return <Badge variant="outline" className={`${variant.className} border`}>{variant.label}</Badge>;
  };


  return (
    <div className="space-y-6">
      {/* Header Actions - Same layout as MustahikDatabase */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Program Bantuan</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Kelola program bantuan zakat produktif dan seleksi calon penerima
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="w-full md:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white dark:bg-slate-800">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-slate-500" />
                  <SelectValue placeholder="Filter Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="completed">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <Input
            placeholder="Cari program..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-green-500 transition-colors"
          />

          {/* Add Button */}
          {canManage && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-green gap-2">
                  <Plus className="w-4 h-4" />
                  Buat Program
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[580px] w-[95vw] h-[700px] max-h-[90vh] dialog-bg-navy dialog-border-navy border-0 shadow-2xl p-0 overflow-hidden flex flex-col text-slate-900 dark:text-slate-100">
                <div className="bg-green-600 px-6 py-4 text-white relative shrink-0">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <DialogHeader className="pt-0">
                    <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                      <PlusCircle className="w-5 h-5" />
                      Buat Program Baru
                    </DialogTitle>
                    <DialogDescription className="text-green-50 font-medium opacity-90">
                      Rancang program bantuan baru untuk pemberdayaan ekonomi mustahik
                    </DialogDescription>
                  </DialogHeader>
                </div>
                <div className="p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                  <AidProgramForm onSubmit={handleAdd} />
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* ═══ Dana Terkumpul (Pool) Card ═══ */}
      {canManage && (
        <Card className="pool-balance-card shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 min-h-[120px]">
          <CardContent className="px-6 py-5 flex items-center h-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 h-full">

              {/* Pool Balance (Belum Disalurkan) - BENCHMARK, TIDAK DIUBAH */}
              <div className="flex items-center gap-4 h-full">
                <div className="pool-card-icon-wrapper">
                  <Banknote className="pool-card-icon" />
                </div>
                <div>
                  <p className="pool-label">Dana Terkumpul (Pool)</p>
                  <p className="pool-amount">
                    Rp {poolBalance.toLocaleString('id-ID')}
                  </p>
                  <p className="pool-desc">
                    Total zakat muzakki yang belum disalurkan ke program
                  </p>
                </div>
              </div>

              {/* Disbursed (Sudah Disalurkan) */}
              <div className="flex items-center gap-4 md:pl-6 h-full">
                <div className="pool-card-icon-wrapper" style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)' }}>
                  <Gift className="pool-card-icon" style={{ color: '#0ea5e9' }} />
                </div>
                <div>
                  <p className="pool-label">Dana Tersalurkan</p>
                  <p className="pool-amount">
                    Rp {totalDisbursed.toLocaleString('id-ID')}
                  </p>
                  <p className="pool-desc">
                    Total dana yang sudah masuk ke program
                  </p>
                </div>
              </div>

              {/* Cumulative (Total Keseluruhan) */}
              <div className="flex items-center gap-4 md:pl-6 h-full">
                <div className="pool-card-icon-wrapper" style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)' }}>
                  <Wallet className="pool-card-icon" style={{ color: '#a855f7' }} />
                </div>
                <div>
                  <p className="pool-label">Zakat Kumulatif</p>
                  <p className="pool-amount">
                    Rp {cumulativeFunds.toLocaleString('id-ID')}
                  </p>
                  <p className="pool-desc">
                    Keseluruhan dana (Terkumpul + Tersalurkan)
                  </p>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Program</CardTitle>
            <Gift className="h-4 w-4" style={{ color: '#10b981' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{programs.length}</div>
            <p className="text-xs text-slate-500 mt-1">Semua periode</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Draft</CardTitle>
            <div className="h-4 w-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {programs.filter(p => p.status === 'draft').length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Belum dipublikasi</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Aktif</CardTitle>
            <div className="h-4 w-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {programs.filter(p => p.status === 'active').length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Sedang berjalan</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Selesai</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {programs.filter(p => p.status === 'completed').length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Telah disalurkan</p>
          </CardContent>
        </Card>
      </div>

      {/* Programs List */}
      {filteredPrograms.length === 0 ? (
        <Alert className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <AlertCircle className="h-4 w-4 text-slate-500" />
          <AlertDescription className="text-slate-600 dark:text-slate-400">
            {searchTerm || statusFilter !== 'all'
              ? "Tidak ada program yang cocok dengan pencarian Anda."
              : "Belum ada program bantuan. Klik tombol \"Buat Program\" untuk menambahkan program baru."}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6">
            {filteredPrograms
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((program) => (
                <Card key={program.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                  <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}>
                            <Gift className="w-5 h-5" style={{ color: '#10b981' }} />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">{program.name}</CardTitle>
                          </div>
                          {getStatusBadge(program.status)}
                        </div>
                        <CardDescription className="text-slate-500 ml-12">{program.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Edit Button */}
                        {canManage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-500 hover:text-green-600 hover:bg-green-50"
                            onClick={() => setEditingProgram(program)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}

                        {/* Delete Button */}
                        {canManage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => {
                              if (confirm(`Hapus program "${program.name}"?`)) {
                                onDeleteProgram(program.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Anggaran</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          <span style={{ color: '#10b981' }}>
                            Rp {program.totalBudget.toLocaleString('id-ID')}
                          </span>
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Per Penerima</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Rp {program.budgetPerRecipient.toLocaleString('id-ID')}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Kuota Penerima</p>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{program.quota}</p>
                          <span className="text-sm text-slate-400">orang</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Periode Program</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {new Date(program.startDate).toLocaleDateString('id-ID')} - {new Date(program.endDate).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                      {/* View Candidates Button */}
                      {canView && (
                        <Button
                          variant="outline"
                          className="gap-2 border-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all active:scale-95"
                          onClick={() => onManageProgram?.(program.id)}
                        >
                          <Users className="w-4 h-4 text-emerald-600" />
                          Kelola Calon & Penerima
                          <Badge variant="secondary" className="ml-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                            {program.selectedCandidates?.length || 0}/{program.quota}
                          </Badge>
                        </Button>
                      )}

                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={Math.ceil(filteredPrograms.length / itemsPerPage)}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Edit Dialog (Single Instance) */}
      {canManage && (
        <Dialog open={!!editingProgram} onOpenChange={(open: boolean) => !open && setEditingProgram(null)}>
          <DialogContent className="max-w-[580px] w-[95vw] h-[700px] max-h-[90vh] dialog-bg-navy dialog-border-navy border-0 shadow-2xl p-0 overflow-hidden flex flex-col text-slate-900 dark:text-slate-100">
            <div className="bg-green-600 px-6 py-4 text-white relative shrink-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <DialogHeader className="pt-0">
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Edit className="w-5 h-5" />
                  Edit Program Bantuan
                </DialogTitle>
                <DialogDescription className="text-green-50 font-medium opacity-90 text-sm">
                  Perbarui informasi program bantuan <span className="text-white font-bold">{editingProgram?.name}</span>
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              {editingProgram && (
                <AidProgramForm
                  key={editingProgram.id} // Force remount on change
                  initialData={editingProgram}
                  onSubmit={handleUpdate}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}


      {/* Dialog for ProgramCandidates has been extracted to App.tsx as a dedicated page */}
    </div>
  );
}