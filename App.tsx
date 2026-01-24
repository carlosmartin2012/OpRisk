
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
import { ViewState, User, Language, Department, Process, RiskItem, Control, OpEvent, EBA_EVENT_TYPES, BUSINESS_LINES } from './types';

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [language, setLanguage] = useState<Language>('EN');

    // --- GLOBAL STATE ---

    // 1. Users
    const [users, setUsers] = useState<User[]>([
        { id: 'U1', email: 'risk.head@nfq.es', name: 'Maria Garcia', role: 'OpRisk', department: 'Risk Dept', lastLogin: '2023-10-26 09:30', status: 'Active' },
        { id: 'U2', email: 'trader.lead@nfq.es', name: 'John Smith', role: 'First Line', department: 'Trading', lastLogin: '2023-10-25 14:20', status: 'Active' },
        { id: 'U3', email: 'audit.senior@nfq.es', name: 'Laura Chen', role: 'Auditor', department: 'Internal Audit', lastLogin: '2023-10-26 10:00', status: 'Active' },
        { id: 'U4', email: 'carlos.martin@nfq.es', name: 'Carlos Martin', role: 'Administrator', department: 'Management', lastLogin: '2023-10-26 11:00', status: 'Active' },
    ]);

    // 2. Departments & Processes (Shared between RCSA and Event Module)
    const [departments, setDepartments] = useState<Department[]>([
        { id: 'DEP-01', name: 'Retail Banking' },
        { id: 'DEP-02', name: 'Global Markets' },
        { id: 'DEP-03', name: 'Information Tech' },
    ]);

    const [processes, setProcesses] = useState<Process[]>([
        { id: 'PROC-RB-01', departmentId: 'DEP-01', name: 'Card Issuance', owner: 'John Doe' },
        { id: 'PROC-RB-02', departmentId: 'DEP-01', name: 'Mortgage Underwriting', owner: 'Jane Smith' },
        { id: 'PROC-GM-01', departmentId: 'DEP-02', name: 'FX Trading', owner: 'Mike Ross' },
        { id: 'PROC-IT-01', departmentId: 'DEP-03', name: 'Access Management', owner: 'Alice Tech' },
    ]);

    // 3. Risks & Controls (RCSA)
    const [risks, setRisks] = useState<RiskItem[]>([
        {
            id: 'R-001', processId: 'PROC-RB-01', description: 'Unauthorized issuance',
            inherentProb: 4, inherentImpact: 5, residualProb: 2, residualImpact: 3, controlIds: ['CTRL-01', 'CTRL-02']
        },
        {
            id: 'R-002', processId: 'PROC-RB-01', description: 'Data Leakage',
            inherentProb: 5, inherentImpact: 5, residualProb: 3, residualImpact: 4, controlIds: ['CTRL-05']
        },
        {
            id: 'R-003', processId: 'PROC-GM-01', description: 'Settlement Fail',
            inherentProb: 3, inherentImpact: 4, residualProb: 2, residualImpact: 2, controlIds: []
        },
        {
            id: 'R-004', processId: 'PROC-IT-01', description: 'Privilege Escalation',
            inherentProb: 5, inherentImpact: 4, residualProb: 4, residualImpact: 2, controlIds: []
        }
    ]);

    const [controls, setControls] = useState<Control[]>([
        { id: 'CTRL-01', riskId: 'R-001', description: 'Dual authentication', type: 'Preventive', frequency: 'Daily', testingFrequency: 'Monthly', status: 'Tested', owner: 'Sec Team' },
        { id: 'CTRL-02', riskId: 'R-001', description: 'Daily reconcilation', type: 'Detective', frequency: 'Daily', testingFrequency: 'Monthly', status: 'Validated', owner: 'Ops Team' },
        { id: 'CTRL-05', riskId: 'R-002', description: 'Vendor check', type: 'Preventive', frequency: 'Quarterly', testingFrequency: 'Annually', status: 'Validated', owner: 'Risk Team' }
    ]);

    // 4. Events (Event Module)
    const [events, setEvents] = useState<OpEvent[]>([
        {
            id: "EVT-2023-001",
            dateDiscovery: "2023-10-15",
            title: "ATM Skimming North",
            amount: 45000,
            currency: "EUR",
            eventType: EBA_EVENT_TYPES[1], // External Fraud
            eventTypeLevel2: "Theft and Fraud",
            businessLine: "Retail Banking",
            processId: "PROC-RB-01",
            employeeEmail: "branch.manager@nfq.es",
            department: "Retail Network North",
            status: "Approved",
            auditTrail: [{ date: "2023-10-16 10:00", user: "system", action: "Created via CSV" }]
        },
        {
            id: "EVT-2023-002",
            dateDiscovery: "2023-10-18",
            title: "Settlement Error",
            amount: 12500,
            currency: "EUR",
            eventType: EBA_EVENT_TYPES[6], // Execution...
            eventTypeLevel2: "Transaction Capture, Execution & Maintenance",
            businessLine: "Trading & Sales",
            processId: "PROC-GM-01",
            employeeEmail: "trader.joe@nfq.es",
            department: "Global Markets",
            status: "Pending Validation",
            auditTrail: [{ date: "2023-10-18 14:30", user: "system", action: "Created via CSV" }]
        }
    ]);

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
            {currentView === ViewState.DASHBOARD && <Dashboard />}

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

            {currentView === ViewState.CONTROL_TESTING && <ControlTesting language={language} user={user} />}

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
