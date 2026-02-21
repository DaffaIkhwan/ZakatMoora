import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Users, FileText, CheckCircle, Clock, TrendingUp, AlertCircle, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import type { Mustahik, MonitoringData } from '../types';
import { useTheme } from './theme-provider';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface SurveyorDashboardProps {
    candidates: Mustahik[];
    monitoringData: MonitoringData[];
    onNavigate: (tab: string) => void;
}

export function SurveyorDashboard({ candidates, monitoringData, onNavigate }: SurveyorDashboardProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Calculate Stats
    const totalCandidates = candidates.length;
    const surveyedCandidates = candidates.filter(c =>
        c.subCriteria && Object.keys(c.subCriteria).length > 0
    ).length;
    const pendingSurvey = totalCandidates - surveyedCandidates;

    // Data for Pie Chart
    const surveyStatusData = [
        { name: 'Sudah Disurvei', value: surveyedCandidates, color: '#10b981' }, // emerald-500
        { name: 'Belum Disurvei', value: pendingSurvey, color: '#f59e0b' },   // amber-500
    ];


    // Calculate Income Monitoring Stats
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const inputtedCount = monitoringData.filter(m => {
        const mDate = new Date(m.monitoringDate);
        return mDate.getMonth() === currentMonth && mDate.getFullYear() === currentYear;
    }).reduce((acc, curr) => {
        if (!acc.includes(curr.mustahikId)) acc.push(curr.mustahikId);
        return acc;
    }, [] as string[]).length;

    const notInputtedCount = totalCandidates - inputtedCount;
    const inputData = [
        { name: 'Sudah Input', value: inputtedCount, fill: '#3b82f6' },
        { name: 'Belum Input', value: notInputtedCount, fill: '#e2e8f0' },
    ];


    return (
        <div className="space-y-6">
            {/* Header & Welcome Alert */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Dashboard Surveyor</h2>
                    <p className="text-slate-500 dark:text-slate-400">Selamat bekerja, pantau progres survei Anda di sini.</p>
                </div>
                <Button onClick={() => onNavigate('mustahik')} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:scale-105">
                    <FileText className="w-4 h-4 mr-2" />
                    Input Survei Baru
                </Button>
            </div>

            {/* Top Section: Total Data & Alert */}
            <div className={`grid gap-4 ${pendingSurvey > 0 ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
                {/* Total Data Summary - Always Visible */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm h-full">
                    <div className="flex flex-row items-center justify-between p-6 h-full">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-slate-500">Total Data Masuk</p>
                            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalCandidates}</div>
                            <p className="text-xs text-slate-500">Calon mustahik terdaftar dalam sistem</p>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </Card>

                {/* Enhanced Alert - Conditional */}
                {pendingSurvey > 0 && (
                    <div className="relative overflow-hidden rounded-xl border-l-4 border-l-red-500 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md hover:shadow-lg transition-all p-4 h-full flex items-center group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                        <div className="relative flex items-center gap-4 w-full">
                            <div className="relative">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
                                <div className="relative p-2.5 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
                                    <AlertCircle className="h-6 w-6" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-red-600 dark:text-red-400 mb-0.5 flex items-center gap-2">
                                    PERHATIAN: TUGAS MENUNGGU
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-normal">
                                    Ada <span className="font-extrabold text-red-600 dark:text-red-400 text-base">{pendingSurvey}</span> data mustahik yang belum lengkap. <span className="font-medium underline decoration-red-300 decoration-2 underline-offset-2">Segera lengkapi!</span>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Detailed Stats Grid - 4 Columns */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Survey Stats (Aligns with Survey Chart) */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Sudah Disurvei</CardTitle>
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 transition-colors">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{surveyedCandidates}</div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2">
                            <div
                                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000"
                                style={{ width: `${totalCandidates > 0 ? (surveyedCandidates / totalCandidates) * 100 : 0}%` }}
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            {totalCandidates > 0 ? Math.round((surveyedCandidates / totalCandidates) * 100) : 0}% selesai
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Pending Survei</CardTitle>
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40 transition-colors">
                            <Clock className="h-4 w-4 text-amber-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{pendingSurvey}</div>
                        <p className="text-xs text-slate-500">Menunggu penilaian</p>
                    </CardContent>
                </Card>

                {/* Income Stats (Aligns with Income Chart) */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Sudah Input</CardTitle>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                            <Activity className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{inputtedCount}</div>
                        <p className="text-xs text-slate-500">Pendapatan masuk</p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Belum Input</CardTitle>
                        <div className="p-2 bg-slate-50 dark:bg-slate-900/20 rounded-lg group-hover:bg-slate-100 dark:group-hover:bg-slate-900/40 transition-colors">
                            <Clock className="h-4 w-4 text-slate-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{notInputtedCount}</div>
                        <p className="text-xs text-slate-500">Belum update data</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Status Pie Chart */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-violet-100 dark:bg-violet-900/20 rounded-md">
                                <PieChartIcon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                            </div>
                            <CardTitle className="text-base">Status Kelengkapan Data</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 pb-4">
                        {totalCandidates === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[300px] text-slate-400 text-sm">
                                <PieChartIcon className="w-10 h-10 mb-2 opacity-20" />
                                Belum ada data mustahik
                            </div>
                        ) : (
                            <div className="h-[300px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={surveyStatusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {surveyStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={2} stroke={isDark ? '#0f172a' : '#fff'} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: isDark ? '#1e293b' : '#fff',
                                                borderRadius: '12px',
                                                border: '1px solid ' + (isDark ? '#334155' : '#e2e8f0'),
                                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                            }}
                                            itemStyle={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 600 }}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            iconType="circle"
                                            iconSize={8}
                                            formatter={(value) => <span className="text-xs font-medium text-slate-600 dark:text-slate-400 ml-1">{value}</span>}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Income Monitoring Pie Chart */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/20 rounded-md">
                                <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <CardTitle className="text-base">Status Input Pendapatan</CardTitle>
                        </div>
                        <CardDescription>Periode: {new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 pb-4">
                        <div className="h-[300px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={inputData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {inputData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={2} stroke={isDark ? '#0f172a' : '#fff'} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: isDark ? '#1e293b' : '#fff',
                                            borderRadius: '12px',
                                            border: '1px solid ' + (isDark ? '#334155' : '#e2e8f0'),
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                        }}
                                        itemStyle={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 600 }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        iconSize={8}
                                        formatter={(value) => <span className="text-xs font-medium text-slate-600 dark:text-slate-400 ml-1">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div >
    );
}
