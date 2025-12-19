import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Target, Flame, Trophy, ArrowRight, Clock, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHabitFlow } from '../context/HabitFlowContext';
import { useAuth } from '../context/AuthContext';
import ActivityHeatmap from '../components/dashboard/ActivityHeatmap';
import styles from './HomePage.module.css';

// Motivational quotes
const motivationalQuotes = [
    { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
    { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "It's not about perfect. It's about effort.", author: "Jillian Michaels" },
    { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
    { text: "One day or day one. You decide.", author: "Unknown" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Consistency is what transforms average into excellence.", author: "Unknown" },
    { text: "Progress, not perfection.", author: "Unknown" },
    { text: "Your goals don't care how you feel.", author: "Unknown" }
];

const HomePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { gamification, getGlobalStats, studyLogs, habits } = useHabitFlow();
    const globalStats = getGlobalStats();

    const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
    const totalStudyHours = studyLogs.reduce((acc, log) => acc + (log.hours || 0), 0);

    // Select quote of the day based on current date
    const [quote] = useState(() => {
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
        const index = dayOfYear % motivationalQuotes.length;
        return motivationalQuotes[index];
    });

    const quickActions = [
        { icon: Target, label: 'Daily Entry', path: '/entry', color: '#a855f7' },
        { icon: Zap, label: 'Dashboard', path: '/dashboard', color: '#3b82f6' },
        { icon: Trophy, label: 'Analytics', path: '/analytics', color: '#f97316' },
    ];

    const stats = [
        { icon: Flame, value: gamification.streak, label: 'Day Streak', color: '#ef4444' },
        { icon: Trophy, value: gamification.level, label: 'Level', color: '#a855f7' },
        { icon: Zap, value: gamification.xp, label: 'Total XP', color: '#fbbf24' },
        { icon: Target, value: `${globalStats.percentage}%`, label: 'This Month', color: '#10b981' },
    ];

    return (
        <div className={styles.container}>
            <motion.div
                className={styles.hero}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <motion.div
                    className={styles.greeting}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <span className={styles.welcome}>Welcome,</span>
                    <h1 className={styles.name}>{displayName}</h1>
                </motion.div>

                <motion.div
                    className={styles.levelBadge}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.3 }}
                >
                    <span className={styles.levelNum}>Lvl {gamification.level}</span>
                    <span className={styles.xpText}>{gamification.xp} XP</span>
                </motion.div>
            </motion.div>

            <motion.div
                className={styles.statsGrid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        className={styles.statCard}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                    >
                        <stat.icon size={24} style={{ color: stat.color }} />
                        <span className={styles.statValue}>{stat.value}</span>
                        <span className={styles.statLabel}>{stat.label}</span>
                    </motion.div>
                ))}
            </motion.div>

            {/* Activity Heatmap Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <ActivityHeatmap />
            </motion.div>

            <motion.div
                className={styles.quickActions}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <h2 className={styles.sectionTitle}>Quick Actions</h2>
                <div className={styles.actionsGrid}>
                    {quickActions.map((action, index) => (
                        <motion.button
                            key={action.label}
                            className={styles.actionCard}
                            onClick={() => navigate(action.path)}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + index * 0.1 }}
                            whileHover={{ scale: 1.02, x: 10 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className={styles.actionIcon} style={{ background: `${action.color}20` }}>
                                <action.icon size={24} style={{ color: action.color }} />
                            </div>
                            <span className={styles.actionLabel}>{action.label}</span>
                            <ArrowRight size={18} className={styles.actionArrow} />
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            <motion.div
                className={styles.summaryCards}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
            >
                <div className={styles.summaryCard}>
                    <div className={styles.summaryIcon}>
                        <Calendar size={20} />
                    </div>
                    <div className={styles.summaryContent}>
                        <span className={styles.summaryValue}>{habits.length}</span>
                        <span className={styles.summaryLabel}>Active Habits</span>
                    </div>
                </div>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryIcon}>
                        <Clock size={20} />
                    </div>
                    <div className={styles.summaryContent}>
                        <span className={styles.summaryValue}>{totalStudyHours.toFixed(1)}h</span>
                        <span className={styles.summaryLabel}>Total Study Time</span>
                    </div>
                </div>
            </motion.div>

            {/* Empty State / "Get Started" */}
            {habits.length === 0 && (
                <motion.div
                    className={styles.emptyState}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className={styles.emptyContent}>
                        <h3>Ready to start your journey?</h3>
                        <p>You haven't tracked any habits yet. Create your first one to see your dashboard come alive!</p>
                        <button onClick={() => navigate('/dashboard')} className={styles.startBtn}>
                            Create First Habit <ArrowRight size={16} />
                        </button>
                    </div>
                </motion.div>
            )}

            <motion.div
                className={styles.motivationCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
            >
                <div className={styles.quoteIcon}>💡</div>
                <p className={styles.quote}>
                    "{quote.text}"
                </p>
                <span className={styles.quoteAuthor}>— {quote.author}</span>
            </motion.div>
        </div>
    );
};

export default HomePage;
