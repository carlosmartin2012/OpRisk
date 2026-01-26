
import React, { useState, useMemo, useRef } from 'react';
import { Department, Process, RiskItem, Control, Language, TRANSLATIONS } from '../types';
import { Folder, ChevronRight, AlertTriangle, Table as TableIcon, Network, User, ZoomIn, ZoomOut, Move, Plus, Upload, Save, X, Trash2 } from 'lucide-react';
import RCSAForm from './RCSAForm';
import ImportDrawer from './ImportDrawer';
import { PersistenceService } from '../src/services/persistence';

interface RCSAProps {
    language: Language;
    departments: Department[];
    setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
    processes: Process[];
    setProcesses: React.Dispatch<React.SetStateAction<Process[]>>;
    risks: RiskItem[];
    setRisks: React.Dispatch<React.SetStateAction<RiskItem[]>>;
    controls: Control[];
    setControls: React.Dispatch<React.SetStateAction<Control[]>>;
}

const RCSA: React.FC<RCSAProps> = ({
    language,
    departments, setDepartments,
    processes, setProcesses,
    risks, setRisks,
    controls, setControls
}) => {
    const t = TRANSLATIONS[language];
    const [viewMode, setViewMode] = useState<'TABLE' | 'MAP'>('TABLE');
    const [selectedDept, setSelectedDept] = useState<string | null>(departments[0]?.id || null);
    const [selectedProcess, setSelectedProcess] = useState<string | null>(null);
    const [selectedRisk, setSelectedRisk] = useState<string | null>(null);

    // Modal States
    const [createModalType, setCreateModalType] = useState<'process' | 'risk' | 'control' | 'dept' | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importType, setImportType] = useState<'dept' | 'process' | 'risk' | 'control'>('dept');

    // Deletion Logic
    const handleDelete = (type: 'dept' | 'process' | 'risk' | 'control', id: string) => {
        if (!window.confirm(`Are you sure you want to delete this ${type}? This action may cascade.`)) return;

        if (type === 'dept') {
            setDepartments(departments.filter(d => d.id !== id));
            setProcesses(processes.filter(p => p.departmentId !== id));
            PersistenceService.delete('departments', id);
        } else if (type === 'process') {
            setProcesses(processes.filter(p => p.id !== id));
            setRisks(risks.filter(r => r.processId !== id));
            PersistenceService.delete('processes', id);
        } else if (type === 'risk') {
            setRisks(risks.filter(r => r.id !== id));
            setControls(controls.filter(c => c.riskId !== id));
            PersistenceService.delete('risks', id);
        } else if (type === 'control') {
            setControls(controls.filter(c => c.id !== id));
            setRisks(risks.map(r => ({ ...r, controlIds: r.controlIds.filter(cid => cid !== id) })));
            PersistenceService.delete('controls', id);
        }
    };

    // Creation Logic
    const handleCreateSubmit = (data: any) => {
        if (createModalType === 'dept') {
            const newDept: Department = { id: `DEP-${Date.now()}`, name: data.name };
            setDepartments([...departments, newDept]);
            setSelectedDept(newDept.id);
        } else if (createModalType === 'process' && selectedDept) {
            const newProc: Process = {
                id: `PROC-${Date.now()}`,
                departmentId: selectedDept,
                name: data.name,
                owner: data.owner,
                description: data.description
            };
            setProcesses([...processes, newProc]);
            setSelectedProcess(newProc.id);
        } else if (createModalType === 'risk' && selectedProcess) {
            const newRisk: RiskItem = {
                id: `R-${Date.now()}`,
                processId: selectedProcess,
                name: data.name,
                description: data.description,
                owner: data.owner,
                inherentProb: data.inherentProb,
                inherentImpact: data.inherentImpact,
                residualProb: data.residualProb,
                residualImpact: data.residualImpact,
                controlIds: []
            };
            setRisks([...risks, newRisk]);
        } else if (createModalType === 'control' && selectedRisk) {
            const newControl: Control = {
                id: `CTRL-${Date.now()}`,
                riskId: selectedRisk,
                name: data.name,
                owner: data.owner,
                description: data.description,
                type: data.type || 'Preventive',
                frequency: data.frequency,
                testingFrequency: data.testingFrequency || 'Annually',
                status: 'Pending'
            };
            setControls([...controls, newControl]);

            // Link to risk (redundant if using relational filter, but good for direct ref)
            setRisks(risks.map(r => {
                if (r.id === selectedRisk) {
                    return { ...r, controlIds: [...r.controlIds, newControl.id] };
                }
                return r;
            }));
        }
        setCreateModalType(null);
    };

    const handleImportSubmit = (files: File[]) => {
        // Simulate Import
        // In future check 'importType' state to decide where to push data
        alert(`Simulated import of ${files.length} files into ${importType}`);
        setIsImporting(false);
    };

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

    // --- MAP VIEW COMPONENT (NATIVE SVG) ---
    const NeuralMap = () => {
        // [Existing NeuralMap implementation unchanged]
        // To save tokens, I'll copy pasting it exactly if possible, or just refer.
        // Wait, I must provide full replacement content.
        const [pan, setPan] = useState({ x: 0, y: 0 });
        const [scale, setScale] = useState(0.8);
        const [isDragging, setIsDragging] = useState(false);
        const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
        const svgRef = useRef<SVGSVGElement>(null);

        // Precompute Layout
        const { nodes, links } = useMemo(() => {
            const width = 1200;
            const height = 800;
            const cx = width / 2;
            const cy = height / 2;

            const nodesArr: any[] = [];
            const linksArr: any[] = [];

            // Root
            nodesArr.push({ id: 'ROOT', x: cx, y: cy, type: 'root', r: 40, label: 'ALQUID', color: '#8B4513' });

            // Departments (Circle 1)
            const deptRadius = 250;
            departments.forEach((dept, i) => {
                const angle = (i / departments.length) * 2 * Math.PI;
                const x = cx + deptRadius * Math.cos(angle);
                const y = cy + deptRadius * Math.sin(angle);
                nodesArr.push({ id: dept.id, x, y, type: 'dept', r: 30, label: dept.name, color: '#64748b' });
                linksArr.push({ x1: cx, y1: cy, x2: x, y2: y, id: `L-ROOT-${dept.id}` });
            });

            // Processes (Circle 2)
            const procRadius = 400;
            processes.forEach((proc, i) => {
                // Find parent Dept angle
                const deptIndex = departments.findIndex(d => d.id === proc.departmentId);
                const baseAngle = (deptIndex / departments.length) * 2 * Math.PI;
                const siblings = processes.filter(p => p.departmentId === proc.departmentId);
                const siblingIndex = siblings.findIndex(p => p.id === proc.id);
                // Safe check for missing parent
                if (deptIndex === -1) return;

                const offset = (siblingIndex - (siblings.length - 1) / 2) * 0.4;

                const angle = baseAngle + offset;
                const x = cx + procRadius * Math.cos(angle);
                const y = cy + procRadius * Math.sin(angle);

                nodesArr.push({ id: proc.id, x, y, type: 'proc', r: 20, label: proc.name, color: '#3b82f6', parentId: proc.departmentId });
                const parent = nodesArr.find(n => n.id === proc.departmentId);
                if (parent) linksArr.push({ x1: parent.x, y1: parent.y, x2: x, y2: y, id: `L-${proc.departmentId}-${proc.id}` });
            });

            // Risks (Circle 3)
            const riskRadius = 550;
            risks.forEach((risk, i) => {
                const parent = nodesArr.find(n => n.id === risk.processId);
                if (!parent) return;

                // Vector from center to parent
                const dx = parent.x - cx;
                const dy = parent.y - cy;
                const baseAngle = Math.atan2(dy, dx);

                const siblings = risks.filter(r => r.processId === risk.processId);
                const siblingIndex = siblings.findIndex(r => r.id === risk.id);
                const offset = (siblingIndex - (siblings.length - 1) / 2) * 0.15;

                const angle = baseAngle + offset;
                const x = cx + riskRadius * Math.cos(angle);
                const y = cy + riskRadius * Math.sin(angle);

                // Size by Risk
                const score = risk.inherentProb * risk.inherentImpact;
                const r = 10 + (score * 1.5);

                nodesArr.push({
                    id: risk.id, x, y, type: 'risk', r, label: risk.id,
                    color: score > 15 ? '#ef4444' : score > 8 ? '#f59e0b' : '#10b981',
                    riskData: risk
                });
                linksArr.push({ x1: parent.x, y1: parent.y, x2: x, y2: y, id: `L-${risk.processId}-${risk.id}` });
            });

            // Controls (Circle 4 - NEW)
            const controlRadius = 680;
            controls.forEach((control, i) => {
                const parent = nodesArr.find(n => n.id === control.riskId);
                if (!parent) return;

                // Vector from center to parent
                const dx = parent.x - cx;
                const dy = parent.y - cy;
                const baseAngle = Math.atan2(dy, dx);

                const siblings = controls.filter(c => c.riskId === control.riskId);
                const siblingIndex = siblings.findIndex(c => c.id === control.id);
                const offset = (siblingIndex - (siblings.length - 1) / 2) * 0.1;

                const angle = baseAngle + offset;
                const x = cx + controlRadius * Math.cos(angle);
                const y = cy + controlRadius * Math.sin(angle);

                // Color by status
                const statusColors: Record<string, string> = {
                    'Validated': '#10b981',
                    'Tested': '#f59e0b',
                    'Pending': '#64748b',
                    'Non Validated': '#ef4444'
                };

                nodesArr.push({
                    id: control.id, x, y, type: 'control', r: 8, label: control.id,
                    color: statusColors[control.status] || '#64748b',
                    controlData: control
                });
                linksArr.push({ x1: parent.x, y1: parent.y, x2: x, y2: y, id: `L-${control.riskId}-${control.id}`, dashed: true });
            });

            return { nodes: nodesArr, links: linksArr };
        }, [departments, processes, risks, controls]);

        const handleMouseDown = (e: React.MouseEvent) => {
            setIsDragging(true);
            setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        };

        const handleMouseMove = (e: React.MouseEvent) => {
            if (isDragging) {
                setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
            }
        };

        const centerOnNode = (node: any) => {
            // Viewport approx 800x600 equivalent
            // We want node at center 
            const zoom = node.type === 'risk' ? 2 : 1.2;
            setPan({
                x: 600 - (node.x * zoom), // 600 is half of viewbox width
                y: 400 - (node.y * zoom)  // 400 is half of viewbox height
            });
            setScale(zoom);
            if (node.type === 'risk') setSelectedRisk(node.id);
            else setSelectedRisk(null);
        };

        return (
            <div className="w-full h-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative border border-slate-200 dark:border-white/10 rounded-xl">
                {/* Map Controls */}
                <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-slate-800/90 p-2 rounded-lg shadow border border-slate-200 dark:border-white/10 flex flex-col gap-2">
                    <button onClick={() => setScale(s => Math.min(s + 0.2, 3))} className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded"><ZoomIn className="w-5 h-5 text-slate-600 dark:text-slate-300" /></button>
                    <button onClick={() => setScale(s => Math.max(s - 0.2, 0.4))} className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded"><ZoomOut className="w-5 h-5 text-slate-600 dark:text-slate-300" /></button>
                    <button onClick={() => { setPan({ x: 0, y: 0 }); setScale(0.8); }} className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded"><Move className="w-5 h-5 text-slate-600 dark:text-slate-300" /></button>
                </div>

                <svg
                    ref={svgRef}
                    width="100%" height="100%" viewBox="0 0 1200 800"
                    className="cursor-grab active:cursor-grabbing"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={() => setIsDragging(false)}
                    onMouseLeave={() => setIsDragging(false)}
                >
                    <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}>
                        {/* Links */}
                        {links.map(l => (
                            <line
                                key={l.id}
                                x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                                stroke="#94a3b8" strokeWidth="1" strokeOpacity="0.4"
                                strokeDasharray={l.dashed ? "5,5" : "none"}
                            />
                        ))}

                        {/* Nodes */}
                        {nodes.map(n => (
                            <g
                                key={n.id}
                                onClick={(e) => { e.stopPropagation(); centerOnNode(n); }}
                                className="transition-opacity hover:opacity-80"
                                style={{ cursor: 'pointer' }}
                            >
                                <circle
                                    cx={n.x} cy={n.y} r={n.r}
                                    fill={n.color} stroke="#fff" strokeWidth="2"
                                    fillOpacity="0.9"
                                    className="dark:stroke-slate-800"
                                />
                                <text
                                    x={n.x} y={n.y + n.r + 14}
                                    textAnchor="middle"
                                    fill="#475569"
                                    className="text-[10px] font-bold uppercase pointer-events-none select-none dark:fill-slate-300"
                                    style={{ fontSize: n.type === 'risk' ? '10px' : '12px' }}
                                >
                                    {n.label}
                                </text>
                            </g>
                        ))}
                    </g>
                </svg>
            </div>
        )
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col relative">
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
                        <NeuralMap />
                    </div>
                </div>
            ) : (
                <div className="flex flex-1 gap-6 overflow-hidden">
                    {/* Left Column: Departments & Processes */}
                    <div className="w-1/3 bg-white dark:bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-200 dark:border-white/5 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-700 dark:text-slate-200">{t.departments}</h3>
                            <div className="flex gap-1">
                                <button onClick={() => setCreateModalType('dept')} className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded" title="Add Department"><Plus className="w-4 h-4" /></button>
                                <button onClick={() => { setImportType('dept'); setIsImporting(true); }} className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded" title="Import Departments"><Upload className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            {departments.map(dept => (
                                <div key={dept.id} className="mb-2">
                                    <div className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-sm transition-colors group ${selectedDept === dept.id ? 'bg-brand-brown text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}`}>
                                        <button
                                            onClick={() => { setSelectedDept(dept.id); setSelectedProcess(null); }}
                                            className="flex-1 flex items-center text-left"
                                        >
                                            <Folder className="w-4 h-4 mr-2" /> {dept.name}
                                        </button>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleDelete('dept', dept.id)} className="p-1 hover:bg-red-500/20 rounded text-inherit hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                                            {selectedDept === dept.id && <ChevronRight className="w-4 h-4" />}
                                        </div>
                                    </div>

                                    {selectedDept === dept.id && (
                                        <div className="ml-4 pl-3 border-l border-slate-200 dark:border-white/10 mt-2 space-y-1">
                                            <div className="flex justify-between items-center px-2 mb-1">
                                                <p className="text-[10px] uppercase text-slate-400 font-bold">{t.processes}</p>
                                                <div className="flex gap-1">
                                                    <button onClick={() => setCreateModalType('process')} className="p-0.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded"><Plus className="w-3 h-3" /></button>
                                                </div>
                                            </div>
                                            {filteredProcesses.map(proc => (
                                                <div key={proc.id} className={`flex items-center justify-between rounded-md group px-3 py-1.5 transition-colors ${selectedProcess === proc.id ? 'bg-cyan-500/10 border border-cyan-500/20' : 'hover:bg-slate-100 dark:hover:bg-white/5'}`}>
                                                    <button
                                                        onClick={() => setSelectedProcess(proc.id)}
                                                        className={`text-left text-xs flex-1 ${selectedProcess === proc.id ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                                                    >
                                                        {proc.name}
                                                    </button>
                                                    <button onClick={() => handleDelete('process', proc.id)} className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3" /></button>
                                                </div>
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
                            {selectedProcess && (
                                <div className="flex gap-2">
                                    <button onClick={() => setCreateModalType('risk')} className="flex items-center px-2 py-1 bg-brand-brown text-white rounded text-xs"><Plus className="w-3 h-3 mr-1" /> New Risk</button>
                                    <button onClick={() => { setImportType('risk'); setIsImporting(true); }} className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded" title="Import Risks"><Upload className="w-4 h-4" /></button>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {!selectedProcess ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                    <AlertTriangle className="w-12 h-12 mb-4 opacity-50" />
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
                                                        <h4 className="font-semibold text-slate-900 dark:text-white">{risk.name}</h4>
                                                        <p className="text-xs text-slate-500 line-clamp-1">{risk.description}</p>
                                                        <div className="flex gap-2 mt-1">
                                                            <span className="text-[10px] bg-slate-100 dark:bg-white/10 px-1 rounded text-slate-500">{risk.id}</span>
                                                            {risk.owner && <span className="text-[10px] bg-blue-50 dark:bg-blue-900/20 px-1 rounded text-blue-500 flex items-center"><User className="w-3 h-3 mr-1" /> {risk.owner}</span>}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="flex gap-6">
                                                        <RiskGauge val={risk.inherentProb * risk.inherentImpact} max={25} label={t.inherent} />
                                                        <div className="w-px bg-slate-200 dark:bg-white/10 mx-2"></div>
                                                        <RiskGauge val={risk.residualProb * risk.residualImpact} max={25} label={t.residual} />
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDelete('risk', risk.id); }}
                                                        className="text-slate-400 hover:text-red-500 p-1"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Expanded Controls Section */}
                                            {selectedRisk === risk.id && (
                                                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 animate-in slide-in-from-top-2">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h5 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Associated Controls</h5>
                                                        <button onClick={(e) => { e.stopPropagation(); setCreateModalType('control'); }} className="text-xs bg-slate-100 dark:bg-white/10 px-2 py-1 rounded hover:bg-slate-200 flex items-center"><Plus className="w-3 h-3 mr-1" /> Add Control</button>
                                                    </div>

                                                    <div className="space-y-2">
                                                        {controls.filter(c => c.riskId === risk.id).map(ctrl => (
                                                            <div key={ctrl.id} className="flex flex-col p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5 group relative">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center">
                                                                        <CheckSquare className="w-4 h-4 text-emerald-500 mr-3" />
                                                                        <div>
                                                                            <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{ctrl.name || ctrl.description}</p>
                                                                            <p className="text-xs text-slate-500">{ctrl.description}</p>
                                                                            <div className="flex gap-2 mt-1">
                                                                                <span className="text-[10px] text-slate-400">Freq: {ctrl.frequency}</span>
                                                                                <span className="text-[10px] text-slate-400">Owner: {ctrl.owner}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${ctrl.status === 'Validated' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                        {ctrl.status}
                                                                    </span>
                                                                </div>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleDelete('control', ctrl.id); }}
                                                                    className="absolute right-2 top-2 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
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

            {/* Creation Drawer */}
            {createModalType && (createModalType !== 'dept') && (
                <RCSAForm
                    type={createModalType}
                    onClose={() => setCreateModalType(null)}
                    onSubmit={handleCreateSubmit}
                    departments={departments}
                />
            )}

            {/* Fallback for Dept creation (keep it simple or add to RCSAForm if desired, but request asked for 5,6,7 specifically which means Process, Risk, Control) */}
            {createModalType === 'dept' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-2xl w-96 border border-slate-200 dark:border-white/10">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white capitalize">Add New Department</h3>
                            <button onClick={() => setCreateModalType(null)}><X className="w-5 h-5 text-slate-500" /></button>
                        </div>
                        <div className="space-y-4">
                            <form onSubmit={(e: any) => { e.preventDefault(); handleCreateSubmit({ name: e.target.deptName.value, description: '' }); }}>
                                <div>
                                    <label className="block text-sm text-slate-500 mb-1">Department Name</label>
                                    <input name="deptName" type="text" autoFocus required className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 rounded p-2 text-slate-900 dark:text-white border" />
                                </div>
                                <button type="submit" className="w-full bg-brand-brown text-white py-2 rounded-lg font-medium mt-4">Create</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Import Drawer */}
            <ImportDrawer
                isOpen={isImporting}
                onClose={() => setIsImporting(false)}
                title={`Import ${importType.charAt(0).toUpperCase() + importType.slice(1)}`}
                onImport={handleImportSubmit}
            />
        </div>
    );
};

// Quick helper for icon
const CheckSquare = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
)

export default RCSA;
