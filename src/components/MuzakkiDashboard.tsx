import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
    Gift, Heart, Users, TrendingUp, Calendar,
    ArrowRight, Wallet, Target, BarChart3, Sparkles,
    CircleDollarSign, Award, ShieldCheck, Building2, Eye, Plus,
    PlusCircle, CheckCircle2, CreditCard, FileText, Loader2,
    Banknote
} from 'lucide-react';
import { api } from '../services/api';
import type { MuzakkiDashboardData } from '../types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import Loader from './Loader';
import { toast } from 'sonner';

declare global {
    interface Window {
        snap: any;
    }
}

interface MuzakkiDashboardProps {
    initialData?: MuzakkiDashboardData | null;
    initialLoading?: boolean;
    onRefresh?: () => void;
}

export function MuzakkiDashboard({ initialData, initialLoading, onRefresh }: MuzakkiDashboardProps) {
    const [data, setData] = useState<MuzakkiDashboardData | null>(initialData || null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(initialLoading ?? (!initialData));
    const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
    const [donationAmount, setDonationAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);

    useEffect(() => {
        if (initialData) {
            setData(initialData);
            setIsLoading(initialLoading || false);
        }
    }, [initialData, initialLoading]);

    const fetchDashboard = async () => {
        try {
            setIsLoading(true);
            const dashboardData = await api.getMuzakkiDashboard();
            setData(dashboardData);
        } catch (err: any) {
            console.error('Failed to fetch muzakki dashboard:', err);
            setError(err.message || 'Gagal memuat data dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (data) return;
        fetchDashboard();
    }, []);

    useEffect(() => {
        const midtransScriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';
        const clientKey = 'Mid-client-3vLCuoEY4EwAK-fE';

        let scriptTag = document.createElement('script');
        scriptTag.src = midtransScriptUrl;
        scriptTag.setAttribute('data-client-key', clientKey);
        scriptTag.async = true;

        document.body.appendChild(scriptTag);

        return () => {
            document.body.removeChild(scriptTag);
        };
    }, []);

    const formatIDR = (value: string) => {
        if (!value) return "";
        const numberValue = value.replace(/[^0-9]/g, "");
        if (!numberValue) return "";
        return new Intl.NumberFormat("id-ID").format(parseInt(numberValue));
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, "");
        setDonationAmount(rawValue);
    };

    const handleDirectDonation = async () => {
        if (!donationAmount || parseFloat(donationAmount) <= 0) {
            toast.warning('Silakan masukkan nominal zakat yang valid.');
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await api.donate({
                amount: parseFloat(donationAmount),
                isAnonymous: isAnonymous
            });

            if (window.snap) {
                setIsDonationModalOpen(false);

                const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(parseFloat(donationAmount));
                toast.success(
                    <div className="flex flex-col gap-1.5 mt-1">
                        <div className="flex items-center gap-2 border-b border-emerald-100 dark:border-emerald-900 pb-2 mb-1">
                            <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">Verifikasi Akad Zakat</span>
                        </div>
                        <p className="text-[13px] italic text-slate-700 dark:text-slate-200 font-medium">
                            "Nawaitu an ukhrija zakaata maali fardhan lillaahi ta'aala."
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            Saya berniat mengeluarkan zakat harta saya sejumlah <span className="font-bold text-emerald-600 dark:text-emerald-400">{formattedAmount}</span>, fardhu karena Allah Ta'ala.
                        </p>
                    </div>,
                    { duration: 8000, position: 'top-center' }
                );

                window.snap.pay(response.token, {
                    onSuccess: async function (result: any) {
                        try {
                            await api.verifyPayment(response.donationId);
                            toast.success('Alhamdulillah! Zakat Anda berhasil diterima dan masuk ke Dana Terkumpul.');
                            fetchDashboard();
                            if (onRefresh) onRefresh();
                        } catch (err) {
                            console.error('Verification failed:', err);
                            fetchDashboard();
                            if (onRefresh) onRefresh();
                        }
                    },
                    onPending: async function (result: any) {
                        try {
                            await api.verifyPayment(response.donationId);
                            toast.info('Pembayaran tertunda. Silakan selesaikan pembayaran Anda.');
                            fetchDashboard();
                            if (onRefresh) onRefresh();
                        } catch (err) {
                            console.error('Verification failed:', err);
                            fetchDashboard();
                            if (onRefresh) onRefresh();
                        }
                    },
                    onError: function (result: any) {
                        toast.error('Terjadi kesalahan saat memproses pembayaran.');
                        console.error('Midtrans payment error:', result);
                    },
                    onClose: function () { }
                });
            } else {
                toast.error('Sistem pembayaran belum siap. Silakan coba lagi beberapa saat lagi.');
            }
        } catch (err: any) {
            console.error('Donation error:', err);
            toast.error('Gagal memproses zakat: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
                <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 rounded-xl flex items-center justify-center mb-3">
                    <ShieldCheck className="w-6 h-6 text-rose-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Gagal Memuat Dashboard</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-sm">{error}</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => fetchDashboard()}>Coba Lagi</Button>
            </div>
        );
    }

    if (isLoading || !data) {
        return <Loader overlay />;
    }

    const formatCurrency = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

    const formatShortCurrency = (value: number) => {
        if (value >= 1000000000) return { val: (value / 1000000000).toLocaleString('id-ID', { maximumFractionDigits: 1 }), unit: 'M' };
        if (value >= 1000000) return { val: (value / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 }), unit: 'jt' };
        if (value >= 1000) return { val: (value / 1000).toLocaleString('id-ID', { maximumFractionDigits: 0 }), unit: 'rb' };
        return { val: value.toString(), unit: '' };
    };

    return (
        <div className="space-y-4 pb-8 relative">
            <div className="space-y-4 pb-8">
                <style>
                    {`
                    #donation-button-header, #donation-button-empty {
                        background-color: #16a34a !important;
                        color: white !important;
                        font-weight: 700;
                        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                        box-shadow: 0 1px 3px rgba(22, 163, 74, 0.2);
                    }
                    #donation-button-header:hover, #donation-button-empty:hover {
                        background-color: #15803d !important;
                        transform: translateY(-2px);
                        box-shadow: 0 8px 20px -4px rgba(22, 163, 74, 0.5), 0 2px 8px rgba(22, 163, 74, 0.3);
                    }
                    #donation-button-header:active, #donation-button-empty:active {
                        transform: translateY(0px) scale(0.97);
                        box-shadow: 0 2px 6px rgba(22, 163, 74, 0.3);
                    }
                    .dark #donation-button-header, .dark #donation-button-empty {
                        background-color: #16a34a !important;
                        box-shadow: none;
                    }
                    .dark #donation-button-header:hover, .dark #donation-button-empty:hover {
                        background-color: #15803d !important;
                        box-shadow: 0 8px 20px -4px rgba(22, 163, 74, 0.4), 0 2px 8px rgba(22, 163, 74, 0.2);
                    }
                `}
                </style>
                {/* ─── Welcome Header ─── */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Assalamu'alaikum, {data.muzakkiInfo.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-slate-500 dark:text-slate-400">Selamat berzakat, pantau kontribusi Anda di sini.</p>
                        </div>
                    </div>

                        <Dialog open={isDonationModalOpen} onOpenChange={(open) => {
                            setIsDonationModalOpen(open);
                            if (!open) { setIsAnonymous(false); setDonationAmount(''); }
                        }}>
                            <DialogTrigger asChild>
                                <Button id="donation-button-header" size="sm" className="btn-green gap-2 flex-shrink-0">
                                    <Plus className="w-4 h-4" /> Zakat Sekarang
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[1000px] w-[95vw] h-[700px] max-h-[90vh] dialog-bg-navy dialog-border-navy border-0 shadow-2xl p-0 overflow-hidden flex flex-col">
                                <div className="bg-green-600 p-6 text-white relative shrink-0">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                                            <Wallet className="w-6 h-6" />
                                            Pencatatan Zakat
                                        </DialogTitle>
                                        <DialogDescription className="text-green-50 font-medium opacity-90">
                                            Zakat dari <span className="text-white font-bold underline underline-offset-4 decoration-2">{data.muzakkiInfo.name}</span> akan masuk ke <span className="text-white font-bold">Dana Terkumpul</span> LAZ
                                        </DialogDescription>
                                    </DialogHeader>
                                </div>

                                <div className="p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                                    <div className="space-y-6">
                                        {/* Info Box: Dana Terkumpul */}
                                        <div className="pool-info-box">
                                            <div className="flex items-center gap-3">
                                                <div className="pool-icon-wrapper">
                                                    <Banknote className="pool-icon" />
                                                </div>
                                                <div>
                                                    <p className="pool-label">Dana Terkumpul Saat Ini</p>
                                                    <p className="pool-amount">
                                                        {formatCurrency(data.poolBalance || 0)}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="pool-desc">
                                                Zakat Anda akan masuk ke Dana Terkumpul, lalu disalurkan oleh LAZ ke program-program bantuan mustahik.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                                                <Wallet className="w-4 h-4 text-green-500" /> Nominal Zakat
                                            </Label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-semibold text-sm">Rp</span>
                                                <Input
                                                    required
                                                    type="text"
                                                    placeholder="0"
                                                    value={formatIDR(donationAmount)}
                                                    onChange={handleAmountChange}
                                                    className="pl-14 h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-lg font-bold text-green-600 dark:text-green-400 focus:ring-green-500/20"
                                                />
                                            </div>
                                        </div>

                                        {/* Hamba Allah Checkbox */}
                                        <div className="py-2">
                                            <label className="flex items-center gap-4 cursor-pointer group select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={isAnonymous}
                                                    onChange={(e) => setIsAnonymous(e.target.checked)}
                                                    className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 cursor-pointer"
                                                    style={{ accentColor: '#16a34a' }}
                                                />
                                                <span className="text-md font-bold text-green-600 dark:text-green-500">
                                                    Zakat sebagai Hamba Allah
                                                </span>
                                            </label>
                                        </div>

                                        <Button
                                            onClick={handleDirectDonation}
                                            disabled={isSubmitting || !donationAmount}
                                            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold text-lg mt-8 shadow-lg shadow-green-200 dark:shadow-none transition-all group"
                                        >
                                            {isSubmitting ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Memproses...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    Bayar Zakat ke Dana Terkumpul <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                </span>
                                            )}
                                        </Button>
                                        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium">
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                {/* ─── Stats Grid ─── */}
                <div className="grid gap-2 sm:gap-3 grid-cols-2 lg:grid-cols-4">
                    {/* Dana Terkumpul */}
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                            <CardTitle className="text-xs font-medium text-slate-500">Dana Terkumpul</CardTitle>
                            <Banknote className="h-3 w-3 text-emerald-600" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                Rp {formatShortCurrency(data.poolBalance || 0).val}<span className="text-sm font-semibold text-slate-400">{formatShortCurrency(data.poolBalance || 0).unit}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">Belum disalurkan</p>
                        </CardContent>
                    </Card>

                    {/* Total Kontribusi Saya */}
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                            <CardTitle className="text-xs font-medium text-slate-500">Kontribusi Saya</CardTitle>
                            <Wallet className="h-3 w-3 text-emerald-600" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            {data.hasDonations && data.personalStats ? (
                                <>
                                    <div className="text-xl font-bold text-slate-900 dark:text-white">
                                        Rp {formatShortCurrency(data.personalStats.totalDonated).val}<span className="text-sm font-semibold text-slate-400">{formatShortCurrency(data.personalStats.totalDonated).unit}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1">
                                        <span className="font-medium text-emerald-600">{data.personalStats.donationCount}</span> kali berzakat
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="text-xl font-bold text-slate-300 dark:text-slate-600">-</div>
                                    <p className="text-[10px] text-slate-400 mt-1">Belum ada zakat</p>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Mustahik Terbantu */}
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                            <CardTitle className="text-xs font-medium text-slate-500">Mustahik Terbantu</CardTitle>
                            <Users className="h-3 w-3 text-teal-600" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-xl font-bold text-slate-900 dark:text-white">
                                {data.globalStats.totalRecipients}
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">Penerima manfaat</p>
                        </CardContent>
                    </Card>

                    {/* Total Tersalurkan (Global) */}
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-1 p-4">
                            <CardTitle className="text-xs font-medium text-slate-500">Total Tersalurkan</CardTitle>
                            <TrendingUp className="h-3 w-3 text-amber-600" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-xl font-bold text-slate-900 dark:text-white">
                                Rp {formatShortCurrency(data.globalStats.totalDistributed).val}<span className="text-sm font-semibold text-slate-400">{formatShortCurrency(data.globalStats.totalDistributed).unit}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">
                                <span className="font-medium text-emerald-600">{data.globalStats.totalPrograms}</span> program · <span className="font-medium text-emerald-600">{data.globalStats.totalRecipients}</span> penerima
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* ─── All Programs with Recipients ─── */}
                {data.allPrograms && data.allPrograms.length > 0 ? (
                    <div className="space-y-3">
                        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <CardHeader className="p-3 bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-900/10 flex flex-row items-center justify-between space-y-0">
                                <div className="flex items-center gap-2">
                                    <Gift className="w-4 h-4 text-emerald-600" />
                                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                        Seluruh Program Zakat
                                    </CardTitle>
                                </div>
                                <Badge className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40 text-[10px] h-5 px-2 font-semibold">
                                    {data.allPrograms.length} Program
                                </Badge>
                            </CardHeader>
                        </Card>

                        {data.allPrograms.map((program: any) => {
                            const budgetProgress = program.totalBudget > 0
                                ? Math.min(100, ((program.allocatedFunds || 0) / program.totalBudget) * 100)
                                : 0;
                            const isFullyFunded = (program.allocatedFunds || 0) >= program.totalBudget;

                            return (
                                <Card key={program.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                    <div className="flex border-slate-100 dark:border-slate-800">
                                        {/* ── Program Info (Left 1/3) ── */}
                                        <div className="w-[35%] shrink-0 p-4 border-r border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                                            <Badge className={`text-[10px] font-bold px-2 py-0 h-5 mb-3 border ${program.status === 'completed'
                                                ? 'bg-slate-200 text-slate-600 border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'
                                                : 'bg-emerald-500 text-white border-emerald-600 dark:bg-emerald-500 dark:text-white dark:border-emerald-600'
                                                }`}>
                                                {program.status === 'completed' ? 'Selesai' : '● Aktif'}
                                            </Badge>
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{program.name}</h3>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{program.description}</p>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-slate-500">Dana Dialokasikan:</span>
                                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                        {formatCurrency(program.allocatedFunds || 0)}
                                                    </span>
                                                </div>

                                                <div className="mt-4 space-y-1.5">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-slate-500 dark:text-slate-400 font-medium">Target Anggaran</span>
                                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                            {Math.round(budgetProgress)}%
                                                        </span>
                                                    </div>
                                                    <div
                                                        className="w-full rounded-full overflow-hidden"
                                                        style={{ height: '8px', backgroundColor: 'rgba(15,23,42,0.4)' }}
                                                    >
                                                        <div
                                                            style={{
                                                                height: '100%',
                                                                width: `${Math.max(4, budgetProgress)}%`,
                                                                backgroundColor: isFullyFunded ? '#10b981' : '#22c55e',
                                                                borderRadius: '9999px',
                                                                transition: 'width 1s ease-out',
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                                                        <span>{formatCurrency(program.allocatedFunds || 0)}</span>
                                                        <span>{formatCurrency(program.totalBudget)}</span>
                                                    </div>
                                                </div>

                                                {isFullyFunded && (
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                                                        <Sparkles className="w-3 h-3" /> Fully Funded
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* ── Penerima Manfaat (Right 2/3) ── */}
                                        <div className="w-[65%] flex-1 bg-white dark:bg-slate-900">
                                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-900/10 border-b border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-green-500" />
                                                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                                        Penerima Manfaat
                                                    </span>
                                                </div>
                                                <Badge className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40 text-[10px] h-5 px-2 font-semibold">
                                                    {program.mustahiks.length} Mustahik
                                                </Badge>
                                            </div>
                                            <div>
                                                {program.mustahiks.length > 0 ? (
                                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                                        {program.mustahiks.map((mustahik: any) => (
                                                            <div
                                                                key={mustahik.id}
                                                                className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all hover:pl-4 group"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 text-xs font-bold">
                                                                        {mustahik.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                                                            {mustahik.name}
                                                                        </div>
                                                                        <div className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                                                                            {new Date(mustahik.receivedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' })}
                                                                            {mustahik.businessStatus && (
                                                                                <>
                                                                                    <span className="text-slate-300">·</span>
                                                                                    <span className={`capitalize ${mustahik.businessStatus === 'naik' || mustahik.businessStatus === 'berkembang' ? 'text-emerald-500' : mustahik.businessStatus === 'turun' ? 'text-amber-500' : 'text-slate-400'}`}>
                                                                                        {mustahik.businessStatus}
                                                                                    </span>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                                        Rp {formatShortCurrency(mustahik.amountReceived).val}{formatShortCurrency(mustahik.amountReceived).unit}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-4 text-center text-slate-400 dark:text-slate-500 text-xs">
                                                        Belum ada penerima manfaat
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    /* ─── No Programs Yet ─── */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Card className="md:col-span-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex flex-col items-center text-center p-8">
                                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-3">
                                    <Gift className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Belum Ada Program Bantuan</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mb-4">
                                    Zakat Anda akan masuk ke Dana Terkumpul LAZ dan disalurkan ke program-program bantuan mustahik.
                                </p>
                                <Button
                                    id="donation-button-empty"
                                    onClick={() => setIsDonationModalOpen(true)}
                                    className="gap-2 shadow-lg shadow-green-200 dark:shadow-none"
                                >
                                    <Plus className="w-4 h-4" /> Zakat Sekarang
                                </Button>
                            </div>
                        </Card>

                        {/* Transparency Stats */}
                        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="p-3 bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-900/10 flex flex-row items-center justify-between space-y-0">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                        Transparansi
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    <div className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                <Banknote className="w-4 h-4 text-green-600" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-medium text-slate-500">Dana Terkumpul</div>
                                            </div>
                                        </div>
                                        <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                            Rp {formatShortCurrency(data.poolBalance || 0).val}{formatShortCurrency(data.poolBalance || 0).unit}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                <Building2 className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-medium text-slate-500">Program Aktif</div>
                                            </div>
                                        </div>
                                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                                            {data.globalStats.totalPrograms} <span className="text-slate-400 font-normal">program</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                                                <Users className="w-4 h-4 text-teal-600" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-medium text-slate-500">Mustahik Terbantu</div>
                                            </div>
                                        </div>
                                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                                            {data.globalStats.totalRecipients} <span className="text-slate-400 font-normal">orang</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
                            <CardHeader className="p-3 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/10 flex flex-row items-center justify-between space-y-0">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-blue-600" />
                                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                        Informasi
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Zakat Anda akan masuk ke Dana Terkumpul LAZ Swadaya Ummah dan disalurkan ke program-program bantuan mustahik oleh tim pengelola.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
