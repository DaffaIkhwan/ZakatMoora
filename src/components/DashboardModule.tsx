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

export function DashboardModule({ monitoringData, recipientHistory, aidPrograms, onNavigate, onViewMonitoring, userRole }: DashboardModuleProps) {
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

    monitoringData.forEach(m => {
        const status = getProgress(m).businessStatus.toLowerCase();
        if (status === 'naik' || status === 'berkembang' || status === 'maju') statusCounts.naik++;
        else if (status === 'stabil' || status === 'rintisan' || status === 'belum_usaha') statusCounts.stabil++;
        else if (status === 'turun' || status === 'menurun' || status === 'tutup') statusCounts.turun++;
    });

    const businessStatusData = [
        { subject: 'Naik', A: statusCounts.naik, fullMark: totalMonitoring, color: '#059669' },
        { subject: 'Stabil', A: statusCounts.stabil, fullMark: totalMonitoring, color: '#0ea5e9' },
        { subject: 'Turun', A: statusCounts.turun, fullMark: totalMonitoring, color: '#f59e0b' },
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

    // Top Performers
    const topPerformers = monitoringData
        .filter(m => ['naik', 'berkembang', 'maju', 'stabil'].includes(getProgress(m).businessStatus.toLowerCase()))
        .sort((a, b) => getProgress(b).revenue - getProgress(a).revenue)
        .slice(0, 5);

    // Need Attention
    const needAttention = monitoringData
        .filter(m => {
            const p = getProgress(m);
            return ['turun', 'menurun', 'tutup'].includes(p.businessStatus.toLowerCase()) ||
                (m.socialEconomicCondition?.monthlyIncome || 0) < (m.socialEconomicCondition?.monthlyExpenditure || 0);
        })
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
        const isStatusDeclining = ['turun', 'menurun', 'tutup'].includes((bp.businessStatus || '').toLowerCase());
        const income = Number(sec.monthlyIncome) || 0;
        const expenditure = Number(sec.monthlyExpenditure) || 0;
        const isDeficit = income > 0 && expenditure > income;
        const deficitAmount = isDeficit ? expenditure - income : 0;
        return { show: isStatusDeclining || isDeficit, isStatusDeclining, isDeficit, deficitAmount, bp, income, expenditure };
    })();

    return (
        <div className="space-y-4 pb-8">
            {/* ── Alert Mustahik: Pendapatan Menurun ── */}
            {userRole === 'mustahik' && mustahikAlert.show && (
                <div className="relative rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">


                    {/* ── Decorative blobs ── */}
                    <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.10) 0%, transparent 70%)', transform: 'translate(30%, -40%)' }} />
                    <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.07) 0%, transparent 70%)', transform: 'translate(-30%, 40%)' }} />

                    <div className="relative m-4 px-4 py-4">

                        {/* ── Top: Icon + Title + Badge ── */}
                        <div className="flex items-start justify-between gap-6 mb-6">
                            <div className="flex items-start gap-10">

                                {/* Large pulsing icon */}
                                <div className="relative flex-shrink-0">
                                    <div className="absolute inset-0 rounded-full animate-ping"
                                        style={{ background: 'rgba(244,63,94,0.3)', animationDuration: '1.5s' }} />
                                    <div className="relative w-16 h-16 rounded-full flex items-center justify-center"
                                        style={{ background: 'rgba(244,63,94,0.2)', border: '2px solid rgba(244,63,94,0.5)' }}>
                                        <AlertTriangle className="w-8 h-8" style={{ color: '#fca5a5' }} />
                                    </div>
                                </div>

                                {/* Title block */}
                                <div className="pt-1 ml-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-bold tracking-widest uppercase px-2.5 py-1 rounded-md"
                                            style={{ background: 'rgba(244,63,94,0.25)', color: '#fca5a5', border: '1px solid rgba(244,63,94,0.4)' }}>
                                            ⚠ Peringatan Sistem
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-extrabold leading-tight text-slate-900 dark:text-white">
                                        Kondisi Usaha Anda Membutuhkan Perhatian
                                    </h3>
                                    <p className="text-sm mt-1.5 text-slate-600 dark:text-slate-100">
                                        Sistem mendeteksi penurunan pada laporan monitoring terakhir Anda. Segera ambil tindakan.
                                    </p>
                                </div>
                            </div>

                            {/* Badge */}
                            <div className="flex-shrink-0 mt-1">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold animate-pulse"
                                    style={{ background: 'rgba(244,63,94,0.3)', color: '#fca5a5', border: '1px solid rgba(244,63,94,0.5)' }}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
                                    Perlu Tindakan
                                </span>
                            </div>
                        </div>

                        {/* ── Detail Cards ── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {mustahikAlert.isStatusDeclining && (
                                <div className="rounded-xl p-4"
                                    style={{ background: 'linear-gradient(135deg, #4c0519 0%, #7f1d1d 100%)', border: '1px solid rgba(244,63,94,0.4)' }}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{ background: 'rgba(244,63,94,0.25)' }}>
                                            <TrendingDown className="w-4 h-4" style={{ color: '#fca5a5' }} />
                                        </div>
                                        <p className="font-bold text-sm" style={{ color: '#fff1f2' }}>Status Usaha Menurun</p>
                                    </div>
                                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(253,164,175,0.85)' }}>
                                        Status terakhir tercatat:{' '}
                                        <span className="font-extrabold capitalize" style={{ color: '#fca5a5' }}>
                                            {mustahikAlert.bp?.businessStatus}
                                        </span>
                                        . Omzet saat ini{' '}
                                        <span className="font-bold" style={{ color: '#fecdd3' }}>
                                            Rp {Number(mustahikAlert.bp?.revenue || 0).toLocaleString('id-ID')}
                                        </span>
                                        .
                                    </p>
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
                                        <p className="font-bold text-sm" style={{ color: '#fff1f2' }}>Keuangan Defisit</p>
                                    </div>
                                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(253,164,175,0.85)' }}>
                                        Pengeluaran{' '}
                                        <span className="font-extrabold" style={{ color: '#fde68a' }}>
                                            Rp {Number(mustahikAlert.expenditure).toLocaleString('id-ID')}
                                        </span>{' '}
                                        lebih besar dari pendapatan{' '}
                                        <span className="font-bold" style={{ color: '#fecdd3' }}>
                                            Rp {Number(mustahikAlert.income).toLocaleString('id-ID')}
                                        </span>
                                        . Defisit{' '}
                                        <span className="font-extrabold" style={{ color: '#fca5a5' }}>
                                            Rp {Number(mustahikAlert.deficitAmount).toLocaleString('id-ID')}
                                        </span>
                                        /bulan.
                                    </p>
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
                                    <Phone className="w-4 h-4" />
                                    Hubungi LAZ Sekarang
                                </a>
                                <button
                                    onClick={() => window.open('mailto:laz@zakat.com?subject=Laporan Kondisi Usaha Menurun&body=Assalamu%27alaikum%2C%20saya%20mustahik%20penerima%20bantuan%20dan%20ingin%20melaporkan%20kondisi%20usaha%20saya%20yang%20sedang%20menurun.%20Mohon%20bantuan%20dan%20pendampingan.', '_blank')}
                                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.03] active:scale-95 text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50"
                                    style={{ border: '1px solid rgba(244,63,94,0.4)' }}
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Kirim Email Laporan
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* Metrics Row */}
            <div className={`grid gap-3 ${userRole === 'mustahik' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'}`}>
                {userRole !== 'mustahik' && (
                    <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                            <CardTitle className="text-xs font-medium text-slate-500">Total Penerima</CardTitle>
                            <Users className="h-3 w-3 text-emerald-600" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-xl font-bold text-slate-900">{totalRecipients}</div>
                            <p className="text-[10px] text-slate-500 mt-1">
                                Dari <span className="font-medium text-emerald-600">{recipientHistory.length}</span> distribusi
                            </p>
                        </CardContent>
                    </Card>
                )}

                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                        <CardTitle className="text-xs font-medium text-slate-500">
                            {userRole === 'mustahik' ? 'Total Dana Diterima' : 'Dana Tersalur'}
                        </CardTitle>
                        <DollarSign className="h-3 w-3 text-blue-600" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-xl font-bold text-slate-900">
                            Rp {Math.round(totalFundDistributed / 1000000)}<span className="text-sm font-semibold text-slate-400">jt</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                            {userRole === 'mustahik' ? 'Total bantuan' : <span>Dari <span className="font-medium text-blue-600">{aidPrograms.length}</span> program</span>}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                        <CardTitle className="text-xs font-medium text-slate-500">
                            {userRole === 'mustahik' ? 'Laporan Saya' : 'Total Monitoring'}
                        </CardTitle>
                        <Activity className="h-3 w-3 text-violet-600" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-xl font-bold text-slate-900">{totalMonitoring}</div>
                        <p className="text-[10px] text-slate-500 mt-1">
                            Data terkumpul
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                        <CardTitle className="text-xs font-medium text-slate-500">
                            {userRole === 'mustahik' ? 'Rata-rata Pendapatan' : 'Rata-rata Omzet'}
                        </CardTitle>
                        <TrendingUp className="h-3 w-3 text-amber-600" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-xl font-bold text-slate-900">
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
                            <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">Status Usaha Mustahik</CardTitle>
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

                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <CardHeader className="p-3 bg-gradient-to-r from-rose-50/50 to-transparent dark:from-rose-900/10 flex flex-row items-center justify-between space-y-0">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-rose-500" />
                                <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                    Perlu Perhatian
                                </CardTitle>
                            </div>
                            <Badge variant="outline" className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 animate-pulse text-[10px] h-5 px-1.5">
                                Action Needed
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
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {needAttention.map((data) => (
                                        <div
                                            key={data.id}
                                            className="flex items-center justify-between p-3 hover:bg-rose-50/50 dark:hover:bg-rose-900/10 transition-all hover:border-l-4 hover:border-rose-500 group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-1.5 bg-rose-100 dark:bg-rose-900/30 rounded-lg text-rose-600 dark:text-rose-400 group-hover:bg-rose-200 dark:group-hover:bg-rose-800 transition-colors">
                                                    <TrendingDown className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm text-slate-900 dark:text-slate-100">{data.mustahikName}</div>
                                                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{getProgress(data).businessType}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <Badge variant="destructive" className="bg-rose-100 dark:bg-rose-900/40 hover:bg-rose-200 dark:hover:bg-rose-800 text-rose-700 dark:text-rose-300 border-0 shadow-none text-[10px] px-1.5 h-5">
                                                        {getProgress(data).businessStatus}
                                                    </Badge>
                                                </div>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-6 w-6 hover:bg-rose-100 dark:hover:bg-rose-900/50"
                                                    onClick={(e: React.MouseEvent) => {
                                                        e.stopPropagation();
                                                        onViewMonitoring?.(data.id);
                                                    }}
                                                >
                                                    <Eye className="w-3 h-3 text-rose-500 hover:text-rose-700" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}