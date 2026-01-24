
import { User, OpEvent, Department, Process, RiskItem, Control, FinancialData } from '../types';

const STORAGE_KEY = 'alquid_oprisk_db_v1';
const BROADCAST_CHANNEL_NAME = 'alquid_oprisk_sync';

export interface AppState {
    users: User[];
    events: OpEvent[];
    departments: Department[];
    processes: Process[];
    risks: RiskItem[];
    controls: Control[];
}

// Simple event emitter for internal app updates
type UpdateListener = (state: AppState) => void;

export const PersistenceService = {
    listeners: [] as UpdateListener[],
    channel: new BroadcastChannel(BROADCAST_CHANNEL_NAME),

    init: function () {
        // Listen for cross-tab updates via BroadcastChannel
        this.channel.onmessage = (event) => {
            if (event.data.type === 'UPDATE' && event.data.payload) {
                console.log('Received sync update from another tab');
                this.notify(event.data.payload);
            }
        };
    },

    subscribe: function (listener: UpdateListener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    },

    notify: function (state: AppState) {
        this.listeners.forEach(l => l(state));
    },

    save: function (state: AppState, broadcast: boolean = true) {
        try {
            const serialized = JSON.stringify(state);
            localStorage.setItem(STORAGE_KEY, serialized);

            if (broadcast) {
                this.channel.postMessage({ type: 'UPDATE', payload: state });
            }
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

PersistenceService.init();
