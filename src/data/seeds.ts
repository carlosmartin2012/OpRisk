
import {
    User, Department, Process, RiskItem, Control, OpEvent,
    KRI, Issue, Scenario, AppetiteStatement, Vendor, BIA, ICTIncident
} from '../../types';

export const SEED_USERS: User[] = [
    { id: 'U1', email: 'carlos.martin@nfq.es', name: 'Carlos Martin', role: 'Administrator', department: 'Management', lastLogin: '2026-04-29 09:12', status: 'Active' },
    { id: 'U2', email: 'oprisk.lead@nfq.es', name: 'Sarah Chen', role: 'OpRisk', department: 'Risk Management', lastLogin: '2026-04-28 17:45', status: 'Active' },
    { id: 'U3', email: 'firstline.retail@nfq.es', name: 'Marcus Reilly', role: 'First Line', department: 'Retail Banking', lastLogin: '2026-04-29 08:30', status: 'Active' },
    { id: 'U4', email: 'auditor@nfq.es', name: 'Elena Voss', role: 'Auditor', department: 'Internal Audit', lastLogin: '2026-04-25 11:00', status: 'Active' }
];

export const SEED_DEPARTMENTS: Department[] = [
    { id: 'DEP-01', name: 'Retail Banking' },
    { id: 'DEP-02', name: 'Global Markets' },
    { id: 'DEP-03', name: 'Information Technology' },
    { id: 'DEP-04', name: 'Corporate & Investment Banking' },
    { id: 'DEP-05', name: 'Wealth Management' },
    { id: 'DEP-06', name: 'Operations' },
    { id: 'DEP-07', name: 'Compliance & Legal' },
    { id: 'DEP-08', name: 'Human Resources' }
];

export const SEED_PROCESSES: Process[] = [
    // Retail Banking
    { id: 'PROC-RB-01', departmentId: 'DEP-01', name: 'Card Issuance', owner: 'Marcus Reilly', description: 'Issuance of debit and credit cards to retail customers' },
    { id: 'PROC-RB-02', departmentId: 'DEP-01', name: 'Mortgage Underwriting', owner: 'Jane Smith', description: 'Origination and approval of residential mortgages' },
    { id: 'PROC-RB-03', departmentId: 'DEP-01', name: 'Account Opening', owner: 'David Brown', description: 'Customer onboarding for current and savings accounts' },
    { id: 'PROC-RB-04', departmentId: 'DEP-01', name: 'Branch Cash Handling', owner: 'Sofia Garcia', description: 'Cash management at branch level including ATM replenishment' },
    { id: 'PROC-RB-05', departmentId: 'DEP-01', name: 'Online & Mobile Banking', owner: 'Pedro Alvarez', description: 'Digital channels for retail customers' },
    // Global Markets
    { id: 'PROC-GM-01', departmentId: 'DEP-02', name: 'FX Trading', owner: 'Mike Ross', description: 'Spot and forward foreign exchange transactions' },
    { id: 'PROC-GM-02', departmentId: 'DEP-02', name: 'Fixed Income Trading', owner: 'Anna Petrova', description: 'Government and corporate bond trading' },
    { id: 'PROC-GM-03', departmentId: 'DEP-02', name: 'Repo Operations', owner: 'James Wilson', description: 'Repurchase agreements and securities financing' },
    // IT
    { id: 'PROC-IT-01', departmentId: 'DEP-03', name: 'Identity & Access Management', owner: 'Alice Tech', description: 'User provisioning, access reviews, privileged accounts' },
    { id: 'PROC-IT-02', departmentId: 'DEP-03', name: 'Change Management', owner: 'Robert Kim', description: 'IT change control over production environments' },
    { id: 'PROC-IT-03', departmentId: 'DEP-03', name: 'Cybersecurity Operations', owner: 'Yuki Tanaka', description: 'SOC, threat detection and incident response' },
    // CIB
    { id: 'PROC-CIB-01', departmentId: 'DEP-04', name: 'Corporate Loan Origination', owner: 'Henry Mueller', description: 'Origination of corporate facilities and credit assessment' },
    { id: 'PROC-CIB-02', departmentId: 'DEP-04', name: 'Trade Finance', owner: 'Priya Sharma', description: 'Letters of credit, guarantees and documentary collections' },
    // Wealth
    { id: 'PROC-WM-01', departmentId: 'DEP-05', name: 'Discretionary Portfolio Mgmt', owner: 'Olivia Bennett', description: 'Active management of HNW client portfolios' },
    { id: 'PROC-WM-02', departmentId: 'DEP-05', name: 'Custody Services', owner: 'Lukas Weber', description: 'Safekeeping and asset servicing' },
    // Operations
    { id: 'PROC-OPS-01', departmentId: 'DEP-06', name: 'Settlements', owner: 'Carmen Lopez', description: 'Securities and cash settlement across asset classes' },
    { id: 'PROC-OPS-02', departmentId: 'DEP-06', name: 'Reconciliations', owner: 'Tom Reilly', description: 'Daily nostro and account reconciliations' },
    // Compliance
    { id: 'PROC-CMP-01', departmentId: 'DEP-07', name: 'KYC / AML', owner: 'Nadia Ibrahim', description: 'Customer due diligence and AML transaction monitoring' },
    { id: 'PROC-CMP-02', departmentId: 'DEP-07', name: 'Sanctions Screening', owner: 'Rafael Torres', description: 'Screening of customers and payments against sanctions lists' },
    // HR
    { id: 'PROC-HR-01', departmentId: 'DEP-08', name: 'Payroll', owner: 'Helena Schmidt', description: 'Monthly payroll calculation and disbursement' }
];

