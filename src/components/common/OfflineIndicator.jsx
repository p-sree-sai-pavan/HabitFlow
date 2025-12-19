import React, { useEffect, useState, useCallback } from 'react';
import { CloudOff, Wifi } from 'lucide-react';

export const useOfflineDetection = () => {
    const [isOnline, setIsOnline] = useState(true); // Assume online initially
    const [hasChecked, setHasChecked] = useState(false);

    // Real connectivity check by pinging a small resource
    const checkConnectivity = useCallback(async () => {
        try {
            // Try to fetch a small, cacheable resource with a timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            // Use Google's favicon as a reliable endpoint (very small file)
            const response = await fetch('https://www.google.com/favicon.ico', {
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-store',
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            setIsOnline(true);
            setHasChecked(true);
            return true;
        } catch (error) {
            // If fetch fails, check navigator.onLine as fallback
            const browserOnline = navigator.onLine;
            setIsOnline(browserOnline);
            setHasChecked(true);
            return browserOnline;
        }
    }, []);

    useEffect(() => {
        // Initial check
        checkConnectivity();

        // Browser online/offline events
        const handleOnline = () => {
            // When browser says online, verify with actual request
            checkConnectivity();
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Periodic connectivity check every 30 seconds
        const intervalId = setInterval(checkConnectivity, 30000);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(intervalId);
        };
    }, [checkConnectivity]);

    return isOnline;
};

export const OfflineIndicator = () => {
    const isOnline = useOfflineDetection();
    const [dismissed, setDismissed] = useState(false);

    // Reset dismissed state when coming back online
    useEffect(() => {
        if (isOnline) {
            setDismissed(false);
        }
    }, [isOnline]);

    if (isOnline || dismissed) return null;

    return (
        <div className="offlineBar">
            <CloudOff size={16} />
            <span>You're offline. Changes will sync when you reconnect.</span>
            <button
                onClick={() => setDismissed(true)}
                className="offlineDismiss"
                title="Dismiss"
            >
                ✕
            </button>
        </div>
    );
};
