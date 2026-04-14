import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Calculator, Award, Info, Database, Gift, History, LogOut, Shield, BarChart, TrendingUp, Heart, Loader2, ArrowLeft } from 'lucide-react';
import { CriteriaInfo, DEFAULT_CRITERIA } from './components/CriteriaInfo';
import { MustahikDatabase } from './components/MustahikDatabase';
import { AidPrograms } from './components/AidPrograms';
import { RecipientTracking } from './components/RecipientTracking';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { LandingPage } from './components/LandingPage';
import { UserManagement } from './components/UserManagement';
import { DashboardModule } from './components/DashboardModule';
import { SurveyorDashboard } from './components/SurveyorDashboard';
import { Dashboard } from './components/Dashboard';
import { MonitoringModule } from './components/MonitoringModule';
import { CriteriaManager } from './components/CriteriaManager';
import { MuzakkiDashboard } from './components/MuzakkiDashboard';
import { MuzakkiManagement } from './components/MuzakkiManagement';
import { ProgramCandidates } from './components/ProgramCandidates';
import { PaymentCallback } from './components/PaymentCallback';
import Loader from './components/Loader';
import type { Mustahik, AidProgram, RecipientHistory, User, MonitoringData, Criterion, Muzakki, MuzakkiDashboardData } from './types';
import { api } from './services/api';
import { useTheme } from './components/theme-provider';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { useConfirm } from './hooks/use-confirm';

