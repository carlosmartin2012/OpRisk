
import React, { useState, useMemo } from 'react';
import { Control, Language, TRANSLATIONS, User, Department, Process, RiskItem } from '../types';
import { CheckCircle, XCircle, Upload, FileText, Clock, Lock, Filter, ArrowUpDown } from 'lucide-react';
import ImportDrawer from './ImportDrawer';

interface ControlTestingProps {
    language: Language;
    user: User | null;
    controls: Control[];
    setControls: (controls: Control[]) => void;
    departments: Department[];
    processes: Process[];
    risks: RiskItem[];
}

const ControlTesting: React.FC<ControlTestingProps> = ({
    language,
    user,
    controls,
    setControls,
    departments,
    processes,
    risks
}) => {
    const t = TRANSLATIONS[language];

    // permissions - Administrator can also validate
    const canUpload = user?.role === 'First Line' || user?.role === 'OpRisk' || user?.role === 'Administrator';
    const canValidate = user?.role === 'OpRisk' || user?.role === 'Administrator';

    // Filters State
    const [filterDept, setFilterDept] = useState<string>('');
    const [filterProcess, setFilterProcess] = useState<string>('');
    const [filterRisk, setFilterRisk] = useState<string>('');
    const [filterOwner, setFilterOwner] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('');

    // Sort State
    const [sortConfig, setSortConfig] = useState<{ key: keyof Control; direction: 'asc' | 'desc' } | null>(null);

    // Import Modal State
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedControlForImport, setSelectedControlForImport] = useState<string | null>(null);

    const handleUpload = (id: string) => {
        if (!canUpload) return;
        // Open import modal instead of direct upload
        setSelectedControlForImport(id);
        setShowImportModal(true);
    };

    const handleImportSubmit = (files: File[]) => {
        if (selectedControlForImport) {
            setControls(controls.map(c => c.id === selectedControlForImport ? {
                ...c,
                status: 'Tested',
                evidence: files.map(f => f.name).join(', '),
                lastTested: new Date().toISOString().split('T')[0]
            } : c));
        }
        setShowImportModal(false);
        setSelectedControlForImport(null);
    };

    const handleValidate = (id: string) => {
        if (!canValidate) return;
        setControls(controls.map(c => c.id === id ? { ...c, status: 'Validated' } : c));
    };

    const handleReject = (id: string) => {
        if (!canValidate) return;
        setControls(controls.map(c => c.id === id ? { ...c, status: 'Non Validated' } : c));
    };

    // Data Processing
    const processedControls = useMemo(() => {
        let result = [...controls];

        // 1. Filtering
        if (filterDept) {
            result = result.filter(c => {
                const risk = risks.find(r => r.id === c.riskId);
                const proc = processes.find(p => p.id === risk?.processId);
                return proc?.departmentId === filterDept;
            });
        }
        if (filterProcess) {
            result = result.filter(c => {
                const risk = risks.find(r => r.id === c.riskId);
                return risk?.processId === filterProcess;
            });
        }
        if (filterRisk) {
            result = result.filter(c => c.riskId === filterRisk);
        }
        if (filterOwner) {
            result = result.filter(c => c.owner.toLowerCase().includes(filterOwner.toLowerCase()));
        }
        if (filterStatus) {
            result = result.filter(c => c.status === filterStatus);
        }

        // 2. Sorting
        if (sortConfig) {
            result.sort((a, b) => {
                const aValue = a[sortConfig.key] || '';
                const bValue = b[sortConfig.key] || '';
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [controls, filterDept, filterProcess, filterRisk, filterOwner, filterStatus, sortConfig, risks, processes]);

    const handleSort = (key: keyof Control) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const SortIcon = ({ column }: { column: keyof Control }) => {
        if (sortConfig?.key !== column) return <ArrowUpDown className="w-3 h-3 ml-1 text-slate-300 opacity-0 group-hover:opacity-50" />;
        return <ArrowUpDown className={`w-3 h-3 ml-1 ${sortConfig.direction === 'asc' ? 'text-brand-brown' : 'text-slate-500'}`} />;
    };

    const StatusBadge = ({ status }: { status: string }) => {
        let color = 'bg-slate-500/20 text-slate-500';
        if (status === 'Tested') color = 'bg-yellow-500/20 text-yellow-500';
        if (status === 'Validated') color = 'bg-emerald-500/20 text-emerald-500';
        if (status === 'Non Validated') color = 'bg-red-500/20 text-red-500';
        if (status === 'Pending') color = 'bg-orange-500/20 text-orange-500';

        return <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${color}`}>{status}</span>;
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t.controlTesting}</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">First Line Testing & Second Line Validation</p>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-md p-4 rounded-xl border border-slate-200 dark:border-white/5 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 min-w-[200px] flex-1">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                        value={filterDept}
                        onChange={(e) => { setFilterDept(e.target.value); setFilterProcess(''); setFilterRisk(''); }}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-sm p-2"
                    >
                        <option value="">All Departments</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <select
                        value={filterProcess}
                        onChange={(e) => { setFilterProcess(e.target.value); setFilterRisk(''); }}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-sm p-2"
                        disabled={!filterDept && processedControls.length === controls.length} // Optional disable logic
                    >
                        <option value="">All Processes</option>
                        {processes
                            .filter(p => !filterDept || p.departmentId === filterDept)
                            .map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <select
                        value={filterRisk}
                        onChange={(e) => setFilterRisk(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-sm p-2"
                    >
                        <option value="">All Risks</option>
                        {risks
                            .filter(r => !filterProcess || r.processId === filterProcess)
                            .map(r => <option key={r.id} value={r.id}>{r.name || r.id}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-[150px]">
                    <input
                        type="text"
                        placeholder="Filter Owner..."
                        value={filterOwner}
                        onChange={(e) => setFilterOwner(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-sm p-2"
                    />
                </div>
                <div className="flex-1 min-w-[150px]">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-sm p-2"
                    >
                        <option value="">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Tested">Tested</option>
                        <option value="Validated">Validated</option>
                        <option value="Non Validated">Non Validated</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold cursor-pointer">
                            <th onClick={() => handleSort('id')} className="py-4 px-6 group hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                                <div className="flex items-center">Control ID <SortIcon column="id" /></div>
                            </th>
                            <th onClick={() => handleSort('description')} className="py-4 px-6 group hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                                <div className="flex items-center">Description <SortIcon column="description" /></div>
                            </th>
                            <th onClick={() => handleSort('owner')} className="py-4 px-6 group hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                                <div className="flex items-center">Owner <SortIcon column="owner" /></div>
                            </th>
                            <th className="py-4 px-6">Freq (Exec / Test)</th>
                            <th className="py-4 px-6">Last Tested</th>
                            <th className="py-4 px-6">Evidence</th>
                            <th onClick={() => handleSort('status')} className="py-4 px-6 text-center group hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                                <div className="flex items-center justify-center">Status <SortIcon column="status" /></div>
                            </th>
                            <th className="py-4 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                        {processedControls.map(ctrl => (
                            <tr key={ctrl.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                <td className="py-4 px-6 font-mono text-xs font-bold text-slate-500">{ctrl.id}</td>
                                <td className="py-4 px-6 text-sm text-slate-900 dark:text-white font-medium">{ctrl.description}</td>
                                <td className="py-4 px-6 text-xs text-slate-500">{ctrl.owner}</td>
                                <td className="py-4 px-6 text-xs text-slate-500">
                                    <div className="flex flex-col">
                                        <span>E: {ctrl.frequency}</span>
                                        <span className="text-brand-brown">T: {ctrl.testingFrequency}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-xs text-slate-500">{ctrl.lastTested || '-'}</td>
                                <td className="py-4 px-6">
                                    {ctrl.evidence ? (
                                        <div className="flex items-center text-cyan-600 dark:text-cyan-400 text-xs hover:underline cursor-pointer">
                                            <FileText className="w-3 h-3 mr-1" /> {ctrl.evidence}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">No evidence</span>
                                    )}
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <StatusBadge status={ctrl.status} />
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <div className="flex justify-center space-x-2">
                                        {/* 1st Line Action: Upload */}
                                        {ctrl.status === 'Pending' && (
                                            canUpload ? (
                                                <button
                                                    onClick={() => handleUpload(ctrl.id)}
                                                    className="px-3 py-1.5 rounded bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 text-xs font-bold flex items-center"
                                                    title={t.evidence}
                                                >
                                                    <Upload className="w-3 h-3 mr-1" /> Evidence
                                                </button>
                                            ) : (
                                                <Lock className="w-4 h-4 text-slate-300" />
                                            )
                                        )}

                                        {/* 2nd Line Action: Validate (Only if tested) */}
                                        {ctrl.status === 'Tested' && (
                                            canValidate ? (
                                                <>
                                                    <button
                                                        onClick={() => handleValidate(ctrl.id)}
                                                        className="p-1.5 rounded bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                                                        title={t.validate}
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(ctrl.id)}
                                                        className="p-1.5 rounded bg-red-500/10 text-red-600 hover:bg-red-500/20"
                                                        title={t.reject}
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="text-xs text-slate-400 flex items-center"><Lock className="w-3 h-3 mr-1" /> Pending Val.</span>
                                            )
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {processedControls.length === 0 && <div className="p-8 text-center text-slate-500">No controls match filters.</div>}
            </div>

            {/* Import Evidence Modal */}
            <ImportDrawer
                isOpen={showImportModal}
                onClose={() => { setShowImportModal(false); setSelectedControlForImport(null); }}
                title="Upload Control Evidence"
                onImport={handleImportSubmit}
            />
        </div>
    );
};

export default ControlTesting;
