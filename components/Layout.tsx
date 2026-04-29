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
          <NavItem view={ViewState.RCSA} icon={ShieldCheck} label={t.rcsa} />
          <NavItem view={ViewState.CONTROL_TESTING} icon={CheckSquare} label={t.controlTesting} />
          <NavItem view={ViewState.DATA} icon={Database} label={t.data} />
          <NavItem view={ViewState.KRIS} icon={Activity} label={t.kris} />
          <NavItem view={ViewState.APPETITE} icon={Target} label={t.appetite} />
          <NavItem view={ViewState.ISSUES} icon={AlertCircle} label={t.issues} />
          <NavItem view={ViewState.SCENARIOS} icon={Sparkles} label={t.scenarios} />
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
              <div className="p-4 bg-orange-50 dark:bg-brand-brown/10 rounded-xl border border-orange-100 dark:border-brand-brown/20">
                <h3 className="text-lg font-semibold text-brand-brown dark:text-orange-400 mb-2">NFQ OpRisk Platform</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  End-to-end operational risk management aligned to Basel III SMA, EBA event taxonomy and DORA.
                  All changes sync in real time across users via Supabase.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/10">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-2">Suggested workflow</h4>
                <ol className="list-decimal pl-5 text-xs space-y-1 text-slate-600 dark:text-slate-300">
                  <li><strong>Define</strong> the universe in <strong>RCSA</strong> (Departments → Processes → Risks → Controls)</li>
                  <li><strong>Test</strong> the controls in <strong>Control Testing</strong></li>
                  <li><strong>Capture</strong> losses in <strong>Events</strong> and forward-looking metrics in <strong>KRIs</strong></li>
                  <li><strong>Govern</strong> with <strong>Risk Appetite</strong> thresholds and remediate via <strong>Issues & Actions</strong></li>
                  <li><strong>Look ahead</strong> with <strong>Scenarios</strong> and <strong>Capital Engine</strong></li>
                  <li><strong>Resilience & data</strong>: <strong>DORA</strong>, <strong>Data Quality</strong>, <strong>External Loss Data</strong></li>
                </ol>
              </div>

              <div className="space-y-6 mt-6">
                <section>
                  <h4 className="flex items-center text-lg font-bold text-slate-800 dark:text-white mb-2">
                    <ShieldCheck className="w-5 h-5 mr-2 text-brand-brown" /> 1. RCSA — Risk &amp; Control Self-Assessment
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Foundation of the framework. Build the universe and assess inherent vs residual risk.</p>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-slate-600 dark:text-slate-300 mt-2">
                    <li><strong>Hierarchy:</strong> Departments → Processes → Risks → Controls</li>
                    <li><strong>Scoring:</strong> 5×5 matrix for inherent and residual probability/impact</li>
                    <li><strong>Controls:</strong> Preventive vs detective; linked to risks; execution and testing frequencies</li>
                    <li><strong>Bulk load</strong> via CSV; visualise interconnections in <em>Map View</em></li>
                  </ul>
                </section>

                <section className="border-t border-slate-200 dark:border-white/10 pt-4">
                  <h4 className="flex items-center text-lg font-bold text-slate-800 dark:text-white mb-2">
                    <CheckSquare className="w-5 h-5 mr-2 text-brand-brown" /> 2. Control Testing
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Plan, execute and document tests on each control. Outcomes feed back into the residual risk view.</p>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-slate-600 dark:text-slate-300 mt-2">
                    <li><strong>Outcome:</strong> Validated / Tested / Non Validated / Pending</li>
                    <li><strong>Filter</strong> by department, owner, linked risk; click headers to sort</li>
                    <li><strong>Evidence</strong> upload supported per test</li>
                  </ul>
                </section>

                <section className="border-t border-slate-200 dark:border-white/10 pt-4">
                  <h4 className="flex items-center text-lg font-bold text-slate-800 dark:text-white mb-2">
                    <Database className="w-5 h-5 mr-2 text-brand-brown" /> 3. Events — internal loss data
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Central ledger of operational loss events aligned to the EBA Level 1 / Level 2 taxonomy.</p>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-slate-600 dark:text-slate-300 mt-2">
                    <li><strong>Three dates</strong> (Basel): occurrence, discovery, accounting impact</li>
                    <li><strong>Gross loss</strong> + recoveries (direct + insurance) → net loss</li>
                    <li><strong>Near-miss</strong> flag and link to the <strong>control that failed</strong></li>
                    <li><strong>AI Classify</strong>: suggests EBA L1/L2 from the description (Gemini)</li>
                    <li><strong>4-eyes:</strong> First Line creates → OpRisk validates / rejects</li>
                    <li><strong>CSV import</strong> with template; semicolon-separated</li>
                  </ul>
                </section>

                <section className="border-t border-slate-200 dark:border-white/10 pt-4">
                  <h4 className="flex items-center text-lg font-bold text-slate-800 dark:text-white mb-2">
                    <Activity className="w-5 h-5 mr-2 text-brand-brown" /> 4. KRIs — Key Risk Indicators
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Forward-looking metrics with green / amber / red thresholds and trend.</p>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-slate-600 dark:text-slate-300 mt-2">
                    <li>Per indicator: current value, owner, frequency, RAG status</li>
                    <li>Linked to a risk in the RCSA universe</li>
                    <li>Threshold breaches feed naturally into <strong>Issues &amp; Actions</strong></li>
                  </ul>
                </section>

                <section className="border-t border-slate-200 dark:border-white/10 pt-4">
                  <h4 className="flex items-center text-lg font-bold text-slate-800 dark:text-white mb-2">
                    <Target className="w-5 h-5 mr-2 text-brand-brown" /> 5. Risk Appetite
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Quantitative tolerance statements at firm, business line or event-type level.</p>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-slate-600 dark:text-slate-300 mt-2">
                    <li>Threshold + period (Monthly / Quarterly / Annual)</li>
                    <li><strong>Actuals auto-computed</strong> for "Gross Loss" metric from approved events</li>
                    <li>RAG: Within / Watch (≥80% of limit) / Breach (≥100%)</li>
                  </ul>
                </section>

                <section className="border-t border-slate-200 dark:border-white/10 pt-4">
                  <h4 className="flex items-center text-lg font-bold text-slate-800 dark:text-white mb-2">
                    <AlertCircle className="w-5 h-5 mr-2 text-brand-brown" /> 6. Issues &amp; Actions
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Hub for remediation tracking. An issue can come from an event, a control, an audit finding or a KRI breach.</p>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-slate-600 dark:text-slate-300 mt-2">
                    <li>Severity (Low → Critical), owner, due date</li>
                    <li>Auto-flagged as <strong>Overdue</strong> when past due date</li>
                    <li>Filter by status; export to CSV</li>
                  </ul>
                </section>

                <section className="border-t border-slate-200 dark:border-white/10 pt-4">
                  <h4 className="flex items-center text-lg font-bold text-slate-800 dark:text-white mb-2">
                    <Sparkles className="w-5 h-5 mr-2 text-brand-brown" /> 7. Scenarios
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Library of forward-looking ICAAP scenarios for tail-risk analysis.</p>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-slate-600 dark:text-slate-300 mt-2">
                    <li>Triangular severity (min/mode/max) × Poisson frequency</li>
                    <li><strong>Run Monte Carlo</strong> (5,000 iterations) → mean, VaR 95%, VaR 99%, max</li>
                    <li>Useful for ICAAP capital and what-if</li>
                  </ul>
                </section>

                <section className="border-t border-slate-200 dark:border-white/10 pt-4">
                  <h4 className="flex items-center text-lg font-bold text-slate-800 dark:text-white mb-2">
                    <Calculator className="w-5 h-5 mr-2 text-brand-brown" /> 8. Capital Engine — Basel III SMA
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Standardised Measurement Approach calculator for regulatory operational risk capital.</p>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-slate-600 dark:text-slate-300 mt-2">
                    <li>Full BI = ILDC + SC + FC, with 2.25% IEA cap on the interest component</li>
                    <li>Three-bucket BIC: 12% (≤€1bn), 15% (€1–30bn), 18% (&gt;€30bn)</li>
                    <li>ILM derived from 10-year average loss; option to force ILM = 1 (national discretion)</li>
                    <li><strong>Stress slider</strong> (-30% to +50%) on BI for what-if</li>
                    <li>Average annual loss <strong>auto-derived</strong> from approved events</li>
                    <li>Export breakdown to CSV; print to PDF</li>
                  </ul>
                </section>

                <section className="border-t border-slate-200 dark:border-white/10 pt-4">
                  <h4 className="flex items-center text-lg font-bold text-slate-800 dark:text-white mb-2">
                    <Server className="w-5 h-5 mr-2 text-brand-brown" /> 9. DORA / Operational Resilience
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Operational resilience module aligned to the Digital Operational Resilience Act.</p>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-slate-600 dark:text-slate-300 mt-2">
                    <li><strong>Third Parties</strong> register with criticality and ICT 3rd-party flag (DORA art. 28)</li>
                    <li><strong>BIA</strong> per process: RTO / RPO / MTPD with criticality rating</li>
                    <li><strong>ICT Incidents</strong>: Major / Significant / Operational classification (DORA art. 18)</li>
                  </ul>
                </section>

                <section className="border-t border-slate-200 dark:border-white/10 pt-4">
                  <h4 className="flex items-center text-lg font-bold text-slate-800 dark:text-white mb-2">
                    <CheckCircle className="w-5 h-5 mr-2 text-brand-brown" /> 10. Data Quality
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Live diagnostics on the integrity of your risk data.</p>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-slate-600 dark:text-slate-300 mt-2">
                    <li>Event mandatory fields, event → process integrity</li>
                    <li>Risks without controls, controls pending testing</li>
                    <li>Possible duplicate events, processes without department</li>
                    <li>Overall <strong>DQ score</strong> rolled up from all checks</li>
                  </ul>
                </section>

                <section className="border-t border-slate-200 dark:border-white/10 pt-4">
                  <h4 className="flex items-center text-lg font-bold text-slate-800 dark:text-white mb-2">
                    <Plug className="w-5 h-5 mr-2 text-brand-brown" /> 11. External Loss Data
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Sandbox connectors to industry external loss databases for benchmarking and ICAAP scenario calibration.</p>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-slate-600 dark:text-slate-300 mt-2">
                    <li>ORX, ORIC, SAS Global Data, IBM Algo FIRST, Risk Global Exchange</li>
                    <li><strong>Connect / Disconnect</strong> handshake (mock; real OAuth / API key flows configured per tenant)</li>
                  </ul>
                </section>

                <section className="border-t border-slate-200 dark:border-white/10 pt-4">
                  <h4 className="flex items-center text-lg font-bold text-slate-800 dark:text-white mb-2">
                    <Globe className="w-5 h-5 mr-2 text-brand-brown" /> Real-time sync &amp; permissions
                  </h4>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-slate-600 dark:text-slate-300 mt-2">
                    <li>All changes sync instantly across users (Supabase realtime)</li>
                    <li><strong>Roles:</strong> Administrator (full), OpRisk (validation + capital), First Line (capture own data), Auditor (read-only)</li>
                  </ul>
                </section>

                <section className="border-t border-slate-200 dark:border-white/10 pt-4">
                  <h4 className="flex items-center text-lg font-bold text-slate-800 dark:text-white mb-2">
                    <Download className="w-5 h-5 mr-2 text-brand-brown" /> CSV Import Formats
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Semicolon (;) separator. Failed rows produce an automatic error report download.
                  </p>
                  <div className="mt-4 space-y-3">
                    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
                      <p className="text-xs font-bold text-brand-brown mb-1">Events:</p>
                      <code className="text-[10px] block break-all text-slate-500">
                        Date;Title;Amount;EventType;Level2;BusinessLine;Dept;ProcessID;Description;Email
                      </code>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
                      <p className="text-xs font-bold text-brand-brown mb-1">RCSA (dynamic):</p>
                      <code className="text-[10px] block break-all text-slate-500">
                        Type;ID;Name;ParentID;Owner;Description;InherentProb;InherentImpact;ResidualProb;ResidualImpact;ControlType;Frequency;TestFrequency
                      </code>
                      <p className="text-[10px] text-slate-400 mt-2 italic">* Type ∈ DEPT / PROC / RISK / CTRL. ParentID is the parent element ID.</p>
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
              <NavItem view={ViewState.RCSA} icon={ShieldCheck} label={t.rcsa} />
              <NavItem view={ViewState.CONTROL_TESTING} icon={CheckSquare} label={t.controlTesting} />
              <NavItem view={ViewState.DATA} icon={Database} label={t.data} />
              <NavItem view={ViewState.KRIS} icon={Activity} label={t.kris} />
              <NavItem view={ViewState.APPETITE} icon={Target} label={t.appetite} />
              <NavItem view={ViewState.ISSUES} icon={AlertCircle} label={t.issues} />
              <NavItem view={ViewState.SCENARIOS} icon={Sparkles} label={t.scenarios} />
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