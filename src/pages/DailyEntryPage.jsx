import React from 'react';
import { motion } from 'framer-motion';
import HabitTracker from '../components/habits/HabitTracker';
import StudyLog from '../components/study/StudyLog';
import ActivityHeatmap from '../components/dashboard/ActivityHeatmap';
import styles from './DashboardPage.module.css';

const DailyEntryPage = () => {
    return (
        <div className={styles.container}>
            <motion.div
                className={styles.mainGrid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Single column layout for Daily Entry to ensure visibility */}
                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '3rem' }}>

                    {/* Section 1: Habits */}
                    <section>
                        <h1 style={{ marginBottom: '1.5rem', fontSize: '2rem', fontWeight: 'bold' }}>Daily Entry</h1>
                        <HabitTracker />
                    </section>

                    {/* Section 2: Activity Heatmap - Updates in real-time with checkbox changes */}
                    <section style={{ paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                        <ActivityHeatmap />
                    </section>

                    {/* Section 3: Study Log - Explicitly placed below */}
                    <section style={{ paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>Study Session Log</h2>
                        <StudyLog />
                    </section>
                </div>
            </motion.div>
        </div>
    );
};

export default DailyEntryPage;
