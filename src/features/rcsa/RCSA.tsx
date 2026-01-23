
import React, { useState } from 'react';
import { Department, Process, RiskItem, Control, Language, TRANSLATIONS } from '../../types';
import { Folder, ChevronRight, AlertTriangle, Shield, Table as TableIcon, Network, User, CheckSquare } from 'lucide-react';
import NeuralMap from '../../components/NeuralMap';
import RiskGauge from '../../components/RiskGauge';

interface RCSAProps {
    language: Language;
}

const RCSA: React.FC<RCSAProps> = ({ language }) => {
    const t = TRANSLATIONS[language];
    const [viewMode, setViewMode] = useState<'TABLE' | 'MAP'>('TABLE');
    const [selectedDept, setSelectedDept] = useState<string | null>('DEP-01');
    const [selectedProcess, setSelectedProcess] = useState<string | null>('PROC-RB-01');
    const [selectedRisk, setSelectedRisk] = useState<string | null>(null);

    // Mock Data
    const departments: Department[] = [
        { id: 'DEP-01', name: 'Retail Banking' },
        { id: 'DEP-02', name: 'Global Markets' },
        { id: 'DEP-03', name: 'Information Tech' },
    ];

    const processes: Process[] = [
        { id: 'PROC-RB-01', departmentId: 'DEP-01', name: 'Card Issuance', owner: 'John Doe' },
        { id: 'PROC-RB-02', departmentId: 'DEP-01', name: 'Mortgage Underwriting', owner: 'Jane Smith' },
        { id: 'PROC-GM-01', departmentId: 'DEP-02', name: 'FX Trading', owner: 'Mike Ross' },
        { id: 'PROC-IT-01', departmentId: 'DEP-03', name: 'Access Management', owner: 'Alice Tech' },
    ];

    const risks: RiskItem[] = [
        {
            id: 'R-001', processId: 'PROC-RB-01', description: 'Unauthorized issuance',
            inherentProb: 4, inherentImpact: 5, residualProb: 2, residualImpact: 3, controlIds: ['CTRL-01', 'CTRL-02']
        },
        {
            id: 'R-002', processId: 'PROC-RB-01', description: 'Data Leakage',
            inherentProb: 5, inherentImpact: 5, residualProb: 3, residualImpact: 4, controlIds: ['CTRL-05']
        },
        {
            id: 'R-003', processId: 'PROC-GM-01', description: 'Settlement Fail',
            inherentProb: 3, inherentImpact: 4, residualProb: 2, residualImpact: 2, controlIds: []
        },
        {
            id: 'R-004', processId: 'PROC-IT-01', description: 'Privilege Escalation',
            inherentProb: 5, inherentImpact: 4, residualProb: 4, residualImpact: 2, controlIds: []
        }
    ];

    const controls: Control[] = [
        { id: 'CTRL-01', riskId: 'R-001', description: 'Dual authentication', type: 'Preventive', frequency: 'Daily', testingFrequency: 'Monthly', status: 'Tested', owner: 'Sec Team' },
        { id: 'CTRL-02', riskId: 'R-001', description: 'Daily reconcilation', type: 'Detective', frequency: 'Daily', testingFrequency: 'Monthly', status: 'Validated', owner: 'Ops Team' },
        { id: 'CTRL-05', riskId: 'R-002', description: 'Vendor check', type: 'Preventive', frequency: 'Quarterly', testingFrequency: 'Annually', status: 'Validated', owner: 'Risk Team' }
    ];

    const filteredProcesses = processes.filter(p => p.departmentId === selectedDept);
    const filteredRisks = risks.filter(r => r.processId === selectedProcess);

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t.rcsa}</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Department & Process Risk Assessment</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-white/10 flex">
                    <button
                        onClick={() => setViewMode('TABLE')}
                        className={`px-3 py-1.5 rounded-md flex items-center text-sm transition-colors ${viewMode === 'TABLE' ? 'bg-brand-brown text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                    >
                        <TableIcon className="w-4 h-4 mr-2" /> {t.viewTable}
                    </button>
                    <button
                        onClick={() => setViewMode('MAP')}
                        className={`px-3 py-1.5 rounded-md flex items-center text-sm transition-colors ${viewMode === 'MAP' ? 'bg-brand-brown text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                    >
                        <Network className="w-4 h-4 mr-2" /> {t.viewMap}
                    </button>
                </div>
            </div>

            {viewMode === 'MAP' ? (
                <div className="flex-1 border border-slate-200 dark:border-white/5 rounded-xl shadow-sm overflow-hidden flex relative">
                    <div className="flex-1 bg-slate-50 dark:bg-slate-900">
                        <NeuralMap
                            departments={departments}
                            processes={processes}
                            risks={risks}
                            onRiskSelect={setSelectedRisk}
                        />
                    </div>
                    {/* Map Side Panel for Details */}
                    {selectedRisk && (
                        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white/95 dark:bg-slate-800/95 backdrop-blur border-l border-slate-200 dark:border-white/10 p-6 overflow-y-auto shadow-2xl z-20 animate-in slide-in-from-right">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Risk Details</h3>
                                <button onClick={() => setSelectedRisk(null)} className="text-slate-400 hover:text-slate-600"><span className="sr-only">Close</span>✕</button>
                            </div>
                            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20 mb-4">
                                <p className="text-sm font-semibold text-red-800 dark:text-red-400">{risks.find(r => r.id === selectedRisk)?.description}</p>
                                <p className="text-xs text-red-600 dark:text-red-300 mt-2 font-mono">ID: {selectedRisk}</p>
                            </div>

                            <h4 className="font-semibold text-sm text-slate-500 uppercase tracking-wider mb-3">Controls</h4>
                            <div className="space-y-3">
                                {controls.filter(c => c.riskId === selectedRisk).map(ctrl => (
                                    <div key={ctrl.id} className="p-3 bg-slate-50 dark:bg-white/5 rounded border border-slate-200 dark:border-white/5">
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{ctrl.description}</p>
                                        <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                                            <span className="flex items-center"><User className="w-3 h-3 mr-1" /> {ctrl.owner}</span>
                                            <span className={`px-1.5 py-0.5 rounded ${ctrl.status === 'Validated' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{ctrl.status}</span>
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-white/5 text-[10px] text-slate-400 flex justify-between">
                                            <span>Exec: {ctrl.frequency}</span>
                                            <span className="text-brand-brown">Test: {ctrl.testingFrequency}</span>
                                        </div>
                                    </div>
                                ))}
                                {controls.filter(c => c.riskId === selectedRisk).length === 0 && (
                                    <p className="text-xs text-slate-400 italic">No controls linked.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-1 gap-6 overflow-hidden">
                    {/* Left Column: Departments & Processes */}
                    <div className="w-1/3 bg-white dark:bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-200 dark:border-white/5 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5">
                            <h3 className="font-semibold text-slate-700 dark:text-slate-200">{t.departments}</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            {departments.map(dept => (
                                <div key={dept.id} className="mb-2">
                                    <button
                                        onClick={() => { setSelectedDept(dept.id); setSelectedProcess(null); }}
                                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-sm transition-colors ${selectedDept === dept.id ? 'bg-brand-brown text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                                    >
                                        <span className="flex items-center"><Folder className="w-4 h-4 mr-2" /> {dept.name}</span>
                                        {selectedDept === dept.id && <ChevronRight className="w-4 h-4" />}
                                    </button>

                                    {selectedDept === dept.id && (
                                        <div className="ml-4 pl-3 border-l border-slate-200 dark:border-white/10 mt-2 space-y-1">
                                            <p className="text-[10px] uppercase text-slate-400 font-bold mb-1 px-2">{t.processes}</p>
                                            {filteredProcesses.map(proc => (
                                                <button
                                                    key={proc.id}
                                                    onClick={() => setSelectedProcess(proc.id)}
                                                    className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors ${selectedProcess === proc.id ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                                                >
                                                    {proc.name}
                                                </button>
                                            ))}
                                            {filteredProcesses.length === 0 && <p className="text-xs text-slate-400 px-2">No processes found.</p>}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Risks Details */}
                    <div className="flex-1 bg-white dark:bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-200 dark:border-white/5 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-slate-700 dark:text-slate-200">
                                    {selectedProcess ? processes.find(p => p.id === selectedProcess)?.name : 'Select a Process'}
                                </h3>
                                {selectedProcess && <span className="text-xs text-slate-500">Owner: {processes.find(p => p.id === selectedProcess)?.owner}</span>}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {!selectedProcess ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                    <Shield className="w-12 h-12 mb-4 opacity-50" />
                                    <p>Select a process to view identified risks.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {filteredRisks.map(risk => (
                                        <div
                                            key={risk.id}
                                            onClick={() => setSelectedRisk(risk.id === selectedRisk ? null : risk.id)}
                                            className={`p-4 rounded-xl border transition-all bg-white dark:bg-slate-900/50 cursor-pointer ${selectedRisk === risk.id ? 'border-brand-brown ring-1 ring-brand-brown shadow-md' : 'border-slate-200 dark:border-white/5 hover:shadow-lg'}`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start">
                                                    <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg mr-4">
                                                        <AlertTriangle className="w-5 h-5 text-red-500" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-slate-900 dark:text-white">{risk.description}</h4>
                                                        <span className="text-xs font-mono text-slate-400">{risk.id}</span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-6">
                                                    <RiskGauge val={risk.inherentProb * risk.inherentImpact} max={25} label={t.inherent} />
                                                    <div className="w-px bg-slate-200 dark:bg-white/10 mx-2"></div>
                                                    <RiskGauge val={risk.residualProb * risk.residualImpact} max={25} label={t.residual} />
                                                </div>
                                            </div>

                                            {/* Expanded Controls Section */}
                                            {selectedRisk === risk.id && (
                                                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 animate-in slide-in-from-top-2">
                                                    <h5 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Associated Controls</h5>
                                                    <div className="space-y-2">
                                                        {controls.filter(c => c.riskId === risk.id).map(ctrl => (
                                                            <div key={ctrl.id} className="flex flex-col p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center">
                                                                        <CheckSquare className="w-4 h-4 text-emerald-500 mr-3" />
                                                                        <div>
                                                                            <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{ctrl.description}</p>
                                                                            <p className="text-xs text-slate-500">Owner: {ctrl.owner}</p>
                                                                        </div>
                                                                    </div>
                                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${ctrl.status === 'Validated' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                        {ctrl.status}
                                                                    </span>
                                                                </div>
                                                                {/* Frequency Details */}
                                                                <div className="mt-2 pl-7 flex gap-4 text-xs">
                                                                    <div className="flex items-center text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                                                                        <span className="font-bold mr-1">Execution:</span> {ctrl.frequency}
                                                                    </div>
                                                                    <div className="flex items-center text-brand-brown dark:text-orange-300 bg-orange-100 dark:bg-orange-900/20 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-800">
                                                                        <span className="font-bold mr-1">Testing:</span> {ctrl.testingFrequency}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {controls.filter(c => c.riskId === risk.id).length === 0 && (
                                                            <p className="text-xs text-slate-400 italic">No controls linked.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {filteredRisks.length === 0 && <p className="text-center text-slate-500 mt-10">No risks defined for this process.</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RCSA;