export const SEED_RISKS: RiskItem[] = [
    { id: 'R-001', processId: 'PROC-RB-01', name: 'Unauthorised Card Issuance', description: 'Cards issued without proper authentication of the requester', inherentProb: 4, inherentImpact: 5, residualProb: 2, residualImpact: 3, controlIds: ['CTRL-001', 'CTRL-002'], owner: 'Marcus Reilly' },
    { id: 'R-002', processId: 'PROC-RB-01', name: 'Card Skimming Fraud', description: 'External fraud through compromised ATMs and POS terminals', inherentProb: 5, inherentImpact: 4, residualProb: 3, residualImpact: 3, controlIds: ['CTRL-003'], owner: 'Marcus Reilly' },
    { id: 'R-003', processId: 'PROC-RB-02', name: 'Mortgage Approval Error', description: 'Incorrect affordability or LTV assessment leading to non-compliant approvals', inherentProb: 3, inherentImpact: 5, residualProb: 2, residualImpact: 3, controlIds: ['CTRL-004', 'CTRL-005'], owner: 'Jane Smith' },
    { id: 'R-004', processId: 'PROC-RB-03', name: 'Identity Theft on Onboarding', description: 'Account opened using stolen identity documents', inherentProb: 4, inherentImpact: 4, residualProb: 2, residualImpact: 3, controlIds: ['CTRL-006'], owner: 'David Brown' },
    { id: 'R-005', processId: 'PROC-RB-04', name: 'ATM Cash-out Fraud', description: 'Coordinated ATM withdrawals using cloned cards', inherentProb: 4, inherentImpact: 4, residualProb: 2, residualImpact: 3, controlIds: ['CTRL-007'], owner: 'Sofia Garcia' },
    { id: 'R-006', processId: 'PROC-RB-05', name: 'DDoS on Online Banking', description: 'Distributed denial of service against customer-facing channels', inherentProb: 4, inherentImpact: 4, residualProb: 2, residualImpact: 2, controlIds: ['CTRL-008'], owner: 'Pedro Alvarez' },
    { id: 'R-007', processId: 'PROC-RB-05', name: 'Customer Phishing Compromise', description: 'Customer credentials compromised via phishing leading to unauthorised payments', inherentProb: 5, inherentImpact: 4, residualProb: 4, residualImpact: 3, controlIds: ['CTRL-009'], owner: 'Pedro Alvarez' },
    { id: 'R-008', processId: 'PROC-GM-01', name: 'Rogue Trading', description: 'Unauthorised trading positions exceeding mandate or limits', inherentProb: 2, inherentImpact: 5, residualProb: 1, residualImpact: 4, controlIds: ['CTRL-010', 'CTRL-011'], owner: 'Mike Ross' },
    { id: 'R-009', processId: 'PROC-GM-01', name: 'FX Settlement Failure', description: 'Failed FX trade settlement due to operational error or counterparty issue', inherentProb: 3, inherentImpact: 4, residualProb: 2, residualImpact: 2, controlIds: ['CTRL-012'], owner: 'Mike Ross' },
    { id: 'R-010', processId: 'PROC-GM-02', name: 'Mispricing Bond Trades', description: 'Pricing errors causing P&L distortion or client complaints', inherentProb: 3, inherentImpact: 3, residualProb: 2, residualImpact: 2, controlIds: ['CTRL-013'], owner: 'Anna Petrova' },
    { id: 'R-011', processId: 'PROC-IT-01', name: 'Privilege Escalation', description: 'Unauthorised admin access to production systems', inherentProb: 4, inherentImpact: 5, residualProb: 2, residualImpact: 3, controlIds: ['CTRL-014', 'CTRL-015'], owner: 'Alice Tech' },
    { id: 'R-012', processId: 'PROC-IT-02', name: 'Change-induced Outage', description: 'Production outage caused by uncontrolled change', inherentProb: 4, inherentImpact: 4, residualProb: 2, residualImpact: 3, controlIds: ['CTRL-016'], owner: 'Robert Kim' },
    { id: 'R-013', processId: 'PROC-IT-03', name: 'Ransomware Attack', description: 'Encryption of critical systems by external threat actor', inherentProb: 3, inherentImpact: 5, residualProb: 2, residualImpact: 4, controlIds: ['CTRL-017', 'CTRL-018'], owner: 'Yuki Tanaka' },
    { id: 'R-014', processId: 'PROC-CIB-01', name: 'Credit Documentation Error', description: 'Errors in loan documentation causing legal unenforceability', inherentProb: 3, inherentImpact: 4, residualProb: 2, residualImpact: 2, controlIds: ['CTRL-019'], owner: 'Henry Mueller' },
    { id: 'R-015', processId: 'PROC-WM-01', name: 'Mis-selling of Products', description: 'Investment products sold without proper suitability assessment', inherentProb: 3, inherentImpact: 5, residualProb: 2, residualImpact: 3, controlIds: ['CTRL-020', 'CTRL-021'], owner: 'Olivia Bennett' },
    { id: 'R-016', processId: 'PROC-OPS-01', name: 'Settlement Failure', description: 'Failure to settle securities transactions on value date', inherentProb: 4, inherentImpact: 3, residualProb: 2, residualImpact: 2, controlIds: ['CTRL-022'], owner: 'Carmen Lopez' },
    { id: 'R-017', processId: 'PROC-OPS-02', name: 'Reconciliation Breaks', description: 'Persistent breaks in nostro reconciliations', inherentProb: 4, inherentImpact: 3, residualProb: 3, residualImpact: 2, controlIds: ['CTRL-023'], owner: 'Tom Reilly' },
    { id: 'R-018', processId: 'PROC-CMP-01', name: 'AML Reporting Failure', description: 'Failure to file SAR / STR within regulatory timeframes', inherentProb: 3, inherentImpact: 5, residualProb: 2, residualImpact: 3, controlIds: ['CTRL-024'], owner: 'Nadia Ibrahim' },
    { id: 'R-019', processId: 'PROC-CMP-02', name: 'Sanctions Breach', description: 'Payment processed to sanctioned counterparty', inherentProb: 2, inherentImpact: 5, residualProb: 1, residualImpact: 4, controlIds: ['CTRL-025'], owner: 'Rafael Torres' },
    { id: 'R-020', processId: 'PROC-HR-01', name: 'Payroll Calculation Error', description: 'Material error in salary calculation or tax withholding', inherentProb: 2, inherentImpact: 3, residualProb: 1, residualImpact: 2, controlIds: ['CTRL-026'], owner: 'Helena Schmidt' }
];

