import React from 'react';
import { User, UserRole } from '../types';
import { Shield, Briefcase, Eye } from 'lucide-react';

interface UserManagementProps {
    users: User[];
    setUsers: (users: User[]) => void;
    currentUser: User | null;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, setUsers, currentUser }) => {

    const changeRole = (id: string, newRole: UserRole) => {
        // Enforce: Only Admin or Carlos Martin can assign 'Administrator'
        // Actually, logic: Only Admin can change roles.
        // And check if the role being assigned is 'Administrator', only valid if user is 'carlos.martin@nfq.es'
        // Wait, the prompt says "only I (carlos.martin@nfq.es) can have associated". It implies no one else can be Admin.
        // So validation should be: if newRole === 'Administrator' and user.email !== 'carlos.martin@nfq.es', Block.

        if (currentUser?.role !== 'Administrator' && currentUser?.role !== 'OpRisk') return; // Only Admin can change. (Assuming OpRisk was previous admin). 
        // Let's assume 'OpRisk' is NOT the super admin anymore, 'Administrator' is the new one?
        // Prompt: "4th type of profile that is admin and ONLY I (carlos.martin) can have".

        if (newRole === 'Administrator') {
            const targetUser = users.find(u => u.id === id);
            if (targetUser?.email !== 'carlos.martin@nfq.es') {
                alert("Only carlos.martin@nfq.es can be Administrator.");
                return;
            }
        }

        setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">User Management</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Manage platform access and role-based permissions.</p>
            </div>

            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                            <th className="py-4 px-6">User</th>
                            <th className="py-4 px-6">Department</th>
                            <th className="py-4 px-6">Role</th>
                            <th className="py-4 px-6">Last Login</th>
                            <th className="py-4 px-6 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                <td className="py-4 px-6">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold mr-3">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{u.name}</p>
                                            <p className="text-xs text-slate-500">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">{u.department}</td>
                                <td className="py-4 px-6">
                                    {(currentUser?.role === 'OpRisk' || currentUser?.role === 'Administrator') ? (
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={u.role}
                                                onChange={(e) => changeRole(u.id, e.target.value as UserRole)}
                                                className="bg-transparent border border-slate-300 dark:border-white/10 rounded px-2 py-1 text-xs font-medium focus:ring-1 focus:ring-brand-brown text-slate-700 dark:text-slate-200"
                                            >
                                                <option value="OpRisk">OpRisk</option>
                                                <option value="First Line">First Line</option>
                                                <option value="Auditor">Auditor</option>
                                                {/* Only show/allow Admin option if check passes, but simpler to show and validate on change */}
                                                <option value="Administrator">Administrator</option>
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            {u.role === 'OpRisk' && <Shield className="w-3 h-3 text-red-500" />}
                                            {u.role === 'First Line' && <Briefcase className="w-3 h-3 text-blue-500" />}
                                            {u.role === 'Auditor' && <Eye className="w-3 h-3 text-amber-500" />}
                                            {u.role === 'Administrator' && <Shield className="w-3 h-3 text-purple-500" />}
                                            <span className="text-sm text-slate-700 dark:text-slate-300">{u.role}</span>
                                        </div>
                                    )}
                                </td>
                                <td className="py-4 px-6 text-xs text-slate-500 font-mono">{u.lastLogin}</td>
                                <td className="py-4 px-6 text-center">
                                    <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase">
                                        {u.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {(currentUser?.role !== 'OpRisk' && currentUser?.role !== 'Administrator') && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                    You are viewing this page as <strong>{currentUser?.role}</strong>. Only <strong>OpRisk</strong> or <strong>Administrator</strong> can modify user roles.
                </div>
            )}
        </div>
    );
};

export default UserManagement;
