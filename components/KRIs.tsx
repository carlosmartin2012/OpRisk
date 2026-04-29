
import React, { useState, useMemo } from 'react';
import { Plus, X, Save, Trash2, TrendingUp, TrendingDown, Minus, Download, Activity } from 'lucide-react';
import { KRI, RiskItem, Language } from '../types';
import { exportCSV } from '../src/services/reporting';

interface KRIsProps {
    language: Language;
    kris: KRI[];
    setKris: (k: KRI[]) => void;
    risks: RiskItem[];
    logAction: (module: string, type: any, action: string) => void;
}

const emptyKRI: KRI = {
    id: '',
    name: '',
    description: '',
    riskId: '',
    owner: '',
    unit: '%',
    currentValue: 0,
    greenMax: 5,
    amberMax: 10,
    frequency: 'Monthly',
    trend: 'flat',
    lastUpdated: ''
};

const ragStatus = (k: KRI): 'green' | 'amber' | 'red' => {
    if (k.currentValue <= k.greenMax) return 'green';
    if (k.currentValue <= k.amberMax) return 'amber';
    return 'red';
};

const ragColor = (status: string) => {
    if (status === 'green') return 'bg-emerald-500';
    if (status === 'amber') return 'bg-yellow-500';
    return 'bg-red-500';
};