export const SEED_CONTROLS: Control[] = [
    { id: 'CTRL-001', riskId: 'R-001', name: 'Dual Authentication on Card Issuance', description: 'Two-factor identity verification required before issuing any card', type: 'Preventive', frequency: 'Daily', testingFrequency: 'Monthly', status: 'Validated', owner: 'Security Team', lastTested: '2026-03-31' },
    { id: 'CTRL-002', riskId: 'R-001', name: 'Card Issuance Reconciliation', description: 'Daily reconciliation of card production vs authorised requests', type: 'Detective', frequency: 'Daily', testingFrequency: 'Monthly', status: 'Validated', owner: 'Operations', lastTested: '2026-04-15' },
    { id: 'CTRL-003', riskId: 'R-002', name: 'ATM Anti-Skimming Inspection', description: 'Weekly physical inspection of ATM fascia and PIN pads', type: 'Preventive', frequency: 'Daily', testingFrequency: 'Quarterly', status: 'Tested', owner: 'Branch Network', lastTested: '2026-02-20' },
    { id: 'CTRL-004', riskId: 'R-003', name: 'Independent Mortgage Credit Review', description: '4-eyes review for all mortgages above €500k', type: 'Preventive', frequency: 'Daily', testingFrequency: 'Quarterly', status: 'Validated', owner: 'Credit Risk', lastTested: '2026-03-10' },
    { id: 'CTRL-005', riskId: 'R-003', name: 'LTV / DTI Automated Limits', description: 'System-enforced affordability ratios with override approval log', type: 'Preventive', frequency: 'Daily', testingFrequency: 'Annually', status: 'Validated', owner: 'IT Risk', lastTested: '2025-11-05' },
    { id: 'CTRL-006', riskId: 'R-004', name: 'eKYC with Liveness Check', description: 'Biometric verification at digital onboarding', type: 'Preventive', frequency: 'Daily', testingFrequency: 'Quarterly', status: 'Validated', owner: 'Compliance', lastTested: '2026-01-15' },
    { id: 'CTRL-007', riskId: 'R-005', name: 'ATM Velocity Limits', description: 'Max withdrawals per card per 24h with anomaly alerts', type: 'Detective', frequency: 'Daily', testingFrequency: 'Quarterly', status: 'Tested', owner: 'Fraud Team', lastTested: '2026-03-20' },
    { id: 'CTRL-008', riskId: 'R-006', name: 'CDN / WAF Protection', description: 'Cloud DDoS mitigation and rate limiting on online banking', type: 'Preventive', frequency: 'Daily', testingFrequency: 'Annually', status: 'Validated', owner: 'CISO', lastTested: '2025-12-01' },
    { id: 'CTRL-009', riskId: 'R-007', name: 'Step-up Authentication on Payments', description: 'Risk-based 3DS / OTP for high-risk transactions', type: 'Preventive', frequency: 'Daily', testingFrequency: 'Quarterly', status: 'Validated', owner: 'Digital Security', lastTested: '2026-02-28' },
    { id: 'CTRL-010', riskId: 'R-008', name: 'Pre-trade Limit Checks', description: 'System-enforced position and VaR limits before execution', type: 'Preventive', frequency: 'Daily', testingFrequency: 'Quarterly', status: 'Validated', owner: 'Market Risk', lastTested: '2026-03-12' },
    { id: 'CTRL-011', riskId: 'R-008', name: 'Independent Trade Mark-to-Market', description: 'Daily independent revaluation by Product Control', type: 'Detective', frequency: 'Daily', testingFrequency: 'Quarterly', status: 'Validated', owner: 'Product Control', lastTested: '2026-04-01' },
    { id: 'CTRL-012', riskId: 'R-009', name: 'Settlement Pre-matching', description: 'Pre-matching with counterparty before SSI submission', type: 'Detective', frequency: 'Daily', testingFrequency: 'Monthly', status: 'Tested', owner: 'Operations', lastTested: '2026-04-10' },
    { id: 'CTRL-013', riskId: 'R-010', name: 'Independent Price Verification', description: 'Monthly IPV against external pricing sources', type: 'Detective', frequency: 'Monthly', testingFrequency: 'Quarterly', status: 'Validated', owner: 'Product Control', lastTested: '2026-03-25' },
    { id: 'CTRL-014', riskId: 'R-011', name: 'Privileged Access Recertification', description: 'Quarterly review of privileged access', type: 'Detective', frequency: 'Quarterly', testingFrequency: 'Annually', status: 'Tested', owner: 'IAM Team', lastTested: '2026-01-15' },
    { id: 'CTRL-015', riskId: 'R-011', name: 'PAM Vaulting & Session Recording', description: 'Privileged Access Management with session logging', type: 'Preventive', frequency: 'Daily', testingFrequency: 'Quarterly', status: 'Pending', owner: 'CISO' },
    { id: 'CTRL-016', riskId: 'R-012', name: 'Change Advisory Board Approval', description: 'CAB approval required for production changes', type: 'Preventive', frequency: 'Daily', testingFrequency: 'Quarterly', status: 'Validated', owner: 'IT Operations', lastTested: '2026-02-15' },
    { id: 'CTRL-017', riskId: 'R-013', name: 'EDR / XDR Endpoint Protection', description: 'Endpoint detection on all corporate devices and servers', type: 'Detective', frequency: 'Daily', testingFrequency: 'Quarterly', status: 'Validated', owner: 'SOC', lastTested: '2026-03-30' },
    { id: 'CTRL-018', riskId: 'R-013', name: 'Immutable Backup with Air-gap', description: 'Daily immutable backups with restore drills', type: 'Detective', frequency: 'Daily', testingFrequency: 'Annually', status: 'Tested', owner: 'IT Operations', lastTested: '2025-10-05' },
    { id: 'CTRL-019', riskId: 'R-014', name: 'Legal Sign-off Standard Templates', description: 'Mandatory use of legal-approved facility templates', type: 'Preventive', frequency: 'Daily', testingFrequency: 'Annually', status: 'Validated', owner: 'Legal', lastTested: '2025-09-20' },
    { id: 'CTRL-020', riskId: 'R-015', name: 'Suitability Assessment Workflow', description: 'Mandatory MiFID II suitability questionnaire on each advice', type: 'Preventive', frequency: 'Daily', testingFrequency: 'Quarterly', status: 'Validated', owner: 'Wealth Compliance', lastTested: '2026-02-05' },
    { id: 'CTRL-021', riskId: 'R-015', name: 'Call Recording & QA Sampling', description: 'Recording of advice calls with monthly QA sampling', type: 'Detective', frequency: 'Daily', testingFrequency: 'Monthly', status: 'Tested', owner: 'Wealth Compliance', lastTested: '2026-04-05' },
    { id: 'CTRL-022', riskId: 'R-016', name: 'Daily Settlement Fail Report', description: 'Daily exception reporting on failed settlements', type: 'Detective', frequency: 'Daily', testingFrequency: 'Monthly', status: 'Validated', owner: 'Operations', lastTested: '2026-04-22' },
    { id: 'CTRL-023', riskId: 'R-017', name: 'Reconciliation Ageing Threshold', description: 'Items > 30 days escalated to senior management', type: 'Detective', frequency: 'Daily', testingFrequency: 'Monthly', status: 'Tested', owner: 'Operations', lastTested: '2026-04-15' },
    { id: 'CTRL-024', riskId: 'R-018', name: 'AML Transaction Monitoring System', description: 'Automated TM with tuned scenarios and SAR workflow', type: 'Detective', frequency: 'Daily', testingFrequency: 'Quarterly', status: 'Validated', owner: 'Financial Crime', lastTested: '2026-03-08' },
    { id: 'CTRL-025', riskId: 'R-019', name: 'Real-time Sanctions Screening', description: 'Real-time screening of all payments before release', type: 'Preventive', frequency: 'Daily', testingFrequency: 'Quarterly', status: 'Validated', owner: 'Financial Crime', lastTested: '2026-03-08' },
    { id: 'CTRL-026', riskId: 'R-020', name: 'Payroll 4-Eyes Approval', description: 'HR + Finance dual approval before disbursement', type: 'Preventive', frequency: 'Monthly', testingFrequency: 'Annually', status: 'Validated', owner: 'HR Operations', lastTested: '2025-12-30' }
];

