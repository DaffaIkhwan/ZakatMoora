import { useState, useEffect } from 'react';
import { cn } from './ui/utils';
import { Button } from './ui/button';
import { ModeToggle } from './mode-toggle';
import { useTheme } from './theme-provider';
import { LogOut, Calculator, User as UserIcon } from 'lucide-react';
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

export function Navbar({ tabs, activeTab, setActiveTab, currentUser, onLogout }: NavbarProps) {
    const { theme } = useTheme();

    // Determine if dark mode is active
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Different colors for light and dark mode
    const activeTabBgColor = isDark ? '#1e293b' : '#0d6f4eb1'; // slate-800 for dark, green for light

    const getRoleBadge = () => {
        if (!currentUser) return null;
        const variants: Record<string, string> = {
            super_admin: 'bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-700',
            manajer: 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600',
            surveyor: 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700',
            mustahik: 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700',
        };
        const labels: Record<string, string> = {
            super_admin: 'Admin',
            manajer: 'Manajer',
            surveyor: 'Surveyor',
            mustahik: 'Mustahik',
        };
        const role = currentUser.role || 'mustahik';
        const variant = variants[role] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
        const label = labels[role] || role;
        return <Badge className={`font-medium shadow-sm text-xs ${variant}`}>{label}</Badge>;
    };

    return (
        <nav className="fixed z-50 w-full shadow-lg min-h-16 h-auto flex items-center justify-between px-4 sm:px-8 py-2 top-0 left-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">

            {/* Left: Brand Icon */}
            <div className="flex items-center gap-3 shrink-0">
                <span className="text-[clamp(1rem,2vw,1.2rem)] font-bold text-slate-900 dark:text-slate-100 hidden sm:block">
                    SPK Penerima Zakat Produktif berbasis MOORA
                </span>
            </div>

            {/* Center: Menu Items (Always Visible, Horizontal Scroll) */}
            <div className="flex items-center justify-start md:justify-center gap-1 lg:gap-2 flex-1 px-4 flex-wrap mx-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.value;
                    return (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={cn(
                                "flex items-center justify-center gap-2 px-3 lg:px-4 py-1.5 rounded-full transition-all duration-300",
                                "text-sm font-medium whitespace-nowrap shrink-0",
                                isActive
                                    ? "text-white shadow-md transform scale-105"
                                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105"
                            )}
                            style={isActive ? { backgroundColor: activeTabBgColor } : {}}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Right: Login/User Info */}
            <div className="flex items-center gap-3 shrink-0">
                <div className="hidden md:flex items-center gap-3">
                    <div className="flex flex-col items-end mr-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{currentUser.name}</span>
                        <div className="flex items-center gap-2">
                            {getRoleBadge()}
                        </div>
                    </div>
                </div>

                {/* Always visible toggle & logout */}
                <div className="flex items-center gap-2">
                    <ModeToggle />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onLogout}
                        className="rounded-full h-9 w-9 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 text-slate-500 dark:text-slate-400"
                    >
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </div>

        </nav>
    );
}