import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { UserPlus, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import type { Candidate } from '../App';
import { CRITERIA_DATA } from './CriteriaInfo';

interface CandidateFormProps {
  onSubmit: (candidate: Candidate) => void;
}

export function CandidateForm({ onSubmit }: CandidateFormProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [criteria, setCriteria] = useState({
    C1: 0,
    C2: 0,
    C3: 0,
    C4: 0,
    C5: 0,
    C6: 0,
    C7: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !address.trim()) {
      alert('Nama dan alamat harus diisi!');
      return;
    }

    const candidate: Candidate = {
      id: Date.now().toString(),
      name: name.trim(),
      address: address.trim(),
      criteria: { ...criteria },
    };

    onSubmit(candidate);
    
    // Reset form
    setName('');
    setAddress('');
    setCriteria({
      C1: 0,
      C2: 0,
      C3: 0,
      C4: 0,
      C5: 0,
      C6: 0,
      C7: 0,
    });
  };

  const handleCriteriaChange = (criteriaCode: keyof typeof criteria, value: string) => {
    setCriteria(prev => ({
      ...prev,
      [criteriaCode]: parseFloat(value) || 0,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle>Data Pribadi</CardTitle>
          <CardDescription>Informasi dasar calon penerima</CardDescription>
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
        </CardContent>
      </Card>

      {/* Criteria Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>Penilaian Kriteria</CardTitle>
          <CardDescription>
            Masukkan nilai untuk setiap kriteria (range 0-30 tergantung kriteria)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {CRITERIA_DATA.map((criteriaData, index) => {
            const Icon = criteriaData.icon;
            const maxValue = Math.max(...criteriaData.subCriteria.map(s => s.value));
            
            return (
              <div key={criteriaData.code}>
                {index > 0 && <Separator className="mb-6" />}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`${criteriaData.color} p-2 rounded-lg mt-1`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Label className="text-base">
                            {criteriaData.code} - {criteriaData.name}
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                <p className="text-sm">{criteriaData.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Bobot: {(criteriaData.weight * 100).toFixed(0)}% | Max: {maxValue} poin
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Select
                    value={criteria[criteriaData.code as keyof typeof criteria].toString()}
                    onValueChange={(value) => handleCriteriaChange(criteriaData.code as keyof typeof criteria, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih nilai" />
                    </SelectTrigger>
                    <SelectContent>
                      {criteriaData.subCriteria.map((sub) => (
                        <SelectItem key={sub.value} value={sub.value.toString()}>
                          {sub.value} - {sub.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" size="lg" className="gap-2">
          <UserPlus className="w-4 h-4" />
          Tambah Calon Penerima
        </Button>
      </div>
    </form>
  );
}
