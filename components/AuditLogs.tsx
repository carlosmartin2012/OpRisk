import React from 'react';
import { Download, Search } from 'lucide-react';
import { AuditLog, Language, TRANSLATIONS } from '../types';

interface AuditLogsProps {
    language: Language;
    logs: AuditLog[];
}

const AuditLogs: React.FC<AuditLogsProps> = ({ language, logs }) => {
    const t = TRANSLATIONS[language];

    const exportToExcel = () => {
        const headers = ["Date", "User", "Module", "Type", "Action Details"];
        const rows = logs.map(l => [l.date, l.user, l.module, l.type, l.action]);

        const csvContent = [
            headers.join(";"),
            ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
        ].join("\n");

        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t.auditLogs}</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">System-wide activity tracking</p>
                </div>
                <button
                    onClick={exportToExcel}
                    className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors"
                >
                    <Download className="w-4 h-4 mr-2" /> Export to Excel
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-200 dark:border-white/5 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Search logs..." className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-lg text-sm" />
                    </div>
                </div>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                            <th className="py-4 px-6">Date</th>
                            <th className="py-4 px-6">User</th>
                            <th className="py-4 px-6">Module</th>
                            <th className="py-4 px-6">Type</th>
                            <th className="py-4 px-6">Action Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-300 font-mono">{log.date}</td>
                                <td className="py-3 px-6 text-sm font-medium text-slate-900 dark:text-white">{log.user}</td>
                                <td className="py-3 px-6 text-sm text-slate-500">{log.module}</td>
                                <td className="py-3 px-6">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase 
                                        ${log.type === 'Delete' ? 'bg-red-100 text-red-700' :
                                            log.type === 'Import' ? 'bg-blue-100 text-blue-700' :
                                                log.type === 'Validation' ? 'bg-green-100 text-green-700' :
                                                    'bg-slate-100 text-slate-700'}`}>
                                        {log.type}
                                    </span>
                                </td>
                                <td className="py-3 px-6 text-sm text-slate-700 dark:text-slate-300">{log.action}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLogs;