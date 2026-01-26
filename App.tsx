
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
import { ViewState, User, Language, Department, Process, RiskItem, Control, OpEvent } from './types';
import { PersistenceService, AppState } from './src/services/persistence';

// --- DEFAULT DATA ---
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
    // Attempt load from persistence
    const savedState = PersistenceService.load();

    const [user, setUser] = useState<User | null>(null);
    const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [language, setLanguage] = useState<Language>('EN');

    // Ref to prevent broadcasting updates that came from synchronization
    const isRemoteUpdate = React.useRef(false);

    // Global State
    const [users, setUsers] = useState<User[]>(savedState?.users || DEFAULT_USERS);
    const [departments, setDepartments] = useState<Department[]>(savedState?.departments || DEFAULT_DEPARTMENTS);
    const [processes, setProcesses] = useState<Process[]>(savedState?.processes || DEFAULT_PROCESSES);
    const [risks, setRisks] = useState<RiskItem[]>(savedState?.risks || DEFAULT_RISKS);
    const [controls, setControls] = useState<Control[]>(savedState?.controls || DEFAULT_CONTROLS);
    const [events, setEvents] = useState<OpEvent[]>(savedState?.events || DEFAULT_EVENTS);

    // Subscribe to cross-tab updates
    useEffect(() => {
        const unsubscribe = PersistenceService.subscribe((newState) => {
            console.log('Applying remote update...');
            isRemoteUpdate.current = true;
            // Batched updates
            setUsers(newState.users);
            setDepartments(newState.departments);
            setProcesses(newState.processes);
            setRisks(newState.risks);
            setControls(newState.controls);
            setEvents(newState.events);
        });
        return unsubscribe;
    }, []);

    // Initialize theme
    useEffect(() => {
        if (isDarkMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
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

    // Persistence Effect
    useEffect(() => {
        const currentState: AppState = {
            users,
            events,
            departments,
            processes,
            risks,
            controls
        };

        if (isRemoteUpdate.current) {
            // If this update was triggered by a remote sync, do not broadcast it back
            isRemoteUpdate.current = false;
            // We still save to localStorage to ensure this tab's storage is consistent 
            // (though BroadcastChannel handler in PersistenceService doesn't write to LS, assuming this effect does)
            PersistenceService.save(currentState, false);
        } else {
            // Local change, save and broadcast
            PersistenceService.save(currentState, true);
        }
    }, [users, events, departments, processes, risks, controls]);

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
                />
            )}

            {currentView === ViewState.RCSA && (
                <RCSA
                    language={language}
                    departments={departments} setDepartments={setDepartments}
                    processes={processes} setProcesses={setProcesses}
                    risks={risks} setRisks={setRisks}
                    controls={controls} setControls={setControls}
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
                />
            )}

            {currentView === ViewState.CAPITAL && <CapitalEngine user={user} />}

            {currentView === ViewState.AUDIT_LOGS && <AuditLogs language={language} />}

            {currentView === ViewState.USERS && (
                <UserManagement
                    users={users}
                    setUsers={setUsers}
                    currentUser={user}
                />
            )}
        </Layout>
    );
}

export default App;
