
import React, { useState } from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { User, UserRole } from '../types';

interface LoginProps {
    onLogin: (user: User) => void;
    users: User[];
    setUsers: (users: User[]) => void;
}

// Reusing the SVG Logo component logic for the Login screen
const AlquidLogo = () => (
    <svg width="180" height="70" viewBox="0 0 160 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
        <g transform="translate(5, 5)">
            <path d="M10 38 L22 8 L27 22" stroke="#64748b" strokeWidth="6" strokeLinecap="butt" strokeLinejoin="miter" />
            <path d="M16 28 H31" stroke="#64748b" strokeWidth="5" strokeLinecap="butt" />
            <path d="M25 18 L35 38" stroke="#8B4513" strokeWidth="6" strokeLinecap="butt" />

            <text x="42" y="38" fontFamily="sans-serif" fontSize="32" fontWeight="bold" fill="#64748b" letterSpacing="-1">
                alquid
            </text>

            <rect x="42" y="46" width="95" height="14" fill="#8B4513" rx="1" />
            <text x="89.5" y="56" fontFamily="sans-serif" fontSize="9" fontWeight="bold" fill="white" textAnchor="middle" letterSpacing="1.5">
                OPRISK
            </text>
        </g>
    </svg>
);

const Login: React.FC<LoginProps> = ({ onLogin, users, setUsers }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulate network delay
        setTimeout(() => {
            if (email.toLowerCase().endsWith('@nfq.es')) {
                // Check if user exists
                const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

                if (existingUser) {
                    // Determine department if missing (legacy data fix)
                    const userWithDept = {
                        ...existingUser,
                        department: existingUser.department || 'Unassigned',
                        lastLogin: new Date().toISOString() // Update last login
                    };

                    // Update user in store (last Login)
                    setUsers(users.map(u => u.id === existingUser.id ? userWithDept : u));
                    onLogin(userWithDept);
                } else {
                    // Register new user
                    const name = email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

                    // Auto-assign Administrator to specific email
                    const role: UserRole = email.toLowerCase() === 'carlos.martin@nfq.es' ? 'Administrator' : 'First Line';

                    const newUser: User = {
                        id: `U-${Date.now()}`,
                        email: email,
                        name: name,
                        role: role,
                        department: 'Unassigned', // Can be updated by Admin
                        lastLogin: new Date().toISOString(),
                        status: 'Active'
                    };

                    setUsers([...users, newUser]);
                    onLogin(newUser);
                }
            } else {
                setError('Access restricted to NFQ employees (@nfq.es)');
                setLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-brand-brown/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-brown/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl relative z-10">
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-4">
                        <AlquidLogo />
                    </div>
                    <p className="text-slate-400 text-sm mt-2">Next Gen Risk Management</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@nfq.es"
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-brown focus:border-transparent transition-all"
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center">
                            <Lock className="w-4 h-4 mr-2" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-brown hover:bg-orange-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-black/20 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Authenticating...' : (
                            <>
                                Sign In <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-xs text-slate-500">
                    <p>&copy; 2023 NFQ Advisory Services. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
