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
  BookOpen, // Added
  X,        // Added
  Download  // Added
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

// Custom Logo Component mimicking the style
const AlquidLogo = () => (
  <svg width="160" height="60" viewBox="0 0 160 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
    <g transform="translate(5, 5)">
      {/* Symbol A - Constructed to look like the reference */}
      {/* Left Leg & Crossbar (Grey) */}
      <path d="M10 38 L22 8 L27 22" stroke="#64748b" strokeWidth="6" strokeLinecap="butt" strokeLinejoin="miter" />
      <path d="M16 28 H31" stroke="#64748b" strokeWidth="5" strokeLinecap="butt" />

      {/* Right Leg (Brand Brown) - Overlapping */}
      <path d="M25 18 L35 38" stroke="#8B4513" strokeWidth="6" strokeLinecap="butt" />

      {/* Text 'alquid' */}
      <text x="42" y="38" fontFamily="sans-serif" fontSize="32" fontWeight="bold" fill="#64748b" letterSpacing="-1">
        alquid
      </text>

      {/* Bar 'OpRisk' */}
      <rect x="42" y="46" width="95" height="14" fill="#8B4513" rx="1" />
      <text x="89.5" y="56" fontFamily="sans-serif" fontSize="9" fontWeight="bold" fill="white" textAnchor="middle" letterSpacing="1.5">
        OPRISK
      </text>
    </g>
  </svg>
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
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0f172a] text-slate-900 dark:text-white transition-colors duration-300">

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#0f172a] relative z-20">
        <div className="p-6 flex flex-col items-center justify-center">
          <AlquidLogo />
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <NavItem view={ViewState.DASHBOARD} icon={LayoutDashboard} label={t.dashboard} />
          <NavItem view={ViewState.DATA} icon={Database} label={t.data} />
          <NavItem view={ViewState.RCSA} icon={ShieldCheck} label={t.rcsa} />
          <NavItem view={ViewState.CONTROL_TESTING} icon={CheckSquare} label={t.controlTesting} />
          <NavItem view={ViewState.CAPITAL} icon={Calculator} label={t.capitalEngine} />

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
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Welcome to ALQUID OpRisk</h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  The advanced platform for Operational Risk Management, designed for NFQ and global financial institutions.
                  This manual provides a detailed guide on how to utilize each module effectively.
                </p>
              </div>

              <div className="space-y-6 mt-6">
                <section>
                  <h4 className="flex items-center text-lg font-bold text-slate-800 dark:text-white mb-2">
                    <LayoutDashboard className="w-5 h-5 mr-2 text-brand-brown" /> Dashboard
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    The <strong>Dashboard</strong> provides a high-level overview of the organization's risk profile.
                  </p>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-slate-600 dark:text-slate-300 mt-2">
                    <li><strong>Key Metrics:</strong> Monitor Total Loss, Event Count, and Capital Requirements at a glance.</li>
                    <li><strong>Trends:</strong> Analyze loss evolution over time to identify seasonal spikes or improvements.</li>
                    <li><strong>Heatmaps:</strong> Visualize risk concentration by Business Line and Event Type.</li>
                  </ul>
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
                    <Users className="w-5 h-5 mr-2 text-brand-brown" /> User Management
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Manage access and roles.
                  </p>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-slate-600 dark:text-slate-300 mt-2">
                    <li><strong>Roles:</strong>
                      <ul className="pl-4 list-circle mt-1">
                        <li><em>Administrator:</em> Full access (System & Business).</li>
                        <li><em>OpRisk:</em> Validation and oversight authority.</li>
                        <li><em>First Line:</em> Can report events and view their own data.</li>
                      </ul>
                    </li>
                    <li><strong>Access:</strong> Administrators can add, edit, and delete users.</li>
                  </ul>
                </section>
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-white/10">
                <button className="w-full flex items-center justify-center px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg">
                  <Download className="w-5 h-5 mr-2" />
                  Download Full PDF Documentation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-10">
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
            <nav className="space-y-4">
              <NavItem view={ViewState.DASHBOARD} icon={LayoutDashboard} label={t.dashboard} />
              <NavItem view={ViewState.DATA} icon={Database} label={t.data} />
              <NavItem view={ViewState.RCSA} icon={ShieldCheck} label={t.rcsa} />
              <NavItem view={ViewState.CONTROL_TESTING} icon={CheckSquare} label={t.controlTesting} />
              <NavItem view={ViewState.CAPITAL} icon={Calculator} label={t.capitalEngine} />
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