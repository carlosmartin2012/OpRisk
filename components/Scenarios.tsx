
import React, { useState, useMemo } from 'react';
import { Plus, X, Save, Trash2, Play, Download, Sparkles } from 'lucide-react';
import { Scenario, EBA_EVENT_TYPES, BUSINESS_LINES, Language } from '../types';
import { exportCSV } from '../src/services/reporting';

interface ScenariosProps {
    language: Language;
    scenarios: Scenario[];
    setScenarios: (s: Scenario[]) => void;
    logAction: (module: string, type: any, action: string) => void;
}

const empty: Scenario = {
    id: '', name: '', description: '', eventType: EBA_EVENT_TYPES[0],
    businessLine: BUSINESS_LINES[0], frequencyPerYear: 1,
    severityMin: 100000, severityMode: 500000, severityMax: 5000000, owner: ''
};

// Triangular distribution sample
const sampleTriangular = (min: number, mode: number, max: number) => {
    const u = Math.random();
    const F = (mode - min) / (max - min);
    if (u < F) return min + Math.sqrt(u * (max - min) * (mode - min));
    return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
};

// Poisson sample for frequency
const samplePoisson = (lambda: number) => {
    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    do {
        k++;
        p *= Math.random();
    } while (p > L);
    return k - 1;
};

