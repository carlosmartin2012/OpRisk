// Google OAuth Configuration
// IMPORTANTE: Reemplaza este Client ID con el tuyo propio de Google Cloud Console
// Para obtenerlo: https://console.cloud.google.com/apis/credentials
const GOOGLE_CLIENT_ID = '305790686148-es7bm0pg9ku4voheub6g7i2i2i88psn7.apps.googleusercontent.com';

export interface GoogleUser {
    email: string;
    name: string;
    picture?: string;
    sub: string; // Google user ID
}

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: any) => void;
                    prompt: (callback?: (notification: any) => void) => void;
                    renderButton: (element: HTMLElement, config: any) => void;
                    disableAutoSelect: () => void;
                    revoke: (email: string, callback: () => void) => void;
                };
            };
        };
    }
}

export class GoogleAuthService {
    private static instance: GoogleAuthService;
    private initialized = false;

    private constructor() { }

    static getInstance(): GoogleAuthService {
        if (!GoogleAuthService.instance) {
            GoogleAuthService.instance = new GoogleAuthService();
        }
        return GoogleAuthService.instance;
    }

    /**
     * Initialize Google Sign-In
     */
    initialize(onSuccess: (user: GoogleUser) => void, onError: (error: string) => void) {
        if (this.initialized) return;

        // Wait for Google script to load
        const checkGoogleLoaded = setInterval(() => {
            if (window.google?.accounts?.id) {
                clearInterval(checkGoogleLoaded);

                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: (response: any) => this.handleCredentialResponse(response, onSuccess, onError),
                    auto_select: false,
                    cancel_on_tap_outside: true,
                });

                this.initialized = true;
            }
        }, 100);

        // Timeout after 10 seconds
        setTimeout(() => {
            clearInterval(checkGoogleLoaded);
            if (!this.initialized) {
                onError('Google Sign-In failed to load. Please check your internet connection.');
            }
        }, 10000);
    }

    /**
     * Show Google One Tap prompt
     */
    showOneTap() {
        if (window.google?.accounts?.id) {
            window.google.accounts.id.prompt();
        }
    }

    /**
     * Render Google Sign-In button
     */
    renderButton(element: HTMLElement, theme: 'outline' | 'filled_blue' = 'outline', size: 'large' | 'medium' = 'large') {
        if (window.google?.accounts?.id) {
            window.google.accounts.id.renderButton(element, {
                theme,
                size,
                text: 'signin_with',
                shape: 'rectangular',
                logo_alignment: 'left',
            });
        }
    }

    /**
     * Sign out
     */
    signOut(email: string) {
        if (window.google?.accounts?.id) {
            window.google.accounts.id.disableAutoSelect();
            window.google.accounts.id.revoke(email, () => {
                console.log('User signed out');
            });
        }
    }

    /**
     * Handle credential response from Google
     */
    private handleCredentialResponse(
        response: any,
        onSuccess: (user: GoogleUser) => void,
        onError: (error: string) => void
    ) {
        try {
            // Decode JWT token
            const credential = response.credential;
            const payload = this.parseJwt(credential);

            // Validate email domain
            if (!payload.email.endsWith('@nfq.es')) {
                onError('Access restricted to NFQ employees (@nfq.es)');
                return;
            }

            const user: GoogleUser = {
                email: payload.email,
                name: payload.name || payload.email.split('@')[0],
                picture: payload.picture,
                sub: payload.sub,
            };

            onSuccess(user);
        } catch (error) {
            onError('Failed to authenticate with Google');
            console.error('Google Auth Error:', error);
        }
    }

    /**
     * Parse JWT token
     */
    private parseJwt(token: string): any {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
}

export const googleAuth = GoogleAuthService.getInstance();
