import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { TrendingUp } from 'lucide-react';
import type { MonitoringData } from '../types';

interface MonitoringFormProps {
    mustahikId: string;
    mustahikName: string;
    programId?: string;
    programs: { id: string; name: string }[];
    onSubmit: (data: Partial<MonitoringData>) => void;
}

export function MonitoringForm({ mustahikId, mustahikName, programId, programs, onSubmit }: MonitoringFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        programId: programId || '',
        monitoringDate: new Date().toISOString().split('T')[0],
        businessType: 'Perdagangan',
        customBusinessType: '',
        revenue: '', // Omzet (O_t)
        operationalCost: '', // Biaya Operasional (B_t)
        monthlyIncome: '', // Pendapatan RT
        monthlyExpenditure: '', // Konsumsi Esensial (C_t)
        challenges: '',
        achievements: '',
        nextPlan: '',
        notes: ''
    });

    const formatNumber = (num: string) => {
        if (!num) return '';
        const number = parseInt(num.replace(/\D/g, ''));
        if (isNaN(number)) return '';
        return number.toLocaleString('id-ID');
    };

    const handleNumericChange = (key: string, value: string) => {
        const cleanValue = value.replace(/\D/g, '');
        setFormData(prev => ({ ...prev, [key]: cleanValue }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const monitoringData: Partial<MonitoringData> = {
            mustahikId,
            programId: formData.programId,
            monitoringDate: new Date(formData.monitoringDate).toISOString(),
            businessProgress: {
                revenue: parseInt(formData.revenue) || 0,
                operationalCost: parseInt(formData.operationalCost) || 0,
                netIncome: (parseInt(formData.revenue) || 0) - (parseInt(formData.operationalCost) || 0),
                profit: (parseInt(formData.revenue) || 0) - (parseInt(formData.operationalCost) || 0), // legacy support
                businessType: formData.businessType === 'Lainnya' ? (formData.customBusinessType || 'Lainnya') : formData.businessType,
                businessStatus: 'stabil',
            },
            socialEconomicCondition: {
                monthlyIncome: parseInt(formData.monthlyIncome) || 0,
                monthlyExpenditure: parseInt(formData.monthlyExpenditure) || 0,
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
            operationalCost: '',
            monthlyIncome: '',
            monthlyExpenditure: '',
            challenges: '',
            achievements: '',
            nextPlan: '',
            notes: ''
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="btn-green gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Input Monitoring
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[500px] w-[95vw] h-[700px] max-h-[90vh] dialog-bg-navy dialog-border-navy border-0 shadow-2xl p-0 overflow-hidden flex flex-col">
                <div className="bg-green-600 px-6 py-4 text-white relative shrink-0 overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <DialogHeader className="pt-0">
                        <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">Input Progress Usaha - {mustahikName}</DialogTitle>
                        <DialogDescription className="text-green-50/90 font-medium">
                            Catat perkembangan usaha dan kondisi ekonomi mustahik
                        </DialogDescription>
                    </DialogHeader>
                </div>
                <div className="flex-1 overflow-y-auto p-6">

                <form onSubmit={handleSubmit} className="space-y-6">


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
                            <div className="space-y-2 col-span-2">
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
                                <Label>Total Pemasukan Kotor / Omzet *</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium tracking-widest text-sm">Rp</span>
                                    <Input
                                        type="text"
                                        placeholder=""
                                        value={formatNumber(formData.revenue)}
                                        onChange={(e) => handleNumericChange('revenue', e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                                <p className="text-[11px] leading-tight text-slate-500">Nilai uang tunai utuh yang masuk dari hasil penjualan/usaha mustahik selama satu bulan (sebelum dikurangi pengeluaran apapun).</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Biaya Operasional Usaha *</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium tracking-widest text-sm">Rp</span>
                                    <Input
                                        type="text"
                                        placeholder=""
                                        value={formatNumber(formData.operationalCost)}
                                        onChange={(e) => handleNumericChange('operationalCost', e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                                <p className="text-[11px] leading-tight text-slate-500">Total pengeluaran yang dihabiskan khusus untuk memutar roda usaha bulan ini (sewa tempat, beli bahan baku, listrik lapak, dll).</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Pendapatan Rumah Tangga (RT) Tambahan</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium tracking-widest text-sm">Rp</span>
                                    <Input
                                        type="text"
                                        placeholder="0"
                                        value={formatNumber(formData.monthlyIncome)}
                                        onChange={(e) => handleNumericChange('monthlyIncome', e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <p className="text-[11px] leading-tight text-slate-500">Pemasukan lain di luar keuntungan usaha (contoh: bantuan sosial, gaji sampingan, pemberian anak, dll).</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Konsumsi Esensial / Pengeluaran Primer *</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium tracking-widest text-sm">Rp</span>
                                    <Input
                                        type="text"
                                        placeholder="1.000.000"
                                        value={formatNumber(formData.monthlyExpenditure)}
                                        onChange={(e) => handleNumericChange('monthlyExpenditure', e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                                <p className="text-[11px] leading-tight text-slate-500">Total pengeluaran rumah tangga bulan ini yang vital untuk keberlangsungan hidup (beli beras/makanan, SPP sekolah anak, biaya berobat, ongkos).</p>
                            </div>
                        </div>

                        <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/50 rounded-lg shadow-sm">
                             <div className="flex justify-between items-center">
                                 <span className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Estimasi Kesejahteraan (Laba Usaha + Pendapatan RT Lainnya):</span>
                                 <span className="text-base font-bold text-emerald-700 dark:text-emerald-400 drop-shadow-sm">
                                     Rp {(((parseInt(formData.revenue) || 0) - (parseInt(formData.operationalCost) || 0)) + (parseInt(formData.monthlyIncome) || 0)).toLocaleString('id-ID')}
                                 </span>
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
                        <Button type="button" variant="outline" className="transition-all hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95" onClick={() => setIsOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" className="btn-green px-8">
                            Simpan Progress
                        </Button>
                    </div>
                </form>
            </div>
            </DialogContent>
        </Dialog>
    );
}