const KRIs: React.FC<KRIsProps> = ({ kris, setKris, risks, logAction }) => {
    const [editing, setEditing] = useState<KRI | null>(null);

    const handleSave = (k: KRI) => {
        const isNew = !kris.find(x => x.id === k.id);
        const final = {
            ...k,
            id: k.id || `KRI-${Date.now()}`,
            lastUpdated: new Date().toISOString().substring(0, 10)
        };
        if (isNew) {
            setKris([...kris, final]);
            logAction('KRIs', 'Creation', `Created KRI ${final.name}`);
        } else {
            setKris(kris.map(x => x.id === final.id ? final : x));
            logAction('KRIs', 'Edit', `Updated KRI ${final.name}`);
        }
        setEditing(null);
    };

    const handleDelete = (id: string) => {
        setKris(kris.filter(k => k.id !== id));
        logAction('KRIs', 'Delete', `Deleted KRI ${id}`);
    };

    const stats = useMemo(() => {
        const green = kris.filter(k => ragStatus(k) === 'green').length;
        const amber = kris.filter(k => ragStatus(k) === 'amber').length;
        const red = kris.filter(k => ragStatus(k) === 'red').length;
        return { green, amber, red, total: kris.length };
    }, [kris]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Key Risk Indicators</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Forward-looking metrics with thresholds and RAG status</p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => exportCSV('kris', kris)}
                        className="flex items-center px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-700 dark:text-white"
                    >
                        <Download className="w-4 h-4 mr-2" /> Export CSV
                    </button>
                    <button
                        onClick={() => setEditing({ ...emptyKRI })}
                        className="flex items-center px-4 py-2 bg-brand-brown hover:bg-orange-800 text-white rounded-lg text-sm shadow-lg shadow-brand-brown/20"
                    >
                        <Plus className="w-4 h-4 mr-2" /> New KRI
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard label="Total KRIs" value={stats.total} color="text-slate-700 dark:text-white" />
                <StatCard label="Green" value={stats.green} color="text-emerald-500" />
                <StatCard label="Amber" value={stats.amber} color="text-yellow-500" />
                <StatCard label="Red" value={stats.red} color="text-red-500" />
            </div>

            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-500 uppercase">
                        <tr>
                            <th className="text-left px-4 py-3">KRI</th>
                            <th className="text-left px-4 py-3">Owner</th>
                            <th className="text-left px-4 py-3">Risk</th>
                            <th className="text-right px-4 py-3">Current</th>
                            <th className="text-right px-4 py-3">Green ≤</th>
                            <th className="text-right px-4 py-3">Amber ≤</th>
                            <th className="text-center px-4 py-3">Trend</th>
                            <th className="text-center px-4 py-3">Status</th>
                            <th className="text-center px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {kris.length === 0 && (
                            <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                No KRIs yet. Click "New KRI" to add one.
                            </td></tr>
                        )}
                        {kris.map(k => {
                            const status = ragStatus(k);
                            const risk = risks.find(r => r.id === k.riskId);
                            return (
                                <tr key={k.id} className="border-t border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer" onClick={() => setEditing(k)}>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-800 dark:text-white">{k.name}</div>
                                        <div className="text-xs text-slate-500">{k.id} · {k.frequency}</div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{k.owner}</td>
                                    <td className="px-4 py-3 text-xs text-slate-500">{risk?.name || '—'}</td>
                                    <td className="px-4 py-3 text-right font-mono">{k.currentValue}{k.unit !== 'count' ? k.unit : ''}</td>
                                    <td className="px-4 py-3 text-right text-emerald-500 font-mono">{k.greenMax}</td>
                                    <td className="px-4 py-3 text-right text-yellow-500 font-mono">{k.amberMax}</td>
                                    <td className="px-4 py-3 text-center">
                                        {k.trend === 'up' && <TrendingUp className="w-4 h-4 text-red-500 inline" />}
                                        {k.trend === 'down' && <TrendingDown className="w-4 h-4 text-emerald-500 inline" />}
                                        {k.trend === 'flat' && <Minus className="w-4 h-4 text-slate-400 inline" />}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-block w-3 h-3 rounded-full ${ragColor(status)}`}></span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(k.id); }} className="text-slate-400 hover:text-red-500">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {editing && (
                <KRIDrawer
                    initial={editing}
                    risks={risks}
                    onSave={handleSave}
                    onClose={() => setEditing(null)}
                />
            )}
        </div>
    );
};

const StatCard = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className="bg-white dark:bg-slate-800/50 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <p className="text-xs text-slate-500 uppercase">{label}</p>
        <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
);

const KRIDrawer = ({ initial, risks, onSave, onClose }: { initial: KRI; risks: RiskItem[]; onSave: (k: KRI) => void; onClose: () => void }) => {
    const [data, setData] = useState<KRI>(initial);
    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right">
                <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <h3 className="text-lg font-bold">{data.id ? 'Edit KRI' : 'New KRI'}</h3>
                    <button onClick={onClose}><X className="w-6 h-6 text-slate-400" /></button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onSave(data); }} className="p-6 space-y-4">
                    <Field label="Name"><input required value={data.name} onChange={e => setData({ ...data, name: e.target.value })} className={inputCls} /></Field>
                    <Field label="Description"><textarea rows={2} value={data.description} onChange={e => setData({ ...data, description: e.target.value })} className={inputCls} /></Field>
                    <Field label="Owner"><input required value={data.owner} onChange={e => setData({ ...data, owner: e.target.value })} className={inputCls} /></Field>
                    <Field label="Linked Risk">
                        <select value={data.riskId || ''} onChange={e => setData({ ...data, riskId: e.target.value })} className={inputCls}>
                            <option value="">— None —</option>
                            {risks.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Unit">
                            <select value={data.unit} onChange={e => setData({ ...data, unit: e.target.value as any })} className={inputCls}>
                                <option>%</option><option>€</option><option>count</option><option>days</option><option>hours</option>
                            </select>
                        </Field>
                        <Field label="Frequency">
                            <select value={data.frequency} onChange={e => setData({ ...data, frequency: e.target.value as any })} className={inputCls}>
                                <option>Daily</option><option>Weekly</option><option>Monthly</option><option>Quarterly</option>
                            </select>
                        </Field>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <Field label="Current"><input type="number" step="any" value={data.currentValue} onChange={e => setData({ ...data, currentValue: Number(e.target.value) })} className={inputCls} /></Field>
                        <Field label="Green ≤"><input type="number" step="any" value={data.greenMax} onChange={e => setData({ ...data, greenMax: Number(e.target.value) })} className={inputCls} /></Field>
                        <Field label="Amber ≤"><input type="number" step="any" value={data.amberMax} onChange={e => setData({ ...data, amberMax: Number(e.target.value) })} className={inputCls} /></Field>
                    </div>
                    <Field label="Trend">
                        <select value={data.trend} onChange={e => setData({ ...data, trend: e.target.value as any })} className={inputCls}>
                            <option value="up">Up (worsening)</option>
                            <option value="flat">Flat</option>
                            <option value="down">Down (improving)</option>
                        </select>
                    </Field>
                    <button type="submit" className="w-full py-3 bg-brand-brown hover:bg-orange-800 text-white font-bold rounded-xl flex items-center justify-center">
                        <Save className="w-5 h-5 mr-2" /> Save
                    </button>
                </form>
            </div>
        </div>
    );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label>
        {children}
    </div>
);

const inputCls = "w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-slate-900 dark:text-white text-sm";

export default KRIs;
