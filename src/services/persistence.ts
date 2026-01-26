
import { User, OpEvent, Department, Process, RiskItem, Control } from '../types';
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

            return {
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
        } catch (e) {
            console.error('Supabase load error:', e);
            return null;
        }
    },

    save: async (state: AppState) => {
        // Fallback local
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

        try {
            // Upsert only if there's data
            // We use Promise.allSettled to ensure one failure doesn't stop others
            await Promise.allSettled([
                state.users.length > 0 ? supabase.from('users_data').upsert(state.users) : Promise.resolve(),
                state.events.length > 0 ? supabase.from('events').upsert(state.events.map(e => ({
                    ...e,
                    auditTrail: JSON.stringify(e.auditTrail || [])
                }))) : Promise.resolve(),
                state.departments.length > 0 ? supabase.from('departments').upsert(state.departments) : Promise.resolve(),
                state.processes.length > 0 ? supabase.from('processes').upsert(state.processes) : Promise.resolve(),
                state.risks.length > 0 ? supabase.from('risks').upsert(state.risks) : Promise.resolve(),
                state.controls.length > 0 ? supabase.from('controls').upsert(state.controls) : Promise.resolve()
            ]);
        } catch (e) {
            console.error('Supabase save error:', e);
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
