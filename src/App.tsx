import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Calculator, Award, Info, Database, Gift, History, LogOut, Shield, BarChart, TrendingUp } from 'lucide-react';
import { CriteriaInfo, DEFAULT_CRITERIA } from './components/CriteriaInfo';
import { MustahikDatabase } from './components/MustahikDatabase';
import { AidPrograms } from './components/AidPrograms';
import { RecipientTracking } from './components/RecipientTracking';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { UserManagement } from './components/UserManagement';
import { DashboardModule } from './components/DashboardModule';
import { SurveyorDashboard } from './components/SurveyorDashboard';
import { Dashboard } from './components/Dashboard';
import { MonitoringModule } from './components/MonitoringModule';
import { CriteriaManager } from './components/CriteriaManager';
import type { Mustahik, AidProgram, RecipientHistory, User, MonitoringData, Criterion } from './types';
import { api } from './services/api';
import { ThemeProvider, useTheme } from './components/theme-provider';
import Loader from './components/Loader';

export default function App() {
  const [mustahikList, setMustahikList] = useState<Mustahik[]>([]);
  const [aidPrograms, setAidPrograms] = useState<AidProgram[]>([]);
  const [recipientHistory, setRecipientHistory] = useState<RecipientHistory[]>([]);
  const [monitoringData, setMonitoringData] = useState<MonitoringData[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

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

  // Fetch data
  useEffect(() => {
    if (currentUser) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          if (currentUser.role === 'super_admin') {
            try {
              const u = await api.getUsers();
              setUsers(u);
            } catch (e) { console.error('Error fetching users:', e); }
          }

          if (['super_admin', 'manajer', 'surveyor', 'mustahik'].includes(currentUser.role)) {
            try {
              const m = await api.getMustahik();
              setMustahikList(m);
            } catch (e) { console.error('Error fetching mustahik:', e); }

            try {
              const p = await api.getPrograms();
              setAidPrograms(p);
            } catch (e) { console.error('Error fetching programs:', e); }

            try {
              const c = await api.getCriteria();
              setCriteriaList(c);
            } catch (e) {
              console.error('Error fetching criteria:', e);
              // Fallback to local storage or default if API fails?
              // For now, let's trust the API or keep existing default initialization.
            }

            try {
              const h = await api.getHistory();
              setRecipientHistory(h);
            } catch (e) { console.error('Error fetching history:', e); }

            if (['super_admin', 'manajer', 'surveyor', 'mustahik'].includes(currentUser.role)) {
              try {
                const mon = await api.getMonitoring();
                setMonitoringData(mon);
              } catch (e) { console.error('Error fetching monitoring:', e); }
            }
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [currentUser]);

  // CRUD Operations
  const addMustahik = async (mustahik: Mustahik) => {
    try {
      const newItem = await api.createMustahik(mustahik);
      setMustahikList(prev => [...prev, newItem]);
    } catch (e) { console.error(e); alert('Gagal menambahkan mustahik'); }
  };

  const updateMustahik = async (id: string, updatedMustahik: Mustahik) => {
    try {
      const updated = await api.updateMustahik(id, updatedMustahik);
      setMustahikList(prev => prev.map(m => m.id === id ? updated : m));
    } catch (e) { console.error(e); alert('Gagal update mustahik'); }
  };

  const deleteMustahik = async (id: string) => {
    try {
      await api.deleteMustahik(id);
      setMustahikList(prev => prev.filter(m => m.id !== id));
    } catch (e) { console.error(e); alert('Gagal hapus mustahik'); }
  };

  const addAidProgram = async (program: AidProgram) => {
    try {
      const newItem = await api.createProgram(program);
      setAidPrograms(prev => [...prev, newItem]);
    } catch (e) { console.error(e); alert('Gagal buat program'); }
  };

  const updateAidProgram = async (id: string, updatedProgram: AidProgram) => {
    try {
      const updated = await api.updateProgram(id, updatedProgram);
      setAidPrograms(prev => prev.map(p => p.id === id ? updated : p));
    } catch (e) { console.error(e); alert('Gagal update program'); }
  };

  const deleteAidProgram = async (id: string) => {
    try {
      await api.deleteProgram(id);
      setAidPrograms(prev => prev.filter(p => p.id !== id));
    } catch (e) { console.error(e); alert('Gagal hapus program'); }
  };

  const addRecipientHistory = async (history: RecipientHistory) => {
    try {
      const newItem = await api.createHistory(history);
      setRecipientHistory(prev => [...prev, newItem]);
    } catch (e) { console.error(e); alert('Gagal simpan history'); }
  };

  const addMonitoringData = async (data: MonitoringData) => {
    try {
      const newItem = await api.createMonitoring(data);
      setMonitoringData(prev => [...prev, newItem]);
    } catch (e) { console.error(e); alert('Gagal simpan monitoring'); }
  };

  const addUser = async (user: User) => {
    try {
      const newItem = await api.addUser(user);
      setUsers(prev => [...prev, newItem]);
    } catch (e) { console.error(e); alert('Gagal tambah user'); }
  };

  const updateUser = async (id: string, updatedUser: User) => {
    try {
      const updated = await api.updateUser(id, updatedUser);
      setUsers(prev => prev.map(u => u.id === id ? updated : u));
    } catch (e) { console.error(e); alert('Gagal update user'); }
  };

  const deleteUser = async (id: string) => {
    try {
      await api.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (e) { console.error(e); alert('Gagal hapus user'); }
  };

  const handleLogin = (user: User) => setCurrentUser(user);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setMustahikList([]);
    setAidPrograms([]);
    setRecipientHistory([]);
    setMonitoringData([]);
  };

  const can = (action: string) => {
    if (!currentUser) return false;
    const permissions: Record<string, string[]> = {
      super_admin: ['view_dashboard', 'manage_users', 'manage_programs', 'manage_mustahik', 'view_criteria', 'view_monitoring', 'view_tracking', 'view_about'],
      manajer: ['view_dashboard', 'manage_users', 'manage_programs', 'view_mustahik', 'view_tracking', 'view_criteria', 'view_monitoring', 'view_about'],
      surveyor: ['view_dashboard', 'manage_mustahik_criteria'],
      mustahik: ['view_dashboard', 'view_monitoring', 'view_about'],
    };
    return permissions[currentUser.role]?.includes(action) || false;
  };

  const handleUpdateCriteria = async (newList: Criterion[]) => {
    try {
      await api.updateCriteria(newList);
      setCriteriaList(newList);
      // Optional: Show success toast
    } catch (e) {
      console.error(e);
      alert('Gagal update kriteria');
    }
  };

  // Determine if dark mode
  const savedTheme = localStorage.getItem('spk-zakat-theme') || 'light';
  const isDark = savedTheme === 'dark' || (savedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const tabs: { value: string; label: string; icon: any }[] = [];
  if (can('view_dashboard')) tabs.push({ value: 'dashboard', label: 'Dashboard', icon: BarChart });
  if (can('manage_programs') || can('view_programs')) tabs.push({ value: 'programs', label: 'Program', icon: Gift });
  if (can('manage_mustahik') || can('manage_mustahik_criteria') || can('add_mustahik') || can('view_mustahik')) tabs.push({ value: 'mustahik', label: 'Mustahik', icon: Database });
  if (can('view_monitoring')) tabs.push({ value: 'monitoring', label: 'Monitoring', icon: TrendingUp });
  if (can('view_tracking')) tabs.push({ value: 'tracking', label: 'Tracking', icon: History });
  if (can('view_criteria')) tabs.push({ value: 'criteria', label: 'Kriteria', icon: Info });
  if (can('manage_users')) tabs.push({ value: 'users', label: 'Pengguna', icon: Shield });

  // Update active tab if current tab is not allowed
  useEffect(() => {
    if (tabs.length > 0 && !tabs.find(t => t.value === activeTab)) {
      setActiveTab(tabs[0].value);
    }
  }, [currentUser, tabs, activeTab]);

  if (isLoading) {
    return <Loader isDark={isDark} />;
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
    return <Login onLogin={handleLogin} onRegisterClick={() => setAuthView('register')} />;
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <Navbar
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser!}
          onLogout={handleLogout}
        />

        <main className="container mx-auto px-4 mt-24 pb-8 space-y-6 max-w-7xl animate-in fade-in zoom-in-95 duration-500 relative z-0 isolate">
          {activeTab === 'dashboard' && can('view_dashboard') && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {currentUser!.role === 'surveyor' ? (
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
                    userRole={currentUser!.role}
                  />
                  {currentUser!.role !== 'mustahik' && (
                    <div className="mt-8">
                      <Card className="border-slate-200">
                        <CardHeader className="bg-slate-50 border-b border-slate-100">
                          <CardTitle className="text-sm font-semibold text-slate-800">Analisis Kelayakan Kandidat</CardTitle>
                          <CardDescription className="text-xs text-slate-500">
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
              />
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

          {activeTab === 'about' && can('view_about') && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            </div>
          )}

          <div className="mt-12 text-center text-slate-500 border-t border-slate-200 pt-6"></div>
        </main>
      </div>
    </ThemeProvider>
  );
}