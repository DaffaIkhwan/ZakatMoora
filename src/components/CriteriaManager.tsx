import { useState } from 'react';
import { toast } from 'sonner';
import { useConfirm } from '../hooks/use-confirm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { AlertCircle, Plus, Edit, Trash2, Save, X, Settings, CheckCircle2 } from 'lucide-react';
import { useTheme } from './theme-provider';
import type { Criterion, Aspect, AspectOption } from '../types';
import { ICON_MAP } from './CriteriaInfo';

interface CriteriaManagerProps {
    criteriaList: Criterion[];
    onUpdate: (newCriteria: Criterion[]) => void;
    onClose: () => void;
}

export function CriteriaManager({ criteriaList, onUpdate, onClose }: CriteriaManagerProps) {
    const { confirm } = useConfirm();

    const [localCriteria, setLocalCriteria] = useState<Criterion[]>(JSON.parse(JSON.stringify(criteriaList)));
    const [editingCriterion, setEditingCriterion] = useState<Criterion | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<'edit' | 'add'>('edit');

    // Weights validation
    const totalWeight = localCriteria.reduce((sum, c) => sum + c.weight, 0);
    const isValidWeight = Math.abs(totalWeight - 1.0) < 0.001;

    const handleSave = () => {
        if (!isValidWeight) {
            confirm({
                title: 'Bobot Tidak Seimbang',
                description: `Total bobot saat ini ${(totalWeight * 100).toFixed(0)}%. Seharusnya 100%. Apakah Anda yakin ingin menyimpan? Perhitungan MOORA mungkin tidak akurat.`,
                confirmText: 'Tetap Simpan',
                variant: 'default',
                onConfirm: () => {
                    onUpdate(localCriteria);
                    onClose();
                    toast.warning('Kriteria Disimpan', {
                        description: 'Kriteria berhasil disimpan dengan total bobot tidak 100%.'
                    });
                }
            });
            return;
        }
        const toastId = toast.loading('Sedang memperbarui kriteria & bobot...');
        setTimeout(() => {
            onUpdate(localCriteria);
            onClose();
            toast.success('Kriteria Diperbarui', {
                id: toastId,
                description: 'Bobot dan kriteria sistem MOORA telah diperbarui.'
            });
        }, 800);
    };

    const handleAddCriterion = () => {
        const newCode = `C${localCriteria.length + 1}`;
        const newCriterion: Criterion = {
            code: newCode,
            name: 'Kriteria Baru',
            weight: 0,
            type: 'benefit',
            icon: 'Circle',
            color: 'bg-slate-400',
            description: 'Deskripsi kriteria baru',
            aspects: []
        };
        setEditingCriterion(newCriterion);
        setDialogMode('add');
        setIsEditDialogOpen(true);
    };

    const handleEditCriterion = (criterion: Criterion) => {
        setEditingCriterion(JSON.parse(JSON.stringify(criterion))); // Deep copy
        setDialogMode('edit');
        setIsEditDialogOpen(true);
    };

    const handleDeleteCriterion = (code: string) => {
        confirm({
            title: 'Hapus Kriteria',
            description: `Apakah Anda yakin ingin menghapus kriteria ${code}? Data nilai mustahik untuk kriteria ini mungkin akan hilang atau bermasalah.`,
            confirmText: 'Hapus Kriteria',
            variant: 'destructive',
            onConfirm: () => {
                setLocalCriteria(prev => prev.filter(c => c.code !== code));
                toast.success('Kriteria Dihapus', {
                    description: `Kriteria ${code} berhasil dihapus dari daftar.`
                });
            }
        });
    };

    const saveCriterionEdit = () => {
        if (!editingCriterion) return;

        const toastId = toast.loading('Memverifikasi perubahan kriteria...');
        setTimeout(() => {
            const index = localCriteria.findIndex(c => c.code === editingCriterion.code);
            if (index >= 0) {
                // Update existing
                const newList = [...localCriteria];
                newList[index] = editingCriterion;
                setLocalCriteria(newList);
            } else {
                // Add new
                setLocalCriteria([...localCriteria, editingCriterion]);
            }
            setIsEditDialogOpen(false);
            setEditingCriterion(null);
            toast.success('Kriteria Disimpan', { id: toastId });
        }, 600);
    };

    // Aspect Management Methods within Edit Dialog
    const addAspect = () => {
        if (!editingCriterion) return;
        const newAspect: Aspect = {
            code: `${editingCriterion.code}${String.fromCharCode(65 + editingCriterion.aspects.length)}`, // Generate C1A, C1B etc.
            name: 'Aspek Baru',
            options: [
                { label: 'Opsi 1', value: 0 },
                { label: 'Opsi 2', value: 5 }
            ]
        };
        setEditingCriterion({
            ...editingCriterion,
            aspects: [...editingCriterion.aspects, newAspect]
        });
    };

    const updateAspect = (aspectIndex: number, field: keyof Aspect, value: any) => {
        if (!editingCriterion) return;
        const newAspects = [...editingCriterion.aspects];
        newAspects[aspectIndex] = { ...newAspects[aspectIndex], [field]: value };
        setEditingCriterion({ ...editingCriterion, aspects: newAspects });
    };

    const removeAspect = (aspectIndex: number) => {
        if (!editingCriterion) return;
        const newAspects = editingCriterion.aspects.filter((_, i) => i !== aspectIndex);
        setEditingCriterion({ ...editingCriterion, aspects: newAspects });
    };

    // Option Management
    const addOption = (aspectIndex: number) => {
        if (!editingCriterion) return;
        const newAspects = [...editingCriterion.aspects];
        newAspects[aspectIndex].options.push({ label: 'Opsi Baru', value: 0 });
        setEditingCriterion({ ...editingCriterion, aspects: newAspects });
    };

    const updateOption = (aspectIndex: number, optionIndex: number, field: keyof AspectOption, value: any) => {
        if (!editingCriterion) return;
        const newAspects = [...editingCriterion.aspects];
        newAspects[aspectIndex].options[optionIndex] = {
            ...newAspects[aspectIndex].options[optionIndex],
            [field]: value
        };
        setEditingCriterion({ ...editingCriterion, aspects: newAspects });
    };

    const removeOption = (aspectIndex: number, optionIndex: number) => {
        if (!editingCriterion) return;
        const newAspects = [...editingCriterion.aspects];
        newAspects[aspectIndex].options = newAspects[aspectIndex].options.filter((_, i) => i !== optionIndex);
        setEditingCriterion({ ...editingCriterion, aspects: newAspects });
    };

    return (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Manajemen Kriteria & Bobot
                    </CardTitle>
                    <CardDescription>
                        Atur kriteria, sub-kriteria, bobot, dan indikator penilaian
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={isValidWeight ? 'outline' : 'destructive'} className={isValidWeight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}>
                        Total Bobot: {(totalWeight * 100).toFixed(0)}%
                    </Badge>
                    <Button variant="outline" onClick={onClose} size="sm" className="btn-secondary border-slate-300 dark:border-slate-600">Tutup</Button>
                    <Button
                        onClick={handleSave}
                        size="sm"
                        className="btn-green gap-2"
                    >
                        <Save className="w-4 h-4" />
                        <span className="font-medium">Simpan Perubahan</span>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex justify-end">
                    <Button type="button" size="sm" onClick={handleAddCriterion} className="btn-green gap-2">
                        <Plus className="w-4 h-4" /> Tambah Kriteria
                    </Button>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-20">Kode</TableHead>
                            <TableHead>Nama Kriteria</TableHead>
                            <TableHead className="w-24 text-center">Bobot</TableHead>
                            <TableHead className="text-center">Aspek</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {localCriteria.map((criterion) => (
                            <TableRow key={criterion.code}>
                                <TableCell className="font-mono font-medium">{criterion.code}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${criterion.color.replace('bg-', 'bg-')}`} />
                                        {criterion.name}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">{(criterion.weight * 100).toFixed(0)}%</TableCell>
                                <TableCell className="text-center">{criterion.aspects.length} Aspek</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="sm" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95" onClick={() => handleEditCriterion(criterion)}>
                                            <Edit className="w-4 h-4 text-black dark:text-white" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 transition-all active:scale-95" onClick={() => handleDeleteCriterion(criterion.code)}>
                                            <Trash2 className="w-4 h-4 text-rose-600" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={(open: boolean) => !open && setIsEditDialogOpen(false)}>
                <DialogContent className="max-w-[580px] w-[95vw] h-[700px] max-h-[90vh] dialog-bg-navy dialog-border-navy border-0 shadow-2xl p-0 overflow-hidden flex flex-col">
                    <div className="bg-green-600 px-6 py-4 text-white relative shrink-0 overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <DialogHeader className="pt-0">
                            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                                <Settings className="w-5 h-5" />
                                {dialogMode === 'add' ? `Tambah Kriteria ${editingCriterion?.code}` : `Edit Kriteria ${editingCriterion?.code}`}
                            </DialogTitle>
                            <DialogDescription className="text-green-50/90 font-medium">
                                {dialogMode === 'add' ? 'Tambahkan kriteria baru dan detail sub-kriterianya' : 'Edit detail kriteria dan sub-kriteria (aspek)'}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {editingCriterion && (
                            <div className="space-y-6">
                                {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-3 border-b pb-4">
                                <div className="space-y-2">
                                    <Label>Kode Kriteria</Label>
                                    <Input
                                        value={editingCriterion.code}
                                        onChange={e => setEditingCriterion({ ...editingCriterion, code: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nama Kriteria</Label>
                                    <Input
                                        value={editingCriterion.name}
                                        onChange={e => setEditingCriterion({ ...editingCriterion, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Bobot (0.0 - 1.0)</Label>
                                    <Input
                                        type="number" step="0.01"
                                        value={editingCriterion.weight}
                                        onChange={e => setEditingCriterion({ ...editingCriterion, weight: parseFloat(e.target.value) || 0 })}
                                    />
                                    <p className="text-xs text-slate-500">Contoh: 0.15 = 15%</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Tipe Kriteria</Label>
                                    <Select
                                        value={editingCriterion.type || 'benefit'}
                                        onValueChange={(val: any) => setEditingCriterion({ ...editingCriterion, type: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="benefit">Benefit (Keuntungan)</SelectItem>
                                            <SelectItem value="cost">Cost (Biaya/Beban)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Icon</Label>
                                    <Select
                                        value={editingCriterion.icon}
                                        onValueChange={(val: string) => setEditingCriterion({ ...editingCriterion, icon: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(ICON_MAP).map(iconName => (
                                                <SelectItem key={iconName} value={iconName}>{iconName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>Warna (Tailwind Class)</Label>
                                    <Select
                                        value={editingCriterion.color}
                                        onValueChange={(val: string) => setEditingCriterion({ ...editingCriterion, color: val })}
                                    >
                                        <SelectTrigger>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-4 h-4 rounded ${editingCriterion.color}`} />
                                                <SelectValue />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['bg-sky-400', 'bg-rose-400', 'bg-amber-400', 'bg-violet-400', 'bg-emerald-400', 'bg-cyan-400', 'bg-orange-400', 'bg-slate-400'].map(color => (
                                                <SelectItem key={color} value={color}>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-4 h-4 rounded ${color}`} />
                                                        {color.replace('bg-', '')}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>Deskripsi</Label>
                                    <Input
                                        value={editingCriterion.description}
                                        onChange={e => setEditingCriterion({ ...editingCriterion, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Aspects Management */}
                            <div className="pt-4 mt-6 border-t border-slate-200 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">Aspek Penilaian (Sub-Kriteria)</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Atur indikator turunan beserta pilihan jawaban dan bobot masing-masing.</p>
                                    </div>
                                    <Button type="button" size="sm" onClick={addAspect} className="btn-green gap-2 shadow-md hover:shadow-lg transition-all">
                                        <Plus className="w-4 h-4" /> Tambah Aspek Baru
                                    </Button>
                                </div>

                                <div className="space-y-6">
                                    {editingCriterion.aspects.map((aspect, aspectIndex) => (
                                        <div key={aspectIndex} className="rounded-xl border border-slate-200 dark:border-slate-700 dialog-bg-navy shadow-sm overflow-hidden flex flex-col">
                                            {/* Green Header Mini-Dialog */}
                                            <div className="bg-green-600 px-4 py-3 text-white flex items-center justify-between shrink-0">
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-white/20 p-1.5 rounded-md">
                                                        <Settings className="w-3.5 h-3.5 text-white" />
                                                    </div>
                                                    <div>
                                                        <h5 className="font-bold text-white text-sm">Aspek: {aspect.code || '-'}</h5>
                                                        <p className="text-green-50 text-[10px] uppercase tracking-wider font-semibold opacity-80">Sub-Kriteria</p>
                                                    </div>
                                                </div>
                                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-green-50 hover:text-white hover:bg-green-700 rounded-full bg-white/10" onClick={() => removeAspect(aspectIndex)} title="Hapus Aspek">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            {/* Body Scrollable Area */}
                                            <div className="p-4 space-y-5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Kode Aspek</Label>
                                                        <Input
                                                            value={aspect.code}
                                                            onChange={e => updateAspect(aspectIndex, 'code', e.target.value)}
                                                            className="bg-slate-50 dark:bg-slate-800 h-9"
                                                            placeholder="Contoh: C1A"
                                                        />
                                                    </div>
                                                    <div className="space-y-2 md:col-span-3">
                                                        <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nama Aspek / Parameter</Label>
                                                        <Input
                                                            value={aspect.name}
                                                            onChange={e => updateAspect(aspectIndex, 'name', e.target.value)}
                                                            className="bg-slate-50 dark:bg-slate-800 h-9"
                                                            placeholder="Contoh: Kualitas Bangunan"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Options */}
                                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800">
                                                    <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
                                                        <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                            Opsi Penilaian & Poin
                                                        </Label>
                                                        <Badge variant="outline" className="bg-white dark:bg-slate-900">{aspect.options.length} Opsi</Badge>
                                                    </div>
                                                    
                                                    <div className="space-y-2">
                                                        {aspect.options.map((opt, optIndex) => (
                                                            <div key={optIndex} className="flex flex-col sm:flex-row items-center gap-2 relative group">
                                                                <div className="w-full flex items-center gap-2">
                                                                    <div className="w-6 h-6 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                                                        {optIndex + 1}
                                                                    </div>
                                                                    <Input
                                                                        value={opt.label}
                                                                        onChange={e => updateOption(aspectIndex, optIndex, 'label', e.target.value)}
                                                                        className="flex-1 h-9 text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                                                        placeholder="Deskripsi Pilihan"
                                                                    />
                                                                    <div className="relative">
                                                                        <Input
                                                                            type="number"
                                                                            value={opt.value}
                                                                            onChange={e => updateOption(aspectIndex, optIndex, 'value', parseInt(e.target.value) || 0)}
                                                                            className="w-24 h-9 text-sm bg-blue-50 dark:bg-blue-900/30 font-bold border-blue-200 dark:border-blue-800 text-center text-blue-700 dark:text-blue-300 pr-8"
                                                                            placeholder="Nilai"
                                                                        />
                                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-400">pt</span>
                                                                    </div>
                                                                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg opacity-0 md:opacity-100 group-hover:opacity-100 transition-opacity" onClick={() => removeOption(aspectIndex, optIndex)}>
                                                                        <X className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        
                                                        <div className="pt-2">
                                                            <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 text-xs text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => addOption(aspectIndex)}>
                                                                <Plus className="w-3 h-3" /> Tambah Pilihan Jawaban
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 px-6 py-4 shrink-0">
                        <DialogFooter>
                            <Button variant="outline" className="transition-all hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 border-slate-300 dark:border-slate-600" onClick={() => setIsEditDialogOpen(false)}>Batal</Button>
                            <Button className="btn-green px-8" onClick={saveCriterionEdit}>Simpan</Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
