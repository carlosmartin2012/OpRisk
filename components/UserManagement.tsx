
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Shield, Briefcase, Eye, Trash2, Plus, X, Save } from 'lucide-react';

interface UserManagementProps {
    users: User[];
    setUsers: (users: User[]) => void;
    currentUser: User | null;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, setUsers, currentUser }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newUserForm, setNewUserForm] = useState({
        name: '',
        email: '',
        department: 'Risk Dept',
        role: 'First Line' as UserRole
    });

    const canManageUsers = currentUser?.role === 'Administrator';
    const canChangeRoles = currentUser?.role === 'Administrator' || currentUser?.role === 'OpRisk'; // OpRisk can change roles but not create users? Prompt says "Create users... that ONLY LOGIN if in user management". Prompt says "Crea un boton... para que el ADMIN pueda crear usuarios". So only Admin creates.

    const changeRole = (id: string, newRole: UserRole) => {
        if (!canChangeRoles) return;

        if (newRole === 'Administrator') {
            const targetUser = users.find(u => u.id === id);
            if (targetUser?.email !== 'carlos.martin@nfq.es') {
                alert("Only carlos.martin@nfq.es can be Administrator.");
                return;
            }
        }

        setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
    };

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!newUserForm.email.toLowerCase().endsWith('@nfq.es')) {
            alert('Email must end with @nfq.es');
            return;
        }

        if (users.some(u => u.email.toLowerCase() === newUserForm.email.toLowerCase())) {
            alert('User with this email already exists.');
            return;
        }

        const newUser: User = {
            id: `U-${Date.now()}`,
            name: newUserForm.name,
            email: newUserForm.email,
            department: newUserForm.department,
            role: newUserForm.role,
            lastLogin: 'Never',
            status: 'Active'
        };

        setUsers([...users, newUser]);
        setShowCreateModal(false);
        setNewUserForm({ name: '', email: '', department: 'Risk Dept', role: 'First Line' });
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">User Management</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage platform access and role-based permissions.</p>
                </div>
                {canManageUsers && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-brand-brown hover:bg-orange-800 text-white px-4 py-2 rounded-lg flex items-center shadow-lg transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add User
                    </button>
                )}
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
                                    {canChangeRoles ? (
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={u.role}
                                                onChange={(e) => changeRole(u.id, e.target.value as UserRole)}
                                                className="bg-transparent border border-slate-300 dark:border-white/10 rounded px-2 py-1 text-xs font-medium focus:ring-1 focus:ring-brand-brown text-slate-700 dark:text-slate-200"
                                            >
                                                <option value="OpRisk">OpRisk</option>
                                                <option value="First Line">First Line</option>
                                                <option value="Auditor">Auditor</option>
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
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase">
                                            {u.status}
                                        </span>
                                        {canManageUsers && currentUser.id !== u.id && (
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to delete this user?')) {
                                                        setUsers(users.filter(user => user.id !== u.id));
                                                    }
                                                }}
                                                className="p-1 hover:bg-red-100 rounded-full text-red-500 transition-colors ml-2"
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create User Drawer */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
                    <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right border-l border-slate-200 dark:border-white/10">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New User</h2>
                            <button onClick={() => setShowCreateModal(false)}><X className="w-6 h-6 text-slate-400 hover:text-slate-600" /></button>
                        </div>

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                                <input
                                    type="text" required autoFocus
                                    value={newUserForm.name}
                                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white border focus:ring-2 focus:ring-brand-brown outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Email Address (@nfq.es)</label>
                                <input
                                    type="email" required
                                    value={newUserForm.email}
                                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white border focus:ring-2 focus:ring-brand-brown outline-none"
                                    placeholder="user@nfq.es"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Department</label>
                                <input
                                    type="text" required
                                    value={newUserForm.department}
                                    onChange={(e) => setNewUserForm({ ...newUserForm, department: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white border focus:ring-2 focus:ring-brand-brown outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Role</label>
                                <select
                                    value={newUserForm.role}
                                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as UserRole })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white border outline-none"
                                >
                                    <option value="First Line">First Line</option>
                                    <option value="OpRisk">OpRisk</option>
                                    <option value="Auditor">Auditor</option>
                                    <option value="Administrator">Administrator</option>
                                </select>
                            </div>

                            <div className="pt-6 border-t border-slate-200 dark:border-white/10 mt-6">
                                <button type="submit" className="w-full py-3 bg-brand-brown hover:bg-orange-800 text-white font-bold rounded-xl shadow-lg flex items-center justify-center">
                                    <Save className="w-5 h-5 mr-2" />
                                    Save User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {(currentUser?.role !== 'OpRisk' && currentUser?.role !== 'Administrator') && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                    You are viewing this page as <strong>{currentUser?.role}</strong>. Only <strong>OpRisk</strong> or <strong>Administrator</strong> can modify user roles.
                </div>
            )}
        </div>
    );
};

export default UserManagement;