export const SEED_EVENTS: OpEvent[] = [
    {
        id: 'EVT-2025-014', dateDiscovery: '2025-06-12', dateOccurrence: '2025-06-08', dateAccounting: '2025-06-30',
        title: 'ATM Skimming Campaign — North Region',
        description: 'Skimming devices and pinhole cameras found at 3 ATMs in the North region. 142 cards compromised, customers reimbursed.',
        amount: 87500, currency: 'EUR', recoveryDirect: 0, recoveryInsurance: 35000,
        eventType: 'External Fraud', eventTypeLevel2: 'Theft and Fraud', businessLine: 'Retail Banking',
        processId: 'PROC-RB-04', employeeEmail: 'sofia.garcia@nfq.es', department: 'Retail Banking',
        controlFailedId: 'CTRL-003', isNearMiss: false, status: 'Approved',
        auditTrail: [{ date: '2025-06-13 09:00', user: 'system', action: 'Reported by branch network' }]
    },
    {
        id: 'EVT-2025-027', dateDiscovery: '2025-08-22', dateOccurrence: '2025-08-21', dateAccounting: '2025-08-31',
        title: 'Online Banking Phishing — Customer Compromise',
        description: 'Wave of phishing emails impersonating the bank led to 23 compromised customer accounts. €145k transferred before detection.',
        amount: 145000, currency: 'EUR', recoveryDirect: 28000, recoveryInsurance: 0,
        eventType: 'External Fraud', eventTypeLevel2: 'Theft and Fraud', businessLine: 'Retail Banking',
        processId: 'PROC-RB-05', employeeEmail: 'pedro.alvarez@nfq.es', department: 'Retail Banking',
        controlFailedId: 'CTRL-009', isNearMiss: false, status: 'Approved',
        auditTrail: [{ date: '2025-08-22 14:30', user: 'firstline.retail@nfq.es', action: 'Created' }]
    },
    {
        id: 'EVT-2025-035', dateDiscovery: '2025-10-04', dateOccurrence: '2025-10-04', dateAccounting: '2025-10-31',
        title: 'FX Settlement Failure — USD/JPY',
        description: 'Manual error in standing settlement instructions caused USD 12M leg to be sent to wrong nostro. Recovered T+2 with cost of carry.',
        amount: 18500, currency: 'EUR', recoveryDirect: 0, recoveryInsurance: 0,
        eventType: 'Execution, Delivery & Process Management', eventTypeLevel2: 'Transaction Capture, Execution & Maintenance',
        businessLine: 'Trading & Sales', processId: 'PROC-GM-01', employeeEmail: 'mike.ross@nfq.es',
        department: 'Global Markets', controlFailedId: 'CTRL-012', isNearMiss: false, status: 'Approved',
        auditTrail: [{ date: '2025-10-04 16:15', user: 'mike.ross@nfq.es', action: 'Created' }]
    },
    {
        id: 'EVT-2025-048', dateDiscovery: '2025-11-18', dateOccurrence: '2025-11-12', dateAccounting: '2025-11-30',
        title: 'Insider Trading Investigation — Equity Desk',
        description: 'Compliance investigation into suspicious trading by junior trader ahead of M&A announcement. Trader dismissed, regulator notified.',
        amount: 320000, currency: 'EUR', recoveryDirect: 0, recoveryInsurance: 0,
        eventType: 'Internal Fraud', eventTypeLevel2: 'Unauthorized Activity', businessLine: 'Trading & Sales',
        processId: 'PROC-GM-02', employeeEmail: 'oprisk.lead@nfq.es', department: 'Global Markets',
        controlFailedId: 'CTRL-010', isNearMiss: false, status: 'Approved',
        auditTrail: [{ date: '2025-11-18 11:45', user: 'oprisk.lead@nfq.es', action: 'Created' }]
    },
    {
        id: 'EVT-2025-052', dateDiscovery: '2025-12-03', dateOccurrence: '2025-12-03', dateAccounting: '2025-12-31',
        title: 'Mortgage Mis-pricing — Variable Rate Index',
        description: 'Wrong index applied to 1,240 mortgages over 4 months. Customer remediation programme launched.',
        amount: 240000, currency: 'EUR', recoveryDirect: 0, recoveryInsurance: 0,
        eventType: 'Clients, Products & Business Practices', eventTypeLevel2: 'Improper Business or Market Practices',
        businessLine: 'Retail Banking', processId: 'PROC-RB-02', employeeEmail: 'jane.smith@nfq.es',
        department: 'Retail Banking', controlFailedId: 'CTRL-005', isNearMiss: false, status: 'Approved',
        auditTrail: [{ date: '2025-12-04 08:20', user: 'jane.smith@nfq.es', action: 'Created' }]
    },
    {
        id: 'EVT-2026-003', dateDiscovery: '2026-01-15', dateOccurrence: '2026-01-15', dateAccounting: '2026-01-31',
        title: 'Online Banking Outage — 4h',
        description: 'Database failover failure caused 4h outage of online banking during peak hours. Customer compensation paid.',
        amount: 95000, currency: 'EUR', recoveryDirect: 0, recoveryInsurance: 0,
        eventType: 'Business Disruption & System Failures', eventTypeLevel2: 'Systems',
        businessLine: 'Retail Banking', processId: 'PROC-RB-05', employeeEmail: 'pedro.alvarez@nfq.es',
        department: 'Information Technology', controlFailedId: '', isNearMiss: false, status: 'Approved',
        auditTrail: [{ date: '2026-01-15 19:00', user: 'pedro.alvarez@nfq.es', action: 'Created' }]
    },
    {
        id: 'EVT-2026-007', dateDiscovery: '2026-02-09', dateOccurrence: '2026-01-28', dateAccounting: '2026-02-28',
        title: 'Sanctions Screening Bypass — Near Miss',
        description: 'Test payment to sanctioned entity blocked at last gate. Investigation revealed weakness in initial screening that has been remediated.',
        amount: 0, currency: 'EUR', recoveryDirect: 0, recoveryInsurance: 0,
        eventType: 'Clients, Products & Business Practices', eventTypeLevel2: 'Suitability, Disclosure & Fiduciary',
        businessLine: 'Payment & Settlement', processId: 'PROC-CMP-02', employeeEmail: 'rafael.torres@nfq.es',
        department: 'Compliance & Legal', controlFailedId: 'CTRL-025', isNearMiss: true, status: 'Approved',
        auditTrail: [{ date: '2026-02-09 10:00', user: 'rafael.torres@nfq.es', action: 'Created' }]
    },
    {
        id: 'EVT-2026-011', dateDiscovery: '2026-02-22', dateOccurrence: '2026-02-21', dateAccounting: '2026-02-28',
        title: 'Wire Transfer Misdirection',
        description: 'Branch employee processed wire to incorrect beneficiary due to typo. Funds recalled but with FX loss.',
        amount: 12800, currency: 'EUR', recoveryDirect: 11500, recoveryInsurance: 0,
        eventType: 'Execution, Delivery & Process Management', eventTypeLevel2: 'Transaction Capture, Execution & Maintenance',
        businessLine: 'Retail Banking', processId: 'PROC-RB-04', employeeEmail: 'firstline.retail@nfq.es',
        department: 'Retail Banking', controlFailedId: '', isNearMiss: false, status: 'Approved',
        auditTrail: [{ date: '2026-02-22 11:30', user: 'firstline.retail@nfq.es', action: 'Created' }]
    },
    {
        id: 'EVT-2026-015', dateDiscovery: '2026-03-08', dateOccurrence: '2026-03-05', dateAccounting: '2026-03-31',
        title: 'Privileged Access Misuse — Database',
        description: 'DBA accessed customer database without ticket during weekend. No data exfiltration, but access policy breached.',
        amount: 0, currency: 'EUR', recoveryDirect: 0, recoveryInsurance: 0,
        eventType: 'Internal Fraud', eventTypeLevel2: 'Unauthorized Activity', businessLine: 'Retail Banking',
        processId: 'PROC-IT-01', employeeEmail: 'alice.tech@nfq.es', department: 'Information Technology',
        controlFailedId: 'CTRL-014', isNearMiss: true, status: 'Approved',
        auditTrail: [{ date: '2026-03-08 09:15', user: 'alice.tech@nfq.es', action: 'Created' }]
    },
    {
        id: 'EVT-2026-019', dateDiscovery: '2026-03-20', dateOccurrence: '2026-03-19', dateAccounting: '2026-03-31',
        title: 'Settlement Failure — Bond Auction',
        description: 'Failure to settle €25M government bond auction allocation due to corrupted SWIFT message. Buy-in cost incurred.',
        amount: 47000, currency: 'EUR', recoveryDirect: 0, recoveryInsurance: 0,
        eventType: 'Execution, Delivery & Process Management', eventTypeLevel2: 'Transaction Capture, Execution & Maintenance',
        businessLine: 'Trading & Sales', processId: 'PROC-OPS-01', employeeEmail: 'carmen.lopez@nfq.es',
        department: 'Operations', controlFailedId: 'CTRL-022', isNearMiss: false, status: 'Approved',
        auditTrail: [{ date: '2026-03-20 17:00', user: 'carmen.lopez@nfq.es', action: 'Created' }]
    },
    {
        id: 'EVT-2026-022', dateDiscovery: '2026-04-02', dateOccurrence: '2026-04-01', dateAccounting: '2026-04-30',
        title: 'Branch Flooding — Madrid',
        description: 'Burst pipe damaged ground floor of Madrid branch including 12 workstations and ATM. Branch closed 5 days.',
        amount: 65000, currency: 'EUR', recoveryDirect: 0, recoveryInsurance: 50000,
        eventType: 'Damage to Physical Assets', eventTypeLevel2: 'Disasters and other events',
        businessLine: 'Retail Banking', processId: 'PROC-RB-04', employeeEmail: 'sofia.garcia@nfq.es',
        department: 'Retail Banking', controlFailedId: '', isNearMiss: false, status: 'Approved',
        auditTrail: [{ date: '2026-04-02 08:30', user: 'sofia.garcia@nfq.es', action: 'Created' }]
    },
    {
        id: 'EVT-2026-026', dateDiscovery: '2026-04-14', dateOccurrence: '2026-04-13', dateAccounting: '2026-04-30',
        title: 'Discrimination Claim — Frankfurt Office',
        description: 'Former employee filed discrimination lawsuit. Settled out of court.',
        amount: 78000, currency: 'EUR', recoveryDirect: 0, recoveryInsurance: 0,
        eventType: 'Employment Practices & Workplace Safety', eventTypeLevel2: 'Diversity & Discrimination',
        businessLine: 'Corporate Finance', processId: 'PROC-HR-01', employeeEmail: 'helena.schmidt@nfq.es',
        department: 'Human Resources', controlFailedId: '', isNearMiss: false, status: 'Approved',
        auditTrail: [{ date: '2026-04-14 13:00', user: 'helena.schmidt@nfq.es', action: 'Created' }]
    },
    {
        id: 'EVT-2026-029', dateDiscovery: '2026-04-22', dateOccurrence: '2026-04-22', dateAccounting: '',
        title: 'Reconciliation Break — Nostro Citi USD',
        description: 'USD 2.4M unreconciled break older than 30 days investigation in progress.',
        amount: 0, currency: 'EUR', recoveryDirect: 0, recoveryInsurance: 0,
        eventType: 'Execution, Delivery & Process Management', eventTypeLevel2: 'Monitoring and Reporting',
        businessLine: 'Payment & Settlement', processId: 'PROC-OPS-02', employeeEmail: 'tom.reilly@nfq.es',
        department: 'Operations', controlFailedId: 'CTRL-023', isNearMiss: false, status: 'Pending Validation',
        auditTrail: [{ date: '2026-04-22 15:45', user: 'tom.reilly@nfq.es', action: 'Created' }]
    }
];

