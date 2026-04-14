import React, { useState } from 'react';
import { performSensitivityAnalysis, SensitivityResult } from './sensitivityAnalysis';
import { Mustahik, Criterion } from '../types';
import { 
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell 
} from './ui/table';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

interface Props {
  candidates: Mustahik[];
  criteria: Criterion[];
}

/**
 * SensitivityAnalysisTester
 * 
 * A UI component designed to demonstrate the Sensitivity Analysis (SA) for the Zakat Moora system.
 * This is intended for use in thesis (skripsi) testing/evaluation.
 * It simulates scenarios by varying criteria weights one-at-a-time (OAT).
 */
export const SensitivityAnalysisTester: React.FC<Props> = ({ candidates, criteria }) => {
  const [results, setResults] = useState<SensitivityResult[] | null>(null);

  const handleRunAnalysis = () => {
    const saResult = performSensitivityAnalysis(candidates, criteria);
    setResults(saResult);
  };

  if (!candidates.length || !criteria.length) {
    return (
      <Card className="m-4">
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">Data candidates atau criteria belum tersedia untuk Sensitivity Analysis.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="m-4 shadow-xl border-t-4 border-indigo-500">
      <CardHeader>
        <CardTitle className="flex justify-between items-center text-2xl font-bold">
          <div>
            Sensitivity Analysis Report
            <span className="block text-sm font-normal text-muted-foreground mt-1">
              (Metode: One-at-a-Time (OAT) Step Analysis)
            </span>
          </div>
          <button 
            onClick={handleRunAnalysis}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all"
          >
            Run Sensitivity Analysis
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {!results && (
          <div className="py-12 border-2 border-dashed rounded-xl text-center">
            <p className="text-muted-foreground">Klik tombol di atas untuk memulai perhitungan analisis sensitivitas untuk laporan skripsi.</p>
          </div>
        )}

        {results && results.map((result) => (
          <div key={result.criterionCode} className="space-y-4 border-b pb-8">
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Variasi Bobot: <span className="text-indigo-600 font-mono">{result.criterionName} ({result.criterionCode})</span>
                {result.isSensitive ? (
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">SENSITIF (Rank Reversal)</span>
                ) : (
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">KOKOH (Stable)</span>
                )}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Bobot Dasar: {(result.baseWeight * 100).toFixed(1)}%</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-[300px] bg-white p-2 rounded-lg border shadow-sm">
                <h4 className="text-sm font-medium mb-2 text-center">Perubahan MOORA Score (Top-5)</h4>
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart data={result.scenarios}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="weight" 
                      label={{ value: 'Bobot Factor', position: 'insideBottom', offset: -5 }} 
                      type="number"
                      domain={[0, 1]}
                    />
                    <YAxis label={{ value: 'Score', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    {/* Unique lines for each candidate found in scenarios */}
                    {Array.from(new Set(result.scenarios.flatMap(s => s.rankings.map(r => r.name)))).map((name: string, i: number) => (
                      <Line 
                        key={name}
                        type="monotone" 
                        dataKey={(s: any) => s.rankings.find((r: any) => r.name === name)?.score || 0}
                        name={name}
                        stroke={`hsl(${(i * 137) % 360}, 70%, 50%)`}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Bobot (%)</TableHead>
                      <TableHead>Alternatif Terbaik</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.scenarios.map((scenario) => (
                      <TableRow key={scenario.weight} className={scenario.weight === 0.5 ? "bg-indigo-50/50" : ""}>
                        <TableCell className="font-mono">{(scenario.weight * 100).toFixed(0)}%</TableCell>
                        <TableCell className="font-medium">{scenario.topCandidateName}</TableCell>
                        <TableCell className="text-right">{scenario.topCandidateScore.toFixed(6)}</TableCell>
                        <TableCell>
                          {scenario.weight === 0.5 ? (
                            <span className="text-xs font-bold text-indigo-500">(Baseline)</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Scaled</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            {result.isSensitive && (
              <div className="bg-amber-50 border-l-4 border-amber-400 p-3 text-sm text-amber-800">
                <strong>Catatan Analisis:</strong> Kriteria ini bersifat sensitif. Mengubah bobot pada level ini dapat mengubah keputusan siapa yang menjadi calon mustahik terbaik.
              </div>
            )}
          </div>
        ))}

        <div className="bg-indigo-900 text-white p-6 rounded-xl space-y-2">
            <h3 className="text-xl font-bold">Analisis Kesimpulan untuk Skripsi</h3>
            <p className="text-indigo-100 opacity-80 text-sm">
                Berdasarkan pengujian sensitivitas di atas, anda dapat menyimpulkan kriteria mana yang memberikan kontribusi paling signifikan 
                terhadap perubahan keputusan pemilihan mustahik. Kriteria dengan label <strong>SENSITIF</strong> menunjukkan bahwa objektivitas 
                penilaian sangat bergantung pada bobot kriteria tersebut.
            </p>
        </div>
      </CardContent>
    </Card>
  );
};
