import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Save } from 'lucide-react';
import type { AidProgram } from '../types';

interface AidProgramFormProps {
  initialData?: AidProgram;
  onSubmit: (program: AidProgram) => void;
}

export function AidProgramForm({ initialData, onSubmit }: AidProgramFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [totalBudget, setTotalBudget] = useState(initialData?.totalBudget.toString() || '');
  const [budgetPerRecipient, setBudgetPerRecipient] = useState(initialData?.budgetPerRecipient.toString() || '');
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

    if (!name.trim() || !description.trim() || !totalBudget || !budgetPerRecipient || !quota || !startDate || !endDate) {
      alert('Semua field harus diisi!');
      return;
    }

    const program: AidProgram = {
      id: initialData?.id || Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      totalBudget: parseFloat(totalBudget),
      budgetPerRecipient: parseFloat(budgetPerRecipient),
      quota: parseInt(quota),
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      status,
      selectedCandidates: initialData?.selectedCandidates || [],
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };

    onSubmit(program);
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
          <Label htmlFor="totalBudget">Total Anggaran (Rp) *</Label>
          <Input
            id="totalBudget"
            type="number"
            placeholder="10000000"
            value={totalBudget}
            onChange={(e) => setTotalBudget(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="budgetPerRecipient">Anggaran per Penerima (Rp) *</Label>
          <Input
            id="budgetPerRecipient"
            type="number"
            placeholder="2000000"
            value={budgetPerRecipient}
            onChange={(e) => setBudgetPerRecipient(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quota">Kuota Penerima *</Label>
        <Input
          id="quota"
          type="number"
          placeholder="5"
          value={quota}
          onChange={(e) => setQuota(e.target.value)}
          required
        />
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
        <Button type="submit" className="gap-2">
          <Save className="w-4 h-4" />
          {initialData ? 'Simpan Perubahan' : 'Buat Program'}
        </Button>
      </div>
    </form>
  );
}
