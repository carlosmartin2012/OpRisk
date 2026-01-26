
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Lock, AlertCircle } from 'lucide-react';
import { User, UserRole } from '../types';
import { googleAuth, GoogleUser } from '../services/googleAuth';

interface LoginProps {
    onLogin: (user: User) => void;
    users: User[];
    setUsers: (users: User[]) => void;
}

// Logo matching the new brand design
const AlquidLogo = () => (
    <svg width="180" height="70" viewBox="0 0 960 360" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
        <text x="70" y="240" fontFamily="Arial, sans-serif" fontSize="180" fontWeight="bold" fill="#888888">alquid</text>
        <rect x="95" y="280" width="620" height="55" fill="#8B4513" />
        <text x="405" y="325" fontFamily="Arial, sans-serif" fontSize="36" fontWeight="bold" fill="white" textAnchor="middle">OpRisk</text>
    </svg>
);

const Login: React.FC<LoginProps> = ({ onLogin, users, setUsers }) => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleReady, setGoogleReady] = useState(false);
    const googleButtonRef = useRef<HTMLDivElement>(null);
    const initStarted = useRef(false);

    useEffect(() => {
        if (initStarted.current) return;
        initStarted.current = true;

        let mounted = true;

        console.log("Login: Initializing Google Auth...");

        // Initialize Google Sign-In
        googleAuth.initialize(
            (googleUser: GoogleUser) => {
                if (mounted) handleGoogleSuccess(googleUser);
            },
            (errorMsg: string) => {
                if (mounted) setError(errorMsg);
            }
        );

        // Try to render Google button
        let attempts = 0;
        const checkInterval = setInterval(() => {
            attempts++;
            if (window.google?.accounts?.id && googleButtonRef.current) {
                clearInterval(checkInterval);
                try {
                    googleAuth.renderButton(googleButtonRef.current, 'filled_blue', 'large');
                    if (mounted) setGoogleReady(true);
                    console.log("Login: Google button rendered.");
                } catch (err) {
                    console.error("Login: Button render error", err);
                    if (mounted) setError("Failed to render Sign-In button.");
                }
            }
            if (attempts > 50) {
                clearInterval(checkInterval);
                if (mounted) setError("Google Sign-In failed to load. Check your connection.");
            }
        }, 100);

        return () => {
            mounted = false;
            clearInterval(checkInterval);
        };
    }, []);

    const handleGoogleSuccess = (googleUser: GoogleUser) => {
        setLoading(true);
        setError('');

        setTimeout(() => {
            const existingUser = users.find(u => u.email.toLowerCase() === googleUser.email.toLowerCase());

            if (existingUser) {
                const userWithLogin = {
                    ...existingUser,
                    lastLogin: Date.now().toString()
                };
                setUsers(users.map(u => u.id === existingUser.id ? userWithLogin : u));
                onLogin(userWithLogin);
            } else {
                setError('User not recognized. Contact Administrator.');
                setLoading(false);
            }
        }, 500);
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative text-white">
            <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl z-10">
                <div className="text-center mb-10">
                    <AlquidLogo />
                    <p className="text-slate-400 text-sm mt-2">Next Gen Risk Management</p>
                </div>

                <div className="space-y-6">
                    <div className="text-center">
                        <p className="text-sm font-medium text-slate-300 mb-4">Sign in with your NFQ Google Account</p>

                        <div ref={googleButtonRef} className="flex justify-center min-h-[44px] items-center">
                            {!googleReady && !error && (
                                <div className="text-slate-500 text-sm">Preparing Google Sign-In...</div>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center">
                            <Lock className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {loading && (
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center text-[10px] text-slate-500">
                    &copy; 2023 NFQ Advisory Services.
                </div>
            </div>
        </div>
    );
};

export default Login;
