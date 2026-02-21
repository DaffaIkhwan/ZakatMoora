import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Trophy, Users, TrendingUp, BarChart3, AlertCircle, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { Mustahik, RecipientHistory } from '../types';
import { calculateMOORA } from './mooraCalculations';
import { Criterion } from '../types';
import { ICON_MAP } from './CriteriaInfo';

interface DashboardProps {
  candidates: Mustahik[];
  criteriaList: Criterion[];
  recipientHistory?: RecipientHistory[];
}

export function Dashboard({ candidates, criteriaList, recipientHistory = [] }: DashboardProps) {
  const [top3Filter, setTop3Filter] = useState<string>('all');

  const results = useMemo(() => {
    return calculateMOORA(candidates, criteriaList);
  }, [candidates, criteriaList]);

  // Filter Top 3 based on selection
  const filteredTop3 = useMemo(() => {
    if (top3Filter === 'never_received') {
      // Get mustahik IDs who have received aid
      const receivedIds = new Set(recipientHistory.map(h => h.mustahikId));
      // Filter results to only those who never received
      return results.filter(r => !receivedIds.has(r.id)).slice(0, 3);
    }
    return results.slice(0, 3);
  }, [results, top3Filter, recipientHistory]);

  const stats = useMemo(() => {
    if (candidates.length === 0) return null;

    // Calculate average scores for each criterion
    const criteriaAverages = criteriaList.map(criteria => {
      const sum = candidates.reduce((acc, c) => {
        // Try direct criteria score first
        let val = c.criteria?.[criteria.code] || 0;

        // If no direct score, calculate from sub-criteria (aspects)
        if (val === 0 && c.subCriteria && criteria.aspects?.length > 0) {
          val = criteria.aspects.reduce((s, aspect) => {
            return s + (c.subCriteria?.[aspect.code] || 0);
          }, 0);
        }

        return acc + val;
      }, 0);

      return {
        ...criteria,
        average: sum / candidates.length,
      };
    });

    // Get score distribution
    const highPriority = results.filter(r => r.rank <= 3).length;
    const mediumPriority = results.filter(r => r.rank > 3 && r.rank <= Math.ceil(results.length / 2)).length;
    const lowPriority = results.length - highPriority - mediumPriority;

    return {
      criteriaAverages,
      highPriority,
      mediumPriority,
      lowPriority,
      topScore: results[0]?.mooraScore || 0,
      avgScore: results.reduce((sum, r) => sum + r.mooraScore, 0) / results.length,
    };
  }, [candidates, results, criteriaList]);

  if (candidates.length === 0) {
    return (
      <div className="space-y-4">
        <Alert className="bg-slate-50 border-slate-200">
          <AlertCircle className="h-4 w-4 text-slate-500" />
          <AlertDescription className="text-slate-600 text-sm">
            Dashboard akan menampilkan statistik setelah Anda menambahkan data calon penerima.
          </AlertDescription>
        </Alert>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-slate-50 border-slate-100 shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-4 h-4 rounded bg-slate-200" />
                  <div className="h-4 w-24 rounded bg-slate-200" />
                </div>
                <div className="h-8 w-12 rounded bg-slate-200 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-1 p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Users className="w-3 h-3 text-blue-600" />
              <CardDescription className="text-slate-500 font-medium text-xs">Total Calon</CardDescription>
            </div>
            <CardTitle className="text-xl font-bold text-slate-900">{candidates.length}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-1 p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Trophy className="w-3 h-3 text-amber-600" />
              <CardDescription className="text-slate-500 font-medium text-xs">Prioritas Tinggi</CardDescription>
            </div>
            <CardTitle className="text-xl font-bold text-slate-900">{stats?.highPriority || 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-1 p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <CardDescription className="text-slate-500 font-medium text-xs">Skor Tertinggi</CardDescription>
            </div>
            <CardTitle className="text-xl font-bold text-slate-900">
              {stats?.topScore.toFixed(3) || '-'}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-1 p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <BarChart3 className="w-3 h-3 text-violet-600" />
              <CardDescription className="text-slate-500 font-medium text-xs">Rata-rata Skor</CardDescription>
            </div>
            <CardTitle className="text-xl font-bold text-slate-900">
              {stats?.avgScore.toFixed(3) || '-'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {/* Distribution */}
        <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700/50 shadow-xl overflow-hidden relative">
          {/* Background decorations */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />

          <CardHeader className="p-4 pb-3 relative z-10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg shadow-lg shadow-violet-500/20">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <CardTitle className="text-sm font-bold text-white">Distribusi Prioritas</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-4 pt-2 relative z-10">
            {/* High Priority */}
            <div className="group p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#f59e0b' }}>
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-400">Prioritas Tinggi</p>
                    <p className="text-[10px] text-slate-400">Peringkat 1-3</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-amber-400">{stats?.highPriority || 0}</p>
                  <p className="text-[10px] text-slate-400">mustahik</p>
                </div>
              </div>
            </div>

            {/* Medium Priority */}
            <div className="group p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#3b82f6' }}>
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-400">Prioritas Menengah</p>
                    <p className="text-[10px] text-slate-400">Peringkat 4+</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-blue-400">{stats?.mediumPriority || 0}</p>
                  <p className="text-[10px] text-slate-400">mustahik</p>
                </div>
              </div>
            </div>

            {/* Low Priority */}
            <div className="group p-3 rounded-xl bg-gradient-to-r from-slate-500/10 to-gray-500/5 border border-slate-500/20 hover:border-slate-500/40 transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#64748b' }}>
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-300">Prioritas Rendah</p>
                    <p className="text-[10px] text-slate-400">Peringkat lainnya</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-300">{stats?.lowPriority || 0}</p>
                  <p className="text-[10px] text-slate-400">mustahik</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top 3 Candidates */}
        <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700/50 shadow-xl overflow-hidden relative">
          {/* Background decorations */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />

          <CardHeader className="p-4 pb-3 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-lg shadow-amber-500/20">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <CardTitle className="text-sm font-bold text-white">Top 3 Prioritas</CardTitle>
              </div>
              <Select value={top3Filter} onValueChange={setTop3Filter}>
                <SelectTrigger className="w-[140px] h-7 text-xs bg-slate-800/50 border-slate-600 text-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="never_received">Belum Dapat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-4 pt-2 relative z-10">
            {filteredTop3.length === 0 ? (
              <div className="text-center py-4 text-slate-400 text-xs">
                Tidak ada data yang sesuai filter
              </div>
            ) : filteredTop3.map((result, index) => {
              const rankStyles = [
                { gradient: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-500/30', text: 'text-amber-400', bg: 'from-amber-500/10 to-orange-500/5', border: 'border-amber-500/20 hover:border-amber-500/40' },
                { gradient: 'from-slate-300 to-slate-400', shadow: 'shadow-slate-400/30', text: 'text-slate-300', bg: 'from-slate-500/10 to-gray-500/5', border: 'border-slate-500/20 hover:border-slate-500/40' },
                { gradient: 'from-orange-400 to-amber-600', shadow: 'shadow-orange-500/30', text: 'text-orange-400', bg: 'from-orange-500/10 to-amber-500/5', border: 'border-orange-500/20 hover:border-orange-500/40' }
              ];
              const rankColors = ['#f59e0b', '#94a3b8', '#f97316'];
              const bgColor = rankColors[index] || '#f97316';
              const style = rankStyles[index] || rankStyles[2];

              return (
                <div key={result.id} className={`group p-3 rounded-xl bg-gradient-to-r ${style.bg} border ${style.border} transition-all duration-300 hover:scale-[1.02]`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg font-bold text-white text-sm"
                        style={{ backgroundColor: bgColor }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${style.text}`}>{result.name}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{result.address}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold font-mono ${style.text}`}>{result.mooraScore.toFixed(3)}</p>
                      <p className="text-[10px] text-slate-400">skor MOORA</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}