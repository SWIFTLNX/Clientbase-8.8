
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Sparkles, 
  Menu, 
  X,
  TrendingUp,
  DollarSign,
  Briefcase,
  ChevronLeft,
  Brain,
  Clock,
  Instagram,
  CalendarDays,
  Moon,
  Sun,
  CheckCircle,
  CreditCard,
  Zap,
  Star,
  Download,
  Upload,
  ShieldCheck,
  Settings as SettingsIcon,
  Globe,
  Lock,
  Smartphone,
  FileText,
  MessageCircle,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Printer,
  ChevronRight,
  Unlock
} from 'lucide-react';
import { View, Appointment, ServiceType, LeadSource, EmpireSettings } from './types';
import { APP_NAME, LOCATION, CURRENCIES } from './constants';
import { getGlowInsights } from './services/geminiService';

const INITIAL_APPS: Appointment[] = [
  { 
    id: 'layi-001', 
    clientId: 'investor-1', 
    clientName: 'Investor LAYI', 
    clientPhone: '2347049162532',
    socialContactName: '@investorlayi',
    leadSource: 'Instagram',
    service: ServiceType.LASH_EXTENSION, 
    date: new Date().toISOString().split('T')[0], 
    time: '12:00', 
    amountPaid: 15000, 
    totalPrice: 30000, 
    status: 'confirmed',
    notes: 'Premium set, extra volume'
  }
];

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('baddieglow_empire_v2');
    return saved ? (JSON.parse(saved) as Appointment[]) : INITIAL_APPS;
  });
  
  // Vault & Settings State
  const [vaultPasscode, setVaultPasscode] = useState(() => localStorage.getItem('glow_vault_code') || '');
  const [ownerContact, setOwnerContact] = useState(() => {
    const saved = localStorage.getItem('glow_owner_contact');
    return saved ? JSON.parse(saved) : { email: '', phone: '' };
  });
  const [passcodeInput, setPasscodeInput] = useState('');
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [vaultAction, setVaultAction] = useState<View | 'export' | 'reveal' | null>(null);
  const [isVaultUnlockedForSession, setIsVaultUnlockedForSession] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('glow_theme') === 'dark');
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('glow_currency');
    return saved ? JSON.parse(saved) : CURRENCIES[0];
  });
  const [selectedClientName, setSelectedClientName] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateInsights = async () => {
    setLoadingAi(true);
    try {
      const insight = await getGlowInsights(appointments);
      setAiInsight(insight || 'Could not generate insights at this moment. Keep shining, Baddie!');
      setActiveView('ai-insights');
    } catch (error) {
      console.error(error);
      setAiInsight('Could not generate insights at this moment. Keep shining, Baddie!');
    } finally {
      setLoadingAi(false);
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('baddieglow_empire_v2', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('glow_vault_code', vaultPasscode);
    localStorage.setItem('glow_owner_contact', JSON.stringify(ownerContact));
  }, [vaultPasscode, ownerContact]);

  useEffect(() => {
    localStorage.setItem('glow_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('glow_currency', JSON.stringify(currency));
  }, [currency]);

  const stats = useMemo(() => {
    const filteredApps = appointments.filter(a => a.date === selectedDate);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlyApps = appointments.filter(a => {
      const d = new Date(a.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const totalRevenue = monthlyApps.reduce((sum, a) => sum + a.totalPrice, 0);
    const totalDeposits = monthlyApps.reduce((sum, a) => sum + a.amountPaid, 0);
    const totalBalance = totalRevenue - totalDeposits;
    const uniqueBaddies = new Set(monthlyApps.map(a => a.clientName)).size;
    return { filteredApps, totalRevenue, totalDeposits, totalBalance, uniqueBaddies };
  }, [appointments, selectedDate]);

  const handleUpdateStatus = (id: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(a => {
      if (a.id === id) {
        const amount = status === 'completed' ? a.totalPrice : a.amountPaid;
        return { ...a, status, amountPaid: amount };
      }
      return a;
    }));
  };

  const attemptVaultAccess = (action: View | 'export' | 'reveal') => {
    if (!vaultPasscode || isVaultUnlockedForSession) {
      if (action === 'reveal') {
        setIsVaultUnlockedForSession(true);
      } else {
        setActiveView(action === 'export' ? activeView : action);
        if (action === 'export') backupData();
      }
      return;
    }
    setVaultAction(action);
    setShowPasscodeModal(true);
  };

  const verifyPasscode = () => {
    if (passcodeInput === vaultPasscode) {
      setShowPasscodeModal(false);
      setPasscodeInput('');
      if (vaultAction === 'reveal') {
        setIsVaultUnlockedForSession(true);
      } else if (vaultAction === 'export') {
        backupData();
      } else if (vaultAction) {
        setActiveView(vaultAction as View);
      }
      setVaultAction(null);
    } else {
      alert("Invalid Passcode. Access Denied.");
      setPasscodeInput('');
    }
  };

  const backupData = () => {
    const dataStr = JSON.stringify(appointments);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `baddieglow_backup_${new Date().toISOString().split('T')[0]}.json`);
    linkElement.click();
  };

  const sendWhatsAppReport = () => {
    const reportDate = new Date().toLocaleDateString();
    const text = `*BADDIEGLOW DAILY REPORT - ${reportDate}*\n\n` +
      `✨ Total Baddies: ${stats.uniqueBaddies}\n` +
      `💰 Gross Revenue: ${currency.symbol}${stats.totalRevenue.toLocaleString()}\n` +
      `🏦 Cash Deposits: ${currency.symbol}${stats.totalDeposits.toLocaleString()}\n` +
      `🚨 Balance Due: ${currency.symbol}${stats.totalBalance.toLocaleString()}\n\n` +
      `_Generated via Baddieglow Empire Suite_`;
    const encoded = encodeURIComponent(text);
    const phone = ownerContact.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  };

  const NavItem = ({ view, icon: Icon, label, isLocked = false }: { view: View, icon: any, label: string, isLocked?: boolean }) => (
    <button 
      onClick={() => { 
        if (isLocked) attemptVaultAccess(view);
        else { setActiveView(view); setSelectedClientName(null); setIsSidebarOpen(false); }
      }}
      className={`flex items-center space-x-3 w-full p-4 rounded-2xl transition-all duration-300 ${
        activeView === view && !selectedClientName
          ? 'bg-pink-600 text-white shadow-lg' 
          : 'text-slate-500 dark:text-slate-400 hover:bg-pink-50 dark:hover:bg-slate-800'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-bold tracking-tight text-sm flex-1 text-left">{label}</span>
      {isLocked && vaultPasscode && <Lock size={12} className="opacity-40" />}
    </button>
  );

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${isDarkMode ? 'dark bg-slate-950' : 'bg-[#fafafa]'}`}>
      
      {/* Passcode Modal */}
      {showPasscodeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl w-full max-w-sm text-center border border-slate-100 dark:border-slate-800">
             <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 text-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lock size={32} />
             </div>
             <h3 className="text-2xl font-black dark:text-white tracking-tighter mb-2">Vault Locked</h3>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">Enter Empire Passcode</p>
             <input 
              type="password" 
              autoFocus
              maxLength={4}
              value={passcodeInput}
              onChange={(e) => setPasscodeInput(e.target.value)}
              className="w-full text-center text-4xl tracking-[1em] font-black p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-8 dark:text-white border-none outline-none"
             />
             <div className="grid grid-cols-2 gap-4">
               <button onClick={() => setShowPasscodeModal(false)} className="py-4 font-black uppercase text-[10px] tracking-widest text-slate-400">Cancel</button>
               <button onClick={verifyPasscode} className="py-4 bg-pink-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">Unlock</button>
             </div>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <div className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 p-4 flex justify-between items-center sticky top-0 z-50 no-print">
        <div className="flex items-center space-x-2">
          <Sparkles className="text-pink-600 w-5 h-5" />
          <span className="text-lg font-black tracking-tighter dark:text-white uppercase">{APP_NAME}</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 rounded-lg">
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-6 transform transition-transform duration-500 ease-in-out no-print
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="hidden md:flex items-center space-x-3 mb-10">
          <div className="bg-pink-600 p-2.5 rounded-xl shadow-xl rotate-3">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter leading-none dark:text-white">{APP_NAME}</h1>
            <p className="text-[8px] text-pink-500 font-black uppercase tracking-[0.2em] mt-1">{LOCATION}</p>
          </div>
        </div>

        <nav className="space-y-1.5">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Home Office" />
          <NavItem view="calendar" icon={CalendarDays} label="Schedule Book" />
          <NavItem view="booking" icon={Zap} label="Baddie Draft" />
          <NavItem view="clients" icon={Users} label="The Baddie Base" />
          <NavItem view="reports" icon={FileText} label="Baddie Reports" isLocked />
          <NavItem view="settings" icon={SettingsIcon} label="Empire Settings" />
        </nav>

        <div className="absolute bottom-6 left-6 right-6 space-y-3">
           <button 
              onClick={() => attemptVaultAccess('export')}
              className="w-full flex items-center justify-center space-x-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-pink-600 transition-colors"
            >
              <Download size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Backup Database</span>
            </button>
          <button 
            onClick={generateInsights}
            disabled={loadingAi}
            className="w-full group flex items-center justify-center space-x-2 bg-slate-900 dark:bg-pink-600 text-white p-4 rounded-xl shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loadingAi ? <Clock className="animate-spin w-4 h-4" /> : <Brain className="w-4 h-4" />}
            <span className="font-black text-[10px] uppercase tracking-widest">Glow Insights</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 lg:p-12 dark:bg-slate-950 custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          
          {activeView === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-700">
              <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 no-print">
                <div>
                  <h2 className="text-4xl md:text-6xl font-black tracking-tighter dark:text-white leading-none">Empire <span className="text-pink-600 italic font-serif">Office</span></h2>
                  <p className="text-slate-400 mt-2 font-bold text-xs uppercase tracking-[0.2em]">{new Date(selectedDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="flex space-x-3 w-full sm:w-auto">
                   <button onClick={() => attemptVaultAccess('reports')} className="flex-1 sm:flex-initial bg-white dark:bg-slate-900 dark:text-white border border-slate-100 dark:border-slate-800 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-sm hover:bg-slate-50 transition-all">Reports</button>
                   <button onClick={() => setActiveView('booking')} className="flex-1 sm:flex-initial bg-pink-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:scale-[1.05] active:scale-95 transition-all">New Draft</button>
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 no-print">
                <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-xl p-8 md:p-12 border border-slate-100 dark:border-slate-800">
                  <h3 className="text-xl font-black dark:text-white tracking-tight mb-8 flex justify-between">Daily Glow <span className="text-pink-500 font-serif italic text-base">Current Selection</span></h3>
                  <div className="space-y-6">
                    {stats.filteredApps.length > 0 ? stats.filteredApps.map(app => (
                      <AppointmentCard 
                        key={app.id} 
                        app={app} 
                        onStatusUpdate={handleUpdateStatus} 
                        currencySymbol={currency.symbol} 
                        isUnlocked={isVaultUnlockedForSession}
                        onReveal={() => attemptVaultAccess('reveal')}
                      />
                    )) : <div className="py-20 text-center text-slate-400 font-bold italic font-serif">No bookings on this day.</div>}
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-xl p-8 md:p-12 border border-slate-100 dark:border-slate-800">
                   <h3 className="text-xl font-black dark:text-white tracking-tight mb-8">Calendar Hook</h3>
                   <MonthlyCalendar appointments={appointments} onDateClick={setSelectedDate} selectedDate={selectedDate} isDarkMode={isDarkMode} />
                </div>
              </div>
            </div>
          )}

          {activeView === 'reports' && (
             <div id="report-area" className="space-y-8 animate-in slide-in-from-right duration-700">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                   <div>
                    <h2 className="text-4xl md:text-6xl font-black dark:text-white tracking-tighter leading-none">Empire <span className="text-pink-600 italic font-serif">Vault</span></h2>
                    <p className="text-slate-400 mt-2 font-bold text-xs uppercase tracking-[0.2em]">Sensitive Business Analytics • {new Date().toLocaleDateString()}</p>
                   </div>
                   <div className="flex space-x-3 no-print">
                      <button onClick={sendWhatsAppReport} className="bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center hover:scale-[1.02] transition-transform">
                         <MessageCircle className="mr-2 w-4 h-4" /> WhatsApp Owner
                      </button>
                      <button onClick={() => window.print()} className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center hover:scale-[1.02] transition-transform">
                         <Printer className="mr-2 w-4 h-4" /> Print to PDF
                      </button>
                   </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   <SummaryCard title="Monthly Gross" value={`${currency.symbol}${stats.totalRevenue.toLocaleString()}`} icon={TrendingUp} sub="Total Contract Value" />
                   <SummaryCard title="Cash Collected" value={`${currency.symbol}${stats.totalDeposits.toLocaleString()}`} icon={CreditCard} sub="Money in bank" color="pink" />
                   <SummaryCard title="Debt / Balance" value={`${currency.symbol}${stats.totalBalance.toLocaleString()}`} icon={AlertCircle} sub="Pending collection" color={stats.totalBalance > 0 ? 'red' : 'emerald'} />
                   <SummaryCard title="Baddie Retention" value={`${stats.uniqueBaddies}`} icon={Users} sub="Unique clients served" />
                </div>

                <div className="bg-white dark:bg-slate-900 p-10 md:p-16 rounded-[4rem] shadow-xl border border-slate-100 dark:border-slate-800 report-card">
                   <h3 className="text-2xl font-black dark:text-white mb-10 tracking-tighter">Detailed Ledger (Pending Balances)</h3>
                   <div className="space-y-4">
                      {appointments.filter(a => a.totalPrice - a.amountPaid > 0).map(app => (
                         <div key={app.id} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-transparent hover:border-pink-200 transition-colors">
                            <div>
                               <h4 className="font-black text-lg dark:text-white">{app.clientName}</h4>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{app.service} • {app.date}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-pink-600 font-black text-xl">{currency.symbol}{(app.totalPrice - app.amountPaid).toLocaleString()}</p>
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Outstanding</p>
                            </div>
                         </div>
                      ))}
                      {appointments.filter(a => a.totalPrice - a.amountPaid > 0).length === 0 && (
                         <div className="py-12 text-center text-slate-400 italic font-bold">The empire is fully settled. No pending debts. ✨</div>
                      )}
                   </div>
                </div>
             </div>
          )}

          {activeView === 'settings' && (
             <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right duration-700 pb-20 no-print">
                <header>
                  <h2 className="text-4xl md:text-6xl font-black dark:text-white tracking-tighter leading-none">Empire <span className="text-pink-600 italic font-serif">Config</span></h2>
                  <p className="text-slate-400 mt-2 font-bold text-xs uppercase tracking-[0.2em]">Global Currency • Security • Identity</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   
                   {/* Universal Currency Picker */}
                   <div className="md:col-span-2 bg-white dark:bg-slate-900 p-10 md:p-16 rounded-[4rem] shadow-xl border border-slate-100 dark:border-slate-800 space-y-10">
                      <div className="flex items-center space-x-4">
                         <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl"><Globe size={24}/></div>
                         <div>
                            <h3 className="text-xl font-black dark:text-white">Universal Currency Picker</h3>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select for foreign clients & global reporting</p>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 h-64 overflow-y-auto pr-4 custom-scrollbar">
                         {CURRENCIES.map(c => (
                            <button 
                              key={c.code}
                              onClick={() => setCurrency(c)}
                              className={`p-6 rounded-[2rem] border-2 transition-all text-center flex flex-col items-center justify-center space-y-2 ${
                                currency.code === c.code 
                                  ? 'bg-pink-600 border-pink-500 text-white shadow-xl shadow-pink-100' 
                                  : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-pink-200'
                              }`}
                            >
                               <span className="text-2xl font-black">{c.symbol}</span>
                               <span className="text-[10px] font-black uppercase tracking-tight">{c.label}</span>
                            </button>
                         ))}
                      </div>
                   </div>

                   {/* Passcode Setting */}
                   <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800 space-y-8">
                      <div className="flex items-center space-x-4">
                         <div className="p-3 bg-pink-50 dark:bg-pink-900/20 text-pink-600 rounded-2xl"><Lock size={24}/></div>
                         <h3 className="text-xl font-black dark:text-white">Vault Passcode</h3>
                      </div>
                      <div className="space-y-4">
                         <input 
                          type="password" 
                          placeholder="New 4-digit Code"
                          maxLength={4}
                          value={vaultPasscode}
                          onChange={(e) => setVaultPasscode(e.target.value)}
                          className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-black text-xl tracking-[0.5em] text-center dark:text-white"
                         />
                         <button 
                          onClick={() => { alert("Passcode Securely Saved."); setActiveView('dashboard'); }}
                          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]"
                         >
                            Update Security
                         </button>
                      </div>
                   </div>

                   {/* Owner Contact */}
                   <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800 space-y-8">
                      <div className="flex items-center space-x-4">
                         <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl"><MessageCircle size={24}/></div>
                         <h3 className="text-xl font-black dark:text-white">Reporting Contact</h3>
                      </div>
                      <div className="space-y-4">
                         <input 
                            type="text" 
                            placeholder="WhatsApp (e.g. 23480...)"
                            value={ownerContact.phone}
                            onChange={(e) => setOwnerContact({...ownerContact, phone: e.target.value})}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm dark:text-white"
                          />
                         <input 
                            type="email" 
                            placeholder="Empire Email"
                            value={ownerContact.email}
                            onChange={(e) => setOwnerContact({...ownerContact, email: e.target.value})}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm dark:text-white"
                          />
                      </div>
                   </div>

                   <div className="bg-slate-900 dark:bg-pink-600 p-12 rounded-[4rem] text-white shadow-2xl flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black tracking-tighter italic leading-tight">Glow Mode</h3>
                        <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-14 h-8 rounded-full transition-colors relative ${isDarkMode ? 'bg-white/20' : 'bg-white/10'}`}>
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${isDarkMode ? 'left-7' : 'left-1'}`}></div>
                        </button>
                      </div>
                      <button onClick={() => attemptVaultAccess('export')} className="flex items-center justify-between p-5 bg-white/10 rounded-[2rem] hover:bg-white/20 transition-all">
                        <span className="font-black uppercase text-[10px] tracking-widest">Download Database</span>
                        <Download size={18} />
                      </button>
                   </div>
                </div>
             </div>
          )}

          {activeView === 'calendar' && <CalendarView appointments={appointments} currency={currency} handleUpdateStatus={handleUpdateStatus} onDateSelect={setSelectedDate} selectedDate={selectedDate} isDarkMode={isDarkMode} isUnlocked={isVaultUnlockedForSession} onReveal={() => attemptVaultAccess('reveal')} />}
          {activeView === 'clients' && <ClientsView appointments={appointments} onClientSelect={setSelectedClientName} selectedClientName={selectedClientName} currency={currency} handleUpdateStatus={handleUpdateStatus} isUnlocked={isVaultUnlockedForSession} onReveal={() => attemptVaultAccess('reveal')} />}
          {activeView === 'booking' && <BookingView currency={currency} onSubmit={(data) => { setAppointments([...appointments, data]); setActiveView('dashboard'); }} />}
          {activeView === 'ai-insights' && <AIInsightsView insight={aiInsight} />}

        </div>
      </main>
    </div>
  );
};

// --- Sub-View Components ---

const CalendarView = ({ appointments, currency, handleUpdateStatus, onDateSelect, selectedDate, isDarkMode, isUnlocked, onReveal }: any) => (
  <div className="space-y-8 animate-in slide-in-from-bottom duration-700 no-print">
     <div className="bg-white dark:bg-slate-900 p-10 md:p-16 rounded-[4rem] shadow-xl border border-slate-100 dark:border-slate-800">
        <MonthlyCalendar appointments={appointments} large onDateClick={onDateSelect} selectedDate={selectedDate} isDarkMode={isDarkMode} />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.filter((a: any) => a.date === selectedDate).sort((a: any, b: any) => a.time.localeCompare(b.time)).map((app: any) => (
              <AppointmentCard 
                key={app.id} 
                app={app} 
                onStatusUpdate={handleUpdateStatus} 
                currencySymbol={currency.symbol} 
                isUnlocked={isUnlocked} 
                onReveal={onReveal}
              />
            ))}
        </div>
     </div>
  </div>
);

const ClientsView = ({ appointments, onClientSelect, selectedClientName, currency, handleUpdateStatus, isUnlocked, onReveal }: any) => {
  if (selectedClientName) {
    const clientApps = appointments.filter((a: any) => a.clientName === selectedClientName);
    return (
      <div className="space-y-8 animate-in slide-in-from-right duration-500 no-print">
         <button onClick={() => onClientSelect(null)} className="flex items-center text-pink-600 font-black uppercase tracking-widest text-[10px]"><ChevronLeft className="w-4 h-4 mr-1" /> Back to Base</button>
         <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-pink-600 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl">{selectedClientName.charAt(0)}</div>
              <div>
                <h2 className="text-4xl font-black tracking-tighter dark:text-white">{selectedClientName}</h2>
                <div className="flex items-center space-x-3 mt-2">
                  <span className="px-3 py-1 bg-pink-50 dark:bg-pink-900/20 rounded-full text-[9px] font-black text-pink-600 uppercase tracking-widest">{clientApps.length} Visits</span>
                </div>
              </div>
            </div>
            <div className="text-center md:text-right">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lifetime Value</p>
               <h4 className="text-2xl font-black dark:text-white">{currency.symbol}{clientApps.reduce((sum: number, a: any) => sum + a.totalPrice, 0).toLocaleString()}</h4>
            </div>
         </div>
         <div className="space-y-6">
            {clientApps.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((app: any) => (
              <div key={app.id} className="relative pl-8 group">
                 <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-slate-100 dark:bg-slate-800"></div>
                 <div className="absolute left-[-4px] top-10 w-2.5 h-2.5 rounded-full bg-pink-600"></div>
                 <AppointmentCard 
                    app={app} 
                    onStatusUpdate={handleUpdateStatus} 
                    currencySymbol={currency.symbol} 
                    isUnlocked={isUnlocked} 
                    onReveal={onReveal}
                 />
              </div>
            ))}
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 no-print">
       <h2 className="text-4xl md:text-6xl font-black dark:text-white tracking-tighter leading-none italic">Baddie <span className="text-pink-600 font-serif">Base</span></h2>
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
         {(Array.from(new Set(appointments.map((a: any) => a.clientName))) as string[]).map(name => (
           <button key={name} onClick={() => onClientSelect(name)} className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-50 dark:border-slate-800 shadow-md text-center hover:border-pink-500 hover:scale-[1.05] transition-all group relative overflow-hidden">
              <div className="w-20 h-20 bg-pink-600 rounded-3xl mx-auto mb-6 flex items-center justify-center text-white text-2xl font-black">{name.charAt(0)}</div>
              <h4 className="text-xl font-black dark:text-white tracking-tight mb-1">{name}</h4>
              <div className="px-5 py-2 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[9px] font-black text-slate-500 uppercase tracking-widest inline-block group-hover:bg-pink-600 group-hover:text-white transition-colors">Profile</div>
           </button>
         ))}
       </div>
    </div>
  );
};

const BookingView = ({ currency, onSubmit }: any) => {
  const [data, setData] = useState<any>({
    clientName: '',
    clientPhone: '',
    socialContactName: '',
    service: ServiceType.LASH_EXTENSION,
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    totalPrice: '',
    amountPaid: '',
    leadSource: 'Instagram',
    notes: ''
  });

  return (
    <div className="max-w-4xl mx-auto animate-in zoom-in duration-700 pb-20 no-print">
      <div className="bg-slate-900 dark:bg-pink-600 p-12 md:p-20 rounded-t-[4rem] text-white relative overflow-hidden">
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none italic mb-4">Swift <span className="text-pink-500 dark:text-white">Draft</span></h2>
        <p className="text-slate-400 dark:text-pink-100 font-bold uppercase tracking-widest text-[11px]">Capture Contact • Secure the Bag</p>
      </div>
      <div className="bg-white dark:bg-slate-900 p-10 md:p-16 rounded-b-[4rem] shadow-2xl border border-slate-100 dark:border-slate-800">
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit({
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            clientId: 'manual',
            totalPrice: Number(data.totalPrice),
            amountPaid: Number(data.amountPaid),
            status: 'confirmed'
          });
        }} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputField label="Client Name *" value={data.clientName} onChange={(v: any) => setData({...data, clientName: v})} required />
            <InputField label="WhatsApp Number" placeholder="e.g. 2348000000000" value={data.clientPhone} onChange={(v: any) => setData({...data, clientPhone: v})} />
            <InputField label="Instagram / Social" placeholder="@username" value={data.socialContactName} onChange={(v: any) => setData({...data, socialContactName: v})} />
            <SelectField label="Service" value={data.service} options={Object.values(ServiceType)} onChange={(v: any) => setData({...data, service: v})} />
            <InputField label="Date *" type="date" value={data.date} onChange={(v: any) => setData({...data, date: v})} required />
            <InputField label="Time" type="time" value={data.time} onChange={(v: any) => setData({...data, time: v})} />
            <InputField label="Total Price" type="number" value={data.totalPrice} onChange={(v: any) => setData({...data, totalPrice: v})} prefix={currency.symbol} />
            <InputField label="Deposit Paid" type="number" value={data.amountPaid} onChange={(v: any) => setData({...data, amountPaid: v})} prefix={currency.symbol} />
          </div>
          <button type="submit" className="w-full py-8 bg-pink-600 text-white font-black uppercase tracking-[0.2em] text-[13px] rounded-[3rem] shadow-2xl active:scale-95 transition-transform">Log Appointment ✨</button>
        </form>
      </div>
    </div>
  );
};