export default function App() {
  // ── Payment Callback Pages (Midtrans Redirect) ──
  const pathname = window.location.pathname;
  if (pathname === '/payment/finish') {
    return <PaymentCallback type="finish" onGoToDashboard={() => { window.location.href = '/'; }} />;
  }
  if (pathname === '/payment/unfinish') {
    return <PaymentCallback type="unfinish" onGoToDashboard={() => { window.location.href = '/'; }} />;
  }
  if (pathname === '/payment/error') {
    return <PaymentCallback type="error" onGoToDashboard={() => { window.location.href = '/'; }} />;
  }

  const [mustahikList, setMustahikList] = useState<Mustahik[]>([]);
  const [aidPrograms, setAidPrograms] = useState<AidProgram[]>([]);
  const [recipientHistory, setRecipientHistory] = useState<RecipientHistory[]>([]);
  const [monitoringData, setMonitoringData] = useState<MonitoringData[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [muzakkis, setMuzakkis] = useState<Muzakki[]>([]);
  const [muzakkiDashboardData, setMuzakkiDashboardData] = useState<MuzakkiDashboardData | null>(null);
  const [isMuzakkiDashboardLoading, setIsMuzakkiDashboardLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Only for initial auto-login check
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [showLogin, setShowLogin] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

  // Criteria State
  const [criteriaList, setCriteriaList] = useState<Criterion[]>(() => {
    try {
      const saved = localStorage.getItem('criteriaList');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].code) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load criteria:', e);
    }
    return DEFAULT_CRITERIA;
  });
  const [isManagingCriteria, setIsManagingCriteria] = useState(false);

  // Save criteria to localStorage
  useEffect(() => {
    localStorage.setItem('criteriaList', JSON.stringify(criteriaList));
  }, [criteriaList]);

  // Responsive state for navbar
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-login
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // Fetch data — parallel calls with safety timeout
  useEffect(() => {
    if (currentUser) {
      const fetchData = async () => {
        setIsDataLoading(true);

        // Safety timeout: hide overlay after 10s max
        const safetyTimer = setTimeout(() => {
          setIsDataLoading(false);
          setIsMuzakkiDashboardLoading(false);
        }, 10000);

        try {
          const promises: Promise<void>[] = [];

          // Common data for all authenticated roles
          if (['super_admin', 'manajer', 'surveyor', 'mustahik', 'muzakki'].includes(currentUser.role)) {
            promises.push(
              api.getMustahik().then(m => setMustahikList(Array.isArray(m) ? m : [])).catch(e => console.error('Error fetching mustahik:', e)),
              api.getPrograms().then(p => setAidPrograms(Array.isArray(p) ? p : [])).catch(e => console.error('Error fetching programs:', e)),
              api.getCriteria().then(c => setCriteriaList(Array.isArray(c) ? c : DEFAULT_CRITERIA)).catch(e => console.error('Error fetching criteria:', e)),
              api.getHistory().then(h => setRecipientHistory(Array.isArray(h) ? h : [])).catch(e => console.error('Error fetching history:', e)),
              api.getMonitoring().then(mon => setMonitoringData(Array.isArray(mon) ? mon : [])).catch(e => console.error('Error fetching monitoring:', e)),
            );
          }

          // Admin/manager-only data
          if (['super_admin', 'manajer'].includes(currentUser.role)) {
            promises.push(
              api.getUsers().then(u => setUsers(Array.isArray(u) ? u : [])).catch(e => console.error('Error fetching users:', e)),
              api.getMuzakkis().then(mzk => setMuzakkis(Array.isArray(mzk) ? mzk : [])).catch(e => console.error('Error fetching muzakkis:', e)),
            );
          }

          // Muzakki dashboard
          if (currentUser.role === 'muzakki') {
            setIsMuzakkiDashboardLoading(true);
            promises.push(
              api.getMuzakkiDashboard().then(md => setMuzakkiDashboardData(md || null)).catch(e => console.error('Error fetching muzakki dashboard:', e)).finally(() => setIsMuzakkiDashboardLoading(false)),
            );
          }

          await Promise.allSettled(promises);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          clearTimeout(safetyTimer);
          setIsDataLoading(false);
        }
      };
      fetchData();
    }
  }, [currentUser]);

  const refreshGlobalData = async () => {
    if (!currentUser) return;
    try {
      if (['super_admin', 'manajer', 'surveyor', 'mustahik', 'muzakki'].includes(currentUser.role)) {
        const m = await api.getMustahik();
        setMustahikList(Array.isArray(m) ? m : []);
        const p = await api.getPrograms();
        setAidPrograms(Array.isArray(p) ? p : []);
        const c = await api.getCriteria();
        setCriteriaList(Array.isArray(c) ? c : DEFAULT_CRITERIA);
        const h = await api.getHistory();
        setRecipientHistory(Array.isArray(h) ? h : []);
        const mon = await api.getMonitoring();
        setMonitoringData(Array.isArray(mon) ? mon : []);

        if (currentUser.role === 'muzakki') {
          const md = await api.getMuzakkiDashboard();
          setMuzakkiDashboardData(md || null);
        }
      }
      if (['super_admin', 'manajer'].includes(currentUser.role)) {
        const u = await api.getUsers();
        setUsers(Array.isArray(u) ? u : []);
        const mzk = await api.getMuzakkis();
        setMuzakkis(Array.isArray(mzk) ? mzk : []);
      }
    } catch (e) {
      console.error('Refresh failed:', e);
    }
  };

  // CRUD Operations
  const addMustahik = async (mustahik: Mustahik) => {
    try {
      const newItem = await api.createMustahik(mustahik);
      setMustahikList(prev => [...prev, newItem]);
      toast.success('Mustahik berhasil ditambahkan');
    } catch (e) {
      console.error(e);
      toast.error('Gagal menambahkan mustahik');
    }
  };

  const updateMustahik = async (id: string, updatedMustahik: Mustahik) => {
    try {
      const updated = await api.updateMustahik(id, updatedMustahik);
      setMustahikList(prev => prev.map(m => m.id === id ? updated : m));
      toast.success('Data mustahik berhasil diperbarui');
    } catch (e) {
      console.error(e);
      toast.error('Gagal memperbarui data mustahik');
    }
  };

  const deleteMustahik = async (id: string) => {
    try {
      await api.deleteMustahik(id);
      setMustahikList(prev => prev.filter(m => m.id !== id));
      toast.success('Mustahik berhasil dihapus');
    } catch (e) {
      console.error(e);
      toast.error('Gagal menghapus mustahik');
    }
  };

  const addAidProgram = async (program: AidProgram) => {
    try {
      const newItem = await api.createProgram(program);
      setAidPrograms(prev => [...prev, newItem]);
      toast.success('Program baru berhasil dibuat');
    } catch (e) {
      console.error(e);
      toast.error('Gagal membuat program');
    }
  };

  const updateAidProgram = async (id: string, updatedProgram: AidProgram) => {
    try {
      const updated = await api.updateProgram(id, updatedProgram);
      setAidPrograms(prev => prev.map(p => p.id === id ? updated : p));
      toast.success('Program berhasil diperbarui');
    } catch (e) {
      console.error(e);
      toast.error('Gagal memperbarui program');
    }
  };

  const deleteAidProgram = async (id: string) => {
    try {
      await api.deleteProgram(id);
      setAidPrograms(prev => prev.filter(p => p.id !== id));
      toast.success('Program berhasil dihapus');
    } catch (e) {
      console.error(e);
      toast.error('Gagal menghapus program');
    }
  };

  const addRecipientHistory = async (history: RecipientHistory) => {
    try {
      const newItem = await api.createHistory(history);
      setRecipientHistory(prev => [...prev, newItem]);
      toast.success('Histori penerima berhasil disimpan');
    } catch (e) {
      console.error(e);
      toast.error('Gagal menyimpan histori penerima');
    }
  };

  const addMonitoringData = async (data: MonitoringData) => {
    try {
      const newItem = await api.createMonitoring(data);
      setMonitoringData(prev => [...prev, newItem]);
      toast.success('Data monitoring berhasil disimpan');
    } catch (e) {
      console.error(e);
      toast.error('Gagal menyimpan monitoring');
    }
  };

  const addUser = async (user: User) => {
    try {
      const newItem = await api.addUser(user);
      setUsers(prev => [...prev, newItem]);
      toast.success('User baru berhasil ditambahkan');
    } catch (e) {
      console.error(e);
      toast.error('Gagal menambahkan user');
    }
  };

  const updateUser = async (id: string, updatedUser: User) => {
    try {
      const updated = await api.updateUser(id, updatedUser);
      setUsers(prev => prev.map(u => u.id === id ? updated : u));
      toast.success('Data user berhasil diperbarui');
    } catch (e) {
      console.error(e);
      toast.error('Gagal memperbarui data user');
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await api.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success('User berhasil dihapus');
    } catch (e) {
      console.error(e);
      toast.error('Gagal menghapus user');
    }
  };

  const handleLogin = (user: User) => setCurrentUser(user);

  const { confirm } = useConfirm();

  const handleLogout = () => {
    confirm({
      title: "Konfirmasi Logout",
      description: "Apakah Anda yakin ingin keluar dari sistem?",
      confirmText: "Keluar Sekarang",
      variant: "destructive",
      onConfirm: () => {
        setCurrentUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setMustahikList([]);
        setAidPrograms([]);
        setRecipientHistory([]);
        setMonitoringData([]);
        setMuzakkis([]);
        toast.info('Anda telah keluar dari sistem');
      }
    });
  };

  const can = (action: string) => {
    if (!currentUser) return false;
    const permissions: Record<string, string[]> = {
      super_admin: ['view_dashboard', 'manage_users', 'manage_programs', 'manage_mustahik', 'view_criteria', 'view_monitoring', 'view_tracking', 'view_about'],
      manajer: ['view_dashboard', 'manage_users', 'manage_programs', 'manage_mustahik', 'view_tracking', 'view_criteria', 'view_monitoring', 'view_about'],
      surveyor: ['view_dashboard', 'manage_mustahik_criteria'],
      mustahik: ['view_dashboard', 'view_monitoring', 'view_about'],
      muzakki: ['view_dashboard', 'view_tracking', 'view_about'],
    };
    return permissions[currentUser.role]?.includes(action) || false;
  };

  const handleUpdateCriteria = async (newList: Criterion[]) => {
    try {
      await api.updateCriteria(newList);
      setCriteriaList(newList);
      toast.success('Kriteria berhasil diperbarui');
    } catch (e) {
      console.error(e);
      toast.error('Gagal memperbarui kriteria');
    }
  };


  const tabs: { value: string; label: string; icon: any }[] = [];
  if (can('view_dashboard')) tabs.push({ value: 'dashboard', label: 'Dashboard', icon: BarChart });
  if (can('manage_programs') || can('view_programs')) tabs.push({ value: 'programs', label: 'Program', icon: Gift });
  if (can('manage_mustahik') || can('manage_mustahik_criteria') || can('add_mustahik') || can('view_mustahik')) tabs.push({ value: 'mustahik', label: 'Mustahik', icon: Database });
  if (can('view_monitoring')) tabs.push({ value: 'monitoring', label: 'Monitoring', icon: TrendingUp });
  if (can('view_tracking')) tabs.push({ value: 'tracking', label: 'Tracking', icon: History });
  if (can('view_criteria')) tabs.push({ value: 'criteria', label: 'Kriteria', icon: Info });
  if (can('manage_users')) tabs.push({ value: 'users', label: 'Pengguna', icon: Shield });
  if (can('manage_programs')) tabs.push({ value: 'muzakki', label: 'Muzakki', icon: Heart });

  // Update active tab if current tab is not allowed
  useEffect(() => {
    if (tabs.length > 0 && !tabs.find(t => t.value === activeTab) && activeTab !== 'manage-program') {
      setActiveTab(tabs[0].value);
    }
  }, [currentUser, tabs, activeTab]);

  if (isLoading) {
    return <Loader />;
  }

  if (!currentUser) {
    if (authView === 'register') {
      return (
        <Register
          onRegisterSuccess={handleLogin}
          onBack={() => setAuthView('login')}
        />
      );
    }
    if (showLogin) {
      return (
        <Login onLogin={handleLogin} onRegisterClick={() => setAuthView('register')} onBack={() => setShowLogin(false)} />
      );
    }
    return (
      <LandingPage onLoginClick={() => setShowLogin(true)} />
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden">
        {/* Premium Background Effects */}
        <div className="fixed inset-0 pointer-events-none z-0 bg-fixed"
          style={{
            backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(0,0,0,0.15) 3px, transparent 0)',
            backgroundSize: '36px 36px'
          }}
        />
        <div className="fixed inset-0 pointer-events-none hidden dark:block z-0 bg-fixed"
          style={{
            backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.1) 3px, transparent 0)',
            backgroundSize: '36px 36px'
          }}
        />

        {/* Soft glowing ambient orbs */}
        <div
          className="fixed pointer-events-none rounded-full z-0"
          style={{ top: '5%', left: '-5%', width: '600px', height: '600px', backgroundColor: 'rgba(52, 211, 153, 0.25)', filter: 'blur(120px)' }}
        />
        <div
          className="fixed pointer-events-none rounded-full z-0"
          style={{ bottom: '5%', right: '-5%', width: '700px', height: '700px', backgroundColor: 'rgba(129, 140, 248, 0.25)', filter: 'blur(140px)' }}
        />
        <div
          className="fixed pointer-events-none rounded-full z-0"
          style={{ top: '40%', left: '35%', width: '500px', height: '500px', backgroundColor: 'rgba(56, 189, 248, 0.2)', filter: 'blur(120px)' }}
        />

        <Navbar
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser!}
          onLogout={handleLogout}
        />

        <main className="w-full mx-auto px-2 sm:px-4 md:px-6 mt-24 md:mt-28 pb-8 space-y-4 sm:space-y-6 max-w-7xl animate-in fade-in zoom-in-95 duration-500 relative z-0 isolate overflow-x-hidden">
          {activeTab === 'dashboard' && can('view_dashboard') && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {currentUser!.role === 'muzakki' ? (
                <MuzakkiDashboard
                  initialData={muzakkiDashboardData}
                  initialLoading={isMuzakkiDashboardLoading}
                  onRefresh={refreshGlobalData}
                />
              ) : currentUser!.role === 'surveyor' ? (
                <SurveyorDashboard
                  candidates={mustahikList}
                  monitoringData={monitoringData}
                  onNavigate={setActiveTab}
                />
              ) : (
                <>
                    <DashboardModule
                      monitoringData={monitoringData}
                      recipientHistory={recipientHistory}
                      aidPrograms={aidPrograms}
                      onNavigate={setActiveTab}
                      onViewMonitoring={(monitoringId: string) => {
                        // Navigate to monitoring tab
                        setActiveTab('monitoring');
                        // Store the monitoring ID to be viewed (will need to be handled in MonitoringModule)
                        localStorage.setItem('viewMonitoringId', monitoringId);
                      }}
                      onViewMustahikHistory={(mustahikId: string) => {
                        setActiveTab('monitoring');
                        localStorage.setItem('viewMonitoringHistoryMustahikId', mustahikId);
                      }}
                      userRole={currentUser!.role}
                    />
                  {currentUser!.role !== 'mustahik' && (
                    <div className="mt-12 md:mt-20">
                      <Card className="!bg-white dark:!bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                          <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-100">Analisis Kelayakan Kandidat</CardTitle>
                          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                            Ringkasan analisis MOORA untuk semua kandidat yang terdaftar
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          <Dashboard candidates={mustahikList} criteriaList={criteriaList} recipientHistory={recipientHistory} />
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'programs' && (can('manage_programs') || can('view_programs')) && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <AidPrograms
                programs={aidPrograms}
                mustahikList={mustahikList}
                criteriaList={criteriaList}
                onAddProgram={addAidProgram}
                onUpdateProgram={updateAidProgram}
                onDeleteProgram={deleteAidProgram}
                onAddRecipientHistory={addRecipientHistory}
                recipientHistory={recipientHistory}
                onAddMonitoring={addMonitoringData}
                userRole={currentUser!.role}
                onManageProgram={(programId) => {
                  setSelectedProgramId(programId);
                  setActiveTab('manage-program');
                }}
              />
            </div>
          )}

          {activeTab === 'manage-program' && selectedProgramId && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('programs')}
                  className="flex items-center gap-4 relative z-50 group border-none bg-transparent cursor-pointer"
                >
                  <div className="flex items-center justify-center p-3 rounded-full text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-white hover:bg-emerald-500/10 dark:hover:bg-emerald-400/20 hover:ring-4 hover:ring-emerald-400/10 transition-all duration-300 transform group-hover:scale-110 shadow-none group-hover:shadow-emerald-500/20">
                    <span className="inline-block transform transition-transform duration-300 ease-out group-hover:-translate-x-1">
                      <ArrowLeft className="w-6 h-6 font-bold" />
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                    Kembali ke Daftar Program
                  </span>
                </button>
              </div>
              {aidPrograms.find(p => p.id === selectedProgramId) && (
                <ProgramCandidates
                  program={aidPrograms.find(p => p.id === selectedProgramId)!}
                  mustahikList={mustahikList}
                  criteriaList={criteriaList}
                  onUpdateProgram={updateAidProgram}
                  onAddRecipientHistory={addRecipientHistory}
                  recipientHistory={recipientHistory}
                  onAddMonitoring={addMonitoringData}
                />
              )}
            </div>
          )}

          {activeTab === 'mustahik' && (can('manage_mustahik') || can('manage_mustahik_criteria') || can('add_mustahik') || can('view_mustahik')) && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <MustahikDatabase
                mustahikList={mustahikList}
                recipientHistory={recipientHistory}
                aidPrograms={aidPrograms}
                criteriaList={criteriaList}
                monitoringData={monitoringData}
                onAdd={addMustahik}
                onUpdate={updateMustahik}
                onDelete={deleteMustahik}
                onAddMonitoring={addMonitoringData}
                userRole={currentUser!.role}
              />
            </div>
          )}

          {activeTab === 'monitoring' && can('view_monitoring') && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <MonitoringModule
                monitoringData={monitoringData}
                recipientHistory={recipientHistory}
                aidPrograms={aidPrograms}
                onAdd={addMonitoringData}
                userRole={currentUser!.role}
                currentUser={currentUser!}
              />
            </div>
          )}

          {activeTab === 'tracking' && can('view_tracking') && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <RecipientTracking
                recipientHistory={recipientHistory}
                mustahikList={mustahikList}
                aidPrograms={aidPrograms}
              />
            </div>
          )}

          {activeTab === 'criteria' && can('view_criteria') && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {isManagingCriteria ? (
                <CriteriaManager
                  criteriaList={criteriaList}
                  onUpdate={handleUpdateCriteria}
                  onClose={() => setIsManagingCriteria(false)}
                />
              ) : (
                <CriteriaInfo
                  criteriaList={criteriaList}
                  userRole={currentUser!.role}
                  onManageCriteria={() => setIsManagingCriteria(true)}
                />
              )}
            </div>
          )}

          {activeTab === 'users' && can('manage_users') && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <UserManagement
                users={users}
                onAdd={addUser}
                onUpdate={updateUser}
                onDelete={deleteUser}
                currentUser={currentUser!}
              />
            </div>
          )}

          {activeTab === 'muzakki' && (can('manage_programs') || can('manage_users')) && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <MuzakkiManagement
                muzakkis={muzakkis}
                programs={aidPrograms}
                onRefresh={refreshGlobalData}
              />
            </div>
          )}

          {activeTab === 'about' && can('view_about') && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            </div>
          )}

          <div className="mt-12 text-center text-slate-500 border-t border-slate-200 pt-6"></div>
        </main>
      </div>
      {isDataLoading && <Loader overlay />}
      <Toaster position="top-center" richColors />
    </>
  );
}
