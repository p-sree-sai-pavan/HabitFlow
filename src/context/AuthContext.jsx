import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Register with email/password
    const register = async (email, password) => {
        setError(null);
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            return result.user;
        } catch (err) {
            setError(getErrorMessage(err.code));
            throw err;
        }
    };

    // Login with email/password
    const login = async (email, password) => {
        setError(null);
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            return result.user;
        } catch (err) {
            setError(getErrorMessage(err.code));
            throw err;
        }
    };

    // Login with Google
    const loginWithGoogle = async () => {
        setError(null);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            return result.user;
        } catch (err) {
            setError(getErrorMessage(err.code));
            throw err;
        }
    };

    // Logout
    const logout = async () => {
        setError(null);
        try {
            await signOut(auth);
        } catch (err) {
            setError(getErrorMessage(err.code));
            throw err;
        }
    };

    // Convert Firebase error codes to user-friendly messages
    const getErrorMessage = (code) => {
        switch (code) {
            case 'auth/email-already-in-use':
                return 'This email is already registered. Try logging in.';
            case 'auth/invalid-email':
                return 'Invalid email address.';
            case 'auth/operation-not-allowed':
                return 'Email/password accounts are not enabled.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters.';
            case 'auth/user-disabled':
                return 'This account has been disabled.';
            case 'auth/user-not-found':
                return 'No account found with this email.';
            case 'auth/wrong-password':
                return 'Incorrect password.';
            case 'auth/invalid-credential':
                return 'Invalid email or password.';
            case 'auth/popup-closed-by-user':
                return 'Sign-in popup was closed.';
            default:
                return 'An error occurred. Please try again.';
        }
    };

    const value = {
        user,
        loading,
        error,
        register,
        login,
        loginWithGoogle,
        logout,
        clearError: () => setError(null)
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