const AIInsightsView = ({ insight }: any) => (
  <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-right duration-700 no-print">
    <div className="bg-white dark:bg-slate-900 p-12 md:p-20 rounded-[4rem] shadow-xl border border-pink-50 dark:border-slate-800 relative overflow-hidden">
      <h2 className="text-4xl font-black mb-12 flex items-center tracking-tighter dark:text-white">
        <Sparkles className="text-pink-600 mr-4 w-10 h-10" /> Glow AI <span className="italic font-serif ml-3">Analytics</span>
      </h2>
      <div className="space-y-8">
        {insight.split('\n').map((line: any, i: number) => {
          if (line.trim().length === 0) return null;
          const isMotto = line.toLowerCase().includes('baddie motto');
          return <div key={i} className={`${isMotto ? 'mt-12 p-10 md:p-16 bg-slate-900 dark:bg-pink-600 text-white rounded-[3rem] shadow-2xl' : 'text-slate-600 dark:text-slate-400 text-base font-bold leading-relaxed'}`}>{isMotto ? <p className="text-2xl font-black">"{line.replace(/baddie motto:/gi, '').trim()}"</p> : line}</div>;
        })}
      </div>
    </div>
  </div>
);

// --- Shared Components ---

const SummaryCard = ({ title, value, icon: Icon, sub, color = 'slate' }: any) => {
  const isRed = color === 'red';
  const isEmerald = color === 'emerald';
  const isPink = color === 'pink';
  return (
    <div className={`${isPink ? 'bg-pink-600 text-white shadow-pink-200' : 'bg-white dark:bg-slate-900 dark:text-white'} p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800 relative overflow-hidden report-card`}>
      <Icon className={`absolute -right-6 -bottom-6 w-32 h-32 opacity-5 ${isEmerald ? 'text-emerald-500' : isRed ? 'text-red-500' : ''}`} />
      <p className={`text-[10px] font-black uppercase tracking-widest ${isPink ? 'opacity-60' : 'text-slate-400'}`}>{title}</p>
      <h4 className={`text-4xl font-black tracking-tighter mt-1 ${isRed ? 'text-red-500' : ''}`}>{value}</h4>
      <p className={`text-[9px] font-bold mt-2 uppercase tracking-widest ${isEmerald ? 'text-emerald-500' : isRed ? 'text-red-500' : isPink ? 'text-pink-100' : 'text-slate-400'}`}>{sub}</p>
    </div>
  );
};

