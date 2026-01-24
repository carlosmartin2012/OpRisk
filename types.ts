
export enum ViewState {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  DATA = 'DATA',
  RCSA = 'RCSA',
  CONTROL_TESTING = 'CONTROL_TESTING',
  CAPITAL = 'CAPITAL',
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
  title: string;
  description: string;
  employeeEmail: string;
  department: string; // Added field
  amount: number;
  currency: string;
  eventType: string; // EBA Level 1
  eventTypeLevel2: string; // EBA Level 2
  businessLine: string;
  processId: string; // Added field

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
  owner: string;
}

export interface RiskItem {
  id: string;
  processId: string;
  description: string;
  inherentProb: number; // 1-5
  inherentImpact: number; // 1-5
  residualProb: number; // 1-5
  residualImpact: number; // 1-5
  controlIds: string[]; // Links to controls
}

export interface Control {
  id: string;
  riskId: string;
  owner: string;
  description: string;
  type: 'Preventive' | 'Detective';
  frequency: 'Daily' | 'Monthly' | 'Quarterly'; // Execution Frequency
  testingFrequency: 'Monthly' | 'Quarterly' | 'Annually'; // New field: Testing Frequency
  status: 'Pending' | 'Tested' | 'Validated' | 'Non Validated';
  evidence?: string;
  lastTested?: string;
}

export interface FinancialData {
  interestIncome: number;
  interestExpense: number;
  serviceIncome: number;
  serviceExpense: number;
  financialIncome: number;
  avgAnnualLoss: number; // For ILM
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
