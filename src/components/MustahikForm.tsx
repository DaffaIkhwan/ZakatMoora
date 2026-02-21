import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Save } from 'lucide-react';
import type { Mustahik, Criterion, UserRole } from '../types';
import { ICON_MAP } from './CriteriaInfo';

interface SubCriteriaValues {
  [aspectCode: string]: number;
}

interface MustahikFormProps {
  initialData?: Mustahik;
  onSubmit: (mustahik: Mustahik) => void;
  criteriaList: Criterion[];
  userRole: UserRole;
}

export function MustahikForm({ initialData, onSubmit, criteriaList, userRole }: MustahikFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [businessStatus, setBusinessStatus] = useState<string>(initialData?.businessStatus || 'stabil');

  // Determine permissions
  const canInputScores = userRole !== 'mustahik';

  // Initialize sub-criteria values
  const [subCriteriaValues, setSubCriteriaValues] = useState<SubCriteriaValues>(() => {
    if (initialData?.subCriteria) {
      return initialData.subCriteria;
    }
    const values: SubCriteriaValues = {};
    criteriaList.forEach(c => {
      c.aspects.forEach(aspect => {
        values[aspect.code] = 0;
      });
    });
    return values;
  });

  // Calculate total score for a criterion by summing its aspects
  const calculateCriteriaTotal = (criterionCode: string, currentSubCriteria: SubCriteriaValues): number => {
    const criterion = criteriaList.find(c => c.code === criterionCode);
    if (!criterion) return 0;

    return criterion.aspects.reduce((sum, aspect) => {
      return sum + (currentSubCriteria[aspect.code] || 0);
    }, 0);
  };

  // Computed criteria totals
  const [criteria, setCriteria] = useState<Record<string, number>>({});

  // Recalculate criteria totals when sub-criteria change
  useEffect(() => {
    const newCriteria: Record<string, number> = {};
    criteriaList.forEach(c => {
      newCriteria[c.code] = calculateCriteriaTotal(c.code, subCriteriaValues);
    });
    setCriteria(newCriteria);
  }, [subCriteriaValues, criteriaList]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !address.trim() || !phone.trim()) {
      alert('Nama, alamat, dan nomor telepon harus diisi!');
      return;
    }

    const mustahik: Mustahik = {
      id: initialData?.id || Date.now().toString(),
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim(),
      businessStatus: businessStatus as Mustahik['businessStatus'],
      criteria: { ...criteria },
      subCriteria: { ...subCriteriaValues },
      registeredDate: initialData?.registeredDate || new Date().toISOString(),
    };

    onSubmit(mustahik);
  };

  const handleSubCriteriaChange = (aspectCode: string, value: string) => {
    setSubCriteriaValues(prev => ({
      ...prev,
      [aspectCode]: parseInt(value) || 0,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Info */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-100">Data Pribadi</CardTitle>
          <CardDescription>Informasi dasar mustahik</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap *</Label>
            <Input
              id="name"
              placeholder="Masukkan nama lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Alamat Lengkap *</Label>
            <Input
              id="address"
              placeholder="Masukkan alamat lengkap"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Nomor Telepon *</Label>
            <Input
              id="phone"
              placeholder="Contoh: 081234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Criteria Assessment with Sub-criteria - Only for authorized roles */}
      {canInputScores && (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Penilaian Kriteria</CardTitle>
            <CardDescription>
              Pilih kondisi untuk setiap aspek penilaian. Total skor per kriteria akan dihitung otomatis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {criteriaList.map((criteriaData, index) => {
              const Icon = ICON_MAP[criteriaData.icon as keyof typeof ICON_MAP] || ICON_MAP.Circle;

              return (
                <div key={criteriaData.code}>
                  {index > 0 && <Separator className="mb-6" />}
                  <div className="space-y-4">
                    {/* Criterion Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`${criteriaData.color} p-2 rounded-lg`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <Label className="text-base font-semibold">
                            {criteriaData.code} - {criteriaData.name}
                          </Label>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Bobot: {(criteriaData.weight * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Sub-criteria / Aspects */}
                    <div className="grid gap-4 md:grid-cols-2 ml-11">
                      {criteriaData.aspects.map((aspect) => (
                        <div key={aspect.code} className="space-y-2">
                          <Label className="text-sm flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded text-xs font-mono">{aspect.code}</span>
                            {aspect.name}
                          </Label>
                          <Select
                            value={subCriteriaValues[aspect.code]?.toString() || '0'}
                            onValueChange={(value: string) => handleSubCriteriaChange(aspect.code, value)}
                          >
                            <SelectTrigger className="bg-white dark:bg-slate-800">
                              <SelectValue placeholder="Pilih kondisi" />
                            </SelectTrigger>
                            <SelectContent>
                              {aspect.options.map((opt, optIdx) => (
                                <SelectItem key={`${aspect.code}-${optIdx}`} value={opt.value.toString()}>
                                  <span className="flex items-center gap-2">
                                    {opt.label}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" size="lg" className="gap-2">
          <Save className="w-4 h-4" />
          {initialData ? 'Simpan Perubahan' : 'Tambah Mustahik'}
        </Button>
      </div>
    </form>
  );
}