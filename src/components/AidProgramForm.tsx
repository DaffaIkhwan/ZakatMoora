import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Save } from 'lucide-react';
import type { AidProgram } from '../types';
import { toast } from 'sonner';
import { useConfirm } from '../hooks/use-confirm';

interface AidProgramFormProps {
  initialData?: AidProgram;
  onSubmit: (program: AidProgram) => void;
}

export function AidProgramForm({ initialData, onSubmit }: AidProgramFormProps) {
  const { confirm } = useConfirm();
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [totalBudget, setTotalBudget] = useState(initialData?.totalBudget.toString() || '');
  const [quota, setQuota] = useState(initialData?.quota.toString() || '');
  const [startDate, setStartDate] = useState(
    initialData?.startDate ? initialData.startDate.split('T')[0] : ''
  );
  const [endDate, setEndDate] = useState(
    initialData?.endDate ? initialData.endDate.split('T')[0] : ''
  );
  const [status, setStatus] = useState<AidProgram['status']>(initialData?.status || 'draft');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !description.trim() || !totalBudget || !quota || !startDate || !endDate) {
      toast.error('Gagal validasi', {
        description: 'Semua field bertanda bintang (*) harus diisi!'
      });
      return;
    }

    const program: AidProgram = {
      id: initialData?.id || Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      totalBudget: parseFloat(totalBudget),
      budgetPerRecipient: parseFloat(totalBudget) / parseInt(quota),
      quota: parseInt(quota),
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      status,
      selectedCandidates: initialData?.selectedCandidates || [],
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };

    confirm({
      title: initialData ? 'Update Program?' : 'Terbitkan Program Baru?',
      description: initialData 
        ? `Simpan perubahan data untuk program "${program.name}"?`
        : `Daftarkan program "${program.name}" ke sistem? Dana akan ditarik secara otomatis berdasarkan total anggaran.`,
      confirmText: initialData ? 'Ya, Update' : 'Ya, Terbitkan',
      cancelText: 'Periksa Kembali',
      onConfirm: () => {
        const actionLabel = initialData ? 'Memperbarui program...' : 'Memverifikasi ketersediaan dana...';
        const toastId = toast.loading(actionLabel);

        setTimeout(() => {
          onSubmit(program);
          toast.success(initialData ? 'Program Diperbaharui' : 'Program Berhasil Dibuat', {
            id: toastId,
            description: `Program "${program.name}" telah masuk tahap ${status === 'draft' ? 'Draft' : 'Aktif'}.`
          });
        }, 800);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nama Program *</Label>
        <Input
          id="name"
          placeholder="Contoh: Bantuan Modal Usaha Q1 2025"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi *</Label>
        <Textarea
          id="description"
          placeholder="Jelaskan tujuan dan detail program bantuan..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="totalBudget" className="flex items-center gap-2">
            Total Anggaran (Rp) *
            {initialData && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Terkunci</span>}
          </Label>
          <Input
            id="totalBudget"
            type="number"
            placeholder="10000000"
            value={totalBudget}
            onChange={(e) => setTotalBudget(e.target.value)}
            disabled={!!initialData}
            required
            className={initialData ? "bg-slate-50 text-slate-500 cursor-not-allowed" : ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quota" className="flex items-center gap-2">
            Kuota Penerima *
            {initialData && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Terkunci</span>}
          </Label>
          <Input
            id="quota"
            type="number"
            placeholder="5"
            value={quota}
            onChange={(e) => setQuota(e.target.value)}
            disabled={!!initialData}
            required
            className={initialData ? "bg-slate-50 text-slate-500 cursor-not-allowed" : ""}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">Tanggal Mulai *</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Tanggal Selesai *</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status *</Label>
        <Select value={status} onValueChange={(value: AidProgram['status']) => setStatus(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="completed">Selesai</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" className="btn-green gap-2 px-6">
          <Save className="w-4 h-4" />
          {initialData ? 'Simpan Perubahan' : 'Buat Program'}
        </Button>
      </div>
    </form>
  );
}
