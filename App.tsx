import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import EventModule from './components/EventModule';
import RCSA from './components/RCSA';
import ControlTesting from './components/ControlTesting';
import CapitalEngine from './components/CapitalEngine';
import AuditLogs from './components/AuditLogs';
import { ViewState, User, Language } from './types';
import { Users } from 'lucide-react';

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

  // User Management Placeholder
  const UserManagement = () => (
    <div className="text-center py-20">
      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
        <Users className="w-10 h-10 text-slate-400" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h2>
      <p className="text-slate-500 mt-2">Admin panel for managing access rights and roles.</p>
      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-500/20 inline-block rounded-lg text-yellow-700 dark:text-yellow-500">
         Feature currently limited to Admin: {user?.name}
      </div>
    </div>
  );

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
      {currentView === ViewState.CAPITAL && <CapitalEngine />}
      {currentView === ViewState.AUDIT_LOGS && <AuditLogs language={language} />}
      {currentView === ViewState.USERS && <UserManagement />}
    </Layout>
  );
}

export default App;