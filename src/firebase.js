import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyAD8cUu2toipaecqqZ8ozP-1Nz8-aV8Zfs",
    authDomain: "habitflow-6da66.firebaseapp.com",
    projectId: "habitflow-6da66",
    storageBucket: "habitflow-6da66.firebasestorage.app",
    messagingSenderId: "238985838514",
    appId: "1:238985838514:web:80bc205d31dc132f63eeab",
    measurementId: "G-S3R8WW79BV"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

isSupported().then((supported) => {
    if (supported) {
        getAnalytics(app);
    }
}).catch((err) => {
    // Log analytics initialization errors instead of silently failing
    console.warn('[Firebase] Analytics initialization failed:', err.message);
});

export default app;
