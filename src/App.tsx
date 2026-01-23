
import React, { useState, useEffect } from 'react';
import Login from './features/auth/Login';
import Layout from './layouts/MainLayout';
import Dashboard from './features/dashboard/Dashboard';
import EventModule from './features/events/EventModule';
import RCSA from './features/rcsa/RCSA';
import ControlTesting from './features/controls/ControlTesting';
import CapitalEngine from './features/capital/CapitalEngine';
import AuditLogs from './features/audit/AuditLogs';
import UserManagement from './features/admin/UserManagement';
import { ViewState, User, Language } from './types';

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
            {currentView === ViewState.USERS && <UserManagement currentUser={user} />}
        </Layout>
    );
}

export default App;
