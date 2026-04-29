
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import EventModule from './components/EventModule';
import RCSA from './components/RCSA';
import ControlTesting from './components/ControlTesting';
import CapitalEngine from './components/CapitalEngine';
import AuditLogs from './components/AuditLogs';
import UserManagement from './components/UserManagement';
import KRIs from './components/KRIs';
import IssuesModule from './components/IssuesModule';
import Scenarios from './components/Scenarios';
import RiskAppetite from './components/RiskAppetite';
import DORA from './components/DORA';
import DataQuality from './components/DataQuality';
import Integrations from './components/Integrations';
import {
    ViewState, User, Language, Department, Process, RiskItem, Control, OpEvent, AuditLog,
    KRI, Issue, Scenario, AppetiteStatement, Vendor, BIA, ICTIncident, Integration
} from './types';
import { PersistenceService, AppState } from './src/services/persistence';
import {
    SEED_USERS, SEED_DEPARTMENTS, SEED_PROCESSES, SEED_RISKS, SEED_CONTROLS, SEED_EVENTS,
    SEED_KRIS, SEED_ISSUES, SEED_SCENARIOS, SEED_APPETITE, SEED_VENDORS, SEED_BIA, SEED_ICT_INCIDENTS
} from './src/data/seeds';

const SYNC_COOLDOWN = 2000;

