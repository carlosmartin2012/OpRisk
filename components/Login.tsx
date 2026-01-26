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

    const handleCredentialResponse = (response: any) => {
        setLoading(true);
        try {
            // Decode JWT payload (standard way without library for simplicity)
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            const email = payload.email.toLowerCase();
            const name = payload.name;

            if (!email.endsWith('@nfq.es')) {
                setError('Access restricted to @nfq.es domains.');
                setLoading(false);
                return;
            }

            let existingUser = users.find(u => u.email.toLowerCase() === email);

            if (!existingUser) {
                // Special Admin for Carlos
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
        } catch (err) {
            console.error('Google Auth Error:', err);
            setError('Failed to process Google login.');
            setLoading(false);
        }
    };

    React.useEffect(() => {
        const initGoogle = () => {
            if (window.google && googleButtonRef.current) {
                window.google.accounts.id.initialize({
                    client_id: "788059882672-m9psk0p3l506n7vqund21o5n857puj6p.apps.googleusercontent.com", // Replacement needed for prod
                    callback: handleCredentialResponse,
                    auto_select: false,
                    cancel_on_tap_outside: true,
                });

                window.google.accounts.id.renderButton(
                    googleButtonRef.current,
                    {
                        theme: "filled_blue",
                        size: "large",
                        width: googleButtonRef.current.offsetWidth,
                        text: "signin_with",
                        shape: "rectangular"
                    }
                );
            }
        };

        // Check every 500ms if script is loaded
        const interval = setInterval(() => {
            if (window.google) {
                initGoogle();
                clearInterval(interval);
            }
        }, 500);

        return () => clearInterval(interval);
    }, [users]);

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-brand-brown/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-brown/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl relative z-10">
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-4">
                        <img src="/logo.png" alt="Alquid Logo" className="h-20 object-contain" />
                    </div>
                    <p className="text-slate-400 text-sm mt-2 font-medium tracking-wide uppercase">Next Gen Risk Management</p>
                </div>

                <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <p className="text-slate-300 text-sm mb-2">Sign in with your NFQ account</p>

                        {/* Google Button Container */}
                        <div ref={googleButtonRef} className="w-full flex justify-center min-h-[44px]"></div>

                        {loading && (
                            <div className="flex items-center text-brand-brown animate-pulse text-sm font-medium">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-brown mr-2"></div>
                                Verifying identity...
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center animate-in fade-in zoom-in duration-200">
                            <Lock className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                <div className="mt-12 pt-6 border-t border-white/5 text-center text-[10px] text-slate-500 flex flex-col items-center justify-center gap-2">
                    <div className="flex items-center gap-2 opacity-30 grayscale">
                        <img src="/logo.png" alt="mini-logo" className="h-3" />
                        <span>Powered by NFQ</span>
                    </div>
                    <p>&copy; 2024 NFQ Advisory Services. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
