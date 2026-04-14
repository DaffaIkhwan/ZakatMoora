import { useState, useEffect } from 'react';
import '../landing.css';
import {
    ResponsiveContainer, PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area
} from 'recharts';
import {
    Shield, TrendingUp, Users, Heart, Award,
    ArrowRight, Loader2, CheckCircle2, Calendar,
    DollarSign, BarChart3, Globe2,
    Target, Zap, Activity, Fingerprint,
    LockKeyhole, Database, X, HandCoins, UserCircle, Wallet
} from 'lucide-react';
import { ModeToggle } from './mode-toggle';
import { useTheme } from './theme-provider';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import Loader from './Loader';
// @ts-ignore
import heroVideo from '../vid/0vid zakat.mp4';

interface PublicStats {
    totalPrograms: number;
    totalMustahik: number;
    totalZakat: number;
    totalDisalurkan: number;
    totalMustahikStabil?: number;
    totalMustahikBerkembang?: number;
    runningPrograms?: number;
    completedPrograms?: number;
    programs: {
        id: string;
        name: string;
        description: string;
        status: string;
        budget: number;
        totalZakat: number;
        totalPenerima: number;
        startDate: string;
        donations?: {
            muzakkiName: string;
            amount: number;
            date: string;
        }[];
    }[];
    recentRecipients: {
        id: string;
        mustahikName: string;
        mustahikAddress: string;
        programName: string;
        amount: number;
        receivedDate: string;
    }[];
}

interface LandingPageProps {
    onLoginClick: () => void;
}

const API_BASE = 'http://localhost:5000/api';

const formatRp = (n: number) => {
    if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)} M`;
    if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)} Jt`;
    return 'Rp ' + (n || 0).toLocaleString('id-ID');
};

const formatRpFull = (n: number) => 'Rp ' + (n || 0).toLocaleString('id-ID');

const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

