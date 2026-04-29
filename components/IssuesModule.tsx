
import React, { useState, useMemo } from 'react';
import { Plus, X, Save, Trash2, AlertCircle, Download, Clock } from 'lucide-react';
import { Issue, OpEvent, Control, Language } from '../types';
import { exportCSV } from '../src/services/reporting';

interface IssuesProps {
    language: Language;
    issues: Issue[];
    setIssues: (i: Issue[]) => void;
    events: OpEvent[];
    controls: Control[];
    logAction: (module: string, type: any, action: string) => void;
}

const empty: Issue = {
    id: '', title: '', description: '', source: 'Manual', sourceId: '',
    severity: 'Medium', owner: '', createdDate: '', dueDate: '', status: 'Open'
};

const today = () => new Date().toISOString().substring(0, 10);
const daysBetween = (a: string, b: string) => {
    if (!a || !b) return 0;
    return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
};

const sevColor = (s: Issue['severity']) => {
    if (s === 'Critical') return 'bg-red-500/10 text-red-500 border-red-500/30';
    if (s === 'High') return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
    if (s === 'Medium') return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
    return 'bg-slate-500/10 text-slate-500 border-slate-500/30';
};

const statusColor = (s: Issue['status']) => {
    if (s === 'Closed') return 'bg-emerald-500/10 text-emerald-500';
    if (s === 'Overdue') return 'bg-red-500/10 text-red-500';
    if (s === 'In Progress') return 'bg-blue-500/10 text-blue-500';
    return 'bg-slate-500/10 text-slate-500';
};

const computeStatus = (i: Issue): Issue['status'] => {
    if (i.status === 'Closed') return 'Closed';
    if (i.dueDate && new Date(i.dueDate) < new Date(today())) return 'Overdue';
    return i.status;
};

