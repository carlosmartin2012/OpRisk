
import React, { useState } from 'react';
import { Plus, X, Save, Trash2, Server, Clock, AlertTriangle, Download } from 'lucide-react';
import { Vendor, BIA, ICTIncident, Process, Language } from '../types';
import { exportCSV } from '../src/services/reporting';

interface DORAProps {
    language: Language;
    vendors: Vendor[]; setVendors: (v: Vendor[]) => void;
    bias: BIA[]; setBias: (b: BIA[]) => void;
    ictIncidents: ICTIncident[]; setIctIncidents: (i: ICTIncident[]) => void;
    processes: Process[];
    logAction: (m: string, t: any, a: string) => void;
}

type Tab = 'vendors' | 'bia' | 'incidents';

const DORA: React.FC<DORAProps> = ({ vendors, setVendors, bias, setBias, ictIncidents, setIctIncidents, processes, logAction }) => {
    const [tab, setTab] = useState<Tab>('vendors');

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">DORA / Operational Resilience</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Third-party register, BIA and ICT incident management</p>
            </div>

            <div className="flex space-x-2 border-b border-slate-200 dark:border-white/10">
                {[
                    { id: 'vendors' as Tab, label: 'Third Parties', icon: Server, count: vendors.length },
                    { id: 'bia' as Tab, label: 'Business Impact (BIA)', icon: Clock, count: bias.length },
                    { id: 'incidents' as Tab, label: 'ICT Incidents', icon: AlertTriangle, count: ictIncidents.length }
                ].map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 text-sm font-medium flex items-center border-b-2 -mb-px ${tab === t.id ? 'border-brand-brown text-brand-brown' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                        <t.icon className="w-4 h-4 mr-2" /> {t.label}
                        <span className="ml-2 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-xs">{t.count}</span>
                    </button>
                ))}
            </div>

            {tab === 'vendors' && <VendorsTab vendors={vendors} setVendors={setVendors} logAction={logAction} />}
            {tab === 'bia' && <BIATab bias={bias} setBias={setBias} processes={processes} logAction={logAction} />}
            {tab === 'incidents' && <IncidentsTab incidents={ictIncidents} setIncidents={setIctIncidents} logAction={logAction} />}
        </div>
    );
};

// --- VENDORS ---
const emptyVendor: Vendor = { id: '', name: '', service: '', criticality: 'Standard', country: 'ES', contractEnd: '', exitPlan: 'No', ictThirdParty: false };

