import React, { useState } from 'react';
import { Control, Language, TRANSLATIONS, User } from '../types';
import { CheckCircle, XCircle, Upload, FileText, Clock } from 'lucide-react';

interface ControlTestingProps {
    language: Language;
    user: User | null;
}

const ControlTesting: React.FC<ControlTestingProps> = ({ language, user }) => {
    const t = TRANSLATIONS[language];
    
    // Mock Data
    const [controls, setControls] = useState<Control[]>([
        { id: 'CTRL-01', riskId: 'R-001', description: 'Dual authentication for new card creation', type: 'Preventive', frequency: 'Daily', status: 'Pending', owner: 'Sec Team' },
        { id: 'CTRL-02', riskId: 'R-001', description: 'Daily reconciliation report of issued cards', type: 'Detective', frequency: 'Daily', status: 'Tested', evidence: 'rec_report_oct.pdf', lastTested: '2023-10-20', owner: 'Ops Team' },
        { id: 'CTRL-05', riskId: 'R-002', description: 'Vendor security assessment checklist', type: 'Preventive', frequency: 'Quarterly', status: 'Validated', evidence: 'vendor_audit_q3.pdf', lastTested: '2023-09-30', owner: 'Risk Team' }
    ]);

    const handleUpload = (id: string) => {
        // Simulate upload (1st Line)
        setControls(controls.map(c => c.id === id ? { ...c, status: 'Tested', evidence: `evidence_${Date.now()}.pdf`, lastTested: new Date().toISOString().split('T')[0] } : c));
    };

    const handleValidate = (id: string) => {
        // OpRisk Approval (2nd Line)
        setControls(controls.map(c => c.id === id ? { ...c, status: 'Validated' } : c));
    };

    const handleReject = (id: string) => {
        // OpRisk Rejection (2nd Line)
        setControls(controls.map(c => c.id === id ? { ...c, status: 'Non Validated' } : c));
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

            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                            <th className="py-4 px-6">Control ID</th>
                            <th className="py-4 px-6">Description</th>
                            <th className="py-4 px-6">Owner</th>
                            <th className="py-4 px-6">Frequency</th>
                            <th className="py-4 px-6">Last Tested</th>
                            <th className="py-4 px-6">Evidence</th>
                            <th className="py-4 px-6 text-center">Status</th>
                            <th className="py-4 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                        {controls.map(ctrl => (
                            <tr key={ctrl.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                <td className="py-4 px-6 font-mono text-xs font-bold text-slate-500">{ctrl.id}</td>
                                <td className="py-4 px-6 text-sm text-slate-900 dark:text-white font-medium">{ctrl.description}</td>
                                <td className="py-4 px-6 text-xs text-slate-500">{ctrl.owner}</td>
                                <td className="py-4 px-6 text-xs text-slate-500">{ctrl.frequency}</td>
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
                                            <button 
                                                onClick={() => handleUpload(ctrl.id)}
                                                className="px-3 py-1.5 rounded bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 text-xs font-bold flex items-center"
                                                title={t.evidence}
                                            >
                                                <Upload className="w-3 h-3 mr-1" /> Evidence
                                            </button>
                                        )}
                                        
                                        {/* 2nd Line Action: Validate (Only if tested) */}
                                        {ctrl.status === 'Tested' && (
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
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ControlTesting;