const Scenarios: React.FC<ScenariosProps> = ({ scenarios, setScenarios, logAction }) => {
    const [editing, setEditing] = useState<Scenario | null>(null);
    const [simResult, setSimResult] = useState<{ var95: number; var99: number; mean: number; max: number } | null>(null);

    const handleSave = (s: Scenario) => {
        const isNew = !scenarios.find(x => x.id === s.id);
        const final = { ...s, id: s.id || `SCN-${Date.now()}` };
        if (isNew) {
            setScenarios([...scenarios, final]);
            logAction('Scenarios', 'Creation', `Created scenario ${final.name}`);
        } else {
            setScenarios(scenarios.map(x => x.id === final.id ? final : x));
            logAction('Scenarios', 'Edit', `Updated scenario ${final.name}`);
        }
        setEditing(null);
    };

    const handleDelete = (id: string) => {
        setScenarios(scenarios.filter(x => x.id !== id));
        logAction('Scenarios', 'Delete', `Deleted scenario ${id}`);
    };

    const expectedAnnual = useMemo(() => scenarios.reduce((acc, s) => {
        const expectedSev = (s.severityMin + s.severityMode + s.severityMax) / 3;
        return acc + s.frequencyPerYear * expectedSev;
    }, 0), [scenarios]);

    const runMonteCarlo = (iterations: number = 5000) => {
        if (scenarios.length === 0) return;
        const totals: number[] = [];
        for (let i = 0; i < iterations; i++) {
            let total = 0;
            for (const s of scenarios) {
                const n = samplePoisson(s.frequencyPerYear);
                for (let j = 0; j < n; j++) {
                    total += sampleTriangular(s.severityMin, s.severityMode, s.severityMax);
                }
            }
            totals.push(total);
        }
        totals.sort((a, b) => a - b);
        const mean = totals.reduce((a, b) => a + b, 0) / totals.length;
        const var95 = totals[Math.floor(totals.length * 0.95)];
        const var99 = totals[Math.floor(totals.length * 0.99)];
        const max = totals[totals.length - 1];
        setSimResult({ mean, var95, var99, max });
        logAction('Scenarios', 'Execution', `Monte Carlo simulation (${iterations} iter)`);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Scenario Analysis</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Forward-looking tail event scenarios for ICAAP</p>
                </div>
                <div className="flex space-x-2">
                    <button onClick={() => exportCSV('scenarios', scenarios)} className="flex items-center px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-sm">
                        <Download className="w-4 h-4 mr-2" /> Export
                    </button>
                    <button onClick={() => runMonteCarlo()} disabled={scenarios.length === 0} className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-lg text-sm">
                        <Play className="w-4 h-4 mr-2" /> Run Monte Carlo
                    </button>
                    <button onClick={() => setEditing({ ...empty })} className="flex items-center px-4 py-2 bg-brand-brown hover:bg-orange-800 text-white rounded-lg text-sm">
                        <Plus className="w-4 h-4 mr-2" /> New
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-white/5">
                    <p className="text-xs text-slate-500 uppercase">Expected Annual Loss (deterministic)</p>
                    <p className="text-3xl font-bold mt-2 text-slate-800 dark:text-white">€ {(expectedAnnual / 1e6).toFixed(2)}M</p>
                    <p className="text-xs text-slate-500 mt-1">Sum of frequency × mean severity</p>
                </div>
                {simResult && (
                    <div className="bg-gradient-to-br from-purple-600/90 to-slate-900/90 p-6 rounded-2xl border border-purple-500/30 text-white">
                        <p className="text-xs uppercase opacity-80 flex items-center"><Sparkles className="w-3 h-3 mr-1" /> Monte Carlo (5k iter)</p>
                        <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                            <div><span className="opacity-70">Mean</span><div className="text-lg font-bold">€{(simResult.mean / 1e6).toFixed(2)}M</div></div>
                            <div><span className="opacity-70">VaR 95%</span><div className="text-lg font-bold">€{(simResult.var95 / 1e6).toFixed(2)}M</div></div>
                            <div><span className="opacity-70">VaR 99%</span><div className="text-lg font-bold text-orange-300">€{(simResult.var99 / 1e6).toFixed(2)}M</div></div>
                            <div><span className="opacity-70">Max</span><div className="text-lg font-bold">€{(simResult.max / 1e6).toFixed(2)}M</div></div>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-500 uppercase">
                        <tr>
                            <th className="text-left px-4 py-3">Scenario</th>
                            <th className="text-left px-4 py-3">Event Type</th>
                            <th className="text-left px-4 py-3">BL</th>
                            <th className="text-right px-4 py-3">Freq/yr</th>
                            <th className="text-right px-4 py-3">Sev Min</th>
                            <th className="text-right px-4 py-3">Sev Mode</th>
                            <th className="text-right px-4 py-3">Sev Max</th>
                            <th className="text-right px-4 py-3">EAL</th>
                            <th className="text-center px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {scenarios.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">No scenarios yet.</td></tr>}
                        {scenarios.map(s => {
                            const eal = s.frequencyPerYear * (s.severityMin + s.severityMode + s.severityMax) / 3;
                            return (
                                <tr key={s.id} className="border-t border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer" onClick={() => setEditing(s)}>
                                    <td className="px-4 py-3"><div className="font-medium">{s.name}</div><div className="text-xs text-slate-500">{s.id}</div></td>
                                    <td className="px-4 py-3 text-xs">{s.eventType}</td>
                                    <td className="px-4 py-3 text-xs">{s.businessLine}</td>
                                    <td className="px-4 py-3 text-right font-mono">{s.frequencyPerYear}</td>
                                    <td className="px-4 py-3 text-right font-mono text-xs">€{(s.severityMin / 1e3).toFixed(0)}k</td>
                                    <td className="px-4 py-3 text-right font-mono text-xs">€{(s.severityMode / 1e3).toFixed(0)}k</td>
                                    <td className="px-4 py-3 text-right font-mono text-xs">€{(s.severityMax / 1e3).toFixed(0)}k</td>
                                    <td className="px-4 py-3 text-right font-mono text-xs font-bold">€{(eal / 1e3).toFixed(0)}k</td>
                                    <td className="px-4 py-3 text-center">
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {editing && <Drawer initial={editing} onSave={handleSave} onClose={() => setEditing(null)} />}
        </div>
    );
};

const Drawer = ({ initial, onSave, onClose }: any) => {
    const [data, setData] = useState<Scenario>(initial);
    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl overflow-y-auto">
                <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <h3 className="text-lg font-bold">{data.id ? 'Edit Scenario' : 'New Scenario'}</h3>
                    <button onClick={onClose}><X className="w-6 h-6 text-slate-400" /></button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onSave(data); }} className="p-6 space-y-4">
                    <F label="Name"><input required value={data.name} onChange={e => setData({ ...data, name: e.target.value })} className={cls} /></F>
                    <F label="Description"><textarea rows={2} value={data.description} onChange={e => setData({ ...data, description: e.target.value })} className={cls} /></F>
                    <F label="Owner"><input required value={data.owner} onChange={e => setData({ ...data, owner: e.target.value })} className={cls} /></F>
                    <div className="grid grid-cols-2 gap-3">
                        <F label="Event Type">
                            <select value={data.eventType} onChange={e => setData({ ...data, eventType: e.target.value })} className={cls}>
                                {EBA_EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </F>
                        <F label="Business Line">
                            <select value={data.businessLine} onChange={e => setData({ ...data, businessLine: e.target.value })} className={cls}>
                                {BUSINESS_LINES.map(b => <option key={b}>{b}</option>)}
                            </select>
                        </F>
                    </div>
                    <F label="Frequency per year (λ)">
                        <input type="number" step="0.1" required value={data.frequencyPerYear} onChange={e => setData({ ...data, frequencyPerYear: Number(e.target.value) })} className={cls} />
                    </F>
                    <div className="grid grid-cols-3 gap-2">
                        <F label="Sev Min (€)"><input type="number" required value={data.severityMin} onChange={e => setData({ ...data, severityMin: Number(e.target.value) })} className={cls} /></F>
                        <F label="Sev Mode (€)"><input type="number" required value={data.severityMode} onChange={e => setData({ ...data, severityMode: Number(e.target.value) })} className={cls} /></F>
                        <F label="Sev Max (€)"><input type="number" required value={data.severityMax} onChange={e => setData({ ...data, severityMax: Number(e.target.value) })} className={cls} /></F>
                    </div>
                    <button type="submit" className="w-full py-3 bg-brand-brown hover:bg-orange-800 text-white font-bold rounded-xl flex items-center justify-center">
                        <Save className="w-5 h-5 mr-2" /> Save
                    </button>
                </form>
            </div>
        </div>
    );
};

const F = ({ label, children }: any) => (
    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label>{children}</div>
);
const cls = "w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-slate-900 dark:text-white text-sm";

export default Scenarios;
