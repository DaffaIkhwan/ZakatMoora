import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { TrendingUp } from 'lucide-react';
import { useTheme } from './theme-provider';
import type { MonitoringData } from '../types';

interface MonitoringFormProps {
    mustahikId: string;
    mustahikName: string;
    programId?: string;
    programs: { id: string; name: string }[];
    onSubmit: (data: Partial<MonitoringData>) => void;
}

export function MonitoringForm({ mustahikId, mustahikName, programId, programs, onSubmit }: MonitoringFormProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const buttonBgColor = isDark ? '#3b82f6' : '#0d6f4eb1'; // blue for dark, green for light

    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        programId: programId || '',
        monitoringDate: new Date().toISOString().split('T')[0],
        businessType: 'Perdagangan',
        customBusinessType: '',
        revenue: '',
        profit: '',
        businessStatus: 'stabil',
        monthlyIncome: '',
        monthlyExpenditure: '',
        housingCondition: 'sedang',
        challenges: '',
        achievements: '',
        nextPlan: '',
        notes: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const monitoringData: Partial<MonitoringData> = {
            mustahikId,
            programId: formData.programId,
            monitoringDate: new Date(formData.monitoringDate).toISOString(),
            businessProgress: {
                revenue: parseInt(formData.revenue) || 0,
                profit: parseInt(formData.profit) || 0,
                businessStatus: formData.businessStatus as MonitoringData['businessProgress']['businessStatus'],
                businessType: formData.businessType === 'Lainnya' ? (formData.customBusinessType || 'Lainnya') : formData.businessType,
                employeeCount: 0,
            },
            socialEconomicCondition: {
                monthlyIncome: parseInt(formData.monthlyIncome) || 0,
                monthlyExpenditure: parseInt(formData.monthlyExpenditure) || 0,
                housingCondition: formData.housingCondition as MonitoringData['socialEconomicCondition']['housingCondition'],
                dependentCount: 0,
                healthCondition: 'sehat',
                educationLevel: 'tetap',
            },
            challenges: formData.challenges,
            achievements: formData.achievements,
            nextPlan: formData.nextPlan,
            notes: formData.notes
        };

        onSubmit(monitoringData);
        setIsOpen(false);

        // Reset form
        setFormData({
            programId: programId || '',
            monitoringDate: new Date().toISOString().split('T')[0],
            businessType: 'Perdagangan',
            customBusinessType: '',
            revenue: '',
            profit: '',
            businessStatus: 'stabil',
            monthlyIncome: '',
            monthlyExpenditure: '',
            housingCondition: 'sedang',
            challenges: '',
            achievements: '',
            nextPlan: '',
            notes: ''
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2 text-white shadow-sm font-medium hover:opacity-90" style={{ backgroundColor: buttonBgColor }}>
                    <TrendingUp className="w-4 h-4" />
                    Input Pendapatan
                </Button>
            </DialogTrigger>
            <DialogContent className="!max-w-[calc(100vw-8rem)] max-h-[90vh] overflow-y-auto !bg-white !dark:bg-slate-900 !px-16 !pb-14">
                <DialogHeader>
                    <DialogTitle>Input Progress Usaha - {mustahikName}</DialogTitle>
                    <DialogDescription>
                        Catat perkembangan usaha dan kondisi ekonomi mustahik
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Program Selection */}
                    <div className="space-y-2">
                        <Label>Program Bantuan *</Label>
                        <Select
                            value={formData.programId}
                            onValueChange={(value: string) => setFormData({ ...formData, programId: value })}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih program" />
                            </SelectTrigger>
                            <SelectContent>
                                {programs.map(prog => (
                                    <SelectItem key={prog.id} value={prog.id}>{prog.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Monitoring Date */}
                    <div className="space-y-2">
                        <Label>Tanggal Monitoring *</Label>
                        <Input
                            type="date"
                            value={formData.monitoringDate}
                            onChange={(e) => setFormData({ ...formData, monitoringDate: e.target.value })}
                            required
                        />
                    </div>

                    {/* Business Progress Section */}
                    <div className="border-t pt-4">
                        <h4 className="font-semibold mb-4 text-lg">Perkembangan Usaha</h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Jenis Usaha *</Label>
                                <Select
                                    value={formData.businessType}
                                    onValueChange={(value: string) => setFormData({ ...formData, businessType: value, customBusinessType: value === 'Lainnya' ? formData.customBusinessType : '' })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Perdagangan">Perdagangan</SelectItem>
                                        <SelectItem value="Jasa">Jasa</SelectItem>
                                        <SelectItem value="Produksi">Produksi</SelectItem>
                                        <SelectItem value="Pertanian">Pertanian</SelectItem>
                                        <SelectItem value="Peternakan">Peternakan</SelectItem>
                                        <SelectItem value="Lainnya">Lainnya</SelectItem>
                                    </SelectContent>
                                </Select>
                                {formData.businessType === 'Lainnya' && (
                                    <Input
                                        placeholder="Ketik jenis usaha..."
                                        value={formData.customBusinessType}
                                        onChange={(e) => setFormData({ ...formData, customBusinessType: e.target.value })}
                                        className="mt-2"
                                        required
                                    />
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Status Usaha *</Label>
                                <Select
                                    value={formData.businessStatus}
                                    onValueChange={(value: string) => setFormData({ ...formData, businessStatus: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="naik">Naik</SelectItem>
                                        <SelectItem value="stabil">Stabil</SelectItem>
                                        <SelectItem value="turun">Turun</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Omzet Bulanan (Rp) *</Label>
                                <Input
                                    type="number"
                                    placeholder="Contoh: 5000000"
                                    value={formData.revenue}
                                    onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Keuntungan Bulanan (Rp) *</Label>
                                <Input
                                    type="number"
                                    placeholder="Contoh: 2000000"
                                    value={formData.profit}
                                    onChange={(e) => setFormData({ ...formData, profit: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Socio-Economic Condition */}
                    <div className="border-t pt-4">
                        <h4 className="font-semibold mb-4 text-lg">Kondisi Sosial Ekonomi</h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Pendapatan Rumah Tangga (Rp/bulan) *</Label>
                                <Input
                                    type="number"
                                    placeholder="Contoh: 3000000"
                                    value={formData.monthlyIncome}
                                    onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Pengeluaran Rumah Tangga (Rp/bulan) *</Label>
                                <Input
                                    type="number"
                                    placeholder="Contoh: 2500000"
                                    value={formData.monthlyExpenditure}
                                    onChange={(e) => setFormData({ ...formData, monthlyExpenditure: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="border-t pt-4 space-y-4">
                        <h4 className="font-semibold text-lg">Catatan Tambahan</h4>

                        <div className="space-y-2">
                            <Label>Tantangan yang Dihadapi</Label>
                            <Textarea
                                placeholder="Contoh: Persaingan harga, kesulitan bahan baku..."
                                value={formData.challenges}
                                onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Pencapaian</Label>
                            <Textarea
                                placeholder="Contoh: Pelanggan bertambah 20%, produk baru laris..."
                                value={formData.achievements}
                                onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Rencana Ke Depan</Label>
                            <Textarea
                                placeholder="Contoh: Menambah varian produk, ekspansi lokasi..."
                                value={formData.nextPlan}
                                onChange={(e) => setFormData({ ...formData, nextPlan: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Catatan Surveyor</Label>
                            <Textarea
                                placeholder="Catatan tambahan dari surveyor..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={2}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit">
                            Simpan Progress
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
