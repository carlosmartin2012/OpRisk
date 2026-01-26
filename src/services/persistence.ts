
import { User, OpEvent, Department, Process, RiskItem, Control } from '../../types';
import { supabase } from './supabaseClient';

export interface AppState {
    users: User[];
    events: OpEvent[];
    departments: Department[];
    processes: Process[];
    risks: RiskItem[];
    controls: Control[];
}

const STORAGE_KEY = 'oprisk_app_state';

// Utility to fix common UTF-8 encoding issues (mojibake)
const sanitizeString = (str: string) => {
    if (typeof str !== 'string') return str;
    try {
        // If it contains patterns like Ã© (é) or Ã¡ (á), try to fix it
        if (/[\u00C0-\u00FF][\u0080-\u00BF]/.test(str)) {
            return decodeURIComponent(escape(str));
        }
    } catch (e) {
        // If it fails, return original
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

// Helper to clean objects before sending to Supabase
const cleanForDb = (obj: any) => {
    const cleaned = { ...obj };
    // Map auditTrail to the quoted column name if necessary, 
    // but here we ensure consistency with the SQL script provided
    if (cleaned.auditTrail) {
        cleaned.auditTrail = JSON.stringify(cleaned.auditTrail);
    }
    return cleaned;
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
            const [
                { data: users },
                { data: events },
                { data: departments },
                { data: processes },
                { data: risks },
                { data: controls }
            ] = await Promise.all([
                supabase.from('users_data').select('*'),
                supabase.from('events').select('*'),
                supabase.from('departments').select('*'),
                supabase.from('processes').select('*'),
                supabase.from('risks').select('*'),
                supabase.from('controls').select('*')
            ]);

            if (!users && !events) return null;

            const state = {
                users: users || [],
                events: (events || []).map(e => ({
                    ...e,
                    auditTrail: typeof e.auditTrail === 'string' ? JSON.parse(e.auditTrail) : (e.auditTrail || [])
                })),
                departments: departments || [],
                processes: processes || [],
                risks: risks || [],
                controls: controls || []
            } as any;

            return sanitizeObject(state);
        } catch (e) {
            console.error('Supabase load error:', e);
            return null;
        }
    },

    save: async (state: AppState) => {
        // Fix any potential encoding issues before saving
        const sanitizedState = sanitizeObject(state);

        // Fallback local
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizedState));

        try {
            // Upsert only if there's data
            await Promise.allSettled([
                sanitizedState.users.length > 0 ? supabase.from('users_data').upsert(sanitizedState.users) : Promise.resolve(),
                sanitizedState.events.length > 0 ? supabase.from('events').upsert(sanitizedState.events.map((e: any) => ({
                    ...e,
                    auditTrail: JSON.stringify(e.auditTrail || [])
                }))) : Promise.resolve(),
                sanitizedState.departments.length > 0 ? supabase.from('departments').upsert(sanitizedState.departments) : Promise.resolve(),
                sanitizedState.processes.length > 0 ? supabase.from('processes').upsert(sanitizedState.processes) : Promise.resolve(),
                sanitizedState.risks.length > 0 ? supabase.from('risks').upsert(sanitizedState.risks) : Promise.resolve(),
                sanitizedState.controls.length > 0 ? supabase.from('controls').upsert(sanitizedState.controls) : Promise.resolve()
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
                (payload) => {
                    // Solo notificamos si el cambio no es una inserción local (opcional)
                    // Para simplificar, disparamos la actualización
                    onUpdate();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }
};
