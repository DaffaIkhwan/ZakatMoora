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
import type { User, UserRole } from '../types';

interface UserManagementProps {
  users: User[];
  onAdd: (user: User) => void;
  onUpdate: (id: string, user: User) => void;
  onDelete: (id: string) => void;
  currentUser: User;
}

export function UserManagement({ users, onAdd, onUpdate, onDelete, currentUser }: UserManagementProps) {
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
      alert('Username, password, dan nama harus diisi!');
      return;
    }

    if (editingUser) {
      const updatedUser: User = {
        ...editingUser,
        username: formData.username.trim(),
        password: formData.password.trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
      };
      onUpdate(editingUser.id, updatedUser);
      setEditingUser(null);
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        username: formData.username.trim(),
        password: formData.password.trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        createdAt: new Date().toISOString(),
        isActive: true,
      };
      onAdd(newUser);
      setIsAddOpen(false);
    }

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

  const handleDelete = (id: string) => {
    if (id === currentUser.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri!');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      onDelete(id);
    }
  };

  const handleToggleActive = (user: User) => {
    if (user.id === currentUser.id) {
      alert('Anda tidak dapat menonaktifkan akun Anda sendiri!');
      return;
    }
    onUpdate(user.id, { ...user, isActive: !user.isActive });
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
      manajer: 'bg-blue-50 text-blue-700 border-blue-200',
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
            className="w-full md:w-64 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-blue-500 transition-colors"
          />

          {/* Add Button */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 !bg-blue-600 hover:!bg-blue-700 !text-white !border-blue-600 shadow-md hover:shadow-lg transition-all">
                <UserPlus className="w-4 h-4" />
                Tambah User
              </Button>
            </DialogTrigger>
            <DialogContent className="!max-w-[calc(100vw-8rem)] max-h-[90vh] overflow-y-auto !bg-white !dark:bg-slate-900 !px-16 !pb-14">
              <DialogHeader>
                <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                <DialogDescription>
                  Masukkan informasi pengguna baru
                </DialogDescription>
              </DialogHeader>
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

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit">Simpan</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Pengguna</CardTitle>
            <UsersIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{users.length}</div>
            <p className="text-xs text-slate-500 mt-1">Terdaftar dalam sistem</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
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

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
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

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
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
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
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
                                  size="sm"
                                  onClick={() => handleEdit(user)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="!max-w-[calc(100vw-8rem)] max-h-[90vh] overflow-y-auto !bg-white !dark:bg-slate-900 !px-16 !pb-14">
                                <DialogHeader>
                                  <DialogTitle>Edit Pengguna</DialogTitle>
                                  <DialogDescription>
                                    Ubah informasi pengguna
                                  </DialogDescription>
                                </DialogHeader>
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

                                  <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                                      Batal
                                    </Button>
                                    <Button type="submit">Simpan</Button>
                                  </div>
                                </form>
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleActive(user)}
                              disabled={user.id === currentUser.id}
                            >
                              {user.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(user.id)}
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
