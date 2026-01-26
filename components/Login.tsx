
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
        {/* Gray "alquid" text */}
        <text x="70" y="240" fontFamily="Arial, sans-serif" fontSize="180" fontWeight="bold" fill="#888888">alquid</text>

        {/* Brown OpRisk bar */}
        <rect x="95" y="280" width="620" height="55" fill="#8B4513" />
        <text x="405" y="325" fontFamily="Arial, sans-serif" fontSize="36" fontWeight="bold" fill="white" textAnchor="middle">OpRisk</text>
    </svg>
);

const Login: React.FC<LoginProps> = ({ onLogin, users, setUsers }) => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoaded, setGoogleLoaded] = useState(false);
    const googleButtonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let mounted = true;
        let renderAttempts = 0;
        const maxAttempts = 50; // 5 seconds max

        // Initialize Google Sign-In
        googleAuth.initialize(
            (googleUser: GoogleUser) => {
                if (mounted) handleGoogleSuccess(googleUser);
            },
            (errorMsg: string) => {
                if (mounted) setError(errorMsg);
            }
        );

        // Try to render Google button with retry logic
        const tryRenderButton = setInterval(() => {
            renderAttempts++;

            if (window.google?.accounts?.id && googleButtonRef.current && !googleLoaded) {
                clearInterval(tryRenderButton);
                try {
                    googleAuth.renderButton(googleButtonRef.current, 'filled_blue', 'large');
                    if (mounted) setGoogleLoaded(true);
                    console.log('Google button rendered successfully');
                } catch (err) {
                    console.error('Error rendering Google button:', err);
                    if (mounted) setError('Failed to load Google Sign-In. Please refresh the page.');
                }
            }

            if (renderAttempts >= maxAttempts) {
                clearInterval(tryRenderButton);
                if (!googleLoaded && mounted) {
                    setError('Google Sign-In failed to load. Please check your internet connection and refresh the page.');
                }
            }
        }, 100);

        return () => {
            mounted = false;
            clearInterval(tryRenderButton);
        };
    }, [googleLoaded]);

    const handleGoogleSuccess = (googleUser: GoogleUser) => {
        setLoading(true);
        setError('');

        // Simulate network delay
        setTimeout(() => {
            // Check if user exists in the system
            const existingUser = users.find(u => u.email.toLowerCase() === googleUser.email.toLowerCase());

            if (existingUser) {
                // User exists, update last login
                const userWithLogin = {
                    ...existingUser,
                    lastLogin: new Date().toISOString()
                };
                setUsers(users.map(u => u.id === existingUser.id ? userWithLogin : u));
                onLogin(userWithLogin);
            } else {
                // User not registered in system
                setError('User not recognized. Please contact Administrator to create your account.');
                setLoading(false);
            }
        }, 500);
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

                <div className="space-y-6">
                    {/* Google Sign-In Button */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-3 text-center">
                            Sign in with your NFQ Google Account
                        </label>
                        <div
                            ref={googleButtonRef}
                            className="flex justify-center min-h-[44px] items-center"
                        >
                            {!googleLoaded && !error && (
                                <div className="flex items-center text-slate-400 text-sm">
                                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-brand-brown mr-2"></div>
                                    Loading Google Sign-In...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm flex items-start">
                        <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold">NFQ Employees Only</p>
                            <p className="text-xs mt-1 text-blue-300/80">
                                You must use your @nfq.es Google account. If you don't have access, contact your administrator.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center">
                            <Lock className="w-4 h-4 mr-2" />
                            {error}
                        </div>
                    )}

                    {loading && (
                        <div className="text-center text-slate-400 text-sm">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-brand-brown"></div>
                            <p className="mt-2">Authenticating...</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center text-xs text-slate-500">
                    <p>&copy; 2023 NFQ Advisory Services. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
