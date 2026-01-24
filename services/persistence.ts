
import { User, OpEvent, Department, Process, RiskItem, Control, FinancialData } from '../types';

const STORAGE_KEY = 'alquid_oprisk_db_v1';

export interface AppState {
    users: User[];
    events: OpEvent[];
    departments: Department[];
    processes: Process[];
    risks: RiskItem[];
    controls: Control[];
}

export const PersistenceService = {
    save: (state: AppState) => {
        try {
            const serialized = JSON.stringify(state);
            localStorage.setItem(STORAGE_KEY, serialized);
            console.log('Data saved to local persistence.');
        } catch (err) {
            console.error('Failed to save data', err);
        }
    },

    load: (): AppState | null => {
        try {
            const serialized = localStorage.getItem(STORAGE_KEY);
            if (!serialized) return null;
            return JSON.parse(serialized) as AppState;
        } catch (err) {
            console.error('Failed to load data', err);
            return null;
        }
    },

    clear: () => {
        localStorage.removeItem(STORAGE_KEY);
    }
};
