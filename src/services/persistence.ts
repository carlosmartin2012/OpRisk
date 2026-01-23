
import { User, OpEvent, UserRole } from '../types';

// Initial Mock Data
const INITIAL_USERS: User[] = [
    { id: 'U1', email: 'risk.head@nfq.es', name: 'Maria Garcia', role: 'OpRisk', department: 'Risk Dept', lastLogin: '2023-10-26 09:30', status: 'Active' },
    { id: 'U2', email: 'trader.lead@nfq.es', name: 'John Smith', role: 'First Line', department: 'Trading', lastLogin: '2023-10-25 14:20', status: 'Active' },
    { id: 'U3', email: 'audit.senior@nfq.es', name: 'Laura Chen', role: 'Auditor', department: 'Internal Audit', lastLogin: '2023-10-26 10:00', status: 'Active' },
];

const INITIAL_EVENTS: OpEvent[] = [];

export const PersistenceService = {
    // --- Users ---
    getUsers: (): User[] => {
        try {
            const stored = localStorage.getItem('oprisk_users');
            if (!stored) {
                localStorage.setItem('oprisk_users', JSON.stringify(INITIAL_USERS));
                return INITIAL_USERS;
            }
            return JSON.parse(stored);
        } catch (e) {
            return INITIAL_USERS;
        }
    },

    saveUser: (user: User): User[] => {
        const users = PersistenceService.getUsers();
        const existingIndex = users.findIndex(u => u.id === user.id);

        let newUsers;
        if (existingIndex >= 0) {
            newUsers = [...users];
            newUsers[existingIndex] = user;
        } else {
            newUsers = [...users, user];
        }

        localStorage.setItem('oprisk_users', JSON.stringify(newUsers));
        return newUsers;
    },

    saveAllUsers: (users: User[]) => {
        localStorage.setItem('oprisk_users', JSON.stringify(users));
    },

    // --- Events ---
    getEvents: (): OpEvent[] => {
        try {
            const stored = localStorage.getItem('oprisk_events');
            return stored ? JSON.parse(stored) : INITIAL_EVENTS;
        } catch (e) {
            return INITIAL_EVENTS;
        }
    },

    saveEvent: (event: OpEvent): OpEvent[] => {
        const events = PersistenceService.getEvents();
        const existingIndex = events.findIndex(e => e.id === event.id);

        let newEvents;
        if (existingIndex >= 0) {
            newEvents = [...events];
            newEvents[existingIndex] = event;
        } else {
            newEvents = [...events, event];
        }

        localStorage.setItem('oprisk_events', JSON.stringify(newEvents));
        return newEvents;
    },

    saveAllEvents: (events: OpEvent[]) => {
        localStorage.setItem('oprisk_events', JSON.stringify(events));
    }
};
