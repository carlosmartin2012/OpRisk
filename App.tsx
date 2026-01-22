
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import EventModule from './components/EventModule';
import RCSA from './components/RCSA';
import ControlTesting from './components/ControlTesting';
import CapitalEngine from './components/CapitalEngine';
import AuditLogs from './components/AuditLogs';
import { ViewState, User, Language, UserRole } from './types';
import { Users, MoreVertical, Shield, User as UserIcon, Briefcase, Eye } from 'lucide-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [language, setLanguage] = useState<Language>('EN');

  // Initialize theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleLogin = (user: User) => {
    setUser(user);
    setCurrentView(ViewState.DASHBOARD);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView(ViewState.LOGIN);
  };

  // --- User Management Component (Internal) ---
  const UserManagement = () => {
    // Mock user list
    const [mockUsers, setMockUsers] = useState<User[]>([
        { id: 'U1', email: 'risk.head@nfq.es', name: 'Maria Garcia', role: 'OpRisk', department: 'Risk Dept', lastLogin: '2023-10-26 09:30', status: 'Active' },
        { id: 'U2', email: 'trader.lead@nfq.es', name: 'John Smith', role: 'First Line', department: 'Trading', lastLogin: '2023-10-25 14:20', status: 'Active' },
        { id: 'U3', email: 'audit.senior@nfq.es', name: 'Laura Chen', role: 'Auditor', department: 'Internal Audit', lastLogin: '2023-10-26 10:00', status: 'Active' },
    ]);

    const changeRole = (id: string, newRole: UserRole) => {
        if (user?.role !== 'OpRisk') return; // Only Admin can change roles
        setMockUsers(mockUsers.map(u => u.id === id ? { ...u, role: newRole } : u));
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">User Management</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Manage platform access and role-based permissions.</p>
            </div>
            
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
                 <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                            <th className="py-4 px-6">User</th>
                            <th className="py-4 px-6">Department</th>
                            <th className="py-4 px-6">Role</th>
                            <th className="py-4 px-6">Last Login</th>
                            <th className="py-4 px-6 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                        {mockUsers.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                <td className="py-4 px-6">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold mr-3">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{u.name}</p>
                                            <p className="text-xs text-slate-500">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">{u.department}</td>
                                <td className="py-4 px-6">
                                    {user?.role === 'OpRisk' ? (
                                        <div className="flex items-center gap-2">
                                            <select 
                                                value={u.role}
                                                onChange={(e) => changeRole(u.id, e.target.value as UserRole)}
                                                className="bg-transparent border border-slate-300 dark:border-white/10 rounded px-2 py-1 text-xs font-medium focus:ring-1 focus:ring-brand-brown text-slate-700 dark:text-slate-200"
                                            >
                                                <option value="OpRisk">OpRisk</option>
                                                <option value="First Line">First Line</option>
                                                <option value="Auditor">Auditor</option>
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                             {u.role === 'OpRisk' && <Shield className="w-3 h-3 text-red-500"/>}
                                             {u.role === 'First Line' && <Briefcase className="w-3 h-3 text-blue-500"/>}
                                             {u.role === 'Auditor' && <Eye className="w-3 h-3 text-amber-500"/>}
                                             <span className="text-sm text-slate-700 dark:text-slate-300">{u.role}</span>
                                        </div>
                                    )}
                                </td>
                                <td className="py-4 px-6 text-xs text-slate-500 font-mono">{u.lastLogin}</td>
                                <td className="py-4 px-6 text-center">
                                    <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase">
                                        {u.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
            </div>
            {user?.role !== 'OpRisk' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                    You are viewing this page as <strong>{user?.role}</strong>. Only <strong>OpRisk</strong> admins can modify user roles.
                </div>
            )}
        </div>
    );
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout 
      currentView={currentView} 
      setView={setCurrentView} 
      user={user}
      onLogout={handleLogout}
      isDarkMode={isDarkMode}
      toggleTheme={toggleTheme}
      language={language}
      setLanguage={setLanguage}
    >
      {currentView === ViewState.DASHBOARD && <Dashboard />}
      {currentView === ViewState.DATA && <EventModule language={language} user={user} />}
      {currentView === ViewState.RCSA && <RCSA language={language} />}
      {currentView === ViewState.CONTROL_TESTING && <ControlTesting language={language} user={user} />}
      {currentView === ViewState.CAPITAL && <CapitalEngine user={user} />}
      {currentView === ViewState.AUDIT_LOGS && <AuditLogs language={language} />}
      {currentView === ViewState.USERS && <UserManagement />}
    </Layout>
  );
}

export default App;
