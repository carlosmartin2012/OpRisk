
import React, { useState, useMemo } from 'react';
import { Plus, X, Save, Trash2, Target, Download } from 'lucide-react';
import { AppetiteStatement, OpEvent, BUSINESS_LINES, EBA_EVENT_TYPES, Language } from '../types';
import { exportCSV } from '../src/services/reporting';

interface AppetiteProps {
    language: Language;
    appetite: AppetiteStatement[];
    setAppetite: (a: AppetiteStatement[]) => void;
    events: OpEvent[];
    logAction: (module: string, type: any, action: string) => void;
}

const empty: AppetiteStatement = {
    id: '', scope: 'All', metric: 'Gross Loss', threshold: 1000000,
    unit: '€', period: 'Annual', actual: 0, status: 'Within'
};

const computeStatus = (a: AppetiteStatement): AppetiteStatement['status'] => {
    if (a.actual >= a.threshold) return 'Breach';
    if (a.actual >= 0.8 * a.threshold) return 'Watch';
    return 'Within';
};

const statusColor = (s: string) => {
    if (s === 'Breach') return 'bg-red-500/10 text-red-500 border-red-500/30';
    if (s === 'Watch') return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
    return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
};

const RiskAppetite: React.FC<AppetiteProps> = ({ appetite, setAppetite, events, logAction }) => {
    const [editing, setEditing] = useState<AppetiteStatement | null>(null);

    // Auto-compute actuals from events for "Gross Loss" metric
    const enriched = useMemo(() => appetite.map(a => {
        let actual = a.actual;
        if (a.metric === 'Gross Loss') {
            const matching = events.filter(e => {
                if (e.status !== 'Approved') return false;
                if (a.scope === 'All') return true;
                if (BUSINESS_LINES.includes(a.scope)) return e.businessLine === a.scope;
                if (EBA_EVENT_TYPES.includes(a.scope)) return e.eventType === a.scope;
                return false;
            });
            actual = matching.reduce((s, e) => s + (e.amount || 0), 0);
        }
        const status = computeStatus({ ...a, actual });
        return { ...a, actual, status };
    }), [appetite, events]);

    const handleSave = (a: AppetiteStatement) => {
        const isNew = !appetite.find(x => x.id === a.id);
        const final = { ...a, id: a.id || `APP-${Date.now()}` };
        if (isNew) {
            setAppetite([...appetite, final]);
            logAction('Appetite', 'Creation', `Created statement ${final.scope} - ${final.metric}`);
        } else {
            setAppetite(appetite.map(x => x.id === final.id ? final : x));
        }
        setEditing(null);
    };

    const handleDelete = (id: string) => {
        setAppetite(appetite.filter(x => x.id !== id));
        logAction('Appetite', 'Delete', `Deleted statement ${id}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Risk Appetite</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Quantitative thresholds and tolerance with live RAG status</p>
                </div>
                <div className="flex space-x-2">
                    <button onClick={() => exportCSV('appetite', enriched)} className="flex items-center px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-sm">
                        <Download className="w-4 h-4 mr-2" /> Export
                    </button>
                    <button onClick={() => setEditing({ ...empty })} className="flex items-center px-4 py-2 bg-brand-brown hover:bg-orange-800 text-white rounded-lg text-sm">
                        <Plus className="w-4 h-4 mr-2" /> New Statement
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enriched.length === 0 && (
                    <div className="md:col-span-3 bg-white dark:bg-slate-800/50 p-12 rounded-2xl border border-slate-200 dark:border-white/5 text-center text-slate-400">
                        <Target className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        No appetite statements defined.
                    </div>
                )}
                {enriched.map(a => {
                    const pct = a.threshold > 0 ? Math.min(100, (a.actual / a.threshold) * 100) : 0;
                    return (
                        <div key={a.id} onClick={() => setEditing(a)} className="cursor-pointer bg-white dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-brand-brown transition-colors">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs uppercase text-slate-500">{a.scope}</p>
                                    <h3 className="font-bold text-slate-800 dark:text-white mt-1">{a.metric}</h3>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-xs border ${statusColor(a.status)}`}>{a.status}</span>
                            </div>
                            <div className="mt-4">
                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                    <span>Actual: {a.unit}{a.actual.toLocaleString()}</span>
                                    <span>Limit: {a.unit}{a.threshold.toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                    <div className={`h-2 rounded-full ${a.status === 'Breach' ? 'bg-red-500' : a.status === 'Watch' ? 'bg-yellow-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }}></div>
                                </div>
                                <p className="text-xs text-slate-400 mt-2">{a.period} window</p>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }} className="absolute -ml-4 mt-4 text-slate-400 hover:text-red-500">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>

            {editing && <Drawer initial={editing} onSave={handleSave} onClose={() => setEditing(null)} />}
        </div>
    );
};

const Drawer = ({ initial, onSave, onClose }: any) => {
    const [data, setData] = useState<AppetiteStatement>(initial);
    const scopes = ['All', ...BUSINESS_LINES, ...EBA_EVENT_TYPES];
    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl overflow-y-auto">
                <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <h3 className="text-lg font-bold">{data.id ? 'Edit Statement' : 'New Statement'}</h3>
                    <button onClick={onClose}><X className="w-6 h-6 text-slate-400" /></button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onSave(data); }} className="p-6 space-y-4">
                    <F label="Scope">
                        <select value={data.scope} onChange={e => setData({ ...data, scope: e.target.value })} className={cls}>
                            {scopes.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </F>
                    <F label="Metric">
                        <select value={data.metric} onChange={e => setData({ ...data, metric: e.target.value })} className={cls}>
                            <option>Gross Loss</option><option>Net Loss</option><option>Event Count</option><option>Capital Charge</option>
                        </select>
                    </F>
                    <div className="grid grid-cols-2 gap-3">
                        <F label="Unit">
                            <select value={data.unit} onChange={e => setData({ ...data, unit: e.target.value as any })} className={cls}>
                                <option>€</option><option>%</option><option>count</option>
                            </select>
                        </F>
                        <F label="Period">
                            <select value={data.period} onChange={e => setData({ ...data, period: e.target.value as any })} className={cls}>
                                <option>Monthly</option><option>Quarterly</option><option>Annual</option>
                            </select>
                        </F>
                    </div>
                    <F label="Threshold"><input type="number" required value={data.threshold} onChange={e => setData({ ...data, threshold: Number(e.target.value) })} className={cls} /></F>
                    <F label="Actual (manual override)">
                        <input type="number" value={data.actual} onChange={e => setData({ ...data, actual: Number(e.target.value) })} className={cls} />
                        <p className="text-xs text-slate-500 mt-1">For "Gross Loss" metric, actual is auto-computed from approved events.</p>
                    </F>
                    <button type="submit" className="w-full py-3 bg-brand-brown hover:bg-orange-800 text-white font-bold rounded-xl flex items-center justify-center">
                        <Save className="w-5 h-5 mr-2" /> Save
                    </button>
                </form>
            </div>
        </div>
    );
};

const F = ({ label, children }: any) => <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label>{children}</div>;
const cls = "w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-slate-900 dark:text-white text-sm";

export default RiskAppetite;