// If a Supabase load returns fewer items than the seed (or none),
// keep the seed so users see realistic data instead of stale or empty tables.
const seedIfSparse = <T,>(loaded: T[] | undefined, seed: T[], minSize?: number): T[] => {
    const min = minSize ?? Math.min(seed.length, 3);
    if (!loaded || loaded.length < min) return seed;
    return loaded;
};

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [language, setLanguage] = useState<Language>('EN');

    const isRemoteUpdate = React.useRef(false);
    const lastLocalSave = React.useRef(0);

    // Core state — initialised with realistic banking seeds
    const [users, setUsers] = useState<User[]>(SEED_USERS);
    const [departments, setDepartments] = useState<Department[]>(SEED_DEPARTMENTS);
    const [processes, setProcesses] = useState<Process[]>(SEED_PROCESSES);
    const [risks, setRisks] = useState<RiskItem[]>(SEED_RISKS);
    const [controls, setControls] = useState<Control[]>(SEED_CONTROLS);
    const [events, setEvents] = useState<OpEvent[]>(SEED_EVENTS);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

    // Phase modules — seeded with examples
    const [kris, setKris] = useState<KRI[]>(SEED_KRIS);
    const [issues, setIssues] = useState<Issue[]>(SEED_ISSUES);
    const [scenarios, setScenarios] = useState<Scenario[]>(SEED_SCENARIOS);
    const [appetite, setAppetite] = useState<AppetiteStatement[]>(SEED_APPETITE);
    const [vendors, setVendors] = useState<Vendor[]>(SEED_VENDORS);
    const [bias, setBias] = useState<BIA[]>(SEED_BIA);
    const [ictIncidents, setIctIncidents] = useState<ICTIncident[]>(SEED_ICT_INCIDENTS);
    const [integrations, setIntegrations] = useState<Integration[]>([]);

    const logAction = (module: string, type: AuditLog['type'], action: string) => {
        const newLog: AuditLog = {
            id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            date: new Date().toISOString().replace('T', ' ').substring(0, 19),
            user: user?.email || 'system',
            module,
            type,
            action
        };
        setAuditLogs(prev => [newLog, ...prev]);
    };

    // Sync with Supabase — falls back to seeds when remote data is empty or sparse
    useEffect(() => {
        const fetchInitial = async (isManualSync = false) => {
            if (!isManualSync && Date.now() - lastLocalSave.current < SYNC_COOLDOWN) {
                return;
            }
            const data = await PersistenceService.loadFromSupabase();
            if (data) {
                isRemoteUpdate.current = true;
                setUsers(seedIfSparse(data.users, SEED_USERS));
                setDepartments(seedIfSparse(data.departments, SEED_DEPARTMENTS, 5));
                setProcesses(seedIfSparse(data.processes, SEED_PROCESSES, 8));
                setRisks(seedIfSparse(data.risks, SEED_RISKS, 10));
                setControls(seedIfSparse(data.controls, SEED_CONTROLS, 15));
                setEvents(seedIfSparse(data.events, SEED_EVENTS, 5));
                setAuditLogs(data.auditLogs || []);
                setKris(seedIfSparse(data.kris, SEED_KRIS, 1));
                setIssues(seedIfSparse(data.issues, SEED_ISSUES, 1));
                setScenarios(seedIfSparse(data.scenarios, SEED_SCENARIOS, 1));
                setAppetite(seedIfSparse(data.appetite, SEED_APPETITE, 1));
                setVendors(seedIfSparse(data.vendors, SEED_VENDORS, 1));
                setBias(seedIfSparse(data.bias, SEED_BIA, 1));
                setIctIncidents(seedIfSparse(data.ictIncidents, SEED_ICT_INCIDENTS, 1));
                setIntegrations(data.integrations || []);
            }
        };

        fetchInitial(true);

        const unsubscribe = PersistenceService.subscribeToChanges(() => {
            fetchInitial();
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (isDarkMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    const handleLogin = (user: User) => {
        setUser(user);
        setCurrentView(ViewState.DASHBOARD);
        logAction('System', 'Creation', `User ${user.email} logged in`);
    };

    const handleLogout = () => {
        logAction('System', 'Delete', `User ${user?.email} logged out`);
        setUser(null);
        setCurrentView(ViewState.LOGIN);
    };

    useEffect(() => {
        if (isRemoteUpdate.current) {
            isRemoteUpdate.current = false;
            return;
        }
        const currentState: AppState = {
            users, events, departments, processes, risks, controls, auditLogs,
            kris, issues, scenarios, appetite, vendors, bias, ictIncidents, integrations
        };
        lastLocalSave.current = Date.now();
        PersistenceService.save(currentState);
    }, [users, events, departments, processes, risks, controls, auditLogs,
        kris, issues, scenarios, appetite, vendors, bias, ictIncidents, integrations]);

    if (!user) {
        return <Login onLogin={handleLogin} users={users} setUsers={setUsers} />;
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
            {currentView === ViewState.DASHBOARD && <Dashboard events={events} controls={controls} />}

            {currentView === ViewState.DATA && (
                <EventModule
                    language={language}
                    user={user}
                    events={events}
                    setEvents={setEvents}
                    departments={departments}
                    processes={processes}
                    controls={controls}
                    logAction={logAction}
                />
            )}

            {currentView === ViewState.RCSA && (
                <RCSA
                    language={language}
                    departments={departments} setDepartments={setDepartments}
                    processes={processes} setProcesses={setProcesses}
                    risks={risks} setRisks={setRisks}
                    controls={controls} setControls={setControls}
                    logAction={logAction}
                />
            )}

            {currentView === ViewState.CONTROL_TESTING && (
                <ControlTesting
                    language={language}
                    user={user}
                    controls={controls}
                    setControls={setControls}
                    departments={departments}
                    processes={processes}
                    risks={risks}
                    logAction={logAction}
                />
            )}

            {currentView === ViewState.KRIS && (
                <KRIs language={language} kris={kris} setKris={setKris} risks={risks} logAction={logAction} />
            )}

            {currentView === ViewState.ISSUES && (
                <IssuesModule
                    language={language}
                    issues={issues} setIssues={setIssues}
                    events={events} controls={controls}
                    logAction={logAction}
                />
            )}

            {currentView === ViewState.SCENARIOS && (
                <Scenarios language={language} scenarios={scenarios} setScenarios={setScenarios} logAction={logAction} />
            )}

            {currentView === ViewState.APPETITE && (
                <RiskAppetite language={language} appetite={appetite} setAppetite={setAppetite} events={events} logAction={logAction} />
            )}

            {currentView === ViewState.CAPITAL && <CapitalEngine user={user} events={events} logAction={logAction} />}

            {currentView === ViewState.DORA && (
                <DORA
                    language={language}
                    vendors={vendors} setVendors={setVendors}
                    bias={bias} setBias={setBias}
                    ictIncidents={ictIncidents} setIctIncidents={setIctIncidents}
                    processes={processes}
                    logAction={logAction}
                />
            )}

            {currentView === ViewState.DATA_QUALITY && (
                <DataQuality events={events} risks={risks} controls={controls} processes={processes} departments={departments} />
            )}

            {currentView === ViewState.INTEGRATIONS && (
                <Integrations language={language} integrations={integrations} setIntegrations={setIntegrations} logAction={logAction} />
            )}

            {currentView === ViewState.AUDIT_LOGS && <AuditLogs language={language} logs={auditLogs} />}

            {currentView === ViewState.USERS && (
                <UserManagement
                    users={users}
                    setUsers={setUsers}
                    currentUser={user}
                    logAction={logAction}
                />
            )}
        </Layout>
    );
}

export default App;
