import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { UserPlus, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import type { User } from '../types';
import { api } from '../services/api';

interface RegisterProps {
    onRegisterSuccess: (user: User) => void;
    onBack: () => void;
}

export function Register({ onRegisterSuccess, onBack }: RegisterProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        address: '',
        phone: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 dark:opacity-20 pointer-events-none"></div>

            <div className="w-full max-w-lg relative z-10 animate-in fade-in zoom-in-95 duration-500">
                <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/90 shadow-2xl backdrop-blur-sm">
                    <CardHeader className="space-y-1 pb-6 text-center relative">
                        <div className="absolute left-6 top-6">
                            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-600/20 group hover:scale-105 transition-transform duration-300">
                            <UserPlus className="w-6 h-6 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                            Buat Akun Baru
                        </CardTitle>
                        <CardDescription className="text-slate-500 dark:text-slate-400">
                            Daftar sebagai Mustahik untuk mengajukan bantuan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2 text-left">
                                <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-medium">Nama Lengkap</Label>
                                <Input
                                    id="name"
                                    placeholder="Nama sesuai KTP"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all h-11"
                                />
                            </div>

                            <div className="space-y-2 text-left">
                                <Label htmlFor="address" className="text-slate-700 dark:text-slate-300 font-medium">Alamat Lengkap</Label>
                                <Input
                                    id="address"
                                    placeholder="Alamat domisili saat ini"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all h-11"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 text-left">
                                    <Label htmlFor="phone" className="text-slate-700 dark:text-slate-300 font-medium">Nomor Telepon / WA</Label>
                                    <Input
                                        id="phone"
                                        placeholder="08xxxxxxxxxx"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all h-11"
                                    />
                                </div>
                                <div className="space-y-2 text-left">
                                    <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="nama@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all h-11"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 text-left">
                                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium">Kata Sandi</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Minimal 6 karakter"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all h-11 pr-10"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm border border-red-200 dark:border-red-800 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all hover:-translate-y-0.5 mt-6"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Memproses...
                                    </span>
                                ) : 'Daftar Sekarang'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