export function LandingPage({ onLoginClick }: LandingPageProps) {
    const [stats, setStats] = useState<PublicStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'programs' | 'recipients'>('programs');
    const [scrolled, setScrolled] = useState(false);
    const [scrollPercent, setScrollPercent] = useState(0);
    const [recipientPage, setRecipientPage] = useState(1);
    const [selectedProgram, setSelectedProgram] = useState<any | null>(null);
    const [dialogTab, setDialogTab] = useState<'recipients' | 'donations'>('recipients');
    const ITEMS_PER_PAGE = 5;
    const { theme } = useTheme();

    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    useEffect(() => {
        const controller = new AbortController();

        fetch(`${API_BASE}/public/stats`, { signal: controller.signal })
            .then(async (r) => {
                if (!r.ok) throw new Error('API Error');
                return r.json();
            })
            .then(data => {
                const running = data.programs?.filter((p: any) => p.status?.toLowerCase() === 'running' || p.status?.toLowerCase() === 'active').length || 0;
                const completed = data.programs?.filter((p: any) => p.status?.toLowerCase() === 'completed' || p.status?.toLowerCase() === 'finished').length || 0;
                const stabilized = data.totalMustahikStabil ?? Math.floor(data.totalMustahik * 0.42);
                const developing = data.totalMustahikBerkembang ?? Math.floor(data.totalMustahik * 0.28);

                setStats({
                    ...data,
                    runningPrograms: running,
                    completedPrograms: completed,
                    totalMustahikStabil: stabilized,
                    totalMustahikBerkembang: developing
                });
                setLoading(false);
            })
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    setLoading(false);
                }
            });
        return () => controller.abort();
    }, []);

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 20);
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            if (height > 0) {
                setScrollPercent((winScroll / height) * 100);
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const statusBadge = (s: string) => {
        if (s === 'active') return 'text-green-400 border-green-400/30 bg-green-400/10';
        if (s === 'completed') return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
        return 'text-amber-400 border-amber-400/30 bg-amber-400/10';
    };

    return (
        <div className="lp-container relative min-h-screen bg-slate-100 dark:bg-slate-950 font-sans antialiased overflow-x-hidden transition-colors duration-500">
            {/* Premium Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(0,0,0,0.15) 3px, transparent 0)',
                    backgroundSize: '36px 36px'
                }}
            />
            <div className="fixed inset-0 z-0 pointer-events-none hidden dark:block"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.1) 3px, transparent 0)',
                    backgroundSize: '36px 36px'
                }}
            />

            {/* Soft glowing ambient orbs - Forced via inline styles to ensure rendering */}
            <div
                className="fixed pointer-events-none z-0 rounded-full"
                style={{ top: '5%', left: '-5%', width: '600px', height: '600px', backgroundColor: 'rgba(52, 211, 153, 0.25)', filter: 'blur(120px)' }}
            />
            <div
                className="fixed pointer-events-none z-0 rounded-full"
                style={{ bottom: '5%', right: '-5%', width: '700px', height: '700px', backgroundColor: 'rgba(129, 140, 248, 0.25)', filter: 'blur(140px)' }}
            />
            <div
                className="fixed pointer-events-none z-0 rounded-full"
                style={{ top: '40%', left: '35%', width: '500px', height: '500px', backgroundColor: 'rgba(56, 189, 248, 0.2)', filter: 'blur(120px)' }}
            />

            <div className="lp-hero-gradient relative z-0" />

            <nav
                style={{
                    backgroundColor: '#16a34a',
                    position: 'fixed',
                    zIndex: 50,
                    width: '100%',
                    top: 0,
                    left: 0,
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
                    borderBottom: '1px solid rgba(34, 197, 94, 0.3)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        minHeight: '64px',
                        padding: '8px 32px',
                    }}
                >
                    {/* LEFT: Brand */}
                    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: 'clamp(0.875rem, 2vw, 1.2rem)', fontWeight: 700, color: 'white' }}>
                            SPK Penerima Zakat Produktif
                        </span>
                    </div>

                    {/* RIGHT: Controls */}
                    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ModeToggle style={{ color: 'white' }} />
                            <button
                                onClick={onLoginClick}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    padding: '6px 16px',
                                    borderRadius: '9999px',
                                    fontSize: '0.875rem',
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    cursor: 'pointer',
                                    border: 'none',
                                    transition: 'all 0.3s ease',
                                    backgroundColor: '#ffffff',
                                    color: '#15803d',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                }}
                            >
                                Login Sistem
                                <ArrowRight style={{ width: '16px', height: '16px' }} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="relative z-10" style={{ paddingTop: 0, paddingBottom: '200px', paddingLeft: 'clamp(4rem, 15vw, 24rem)', paddingRight: 'clamp(4rem, 15vw, 24rem)' }}>
                {/* Hero Section */}
                <section style={{ marginTop: '100px' }}>
                    <div className="relative overflow-hidden w-full max-w-[1440px] mx-auto shadow-2xl" style={{ height: 'clamp(20rem, 50vw, 40rem)', borderRadius: '24px' }}>
                        {/* Video Background — scales with container */}
                        <div className="absolute inset-0 z-0" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                                style={{ borderRadius: '24px' }}
                            >
                                <source src={heroVideo} type="video/mp4" />
                            </video>
                            {/* Dark overlay gradient for text readability (reduced masking) */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/10 dark:from-black/60 dark:via-black/40 dark:to-black/20" />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40" />
                        </div>

                        {/* Text content overlay */}
                        <div className="absolute inset-0 z-10 px-6 sm:px-10 lg:px-16 flex items-center">
                            <div className="w-full">
                                <div className="flex flex-col max-w-2xl">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white  text-green-300 text-xs font-bold mb-4 sm:mb-8 w-fit border border-white/10">


                                    </div>
                                    <h1 className="lp-section-title text-white mb-4 sm:mb-8 drop-shadow-lg">
                                        Kebutuhan <br />
                                        <span className="text-green-400">Presisi</span> <br />
                                        Menjadi Berarti.
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Impact Metrics */}
                <section id="impact" className="pt-12 pb-6 sm:pt-16 sm:pb-8 lg:pt-20 lg:pb-10 scroll-mt-48 relative z-10">
                    <div className="max-w-[1440px] mx-auto">
                        <div className="flex flex-col lg:flex-row items-end justify-between mb-8 sm:mb-12 gap-6 sm:gap-8">
                            <div className="max-w-2xl">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Dampak Tersalurkan</h2>
                                <p className="text-slate-500 dark:text-slate-400">Ringkasan statistik program bantuan yang telah berjalan</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:gap-6">
                            {[
                                { label: 'Total Dana Terdistribusi', val: formatRp(stats?.totalDisalurkan || 0), sub: formatRpFull(stats?.totalDisalurkan || 0), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
                                { label: 'Mustahik', val: String(stats?.totalMustahik || 0), sub: 'Penerima Manfaat', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                                { label: 'Program Operasional', val: String(stats?.runningPrograms || 0), sub: 'Sedang Berjalan Sekarang', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                                { label: 'Program Selesai', val: String(stats?.completedPrograms || 0), sub: 'Misi Berhasil Diselesaikan', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' }
                            ].map((s, i) => (
                                <div key={i} className="lp-card group relative overflow-hidden border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none">
                                    <div className={`${s.color} mb-6`}>
                                        <s.icon className="size-6" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 block">{s.label}</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="lp-stat-value text-slate-900 dark:text-white">{s.val}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">{s.sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Database Toggle */}
                <section id="database" className="pt-6 pb-12 sm:pt-8 sm:pb-16 lg:pt-10 lg:pb-20 scroll-mt-48 relative z-10">
                    <div className="max-w-[1440px] mx-auto">
                        <div className="flex flex-col mb-8 sm:mb-12">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Program Bantuan</h2>
                            <p className="text-slate-500 dark:text-slate-400">Pilih program untuk melihat profil penerima manfaat secara detail</p>
                        </div>
                        <div className="min-h-[300px] mt-4 lg:mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {loading ? (
                                <div className="flex items-center justify-center p-12">
                                    <Loader />
                                </div>
                            ) : (
                                <div className="grid" style={{ gap: '80px' }}>
                                    {(stats?.programs || []).filter(p => p.status === 'active' || p.status === 'completed').map(p => {
                                        const accumulated = p.totalZakat || p.totalDonasi || 0;
                                        const pct = p.budget > 0 ? Math.min(100, Math.round((accumulated / p.budget) * 100)) : 0;
                                        const safeWidth = isNaN(pct) ? 0 : pct;

                                        return (
                                            <div
                                                key={p.id}
                                                onClick={() => {
                                                    setSelectedProgram(p);
                                                    setDialogTab('recipients');
                                                }}
                                                className="lp-card bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all cursor-pointer group hover:border-green-500/30 border rounded-lg p-6"
                                            >
                                                <div className="flex items-start justify-between mb-6">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight" style={{ color: p.name ? undefined : 'inherit' }}>{p.name}</h3>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Target Anggaran</span>
                                                        <div className="text-lg font-bold text-green-600 dark:text-green-400">{formatRp(p.budget)}</div>
                                                    </div>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-8 mb-6">
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Dana Terkumpul</span>
                                                        <div className="text-base font-semibold text-slate-900 dark:text-slate-100">{formatRp(accumulated)}</div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Penerima Manfaat</span>
                                                        <div className="text-base font-semibold text-slate-900 dark:text-slate-100">{p.totalPenerima} <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Jiwa</span></div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                                                        <span>Realisasi Program</span>
                                                        <span className="text-green-600 dark:text-green-400">{safeWidth}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden" style={{ height: '8px' }}>
                                                        <div className="bg-green-600 dark:bg-green-500 transition-all duration-1000"
                                                            style={{ width: `${safeWidth}%`, height: '100%' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {(stats?.programs || []).filter(p => p.status === 'active' || p.status === 'completed').length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 font-bold italic py-20 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                            <Database className="size-12 mb-4 opacity-10" />
                                            <p className="uppercase tracking-widest">Belum Ada Data Program</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </section>




            </main>

            {/* Footer */}
            {/* <footer className="mt-16 sm:mt-32 lg:mt-[200px] py-8 sm:py-16 px-4 sm:px-6 lg:px-12 bg-slate-900 border-t border-slate-800">
                <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-12 items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
                            <Fingerprint className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-bold text-white tracking-widest uppercase">ZakatMoora System v2.0.5</span>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 text-center">
                        © 2025 All Rights Reserved · Powered by Research Framework Alpha · MOORA Optimization Engine Active
                    </div>
                    <div className="flex justify-center md:justify-end gap-4 sm:gap-8 text-xs font-bold uppercase tracking-widest text-slate-500">
                        <span className="hover:text-green-500 cursor-pointer transition-colors">Security</span>
                        <span className="hover:text-green-500 cursor-pointer transition-colors">Protocol</span>
                        <span className="hover:text-green-500 cursor-pointer transition-colors">Network</span>
                    </div>
                </div>
            </footer> */}

            <Dialog open={!!selectedProgram} onOpenChange={(open) => !open && setSelectedProgram(null)}>
                <DialogContent className="max-w-[800px] w-[95vw] h-[750px] max-h-[92vh] dialog-bg-navy dialog-border-navy border-0 shadow-2xl p-0 overflow-hidden flex flex-col">
                    {selectedProgram && (() => {
                        const programRecipients = (stats?.recentRecipients || []).filter(r => r.programName === selectedProgram.name);
                        const allDonations = selectedProgram.donations || [];
                        const totalDonated = allDonations.reduce((s: number, d: any) => s + (Number(d.amount) || 0), 0);
                        const accumulated = selectedProgram.totalZakat || selectedProgram.totalDonasi || 0;
                        const pct = selectedProgram.budget > 0 ? Math.min(100, Math.round((accumulated / selectedProgram.budget) * 100)) : 0;

                        return (
                            <>
                                <div className="bg-green-600 px-6 py-4 text-white relative shrink-0 overflow-hidden">
                                    <DialogHeader className="pt-0">
                                        <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                                            <Award className="w-5 h-5" />
                                            {selectedProgram.name}
                                        </DialogTitle>
                                        <DialogDescription className="text-green-50 font-medium opacity-90 text-sm">
                                            Laporan penyaluran dana zakat kepada {programRecipients.length} mustahik
                                        </DialogDescription>
                                    </DialogHeader>
                                </div>

                                {/* Tab Switcher */}
                                <div className="flex dialog-bg-navy-light dialog-border-navy mx-6 mt-4 p-1 rounded-xl border">
                                    <button
                                        onClick={() => setDialogTab('recipients')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${dialogTab === 'recipients' ? 'dialog-tab-active text-green-600 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                    >
                                        <Users className="size-3.5" />
                                        Penerima
                                    </button>
                                    <button
                                        onClick={() => setDialogTab('donations')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${dialogTab === 'donations' ? 'dialog-tab-active text-green-600 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                    >
                                        <HandCoins className="size-3.5" />
                                        Pemberi Zakat
                                    </button>
                                </div>

                                {/* Content Area */}
                                <div className="flex-1 overflow-y-auto p-6 dialog-bg-navy">
                                    <div className="space-y-2.5">
                                        {dialogTab === 'recipients' ? (
                                            <>
                                                {programRecipients.map((r, i) => (
                                                    <div
                                                        key={`rec-${r.id || i}`}
                                                        className="group flex items-center justify-between p-4 dialog-bg-navy-light dialog-bg-navy-hover rounded-2xl transition-all border dialog-border-navy dialog-border-navy-hover"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            {/* Rounded-lg square avatar with initial */}
                                                            <div className="w-11 h-11 rounded-xl bg-green-500/10 dark:bg-green-400/10 flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-sm border border-green-500/20 dark:border-green-400/20 group-hover:scale-105 transition-transform">
                                                                {r.mustahikName?.charAt(0)?.toUpperCase() || '?'}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-slate-900 dark:text-white text-sm capitalize leading-tight">{r.mustahikName}</div>
                                                                <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                                                                    <Calendar className="w-3 h-3 text-green-600" />
                                                                    {formatDate(r.receivedDate)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex flex-col items-end gap-1">
                                                            <div className="text-base font-black text-green-600 dark:text-green-400 font-mono tracking-tight leading-none">{formatRpFull(r.amount)}</div>
                                                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Diterima</span>
                                                        </div>
                                                    </div>
                                                ))}

                                                {programRecipients.length === 0 && (
                                                    <div className="py-20 text-center">
                                                        <Database className="size-10 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                                                        <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs">Belum ada data penyaluran</p>
                                                    </div>
                                                )}
                                            </>
                                        ) : (() => {
                                            const namedDonations = allDonations.filter((d: any) => d.muzakkiName && d.muzakkiName !== 'Hamba Allah');
                                            const anonymousDonations = allDonations.filter((d: any) => !d.muzakkiName || d.muzakkiName === 'Hamba Allah');
                                            const anonymousTotal = anonymousDonations.reduce((sum: number, d: any) => sum + (Number(d.amount) || 0), 0);
                                            const anonymousCount = anonymousDonations.length;

                                            const groupedMap = new Map<string, { name: string; total: number; count: number; latestDate: string }>();
                                            namedDonations.forEach((d: any) => {
                                                const key = d.muzakkiName;
                                                if (groupedMap.has(key)) {
                                                    const existing = groupedMap.get(key)!;
                                                    existing.total += Number(d.amount) || 0;
                                                    existing.count += 1;
                                                    if (d.date && d.date > existing.latestDate) existing.latestDate = d.date;
                                                } else {
                                                    groupedMap.set(key, {
                                                        name: d.muzakkiName,
                                                        total: Number(d.amount) || 0,
                                                        count: 1,
                                                        latestDate: d.date || ''
                                                    });
                                                }
                                            });
                                            const groupedDonors = Array.from(groupedMap.values()).sort((a, b) => b.total - a.total);

                                            return (
                                                <>
                                                    {groupedDonors.map((donor, i: number) => (
                                                        <div
                                                            key={`don-${i}`}
                                                            className="group flex items-center justify-between p-4 dialog-bg-navy-light dialog-bg-navy-hover rounded-2xl transition-all border dialog-border-navy dialog-border-navy-hover"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                {/* Circular avatar with initials for donors */}
                                                                <div className="w-11 h-11 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm border border-emerald-500/20 dark:border-emerald-400/20 group-hover:scale-105 transition-transform">
                                                                    {donor.name?.charAt(0)?.toUpperCase() || '?'}
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-slate-900 dark:text-white text-sm capitalize leading-tight">{donor.name}</div>
                                                                    <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                                                                        {donor.count > 1 ? (
                                                                            <>
                                                                                <Wallet className="w-3 h-3 text-green-600" />
                                                                                <span>{donor.count} kali berzakat</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Calendar className="w-3 h-3 text-green-600" />
                                                                                {formatDate(donor.latestDate)}
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right flex flex-col items-end gap-1">
                                                                <div className="text-base font-black text-green-600 dark:text-green-400 font-mono tracking-tight leading-none">{formatRpFull(donor.total)}</div>
                                                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Zakat</span>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {/* Hamba Allah - consolidated */}
                                                    {anonymousCount > 0 && (
                                                        <div className="group flex items-center justify-between p-4 dialog-bg-navy-light rounded-2xl transition-all border dialog-border-navy" style={{ borderStyle: 'dashed' }}>
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700">
                                                                    <Shield className="size-5" />
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-slate-900 dark:text-white text-sm italic leading-tight">Hamba Allah</div>
                                                                    <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                                                                        <LockKeyhole className="w-3 h-3 text-slate-400" />
                                                                        {anonymousCount} zakat anonim
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right flex flex-col items-end gap-1">
                                                                <div className="text-base font-black text-green-600 dark:text-green-400 font-mono tracking-tight leading-none">{formatRpFull(anonymousTotal)}</div>
                                                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Zakat</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {allDonations.length === 0 && (
                                                        <div className="py-20 text-center">
                                                            <HandCoins className="size-10 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                                                            <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs">Belum ada zakat tercatat</p>
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="px-6 py-4 border-t dialog-border-navy dialog-bg-navy-light">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </DialogContent>
            </Dialog>
        </div>
    );
}
