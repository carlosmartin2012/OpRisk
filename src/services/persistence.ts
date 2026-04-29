
import {
    User, OpEvent, Department, Process, RiskItem, Control, AuditLog,
    KRI, Issue, Scenario, AppetiteStatement, Vendor, BIA, ICTIncident, Integration
} from '../../types';
import { supabase } from './supabaseClient';

export interface AppState {
    users: User[];
    events: OpEvent[];
    departments: Department[];
    processes: Process[];
    risks: RiskItem[];
    controls: Control[];
    auditLogs: AuditLog[];
    kris: KRI[];
    issues: Issue[];
    scenarios: Scenario[];
    appetite: AppetiteStatement[];
    vendors: Vendor[];
    bias: BIA[];
    ictIncidents: ICTIncident[];
    integrations: Integration[];
}

const STORAGE_KEY = 'oprisk_app_state';

const sanitizeString = (str: string) => {
    if (typeof str !== 'string') return str;
    try {
        if (/[À-ÿ][-¿]/.test(str)) {
            return decodeURIComponent(escape(str));
        }
    } catch (e) {
        // ignore
    }
    return str;
};

const sanitizeObject = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(sanitizeObject);

    const newObj: any = {};
    for (const key in obj) {
        if (typeof obj[key] === 'string') {
            newObj[key] = sanitizeString(obj[key]);
        } else if (typeof obj[key] === 'object') {
            newObj[key] = sanitizeObject(obj[key]);
        } else {
            newObj[key] = obj[key];
        }
    }
    return newObj;
};

// Load a Supabase table tolerantly: if it doesn't exist, return null (signals "use local")
const loadTable = async (table: string): Promise<any[] | null> => {
    try {
        const { data, error } = await supabase.from(table).select('*');
        if (error) return null;
        return data || [];
    } catch {
        return null;
    }
};

const saveTable = async (table: string, rows: any[]) => {
    if (!rows || rows.length === 0) return;
    try {
        await supabase.from(table).upsert(rows);
    } catch {
        // table may not exist on Supabase; localStorage already has the data
    }
};

export const PersistenceService = {
    load: (): AppState | null => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            return null;
        }
    },

    loadFromSupabase: async (): Promise<AppState | null> => {
        try {
            const local = PersistenceService.load();

            const [
                users, events, departments, processes, risks, controls, auditLogs,
                kris, issues, scenarios, appetite, vendors, bias, ictIncidents, integrations
            ] = await Promise.all([
                loadTable('users_data'),
                loadTable('events'),
                loadTable('departments'),
                loadTable('processes'),
                loadTable('risks'),
                loadTable('controls'),
                loadTable('audit_logs'),
                loadTable('kris'),
                loadTable('issues'),
                loadTable('scenarios'),
                loadTable('appetite'),
                loadTable('vendors'),
                loadTable('bias'),
                loadTable('ict_incidents'),
                loadTable('integrations')
            ]);

            // Core tables: must succeed (legacy behavior)
            if (!users && !events) return null;

            const state: AppState = {
                users: users || local?.users || [],
                events: ((events || []) as any[]).map(e => ({
                    ...e,
                    auditTrail: typeof e.auditTrail === 'string' ? JSON.parse(e.auditTrail) : (e.auditTrail || [])
                })),
                departments: departments || local?.departments || [],
                processes: processes || local?.processes || [],
                risks: risks || local?.risks || [],
                controls: controls || local?.controls || [],
                auditLogs: auditLogs || local?.auditLogs || [],
                // New tables: fall back to localStorage if not in Supabase yet
                kris: kris !== null ? kris : (local?.kris || []),
                issues: issues !== null ? issues : (local?.issues || []),
                scenarios: scenarios !== null ? scenarios : (local?.scenarios || []),
                appetite: appetite !== null ? appetite : (local?.appetite || []),
                vendors: vendors !== null ? vendors : (local?.vendors || []),
                bias: bias !== null ? bias : (local?.bias || []),
                ictIncidents: ictIncidents !== null ? ictIncidents : (local?.ictIncidents || []),
                integrations: integrations !== null ? integrations : (local?.integrations || [])
            };

            return sanitizeObject(state);
        } catch (e) {
            console.error('Supabase load error:', e);
            return null;
        }
    },

    save: async (state: AppState) => {
        const sanitizedState = sanitizeObject(state);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizedState));

        try {
            await Promise.allSettled([
                saveTable('users_data', sanitizedState.users),
                saveTable('events', (sanitizedState.events || []).map((e: any) => ({
                    ...e,
                    auditTrail: JSON.stringify(e.auditTrail || [])
                }))),
                saveTable('departments', sanitizedState.departments),
                saveTable('processes', sanitizedState.processes),
                saveTable('risks', sanitizedState.risks),
                saveTable('controls', sanitizedState.controls),
                saveTable('audit_logs', sanitizedState.auditLogs),
                saveTable('kris', sanitizedState.kris || []),
                saveTable('issues', sanitizedState.issues || []),
                saveTable('scenarios', sanitizedState.scenarios || []),
                saveTable('appetite', sanitizedState.appetite || []),
                saveTable('vendors', sanitizedState.vendors || []),
                saveTable('bias', sanitizedState.bias || []),
                saveTable('ict_incidents', sanitizedState.ictIncidents || []),
                saveTable('integrations', sanitizedState.integrations || [])
            ]);
        } catch (e) {
            console.error('Supabase save error:', e);
        }
    },

    delete: async (table: string, id: string) => {
        try {
            await supabase.from(table).delete().eq('id', id);
        } catch (e) {
            console.error(`Supabase delete error on ${table}:`, e);
        }
    },

    subscribeToChanges: (onUpdate: () => void) => {
        const channel = supabase
            .channel('db-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public' },
                () => {
                    onUpdate();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }
};
