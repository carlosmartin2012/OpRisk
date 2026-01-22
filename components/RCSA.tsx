import React, { useState, useMemo } from 'react';
import { Department, Process, RiskItem, Control, Language, TRANSLATIONS } from '../types';
import { Folder, ChevronRight, AlertTriangle, Shield, Table as TableIcon, Network, User } from 'lucide-react';
import { motion } from 'framer-motion';

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
            inherentProb: 4, inherentImpact: 5, residualProb: 2, residualImpact: 3, controlIds: ['CTRL-01']
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
        { id: 'CTRL-01', riskId: 'R-001', description: 'Dual authentication', type: 'Preventive', frequency: 'Daily', status: 'Tested', owner: 'Sec Team' },
        { id: 'CTRL-02', riskId: 'R-001', description: 'Daily reconcilation', type: 'Detective', frequency: 'Daily', status: 'Validated', owner: 'Ops Team' },
        { id: 'CTRL-05', riskId: 'R-002', description: 'Vendor check', type: 'Preventive', frequency: 'Quarterly', status: 'Validated', owner: 'Risk Team' }
    ];

    const filteredProcesses = processes.filter(p => p.departmentId === selectedDept);
    const filteredRisks = risks.filter(r => r.processId === selectedProcess);

    const RiskGauge = ({ val, max = 25, label }: { val: number, max?: number, label: string }) => {
        const percentage = (val / max) * 100;
        let color = 'bg-green-500';
        if (percentage > 40) color = 'bg-yellow-500';
        if (percentage > 70) color = 'bg-red-500';

        return (
            <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase text-slate-500 font-bold mb-1">{label}</span>
                <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${color}`} style={{ width: `${percentage}%` }}></div>
                </div>
                <span className="text-xs font-bold mt-1 text-slate-700 dark:text-slate-300">{val}/{max}</span>
            </div>
        );
    };

    // --- MAP VIEW COMPONENT ---
    const NeuralMap = () => {
        // State for Pan/Zoom
        const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
        const [isDragging, setIsDragging] = useState(false);
        const [startPan, setStartPan] = useState({ x: 0, y: 0 });

        // Calculate layout once
        const graphData = useMemo(() => {
            const width = 1200;
            const height = 800;
            const cx = width / 2;
            const cy = height / 2;
            
            const nodes: any[] = [];
            const links: any[] = [];

            // 1. Root
            nodes.push({ id: 'ROOT', x: cx, y: cy, type: 'root', r: 40, label: 'ALQUID', color: '#8B4513' });

            // 2. Departments (First Circle)
            const deptRadius = 200;
            departments.forEach((dept, i) => {
                const angle = (i / departments.length) * 2 * Math.PI;
                const x = cx + deptRadius * Math.cos(angle);
                const y = cy + deptRadius * Math.sin(angle);
                
                nodes.push({ id: dept.id, x, y, type: 'dept', r: 30, label: dept.name, color: '#64748b', parentId: 'ROOT' });
                links.push({ x1: cx, y1: cy, x2: x, y2: y, id: `L-ROOT-${dept.id}` });
            });

            // 3. Processes (Second Circle) - Distributed near parent Dept
            const procRadius = 350;
            processes.forEach((proc, i) => {
                // Find parent Dept angle
                const deptIndex = departments.findIndex(d => d.id === proc.departmentId);
                const baseAngle = (deptIndex / departments.length) * 2 * Math.PI;
                
                // Offset based on index among siblings
                const siblings = processes.filter(p => p.departmentId === proc.departmentId);
                const siblingIndex = siblings.findIndex(p => p.id === proc.id);
                // Spread siblings across a sector
                const sectorSize = (2 * Math.PI) / departments.length;
                const offset = (siblingIndex - (siblings.length - 1)/2) * (sectorSize / (siblings.length + 1));
                
                const angle = baseAngle + offset;
                const x = cx + procRadius * Math.cos(angle);
                const y = cy + procRadius * Math.sin(angle);

                nodes.push({ id: proc.id, x, y, type: 'proc', r: 20, label: proc.name, color: '#3b82f6', parentId: proc.departmentId });
                // Link to Parent Dept node
                const parentNode = nodes.find(n => n.id === proc.departmentId);
                if (parentNode) {
                    links.push({ x1: parentNode.x, y1: parentNode.y, x2: x, y2: y, id: `L-${proc.departmentId}-${proc.id}` });
                }
            });

            // 4. Risks (Third Circle)
            const riskRadius = 500;
            risks.forEach((risk, i) => {
                const proc = processes.find(p => p.id === risk.processId);
                if (!proc) return;
                
                // Recalculate parent (Proc) angle to project outward
                const dx = nodes.find(n => n.id === risk.processId)!.x - cx;
                const dy = nodes.find(n => n.id === risk.processId)!.y - cy;
                const baseAngle = Math.atan2(dy, dx);

                const siblings = risks.filter(r => r.processId === risk.processId);
                const siblingIndex = siblings.findIndex(r => r.id === risk.id);
                const offset = (siblingIndex - (siblings.length - 1)/2) * 0.2; // tighter spread
                
                const angle = baseAngle + offset;
                const x = cx + riskRadius * Math.cos(angle);
                const y = cy + riskRadius * Math.sin(angle);

                // Size based on risk score
                const riskScore = risk.inherentProb * risk.inherentImpact;
                const r = 10 + (riskScore * 0.8); // 10 to 30

                nodes.push({ 
                    id: risk.id, x, y, type: 'risk', r: r, label: risk.id, 
                    color: riskScore > 15 ? '#ef4444' : riskScore > 8 ? '#f59e0b' : '#10b981',
                    parentId: risk.processId,
                    riskData: risk
                });

                const parentNode = nodes.find(n => n.id === risk.processId);
                if (parentNode) {
                    links.push({ x1: parentNode.x, y1: parentNode.y, x2: x, y2: y, id: `L-${risk.processId}-${risk.id}` });
                }
            });

            return { nodes, links };
        }, []);

        const handleMouseDown = (e: React.MouseEvent) => {
            setIsDragging(true);
            setStartPan({ x: e.clientX - transform.x, y: e.clientY - transform.y });
        };

        const handleMouseMove = (e: React.MouseEvent) => {
            if (isDragging) {
                setTransform({ ...transform, x: e.clientX - startPan.x, y: e.clientY - startPan.y });
            }
        };

        const handleWheel = (e: React.WheelEvent) => {
            const scaleChange = e.deltaY * -0.001;
            const newScale = Math.min(Math.max(0.5, transform.scale + scaleChange), 3);
            setTransform({ ...transform, scale: newScale });
        };

        const centerNode = (node: any) => {
             // Center the view on this node
             // We want node position (node.x, node.y) to be at center of viewport
             // Viewport center is approx (width/2, height/2)
             const vWidth = 1200; // rough SVG viewbox width
             const vHeight = 800;
             
             // Target Scale
             const targetScale = node.type === 'risk' ? 2 : node.type === 'proc' ? 1.5 : 1;
             
             setTransform({
                 x: (vWidth / 2) - (node.x * targetScale),
                 y: (vHeight / 2) - (node.y * targetScale),
                 scale: targetScale
             });

             if (node.type === 'risk') {
                 setSelectedRisk(node.id);
             } else {
                 setSelectedRisk(null);
             }
        };

        return (
            <div className="w-full h-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative border border-slate-200 dark:border-white/10 rounded-xl cursor-grab active:cursor-grabbing"
                 onMouseDown={handleMouseDown}
                 onMouseMove={handleMouseMove}
                 onMouseUp={() => setIsDragging(false)}
                 onMouseLeave={() => setIsDragging(false)}
                 onWheel={handleWheel}
            >
                <div className="absolute top-4 left-4 z-10 bg-white/80 dark:bg-black/50 p-2 rounded text-xs text-slate-500 pointer-events-none">
                    Scroll to Zoom • Drag to Pan • Click Node to Focus
                </div>
                
                <svg width="100%" height="100%" viewBox="0 0 1200 800">
                    <motion.g 
                        animate={{ x: transform.x, y: transform.y, scale: transform.scale }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        {/* Links */}
                        {graphData.links.map(link => (
                            <line 
                                key={link.id} 
                                x1={link.x1} y1={link.y1} 
                                x2={link.x2} y2={link.y2} 
                                stroke="#cbd5e1" 
                                strokeWidth="1" 
                                opacity="0.6"
                            />
                        ))}

                        {/* Nodes */}
                        {graphData.nodes.map(node => (
                            <g key={node.id} onClick={(e) => { e.stopPropagation(); centerNode(node); }}>
                                <circle 
                                    cx={node.x} cy={node.y} r={node.r} 
                                    fill={node.color} 
                                    className="hover:stroke-white hover:stroke-4 transition-all"
                                    stroke="rgba(255,255,255,0.2)"
                                    strokeWidth="2"
                                />
                                <text 
                                    x={node.x} y={node.y + node.r + 15} 
                                    textAnchor="middle" 
                                    fill={viewMode === 'MAP' ? '#64748b' : '#fff'} // Adapting to dark mode manually via prop usually, but hardcoded for svg simplicity
                                    className="fill-slate-600 dark:fill-slate-300 text-[10px] font-bold pointer-events-none bg-white"
                                >
                                    {node.label}
                                </text>
                            </g>
                        ))}
                    </motion.g>
                </svg>
            </div>
        )
    };

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
                    <div className="flex-1">
                        <NeuralMap />
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
                                                            <div key={ctrl.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-lg">
                                                                <div className="flex items-center">
                                                                    <CheckSquare className="w-4 h-4 text-emerald-500 mr-3" />
                                                                    <div>
                                                                        <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{ctrl.description}</p>
                                                                        <p className="text-xs text-slate-500">Owner: {ctrl.owner} | Freq: {ctrl.frequency}</p>
                                                                    </div>
                                                                </div>
                                                                <span className={`px-2 py-1 rounded text-xs font-bold ${ctrl.status === 'Validated' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                    {ctrl.status}
                                                                </span>
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

// Quick helper for icon
const CheckSquare = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
)

export default RCSA;