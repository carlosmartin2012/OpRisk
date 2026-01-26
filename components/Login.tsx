
import React, { useState } from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { User, UserRole } from '../types';

interface LoginProps {
    onLogin: (user: User) => void;
    users: User[];
    setUsers: (users: User[]) => void;
}

declare global {
    interface Window {
        google: any;
    }
}

const Login: React.FC<LoginProps> = ({ onLogin, users, setUsers }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showManual, setShowManual] = useState(false);
    const googleButtonRef = React.useRef<HTMLDivElement>(null);

    const processLogin = (userEmail: string, userName?: string) => {
        const lowerEmail = userEmail.toLowerCase().trim();
        if (!lowerEmail.endsWith('@nfq.es')) {
            setError('Access restricted to @nfq.es domains.');
            setLoading(false);
            return;
        }

        let existingUser = users.find(u => u.email.toLowerCase() === lowerEmail);

        if (!existingUser) {
            const name = userName || lowerEmail.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
            const role: UserRole = lowerEmail === 'carlos.martin@nfq.es' ? 'Administrator' : 'OpRisk';

            existingUser = {
                id: `U-${Date.now()}`,
                email: lowerEmail,
                name: name,
                role: role,
                department: 'Operations',
                lastLogin: new Date().toISOString(),
                status: 'Active'
            };
            setUsers([...users, existingUser]);
        } else {
            const updatedUser = { ...existingUser, lastLogin: new Date().toISOString() };
            setUsers(users.map(u => u.id === existingUser!.id ? updatedUser : u));
            existingUser = updatedUser;
        }
        onLogin(existingUser);
    };

    const handleCredentialResponse = (response: any) => {
        setLoading(true);
        try {
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            processLogin(payload.email, payload.name);
        } catch (err) {
            console.error('Google Auth Error:', err);
            setError('Failed to process Google login.');
            setLoading(false);
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setTimeout(() => processLogin(email), 800);
    };

    React.useEffect(() => {
        const interval = setInterval(() => {
            if (window.google && googleButtonRef.current) {
                window.google.accounts.id.initialize({
                    client_id: "305790686148-es7bm0pg9ku4voheub6g7i2i2i88psn7.apps.googleusercontent.com",
                    callback: handleCredentialResponse,
                });
                window.google.accounts.id.renderButton(googleButtonRef.current, { theme: "filled_blue", size: "large", width: 320 });
                clearInterval(interval);
            }
        }, 500);
        return () => clearInterval(interval);
    }, [users, showManual]);

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative">
            <div className="absolute top-0 left-0 w-96 h-96 bg-brand-brown/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-brown/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            <div className="w-full max-w-sm bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl relative z-10">
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <img src="/nfq-n.png" alt="NFQ Logo" className="h-14 w-auto" />
                        <div className="h-10 w-px bg-white/20"></div>
                        <h1 className="text-3xl font-black tracking-tighter text-white">OpRisk</h1>
                    </div>
                    <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Next Gen Risk Management</p>
                </div>

                <div className="space-y-6">
                    {!showManual ? (
                        <div className="flex flex-col items-center space-y-6">
                            <div ref={googleButtonRef} className="w-full flex justify-center min-h-[44px]"></div>
                            <div className="w-full flex items-center gap-3">
                                <div className="h-px bg-white/10 flex-1"></div>
                                <span className="text-xs text-slate-500 font-medium uppercase tracking-tighter">or use corporate SSO</span>
                                <div className="h-px bg-white/10 flex-1"></div>
                            </div>
                            <button
                                onClick={() => setShowManual(true)}
                                className="text-slate-400 hover:text-white text-xs transition-colors flex items-center gap-1 font-medium"
                            >
                                <Lock className="w-3 h-3" /> Use NFQ Email Access
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleManualSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Corporate Email</label>
                                <input
                                    type="email" required autoFocus
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@nfq.es"
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-brand-brown outline-none transition-all"
                                />
                            </div>
                            <button
                                type="submit" disabled={loading}
                                className="w-full bg-brand-brown hover:bg-orange-800 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group"
                            >
                                {loading ? 'Authenticating...' : (
                                    <>
                                        Enter System <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                            <button
                                type="button" onClick={() => setShowManual(false)}
                                className="w-full text-slate-500 hover:text-slate-300 text-[10px] font-bold uppercase"
                            >
                                Back to Google Sign-in
                            </button>
                        </form>
                    )}

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-100 text-[11px] flex items-center gap-2 animate-pulse">
                            <Lock className="w-3 h-3 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                <div className="mt-12 pt-6 border-t border-white/5 text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                    &copy; 2024 NFQ Advisory Services. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default Login;