const InputField = ({ label, type = 'text', required = false, prefix, ...props }: any) => (
  <div className="space-y-2 no-print">
    <label className="text-[10px] font-black uppercase text-slate-500 ml-2">{label}</label>
    <div className="relative">
      {prefix && <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400">{prefix}</span>}
      <input type={type} required={required} {...props} className={`w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold text-sm dark:text-white ${prefix ? 'pl-10' : ''}`} onChange={e => props.onChange(e.target.value)} />
    </div>
  </div>
);

const SelectField = ({ label, options, ...props }: any) => (
  <div className="space-y-2 no-print">
    <label className="text-[10px] font-black uppercase text-slate-500 ml-2">{label}</label>
    <select {...props} className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold text-sm dark:text-white appearance-none" onChange={e => props.onChange(e.target.value)}>
      {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const AppointmentCard: React.FC<{ app: Appointment, onStatusUpdate: (id: string, s: Appointment['status']) => void, currencySymbol: string, isUnlocked: boolean, onReveal: () => void }> = ({ app, onStatusUpdate, currencySymbol, isUnlocked, onReveal }) => (
  <div className="flex flex-col p-8 bg-slate-50/50 dark:bg-slate-800/40 rounded-[3rem] border border-transparent hover:border-pink-100/50 hover:bg-white dark:hover:bg-slate-800 transition-all group relative overflow-hidden shadow-sm">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-5">
        <div className="text-center min-w-[55px]">
          <span className="block text-lg font-black dark:text-white">{app.time}</span>
          <span className="block text-[8px] text-pink-500 font-black uppercase tracking-wider mt-1.5">{app.status.toUpperCase()}</span>
        </div>
        <div className="h-12 w-[2.5px] bg-slate-200 dark:bg-slate-700"></div>
        <div className="flex flex-col">
          <h4 className="font-black text-lg tracking-tight dark:text-white group-hover:text-pink-600 transition-colors">{app.clientName}</h4>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(app.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>
      <div className="px-3 py-1 rounded-xl border text-[9px] font-black uppercase tracking-tighter bg-pink-50 text-pink-600 border-pink-100">{app.service}</div>
    </div>

    {/* Protected Contact Section */}
    <div className="flex flex-wrap gap-4 mb-6">
      {!isUnlocked ? (
        <button onClick={onReveal} className="flex items-center space-x-2 px-4 py-2 bg-slate-900/5 dark:bg-slate-100/5 rounded-full text-slate-400 hover:text-pink-600 transition-colors">
          <Lock size={12} />
          <span className="text-[9px] font-black uppercase tracking-widest">Unlock Client Data</span>
        </button>
      ) : (
        <>
          <a href={`https://wa.me/${app.clientPhone.replace(/\D/g, '')}`} target="_blank" className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full hover:scale-105 transition-transform">
            <MessageCircle size={12} />
            <span className="text-[9px] font-black uppercase tracking-widest">{app.clientPhone || 'No Phone'}</span>
          </a>
          {app.socialContactName && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-pink-50 dark:bg-pink-900/20 text-pink-600 rounded-full">
              <Instagram size={12} />
              <span className="text-[9px] font-black uppercase tracking-widest">{app.socialContactName}</span>
            </div>
          )}
        </>
      )}
    </div>

    <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-700/50">
      <div className="space-y-2">
         <div className="flex items-center text-[9px] font-black text-slate-400 uppercase tracking-widest truncate"><Briefcase className="w-3 h-3 mr-2" /> <span className="truncate ml-1.5 font-bold italic">{app.notes || 'No notes'}</span></div>
      </div>
      <div className="space-y-2 text-right">
         <div className="flex items-center justify-end text-[9px] font-black text-slate-400 uppercase tracking-widest">
            <span className="text-emerald-600 ml-2">{currencySymbol}{app.amountPaid.toLocaleString()}</span>
            <span className="text-slate-300 mx-1.5">/</span>
            <span className="text-slate-900 dark:text-slate-200">{currencySymbol}{app.totalPrice.toLocaleString()}</span>
         </div>
         <div className="text-[8px] font-black text-slate-400 uppercase italic">
            Bal: <span className={app.totalPrice - app.amountPaid > 0 ? 'text-pink-600' : 'text-emerald-500'}>{currencySymbol}{(app.totalPrice - app.amountPaid).toLocaleString()}</span>
         </div>
      </div>
    </div>
    <div className="absolute top-6 right-6 flex items-center space-x-2 no-print">
      {app.status === 'confirmed' && (
        <button onClick={() => onStatusUpdate(app.id, 'completed')} className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl border border-emerald-100 hover:scale-110 active:scale-95 transition-all shadow-sm"><CheckCircle className="w-5 h-5" /></button>
      )}
    </div>
  </div>
);

const MonthlyCalendar = ({ appointments, onDateClick, large = false, selectedDate, isDarkMode }: { appointments: Appointment[], onDateClick: (d: string) => void, large?: boolean, selectedDate: string, isDarkMode: boolean }) => {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const dayStats = useMemo(() => appointments.reduce((acc: Record<string, number>, app) => { acc[app.date] = (acc[app.date] || 0) + 1; return acc; }, {}), [appointments]);
  return (
    <div className="w-full no-print">
      <div className="grid grid-cols-7 gap-1 mb-10">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => <div key={d} className="text-center text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">{d}</div>)}
      </div>
      <div className={`grid grid-cols-7 ${large ? 'gap-4 md:gap-6' : 'gap-3'}`}>
        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="aspect-square"></div>)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const count = dayStats[dateStr] || 0;
          const isSelected = selectedDate === dateStr;
          const isToday = now.getDate() === day;
          return (
            <button key={day} onClick={() => onDateClick(dateStr)} className={`aspect-square rounded-3xl flex flex-col items-center justify-center relative transition-all text-sm md:text-lg ${isSelected ? 'bg-slate-900 dark:bg-pink-600 text-white shadow-2xl scale-110 z-10 ring-4 ring-pink-500/10' : isToday ? 'bg-pink-50 dark:bg-pink-900/10 text-pink-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-100'}`}>
              <span className="font-black">{day}</span>
              {count > 0 && <div className={`absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full text-[8px] font-black border-2 border-white dark:border-slate-900 ${isSelected ? 'bg-white text-slate-900 shadow-sm' : 'bg-pink-600 text-white shadow-md'}`}>{count}</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default App;
