
import React, { useMemo } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { OpEvent, RiskItem, Control, Process, Department } from '../types';

interface DQProps {
    events: OpEvent[];
    risks: RiskItem[];
    controls: Control[];
    processes: Process[];
    departments: Department[];
}

interface Check {
    name: string;
    severity: 'critical' | 'warning' | 'info';
    pass: number;
    fail: number;
    examples: string[];
}

const DataQuality: React.FC<DQProps> = ({ events, risks, controls, processes, departments }) => {
    const checks = useMemo<Check[]>(() => {
        const out: Check[] = [];

        // Event completeness
        const eventReq = ['title', 'amount', 'dateDiscovery', 'eventType', 'businessLine', 'processId'];
        let eventsFail = 0;
        const eventsExamples: string[] = [];
        events.forEach(e => {
            const missing = eventReq.filter(f => !(e as any)[f]);
            if (missing.length > 0) {
                eventsFail++;
                if (eventsExamples.length < 3) eventsExamples.push(`${e.id}: missing ${missing.join(', ')}`);
            }
        });
        out.push({ name: 'Event mandatory fields', severity: 'critical', pass: events.length - eventsFail, fail: eventsFail, examples: eventsExamples });

        // Event ↔ process consistency
        let inconsistent = 0;
        const inconsistentEx: string[] = [];
        events.forEach(e => {
            const proc = processes.find(p => p.id === e.processId);
            if (!proc && e.processId) {
                inconsistent++;
                if (inconsistentEx.length < 3) inconsistentEx.push(`${e.id}: process ${e.processId} not found`);
            }
        });
        out.push({ name: 'Event → Process integrity', severity: 'critical', pass: events.length - inconsistent, fail: inconsistent, examples: inconsistentEx });

        // Risks without controls
        const orphanRisks = risks.filter(r => !r.controlIds || r.controlIds.length === 0);
        out.push({
            name: 'Risks without controls',
            severity: 'warning',
            pass: risks.length - orphanRisks.length,
            fail: orphanRisks.length,
            examples: orphanRisks.slice(0, 3).map(r => `${r.id}: ${r.name}`)
        });

        // Controls without testing
        const untested = controls.filter(c => c.status === 'Pending');
        out.push({
            name: 'Controls pending testing',
            severity: 'warning',
            pass: controls.length - untested.length,
            fail: untested.length,
            examples: untested.slice(0, 3).map(c => `${c.id}: ${c.name}`)
        });

        // Duplicate event titles + amounts (potential duplicates)
        const seen = new Map<string, number>();
        events.forEach(e => {
            const key = `${e.title}|${e.amount}|${e.dateDiscovery}`;
            seen.set(key, (seen.get(key) || 0) + 1);
        });
        const dupKeys = Array.from(seen.entries()).filter(([, n]) => n > 1);
        out.push({
            name: 'Possible duplicate events',
            severity: 'warning',
            pass: events.length - dupKeys.reduce((s, [, n]) => s + n, 0),
            fail: dupKeys.reduce((s, [, n]) => s + n, 0),
            examples: dupKeys.slice(0, 3).map(([k, n]) => `${k} (×${n})`)
        });

        // Processes without department
        const orphanProc = processes.filter(p => !departments.find(d => d.id === p.departmentId));
        out.push({
            name: 'Processes without valid department',
            severity: 'critical',
            pass: processes.length - orphanProc.length,
            fail: orphanProc.length,
            examples: orphanProc.slice(0, 3).map(p => `${p.id}: ${p.name}`)
        });

        return out;
    }, [events, risks, controls, processes, departments]);

    const overall = useMemo(() => {
        const total = checks.reduce((s, c) => s + c.pass + c.fail, 0);
        const fail = checks.reduce((s, c) => s + c.fail, 0);
        return total > 0 ? Math.round(((total - fail) / total) * 100) : 100;
    }, [checks]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Data Quality</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Completeness, integrity and duplication checks</p>
            </div>

            <div className="bg-gradient-to-br from-cyan-600/90 to-slate-900/90 p-8 rounded-2xl border border-cyan-500/30 text-white">
                <p className="text-xs uppercase opacity-80">Overall Data Quality Score</p>
                <p className="text-6xl font-bold mt-2">{overall}%</p>
                <div className="w-full bg-white/10 rounded-full h-3 mt-4">
                    <div className="h-3 rounded-full bg-white" style={{ width: `${overall}%` }}></div>
                </div>
            </div>

            <div className="space-y-3">
                {checks.map((c, i) => {
                    const Icon = c.fail === 0 ? CheckCircle : c.severity === 'critical' ? XCircle : AlertTriangle;
                    const color = c.fail === 0 ? 'text-emerald-500' : c.severity === 'critical' ? 'text-red-500' : 'text-yellow-500';
                    return (
                        <div key={i} className="bg-white dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-white/5">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start">
                                    <Icon className={`w-5 h-5 mr-3 mt-0.5 ${color}`} />
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-white">{c.name}</p>
                                        <p className="text-xs text-slate-500 mt-1">{c.pass} pass · {c.fail} fail</p>
                                    </div>
                                </div>
                                {c.fail > 0 && (
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${c.severity === 'critical' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                        {c.fail} issue{c.fail !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                            {c.examples.length > 0 && (
                                <div className="mt-3 pl-8 border-l-2 border-slate-200 dark:border-slate-700 ml-2">
                                    {c.examples.map((ex, j) => (
                                        <div key={j} className="text-xs text-slate-500 flex items-start mt-1">
                                            <Info className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                                            <span className="font-mono">{ex}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DataQuality;
