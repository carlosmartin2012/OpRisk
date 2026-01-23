
import React, { useState, useRef, useMemo } from 'react';
import { Department, Process, RiskItem } from '../types';
import { ZoomIn, ZoomOut, Move } from 'lucide-react';

interface NeuralMapProps {
    departments: Department[];
    processes: Process[];
    risks: RiskItem[];
    onRiskSelect: (riskId: string | null) => void;
}

const NeuralMap: React.FC<NeuralMapProps> = ({ departments, processes, risks, onRiskSelect }) => {
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

        return { nodes: nodesArr, links: linksArr };
    }, [departments, processes, risks]);

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
        if (node.type === 'risk') onRiskSelect(node.id);
        else onRiskSelect(null);
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
    );
};

export default NeuralMap;