export const SEED_KRIS: KRI[] = [
    { id: 'KRI-001', name: 'Failed Login Attempts (Online Banking)', description: 'Monthly count of customers locked out due to failed authentication', riskId: 'R-007', owner: 'Pedro Alvarez', unit: 'count', currentValue: 1450, greenMax: 1000, amberMax: 2000, frequency: 'Monthly', trend: 'up', lastUpdated: '2026-04-28' },
    { id: 'KRI-002', name: 'Unreconciled Items > 30 days', description: 'Open reconciliation breaks aged over 30 days across nostro accounts', riskId: 'R-017', owner: 'Tom Reilly', unit: 'count', currentValue: 8, greenMax: 5, amberMax: 15, frequency: 'Weekly', trend: 'flat', lastUpdated: '2026-04-26' },
    { id: 'KRI-003', name: 'Customer Complaints — Wealth', description: 'Monthly complaints related to advisory and product suitability', riskId: 'R-015', owner: 'Olivia Bennett', unit: 'count', currentValue: 3, greenMax: 5, amberMax: 10, frequency: 'Monthly', trend: 'down', lastUpdated: '2026-04-25' },
    { id: 'KRI-004', name: 'ICT System Availability — Online Banking', description: 'Monthly availability of customer-facing online banking', riskId: 'R-006', owner: 'Yuki Tanaka', unit: '%', currentValue: 99.91, greenMax: 99.95, amberMax: 99.85, frequency: 'Monthly', trend: 'down', lastUpdated: '2026-04-30' },
    { id: 'KRI-005', name: 'AML Alert Closure SLA', description: 'Percentage of L1 alerts closed within 30 days', riskId: 'R-018', owner: 'Nadia Ibrahim', unit: '%', currentValue: 87, greenMax: 95, amberMax: 90, frequency: 'Monthly', trend: 'down', lastUpdated: '2026-04-28' },
    { id: 'KRI-006', name: 'Privileged Access Recertification Overdue', description: 'Privileged accounts overdue for quarterly recertification', riskId: 'R-011', owner: 'Alice Tech', unit: 'count', currentValue: 12, greenMax: 0, amberMax: 5, frequency: 'Monthly', trend: 'up', lastUpdated: '2026-04-29' },
    { id: 'KRI-007', name: 'Open Internal Audit Findings', description: 'Open audit findings classified as High or Critical', riskId: '', owner: 'Elena Voss', unit: 'count', currentValue: 4, greenMax: 3, amberMax: 7, frequency: 'Monthly', trend: 'flat', lastUpdated: '2026-04-15' },
    { id: 'KRI-008', name: 'Trader Limit Breaches', description: 'Number of trader limit breaches per month', riskId: 'R-008', owner: 'Mike Ross', unit: 'count', currentValue: 1, greenMax: 0, amberMax: 3, frequency: 'Monthly', trend: 'flat', lastUpdated: '2026-04-29' }
];