const VendorsTab = ({ vendors, setVendors, logAction }: any) => {
    const [editing, setEditing] = useState<Vendor | null>(null);
    const handleSave = (v: Vendor) => {
        const isNew = !vendors.find((x: Vendor) => x.id === v.id);
        const final = { ...v, id: v.id || `VND-${Date.now()}` };
        if (isNew) { setVendors([...vendors, final]); logAction('DORA', 'Creation', `Vendor ${final.name}`); }
        else setVendors(vendors.map((x: Vendor) => x.id === final.id ? final : x));
        setEditing(null);
    };
    return (
        <div>
            <div className="flex justify-end mb-4 space-x-2">
                <button onClick={() => exportCSV('vendors', vendors)} className="flex items-center px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-sm">
                    <Download className="w-4 h-4 mr-2" /> Export
                </button>
                <button onClick={() => setEditing({ ...emptyVendor })} className="flex items-center px-4 py-2 bg-brand-brown hover:bg-orange-800 text-white rounded-lg text-sm">
                    <Plus className="w-4 h-4 mr-2" /> New Vendor
                </button>
            </div>
            <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-500 uppercase">
                        <tr>
                            <th className="text-left px-4 py-3">Vendor</th>
                            <th className="text-left px-4 py-3">Service</th>
                            <th className="text-center px-4 py-3">Criticality</th>
                            <th className="text-center px-4 py-3">ICT 3rd Party</th>
                            <th className="text-left px-4 py-3">Country</th>
                            <th className="text-left px-4 py-3">Contract End</th>
                            <th className="text-center px-4 py-3">Exit Plan</th>
                            <th className="text-center px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {vendors.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">No vendors registered.</td></tr>}
                        {vendors.map((v: Vendor) => (
                            <tr key={v.id} className="border-t border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer" onClick={() => setEditing(v)}>
                                <td className="px-4 py-3 font-medium">{v.name}</td>
                                <td className="px-4 py-3 text-slate-500">{v.service}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${v.criticality === 'Critical' ? 'bg-red-500/10 text-red-500' : v.criticality === 'Important' ? 'bg-orange-500/10 text-orange-500' : 'bg-slate-500/10 text-slate-500'}`}>{v.criticality}</span>
                                </td>
                                <td className="px-4 py-3 text-center">{v.ictThirdParty ? '✓' : '—'}</td>
                                <td className="px-4 py-3 text-xs">{v.country}</td>
                                <td className="px-4 py-3 text-xs">{v.contractEnd || '—'}</td>
                                <td className="px-4 py-3 text-center text-xs">{v.exitPlan}</td>
                                <td className="px-4 py-3 text-center">
                                    <button onClick={(e) => { e.stopPropagation(); setVendors(vendors.filter((x: Vendor) => x.id !== v.id)); }} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {editing && (
                <DrawerWrap title={editing.id ? 'Edit Vendor' : 'New Vendor'} onClose={() => setEditing(null)} onSubmit={() => handleSave(editing)}>
                    <F label="Name"><input required value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className={cls} /></F>
                    <F label="Service"><input required value={editing.service} onChange={e => setEditing({ ...editing, service: e.target.value })} className={cls} /></F>
                    <div className="grid grid-cols-2 gap-3">
                        <F label="Criticality">
                            <select value={editing.criticality} onChange={e => setEditing({ ...editing, criticality: e.target.value as any })} className={cls}>
                                <option>Critical</option><option>Important</option><option>Standard</option>
                            </select>
                        </F>
                        <F label="Country"><input value={editing.country} onChange={e => setEditing({ ...editing, country: e.target.value })} className={cls} /></F>
                    </div>
                    <F label="Contract End"><input type="date" value={editing.contractEnd} onChange={e => setEditing({ ...editing, contractEnd: e.target.value })} className={cls} /></F>
                    <div className="grid grid-cols-2 gap-3">
                        <F label="Exit Plan">
                            <select value={editing.exitPlan} onChange={e => setEditing({ ...editing, exitPlan: e.target.value as any })} className={cls}>
                                <option>Yes</option><option>No</option><option>In Progress</option>
                            </select>
                        </F>
                        <F label="ICT Third Party (DORA)">
                            <select value={editing.ictThirdParty ? 'yes' : 'no'} onChange={e => setEditing({ ...editing, ictThirdParty: e.target.value === 'yes' })} className={cls}>
                                <option value="no">No</option><option value="yes">Yes</option>
                            </select>
                        </F>
                    </div>
                </DrawerWrap>
            )}
        </div>
    );
};

// --- BIA ---
const emptyBIA: BIA = { id: '', processId: '', rtoHours: 4, rpoHours: 1, mtpdHours: 24, criticality: 'Medium', reviewedDate: '' };

const BIATab = ({ bias, setBias, processes, logAction }: any) => {
    const [editing, setEditing] = useState<BIA | null>(null);
    const handleSave = (b: BIA) => {
        const isNew = !bias.find((x: BIA) => x.id === b.id);
        const final = { ...b, id: b.id || `BIA-${Date.now()}`, reviewedDate: b.reviewedDate || new Date().toISOString().substring(0, 10) };
        if (isNew) { setBias([...bias, final]); logAction('DORA', 'Creation', `BIA for process ${final.processId}`); }
        else setBias(bias.map((x: BIA) => x.id === final.id ? final : x));
        setEditing(null);
    };
    return (
        <div>
            <div className="flex justify-end mb-4 space-x-2">
                <button onClick={() => exportCSV('bia', bias)} className="flex items-center px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-sm">
                    <Download className="w-4 h-4 mr-2" /> Export
                </button>
                <button onClick={() => setEditing({ ...emptyBIA })} className="flex items-center px-4 py-2 bg-brand-brown hover:bg-orange-800 text-white rounded-lg text-sm">
                    <Plus className="w-4 h-4 mr-2" /> New BIA
                </button>
            </div>
            <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-500 uppercase">
                        <tr>
                            <th className="text-left px-4 py-3">Process</th>
                            <th className="text-center px-4 py-3">Criticality</th>
                            <th className="text-right px-4 py-3">RTO (h)</th>
                            <th className="text-right px-4 py-3">RPO (h)</th>
                            <th className="text-right px-4 py-3">MTPD (h)</th>
                            <th className="text-left px-4 py-3">Reviewed</th>
                            <th className="text-center px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {bias.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No BIAs.</td></tr>}
                        {bias.map((b: BIA) => {
                            const proc = processes.find((p: Process) => p.id === b.processId);
                            return (
                                <tr key={b.id} className="border-t border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer" onClick={() => setEditing(b)}>
                                    <td className="px-4 py-3 font-medium">{proc?.name || b.processId}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${b.criticality === 'Critical' ? 'bg-red-500/10 text-red-500' : b.criticality === 'High' ? 'bg-orange-500/10 text-orange-500' : 'bg-slate-500/10 text-slate-500'}`}>{b.criticality}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono">{b.rtoHours}</td>
                                    <td className="px-4 py-3 text-right font-mono">{b.rpoHours}</td>
                                    <td className="px-4 py-3 text-right font-mono">{b.mtpdHours}</td>
                                    <td className="px-4 py-3 text-xs">{b.reviewedDate}</td>
                                    <td className="px-4 py-3 text-center">
                                        <button onClick={(e) => { e.stopPropagation(); setBias(bias.filter((x: BIA) => x.id !== b.id)); }} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {editing && (
                <DrawerWrap title={editing.id ? 'Edit BIA' : 'New BIA'} onClose={() => setEditing(null)} onSubmit={() => handleSave(editing)}>
                    <F label="Process">
                        <select required value={editing.processId} onChange={e => setEditing({ ...editing, processId: e.target.value })} className={cls}>
                            <option value="">— Select —</option>
                            {processes.map((p: Process) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </F>
                    <F label="Criticality">
                        <select value={editing.criticality} onChange={e => setEditing({ ...editing, criticality: e.target.value as any })} className={cls}>
                            <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
                        </select>
                    </F>
                    <div className="grid grid-cols-3 gap-3">
                        <F label="RTO (h)"><input type="number" required value={editing.rtoHours} onChange={e => setEditing({ ...editing, rtoHours: Number(e.target.value) })} className={cls} /></F>
                        <F label="RPO (h)"><input type="number" required value={editing.rpoHours} onChange={e => setEditing({ ...editing, rpoHours: Number(e.target.value) })} className={cls} /></F>
                        <F label="MTPD (h)"><input type="number" required value={editing.mtpdHours} onChange={e => setEditing({ ...editing, mtpdHours: Number(e.target.value) })} className={cls} /></F>
                    </div>
                    <F label="Reviewed Date"><input type="date" value={editing.reviewedDate} onChange={e => setEditing({ ...editing, reviewedDate: e.target.value })} className={cls} /></F>
                </DrawerWrap>
            )}
        </div>
    );
};

// --- ICT INCIDENTS ---
const emptyIncident: ICTIncident = { id: '', title: '', detectedDate: '', classification: 'Operational', durationHours: 0, clientsAffected: 0, servicesAffected: '', rootCause: '', status: 'Open' };

const IncidentsTab = ({ incidents, setIncidents, logAction }: any) => {
    const [editing, setEditing] = useState<ICTIncident | null>(null);
    const handleSave = (i: ICTIncident) => {
        const isNew = !incidents.find((x: ICTIncident) => x.id === i.id);
        const final = { ...i, id: i.id || `INC-${Date.now()}` };
        if (isNew) { setIncidents([...incidents, final]); logAction('DORA', 'Creation', `ICT Incident ${final.title}`); }
        else setIncidents(incidents.map((x: ICTIncident) => x.id === final.id ? final : x));
        setEditing(null);
    };
    return (
        <div>
            <div className="flex justify-end mb-4 space-x-2">
                <button onClick={() => exportCSV('ict_incidents', incidents)} className="flex items-center px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-sm">
                    <Download className="w-4 h-4 mr-2" /> Export
                </button>
                <button onClick={() => setEditing({ ...emptyIncident, detectedDate: new Date().toISOString().substring(0, 10) })} className="flex items-center px-4 py-2 bg-brand-brown hover:bg-orange-800 text-white rounded-lg text-sm">
                    <Plus className="w-4 h-4 mr-2" /> Report Incident
                </button>
            </div>
            <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-500 uppercase">
                        <tr>
                            <th className="text-left px-4 py-3">Incident</th>
                            <th className="text-left px-4 py-3">Detected</th>
                            <th className="text-center px-4 py-3">Classification</th>
                            <th className="text-right px-4 py-3">Duration (h)</th>
                            <th className="text-right px-4 py-3">Clients Affected</th>
                            <th className="text-center px-4 py-3">Status</th>
                            <th className="text-center px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {incidents.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No ICT incidents.</td></tr>}
                        {incidents.map((i: ICTIncident) => (
                            <tr key={i.id} className="border-t border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer" onClick={() => setEditing(i)}>
                                <td className="px-4 py-3"><div className="font-medium">{i.title}</div><div className="text-xs text-slate-500">{i.servicesAffected}</div></td>
                                <td className="px-4 py-3 text-xs">{i.detectedDate}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${i.classification === 'Major' ? 'bg-red-500/10 text-red-500' : i.classification === 'Significant' ? 'bg-orange-500/10 text-orange-500' : 'bg-slate-500/10 text-slate-500'}`}>{i.classification}</span>
                                </td>
                                <td className="px-4 py-3 text-right font-mono">{i.durationHours}</td>
                                <td className="px-4 py-3 text-right font-mono">{i.clientsAffected.toLocaleString()}</td>
                                <td className="px-4 py-3 text-center text-xs">{i.status}</td>
                                <td className="px-4 py-3 text-center">
                                    <button onClick={(e) => { e.stopPropagation(); setIncidents(incidents.filter((x: ICTIncident) => x.id !== i.id)); }} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {editing && (
                <DrawerWrap title={editing.id ? 'Edit Incident' : 'New ICT Incident'} onClose={() => setEditing(null)} onSubmit={() => handleSave(editing)}>
                    <F label="Title"><input required value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} className={cls} /></F>
                    <F label="Detected Date"><input type="date" required value={editing.detectedDate} onChange={e => setEditing({ ...editing, detectedDate: e.target.value })} className={cls} /></F>
                    <F label="DORA Classification">
                        <select value={editing.classification} onChange={e => setEditing({ ...editing, classification: e.target.value as any })} className={cls}>
                            <option>Major</option><option>Significant</option><option>Operational</option>
                        </select>
                    </F>
                    <div className="grid grid-cols-2 gap-3">
                        <F label="Duration (h)"><input type="number" value={editing.durationHours} onChange={e => setEditing({ ...editing, durationHours: Number(e.target.value) })} className={cls} /></F>
                        <F label="Clients Affected"><input type="number" value={editing.clientsAffected} onChange={e => setEditing({ ...editing, clientsAffected: Number(e.target.value) })} className={cls} /></F>
                    </div>
                    <F label="Services Affected"><input value={editing.servicesAffected} onChange={e => setEditing({ ...editing, servicesAffected: e.target.value })} className={cls} /></F>
                    <F label="Root Cause"><textarea rows={2} value={editing.rootCause} onChange={e => setEditing({ ...editing, rootCause: e.target.value })} className={cls} /></F>
                    <F label="Status">
                        <select value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value as any })} className={cls}>
                            <option>Open</option><option>Resolved</option><option>Reported to Authority</option>
                        </select>
                    </F>
                </DrawerWrap>
            )}
        </div>
    );
};

const DrawerWrap = ({ title, onClose, onSubmit, children }: any) => (
    <div className="fixed inset-0 z-50 flex justify-end">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10">
                <h3 className="text-lg font-bold">{title}</h3>
                <button onClick={onClose}><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="p-6 space-y-4">
                {children}
                <button type="submit" className="w-full py-3 bg-brand-brown hover:bg-orange-800 text-white font-bold rounded-xl flex items-center justify-center">
                    <Save className="w-5 h-5 mr-2" /> Save
                </button>
            </form>
        </div>
    </div>
);

const F = ({ label, children }: any) => <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label>{children}</div>;
const cls = "w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-slate-900 dark:text-white text-sm";

export default DORA;
