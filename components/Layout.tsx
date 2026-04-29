import React from 'react';
import {
  LayoutDashboard,
  Database,
  ShieldCheck,
  Calculator,
  Users,
  LogOut,
  Sun,
  Moon,
  Menu,
  CheckSquare,
  Globe,
  FileClock,
  BookOpen,
  X,
  Download,
  Activity,
  AlertCircle,
  Sparkles,
  Target,
  Server,
  CheckCircle,
  Plug
} from 'lucide-react';
import { ViewState, User, Language, TRANSLATIONS } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  setView: (view: ViewState) => void;
  user: User | null;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

// Custom Logo Component matching the new brand design
const AlquidLogo = () => (
  <div className="flex items-center gap-3 px-2 mb-6">
    <img src="/nfq-n.png" alt="N Logo" className="h-10 w-auto object-contain" />
    <div className="flex flex-col">
      <span className="text-xl font-black tracking-tight text-slate-800 dark:text-white leading-none">OpRisk</span>
      <span className="text-[10px] font-bold tracking-[0.1em] text-slate-400 uppercase">NFQ Advisory</span>
    </div>
  </div>
);

const Layout: React.FC<LayoutProps> = ({
  children,
  currentView,
  setView,
  user,
  onLogout,
  isDarkMode,
  toggleTheme,
  language,
  setLanguage
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [manualOpen, setManualOpen] = React.useState(false); // Added State
  const t = TRANSLATIONS[language];

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState; icon: any; label: string }) => (
    <button
      onClick={() => {
        setView(view);
        setMobileMenuOpen(false);
      }}
      className={`flex items-center w-full px-4 py-3 mb-2 rounded-xl transition-all duration-200 group ${currentView === view
        ? 'bg-gradient-to-r from-brand-gray/10 to-brand-brown/10 border-l-4 border-brand-brown text-slate-800 dark:text-slate-100 font-semibold shadow-sm'
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
    >
      <Icon className={`w-5 h-5 mr-3 ${currentView === view ? 'text-brand-brown' : 'group-hover:text-brand-brown'}`} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#050505] text-slate-900 dark:text-white transition-colors duration-300">

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#0d0d0d] relative z-20 no-print">
        <div className="p-6 flex flex-col items-center justify-center">
          <AlquidLogo />
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <NavItem view={ViewState.DASHBOARD} icon={LayoutDashboard} label={t.dashboard} />
          <NavItem view={ViewState.DATA} icon={Database} label={t.data} />
          <NavItem view={ViewState.RCSA} icon={ShieldCheck} label={t.rcsa} />
          <NavItem view={ViewState.CONTROL_TESTING} icon={CheckSquare} label={t.controlTesting} />
          <NavItem view={ViewState.KRIS} icon={Activity} label={t.kris} />
          <NavItem view={ViewState.ISSUES} icon={AlertCircle} label={t.issues} />
          <NavItem view={ViewState.SCENARIOS} icon={Sparkles} label={t.scenarios} />
          <NavItem view={ViewState.APPETITE} icon={Target} label={t.appetite} />
          <NavItem view={ViewState.CAPITAL} icon={Calculator} label={t.capitalEngine} />
          <NavItem view={ViewState.DORA} icon={Server} label={t.dora} />
          <NavItem view={ViewState.DATA_QUALITY} icon={CheckCircle} label={t.dataQuality} />
          <NavItem view={ViewState.INTEGRATIONS} icon={Plug} label={t.integrations} />

          <div className="pt-4 border-t border-slate-200 dark:border-white/10 mt-4">
            <NavItem view={ViewState.AUDIT_LOGS} icon={FileClock} label={t.auditLogs} />
            <NavItem view={ViewState.USERS} icon={Users} label={t.userManagement} />
          </div>
        </nav>

        <div className="p-4 relative">
          {/* User Manual Button */}
          <button
            onClick={() => setManualOpen(true)}
            className="flex items-center w-full px-4 py-2 mb-4 text-xs font-medium text-brand-brown hover:text-brand-brown/80 hover:bg-brand-brown/10 rounded-lg transition-colors"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            User Manual
          </button>

          <div className="border-t border-slate-200 dark:border-white/5 pt-4">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center w-full p-3 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-brand-brown text-white flex items-center justify-center font-bold">
                {user?.name.charAt(0)}
              </div>
              <div className="ml-3 overflow-hidden text-left flex-1">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
              </div>
            </button>
          </div>

          {/* User Dropdown */}
          {userMenuOpen && (
            <div className="absolute bottom-20 left-4 right-4 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-white/10 p-2 space-y-1 animate-in slide-in-from-bottom-2 fade-in z-50">
              <button
                onClick={() => setLanguage(language === 'EN' ? 'ES' : 'EN')}
                className="w-full flex items-center px-3 py-2 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300"
              >
                <Globe className="w-4 h-4 mr-2" />
                {language === 'EN' ? 'Switch to Español' : 'Cambiar a English'}
              </button>
              <button
                onClick={onLogout}
                className="w-full flex items-center px-3 py-2 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t.logout}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* User Manual Drawer */}
      {manualOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setManualOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                <BookOpen className="w-6 h-6 mr-3 text-brand-brown" />
                User Manual
              </h2>
              <button onClick={() => setManualOpen(false)}><X className="w-6 h-6 text-slate-400 hover:text-slate-600" /></button>
            </div>

            <div className="prose dark:prose-invert max-w-none space-y-4 pb-10">
              <div className="p-4 bg-orange-50 dark:bg-brand-brown/10 rounded-xl border border-orange-100 dark:border-brand-brown/20 group">
                <h3 className="text-lg font-semibold text-brand-brown dark:text-orange-400 mb-2">NFQ OpRisk Platform</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Welcome to the multi-user operational risk management ecosystem. This version includes full Supabase cloud integration and real-time data streaming.
                </p>
              </div>

              <div className="space-y-6 mt-6">
                <section>
                  <h4 className="flex items-center text-lg font-bold text-slate-800 dark:text-white mb-2">
                    <Globe className="w-5 h-5 mr-2 text-brand-brown" /> Real-time Synchronization
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    The platform now operates in the cloud. All actions (creating, editing, deleting) are reflected <strong>instantly</strong> for all connected users without refreshing.
                  </p>
                </section>

                <section className="border-t border-slate-200 dark:border-white/10 pt-4">
                  <h4 className="flex items-center text-lg font-bold text-slate-800 dark:text-white mb-2">
                    <Database className="w-5 h-5 mr-2 text-brand-brown" /> Data Module (Events)
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    The central repository for internal operational risk loss events.
                  </p>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-slate-600 dark:text-slate-300 mt-2">
                    <li><strong>Create Event:</strong> Click "+ New Event" to report a loss. Fill in mandatory fields like Date, Amount, EBA Event Type (Level 1 & 2), and Business Line.</li>
                    <li><strong>Import:</strong> Use the "Upload CSV" button to bulk import events via drag-and-drop. Supported formats: .csv, .xls.</li>
                    <li><strong>Validation:</strong> 'OpRisk' and 'Administrator' users can review pending events and Approve or Reject them.</li>
                    <li><strong>Editing:</strong> 1st Line users can edit their own events while they are in 'Pending' status.</li>
                  </ul>
                </section>

                <section className="border-t border-slate-200 dark:border-white/10 pt-4">
                  <h4 className="flex items-center text-lg font-bold text-slate-800 dark:text-white mb-2">
                    <ShieldCheck className="w-5 h-5 mr-2 text-brand-brown" /> RCSA (Self-Assessment)
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Manage the organizational hierarchy and assess risks and controls.
                  </p>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-slate-600 dark:text-slate-300 mt-2">
                    <li><strong>Hierarchy Tree:</strong> Navigate through Departments {'>'} Processes {'>'} Risks.</li>
                    <li><strong>Create Items:</strong> Use the "+" button to add Departments, Processes with Owners, Risks with Impact/Prob Matrices, or Controls with Frequency.</li>
                    <li><strong>Manage:</strong> Delete items using the trash icon (cascading effects apply). Import bulk data via CSV.</li>
                    <li><strong>Neural Map:</strong> Switch to 'Map View' to visualize the interconnections between risks and processes.</li>
                  </ul>
                </section>

                <section className="border-t border-slate-200 dark:border-white/10 pt-4">
                  <h4 className="flex items-center text-lg font-bold text-slate-800 dark:text-white mb-2">
                    <CheckSquare className="w-5 h-5 mr-2 text-brand-brown" /> Control Testing
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Execute and verify the effectiveness of controls linked to risks.
                  </p>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-slate-600 dark:text-slate-300 mt-2">
                    <li><strong>Test Execution:</strong> Select a control and perform a test (e.g., "Sample check of 5 items").</li>
                    <li><strong>Sorting & Filtering:</strong> Use the filter bar to find controls by Department, Risk, or Owner. Click headers to sort.</li>
                    <li><strong>Outcome:</strong> Mark results as "Effective", "Ineffective", or "Not Applicable".</li>
                  </ul>
                </section>

                <section className="border-t border-slate-200 dark:border-white/10 pt-4">
                  <h4 className="flex items-center text-lg font-bold text-slate-800 dark:text-white mb-2">
                    <Calculator className="w-5 h-5 mr-2 text-brand-brown" /> Capital Engine
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Standardized Measurement Approach (SMA) calculator for regulatory capital.
                  </p>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-slate-600 dark:text-slate-300 mt-2">
                    <li><strong>BI Component:</strong> Inputs for Business Indicator (Interest, Service, Financial components).</li>
                    <li><strong>ILM Component:</strong> Internal Loss Multiplier calculation based on historical losses (10-year window).</li>
                    <li><strong>Output:</strong> Real-time calculation of Baseline Capital Requirements.</li>
                  </ul>
                </section>

                <section className="border-t border-slate-200 dark:border-white/10 pt-4">
                  <h4 className="flex items-center text-lg font-bold text-slate-800 dark:text-white mb-2">
                    <Download className="w-5 h-5 mr-2 text-brand-brown" /> CSV Import Formats
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Use semicolon (;) as separator. If validation fails, an error report will be downloaded automatically.
                  </p>
                  <div className="mt-4 space-y-4">
                    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
                      <p className="text-xs font-bold text-brand-brown mb-1">Events Import Columns:</p>
                      <code className="text-[10px] block break-all text-slate-500">
                        Date;Title;Amount;EventType;Level2;BusinessLine;Dept;ProcessID;Description;Email
                      </code>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
                      <p className="text-xs font-bold text-brand-brown mb-1">RCSA Import Columns (Dynamic):</p>
                      <code className="text-[10px] block break-all text-slate-500">
                        Type;ID;Name;ParentID;Owner;Description;InherentProb;InherentImpact;ResidualProb;ResidualImpact;ControlType;Frequency;TestFrequency
                      </code>
                      <p className="text-[10px] text-slate-400 mt-2 italic">* Type must be DEPT, PROC, RISK, or CTRL. ParentID is the ID of the parent element.</p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-white/10 no-print">
                <a
                  href="/Manual_OpRisk_NFQ.pdf"
                  download="Manual_OpRisk_NFQ.pdf"
                  className="w-full flex items-center justify-center px-4 py-3 bg-brand-brown hover:bg-orange-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-brown/20 no-underline cursor-pointer"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Official PDF Manual
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden print:overflow-visible">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md sticky top-0 z-10 no-print">
          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-500 hover:text-brand-brown">
              <Menu className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 px-4">
            {/* Spacer */}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-brand-brown transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-xl md:hidden flex flex-col p-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-white">Menu</h2>
              <button onClick={() => setMobileMenuOpen(false)} className="text-white"><LogOut className="w-6 h-6 rotate-180" /></button>
            </div>
            <nav className="space-y-2 overflow-y-auto">
              <NavItem view={ViewState.DASHBOARD} icon={LayoutDashboard} label={t.dashboard} />
              <NavItem view={ViewState.DATA} icon={Database} label={t.data} />
              <NavItem view={ViewState.RCSA} icon={ShieldCheck} label={t.rcsa} />
              <NavItem view={ViewState.CONTROL_TESTING} icon={CheckSquare} label={t.controlTesting} />
              <NavItem view={ViewState.KRIS} icon={Activity} label={t.kris} />
              <NavItem view={ViewState.ISSUES} icon={AlertCircle} label={t.issues} />
              <NavItem view={ViewState.SCENARIOS} icon={Sparkles} label={t.scenarios} />
              <NavItem view={ViewState.APPETITE} icon={Target} label={t.appetite} />
              <NavItem view={ViewState.CAPITAL} icon={Calculator} label={t.capitalEngine} />
              <NavItem view={ViewState.DORA} icon={Server} label={t.dora} />
              <NavItem view={ViewState.DATA_QUALITY} icon={CheckCircle} label={t.dataQuality} />
              <NavItem view={ViewState.INTEGRATIONS} icon={Plug} label={t.integrations} />
              <NavItem view={ViewState.AUDIT_LOGS} icon={FileClock} label={t.auditLogs} />
            </nav>
          </div>
        )}

        {/* View Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;