export const SEED_ISSUES: Issue[] = [
    { id: 'ISS-001', title: 'Remediate phishing-driven account compromises', description: 'Strengthen step-up authentication and customer education following EVT-2025-027', source: 'Event', sourceId: 'EVT-2025-027', severity: 'High', owner: 'Pedro Alvarez', createdDate: '2025-08-23', dueDate: '2025-12-15', status: 'Closed' },
    { id: 'ISS-002', title: 'Mortgage mis-pricing remediation programme', description: 'Customer redress for 1,240 affected mortgage holders following EVT-2025-052', source: 'Event', sourceId: 'EVT-2025-052', severity: 'Critical', owner: 'Jane Smith', createdDate: '2025-12-04', dueDate: '2026-06-30', status: 'In Progress' },
    { id: 'ISS-003', title: 'Implement PAM with session recording', description: 'Audit finding 2025-A12: PAM solution must be operational by Q2 2026', source: 'Audit', sourceId: 'AUD-2025-A12', severity: 'High', owner: 'Alice Tech', createdDate: '2025-09-10', dueDate: '2026-04-15', status: 'Open' },
    { id: 'ISS-004', title: 'AML alert closure SLA breach — root cause', description: 'KRI-005 has been amber for 3 consecutive months; investigate alert tuning', source: 'KRI', sourceId: 'KRI-005', severity: 'Medium', owner: 'Nadia Ibrahim', createdDate: '2026-03-15', dueDate: '2026-05-31', status: 'In Progress' },
    { id: 'ISS-005', title: 'CTRL-015 PAM control validation pending', description: 'Pending control validation for PAM Vaulting after rollout', source: 'Control', sourceId: 'CTRL-015', severity: 'Medium', owner: 'Yuki Tanaka', createdDate: '2026-02-01', dueDate: '2026-05-15', status: 'Open' },
    { id: 'ISS-006', title: 'Branch Madrid — physical resilience review', description: 'Review and upgrade water detection following branch flooding event', source: 'Event', sourceId: 'EVT-2026-022', severity: 'Medium', owner: 'Sofia Garcia', createdDate: '2026-04-03', dueDate: '2026-07-31', status: 'In Progress' },
    { id: 'ISS-007', title: 'Sanctions screening — initial gate weakness', description: 'Strengthen first-line screening logic identified during EVT-2026-007 review', source: 'Event', sourceId: 'EVT-2026-007', severity: 'High', owner: 'Rafael Torres', createdDate: '2026-02-10', dueDate: '2026-04-30', status: 'Open' },
    { id: 'ISS-008', title: 'Trader desk surveillance enhancement', description: 'Enhance pre-announcement trading surveillance following EVT-2025-048', source: 'Event', sourceId: 'EVT-2025-048', severity: 'High', owner: 'Sarah Chen', createdDate: '2025-11-20', dueDate: '2026-03-31', status: 'Open' }
];

export const SEED_SCENARIOS: Scenario[] = [
    { id: 'SCN-001', name: 'Major Cyber / Ransomware Attack', description: 'Successful ransomware encrypting core banking; recovery from backups; customer data potentially exfiltrated', eventType: 'Business Disruption & System Failures', businessLine: 'Retail Banking', frequencyPerYear: 0.1, severityMin: 5000000, severityMode: 25000000, severityMax: 80000000, owner: 'Yuki Tanaka' },
    { id: 'SCN-002', name: 'Rogue Trader — Material Loss', description: 'Trader hides loss-making positions exceeding mandate; loss crystallises on unwind', eventType: 'Internal Fraud', businessLine: 'Trading & Sales', frequencyPerYear: 0.05, severityMin: 2000000, severityMode: 15000000, severityMax: 100000000, owner: 'Mike Ross' },
    { id: 'SCN-003', name: 'Pandemic / Long-term Operational Disruption', description: 'Multi-month workforce disruption affecting branches and operations', eventType: 'Damage to Physical Assets', businessLine: 'Retail Banking', frequencyPerYear: 0.05, severityMin: 1000000, severityMode: 5000000, severityMax: 20000000, owner: 'Sarah Chen' },
    { id: 'SCN-004', name: 'Mass Mis-selling Class Action', description: 'Industry-wide investigation into specific product type leads to class action and remediation', eventType: 'Clients, Products & Business Practices', businessLine: 'Asset Management', frequencyPerYear: 0.1, severityMin: 3000000, severityMode: 12000000, severityMax: 50000000, owner: 'Olivia Bennett' },
    { id: 'SCN-005', name: 'Major Settlement Failure — Counterparty Default', description: 'Counterparty default coincides with operational error in collateral management', eventType: 'Execution, Delivery & Process Management', businessLine: 'Trading & Sales', frequencyPerYear: 0.2, severityMin: 500000, severityMode: 3000000, severityMax: 25000000, owner: 'Carmen Lopez' },
    { id: 'SCN-006', name: 'Coordinated External Fraud Campaign', description: 'Sophisticated phishing + SIM swap campaign affecting thousands of retail customers', eventType: 'External Fraud', businessLine: 'Retail Banking', frequencyPerYear: 0.5, severityMin: 200000, severityMode: 1500000, severityMax: 10000000, owner: 'Pedro Alvarez' }
];

