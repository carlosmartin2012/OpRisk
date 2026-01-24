
import React, { useState } from 'react';
import { Department, Process, RiskItem, Control } from '../types';
import { X, Save } from 'lucide-react';

interface RCSAFormProps {
    type: 'process' | 'risk' | 'control';
    onClose: () => void;
    onSubmit: (data: any) => void;
    departments?: Department[];
    processes?: Process[];
    risks?: RiskItem[];
    parentId?: string;
}

const RCSAForm: React.FC<RCSAFormProps> = ({ type, onClose, onSubmit, parentId }) => {
    // Shared State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [owner, setOwner] = useState('');

    // Risk State
    const [inherentProb, setInherentProb] = useState(3);
    const [inherentImpact, setInherentImpact] = useState(3);
    const [residualProb, setResidualProb] = useState(2);
    const [residualImpact, setResidualImpact] = useState(2);

    // Control State
    const [frequency, setFrequency] = useState('Monthly');

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const common = { name, description, owner };

        if (type === 'process') {
            onSubmit({ ...common });
        } else if (type === 'risk') {
            onSubmit({
                ...common,
                inherentProb, inherentImpact,
                residualProb, residualImpact
            });
        } else if (type === 'control') {
            onSubmit({
                ...common,
                frequency,
                type: 'Preventive', // Default
                testingFrequency: 'Annually', // Default
                status: 'Pending'
            });
        }
    };

    const RiskMatrixSelector = ({
        prob, setProb,
        impact, setImpact,
        label
    }: {
        prob: number, setProb: (n: number) => void,
        impact: number, setImpact: (n: number) => void,
        label: string
    }) => (
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-white/10">
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">{label} Score: {prob * impact}</h4>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs text-slate-500 mb-1">Probability (1-5)</label>
                    <input
                        type="range" min="1" max="5"
                        value={prob} onChange={(e) => setProb(Number(e.target.value))}
                        className="w-full accent-brand-brown"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400"><span>Rare</span><span>Frequent</span></div>
                </div>
                <div>
                    <label className="block text-xs text-slate-500 mb-1">Impact (1-5)</label>
                    <input
                        type="range" min="1" max="5"
                        value={impact} onChange={(e) => setImpact(Number(e.target.value))}
                        className="w-full accent-brand-brown"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400"><span>Negligible</span><span>Catastrophic</span></div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[60] flex justify-end">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right border-l border-slate-200 dark:border-white/10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize">New {type}</h2>
                    <button onClick={onClose}><X className="w-6 h-6 text-slate-400 hover:text-slate-600" /></button>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Name</label>
                        <input
                            type="text" required autoFocus
                            value={name} onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white border focus:ring-2 focus:ring-brand-brown outline-none"
                            placeholder={`Enter ${type} name...`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Description</label>
                        <textarea
                            rows={3} required
                            value={description} onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white border focus:ring-2 focus:ring-brand-brown outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Owner</label>
                        <input
                            type="text" required
                            value={owner} onChange={(e) => setOwner(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white border focus:ring-2 focus:ring-brand-brown outline-none"
                            placeholder="Responsible person or role"
                        />
                    </div>

                    {type === 'risk' && (
                        <div className="space-y-4 pt-2">
                            <RiskMatrixSelector
                                prob={inherentProb} setProb={setInherentProb}
                                impact={inherentImpact} setImpact={setInherentImpact}
                                label="Inherent Risk"
                            />
                            <RiskMatrixSelector
                                prob={residualProb} setProb={setResidualProb}
                                impact={residualImpact} setImpact={setResidualImpact}
                                label="Residual Risk"
                            />
                        </div>
                    )}

                    {type === 'control' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Execution Frequency</label>
                            <select
                                value={frequency} onChange={(e) => setFrequency(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white border outline-none"
                            >
                                <option>Daily</option>
                                <option>Monthly</option>
                                <option>Quarterly</option>
                                <option>Annually</option>
                            </select>
                        </div>
                    )}

                    <div className="pt-6 border-t border-slate-200 dark:border-white/10 mt-6">
                        <button type="submit" className="w-full py-3 bg-brand-brown hover:bg-orange-800 text-white font-bold rounded-xl shadow-lg flex items-center justify-center">
                            <Save className="w-5 h-5 mr-2" />
                            Create {type}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RCSAForm;
