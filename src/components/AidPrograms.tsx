import { useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Gift, Plus, Edit, Trash2, AlertCircle, Users, Search } from 'lucide-react';
import { AidProgramForm } from './AidProgramForm';
import { ProgramCandidates } from './ProgramCandidates';
import { PaginationControls } from './ui/pagination-controls';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { AidProgram, Mustahik, RecipientHistory, UserRole, MonitoringData, Criterion } from '../types';

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
}: AidProgramsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  // State for specific action dialogs
  const [editingProgram, setEditingProgram] = useState<AidProgram | null>(null);
  const [managingProgram, setManagingProgram] = useState<AidProgram | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const itemsPerPage = 5;

  const filteredPrograms = programs.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Role-based permissions
  const canManage = userRole === 'super_admin' || userRole === 'manajer';
  const canView = true; // All roles can view

  console.log('AidPrograms render. Managing:', managingProgram?.id, 'Editing:', editingProgram?.id);

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
      completed: { label: 'Selesai', className: 'bg-blue-50 text-blue-700 border-blue-200' },
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
            className="w-full md:w-64 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-blue-500 transition-colors"
          />

          {/* Add Button */}
          {canManage && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 !bg-blue-600 hover:!bg-blue-700 !text-white !border-blue-600 shadow-md hover:shadow-lg transition-all">
                  <Plus className="w-4 h-4" />
                  Buat Program
                </Button>
              </DialogTrigger>
              <DialogContent className="!max-w-[calc(100vw-8rem)] max-h-[90vh] overflow-y-auto !bg-white !dark:bg-slate-900 !px-16 !pb-14">
                <DialogHeader>
                  <DialogTitle>Buat Program Bantuan Baru</DialogTitle>
                  <DialogDescription>
                    Lengkapi informasi program bantuan zakat produktif
                  </DialogDescription>
                </DialogHeader>
                <AidProgramForm onSubmit={handleAdd} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Program</CardTitle>
            <Gift className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{programs.length}</div>
            <p className="text-xs text-slate-500 mt-1">Semua periode</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
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

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
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

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Selesai</CardTitle>
            <div className="h-4 w-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
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
        <Alert className="bg-slate-50 border-slate-200">
          <AlertCircle className="h-4 w-4 text-slate-500" />
          <AlertDescription className="text-slate-600">
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
                <Card key={program.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <CardHeader className="pb-4 border-b border-slate-100">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-50 rounded-lg">
                            <Gift className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-bold text-slate-900">{program.name}</CardTitle>
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
                            className="text-slate-500 hover:text-blue-600 hover:bg-blue-50"
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
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Anggaran</p>
                        <p className="text-lg font-semibold text-slate-900">Rp {program.totalBudget.toLocaleString('id-ID')}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Per Penerima</p>
                        <p className="text-lg font-semibold text-slate-900">Rp {program.budgetPerRecipient.toLocaleString('id-ID')}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Kuota Penerima</p>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-semibold text-slate-900">{program.quota}</p>
                          <span className="text-sm text-slate-400">orang</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Periode Program</p>
                        <p className="text-sm font-medium text-slate-700">
                          {new Date(program.startDate).toLocaleDateString('id-ID')} - {new Date(program.endDate).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100">
                      {/* View Candidates Button */}
                      {canView && (
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto gap-2 border-slate-200 hover:bg-slate-50 text-slate-700"
                          onClick={() => setManagingProgram(program)}
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
          <DialogContent className="!max-w-[calc(100vw-8rem)] max-h-[90vh] overflow-y-auto !bg-white !dark:bg-slate-900 !px-16 !pb-14">
            <DialogHeader>
              <DialogTitle>Edit Program Bantuan</DialogTitle>
              <DialogDescription>
                Perbarui informasi program bantuan
              </DialogDescription>
            </DialogHeader>
            {editingProgram && (
              <AidProgramForm
                key={editingProgram.id} // Force remount on change
                initialData={editingProgram}
                onSubmit={handleUpdate}
              />
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Manage Candidates Dialog (Single Instance) */}
      {canView && (
        <Dialog open={!!managingProgram} onOpenChange={(open: boolean) => !open && setManagingProgram(null)}>
          <DialogContent className="!max-w-[calc(100vw-8rem)] max-h-[90vh] overflow-y-auto !bg-white !dark:bg-slate-900 !px-16 !pb-14">
            <ErrorBoundary>
              <DialogHeader>
                <DialogTitle>Kelola Program - {managingProgram?.name}</DialogTitle>
                <DialogDescription>
                  Kelola calon penerima, analisis MOORA, dan daftar penerima bantuan
                </DialogDescription>
              </DialogHeader>
              {managingProgram && (
                <ProgramCandidates
                  key={managingProgram.id} // Force remount
                  program={managingProgram}
                  mustahikList={mustahikList}
                  criteriaList={criteriaList} // Pass the prop
                  onUpdateProgram={onUpdateProgram}
                  onAddRecipientHistory={onAddRecipientHistory}
                  recipientHistory={recipientHistory}
                  onAddMonitoring={onAddMonitoring}
                />
              )}
            </ErrorBoundary>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}