
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

const SYNC_COOLDOWN = 2000;

const DEFAULT_USERS: User[] = [
    { id: 'U4', email: 'carlos.martin@nfq.es', name: 'Carlos Martin', role: 'Administrator', department: 'Management', lastLogin: '2023-10-26 11:00', status: 'Active' },
];

const DEFAULT_DEPARTMENTS: Department[] = [
    { id: 'DEP-01', name: 'Retail Banking' },
    { id: 'DEP-02', name: 'Global Markets' },
    { id: 'DEP-03', name: 'Information Tech' },
];

const DEFAULT_PROCESSES: Process[] = [
    { id: 'PROC-RB-01', departmentId: 'DEP-01', name: 'Card Issuance', owner: 'John Doe' },
    { id: 'PROC-RB-02', departmentId: 'DEP-01', name: 'Mortgage Underwriting', owner: 'Jane Smith' },
    { id: 'PROC-GM-01', departmentId: 'DEP-02', name: 'FX Trading', owner: 'Mike Ross' },
    { id: 'PROC-IT-01', departmentId: 'DEP-03', name: 'Access Management', owner: 'Alice Tech' },
];

const DEFAULT_RISKS: RiskItem[] = [
    { id: 'R-001', processId: 'PROC-RB-01', name: 'Unauthorized issuance', description: 'Unauthorized issuance of cards', inherentProb: 4, inherentImpact: 5, residualProb: 2, residualImpact: 3, controlIds: ['CTRL-01', 'CTRL-02'] },
    { id: 'R-002', processId: 'PROC-RB-01', name: 'Data Leakage', description: 'Customer data leakage', inherentProb: 5, inherentImpact: 5, residualProb: 3, residualImpact: 4, controlIds: ['CTRL-05'] },
    { id: 'R-003', processId: 'PROC-GM-01', name: 'Settlement Fail', description: 'Trade settlement failure', inherentProb: 3, inherentImpact: 4, residualProb: 2, residualImpact: 2, controlIds: [] },
    { id: 'R-004', processId: 'PROC-IT-01', name: 'Privilege Escalation', description: ' unauthorized admin access', inherentProb: 5, inherentImpact: 4, residualProb: 4, residualImpact: 2, controlIds: [] }
];

const DEFAULT_CONTROLS: Control[] = [
    { id: 'CTRL-01', riskId: 'R-001', name: 'Dual Auth', description: 'Dual authentication', type: 'Preventive', frequency: 'Daily', testingFrequency: 'Monthly', status: 'Tested', owner: 'Sec Team' },
    { id: 'CTRL-02', riskId: 'R-001', name: 'Reconciliation', description: 'Daily reconcilation', type: 'Detective', frequency: 'Daily', testingFrequency: 'Monthly', status: 'Validated', owner: 'Ops Team' },
    { id: 'CTRL-05', riskId: 'R-002', name: 'Vendor Check', description: 'Vendor check', type: 'Preventive', frequency: 'Quarterly', testingFrequency: 'Annually', status: 'Validated', owner: 'Risk Team' }
];

const DEFAULT_EVENTS: OpEvent[] = [
    {
        id: "EVT-2023-001", dateDiscovery: "2023-10-15", title: "ATM Skimming North", description: "Card skimming devices found at 3 ATMs in North region.", amount: 45000, currency: "EUR",
        eventType: "External Fraud", eventTypeLevel2: "Theft and Fraud", businessLine: "Retail Banking",
        processId: "PROC-RB-01", employeeEmail: "branch.manager@nfq.es", department: "Retail Network North", status: "Approved",
        auditTrail: [{ date: "2023-10-16 10:00", user: "system", action: "Created via CSV" }]
    },
    {
        id: "EVT-2023-002", dateDiscovery: "2023-10-18", title: "Settlement Error", description: "Manual error in trade settlement instructions.", amount: 12500, currency: "EUR",
        eventType: "Execution, Delivery & Process Management", eventTypeLevel2: "Transaction Capture, Execution & Maintenance", businessLine: "Trading & Sales",
        processId: "PROC-GM-01", employeeEmail: "trader.joe@nfq.es", department: "Global Markets", status: "Pending Validation",
        auditTrail: [{ date: "2023-10-18 14:30", user: "system", action: "Created via CSV" }]
    }
];

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [language, setLanguage] = useState<Language>('EN');

    const isRemoteUpdate = React.useRef(false);
    const lastLocalSave = React.useRef(0);

    // Core state
    const [users, setUsers] = useState<User[]>(DEFAULT_USERS);
    const [departments, setDepartments] = useState<Department[]>(DEFAULT_DEPARTMENTS);
    const [processes, setProcesses] = useState<Process[]>(DEFAULT_PROCESSES);
    const [risks, setRisks] = useState<RiskItem[]>(DEFAULT_RISKS);
    const [controls, setControls] = useState<Control[]>(DEFAULT_CONTROLS);
    const [events, setEvents] = useState<OpEvent[]>(DEFAULT_EVENTS);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

    // New state (P0 / P1 / P2 / P3)
    const [kris, setKris] = useState<KRI[]>([]);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [scenarios, setScenarios] = useState<Scenario[]>([]);
    const [appetite, setAppetite] = useState<AppetiteStatement[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [bias, setBias] = useState<BIA[]>([]);
    const [ictIncidents, setIctIncidents] = useState<ICTIncident[]>([]);
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

    // Sync with Supabase
    useEffect(() => {
        const fetchInitial = async (isManualSync = false) => {
            if (!isManualSync && Date.now() - lastLocalSave.current < SYNC_COOLDOWN) {
                return;
            }
            const data = await PersistenceService.loadFromSupabase();
            if (data) {
                isRemoteUpdate.current = true;
                setUsers(data.users);
                setDepartments(data.departments);
                setProcesses(data.processes);
                setRisks(data.risks);
                setControls(data.controls);
                setEvents(data.events);
                setAuditLogs(data.auditLogs || []);
                setKris(data.kris || []);
                setIssues(data.issues || []);
                setScenarios(data.scenarios || []);
                setAppetite(data.appetite || []);
                setVendors(data.vendors || []);
                setBias(data.bias || []);
                setIctIncidents(data.ictIncidents || []);
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

    // Persist on any change
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
