import React, { useState } from 'react';
import { useHabitFlow } from '../context/HabitFlowContext';
import Dashboard from '../components/dashboard/Dashboard';
import Gamification from '../components/dashboard/Gamification';
import WelcomeModal from '../components/common/WelcomeModal';
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
    const { settings, completeOnboarding } = useHabitFlow();
    // Initialize welcome modal state based on onboarding status
    const [isWelcomeOpen, setIsWelcomeOpen] = useState(!settings.hasSeenOnboarding);

    const handleCloseWelcome = () => {
        setIsWelcomeOpen(false);
        completeOnboarding();
    };

    return (
        <div className={styles.container}>
            <div className={styles.mainGrid}>
                <Dashboard />

                <aside className={styles.gamificationSection}>
                    <Gamification />
                </aside>
            </div>

            <WelcomeModal
                isOpen={isWelcomeOpen}
                onClose={handleCloseWelcome}
            />
        </div>
    );
};

export default DashboardPage;
