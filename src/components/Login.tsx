import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { LogIn, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import type { User } from '../types';
import { api } from '../services/api';
import { useTheme } from './theme-provider';

interface LoginProps {
  onLogin: (user: User) => void;
  onRegisterClick?: () => void;
  onBack?: () => void;
}

export function Login({ onLogin, onRegisterClick, onBack }: LoginProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isHoveredBack, setIsHoveredBack] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login({ email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err: any) {
      console.error('Login Error:', err);
      // Backend returns { error: 'Message' }
      const msg = err.response?.data?.error || err.message || 'Login gagal. Periksa koneksi atau kredensial.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300 relative overflow-hidden">
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
      <div className="absolute inset-0 pointer-events-none -z-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(0,0,0,0.15) 3px, transparent 0)',
          backgroundSize: '36px 36px'
        }}
      />
      <div className="absolute inset-0 pointer-events-none hidden dark:block -z-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.1) 3px, transparent 0)',
          backgroundSize: '36px 36px'
        }}
      />

      {/* Soft glowing ambient orbs */}
      <div
        className="absolute pointer-events-none rounded-full -z-10"
        style={{ top: '5%', left: '-5%', width: '600px', height: '600px', backgroundColor: 'rgba(52, 211, 153, 0.25)', filter: 'blur(120px)' }}
      />
      <div
        className="absolute pointer-events-none rounded-full -z-10"
        style={{ bottom: '5%', right: '-5%', width: '700px', height: '700px', backgroundColor: 'rgba(129, 140, 248, 0.25)', filter: 'blur(140px)' }}
      />
      <div
        className="absolute pointer-events-none rounded-full -z-10"
        style={{ top: '40%', left: '35%', width: '500px', height: '500px', backgroundColor: 'rgba(56, 189, 248, 0.2)', filter: 'blur(120px)' }}
      />

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <Card className="border-slate-200 dark:border-slate-800 !bg-white dark:!bg-slate-900 shadow-2xl">
          <CardHeader className="space-y-1 pb-6 text-center">
            <div className="w-12 h-12 bg-green-600 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-green-600/20 group hover:scale-105 transition-transform duration-300">
              <LogIn className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              Sistem Pendukung Keputusan
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Akses dashboard zakat produktif
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-7">
              <div className="space-y-4 text-left pt-1.5">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium">Email atau Username</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="Masukkan email"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  style={{
                    background: isDark ? '#1e293b' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                    color: isDark ? '#ffffff' : '#0f172a'
                  }}
                  className="focus:border-green-500 focus:ring-green-500/20 transition-all h-11"
                  required
                />
              </div>

              <div className="space-y-4 text-left pt-3" style={{ marginTop: '25px' }}>
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium">Kata Sandi</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    style={{
                      background: isDark ? '#1e293b' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                      color: isDark ? '#ffffff' : '#0f172a'
                    }}
                    className="focus:border-green-500 focus:ring-green-500/20 transition-all h-11 pr-10"
                    required
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

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  style={{
                    transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: isHovered ? '0 10px 25px -5px rgba(22, 163, 74, 0.5)' : 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    backgroundColor: isHovered ? '#15803d' : '#16a34a'
                  }}
                  className="w-full h-12 text-white font-bold text-base rounded-xl flex items-center justify-center gap-2 group mt-4 active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memverifikasi...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      Masuk Aplikasi
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <span className="text-slate-500 dark:text-slate-400 text-sm">Belum punya akun? </span>
              <button
                onClick={onRegisterClick}
                className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-semibold text-sm hover:underline transition-all"
              >
                Buat Akun Baru
              </button>
            </div>

            <div className="mt-8 text-center">
             
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
