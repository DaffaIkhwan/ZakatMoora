import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, AlertTriangle, Crown, CheckCircle2, Trophy, Eye, AlertCircle, Phone, Bell, ExternalLink } from 'lucide-react';
import { useTheme } from './theme-provider';
import type { MonitoringData, RecipientHistory, AidProgram } from '../types';

interface DashboardModuleProps {
    monitoringData: MonitoringData[];
    recipientHistory: RecipientHistory[];
    aidPrograms: AidProgram[];
    onNavigate?: (tab: string) => void;
    onViewMonitoring?: (id: string) => void;
    onViewMustahikHistory?: (mustahikId: string) => void;
    userRole?: string;
}

const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
        return { value: (value / 1000000000).toLocaleString('id-ID', { maximumFractionDigits: 1 }), unit: 'M' };
    }
    if (value >= 1000000) {
        return { value: (value / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 }), unit: 'jt' };
    }
    if (value >= 1000) {
        return { value: (value / 1000).toLocaleString('id-ID', { maximumFractionDigits: 0 }), unit: 'rb' };
    }
    return { value: value.toString(), unit: '' };
};

export function DashboardModule({ monitoringData, recipientHistory, aidPrograms, onNavigate, onViewMonitoring, onViewMustahikHistory, userRole }: DashboardModuleProps) {
    const { theme } = useTheme();

    // Determine if dark mode is active
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Chart colors based on theme
    const chartColorStart = isDark ? '#0ea5e9' : '#0d6f4e';
    const chartColorEnd = isDark ? '#3b82f6' : '#0d6f4eb1';

    // Helper to safely access businessProgress and ensure type safety case-insensitively
    const getProgress = (m: MonitoringData) => {
        let progress: any = m.businessProgress || {};

        // Parse if string
        if (typeof progress === 'string') {
            try {
                progress = JSON.parse(progress);
            } catch {
                progress = {};
            }
        }

        // Normalize keys just in case (though TypeScript assumes standard keys)
        return {
            businessStatus: progress.businessStatus || '',
            revenue: Number(progress.revenue) || 0,
            businessType: progress.businessType || 'Lainnya',
            profit: Number(progress.profit) || 0,
        };
    };

    // Calculate statistics
    const totalRecipients = new Set(recipientHistory.map(r => r.mustahikId).filter(Boolean)).size;
    const totalFundDistributed = recipientHistory.reduce((sum, r) => sum + (r.amount || 0), 0);
    const totalMonitoring = monitoringData.length;
    const avgRevenueCount = monitoringData.length;
    const avgRevenue = avgRevenueCount > 0
        ? monitoringData.reduce((sum, m) => sum + getProgress(m).revenue, 0) / avgRevenueCount
        : 0;
    const avgProfit = avgRevenueCount > 0
        ? monitoringData.reduce((sum, m) => sum + getProgress(m).profit, 0) / avgRevenueCount
        : 0;

    // Business Status Distribution (Prepared for Radar Chart)
    const statusCounts = {
        naik: 0,
        stabil: 0,
        turun: 0
    };

    // Get latest monitoring data per mustahik to avoid duplicates in pie chart distribution
    const latestMonitoringData = Array.from(
        [...monitoringData]
            .sort((a, b) => {
                const timeDiff = new Date(b.monitoringDate).getTime() - new Date(a.monitoringDate).getTime();
                if (timeDiff !== 0) return timeDiff;
                return b.id.localeCompare(a.id);
            })
            .reduce((map, m) => {
                if (!map.has(m.mustahikId)) {
                    map.set(m.mustahikId, m);
                }
                return map;
            }, new Map<string, MonitoringData>())
            .values()
    );

    const getCalculatedEconomicStatus = (mustahikId: string) => {
        const history = monitoringData
            .filter(m => m.mustahikId === mustahikId)
            .sort((a, b) => {
                const timeDiff = new Date(a.monitoringDate).getTime() - new Date(b.monitoringDate).getTime();
                if (timeDiff !== 0) return timeDiff;
                return a.id.localeCompare(b.id);
            });
        
        if (history.length === 0) return 'stabil'; 
        
        const latest = history[history.length - 1];
        if (history.length === 1) {
             const status = getProgress(latest).businessStatus?.toLowerCase() || '';
             if (status === 'naik' || status === 'berkembang' || status === 'maju' || status === 'ekonomi membaik') return 'naik';
             if (status === 'turun' || status === 'menurun' || status === 'tutup' || status === 'memburuk') return 'turun';
             return 'stabil';
        }
        
        const current = history[history.length - 1];
        const prev = history[history.length - 2];
        
        const yt = current.businessProgress?.netIncome ?? current.businessProgress?.profit ?? 0;
        const yt_prev = prev.businessProgress?.netIncome ?? prev.businessProgress?.profit ?? 0;
        
        const ct = current.socialEconomicCondition?.monthlyExpenditure ?? 0;
        const ct_prev = prev.socialEconomicCondition?.monthlyExpenditure ?? 0;
        
        const gy = yt_prev > 0 ? ((yt - yt_prev) / yt_prev) * 100 : (yt > 0 ? 100 : 0);
        const gc = ct_prev > 0 ? ((ct - ct_prev) / ct_prev) * 100 : (ct > 0 ? 100 : 0);
        
        if (gy > gc) return 'naik';
        if (gy === gc) return 'stabil';
        return 'turun';
    };

    latestMonitoringData.forEach(m => {
        const status = getCalculatedEconomicStatus(m.mustahikId);
        if (status === 'naik') statusCounts.naik++;
        else if (status === 'stabil') statusCounts.stabil++;
        else statusCounts.turun++;
    });

    const businessStatusData = [
        { subject: 'Ekonomi Membaik', A: statusCounts.naik, fullMark: totalMonitoring, color: '#10b981' },
        { subject: 'Stagnan', A: statusCounts.stabil, fullMark: totalMonitoring, color: '#0ea5e9' },
        { subject: 'Memburuk', A: statusCounts.turun, fullMark: totalMonitoring, color: '#f43f5e' },
    ];

    // Average revenue by business type
    const revenueByBusinessType = monitoringData.reduce((acc, m) => {
        const progress = getProgress(m);
        const type = progress.businessType || 'Lainnya';
        if (!acc[type]) {
            acc[type] = { total: 0, count: 0 };
        }
        acc[type].total += progress.revenue;
        acc[type].count += 1;
        return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const businessTypeData = Object.entries(revenueByBusinessType).map(([type, data]) => ({
        type,
        avgRevenue: Math.round(data.total / data.count),
    })).sort((a, b) => b.avgRevenue - a.avgRevenue);

    // Monthly trend data (for mustahik view)
    const monthlyTrendData = monitoringData
        .map(m => ({
            date: new Date(m.monitoringDate),
            revenue: getProgress(m).revenue,
            profit: getProgress(m).profit,
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map(item => ({
            month: item.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            pendapatan: item.profit, // Mustahik sees Profit as "Pendapatan"
            omzet: item.revenue,
            keuntungan: item.profit,
        }));


    // Top Performers (Highest Revenue/Profit)
    const topPerformers = latestMonitoringData
        .filter(m => {
            const p = getProgress(m);
            const statusMatch = ['naik', 'berkembang', 'maju', 'stabil'].includes((p.businessStatus || '').toLowerCase());
            return (statusMatch && p.revenue > 0) || p.revenue >= 1000000; // Fallback to raw revenue if status missing
        })
        .sort((a, b) => getProgress(b).revenue - getProgress(a).revenue)
        .slice(0, 5);

    const getPendapatan = (data: MonitoringData) => {
        const bp = data.businessProgress || {} as any;
        // KONSISTEN dengan getCalculatedEconomicStatus: netIncome ?? profit
        return bp.netIncome ?? bp.profit ?? 0;
    };

    // Need Attention (Declining status or deficit)
    const needAttention = latestMonitoringData
        .filter(m => {
            const calculatedStatus = getCalculatedEconomicStatus(m.mustahikId);
            const sec = m.socialEconomicCondition as any || {};
            const isDeficit = (Number(sec.monthlyExpenditure) || 0) > getPendapatan(m);
            return calculatedStatus === 'turun' || isDeficit;
        })
        .sort((a, b) => getProgress(a).revenue - getProgress(b).revenue)
        .slice(0, 5);

    const hasData = monitoringData.length > 0;

    // ── Mustahik Alert: cek kondisi menurun dari monitoring terkini ──
    const latestMonitoring = monitoringData.length > 0
        ? [...monitoringData].sort((a, b) => new Date(b.monitoringDate).getTime() - new Date(a.monitoringDate).getTime())[0]
        : null;

    const mustahikAlert = (() => {
        if (!latestMonitoring || userRole !== 'mustahik') return { show: false };
        const bp = getProgress(latestMonitoring);
        const sec = latestMonitoring.socialEconomicCondition as any || {};
        const calculatedStatus = getCalculatedEconomicStatus(latestMonitoring.mustahikId);
        const isStatusDeclining = calculatedStatus === 'turun';
        
        const pendapatan = getPendapatan(latestMonitoring);
        const expenditure = Number(sec.monthlyExpenditure) || 0;
        const isDeficit = expenditure > pendapatan;
        const deficitAmount = isDeficit ? expenditure - pendapatan : 0;
        
        return { show: isStatusDeclining || isDeficit, isStatusDeclining, isDeficit, deficitAmount, bp, income: pendapatan, expenditure };
    })();

    return (
        <div className="space-y-4 pb-8">
            {/* ── Alert Mustahik: Pendapatan Menurun ── */}
            {userRole === 'mustahik' && mustahikAlert.show && (
                <div className="relative rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">


                    {/* ── Decorative blobs ── */}
                    <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.10) 0%, transparent 70%)', transform: 'translate(30%, -40%)' }} />
                    <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.07) 0%, transparent 70%)', transform: 'translate(-30%, 40%)' }} />

                    <div className="relative m-4 px-4 py-4">

                        {/* ── Top: Icon + Title + Badge ── */}
                        <div className="flex items-start justify-between mb-6">
                        <div className="flex items-start gap-5">

                                {/* Large pulsing icon */}
                                <div className="relative flex-shrink-0 w-16 h-16">
                                    <div className="absolute inset-0 rounded-full animate-ping"
                                        style={{ background: 'rgba(239,68,68,0.3)', animationDuration: '1.5s' }} />
                                    <div className="relative w-full h-full rounded-full flex items-center justify-center"
                                        style={{ background: 'rgba(239,68,68,0.2)', border: '2px solid rgba(239,68,68,0.5)' }}>
                                        <AlertTriangle className="w-8 h-8" style={{ color: '#f87171' }} />
                                    </div>
                                </div>

                                {/* Title block */}
                                <div className="pt-1 flex-1 min-w-0 pr-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-bold tracking-widest uppercase px-2.5 py-1 rounded-md"
                                            style={{ background: 'rgba(239,68,68,0.25)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)' }}>
                                            ⚠ Peringatan Sistem
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-extrabold leading-tight text-slate-900 dark:text-white">
                                        Kondisi Usaha Anda Membutuhkan Perhatian
                                    </h3>
                                    <p className="text-sm mt-1.5 text-slate-600 dark:text-slate-100">
                                        Ada parameter kritis pada laporan keuangan Anda bulan ini. Silakan baca penyebab utamanya dan langkah pemulihan di bawah ini agar usaha Anda dapat stabil kembali.
                                    </p>
                                </div>
                            </div>

                            {/* Badge */}
                            <div className="flex-shrink-0 mt-1">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold animate-pulse text-red-700 bg-red-100 border border-red-200 dark:text-red-400 dark:bg-red-900/30 dark:border-red-800">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                                    Perlu Tindakan
                                </span>
                            </div>
                        </div>

                        {/* ── Detail Cards ── */}
                        <div className="flex flex-col gap-4 mb-6">
                            {mustahikAlert.isStatusDeclining && (
                                <div className="rounded-xl p-4"
                                    style={{ background: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)', border: '1px solid rgba(239,68,68,0.4)' }}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{ background: 'rgba(239,68,68,0.25)' }}>
                                            <TrendingDown className="w-4 h-4" style={{ color: '#fca5a5' }} />
                                        </div>
                                        <p className="font-bold text-sm" style={{ color: '#fef2f2' }}>Laju Konsumsi Membengkak</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6 text-sm leading-relaxed" style={{ color: 'rgba(254,202,202,0.85)' }}>
                                        <div>
                                            <b style={{ color: '#f87171', display: 'block', marginBottom: '4px' }}>Penyebab:</b> 
                                            Laju atau persentase pengeluaran konsumsi Anda tumbuh lebih cepat dibandingkan laju keuntungan usaha Anda bulan ini.
                                        </div>
                                        <div className="border-l border-red-800/30 pl-6">
                                            <b style={{ color: '#fecdd3', display: 'block', marginBottom: '4px' }}>Tindakan:</b> 
                                            Segera kurangi pengeluaran rumah tangga Anda. Hindari pembelian barang yang tidak pokok. Buat batas pengeluaran harian, dan fokus putar kembali uang Anda menjadi modal usaha agar pendapatan bisa kembali naik.
                                        </div>
                                    </div>
                                </div>
                            )}
                            {mustahikAlert.isDeficit && (
                                <div className="rounded-xl p-4"
                                    style={{ background: 'linear-gradient(135deg, #4c0519 0%, #7f1d1d 100%)', border: '1px solid rgba(244,63,94,0.4)' }}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{ background: 'rgba(251,191,36,0.20)' }}>
                                            <AlertCircle className="w-4 h-4" style={{ color: '#fde68a' }} />
                                        </div>
                                        <p className="font-bold text-sm" style={{ color: '#fff1f2' }}>Defisit Finansial</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6 text-sm leading-relaxed" style={{ color: 'rgba(253,164,175,0.85)' }}>
                                        <div>
                                            <b style={{ color: '#fca5a5', display: 'block', marginBottom: '4px' }}>Penyebab:</b> 
                                            Total pengeluaran Anda (Rp {Number(mustahikAlert.expenditure).toLocaleString('id-ID')}) melebihi Pemasukan Bersih yang Anda raih (Rp {Number(mustahikAlert.income).toLocaleString('id-ID')}). Anda berstatus defisit Rp {Number(mustahikAlert.deficitAmount).toLocaleString('id-ID')} bulan ini.
                                        </div>
                                        <div className="border-l border-rose-800/30 pl-6">
                                            <b style={{ color: '#fde68a', display: 'block', marginBottom: '4px' }}>Tindakan:</b> 
                                            Kondisi keuangan darurat! Anda terpaksa memakai uang modal atau berutang. Segera coba naikkan harga jual produk Anda, kurangi biaya jualan, atau hubungi Amil LAZ pendamping Anda untuk konsultasi.
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── CTA Section ── */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    Segera laporkan ke{' '}
                                    <span className="font-extrabold text-rose-600 dark:text-rose-400">
                                        Lembaga Amil Zakat (LAZ)
                                    </span>
                                </p>
                                <p className="text-xs mt-1 text-slate-600 dark:text-slate-100">
                                    Tim LAZ akan memberikan pendampingan untuk membantu perkembangan usaha Anda.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                                <a
                                    href="https://wa.me/6281234567890?text=Assalamu'alaikum, saya mustahik penerima bantuan dan ingin melaporkan kondisi usaha saya yang sedang menurun. Mohon bantuan dan pendampingan dari LAZ."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.03] active:scale-95"
                                    style={{ background: 'linear-gradient(135deg, #e11d48, #f43f5e)', color: '#fff', boxShadow: '0 4px 20px rgba(244,63,94,0.45)' }}
                                >
                                   
                                </a>
                                <button
                                    onClick={() => window.open('mailto:laz@zakat.com?subject=Laporan Kondisi Usaha Menurun&body=Assalamu%27alaikum%2C%20saya%20mustahik%20penerima%20bantuan%20dan%20ingin%20melaporkan%20kondisi%20usaha%20saya%20yang%20sedang%20menurun.%20Mohon%20bantuan%20dan%20pendampingan.', '_blank')}
                                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.03] active:scale-95 text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50"
                                    style={{ border: '1px solid rgba(244,63,94,0.4)' }}
                                >
                                   
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* Metrics Row */}
            <div className={`grid gap-3 ${userRole === 'mustahik' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'}`}>
                {userRole !== 'mustahik' && (
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                            <CardTitle className="text-xs font-medium text-slate-500">Total Penerima</CardTitle>
                            <Users className="h-3 w-3 text-emerald-600" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-xl font-bold text-slate-900 dark:text-white">{totalRecipients}</div>
                            <p className="text-[10px] text-slate-500 mt-1">
                                Dari <span className="font-medium text-emerald-600">{recipientHistory.length}</span> distribusi
                            </p>
                        </CardContent>
                    </Card>
                )}

                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                        <CardTitle className="text-xs font-medium text-slate-500">
                            {userRole === 'mustahik' ? 'Total Dana Diterima' : 'Dana Tersalur'}
                        </CardTitle>
                        <DollarSign className="h-3 w-3 text-blue-600" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-xl font-bold text-slate-900 dark:text-white">
                            Rp {Math.round(totalFundDistributed / 1000000)}<span className="text-sm font-semibold text-slate-400">jt</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                            {userRole === 'mustahik' ? 'Total bantuan' : <span>Dari <span className="font-medium text-blue-600">{aidPrograms.length}</span> program</span>}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                        <CardTitle className="text-xs font-medium text-slate-500">
                            {userRole === 'mustahik' ? 'Laporan Saya' : 'Total Monitoring'}
                        </CardTitle>
                        <Activity className="h-3 w-3 text-violet-600" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-xl font-bold text-slate-900 dark:text-white">{totalMonitoring}</div>
                        <p className="text-[10px] text-slate-500 mt-1">
                            Data terkumpul
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                        <CardTitle className="text-xs font-medium text-slate-500">
                            {userRole === 'mustahik' ? 'Rata-rata Pendapatan' : 'Rata-rata Omzet'}
                        </CardTitle>
                        <TrendingUp className="h-3 w-3 text-amber-600" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-xl font-bold text-slate-900 dark:text-white">
                            Rp {formatCurrency(userRole === 'mustahik' ? avgProfit : avgRevenue).value}<span className="text-sm font-semibold text-slate-400">{formatCurrency(userRole === 'mustahik' ? avgProfit : avgRevenue).unit}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                            Per bulan
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className={`grid grid-cols-1 ${userRole === 'mustahik' ? '' : 'md:grid-cols-2'} gap-3`}>
                {/* Status Usaha Chart - Hide for Mustahik */}
                {userRole !== 'mustahik' && (
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative z-0">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">Status Mustahik</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="w-full h-[250px] relative z-0">
                                {!hasData ? (
                                    <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                                        Belum ada data monitoring
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                                        <PieChart>
                                            <Pie
                                                data={businessStatusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="A"
                                                nameKey="subject"
                                                isAnimationActive={false}
                                            >
                                                {businessStatusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#f8fafc', fontSize: '12px' }}
                                                itemStyle={{ color: '#f8fafc' }}
                                            />
                                            <Legend
                                                verticalAlign="bottom"
                                                height={36}
                                                iconType="circle"
                                                iconSize={8}
                                                formatter={(value) => <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">{value}</span>}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Omzet Chart - Monthly trend for Mustahik, Business type for others */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative z-0">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {userRole === 'mustahik' ? 'Tren Pendapatan Bulanan' : 'Omzet per Jenis Usaha'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="w-full h-[250px] relative z-0">
                            {!hasData ? (
                                <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                                    Belum ada data pendapatan
                                </div>
                            ) : userRole === 'mustahik' ? (
                                /* Styled Area Chart for Mustahik - matching MonitoringModule design */
                                <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                                    <AreaChart
                                        data={monthlyTrendData.length > 0 ? monthlyTrendData : [
                                            { month: 'Jan 26', pendapatan: 0, keuntungan: 0 },
                                            { month: 'Feb 26', pendapatan: avgRevenue, keuntungan: avgRevenue * 0.3 }
                                        ]}
                                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.3} />
                                        <XAxis
                                            dataKey="month"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 10 }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 10 }}
                                            tickFormatter={(value) => value >= 1000000 ? `${(value / 1000000).toFixed(0)}jt` : `${(value / 1000).toFixed(0)}rb`}
                                            domain={[0, 'dataMax + 1000000']}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#f8fafc', fontSize: '12px' }}
                                            formatter={(value: number) => {
                                                const formatted = formatCurrency(value);
                                                return [`Rp ${formatted.value} ${formatted.unit}`, 'Pendapatan'];
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="pendapatan"
                                            stroke="#0ea5e9"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorProfit)"
                                            dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6, fill: '#0ea5e9' }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                /* Bar Chart for Admin/others */
                                <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                                    <BarChart data={businessTypeData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="5%" stopColor={chartColorStart} stopOpacity={0.8} />
                                                <stop offset="95%" stopColor={chartColorEnd} stopOpacity={0.8} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" strokeOpacity={0.1} />
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="type"
                                            type="category"
                                            width={100}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#f8fafc', fontSize: '12px' }}
                                            itemStyle={{ color: '#f8fafc' }}
                                            formatter={(value: number) => {
                                                const formatted = formatCurrency(value);
                                                return [`Rp ${formatted.value} ${formatted.unit}`, 'Rata-rata Omzet'];
                                            }}
                                        />
                                        <Bar dataKey="avgRevenue" fill="url(#colorRevenue)" radius={[0, 4, 4, 0]} barSize={24} isAnimationActive={false}>
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Lists Row - Hide for Mustahik */}
            {userRole !== 'mustahik' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <CardHeader className="p-3 bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-900/10 flex flex-row items-center justify-between space-y-0">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-amber-500" />
                                <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                    Mustahik Berprestasi
                                </CardTitle>
                            </div>
                            <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 text-[10px] h-5 px-1.5">Top 5</Badge>
                        </CardHeader>
                        <CardContent className="p-0">
                            {topPerformers.length === 0 ? (
                                <div className="p-4 text-center text-slate-400 dark:text-slate-500 text-xs">
                                    Belum ada data prestasi
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {topPerformers.map((data, index) => {
                                        // Define rank styles with inline colors
                                        const rankColors = [
                                            '#f59e0b', // amber-500 - rank 1
                                            '#94a3b8', // slate-400 - rank 2
                                            '#f97316', // orange-500 - rank 3
                                            '#1e293b', // slate-800 - rank 4
                                            '#1e293b', // slate-800 - rank 5
                                        ];

                                        const bgColor = rankColors[index] || '#475569'; // slate-600 fallback

                                        const style = {
                                            ring: index < 3 ? 'ring-2 ring-offset-1' : ''
                                        };

                                        return (
                                            <div
                                                key={data.id}
                                                className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all hover:pl-4 group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {/* Rank Badge */}
                                                    <div
                                                        className={`relative flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white ${style.ring} shadow-md`}
                                                        style={{ backgroundColor: bgColor }}
                                                    >
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                            {data.mustahikName}
                                                        </div>
                                                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                                                            {getProgress(data).businessType}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                            Rp {formatCurrency(getProgress(data).revenue).value}{formatCurrency(getProgress(data).revenue).unit}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-6 w-6 hover:bg-slate-200 dark:hover:bg-slate-700"
                                                        onClick={(e: React.MouseEvent) => {
                                                            e.stopPropagation();
                                                            onViewMonitoring?.(data.id);
                                                        }}
                                                    >
                                                        <Eye className="w-3 h-3 text-slate-500 hover:text-blue-600" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-slate-900 border-red-300 dark:border-red-900 shadow-sm overflow-hidden border">
                        <CardHeader className="p-3 border-b border-red-200 dark:border-red-900/80 bg-gradient-to-r from-red-100 to-transparent dark:from-red-950/80 flex flex-row items-center justify-between space-y-0">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500" />
                                <CardTitle className="text-sm font-bold text-red-900 dark:text-red-100">
                                    Perlu Perhatian
                                </CardTitle>
                            </div>
                            <Badge className="bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700 animate-pulse text-[10px] uppercase font-bold tracking-wider h-5 px-3 rounded-full border-none shadow-sm shadow-red-500/30">
                                Perlu Perhatian
                            </Badge>
                        </CardHeader>
                        <CardContent className="p-0">
                            {needAttention.length === 0 ? (
                                <div className="p-4 text-center text-slate-400 dark:text-slate-500 text-xs flex flex-col items-center gap-2">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-20" />
                                    <span>Alhamdulillah, semua usaha mustahik berjalan lancar.</span>
                                    <span className="text-[10px] text-slate-400">Tidak ada indikator penurunan atau defisit saat ini.</span>
                                </div>
                            ) : (
                                <div className="divide-y divide-red-100 dark:divide-red-900/40">
                                    {needAttention.map((data) => {
                                        const calculatedStatus = getCalculatedEconomicStatus(data.mustahikId);
                                        const sec = data.socialEconomicCondition as any || {};
                                        const isDeficit = (Number(sec.monthlyExpenditure) || 0) > getPendapatan(data);
                                        let reasonLabel = '';
                                        const history = monitoringData
                                            .filter(m => m.mustahikId === data.mustahikId)
                                            .sort((a, b) => {
                                                const timeDiff = new Date(a.monitoringDate).getTime() - new Date(b.monitoringDate).getTime();
                                                if (timeDiff !== 0) return timeDiff;
                                                return a.id.localeCompare(b.id);
                                            });

                                        if (history.length >= 2) {
                                            const current = history[history.length - 1];
                                            const prev = history[history.length - 2];
                                            
                                            const yt = getPendapatan(current);
                                            const yt_prev = getPendapatan(prev);
                                            const ct = Number(current.socialEconomicCondition?.monthlyExpenditure) || 0;
                                            const ct_prev = Number(prev.socialEconomicCondition?.monthlyExpenditure) || 0;
                                            
                                            const gy = yt_prev > 0 ? ((yt - yt_prev) / yt_prev) * 100 : (yt > 0 ? 100 : 0);
                                            const gc = ct_prev > 0 ? ((ct - ct_prev) / ct_prev) * 100 : (ct > 0 ? 100 : 0);
                                            
                                            // Tipologi Defisit DIC (mutually exclusive, ordered by severity):
                                            // 1. Double Shock: Pendapatan TURUN dan Konsumsi NAIK (paling parah)
                                            // 2. Lifestyle Deficit: Pendapatan naik tapi konsumsi naik LEBIH CEPAT (gc > gy, keduanya positif)
                                            // 3. Operasional: Pendapatan TURUN, konsumsi turun/stagnan (bisnis lesu)
                                            // 4. Insidental: Pendapatan naik/stagnan, konsumsi turun/stagnan, tapi masih defisit absolut
                                            if (gy < 0 && gc > 0) {
                                                // Pendapatan turun DAN konsumsi naik = Double Shock
                                                reasonLabel = 'Musibah Ganda (Double Shock)';
                                            } else if (gy >= 0 && gc > 0 && gc > gy) {
                                                // Konsumsi naik lebih cepat dari pendapatan (keduanya >= 0)
                                                reasonLabel = 'Gaya Hidup Boros (Lifestyle Deficit)';
                                            } else if (gy < 0 && gc <= 0) {
                                                // Pendapatan turun, konsumsi turun/stagnan = bisnis lesu
                                                reasonLabel = 'Usaha Sedang Sepi (Masalah Operasional)';
                                            } else if (isDeficit) {
                                                // Pendapatan naik/stagnan, tapi masih defisit absolut = kejadian insidental
                                                reasonLabel = 'Kebutuhan Darurat (Insidental)';
                                            } else {
                                                reasonLabel = 'Defisit / Penurunan Terdeteksi';
                                            }
                                        } else {
                                            if (calculatedStatus === 'turun') reasonLabel = 'Terdeteksi Penurunan';
                                            else if (isDeficit) reasonLabel = 'Status Defisit Aktif';
                                        }

                                        return (
                                        <div
                                            key={data.id}
                                            className="flex items-center justify-between p-3 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all hover:pl-4 hover:pr-2 group cursor-pointer border-l-[3px] border-transparent hover:border-red-500 hover:shadow-sm"
                                            onClick={() => onViewMustahikHistory ? onViewMustahikHistory(data.mustahikId) : onViewMonitoring?.(data.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-red-500/10 dark:bg-red-500/20 rounded-full text-red-600 dark:text-red-400 group-hover:bg-red-500 group-hover:text-white transition-all border border-red-500/20 dark:border-red-500/30 shadow-sm shadow-red-500/10">
                                                    <TrendingDown className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 group-hover:underline decoration-red-500/50 underline-offset-4 transition-all w-fit">{data.mustahikName}</div>
                                                    <div className="text-[10px] text-red-600 dark:text-red-400 font-bold mt-0.5 tracking-wide">
                                                        {reasonLabel}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <Badge variant="outline" className="bg-transparent border-red-500/40 text-red-600 dark:text-red-400 dark:border-red-500/50 text-[10px] px-2 h-5 font-semibold shadow-none group-hover:border-red-500 transition-colors">
                                                        Perlu Tindakan
                                                    </Badge>
                                                </div>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-7 w-7 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 flex-shrink-0"
                                                    onClick={(e: React.MouseEvent) => {
                                                        e.stopPropagation();
                                                        if (onViewMustahikHistory) {
                                                            onViewMustahikHistory(data.mustahikId);
                                                        } else {
                                                            onViewMonitoring?.(data.id);
                                                        }
                                                    }}
                                                >
                                                    <Eye className="w-3.5 h-3.5 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300" />
                                                </Button>
                                            </div>
                                        </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}