export const SEED_APPETITE: AppetiteStatement[] = [
    { id: 'APP-001', scope: 'All', metric: 'Gross Loss', threshold: 15000000, unit: '€', period: 'Annual', actual: 0, status: 'Within' },
    { id: 'APP-002', scope: 'External Fraud', metric: 'Gross Loss', threshold: 3000000, unit: '€', period: 'Annual', actual: 0, status: 'Within' },
    { id: 'APP-003', scope: 'Retail Banking', metric: 'Gross Loss', threshold: 5000000, unit: '€', period: 'Annual', actual: 0, status: 'Within' },
    { id: 'APP-004', scope: 'Trading & Sales', metric: 'Gross Loss', threshold: 2000000, unit: '€', period: 'Annual', actual: 0, status: 'Within' },
    { id: 'APP-005', scope: 'All', metric: 'Event Count', threshold: 50, unit: 'count', period: 'Quarterly', actual: 13, status: 'Within' },
    { id: 'APP-006', scope: 'Business Disruption & System Failures', metric: 'Event Count', threshold: 2, unit: 'count', period: 'Annual', actual: 1, status: 'Within' }
];

export const SEED_VENDORS: Vendor[] = [
    { id: 'VND-001', name: 'Amazon Web Services (AWS)', service: 'Cloud infrastructure (IaaS)', criticality: 'Critical', country: 'IE', contractEnd: '2027-06-30', exitPlan: 'In Progress', ictThirdParty: true },
    { id: 'VND-002', name: 'Microsoft Azure', service: 'Cloud infrastructure (IaaS / SaaS)', criticality: 'Critical', country: 'NL', contractEnd: '2027-12-31', exitPlan: 'In Progress', ictThirdParty: true },
    { id: 'VND-003', name: 'SWIFT', service: 'Financial messaging network', criticality: 'Critical', country: 'BE', contractEnd: '2028-01-15', exitPlan: 'No', ictThirdParty: true },
    { id: 'VND-004', name: 'Bloomberg L.P.', service: 'Market data and trading terminals', criticality: 'Important', country: 'US', contractEnd: '2026-12-31', exitPlan: 'No', ictThirdParty: true },
    { id: 'VND-005', name: 'Equifax', service: 'Credit bureau and identity verification', criticality: 'Important', country: 'US', contractEnd: '2026-09-30', exitPlan: 'Yes', ictThirdParty: true },
    { id: 'VND-006', name: 'KPMG', service: 'External audit', criticality: 'Important', country: 'ES', contractEnd: '2027-06-30', exitPlan: 'No', ictThirdParty: false },
    { id: 'VND-007', name: 'Mastercard', service: 'Card scheme', criticality: 'Critical', country: 'BE', contractEnd: '2028-12-31', exitPlan: 'No', ictThirdParty: true },
    { id: 'VND-008', name: 'Temenos', service: 'Core banking platform', criticality: 'Critical', country: 'CH', contractEnd: '2029-06-30', exitPlan: 'In Progress', ictThirdParty: true }
];

export const SEED_BIA: BIA[] = [
    { id: 'BIA-001', processId: 'PROC-RB-05', rtoHours: 1, rpoHours: 0.25, mtpdHours: 4, criticality: 'Critical', reviewedDate: '2026-02-10' },
    { id: 'BIA-002', processId: 'PROC-RB-01', rtoHours: 4, rpoHours: 1, mtpdHours: 24, criticality: 'High', reviewedDate: '2026-01-25' },
    { id: 'BIA-003', processId: 'PROC-OPS-01', rtoHours: 2, rpoHours: 0.5, mtpdHours: 8, criticality: 'Critical', reviewedDate: '2026-03-05' },
    { id: 'BIA-004', processId: 'PROC-GM-01', rtoHours: 0.5, rpoHours: 0, mtpdHours: 4, criticality: 'Critical', reviewedDate: '2026-03-15' },
    { id: 'BIA-005', processId: 'PROC-IT-01', rtoHours: 2, rpoHours: 1, mtpdHours: 12, criticality: 'High', reviewedDate: '2026-02-20' },
    { id: 'BIA-006', processId: 'PROC-CMP-02', rtoHours: 1, rpoHours: 0, mtpdHours: 4, criticality: 'Critical', reviewedDate: '2026-01-30' },
    { id: 'BIA-007', processId: 'PROC-RB-02', rtoHours: 24, rpoHours: 24, mtpdHours: 72, criticality: 'Medium', reviewedDate: '2025-12-12' },
    { id: 'BIA-008', processId: 'PROC-HR-01', rtoHours: 48, rpoHours: 24, mtpdHours: 168, criticality: 'Low', reviewedDate: '2025-11-20' }
];

export const SEED_ICT_INCIDENTS: ICTIncident[] = [
    { id: 'INC-001', title: 'Online Banking Outage — DB Failover', detectedDate: '2026-01-15', classification: 'Major', durationHours: 4, clientsAffected: 250000, servicesAffected: 'Online & Mobile Banking, Card Authorization', rootCause: 'Database failover script error caused replica to become primary without sync', status: 'Reported to Authority' },
    { id: 'INC-002', title: 'Email Phishing — Internal Compromise', detectedDate: '2026-02-08', classification: 'Significant', durationHours: 12, clientsAffected: 0, servicesAffected: 'Internal Email, MFA portal', rootCause: 'Compromised employee credentials via spear phishing; contained before lateral movement', status: 'Resolved' },
    { id: 'INC-003', title: 'Payment Switch Latency Degradation', detectedDate: '2026-03-12', classification: 'Operational', durationHours: 2, clientsAffected: 12000, servicesAffected: 'Card Authorization', rootCause: 'Memory leak in payment switch microservice; restart and patch applied', status: 'Resolved' }
];
