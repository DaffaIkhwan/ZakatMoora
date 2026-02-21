import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { AlertCircle, Plus, Edit, Trash2, Save, X, Settings } from 'lucide-react';
import { useTheme } from './theme-provider';
import type { Criterion, Aspect, AspectOption } from '../types';
import { ICON_MAP } from './CriteriaInfo';

interface CriteriaManagerProps {
    criteriaList: Criterion[];
    onUpdate: (newCriteria: Criterion[]) => void;
    onClose: () => void;
}

export function CriteriaManager({ criteriaList, onUpdate, onClose }: CriteriaManagerProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const buttonBgColor = isDark ? '#3b82f6' : '#0d6f4eb1'; // blue for dark, green for light

    const [localCriteria, setLocalCriteria] = useState<Criterion[]>(JSON.parse(JSON.stringify(criteriaList)));
    const [editingCriterion, setEditingCriterion] = useState<Criterion | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    // Weights validation
    const totalWeight = localCriteria.reduce((sum, c) => sum + c.weight, 0);
    const isValidWeight = Math.abs(totalWeight - 1.0) < 0.001;

    const handleSave = () => {
        if (!isValidWeight) {
            if (!confirm(`Total bobot saat ini ${(totalWeight * 100).toFixed(0)}%. Seharusnya 100%. Apakah Anda yakin ingin menyimpan? (Perhitungan MOORA mungkin tidak akurat)`)) {
                return;
            }
        }
        onUpdate(localCriteria);
        onClose();
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
        setIsEditDialogOpen(true);
    };

    const handleEditCriterion = (criterion: Criterion) => {
        setEditingCriterion(JSON.parse(JSON.stringify(criterion))); // Deep copy
        setIsEditDialogOpen(true);
    };

    const handleDeleteCriterion = (code: string) => {
        if (confirm('Apakah Anda yakin ingin menghapus kriteria ini? Data nilai mustahik untuk kriteria ini mungkin akan hilang atau error.')) {
            setLocalCriteria(prev => prev.filter(c => c.code !== code));
        }
    };

    const saveCriterionEdit = () => {
        if (!editingCriterion) return;

        // Check if new or existing by code presence in original list (simplified logic, assumes codes are unique keys but editable? No, let's keep codes somewhat static or handle rename carefully. ideally ID based but we use Code)
        // Actually, if we change code, we break compatibility with existing mustahik data keys. 
        // For now, let's allow editing everything but warn about Code changes if needed. 
        // Or just check if code exists in localCriteria.

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
        <Card className="border-slate-200 dark:border-slate-800 shadow-lg">
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
                    <Button variant="outline" onClick={onClose} size="sm" className="border-slate-300 dark:border-slate-600">Tutup</Button>
                    <Button
                        onClick={handleSave}
                        size="sm"
                        className="gap-2 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:opacity-90"
                        style={{ backgroundColor: buttonBgColor }}
                    >
                        <Save className="w-4 h-4" />
                        <span className="font-medium">Simpan Perubahan</span>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex justify-end">
                    <Button onClick={handleAddCriterion} size="sm" className="gap-2">
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
                                        <Button variant="ghost" size="sm" onClick={() => handleEditCriterion(criterion)}>
                                            <Edit className="w-4 h-4 text-blue-600" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDeleteCriterion(criterion.code)}>
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
                <DialogContent className="!max-w-[calc(100vw-8rem)] max-h-[90vh] overflow-y-auto !bg-white !dark:bg-slate-900 !px-16 !pb-14">
                    <DialogHeader>
                        <DialogTitle>Edit Kriteria {editingCriterion?.code}</DialogTitle>
                        <DialogDescription>Edit detail kriteria dan sub-kriteria (aspek)</DialogDescription>
                    </DialogHeader>

                    {editingCriterion && (
                        <div className="space-y-6 py-4">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4 border-b pb-4">
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
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold text-lg">Aspek Penilaian (Sub-Kriteria)</h4>
                                    <Button size="sm" variant="outline" onClick={addAspect} className="gap-2">
                                        <Plus className="w-3 h-3" /> Tambah Aspek
                                    </Button>
                                </div>

                                <div className="space-y-6">
                                    {editingCriterion.aspects.map((aspect, aspectIndex) => (
                                        <div key={aspectIndex} className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50">
                                            <div className="flex items-end gap-3 mb-3">
                                                <div className="w-24">
                                                    <Label className="text-xs">Kode</Label>
                                                    <Input
                                                        value={aspect.code}
                                                        onChange={e => updateAspect(aspectIndex, 'code', e.target.value)}
                                                        className="bg-white h-8"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <Label className="text-xs">Nama Aspek</Label>
                                                    <Input
                                                        value={aspect.name}
                                                        onChange={e => updateAspect(aspectIndex, 'name', e.target.value)}
                                                        className="bg-white h-8"
                                                    />
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => removeAspect(aspectIndex)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            {/* Options */}
                                            <div className="ml-4 pl-4 border-l-2 border-slate-200">
                                                <Label className="text-xs text-slate-500 mb-2 block">Pilihan Jawaban & Poin</Label>
                                                <div className="space-y-2">
                                                    {aspect.options.map((opt, optIndex) => (
                                                        <div key={optIndex} className="flex items-center gap-2">
                                                            <Input
                                                                value={opt.label}
                                                                onChange={e => updateOption(aspectIndex, optIndex, 'label', e.target.value)}
                                                                className="flex-1 h-7 text-sm bg-white"
                                                                placeholder="Label pilihan"
                                                            />
                                                            <Input
                                                                type="number"
                                                                value={opt.value}
                                                                onChange={e => updateOption(aspectIndex, optIndex, 'value', parseInt(e.target.value) || 0)}
                                                                className="w-20 h-7 text-sm bg-white text-center"
                                                                placeholder="Nilai"
                                                            />
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400" onClick={() => removeOption(aspectIndex, optIndex)}>
                                                                <X className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <Button variant="link" size="sm" className="h-6 px-0 text-blue-600 text-xs" onClick={() => addOption(aspectIndex)}>
                                                        + Tambah Pilihan
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Batal</Button>
                        <Button onClick={saveCriterionEdit}>Simpan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
