import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { UserPlus, Edit, Trash2, Shield, Users as UsersIcon, Search } from 'lucide-react';
import { PaginationControls } from './ui/pagination-controls';
import { toast } from 'sonner';
import { useConfirm } from '../hooks/use-confirm';
import type { User, UserRole } from '../types';

interface UserManagementProps {
  users: User[];
  onAdd: (user: User) => void;
  onUpdate: (id: string, user: User) => void;
  onDelete: (id: string) => void;
  currentUser: User;
}

export function UserManagement({ users, onAdd, onUpdate, onDelete, currentUser }: UserManagementProps) {
  const { confirm } = useConfirm();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'mustahik' as UserRole,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.password.trim() || !formData.name.trim()) {
      toast.error('Gagal validasi', {
        description: 'Username, password, dan nama harus diisi!'
      });
      return;
    }

    const userData = {
      username: formData.username.trim(),
      password: formData.password.trim(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
    };

    confirm({
      title: editingUser ? 'Simpan Perubahan User?' : 'Tambah Pengguna Baru?',
      description: editingUser 
        ? `Apakah Anda yakin ingin memperbarui data untuk ${userData.name}?`
        : `Daftarkan ${userData.name} sebagai ${userData.role} di sistem?`,
      confirmText: editingUser ? 'Simpan Perubahan' : 'Ya, Tambahkan',
      cancelText: 'Batal',
      onConfirm: () => {
        const actionLabel = editingUser ? 'Memperbarui profil pengguna...' : 'Mendaftarkan pengguna baru...';
        const toastId = toast.loading(actionLabel);

        setTimeout(() => {
          if (editingUser) {
            onUpdate(editingUser.id, { ...editingUser, ...userData });
            toast.success('Pengguna Diperbarui', {
              id: toastId,
              description: `Akses untuk ${userData.name} telah diperbarui.`
            });
            setEditingUser(null);
          } else {
            const newUser: User = {
                id: Date.now().toString(),
                ...userData,
                createdAt: new Date().toISOString(),
                isActive: true,
            };
            onAdd(newUser);
            toast.success('Pengguna Terdaftar', {
              id: toastId,
              description: `Akun ${newUser.name} telah aktif di sistem.`
            });
            setIsAddOpen(false);
          }
        }, 800);
      }
    });

    setFormData({
      username: '',
      password: '',
      name: '',
      email: '',
      role: 'mustahik',
    });
  };

  const handleEdit = (user: User) => {
    setFormData({
      username: user.username,
      password: user.password,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setEditingUser(user);
  };

  const handleDelete = (id: string, name: string) => {
    if (id === currentUser.id) {
      toast.warning('Aksi Dibatasi', {
        description: 'Anda tidak dapat menghapus akun Anda sendiri!'
      });
      return;
    }
    confirm({
      title: 'Hapus Pengguna',
      description: `Apakah Anda yakin ingin menghapus akun ${name}?`,
      confirmText: 'Hapus Sekarang',
      variant: 'destructive',
      onConfirm: () => {
        const toastId = toast.loading('Menghapus data pengguna dari sistem...');
        setTimeout(() => {
          onDelete(id);
          toast.success('Pengguna Dihapus', {
            id: toastId,
            description: `Data ${name} telah dihapus permanen.`
          });
        }, 800);
      }
    });
  };

  const handleToggleActive = (user: User) => {
    if (user.id === currentUser.id) {
      toast.warning('Aksi Dibatasi', {
        description: 'Anda tidak dapat menonaktifkan akun Anda sendiri!'
      });
      return;
    }
    const toastId = toast.loading(`Sedang ${user.isActive ? 'menonaktifkan' : 'mengaktifkan'} pengguna...`);
    setTimeout(() => {
      onUpdate(user.id, { ...user, isActive: !user.isActive });
      toast.success(`Pengguna ${user.isActive ? 'Dinonaktifkan' : 'Diaktifkan'}`, {
        id: toastId
      });
    }, 600);
  };

  // Filter users based on search and role
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: UserRole) => {
    const variants: Record<string, string> = {
      super_admin: 'bg-violet-50 text-violet-700 border-violet-200',
      manajer: 'bg-green-50 text-green-700 border-green-200',
      surveyor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      mustahik: 'bg-slate-50 text-slate-700 border-slate-200',
    };
    const labels: Record<string, string> = {
      super_admin: 'Super Admin',
      manajer: 'Manajer',
      surveyor: 'Surveyor',
      mustahik: 'Mustahik',
    };
    const safeRole = role || 'mustahik';
    const variant = variants[safeRole] || 'bg-slate-50 text-slate-700 border-slate-200';
    const label = labels[safeRole] || safeRole;
    return <Badge variant="outline" className={`${variant} border`}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header Actions - Same layout as MustahikDatabase */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Manajemen Pengguna</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Kelola akses dan peran pengguna sistem
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Role Filter */}
          <div className="w-full md:w-48">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="bg-white dark:bg-slate-800">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-500" />
                  <SelectValue placeholder="Filter Role" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Role</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="manajer">Manajer</SelectItem>
                <SelectItem value="surveyor">Surveyor</SelectItem>
                <SelectItem value="mustahik">Mustahik</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <Input
            placeholder="Cari pengguna..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-green-500 transition-colors"
          />

          {/* Add Button */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="btn-green gap-2">
                <UserPlus className="w-4 h-4" />
                Tambah User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[580px] w-[95vw] h-[700px] max-h-[90vh] dialog-bg-navy dialog-border-navy border-0 shadow-2xl p-0 overflow-hidden flex flex-col text-slate-900 dark:text-slate-100">
              <div className="bg-green-600 px-6 py-4 text-white relative shrink-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <DialogHeader className="pt-0">
                  <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Tambah Pengguna Baru
                  </DialogTitle>
                  <DialogDescription className="text-green-50 font-medium opacity-90 text-sm">
                    Lengkapi informasi akun pengguna baru untuk akses sistem
                  </DialogDescription>
                </DialogHeader>
              </div>
              <div className="p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-username">Username *</Label>
                    <Input
                      id="new-username"
                      placeholder="Masukkan username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">Password *</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Masukkan password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-name">Nama Lengkap *</Label>
                    <Input
                      id="new-name"
                      placeholder="Masukkan nama lengkap"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-email">Email</Label>
                    <Input
                      id="new-email"
                      type="email"
                      placeholder="Masukkan email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-role">Role *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: string) => setFormData({ ...formData, role: value as UserRole })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="manajer">Manajer</SelectItem>
                        <SelectItem value="surveyor">Surveyor</SelectItem>
                        <SelectItem value="mustahik">Mustahik</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" className="transition-all hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95" onClick={() => setIsAddOpen(false)}>
                      Batal
                    </Button>
                    <Button type="submit" className="btn-green px-8">
                      Simpan Pengguna
                    </Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Pengguna</CardTitle>
            <UsersIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{users.length}</div>
            <p className="text-xs text-slate-500 mt-1">Terdaftar dalam sistem</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Admin & Manajer</CardTitle>
            <div className="h-4 w-4 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-violet-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {users.filter(u => u.role === 'super_admin' || u.role === 'manajer').length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Akses penuh</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Surveyor</CardTitle>
            <div className="h-4 w-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {users.filter(u => u.role === 'surveyor').length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Petugas lapangan</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Aktif</CardTitle>
            <div className="h-4 w-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {users.filter(u => u.isActive).length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Dapat login</p>
          </CardContent>
        </Card>
      </div>

      {/* User Table */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
        <CardContent className="p-0">
          <div className="rounded-md border border-slate-100">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500">
                      {users.length === 0 ? 'Belum ada pengguna' : 'Tidak ada pengguna yang sesuai dengan pencarian'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell className="font-mono text-sm">{user.username}</TableCell>
                        <TableCell>{user.email || '-'}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={user.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-700 border-slate-200'}>
                            {user.isActive ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Dialog
                              open={editingUser?.id === user.id}
                              onOpenChange={(open: boolean) => !open && setEditingUser(null)}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-300 rounded-lg"
                                  onClick={() => handleEdit(user)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-[580px] w-[95vw] h-[700px] max-h-[90vh] dialog-bg-navy dialog-border-navy border-0 shadow-2xl p-0 overflow-hidden flex flex-col text-slate-900 dark:text-slate-100">
                                <div className="bg-green-600 px-6 py-4 text-white relative shrink-0 overflow-hidden">
                                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                                  <DialogHeader className="pt-0">
                                    <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                                      <Edit className="w-5 h-5" />
                                      Edit Pengguna
                                    </DialogTitle>
                                    <DialogDescription className="text-green-50 font-medium opacity-90 text-sm">
                                      Perbarui informasi akun pengguna
                                    </DialogDescription>
                                  </DialogHeader>
                                </div>
                                <div className="p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                                  <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-username">Username *</Label>
                                      <Input
                                        id="edit-username"
                                        placeholder="Masukkan username"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        required
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="edit-password">Password *</Label>
                                      <Input
                                        id="edit-password"
                                        type="password"
                                        placeholder="Masukkan password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="edit-name">Nama Lengkap *</Label>
                                      <Input
                                        id="edit-name"
                                        placeholder="Masukkan nama lengkap"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="edit-email">Email</Label>
                                      <Input
                                        id="edit-email"
                                        type="email"
                                        placeholder="Masukkan email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="edit-role">Role *</Label>
                                      <Select
                                        value={formData.role}
                                        onValueChange={(value: string) => setFormData({ ...formData, role: value as UserRole })}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="super_admin">Super Admin</SelectItem>
                                          <SelectItem value="manajer">Manajer</SelectItem>
                                          <SelectItem value="surveyor">Surveyor</SelectItem>
                                          <SelectItem value="mustahik">Mustahik</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-4">
                                      <Button type="button" variant="outline" className="transition-all hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95" onClick={() => setEditingUser(null)}>
                                        Batal
                                      </Button>
                                      <Button type="submit" className="btn-green px-8">
                                        Simpan Perubahan
                                      </Button>
                                    </div>
                                  </form>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-400 transition-colors active:scale-95"
                              onClick={() => handleToggleActive(user)}
                              disabled={user.id === currentUser.id}
                            >
                              {user.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-400 transition-colors active:scale-95"
                              onClick={() => handleDelete(user.id, user.name)}
                              disabled={user.id === currentUser.id}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
          {filteredUsers.length > itemsPerPage && (
            <div className="mt-4">
              <PaginationControls
                currentPage={currentPage}
                totalPages={Math.ceil(filteredUsers.length / itemsPerPage)}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
