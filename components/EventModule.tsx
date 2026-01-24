
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Upload, MoreVertical, CheckCircle, XCircle, Edit, Save, X } from 'lucide-react';
import { EBA_EVENT_TYPES, EBA_EVENT_TYPES_HIERARCHY, BUSINESS_LINES, OpEvent, Language, TRANSLATIONS, User, Department, Process } from '../types';

interface EventModuleProps {
    language: Language;
    user: User | null;
    events: OpEvent[];
    setEvents: (events: OpEvent[]) => void;
    departments: Department[];
    processes: Process[];
}

const EventModule: React.FC<EventModuleProps> = ({ language, user, events, setEvents, departments, processes }) => {
    const t = TRANSLATIONS[language];
    const [activeActionId, setActiveActionId] = useState<string | null>(null);

    // Permissions Logic
    const canEdit = user?.role === 'OpRisk' || user?.role === 'First Line';
    const canValidate = user?.role === 'OpRisk';

    // State
    const [editingEvent, setEditingEvent] = useState<OpEvent | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // New Event Template
    const emptyEvent: OpEvent = {
        id: '',
        dateDiscovery: new Date().toISOString().split('T')[0],
        title: '',
        amount: 0,
        currency: 'EUR',
        eventType: EBA_EVENT_TYPES[0],
        eventTypeLevel2: EBA_EVENT_TYPES_HIERARCHY[EBA_EVENT_TYPES[0]][0],
        businessLine: BUSINESS_LINES[0],
        processId: processes.length > 0 ? processes[0].id : '',
        employeeEmail: user?.email || '',
        department: user?.department || '',
        status: 'Pending Validation',
        description: '',
        auditTrail: []
    };

    const [newEvent, setNewEvent] = useState<OpEvent>(emptyEvent);

    const handleCsvImport = () => {
        // Simulating CSV Import with new fields
        const importedEvents: OpEvent[] = [
            {
                id: `EVT-${new Date().getFullYear()}-${String(events.length + 1).padStart(3, '0')}`,
                dateDiscovery: new Date().toISOString().split('T')[0],
                title: "Imported Data Breach",
                amount: 50000,
                currency: "EUR",
                eventType: "Clients, Products & Business Practices",
                eventTypeLevel2: "Improper Business or Market Practices",
                businessLine: "Commercial Banking",
                processId: processes.length > 0 ? processes[0].id : 'PROC-UNK',
                employeeEmail: "data.officer@nfq.es",
                department: "Information Tech",
                status: "Pending Validation",
                description: "Data leak detected in legacy system.",
                auditTrail: [{ date: new Date().toLocaleString(), user: user?.email || 'unknown', action: "Imported via CSV" }]
            }
        ];
        setEvents([...importedEvents, ...events]);
    };

    const handleCreateEvent = (e: React.FormEvent) => {
        e.preventDefault();
        const generatedId = `EVT-${new Date().getFullYear()}-${String(events.length + 1).padStart(3, '0')}`;
        const eventToSave = {
            ...newEvent,
            id: generatedId,
            auditTrail: [{
                date: new Date().toLocaleString(),
                user: user?.email || 'Unknown',
                action: "Created Manually",
                module: 'Data',
                type: 'Creation'
            }]
        };
        setEvents([eventToSave, ...events]);
        setIsCreating(false);
        setNewEvent(emptyEvent); // Reset
    };

    const handleStatusChange = (id: string, newStatus: 'Approved' | 'Rejected') => {
        if (!canValidate) return;
        setEvents(events.map(e => {
            if (e.id === id) {
                return {
                    ...e,
                    status: newStatus,
                    auditTrail: [
                        {
                            date: new Date().toLocaleString(),
                            user: user?.email || 'Unknown',
                            action: `Changed status to ${newStatus}`,
                            module: 'Data',
                            type: 'Validation'
                        },
                        ...e.auditTrail
                    ]
                };
            }
            return e;
        }));
        setActiveActionId(null);
    };

    const openEditPanel = (event: OpEvent) => {
        if (!canEdit) return;
        setEditingEvent({ ...event });
        setActiveActionId(null);
    };

    const saveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingEvent) return;

        setEvents(events.map(evt => {
            if (evt.id === editingEvent.id) {
                return {
                    ...editingEvent,
                    auditTrail: [
                        {
                            date: new Date().toLocaleString(),
                            user: user?.email || 'Unknown',
                            action: "Edited event details",
                            module: 'Data',
                            type: 'Edit'
                        },
                        ...evt.auditTrail
                    ]
                }
            }
            return evt;
        }));
        setEditingEvent(null);
    };

    const StatusBadge = ({ status }: { status: string }) => {
        let colorClass = 'bg-slate-500/20 text-slate-500';
        if (status === 'Approved') colorClass = 'bg-emerald-500/20 text-emerald-500';
        if (status === 'Rejected') colorClass = 'bg-red-500/20 text-red-500';
        if (status === 'Pending Validation') colorClass = 'bg-orange-500/20 text-orange-500';

        return (
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${colorClass}`}>
                {status === 'Approved' ? t.approved : status === 'Rejected' ? t.rejected : status === 'Pending Validation' ? t.pending : status}
            </span>
        );
    };

    // Reusable Form Component
    const EventForm = ({
        data,
        setData,
        onSubmit,
        title,
        onClose
    }: {
        data: OpEvent,
        setData: (d: OpEvent) => void,
        onSubmit: (e: React.FormEvent) => void,
        title: string,
        onClose: () => void
    }) => {
        // Filter processes based on department if possible
        // Assuming 'department' field in OpEvent stores the Name, but process has departmentId. 
        // We need to map Name back to ID or store ID in OpEvent. 
        // OpEvent currently has 'department' string. Let's try to match by name for filtering.
        const currentDeptId = departments.find(d => d.name === data.department)?.id;
        const filteredProcesses = currentDeptId
            ? processes.filter(p => p.departmentId === currentDeptId)
            : processes;

        return (
            <div className="fixed inset-0 z-50 flex justify-end">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
                <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
                    <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                        <button onClick={onClose} className="text-slate-500 hover:text-red-500">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <form onSubmit={onSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Title</label>
                            <input
                                type="text"
                                required
                                value={data.title}
                                onChange={(e) => setData({ ...data, title: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-slate-900 dark:text-white"
                                placeholder="e.g., ATM Malfunction"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Date of Discovery</label>
                            <input
                                type="date"
                                required
                                value={data.dateDiscovery}
                                onChange={(e) => setData({ ...data, dateDiscovery: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-slate-900 dark:text-white"
                            />
                        </div>

                        {/* EBA Event Type Selector Level 1 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Event Type (EBA Level 1)</label>
                            <select
                                value={data.eventType}
                                onChange={(e) => {
                                    const newType = e.target.value;
                                    setData({
                                        ...data,
                                        eventType: newType,
                                        // Reset Level 2 when Level 1 changes
                                        eventTypeLevel2: EBA_EVENT_TYPES_HIERARCHY[newType]?.[0] || ''
                                    });
                                }}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-slate-900 dark:text-white text-sm"
                            >
                                {EBA_EVENT_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* EBA Event Type Selector Level 2 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Event Type (EBA Level 2)</label>
                            <select
                                value={data.eventTypeLevel2}
                                onChange={(e) => setData({ ...data, eventTypeLevel2: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-slate-900 dark:text-white text-sm"
                            >
                                {EBA_EVENT_TYPES_HIERARCHY[data.eventType]?.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Business Line Selector */}
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Business Line</label>
                            <select
                                value={data.businessLine}
                                onChange={(e) => setData({ ...data, businessLine: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-slate-900 dark:text-white text-sm"
                            >
                                {BUSINESS_LINES.map(line => (
                                    <option key={line} value={line}>{line}</option>
                                ))}
                            </select>
                        </div>

                        {/* Department Selector */}
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Department / Area</label>
                            <select
                                value={data.department}
                                onChange={(e) => setData({ ...data, department: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-slate-900 dark:text-white text-sm"
                            >
                                <option value="">Select Department...</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Process Selector */}
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Process</label>
                            <select
                                value={data.processId}
                                onChange={(e) => setData({ ...data, processId: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-slate-900 dark:text-white text-sm"
                            >
                                <option value="">Select Process...</option>
                                {filteredProcesses.map(proc => (
                                    <option key={proc.id} value={proc.id}>{proc.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Amount (€)</label>
                            <input
                                type="number"
                                required
                                value={data.amount}
                                onChange={(e) => setData({ ...data, amount: Number(e.target.value) })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-slate-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Description</label>
                            <textarea
                                rows={4}
                                required
                                value={data.description}
                                onChange={(e) => setData({ ...data, description: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-slate-900 dark:text-white"
                            />
                        </div>
                        <div className="pt-4 flex justify-end">
                            <button type="submit" className="flex items-center px-4 py-2 bg-brand-brown hover:bg-orange-800 text-white rounded-lg">
                                <Save className="w-4 h-4 mr-2" /> Save
                            </button>
                        </div>
                        {data.auditTrail.length > 0 && (
                            <div className="mt-8 border-t border-slate-200 dark:border-white/10 pt-4">
                                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Audit Trail</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {data.auditTrail.map((log, i) => (
                                        <div key={i} className="text-xs text-slate-500 border-l-2 border-slate-300 pl-2">
                                            <span className="font-semibold">{log.date}</span> - {log.action} ({log.user})
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6" onClick={() => setActiveActionId(null)}>
            <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t.data}</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Operational Risk Events Repository</p>
                </div>
                <div className="flex space-x-3 mt-4 md:mt-0">
                    {canEdit && (
                        <>
                            <button
                                onClick={() => setIsCreating(true)}
                                className="flex items-center px-4 py-2 bg-brand-brown hover:bg-orange-800 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-black/20"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                {t.createEvent}
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleCsvImport(); }}
                                className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                {t.uploadCsv}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-md p-4 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                    <input type="text" placeholder="Search events..." className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-brown" />
                </div>
                <button className="flex items-center px-4 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5">
                    <Filter className="w-4 h-4 mr-2" /> Filter
                </button>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-200 dark:border-white/5 overflow-visible shadow-sm min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                                <th className="py-4 px-6 w-10"></th>
                                <th className="py-4 px-6">Event ID</th>
                                <th className="py-4 px-6">Date</th>
                                <th className="py-4 px-6">Classification</th>
                                <th className="py-4 px-6">Level 2 / Process</th>
                                <th className="py-4 px-6">Dept / Origin</th>
                                <th className="py-4 px-6 text-right">Loss (€)</th>
                                <th className="py-4 px-6 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                            {events.map((evt) => (
                                <tr key={evt.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group relative">
                                    <td className="py-4 px-6 relative">
                                        <div className="relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveActionId(activeActionId === evt.id ? null : evt.id);
                                                }}
                                                className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                            {activeActionId === evt.id && (
                                                <div className="absolute left-0 top-8 z-50 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-white/10 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                    {canValidate && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusChange(evt.id, 'Approved')}
                                                                className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex items-center"
                                                            >
                                                                <CheckCircle className="w-4 h-4 mr-2" /> {t.validate}
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusChange(evt.id, 'Rejected')}
                                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                                                            >
                                                                <XCircle className="w-4 h-4 mr-2" /> {t.reject}
                                                            </button>
                                                        </>
                                                    )}
                                                    {canEdit && (
                                                        <button
                                                            onClick={() => openEditPanel(evt)}
                                                            className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center"
                                                        >
                                                            <Edit className="w-4 h-4 mr-2" /> {t.edit}
                                                        </button>
                                                    )}
                                                    {!canEdit && !canValidate && (
                                                        <div className="px-4 py-2 text-sm text-slate-500 italic">Read Only View</div>
                                                    )}
                                                    <div className="border-t border-slate-100 dark:border-white/5 my-1"></div>
                                                    <div className="px-4 py-2">
                                                        <p className="text-xs text-slate-400 font-bold mb-1">Audit Log:</p>
                                                        {evt.auditTrail.slice(0, 2).map((log, i) => (
                                                            <p key={i} className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                                                {log.action}
                                                            </p>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 font-mono text-sm font-medium text-brand-brown dark:text-orange-400">{evt.id}</td>
                                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300 text-sm">{evt.dateDiscovery}</td>
                                    <td className="py-4 px-6">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{evt.title}</p>
                                        <div className="flex flex-col gap-1 mt-1">
                                            <span className="text-[10px] bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded w-fit">{evt.businessLine}</span>
                                            <span className="text-[10px] bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded w-fit">{evt.eventType}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">
                                        <div className="text-xs text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{evt.eventTypeLevel2}</div>
                                        <div className="text-[10px] text-slate-400">{processes.find(p => p.id === evt.processId)?.name || evt.processId}</div>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">
                                        <div className="font-medium text-slate-700 dark:text-slate-300">{evt.department}</div>
                                        <div className="text-xs text-slate-500">{evt.employeeEmail}</div>
                                    </td>
                                    <td className="py-4 px-6 text-right font-medium text-slate-900 dark:text-white">€ {evt.amount.toLocaleString()}</td>
                                    <td className="py-4 px-6 text-center">
                                        <StatusBadge status={evt.status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Drawer (Existing Event) */}
            {editingEvent && (
                <EventForm
                    data={editingEvent}
                    setData={setEditingEvent}
                    onSubmit={saveEdit}
                    title={`Edit Event: ${editingEvent.id}`}
                    onClose={() => setEditingEvent(null)}
                />
            )}

            {/* Create Modal (New Event) */}
            {isCreating && (
                <EventForm
                    data={newEvent}
                    setData={setNewEvent}
                    onSubmit={handleCreateEvent}
                    title="Create New Operational Event"
                    onClose={() => { setIsCreating(false); setNewEvent(emptyEvent); }}
                />
            )}
        </div>
    );
};

export default EventModule;