const IssuesModule: React.FC<IssuesProps> = ({ issues, setIssues, events, controls, logAction }) => {
    const [editing, setEditing] = useState<Issue | null>(null);
    const [filter, setFilter] = useState<'all' | 'open' | 'overdue'>('all');

    const enriched = useMemo(() => issues.map(i => ({ ...i, status: computeStatus(i) })), [issues]);

    const filtered = useMemo(() => {
        if (filter === 'open') return enriched.filter(i => i.status !== 'Closed');
        if (filter === 'overdue') return enriched.filter(i => i.status === 'Overdue');
        return enriched;
    }, [enriched, filter]);

    const stats = useMemo(() => ({
        total: enriched.length,
        open: enriched.filter(i => i.status !== 'Closed').length,
        overdue: enriched.filter(i => i.status === 'Overdue').length,
        critical: enriched.filter(i => i.severity === 'Critical' && i.status !== 'Closed').length
    }), [enriched]);

    const handleSave = (i: Issue) => {
        const isNew = !issues.find(x => x.id === i.id);
        const final = {
            ...i,
            id: i.id || `ISS-${Date.now()}`,
            createdDate: i.createdDate || today()
        };
        if (isNew) {
            setIssues([...issues, final]);
            logAction('Issues', 'Creation', `Created issue ${final.title}`);
        } else {
            setIssues(issues.map(x => x.id === final.id ? final : x));
            logAction('Issues', 'Edit', `Updated issue ${final.title}`);
        }
        setEditing(null);
    };

    const handleDelete = (id: string) => {
        setIssues(issues.filter(x => x.id !== id));
        logAction('Issues', 'Delete', `Deleted issue ${id}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Issues & Actions</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Remediation tracking with SLA and ageing</p>
                </div>
                <div className="flex space-x-2">
                    <button onClick={() => exportCSV('issues', issues)} className="flex items-center px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-sm">
                        <Download className="w-4 h-4 mr-2" /> Export CSV
                    </button>
                    <button onClick={() => setEditing({ ...empty })} className="flex items-center px-4 py-2 bg-brand-brown hover:bg-orange-800 text-white rounded-lg text-sm">
                        <Plus className="w-4 h-4 mr-2" /> New Issue
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Stat label="Total" value={stats.total} color="text-slate-700 dark:text-white" />
                <Stat label="Open" value={stats.open} color="text-blue-500" />
                <Stat label="Overdue" value={stats.overdue} color="text-red-500" />
                <Stat label="Critical Open" value={stats.critical} color="text-red-500" />
            </div>

            <div className="flex space-x-2">
                {(['all', 'open', 'overdue'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-lg text-xs font-medium ${filter === f ? 'bg-brand-brown text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-500 uppercase">
                        <tr>
                            <th className="text-left px-4 py-3">Issue</th>
                            <th className="text-left px-4 py-3">Source</th>
                            <th className="text-left px-4 py-3">Owner</th>
                            <th className="text-center px-4 py-3">Severity</th>
                            <th className="text-left px-4 py-3">Due</th>
                            <th className="text-right px-4 py-3">Age (days)</th>
                            <th className="text-center px-4 py-3">Status</th>
                            <th className="text-center px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 && (
                            <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                No issues to display.
                            </td></tr>
                        )}
                        {filtered.map(i => (
                            <tr key={i.id} className="border-t border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer" onClick={() => setEditing(i)}>
                                <td className="px-4 py-3">
                                    <div className="font-medium text-slate-800 dark:text-white">{i.title}</div>
                                    <div className="text-xs text-slate-500">{i.id}</div>
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-500">{i.source}{i.sourceId ? ` · ${i.sourceId}` : ''}</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{i.owner}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-xs border ${sevColor(i.severity)}`}>{i.severity}</span>
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-500">{i.dueDate || '—'}</td>
                                <td className="px-4 py-3 text-right text-xs flex items-center justify-end">
                                    <Clock className="w-3 h-3 mr-1 text-slate-400" />
                                    {i.createdDate ? daysBetween(i.createdDate, today()) : 0}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${statusColor(i.status)}`}>{i.status}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(i.id); }} className="text-slate-400 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editing && (
                <Drawer initial={editing} events={events} controls={controls} onSave={handleSave} onClose={() => setEditing(null)} />
            )}
        </div>
    );
};

const Stat = ({ label, value, color }: any) => (
    <div className="bg-white dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-white/5">
        <p className="text-xs text-slate-500 uppercase">{label}</p>
        <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
);

const Drawer = ({ initial, events, controls, onSave, onClose }: any) => {
    const [data, setData] = useState<Issue>(initial);
    const sourceList = data.source === 'Event' ? events.map((e: OpEvent) => ({ id: e.id, name: e.title }))
        : data.source === 'Control' ? controls.map((c: Control) => ({ id: c.id, name: c.name }))
            : [];
    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl overflow-y-auto">
                <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <h3 className="text-lg font-bold">{data.id ? 'Edit Issue' : 'New Issue'}</h3>
                    <button onClick={onClose}><X className="w-6 h-6 text-slate-400" /></button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onSave(data); }} className="p-6 space-y-4">
                    <F label="Title"><input required value={data.title} onChange={e => setData({ ...data, title: e.target.value })} className={cls} /></F>
                    <F label="Description"><textarea rows={2} value={data.description} onChange={e => setData({ ...data, description: e.target.value })} className={cls} /></F>
                    <div className="grid grid-cols-2 gap-3">
                        <F label="Source">
                            <select value={data.source} onChange={e => setData({ ...data, source: e.target.value as any, sourceId: '' })} className={cls}>
                                <option>Manual</option><option>Event</option><option>Control</option><option>Audit</option><option>KRI</option>
                            </select>
                        </F>
                        <F label="Source ID">
                            {sourceList.length > 0 ? (
                                <select value={data.sourceId || ''} onChange={e => setData({ ...data, sourceId: e.target.value })} className={cls}>
                                    <option value="">—</option>
                                    {sourceList.map((x: any) => <option key={x.id} value={x.id}>{x.name}</option>)}
                                </select>
                            ) : (
                                <input value={data.sourceId || ''} onChange={e => setData({ ...data, sourceId: e.target.value })} className={cls} />
                            )}
                        </F>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <F label="Severity">
                            <select value={data.severity} onChange={e => setData({ ...data, severity: e.target.value as any })} className={cls}>
                                <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                            </select>
                        </F>
                        <F label="Status">
                            <select value={data.status} onChange={e => setData({ ...data, status: e.target.value as any })} className={cls}>
                                <option>Open</option><option>In Progress</option><option>Closed</option>
                            </select>
                        </F>
                    </div>
                    <F label="Owner"><input required value={data.owner} onChange={e => setData({ ...data, owner: e.target.value })} className={cls} /></F>
                    <F label="Due date"><input type="date" value={data.dueDate} onChange={e => setData({ ...data, dueDate: e.target.value })} className={cls} /></F>
                    <button type="submit" className="w-full py-3 bg-brand-brown hover:bg-orange-800 text-white font-bold rounded-xl flex items-center justify-center">
                        <Save className="w-5 h-5 mr-2" /> Save
                    </button>
                </form>
            </div>
        </div>
    );
};

const F = ({ label, children }: any) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label>
        {children}
    </div>
);
const cls = "w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-slate-900 dark:text-white text-sm";

export default IssuesModule;
