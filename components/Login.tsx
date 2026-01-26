
import React, { useState } from 'react';
import { Lock } from 'lucide-react';
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
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const googleButtonRef = React.useRef<HTMLDivElement>(null);

    const processLogin = (userEmail: string, userName?: string) => {
        const email = userEmail.toLowerCase().trim();
        if (!email.endsWith('@nfq.es')) {
            setError('Access restricted to @nfq.es domains.');
            setLoading(false);
            return;
        }

        let existingUser = users.find(u => u.email.toLowerCase() === email);

        if (!existingUser) {
            const name = userName || email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
            const role: UserRole = email === 'carlos.martin@nfq.es' ? 'Administrator' : 'OpRisk';

            existingUser = {
                id: `U-${Date.now()}`,
                email: email,
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

    React.useEffect(() => {
        const interval = setInterval(() => {
            if (window.google && googleButtonRef.current) {
                window.google.accounts.id.initialize({
                    client_id: "305790686148-es7bm0pg9ku4voheub6g7i2i2i88psn7.apps.googleusercontent.com",
                    callback: handleCredentialResponse,
                    auto_select: false,
                    context: 'signin',
                    itp_support: true
                });

                window.google.accounts.id.renderButton(googleButtonRef.current, {
                    type: "standard",
                    theme: "outline",
                    size: "large",
                    width: 320,
                    text: "signin_with",
                    shape: "pill",
                    logo_alignment: "left"
                });
                clearInterval(interval);
            }
        }, 500);
        return () => clearInterval(interval);
    }, [users]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
            {/* Header Branding */}
            <div className="flex flex-col items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex items-center justify-center gap-4 mb-2">
                    <div className="p-1 bg-[#0a0a0a] rounded-lg">
                        <img src="/nfq-n.png" alt="NFQ Logo" className="h-16 w-auto object-contain" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-white">OpRisk</h1>
                </div>
                <p className="text-slate-400 text-sm font-medium tracking-wide">
                    Operational Risk Management Platform
                </p>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-md bg-[#161616] border border-white/5 p-10 rounded-[32px] shadow-2xl relative">
                <div className="mb-10">
                    <h2 className="text-2xl font-bold text-white mb-2">Welcome</h2>
                    <p className="text-slate-400 text-sm">
                        Sign in to access your operational risk dashboard
                    </p>
                </div>

                <div className="space-y-8">
                    <div className="flex flex-col items-center">
                        {/* Custom visual container for Google button to match the image style */}
                        <div className="w-full relative group">
                            <div ref={googleButtonRef} className="flex justify-center transition-transform active:scale-[0.98]"></div>
                            {loading && (
                                <div className="absolute inset-0 bg-[#161616]/80 backdrop-blur-sm flex items-center justify-center rounded-full">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-100 text-xs flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                            <Lock className="w-3 h-3 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="pt-6 border-t border-white/5">
                        <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                            By signing in, you agree to our <span className="underline cursor-pointer hover:text-slate-300">Terms of Service</span> and <span className="underline cursor-pointer hover:text-slate-300">Privacy Policy</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-12 text-slate-700 text-[10px] font-bold uppercase tracking-widest">
                &copy; 2024 NFQ Advisory Services
            </div>
        </div>
    );
};

export default Login;
