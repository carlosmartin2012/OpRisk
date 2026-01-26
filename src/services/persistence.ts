
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

export const PersistenceService = {
    // legacy load from local storage
    load: (): AppState | null => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            console.error('Failed to load state', e);
            return null;
        }
    },

    // New Async load from Supabase
    loadFromSupabase: async (): Promise<AppState | null> => {
        try {
            const { data: users } = await supabase.from('users_data').select('*');
            const { data: events } = await supabase.from('events').select('*');
            const { data: departments } = await supabase.from('departments').select('*');
            const { data: processes } = await supabase.from('processes').select('*');
            const { data: risks } = await supabase.from('risks').select('*');
            const { data: controls } = await supabase.from('controls').select('*');

            if (!users && !events) return null;

            return {
                users: users || [],
                events: (events || []).map(e => ({ ...e, auditTrail: e.audit_trail || [] })),
                departments: departments || [],
                processes: processes || [],
                risks: risks || [],
                controls: controls || []
            } as any; // Cast to AppState, handling snake_case to camelCase mapping if needed
        } catch (e) {
            console.error('Supabase load error:', e);
            return null;
        }
    },

    save: async (state: AppState) => {
        // Save to LocalStorage for fallback
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

        // Save to Supabase (Upserting records)
        // Note: For simplicity in this step, we keep the data structure close to types
        // In a real app, we'd handle each table update individually when they change.
        try {
            // We upsert all data. For a more performant app, we would only save what changed.
            // But to match the current "save state" logic:
            if (state.users.length > 0) await supabase.from('users_data').upsert(state.users);
            if (state.events.length > 0) await supabase.from('events').upsert(state.events.map(e => ({ ...e, audit_trail: e.auditTrail })));
            if (state.departments.length > 0) await supabase.from('departments').upsert(state.departments);
            if (state.processes.length > 0) await supabase.from('processes').upsert(state.processes);
            if (state.risks.length > 0) await supabase.from('risks').upsert(state.risks);
            if (state.controls.length > 0) await supabase.from('controls').upsert(state.controls);
        } catch (e) {
            console.error('Supabase save error:', e);
        }
    },

    subscribeToChanges: (onUpdate: (payload: any) => void) => {
        const channel = supabase
            .channel('db-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public' },
                (payload) => {
                    console.log('Realtime update received:', payload);
                    onUpdate(payload);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }
};
