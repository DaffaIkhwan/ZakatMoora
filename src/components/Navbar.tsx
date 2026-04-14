import { useState, useEffect } from 'react';
import { cn } from './ui/utils';
import { Button } from './ui/button';
import { ModeToggle } from './mode-toggle';
import { useTheme } from './theme-provider';
import { LogOut, Calculator, User as UserIcon, Menu, X } from 'lucide-react';
import { Badge } from './ui/badge';
import type { User } from '../types';

interface Tab {
    value: string;
    label: string;
    icon: React.ElementType;
}

interface NavbarProps {
    tabs: Tab[];
    activeTab: string;
    setActiveTab: (tab: string) => void;
    currentUser: User;
    onLogout: () => void;
}

// Hook to detect screen width
function useIsDesktop(breakpoint = 768) {
    const [isDesktop, setIsDesktop] = useState(() =>
        typeof window !== 'undefined' ? window.innerWidth >= breakpoint : true
    );

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= breakpoint);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [breakpoint]);

    return isDesktop;
}

export function Navbar({ tabs, activeTab, setActiveTab, currentUser, onLogout }: NavbarProps) {
    const { theme } = useTheme();
    const [mobileOpen, setMobileOpen] = useState(false);
    const isDesktop = useIsDesktop();

    useEffect(() => {
        setMobileOpen(false);
    }, [activeTab]);

    // Close mobile menu when switching to desktop
    useEffect(() => {
        if (isDesktop) setMobileOpen(false);
    }, [isDesktop]);

    const getRoleBadge = () => {
        if (!currentUser) return null;
        // All badges use white bg + colored text for visibility on the green navbar
        const variants: Record<string, string> = {
            super_admin: 'bg-white text-emerald-700 border border-white/50',
            manajer: 'bg-white text-slate-700 border border-white/50',
            surveyor: 'bg-white text-emerald-700 border border-white/50',
            mustahik: 'bg-white text-emerald-700 border border-white/50',
            muzakki: 'bg-white text-emerald-700 border border-white/50',
        };
        const labels: Record<string, string> = {
            super_admin: 'Admin',
            manajer: 'Manajer',
            surveyor: 'Surveyor',
            mustahik: 'Mustahik',
            muzakki: 'Muzakki',
        };
        const role = currentUser.role || 'mustahik';
        const variant = variants[role] || 'bg-white text-slate-700 border border-white/50';
        const label = labels[role] || role;
        return (
            <Badge
                style={{
                    backgroundColor: 'white',
                    color: '#15803d',
                    borderColor: 'rgba(255,255,255,0.4)',
                    fontSize: '11px',
                    fontWeight: 600,
                }}
                className="shadow-sm"
            >
                {label}
            </Badge>
        );
    };

    return (
        <>
            {/* ===== NAVBAR ===== */}
            <nav
                style={{
                    backgroundColor: '#16a34a',
                    position: 'fixed',
                    zIndex: 9999,
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
                        padding: isDesktop ? '8px 32px' : '8px 16px',
                    }}
                >
                    {/* LEFT: Brand */}
                    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: isDesktop ? 'clamp(1rem, 2vw, 1.2rem)' : '0.875rem', fontWeight: 700, color: 'white' }}>
                            {isDesktop ? 'SPK Penerima Zakat Produktif' : 'SPK Zakat'}
                        </span>
                    </div>

                    {/* CENTER: Desktop Menu — horizontal row, ONLY on desktop */}
                    {isDesktop && (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                                flex: 1,
                                padding: '0 16px',
                                flexWrap: 'nowrap',
                            }}
                        >
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.value;
                                return (
                                    <button
                                        key={tab.value}
                                        onClick={() => setActiveTab(tab.value)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            padding: '6px 16px',
                                            borderRadius: '9999px',
                                            fontSize: '0.875rem',
                                            fontWeight: isActive ? 700 : 500,
                                            whiteSpace: 'nowrap',
                                            cursor: 'pointer',
                                            border: 'none',
                                            transition: 'all 0.3s ease',
                                            backgroundColor: isActive ? '#ffffff' : 'transparent',
                                            color: isActive ? '#15803d' : 'white',
                                            opacity: isActive ? 1 : 0.9,
                                            boxShadow: isActive ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
                                            transform: isActive ? 'scale(1.05)' : 'none',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                                                e.currentTarget.style.opacity = '1';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.opacity = '0.9';
                                            }
                                        }}
                                    >
                                        <Icon className="w-4 h-4" style={{ color: isActive ? '#15803d' : 'white' }} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* RIGHT: User info + controls */}
                    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* User info — desktop only */}
                        {isDesktop && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '8px' }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'white' }}>{currentUser.name}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {getRoleBadge()}
                                </div>
                            </div>
                        )}

                        {/* Toggle & logout */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ModeToggle />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onLogout}
                                style={{ color: 'white' }}
                                className="rounded-full h-9 w-9 hover:bg-white/20"
                            >
                                <LogOut className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Hamburger — mobile only */}
                        {!isDesktop && (
                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                style={{
                                    color: 'white',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '8px',
                                }}
                                className="hover:bg-white/20"
                                aria-label="Menu"
                            >
                                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* ===== MOBILE DROPDOWN ===== */}
            {!isDesktop && mobileOpen && (
                <>
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            zIndex: 9997,
                        }}
                        onClick={() => setMobileOpen(false)}
                    />
                    <div
                        style={{
                            position: 'fixed',
                            top: '64px',
                            left: 0,
                            right: 0,
                            zIndex: 9998,
                            maxHeight: 'calc(100vh - 64px)',
                            overflowY: 'auto',
                            backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                            borderBottom: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                        }}
                    >
                        {/* User info header */}
                        <div
                            style={{
                                padding: '12px 16px',
                                borderBottom: `1px solid ${theme === 'dark' ? '#1e293b' : '#f1f5f9'}`,
                                backgroundColor: theme === 'dark' ? '#1e293b80' : '#f8fafc',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                            }}
                        >
                            <div
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    backgroundColor: '#16a34a',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 700,
                                    fontSize: '1.125rem',
                                    flexShrink: 0,
                                }}
                            >
                                {currentUser.name.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 600, color: theme === 'dark' ? '#ffffff' : '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {currentUser.name}
                                </div>
                                <div style={{ marginTop: '2px' }}>{getRoleBadge()}</div>
                            </div>
                        </div>

                        {/* Nav items */}
                        <div style={{ padding: '8px' }}>
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.value;
                                return (
                                    <button
                                        key={tab.value}
                                        onClick={() => setActiveTab(tab.value)}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '12px',
                                            borderRadius: '12px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            marginBottom: '4px',
                                            transition: 'all 0.2s ease',
                                            backgroundColor: isActive
                                                ? (theme === 'dark' ? 'rgba(22,163,74,0.15)' : '#f0fdf4')
                                                : 'transparent',
                                            color: isActive
                                                ? (theme === 'dark' ? '#4ade80' : '#15803d')
                                                : (theme === 'dark' ? '#cbd5e1' : '#475569'),
                                            fontWeight: isActive ? 700 : 500,
                                            fontSize: '0.875rem',
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '8px',
                                                flexShrink: 0,
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                backgroundColor: isActive
                                                    ? '#16a34a'
                                                    : (theme === 'dark' ? '#1e293b' : '#ffffff'),
                                                color: isActive
                                                    ? '#ffffff'
                                                    : (theme === 'dark' ? '#94a3b8' : '#64748b'),
                                                border: isActive
                                                    ? 'none'
                                                    : `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
                                            }}
                                        >
                                            <Icon style={{ width: '16px', height: '16px' }} />
                                        </div>
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {tab.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
