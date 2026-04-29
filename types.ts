
export enum ViewState {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  DATA = 'DATA',
  RCSA = 'RCSA',
  CONTROL_TESTING = 'CONTROL_TESTING',
  KRIS = 'KRIS',
  ISSUES = 'ISSUES',
  SCENARIOS = 'SCENARIOS',
  APPETITE = 'APPETITE',
  CAPITAL = 'CAPITAL',
  DORA = 'DORA',
  DATA_QUALITY = 'DATA_QUALITY',
  INTEGRATIONS = 'INTEGRATIONS',
  AUDIT_LOGS = 'AUDIT_LOGS',
  USERS = 'USERS'
}

export type Language = 'EN' | 'ES';

export type UserRole = 'OpRisk' | 'First Line' | 'Auditor' | 'Administrator';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  lastLogin: string;
  status: 'Active' | 'Inactive';
}

export interface AuditLog {
  id: string;
  date: string;
  user: string;
  action: string;
  module: string;
  type: 'Import' | 'Edit' | 'Execution' | 'Delete' | 'Validation' | 'Creation';
}

export interface OpEvent {
  id: string;
  dateDiscovery: string;
  dateOccurrence?: string;
  dateAccounting?: string;
  title: string;
  description: string;
  employeeEmail: string;
  department: string;
  amount: number;
  currency: string;
  recoveryDirect?: number;
  recoveryInsurance?: number;
  isNearMiss?: boolean;
  controlFailedId?: string;
  eventType: string;
  eventTypeLevel2: string;
  businessLine: string;
  processId: string;
  status: 'Draft' | 'Pending Validation' | 'Approved' | 'Rejected';
  auditTrail: Partial<AuditLog>[];
}

export interface Department {
  id: string;
  name: string;
}

export interface Process {
  id: string;
  departmentId: string;
  name: string;
  owner?: string;
  description?: string;
}

export interface RiskItem {
  id: string;
  processId: string;
  name: string;
  description: string;
  owner?: string;
  inherentProb: number;
  inherentImpact: number;
  residualProb: number;
  residualImpact: number;
  controlIds: string[];
  approvalStatus?: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected';
  approvedBy?: string;
  approvedDate?: string;
}

export interface Control {
  id: string;
  riskId: string;
  name: string;
  owner: string;
  description: string;
  type: 'Preventive' | 'Detective';
  frequency: 'Daily' | 'Monthly' | 'Quarterly' | 'Annually';
  testingFrequency: 'Monthly' | 'Quarterly' | 'Annually';
  status: 'Pending' | 'Tested' | 'Validated' | 'Non Validated';
  evidence?: string;
  lastTested?: string;
}

export interface KRI {
  id: string;
  name: string;
  description: string;
  riskId?: string;
  owner: string;
  unit: '%' | '€' | 'count' | 'days' | 'hours';
  currentValue: number;
  greenMax: number;
  amberMax: number;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
  trend: 'up' | 'down' | 'flat';
  lastUpdated: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  source: 'Event' | 'Control' | 'Audit' | 'KRI' | 'Manual';
  sourceId?: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  owner: string;
  createdDate: string;
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Closed' | 'Overdue';
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  eventType: string;
  businessLine: string;
  frequencyPerYear: number;
  severityMin: number;
  severityMode: number;
  severityMax: number;
  owner: string;
}

export interface AppetiteStatement {
  id: string;
  scope: string;
  metric: string;
  threshold: number;
  unit: '€' | '%' | 'count';
  period: 'Monthly' | 'Quarterly' | 'Annual';
  actual: number;
  status: 'Within' | 'Watch' | 'Breach';
}

export interface Vendor {
  id: string;
  name: string;
  service: string;
  criticality: 'Critical' | 'Important' | 'Standard';
  country: string;
  contractEnd: string;
  exitPlan: 'Yes' | 'No' | 'In Progress';
  ictThirdParty: boolean;
}

export interface BIA {
  id: string;
  processId: string;
  rtoHours: number;
  rpoHours: number;
  mtpdHours: number;
  criticality: 'Critical' | 'High' | 'Medium' | 'Low';
  reviewedDate: string;
}

export interface ICTIncident {
  id: string;
  title: string;
  detectedDate: string;
  classification: 'Major' | 'Significant' | 'Operational';
  durationHours: number;
  clientsAffected: number;
  servicesAffected: string;
  rootCause: string;
  status: 'Open' | 'Resolved' | 'Reported to Authority';
}

export interface Integration {
  id: string;
  name: string;
  type: 'External Loss Data' | 'Ticketing' | 'GRC' | 'ERP' | 'SIEM';
  description: string;
  status: 'Disconnected' | 'Connected' | 'Error';
  lastSync?: string;
  endpoint?: string;
}

