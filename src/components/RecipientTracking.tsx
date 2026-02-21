import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { Search, AlertCircle, TrendingUp, DollarSign, Users, Calendar } from 'lucide-react';
import { PaginationControls } from './ui/pagination-controls';
import type { RecipientHistory, Mustahik, AidProgram } from '../types';

interface RecipientTrackingProps {
  recipientHistory: RecipientHistory[];
  mustahikList: Mustahik[];
  aidPrograms: AidProgram[];
}

export function RecipientTracking({ recipientHistory, mustahikList, aidPrograms }: RecipientTrackingProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [summaryPage, setSummaryPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const itemsPerPage = 10;

  const filteredHistory = recipientHistory.filter(h =>
    h.mustahikName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.programName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = useMemo(() => {
    const totalRecipients = new Set(recipientHistory.map(h => h.mustahikId).filter(Boolean)).size;
    const totalDistributed = recipientHistory.reduce((sum, h) => sum + (h.amount || 0), 0);
    const totalPrograms = new Set(recipientHistory.map(h => h.programId).filter(Boolean)).size;

    return {
      totalRecipients,
      totalDistributed,
      totalPrograms,
      totalTransactions: recipientHistory.length,
    };
  }, [recipientHistory]);

  // Group history by mustahik
  const recipientSummary = useMemo(() => {
    const summary = new Map<string, {
      mustahik: Mustahik | undefined;
      count: number;
      totalAmount: number;
      programs: string[];
      lastReceived: string;
    }>();

    recipientHistory.forEach(h => {
      const existing = summary.get(h.mustahikId);
      const mustahik = mustahikList.find(m => m.id === h.mustahikId);

      if (existing) {
        existing.count++;
        existing.totalAmount += h.amount;
        if (!existing.programs.includes(h.programName)) {
          existing.programs.push(h.programName);
        }
        if (new Date(h.receivedDate) > new Date(existing.lastReceived)) {
          existing.lastReceived = h.receivedDate;
        }
      } else {
        summary.set(h.mustahikId, {
          mustahik,
          count: 1,
          totalAmount: h.amount,
          programs: [h.programName],
          lastReceived: h.receivedDate,
        });
      }
    });

    return Array.from(summary.values()).sort((a, b) => b.count - a.count);
  }, [recipientHistory, mustahikList]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Tracking Penerima</h2>
          <p className="text-slate-500">
            Riwayat dan monitoring penerima zakat produktif
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Cari penerima atau program..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 bg-white border-slate-200 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Penerima</CardTitle>
            <Users className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalRecipients}</div>
            <p className="text-xs text-slate-500 mt-1">Mustahik unik</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Disalurkan</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              Rp {(stats.totalDistributed / 1000000).toFixed(1)}<span className="text-sm font-normal text-slate-400">M</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Rp {stats.totalDistributed.toLocaleString('id-ID')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Transaksi</CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalTransactions}</div>
            <p className="text-xs text-slate-500 mt-1">Kali penyaluran</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Program Aktif</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalPrograms}</div>
            <p className="text-xs text-slate-500 mt-1">Program berbeda</p>
          </CardContent>
        </Card>
      </div>

      {/* Recipient Summary */}
      {recipientSummary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Per Penerima</CardTitle>
            <CardDescription>
              Rangkuman penerimaan zakat per mustahik
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Alamat</TableHead>
                    <TableHead className="text-center">Frekuensi</TableHead>
                    <TableHead className="text-center">Total Diterima</TableHead>
                    <TableHead className="text-center">Terakhir Terima</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipientSummary
                    .slice((summaryPage - 1) * itemsPerPage, summaryPage * itemsPerPage)
                    .map((summary, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{summary.mustahik?.name || 'N/A'}</TableCell>
                        <TableCell className="text-gray-600">
                          {summary.mustahik?.address || 'N/A'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{summary.count}x</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          Rp {summary.totalAmount.toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {new Date(summary.lastReceived).toLocaleDateString('id-ID')}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
            {recipientSummary.length > itemsPerPage && (
              <div className="mt-4">
                <PaginationControls
                  currentPage={summaryPage}
                  totalPages={Math.ceil(recipientSummary.length / itemsPerPage)}
                  onPageChange={setSummaryPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* History Table */}
      {filteredHistory.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {recipientHistory.length === 0
              ? 'Belum ada riwayat penerima. Tetapkan penerima dari program bantuan untuk mencatat riwayat.'
              : 'Tidak ada riwayat yang sesuai dengan pencarian.'}
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Penyaluran</CardTitle>
            <CardDescription>
              Detail lengkap penyaluran zakat per transaksi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Penerima</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead className="text-center">Jumlah</TableHead>
                    <TableHead className="text-center">Rank</TableHead>
                    <TableHead className="text-center">Skor MOORA</TableHead>
                    <TableHead>Catatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory
                    .sort((a, b) => new Date(b.receivedDate || 0).getTime() - new Date(a.receivedDate || 0).getTime())
                    .slice((historyPage - 1) * itemsPerPage, historyPage * itemsPerPage)
                    .map((history) => (
                      <TableRow key={history.id}>
                        <TableCell className="text-sm">
                          {history.receivedDate ? new Date(history.receivedDate).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          }) : '-'}
                        </TableCell>
                        <TableCell>{history.mustahikName || 'Unknown'}</TableCell>
                        <TableCell className="text-gray-600">{history.programName || 'Unknown'}</TableCell>
                        <TableCell className="text-center">
                          Rp {(history.amount || 0).toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={(history.rank || 0) <= 3 ? 'default' : 'outline'}>
                            #{history.rank || '?'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="tabular-nums">
                            {(history.mooraScore || 0).toFixed(4)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {history.notes || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
            {filteredHistory.length > itemsPerPage && (
              <div className="mt-4">
                <PaginationControls
                  currentPage={historyPage}
                  totalPages={Math.ceil(filteredHistory.length / itemsPerPage)}
                  onPageChange={setHistoryPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
