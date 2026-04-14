import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { UserPlus, ArrowLeft, Eye, EyeOff, Heart, HandHelping } from 'lucide-react';
import { useTheme } from './theme-provider';
import type { User } from '../types';
import { api } from '../services/api';

interface RegisterProps {
    onRegisterSuccess: (user: User) => void;
    onBack: () => void;
}

export function Register({ onRegisterSuccess, onBack }: RegisterProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const [formData, setFormData] = useState({
        nik: '',
        name: '',
        email: '',
        password: '',
        address: '',
        phone: '',
        role: 'mustahik' as 'mustahik' | 'muzakki'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isHoveredBack, setIsHoveredBack] = useState(false);
    const [hoveredRole, setHoveredRole] = useState<'none' | 'mustahik' | 'muzakki'>('none');

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await api.register(formData);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            onRegisterSuccess(data.user);
        } catch (err: any) {
            console.error('Register Error:', err);
            const msg = err.message || 'Registrasi gagal. Silakan coba lagi.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300 relative overflow-hidden">
            {onBack && (
                <div className="absolute top-0 left-0 w-full p-4 sm:p-6 md:p-8 z-[100] flex justify-start items-start">
                    <button
                        type="button"
                        onClick={() => onBack()}
                        onMouseEnter={() => setIsHoveredBack(true)}
                        onMouseLeave={() => setIsHoveredBack(false)}
                        style={{
                            transform: isHoveredBack ? 'scale(1.1)' : 'scale(1)',
                            background: isHoveredBack ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : 'transparent',
                            padding: '12px',
                            borderRadius: '50%',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                        className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors duration-300 cursor-pointer group flex items-center justify-center shadow-none hover:shadow-lg"
                    >
                        <span className="inline-block transform transition-transform duration-300 ease-out group-hover:-translate-x-1">
                            <ArrowLeft className="w-6 h-6" />
                        </span>
                    </button>
                </div>
            )}
            {/* Premium Background Effects */}
            <div className="absolute inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(0,0,0,0.15) 3px, transparent 0)',
                    backgroundSize: '36px 36px'
                }}
            />
            <div className="absolute inset-0 pointer-events-none hidden dark:block z-0"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.1) 3px, transparent 0)',
                    backgroundSize: '36px 36px'
                }}
            />

            {/* Soft glowing ambient orbs */}
            <div
                className="absolute pointer-events-none rounded-full z-0"
                style={{ top: '5%', left: '-5%', width: '600px', height: '600px', backgroundColor: 'rgba(52, 211, 153, 0.25)', filter: 'blur(120px)' }}
            />
            <div
                className="absolute pointer-events-none rounded-full z-0"
                style={{ bottom: '5%', right: '-5%', width: '700px', height: '700px', backgroundColor: 'rgba(129, 140, 248, 0.25)', filter: 'blur(140px)' }}
            />
            <div
                className="absolute pointer-events-none rounded-full z-0"
                style={{ top: '40%', left: '35%', width: '500px', height: '500px', backgroundColor: 'rgba(56, 189, 248, 0.2)', filter: 'blur(120px)' }}
            />

            <div className="w-full max-w-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500 py-10">
                {/* 1. Header (Outside Container) */}
                <div className="relative text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Buat Akun Baru
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">
                        Silakan pilih tipe akun dan lengkapi data diri Anda
                    </p>
                </div>

                {/* 2. Role Selection (Outside Container) */}
                <div className="mb-8 max-w-xl mx-auto">
                    <label className="block text-sm font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-[0.2em] mb-10 text-center bg-transparent">
                        Mendaftar Sebagai
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10" style={{ marginTop: '35px' }}>
                        {/* Mustahik Card */}
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, role: 'mustahik' }))}
                            onMouseEnter={() => setHoveredRole('mustahik')}
                            onMouseLeave={() => setHoveredRole('none')}
                            style={{
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '24px 16px',
                                borderRadius: '20px',
                                border: formData.role === 'mustahik' ? '2px solid #16a34a' : isDark ? '2px solid #334155' : '2px solid transparent',
                                background: formData.role === 'mustahik'
                                    ? (isDark ? 'linear-gradient(135deg, #0f2a1a 0%, #14332a 100%)' : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)')
                                    : (isDark ? '#1e293b' : '#ffffff'),
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                overflow: 'hidden',
                                transform: hoveredRole === 'mustahik' ? 'scale(1.05)' : (formData.role === 'mustahik' ? 'scale(1.02) translateY(-2px)' : 'scale(1)'),
                                boxShadow: hoveredRole === 'mustahik' ? '0 15px 35px -10px rgba(22, 163, 74, 0.4)' : (formData.role === 'mustahik' ? '0 10px 25px -5px rgba(22, 163, 74, 0.2)' : '0 4px 6px -1px rgba(0,0,0,0.1)'),
                                zIndex: hoveredRole === 'mustahik' ? 10 : 1
                            }}
                        >
                            {/* Check badge */}
                            {formData.role === 'mustahik' && (
                                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-green-600 flex items-center justify-center shadow-md animate-in fade-in zoom-in">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                            )}

                            {/* Icon */}
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 shadow-lg"
                                style={{
                                    background: formData.role === 'mustahik' ? 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)' : (isDark ? '#334155' : '#f1f5f9'),
                                    color: formData.role === 'mustahik' ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b'),
                                }}
                            >
                                <HandHelping className="w-7 h-7" />
                            </div>

                            <span className={`font-bold text-lg mb-1 transition-colors ${formData.role === 'mustahik' ? 'text-green-800 dark:text-green-300' : 'text-slate-700 dark:text-slate-200'}`}>
                                Mustahik
                            </span>
                            <span className="text-xs font-semibold tracking-wide text-green-600 dark:text-green-400 mb-2 uppercase">
                                Penerima Zakat
                            </span>
                            <span className="text-[11px] leading-relaxed text-center px-2 text-slate-500 dark:text-slate-400">
                                Daftar sebagai calon penerima bantuan zakat produktif
                            </span>
                        </button>

                        {/* Muzakki Card */}
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, role: 'muzakki' }))}
                            onMouseEnter={() => setHoveredRole('muzakki')}
                            onMouseLeave={() => setHoveredRole('none')}
                            style={{
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '24px 16px',
                                borderRadius: '20px',
                                border: formData.role === 'muzakki' ? '2px solid #16a34a' : isDark ? '2px solid #334155' : '2px solid transparent',
                                background: formData.role === 'muzakki'
                                    ? (isDark ? 'linear-gradient(135deg, #0f2a1a 0%, #14332a 100%)' : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)')
                                    : (isDark ? '#1e293b' : '#ffffff'),
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                overflow: 'hidden',
                                transform: hoveredRole === 'muzakki' ? 'scale(1.05)' : (formData.role === 'muzakki' ? 'scale(1.02) translateY(-2px)' : 'scale(1)'),
                                boxShadow: hoveredRole === 'muzakki' ? '0 15px 35px -10px rgba(22, 163, 74, 0.4)' : (formData.role === 'muzakki' ? '0 10px 25px -5px rgba(22, 163, 74, 0.2)' : '0 4px 6px -1px rgba(0,0,0,0.1)'),
                                zIndex: hoveredRole === 'muzakki' ? 10 : 1
                            }}
                            className="shadow-lg hover:shadow-xl dark:shadow-none"
                        >
                            {/* Check badge */}
                            {formData.role === 'muzakki' && (
                                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-green-600 flex items-center justify-center shadow-md animate-in fade-in zoom-in">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                            )}

                            {/* Icon */}
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 shadow-lg"
                                style={{
                                    background: formData.role === 'muzakki' ? 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)' : (isDark ? '#334155' : '#f1f5f9'),
                                    color: formData.role === 'muzakki' ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b'),
                                }}
                            >
                                <Heart className="w-7 h-7" />
                            </div>

                            <span className={`font-bold text-lg mb-1 transition-colors ${formData.role === 'muzakki' ? 'text-green-800 dark:text-green-300' : 'text-slate-700 dark:text-slate-200'}`}>
                                Muzakki
                            </span>
                            <span className="text-xs font-semibold tracking-wide text-green-600 dark:text-green-400 mb-2 uppercase">
                                Pemberi Zakat
                            </span>
                            <span className="text-[11px] leading-relaxed text-center px-2 text-slate-500 dark:text-slate-400">
                                Pantau aliran zakat Anda ke program dan mustahik
                            </span>
                        </button>
                    </div>
                </div>

                {/* 3. User Data Input Container (Solid Color) */}
                <Card className="border-slate-200 dark:border-slate-800 !bg-white dark:!bg-slate-900 shadow-2xl max-w-xl mx-auto overflow-hidden">
                    <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 text-center py-4">
                        <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                            {formData.role === 'mustahik' ? 'Data Diri Calon Penerima' : 'Data Diri Pemberi Zakat'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 sm:p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="text-left pt-4 pb-2" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <Label htmlFor="nik" className="text-slate-700 dark:text-slate-300 font-semibold">Nomor Induk Kependudukan (NIK)</Label>
                                <Input
                                    id="nik"
                                    placeholder="16 digit NIK Sesuai KTP"
                                    value={formData.nik}
                                    onChange={handleChange}
                                    required
                                    maxLength={16}
                                    style={{
                                        background: isDark ? '#1e293b' : '#f8fafc',
                                        borderColor: isDark ? '#334155' : '#e2e8f0',
                                        color: isDark ? '#ffffff' : '#0f172a'
                                    }}
                                    className="focus:border-green-500 focus:ring-green-500/20 transition-all h-12 font-medium"
                                />
                            </div>

                            <div className="space-y-4 text-left pt-3" style={{ marginTop: '25px' }}>
                                <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-semibold">Nama Lengkap</Label>
                                <Input
                                    id="name"
                                    placeholder="Nama Sesuai KTP"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        background: isDark ? '#1e293b' : '#f8fafc',
                                        borderColor: isDark ? '#334155' : '#e2e8f0',
                                        color: isDark ? '#ffffff' : '#0f172a'
                                    }}
                                    className="focus:border-green-500 focus:ring-green-500/20 transition-all h-12 font-medium"
                                />
                            </div>

                            <div className="space-y-4 text-left pt-3" style={{ marginTop: '25px' }}>
                                <Label htmlFor="address" className="text-slate-700 dark:text-slate-300 font-semibold">Alamat Lengkap</Label>
                                <Input
                                    id="address"
                                    placeholder="Alamat domisili saat ini"
                                    value={formData.address}
                                    onChange={handleChange}
                                    style={{
                                        background: isDark ? '#1e293b' : '#f8fafc',
                                        borderColor: isDark ? '#334155' : '#e2e8f0',
                                        color: isDark ? '#ffffff' : '#0f172a'
                                    }}
                                    className="focus:border-green-500 focus:ring-green-500/20 transition-all h-12 font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5" style={{ marginTop: '22px' }}>
                                <div className="space-y-4 text-left pt-3">
                                    <Label htmlFor="phone" className="text-slate-700 dark:text-slate-300 font-semibold">Nomor Telepon / WA</Label>
                                    <Input
                                        id="phone"
                                        placeholder="08xxxxxxxxxx"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        style={{
                                            background: isDark ? '#1e293b' : '#f8fafc',
                                            borderColor: isDark ? '#334155' : '#e2e8f0',
                                            color: isDark ? '#ffffff' : '#0f172a'
                                        }}
                                        className="focus:border-green-500 focus:ring-green-500/20 transition-all h-12 font-medium"
                                    />
                                </div>
                                <div className="space-y-4 text-left pt-2">
                                    <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-semibold">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="nama@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        style={{
                                            background: isDark ? '#1e293b' : '#f8fafc',
                                            borderColor: isDark ? '#334155' : '#e2e8f0',
                                            color: isDark ? '#ffffff' : '#0f172a'
                                        }}
                                        className="focus:border-green-500 focus:ring-green-500/20 transition-all h-12 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 text-left pt-3" style={{ marginTop: '22px' }}>
                                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-semibold">Kata Sandi</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Minimal 6 karakter"
                                        value={formData.password}
                                        onChange={handleChange}
                                        style={{
                                            background: isDark ? '#1e293b' : '#f8fafc',
                                            borderColor: isDark ? '#334155' : '#e2e8f0',
                                            color: isDark ? '#ffffff' : '#0f172a'
                                        }}
                                        className="focus:border-green-500 focus:ring-green-500/20 transition-all h-12 pr-12 font-medium"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 mt-2 rounded-xl text-sm border border-red-200 dark:border-red-800 flex items-start gap-2 animate-in fade-in zoom-in-95">
                                    <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                    <span className="leading-snug">{error}</span>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                                style={{
                                    transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                                    boxShadow: isHovered ? '0 12px 30px -5px rgba(22, 163, 74, 0.6)' : 'none',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    backgroundColor: isHovered ? '#15803d' : '#16a34a'
                                }}
                                className="w-full h-14 text-white font-bold text-lg rounded-xl mt-6 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Memproses Data...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Daftar Sekarang</span>
                                        <UserPlus className="w-5 h-5 opacity-80 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="mt-8 mb-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                   
                </div>
            </div>
        </div>
    );
}