export interface FinancialData {
  interestIncome: number;
  interestExpense: number;
  interestEarningAssets: number;
  serviceIncomeOther: number;
  serviceExpenseOther: number;
  feeIncome: number;
  feeExpense: number;
  tradingPnL: number;
  bankingPnL: number;
  avgAnnualLoss: number;
}

export const EBA_EVENT_TYPES_HIERARCHY: Record<string, string[]> = {
  "Internal Fraud": [
    "Unauthorized Activity",
    "Theft and Fraud"
  ],
  "External Fraud": [
    "Theft and Fraud",
    "Systems Security"
  ],
  "Employment Practices & Workplace Safety": [
    "Employee Relations",
    "Safe Environment",
    "Diversity & Discrimination"
  ],
  "Clients, Products & Business Practices": [
    "Suitability, Disclosure & Fiduciary",
    "Improper Business or Market Practices",
    "Product Flaws",
    "Selection, Sponsorship & Exposure",
    "Advisory Activities"
  ],
  "Damage to Physical Assets": [
    "Disasters and other events"
  ],
  "Business Disruption & System Failures": [
    "Systems"
  ],
  "Execution, Delivery & Process Management": [
    "Transaction Capture, Execution & Maintenance",
    "Monitoring and Reporting",
    "Customer Intake and Documentation",
    "Customer / Client Account Management",
    "Trade Counterparties",
    "Vendors & Suppliers"
  ]
};

export const EBA_EVENT_TYPES = Object.keys(EBA_EVENT_TYPES_HIERARCHY);

export const BUSINESS_LINES = [
  "Corporate Finance",
  "Trading & Sales",
  "Retail Banking",
  "Commercial Banking",
  "Payment & Settlement",
  "Agency Services",
  "Asset Management",
  "Retail Brokerage"
];

export const TRANSLATIONS = {
  EN: {
    dashboard: "Dashboard",
    data: "Data (Events)",
    rcsa: "RCSA",
    controlTesting: "Control Testing",
    capitalEngine: "Capital Engine",
    kris: "KRIs",
    issues: "Issues & Actions",
    scenarios: "Scenarios",
    appetite: "Risk Appetite",
    dora: "DORA / Resilience",
    dataQuality: "Data Quality",
    integrations: "External Loss Data",
    auditLogs: "Audit Logs",
    userManagement: "User Management",
    logout: "Sign Out",
    welcome: "Welcome",
    uploadCsv: "Import CSV",
    createEvent: "New Event",
    validate: "Validate",
    reject: "Reject",
    edit: "Edit",
    status: "Status",
    approved: "Approved",
    pending: "Pending",
    rejected: "Rejected",
    validated: "Validated",
    nonValidated: "Non Validated",
    tested: "Tested",
    inherent: "Inherent Risk",
    residual: "Residual Risk",
    departments: "Departments",
    processes: "Processes",
    risks: "Risks",
    controls: "Controls",
    evidence: "Upload Evidence",
    ilmSensitivity: "ILM Sensitivity",
    capitalReq: "Total Capital Requirement (SMA)",
    viewMap: "Map View",
    viewTable: "Table View"
  },
  ES: {
    dashboard: "Cuadro de Mando",
    data: "Datos (Eventos)",
    rcsa: "RCSA",
    controlTesting: "Test de Control",
    capitalEngine: "Motor de Capital",
    kris: "Indicadores (KRIs)",
    issues: "Hallazgos y Acciones",
    scenarios: "Escenarios",
    appetite: "Apetito al Riesgo",
    dora: "DORA / Resiliencia",
    dataQuality: "Calidad de Datos",
    integrations: "Datos Externos de Pérdidas",
    auditLogs: "Logs de Auditoría",
    userManagement: "Gestión de Usuarios",
    logout: "Cerrar Sesión",
    welcome: "Bienvenido",
    uploadCsv: "Importar CSV",
    createEvent: "Nuevo Evento",
    validate: "Validar",
    reject: "Rechazar",
    edit: "Editar",
    status: "Estado",
    approved: "Aprobado",
    pending: "Pendiente",
    rejected: "Rechazado",
    validated: "Validado",
    nonValidated: "No Validado",
    tested: "Testeado",
    inherent: "Riesgo Inherente",
    residual: "Riesgo Residual",
    departments: "Departamentos",
    processes: "Procesos",
    risks: "Riesgos",
    controls: "Controles",
    evidence: "Subir Evidencia",
    ilmSensitivity: "Sensibilidad ILM",
    capitalReq: "Requerimiento de Capital (SMA)",
    viewMap: "Vista Mapa",
    viewTable: "Vista Tabla"
  }
};
