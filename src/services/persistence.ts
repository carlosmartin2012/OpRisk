
import { User, OpEvent, Department, Process, RiskItem, Control } from '../types';

export interface AppState {
    users: User[];
    events: OpEvent[];
    departments: Department[];
    processes: Process[];
    risks: RiskItem[];
    controls: Control[];
}

const STORAGE_KEY = 'oprisk_app_state';
const CHANNEL_NAME = 'oprisk_state_sync';

const syncChannel = typeof window !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null;

export const PersistenceService = {
    load: (): AppState | null => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            console.error('Failed to load state', e);
            return null;
        }
    },

    save: (state: AppState, broadcast: boolean = true) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            if (broadcast && syncChannel) {
                syncChannel.postMessage(state);
            }
        } catch (e) {
            console.error('Failed to save state', e);
        }
    },

    subscribe: (callback: (state: AppState) => void) => {
        if (!syncChannel) return () => { };

        const handler = (event: MessageEvent) => {
            callback(event.data);
        };

        syncChannel.addEventListener('message', handler);
        return () => syncChannel.removeEventListener('message', handler);
    }
};
