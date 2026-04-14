import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
    UserPlus, ShieldCheck as ShieldCheckIcon,
    Search,
    Edit,
    Eye,
    Trash2,
    Heart,
    History,
    Users,
    Wallet,
    Mail,
    Lock,
    Phone,
    MapPin,
    Briefcase,
    Building2,
    Calendar,
    FileText,
    CheckCircle2,
    PlusCircle,
    CreditCard
} from 'lucide-react';
import { api } from '../services/api';
import type { Muzakki, AidProgram } from '../types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { PaginationControls } from './ui/pagination-controls';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';
import { useConfirm } from '../hooks/use-confirm';

interface MuzakkiManagementProps {
    muzakkis: Muzakki[];
    programs: AidProgram[];
    onRefresh: () => void;
}

export function MuzakkiManagement({ muzakkis, programs, onRefresh }: MuzakkiManagementProps) {
    const { confirm } = useConfirm();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isDonationDialogOpen, setIsDonationDialogOpen] = useState(false);
    const [viewingMuzakki, setViewingMuzakki] = useState<Muzakki | null>(null);
    const [editingMuzakki, setEditingMuzakki] = useState<Muzakki | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Note: Program selector removed — all donations go to Dana Terkumpul
    const [poolBalance, setPoolBalance] = useState<number>(0);

    const [donationData, setDonationData] = useState({
        muzakkiId: '',
        muzakkiName: '',
        amount: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        isAnonymous: false
    });

    // Fetch pool balance when donation dialog opens
    useEffect(() => {
        if (isDonationDialogOpen) {
            api.getPoolBalance().then(data => setPoolBalance(data.poolBalance)).catch(() => {});
        }
    }, [isDonationDialogOpen]);

    // Formatting helper
    const formatIDR = (value: string) => {
        if (!value) return "";
        const numberValue = value.replace(/[^0-9]/g, "");
        if (!numberValue) return "";
        return new Intl.NumberFormat("id-ID").format(parseInt(numberValue));
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, "");
        setDonationData({ ...donationData, amount: rawValue });
    };

    // Muzakki Form State
    const [muzakkiForm, setMuzakkiForm] = useState({
        nik: '',
        name: '',
        email: '',
        password: '',
        address: '',
        phone: '',
        job: '',
        institution: ''
    });

    const handleAddMuzakki = (e: React.FormEvent) => {
        e.preventDefault();
        confirm({
            title: 'Konfirmasi Pendaftaran',
            description: `Apakah Anda yakin ingin mendaftarkan ${muzakkiForm.name} sebagai muzakki baru?`,
            confirmText: 'Ya, Daftarkan',
            cancelText: 'Tidak',
            onConfirm: async () => {
                setSubmitting(true);
                try {
                    await api.createMuzakki(muzakkiForm);
                    setIsAddDialogOpen(false);
                    setMuzakkiForm({ nik: '', name: '', email: '', password: '', address: '', phone: '', job: '', institution: '' });
                    toast.success('Muzakki Berhasil Didaftarkan');
                    onRefresh();
                } catch (err: any) {
                    toast.error('Gagal: ' + err.message);
                } finally {
                    setSubmitting(false);
                }
            }
        });
    };

    const handleUpdateMuzakki = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMuzakki) return;
        confirm({
            title: 'Simpan Perubahan?',
            description: `Apakah Anda yakin ingin memperbarui data profil ${editingMuzakki.name}?`,
            confirmText: 'Ya, Simpan',
            cancelText: 'Batal',
            onConfirm: async () => {
                setSubmitting(true);
                try {
                    await api.updateMuzakki(editingMuzakki.id, {
                        nik: muzakkiForm.nik,
                        name: muzakkiForm.name,
                        email: muzakkiForm.email,
                        password: muzakkiForm.password,
                        address: muzakkiForm.address,
                        phone: muzakkiForm.phone,
                        job: muzakkiForm.job,
                        institution: muzakkiForm.institution
                    });
                    setEditingMuzakki(null);
                    toast.success('Profil Telah Diperbarui');
                    onRefresh();
                } catch (err: any) {
                    toast.error('Gagal: ' + err.message);
                } finally {
                    setSubmitting(false);
                }
            }
        });
    };

    const handleDeleteMuzakki = async (id: string, name: string) => {
        confirm({
            title: 'Hapus Muzakki',
            description: `Apakah Anda yakin ingin menghapus ${name}? Semua data zakat terkait juga akan dihapus.`,
            confirmText: 'Hapus Sekarang',
            variant: 'destructive',
            onConfirm: async () => {
                try {
                    const promise = api.deleteMuzakki(id);
                    toast.promise(promise, {
                        loading: 'Menghapus data muzakki dari sistem...',
                        success: () => {
                            onRefresh();
                            return 'Data muzakki telah dihapus';
                        },
                        error: (err) => `Gagal hapus: ${err.message}`
                    });
                } catch (err: any) {
                    // Handled
                }
            }
        });
    };

    const handleDonationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!donationData.amount) {
            toast.warning('Lengkapi Nominal!', {
                description: 'Jumlah zakat wajib diisi.'
            });
            return;
        }

        confirm({
            title: 'Konfirmasi Zakat',
            description: `Proses penerimaan zakat sebesar Rp ${formatIDR(donationData.amount)} ke Dana Terkumpul?`,
            confirmText: 'Ya, Konfirmasi',
            cancelText: 'Periksa Kembali',
            onConfirm: async () => {
                setSubmitting(true);
                try {
                    await api.createDonation({
                        muzakkiId: donationData.muzakkiId,
                        amount: donationData.amount,
                        notes: donationData.notes,
                        date: donationData.date,
                        paymentMethod: donationData.paymentMethod,
                        isAnonymous: donationData.isAnonymous
                    });
                    toast.success('Zakat Berhasil Dicatat ke Dana Terkumpul');
                    setIsDonationDialogOpen(false);
                    setDonationData({
                        muzakkiId: '', muzakkiName: '', amount: '', notes: '',
                        date: new Date().toISOString().split('T')[0],
                        paymentMethod: 'Cash', isAnonymous: false
                    });
                    onRefresh();
                } catch (err: any) {
                    toast.error('Gagal: ' + err.message);
                } finally {
                    setSubmitting(false);
                }
            }
        });
    };

    const openDonationDialog = (muzakki: Muzakki) => {
        setDonationData({
            muzakkiId: muzakki.id,
            muzakkiName: muzakki.name,
            amount: '',
            notes: '',
            date: new Date().toISOString().split('T')[0],
            paymentMethod: 'Cash',
            isAnonymous: false
        });
        setIsDonationDialogOpen(true);
    };

    const openEditDialog = (muzakki: Muzakki) => {
        setEditingMuzakki(muzakki);
        setMuzakkiForm({
            nik: muzakki.nik || '',
            name: muzakki.name,
            email: muzakki.user?.email || '',
            password: '',
            address: muzakki.address || '',
            phone: muzakki.phone || '',
            job: muzakki.job || '',
            institution: muzakki.institution || ''
        });
    };

    const filteredMuzakkis = muzakkis.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.address && m.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.phone && m.phone.includes(searchTerm))
    );

    const totalDonationsCount = muzakkis.reduce((sum, m) => sum + (m._count?.donations || 0), 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Database Muzakki</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Kelola data muzakki dan histori kontribusi secara profesional</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Cari muzakki..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 w-full md:w-64 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        />
                    </div>

                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 dark:shadow-none transition-all">
                                <UserPlus className="w-4 h-4" />
                                Tambah Muzakki
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[700px] w-[95vw] h-[700px] max-h-[90vh] dialog-bg-navy dialog-border-navy border-0 shadow-2xl p-0 overflow-hidden flex flex-col">
                            <div className="bg-green-600 px-6 py-4 text-white relative shrink-0 overflow-hidden">
                                <DialogHeader className="pt-0">
                                    <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                                        <UserPlus className="w-5 h-5" />
                                        Registrasi Muzakki Baru
                                    </DialogTitle>
                                    <DialogDescription className="text-green-50 font-medium text-sm">
                                        Lengkapi data profil muzakki untuk akses sistem dan pencatatan zakat
                                    </DialogDescription>
                                </DialogHeader>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                                <form onSubmit={handleAddMuzakki} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                                                <UserPlus className="w-4 h-4 text-green-500" /> NIK
                                            </Label>
                                            <Input value={muzakkiForm.nik} onChange={e => setMuzakkiForm({ ...muzakkiForm, nik: e.target.value })} className="bg-slate-50 dark:bg-slate-900 h-10" placeholder="Nomor Induk Kependudukan" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                                                <Users className="w-4 h-4 text-green-500" /> Nama Lengkap
                                            </Label>
                                            <Input required value={muzakkiForm.name} onChange={e => setMuzakkiForm({ ...muzakkiForm, name: e.target.value })} className="bg-slate-50 dark:bg-slate-900 h-10" placeholder="Contoh: Budi Santoso" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                                                <Mail className="w-4 h-4 text-green-500" /> Alamat Email
                                            </Label>
                                            <Input required type="email" value={muzakkiForm.email} onChange={e => setMuzakkiForm({ ...muzakkiForm, email: e.target.value })} className="bg-slate-50 dark:bg-slate-900 h-10" placeholder="budi@email.com" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                                                <Lock className="w-4 h-4 text-green-500" /> Kata Sandi Akses
                                            </Label>
                                            <Input required type="password" value={muzakkiForm.password} onChange={e => setMuzakkiForm({ ...muzakkiForm, password: e.target.value })} className="bg-slate-50 dark:bg-slate-900 h-10" placeholder="Min. 6 karakter" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                                                <Phone className="w-4 h-4 text-green-500" /> Nomor Telepon / WA
                                            </Label>
                                            <Input value={muzakkiForm.phone} onChange={e => setMuzakkiForm({ ...muzakkiForm, phone: e.target.value })} className="bg-slate-50 dark:bg-slate-900 h-10" placeholder="0812xxxx" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                                                <Briefcase className="w-4 h-4 text-green-500" /> Pekerjaan / Profesi
                                            </Label>
                                            <Input value={muzakkiForm.job} onChange={e => setMuzakkiForm({ ...muzakkiForm, job: e.target.value })} className="bg-slate-50 dark:bg-slate-900 h-10" placeholder="Misal: Dosen, Pengusaha" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                                                <Building2 className="w-4 h-4 text-green-500" /> Instansi / Perusahaan
                                            </Label>
                                            <Input value={muzakkiForm.institution} onChange={e => setMuzakkiForm({ ...muzakkiForm, institution: e.target.value })} className="bg-slate-50 dark:bg-slate-900 h-10" placeholder="Nama kantor atau usaha" />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                                                <MapPin className="w-4 h-4 text-green-500" /> Alamat Lengkap Domisili
                                            </Label>
                                            <Input value={muzakkiForm.address} onChange={e => setMuzakkiForm({ ...muzakkiForm, address: e.target.value })} className="bg-slate-50 dark:bg-slate-900 h-10" placeholder="Lengkapi dengan nama kota/kabupaten" />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <Button type="button" variant="ghost" className="flex-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95" onClick={() => setIsAddDialogOpen(false)}>Batal</Button>
                                        <Button type="submit" className="w-full btn-green rounded-xl">
                                            Daftarkan Muzakki Baru
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Muzakki</CardTitle>
                        <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                            <Users className="h-4 w-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{muzakkis.length}</div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Muzakki terverifikasi dalam sistem</p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Transaksi</CardTitle>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <Wallet className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalDonationsCount}</div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Banyaknya zakat yang telah dicatat</p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Metode Terima</CardTitle>
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                            <History className="h-4 w-4 text-amber-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">Admin</div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Pencatatan langsung oleh administrator</p>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <CardContent className="p-0">
                    <div className="rounded-md overflow-hidden overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                                <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                                    <TableHead className="w-[280px] font-bold text-slate-700 dark:text-slate-300">Muzakki</TableHead>
                                    <TableHead className="font-bold text-slate-700 dark:text-slate-300">Kontak & Alamat</TableHead>
                                    <TableHead className="text-center font-bold text-slate-700 dark:text-slate-300">Statistik</TableHead>
                                    <TableHead className="text-center font-bold text-slate-700 dark:text-slate-300">Catat Zakat</TableHead>
                                    <TableHead className="text-right font-bold text-slate-700 dark:text-slate-300 pr-8">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredMuzakkis.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="h-40 text-center text-slate-400">Tidak ada data muzakki ditemukan</TableCell></TableRow>
                                ) : (
                                    filteredMuzakkis
                                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                        .map((muzakki) => (
                                            <TableRow key={muzakki.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900 transition-colors border-slate-100 dark:border-slate-800">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold">
                                                            {muzakki.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900 dark:text-white capitalize">{muzakki.name}</div>
                                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                                                                NIK: {muzakki.nik || '-'}
                                                            </div>
                                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                                                                <Mail className="w-3 h-3" /> {muzakki.user?.email || '-'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                            <Badge variant="outline" className="font-mono text-[10px] px-1.5 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center gap-1">
                                                                <Phone className="w-2.5 h-2.5" />
                                                                {muzakki.phone || '-'}
                                                            </Badge>
                                                        </div>
                                                        <div className="text-xs text-slate-400 truncate max-w-[200px] flex items-center gap-1">
                                                            <MapPin className="w-2.5 h-2.5 shrink-0" />
                                                            {muzakki.address || 'Alamat tidak tersedia'}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border-blue-100 dark:border-blue-800 gap-1.5 px-3 py-1">
                                                        <Heart className="w-3 h-3 fill-current" />
                                                        {muzakki._count?.donations || 0} Zakat
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Button
                                                        onClick={() => openDonationDialog(muzakki)}
                                                        className="h-9 px-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-600 dark:hover:bg-green-600 text-green-700 dark:text-green-400 hover:text-white border border-green-200 dark:border-green-800 transition-all gap-2 font-bold shadow-none"
                                                    >
                                                        <Wallet className="w-4 h-4" />
                                                        Input Zakat
                                                    </Button>
                                                </TableCell>
                                                <TableCell className="text-right pr-8">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 hover:text-emerald-600 dark:hover:text-emerald-300 rounded-lg"
                                                            onClick={() => setViewingMuzakki(muzakki)}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-300 rounded-lg"
                                                            onClick={() => openEditDialog(muzakki)}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg"
                                                            onClick={() => handleDeleteMuzakki(muzakki.id, muzakki.name)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination Controls */}
            <div className="flex justify-center pt-2">
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={Math.ceil(filteredMuzakkis.length / itemsPerPage)}
                    onPageChange={setCurrentPage}
                />
            </div>

            <Dialog open={isDonationDialogOpen} onOpenChange={setIsDonationDialogOpen}>
                <DialogContent className="max-w-[700px] w-[95vw] h-[700px] max-h-[90vh] dialog-bg-navy dialog-border-navy border-0 shadow-2xl p-0 overflow-hidden flex flex-col">
                    <div className="bg-green-600 p-6 text-white relative shrink-0">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                                <Wallet className="w-6 h-6" />
                                Pencatatan Zakat
                            </DialogTitle>
                            <DialogDescription className="text-green-50 font-medium opacity-90">
                                Tambahkan histori zakat baru dari <span className="text-white font-bold underline underline-offset-4 decoration-2">{donationData.isAnonymous ? 'Hamba Allah' : donationData.muzakkiName}</span>
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                        <form onSubmit={handleDonationSubmit} className="space-y-6">
                            {/* Info: Dana Terkumpul */}
                            <div className="pool-info-box">
                                <div className="flex items-center gap-3">
                                    <div className="pool-icon-wrapper">
                                        <Wallet className="pool-icon" />
                                    </div>
                                    <div>
                                        <p className="pool-label">Dana Terkumpul Saat Ini</p>
                                        <p className="pool-amount">
                                            Rp {poolBalance.toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                                <p className="pool-desc">
                                    Zakat yang dicatat akan masuk ke Dana Terkumpul, lalu disalurkan ke program-program oleh admin.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                                        <Calendar className="w-4 h-4 text-green-500" /> Tanggal Terima
                                    </Label>
                                    <Input
                                        required
                                        type="date"
                                        value={donationData.date}
                                        onChange={e => setDonationData({ ...donationData, date: e.target.value })}
                                        className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-green-500/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                                        <CreditCard className="w-4 h-4 text-green-500" /> Metode Bayar
                                    </Label>
                                    <Select
                                        value={donationData.paymentMethod}
                                        onValueChange={(v: string) => setDonationData({ ...donationData, paymentMethod: v })}
                                    >
                                        <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-11 focus:ring-green-500/20">
                                            <SelectValue placeholder="Metode" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Cash">Tunai (Cash)</SelectItem>
                                            <SelectItem value="Transfer">Transfer Bank</SelectItem>
                                            <SelectItem value="QRIS">QRIS / E-Wallet</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                                    <Wallet className="w-4 h-4 text-green-500" /> Nominal Penerimaan
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-semibold text-sm">Rp</span>
                                    <Input
                                        required
                                        type="text"
                                        placeholder="0"
                                        value={formatIDR(donationData.amount)}
                                        onChange={handleAmountChange}
                                        className="pl-14 h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-lg font-bold text-green-600 dark:text-green-400 focus:ring-green-500/20"
                                    />
                                </div>
                            </div>

                            {/* Hamba Allah Checkbox */}
                            <div className="py-2">
                                <label className="flex items-center gap-4 cursor-pointer group select-none">
                                    <input
                                        type="checkbox"
                                        checked={donationData.isAnonymous}
                                        onChange={(e) => setDonationData({ ...donationData, isAnonymous: e.target.checked })}
                                        className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 cursor-pointer"
                                        style={{ accentColor: '#16a34a' }}
                                    />
                                    <span className="text-md font-bold text-green-600 dark:text-green-500">
                                        Zakat sebagai Hamba Allah
                                    </span>
                                </label>
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                                    <FileText className="w-4 h-4 text-green-500" /> Keterangan Tambahan
                                </Label>
                                <Input
                                    placeholder="Misal: Zakat Maal, Sedekah Shuvuh, dll"
                                    value={donationData.notes}
                                    onChange={e => setDonationData({ ...donationData, notes: e.target.value })}
                                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-11"
                                />
                            </div>

                            <Button type="submit" className="w-full btn-green h-12 text-lg mt-8" disabled={submitting}>
                                {submitting ? 'Menyimpan...' : (
                                    <span className="flex items-center gap-2">
                                        Konfirmasi Penerimaan <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    </span>
                                )}
                            </Button>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={!!editingMuzakki} onOpenChange={(o: boolean) => !o && setEditingMuzakki(null)}>
                <DialogContent className="max-w-[700px] w-[95vw] h-[700px] max-h-[90vh] dialog-bg-navy dialog-border-navy border-0 shadow-2xl p-0 overflow-hidden flex flex-col">
                    <div className="bg-green-600 px-6 py-4 text-white relative shrink-0 overflow-hidden">
                        <DialogHeader className="pt-0">
                            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                                <Edit className="w-5 h-5" />
                                Edit Profil Muzakki
                            </DialogTitle>
                            <DialogDescription className="text-green-50 font-medium opacity-90 text-sm">
                                Pembaruan informasi kontak dan data administratif muzakki
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                        <form onSubmit={handleUpdateMuzakki} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                                        <UserPlus className="w-4 h-4 text-green-500" /> NIK
                                    </Label>
                                    <Input value={muzakkiForm.nik} onChange={e => setMuzakkiForm({ ...muzakkiForm, nik: e.target.value })} className="bg-slate-50 h-11 dark:bg-slate-900" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                                        <Users className="w-4 h-4 text-green-500" /> Nama Lengkap
                                    </Label>
                                    <Input required value={muzakkiForm.name} onChange={e => setMuzakkiForm({ ...muzakkiForm, name: e.target.value })} className="bg-slate-50 h-11 dark:bg-slate-900" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                                        <Mail className="w-4 h-4 text-green-500" /> Alamat Email
                                    </Label>
                                    <Input required type="email" value={muzakkiForm.email} onChange={e => setMuzakkiForm({ ...muzakkiForm, email: e.target.value })} className="bg-slate-50 dark:bg-slate-900 h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                                        <Lock className="w-4 h-4 text-green-500" /> Kata Sandi Baru
                                    </Label>
                                    <Input type="password" value={muzakkiForm.password} onChange={e => setMuzakkiForm({ ...muzakkiForm, password: e.target.value })} className="bg-slate-50 dark:bg-slate-900 h-11" placeholder="Kosongkan jika tidak diubah" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                                        <Phone className="w-4 h-4 text-green-500" /> Nomor Telepon
                                    </Label>
                                    <Input value={muzakkiForm.phone} onChange={e => setMuzakkiForm({ ...muzakkiForm, phone: e.target.value })} className="bg-slate-50 h-11 dark:bg-slate-900" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                                        <Briefcase className="w-4 h-4 text-green-500" /> Pekerjaan
                                    </Label>
                                    <Input value={muzakkiForm.job} onChange={e => setMuzakkiForm({ ...muzakkiForm, job: e.target.value })} className="bg-slate-50 h-11 dark:bg-slate-900" placeholder="Profesi" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                                        <Building2 className="w-4 h-4 text-green-500" /> Instansi
                                    </Label>
                                    <Input value={muzakkiForm.institution} onChange={e => setMuzakkiForm({ ...muzakkiForm, institution: e.target.value })} className="bg-slate-50 h-11 dark:bg-slate-900" placeholder="Kantor/Usaha" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                                    <MapPin className="w-4 h-4 text-green-500" /> Alamat Domisili
                                </Label>
                                <Input value={muzakkiForm.address} onChange={e => setMuzakkiForm({ ...muzakkiForm, address: e.target.value })} className="bg-slate-50 h-11 dark:bg-slate-900" />
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <Button type="button" variant="ghost" className="flex-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95" onClick={() => setEditingMuzakki(null)}>Batal</Button>
                                <Button type="submit" className="flex-1 btn-green h-11" disabled={submitting}>
                                    {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Detail Dialog */}
            <Dialog open={!!viewingMuzakki} onOpenChange={(o: boolean) => !o && setViewingMuzakki(null)}>
                <DialogContent className="max-w-[700px] w-[95vw] h-[700px] max-h-[90vh] dialog-bg-navy dialog-border-navy border-0 shadow-2xl p-0 overflow-hidden flex flex-col">
                    <div className="bg-green-600 px-6 py-4 text-white relative shrink-0 overflow-hidden">
                        <DialogHeader className="pt-0">
                            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                                <UserPlus className="w-5 h-5" />
                                Detail Profil Muzakki
                            </DialogTitle>
                            <DialogDescription className="text-green-50 font-medium opacity-90 text-sm">
                                Informasi lengkap profil donasi / muzakki
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    {viewingMuzakki && (
                        <div className="p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 space-y-6">
                            <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-2xl">
                                    {viewingMuzakki.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-slate-900 dark:text-white capitalize">{viewingMuzakki.name}</h3>
                                    <p className="text-slate-500 font-medium text-sm flex items-center gap-1 mt-1">
                                        <Mail className="w-4 h-4"/> {viewingMuzakki.user?.email || '-'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                                        <UserPlus className="w-4 h-4 text-green-500" /> NIK
                                    </Label>
                                    <Input readOnly value={viewingMuzakki.nik || '-'} className="bg-slate-50 h-11 dark:bg-slate-900 cursor-default focus-visible:ring-0" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                                        <Briefcase className="w-4 h-4 text-green-500" /> Pekerjaan
                                    </Label>
                                    <Input readOnly value={viewingMuzakki.job || '-'} className="bg-slate-50 h-11 dark:bg-slate-900 cursor-default focus-visible:ring-0" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                                        <Building2 className="w-4 h-4 text-green-500" /> Instansi
                                    </Label>
                                    <Input readOnly value={viewingMuzakki.institution || '-'} className="bg-slate-50 h-11 dark:bg-slate-900 cursor-default focus-visible:ring-0" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                                        <Phone className="w-4 h-4 text-green-500" /> Nomor Telepon
                                    </Label>
                                    <Input readOnly value={viewingMuzakki.phone || '-'} className="bg-slate-50 h-11 dark:bg-slate-900 cursor-default focus-visible:ring-0" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                                        <MapPin className="w-4 h-4 text-green-500" /> Alamat Lengkap
                                    </Label>
                                    <Input readOnly value={viewingMuzakki.address || '-'} className="bg-slate-50 h-11 dark:bg-slate-900 cursor-default focus-visible:ring-0" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                                        <Heart className="w-4 h-4 text-green-500" /> Aktivitas Zakat
                                    </Label>
                                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex flex-col justify-center min-h-[44px]">
                                        <p className="font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/40 px-4 py-2 rounded-md w-max inline-flex items-center gap-2">
                                            <Heart className="w-4 h-4 fill-green-500 text-green-500" />
                                            Tercatat {viewingMuzakki._count?.donations || 0} Kali Donasi
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <Button onClick={() => setViewingMuzakki(null)} className="w-full btn-green h-11 text-base font-bold shadow-sm">
                                    Tutup Dialog
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
