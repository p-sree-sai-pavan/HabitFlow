import React, { useMemo, useCallback } from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useHabitFlow } from '../../context/HabitFlowContext';
import MonthYearSelector from '../common/MonthYearSelector';
import styles from './Dashboard.module.css';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
};

const itemVariants = {
    hidden: { y: 40, opacity: 0, scale: 0.95 },
    visible: {
        y: 0,
        opacity: 1,
        scale: 1,
        transition: { type: "spring", stiffness: 100, damping: 12 }
    }
};

const Dashboard = () => {
    const {
        settings,
        getDailyCompletionTrend,
        getGlobalStats,
        getFocusDistribution,
        getTopHabits,
        getDaysInCurrentMonth,
        gamification,
        habitHistory,
        habits,
        studyLogs
    } = useHabitFlow();

    // Memoize expensive calculations - include the getter functions as they depend on context state
    const days = useMemo(() => getDaysInCurrentMonth(), [getDaysInCurrentMonth]);
    const dailyTrend = useMemo(() => getDailyCompletionTrend(), [getDailyCompletionTrend]);
    const globalStats = useMemo(() => getGlobalStats(), [getGlobalStats]);
    const focusStats = useMemo(() => getFocusDistribution(), [getFocusDistribution]);
    const topHabits = useMemo(() => getTopHabits(), [getTopHabits]);

    // Theme-aware colors for charts
    const isDarkMode = settings.theme === 'dark';
    const gridColor = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)';
    const tickColor = isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.6)';
    const emptyColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

    // Chart data using REAL values
    const lineData = useMemo(() => ({
        labels: days.map(d => format(d, 'MMM d')),
        datasets: [{
            label: 'Daily Completion %',
            data: dailyTrend,
            fill: true,
            borderColor: '#a855f7',
            backgroundColor: 'rgba(168, 85, 247, 0.15)',
            tension: 0.4,
            pointBackgroundColor: '#a855f7',
            pointBorderColor: isDarkMode ? '#fff' : '#1a1a1a',
            pointBorderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 6,
        }]
    }), [days, dailyTrend, isDarkMode]);

    const donutData = useMemo(() => ({
        labels: ['Completed', 'Remaining'],
        datasets: [{
            data: [globalStats.completed, Math.max(0, globalStats.goal - globalStats.completed)],
            backgroundColor: ['#a855f7', emptyColor],
            borderWidth: 0,
            borderRadius: 5,
        }]
    }), [globalStats, emptyColor]);

    const focusData = useMemo(() => ({
        labels: Object.keys(focusStats),
        datasets: [{
            label: 'Hours',
            data: Object.values(focusStats),
            backgroundColor: ['#3b82f6', '#ec4899', '#f97316', '#10b981', '#06b6d4'],
            borderRadius: 8,
            borderSkipped: false,
        }]
    }), [focusStats]);

    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: {
                grid: { color: gridColor },
                ticks: { color: tickColor, maxTicksLimit: 10 }
            },
            y: {
                grid: { color: gridColor },
                ticks: { color: tickColor },
                min: 0,
                max: 100
            }
        }
    }), [gridColor, tickColor]);

    return (
        <motion.div
            className={styles.dashboard}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
        >
            <header className={styles.header}>
                <motion.h1 variants={itemVariants}>Dashboard</motion.h1>
                <motion.div variants={itemVariants}>
                    <MonthYearSelector />
                </motion.div>
            </header>

            {/* Stats Summary */}
            <motion.div variants={itemVariants} className={styles.statsRow}>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{globalStats.completed}</span>
                    <span className={styles.statLabel}>Completed</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>
                        {Math.max(0, globalStats.goal - globalStats.completed)}
                    </span>
                    <span className={styles.statLabel}>Remaining</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{gamification.xp}</span>
                    <span className={styles.statLabel}>Total XP</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{gamification.streak}</span>
                    <span className={styles.statLabel}>Day Streak</span>
                </div>
            </motion.div>

            <div className={styles.grid}>
                <motion.div
                    variants={itemVariants}
                    className={`${styles.card} ${styles.dailyProgress}`}
                    whileHover={{ scale: 1.01 }}
                >
                    <h3>📈 Daily Progress Trend</h3>
                    <div className={styles.chartContainer}>
                        <Line data={lineData} options={chartOptions} />
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className={`${styles.card} ${styles.globalProgress}`}
                    whileHover={{ scale: 1.01 }}
                >
                    <h3>🎯 Monthly Progress</h3>
                    <div className={styles.donutContainer}>
                        <Doughnut data={donutData} options={{ cutout: '75%', plugins: { legend: { display: false } } }} />
                        <div className={styles.donutLabel}>
                            <motion.span
                                className={styles.percentage}
                                key={globalStats.percentage}
                                initial={{ scale: 0.5 }}
                                animate={{ scale: 1 }}
                            >
                                {globalStats.percentage}%
                            </motion.span>
                            <span className={styles.label}>{globalStats.completed}/{globalStats.goal}</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className={`${styles.card} ${styles.focusDist}`}
                    whileHover={{ scale: 1.01 }}
                >
                    <h3>⚡ Study Hours by Category</h3>
                    <div className={styles.chartContainer}>
                        <Bar data={focusData} options={{ ...chartOptions, scales: { ...chartOptions.scales, y: { ...chartOptions.scales.y, max: undefined } } }} />
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className={`${styles.card} ${styles.topHabits}`}
                    whileHover={{ scale: 1.01 }}
                >
                    <h3>🏆 Top Habits</h3>
                    <ul className={styles.habitList}>
                        {topHabits.slice(0, 5).map((habit, index) => (
                            <motion.li
                                key={habit.id}
                                className={styles.habitItem}
                                initial={{ x: -20, opacity: 0 }}
                                whileInView={{ x: 0, opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ x: 10 }}
                            >
                                <span>
                                    <span className={styles.rank}>#{index + 1}</span> {habit.name}
                                </span>
                                <span className={styles.habitGoal}>{habit.percentage}%</span>
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
