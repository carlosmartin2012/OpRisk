
import React, { useState, useEffect } from 'react';
import { Plug, CheckCircle, XCircle, RefreshCw, Database, Ticket, Shield, Building, Zap } from 'lucide-react';
import { Integration, Language } from '../types';

interface IntegrationsProps {
    language: Language;
    integrations: Integration[];
    setIntegrations: (i: Integration[]) => void;
    logAction: (m: string, t: any, a: string) => void;
}

const DEFAULTS: Integration[] = [
    { id: 'INT-ORX', name: 'ORX External Loss Data', type: 'External Loss Data', description: 'Operational Riskdata eXchange — anonymised consortium loss data for benchmarking', status: 'Disconnected' },
    { id: 'INT-ORIC', name: 'ORIC International', type: 'External Loss Data', description: 'Insurance industry external loss database', status: 'Disconnected' },
    { id: 'INT-SAS', name: 'SAS OpRisk Global Data', type: 'External Loss Data', description: 'Public domain external loss data from SAS', status: 'Disconnected' },
    { id: 'INT-JIRA', name: 'Jira', type: 'Ticketing', description: 'Sync issues and remediation tickets', status: 'Disconnected' },
    { id: 'INT-SNOW', name: 'ServiceNow', type: 'Ticketing', description: 'GRC, ITSM and IRM modules', status: 'Disconnected' },
    { id: 'INT-SAP', name: 'SAP', type: 'ERP', description: 'Pull G/L data for Business Indicator computation', status: 'Disconnected' },
    { id: 'INT-WD', name: 'Workday', type: 'ERP', description: 'HR data for employee fraud / boundary events', status: 'Disconnected' },
    { id: 'INT-SPL', name: 'Splunk', type: 'SIEM', description: 'Security & ICT incident telemetry', status: 'Disconnected' },
    { id: 'INT-GRC', name: 'Archer GRC', type: 'GRC', description: 'Push controls / RCSA into Archer', status: 'Disconnected' }
];

const typeIcon = (t: Integration['type']) => {
    if (t === 'External Loss Data') return Database;
    if (t === 'Ticketing') return Ticket;
    if (t === 'GRC') return Shield;
    if (t === 'ERP') return Building;
    return Zap;
};

const Integrations: React.FC<IntegrationsProps> = ({ integrations, setIntegrations, logAction }) => {
    const [pending, setPending] = useState<string | null>(null);

    // Seed defaults on first run
    useEffect(() => {
        if (integrations.length === 0) {
            setIntegrations(DEFAULTS);
        }
    }, []);

    const list = integrations.length === 0 ? DEFAULTS : integrations;

    const toggle = async (id: string) => {
        const item = list.find(x => x.id === id);
        if (!item) return;
        setPending(id);

        // Mock async "connection"
        await new Promise(r => setTimeout(r, 800));

        const next = item.status === 'Connected' ? 'Disconnected' : 'Connected';
        const updated = list.map(x => x.id === id ? {
            ...x,
            status: next as Integration['status'],
            lastSync: next === 'Connected' ? new Date().toISOString() : x.lastSync
        } : x);
        setIntegrations(updated);
        setPending(null);
        logAction('Integrations', 'Execution', `${next === 'Connected' ? 'Connected to' : 'Disconnected from'} ${item.name}`);
    };

    const grouped = ['External Loss Data', 'Ticketing', 'GRC', 'ERP', 'SIEM'] as const;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Integrations</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Connect to external loss data and downstream systems</p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4 flex items-start">
                <Plug className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">API connectors (sandbox)</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300/80 mt-1">
                        These connectors are wired as mocks. Click "Connect" to simulate the handshake. Real OAuth/API key flows will be configured per-tenant.
                    </p>
                </div>
            </div>

            {grouped.map(g => {
                const items = list.filter(i => i.type === g);
                if (items.length === 0) return null;
                return (
                    <div key={g}>
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase mb-3">{g}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.map(i => {
                                const Icon = typeIcon(i.type);
                                const connected = i.status === 'Connected';
                                const isPending = pending === i.id;
                                return (
                                    <div key={i.id} className={`p-5 rounded-2xl border transition-colors ${connected ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-500/30' : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-white/5'}`}>
                                        <div className="flex justify-between items-start">
                                            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/50">
                                                <Icon className="w-5 h-5 text-brand-brown" />
                                            </div>
                                            {connected ? (
                                                <span className="flex items-center text-xs text-emerald-500 font-medium">
                                                    <CheckCircle className="w-3 h-3 mr-1" /> Connected
                                                </span>
                                            ) : (
                                                <span className="flex items-center text-xs text-slate-400 font-medium">
                                                    <XCircle className="w-3 h-3 mr-1" /> Disconnected
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-slate-800 dark:text-white mt-3">{i.name}</h4>
                                        <p className="text-xs text-slate-500 mt-1 min-h-[2.5rem]">{i.description}</p>
                                        {connected && i.lastSync && (
                                            <p className="text-[10px] text-slate-400 mt-2">Last sync: {new Date(i.lastSync).toLocaleString()}</p>
                                        )}
                                        <button
                                            onClick={() => toggle(i.id)}
                                            disabled={isPending}
                                            className={`mt-4 w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center disabled:opacity-50 ${connected ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600' : 'bg-brand-brown hover:bg-orange-800 text-white'}`}
                                        >
                                            {isPending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Plug className="w-4 h-4 mr-2" />}
                                            {isPending ? 'Connecting...' : connected ? 'Disconnect' : 'Connect'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Integrations;
