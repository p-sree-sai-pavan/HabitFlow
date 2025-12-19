import React from 'react';
import { BarChart3, Trophy, Flame, Target, Zap } from 'lucide-react';
import { useHabitFlow } from '../../context/HabitFlowContext';
import styles from './SettingsComponents.module.css';

const ProgressSettings = () => {
    const { habits, gamification, studyLogs, getGlobalStats } = useHabitFlow();
    const globalStats = getGlobalStats();
    const totalStudyHours = studyLogs.reduce((acc, log) => acc + (log.hours || 0), 0);

    const stats = [
        { icon: Trophy, label: 'Current Level', value: gamification.level, color: '#a855f7' },
        { icon: Zap, label: 'Total XP', value: gamification.xp, color: '#fbbf24' },
        { icon: Flame, label: 'Current Streak', value: `${gamification.streak} days`, color: '#ef4444' },
        { icon: Target, label: 'This Month', value: `${globalStats.percentage}%`, color: '#10b981' },
    ];

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <BarChart3 size={24} />
                <div>
                    <h2>Progress Summary</h2>
                    <p>Your overall statistics and achievements</p>
                </div>
            </div>

            <div className={styles.statsGrid}>
                {stats.map((stat) => (
                    <div key={stat.label} className={styles.statCard}>
                        <stat.icon size={24} style={{ color: stat.color }} />
                        <span className={styles.statValue}>{stat.value}</span>
                        <span className={styles.statLabel}>{stat.label}</span>
                    </div>
                ))}
            </div>

            <div className={styles.summaryList}>
                <div className={styles.summaryItem}>
                    <span>Active Habits</span>
                    <strong>{habits.length}</strong>
                </div>
                <div className={styles.summaryItem}>
                    <span>Total Study Logs</span>
                    <strong>{studyLogs.length}</strong>
                </div>
                <div className={styles.summaryItem}>
                    <span>Total Study Hours</span>
                    <strong>{totalStudyHours.toFixed(1)}h</strong>
                </div>
                <div className={styles.summaryItem}>
                    <span>Badges Earned</span>
                    <strong>{gamification.badges.length}</strong>
                </div>
            </div>
        </div>
    );
};

export default ProgressSettings;
