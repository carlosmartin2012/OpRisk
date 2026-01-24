
import React, { useState } from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { User, UserRole } from '../types';

interface LoginProps {
    onLogin: (user: User) => void;
    users: User[];
    setUsers: (users: User[]) => void;
}


// Logo matching the new brand design
const AlquidLogo = () => (
    <svg width="180" height="70" viewBox="0 0 960 360" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
        {/* Gray A structure */}
        <path d="M70 300 L140 60 L210 300" stroke="#888888" strokeWidth="40" fill="none" strokeLinecap="square" />
        <path d="M100 200 L180 200" stroke="#888888" strokeWidth="35" strokeLinecap="square" />

        {/* Brown overlay triangle on right side of A */}
        <path d="M140 60 L180 200 L140 200 Z" fill="#8B4513" />

        {/* Gray "alquid" text */}
        <text x="280" y="240" fontFamily="Arial, sans-serif" fontSize="180" fontWeight="bold" fill="#888888">alquid</text>

        {/* Brown OpRisk bar */}
        <rect x="305" y="280" width="620" height="55" fill="#8B4513" />
        <text x="615" y="325" fontFamily="Arial, sans-serif" fontSize="36" fontWeight="bold" fill="white" textAnchor="middle">OpRisk</text>
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
                    setError('User not recognized. Please contact Administrator.');
                    setLoading(false);
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
