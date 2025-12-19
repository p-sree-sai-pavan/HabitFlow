import React, { useMemo } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Clock, Target, Award, BarChart3 } from 'lucide-react';
import { useHabitFlow } from '../../context/HabitFlowContext';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks, parseISO, differenceInDays } from 'date-fns';
import styles from './Analytics.module.css';

const Analytics = () => {
    const { habits, habitHistory, studyLogs, settings, getDaysInCurrentMonth } = useHabitFlow();

    const analytics = useMemo(() => {
        const now = new Date();
        const currentWeek = { start: startOfWeek(now), end: endOfWeek(now) };
        const lastWeek = { start: startOfWeek(subWeeks(now, 1)), end: endOfWeek(subWeeks(now, 1)) };

        const weeklyCompletion = (week) => {
            const days = eachDayOfInterval({ start: week.start, end: week.end });
            return days.reduce((acc, day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayData = habitHistory[dateStr] || {};
                // FIXED: Properly check completion status
                const completed = Object.values(dayData).filter(entry =>
                    entry && (typeof entry === 'object' ? entry.completed : !!entry)
                ).length;
                return acc + completed;
            }, 0);
        };

        const currentWeekCompletions = weeklyCompletion(currentWeek);
        const lastWeekCompletions = weeklyCompletion(lastWeek);
        const weeklyChange = lastWeekCompletions > 0
            ? ((currentWeekCompletions - lastWeekCompletions) / lastWeekCompletions * 100).toFixed(1)
            : currentWeekCompletions > 0 ? 100 : 0;

        const totalStudyHours = studyLogs.reduce((acc, log) => acc + (log.hours || 0), 0);

        // Sort study logs by date to find the actual first/oldest entry
        const sortedLogs = [...studyLogs].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // FIXED: Handle division by zero when no study logs or same day
        let avgStudyHoursPerDay = 0;
        if (sortedLogs.length > 0 && sortedLogs[0]?.date) {
            const daysDiff = differenceInDays(now, parseISO(sortedLogs[0].date));
            if (daysDiff > 0) {
                avgStudyHoursPerDay = totalStudyHours / daysDiff;
            } else if (daysDiff === 0 && totalStudyHours > 0) {
                avgStudyHoursPerDay = totalStudyHours; // Same day = total hours
            }
        }

        // FIXED: Build category hours directly from studyLogs, not habits
        // This ensures all logged categories are shown, not just those with matching habits
        const categoryHours = studyLogs.reduce((acc, log) => {
            const category = log.category || 'Other';
            acc[category] = (acc[category] || 0) + (log.hours || 0);
            return acc;
        }, {});

        // FIXED: Handle case when no study logs exist - use sorted logs for accurate date
        const daysSinceStart = (sortedLogs.length > 0 && sortedLogs[0]?.date)
            ? Math.max(1, differenceInDays(now, parseISO(sortedLogs[0].date)))
            : 0;

        const habitCompletionRates = habits.map(habit => {
            const days = getDaysInCurrentMonth();
            const completed = days.filter(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const entry = habitHistory[dateStr]?.[habit.id];
                // FIXED: Properly check completion status
                return entry && (typeof entry === 'object' ? entry.completed : !!entry);
            }).length;
            return {
                name: habit.name,
                rate: days.length > 0 ? (completed / days.length * 100) : 0
            };
        });

        const dailyActivity = [];
        const last30Days = eachDayOfInterval({ start: subWeeks(now, 4), end: now });
        last30Days.forEach(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayData = habitHistory[dateStr] || {};
            // FIXED: Properly check completion status
            const completed = Object.values(dayData).filter(entry =>
                entry && (typeof entry === 'object' ? entry.completed : !!entry)
            ).length;
            const studyHours = studyLogs
                .filter(log => log.date === dateStr)
                .reduce((sum, log) => sum + (log.hours || 0), 0);
            dailyActivity.push({
                date: dateStr,
                habits: completed,
                study: studyHours
            });
        });

        return {
            weeklyChange: parseFloat(weeklyChange),
            currentWeekCompletions,
            totalStudyHours: totalStudyHours.toFixed(1),
            avgStudyHoursPerDay: avgStudyHoursPerDay.toFixed(2),
            categoryHours,
            daysSinceStart,
            habitCompletionRates,
            dailyActivity
        };
    }, [habits, habitHistory, studyLogs, getDaysInCurrentMonth]);

    const weeklyTrendData = {
        labels: analytics.dailyActivity.slice(-7).map(d => format(parseISO(d.date), 'EEE')),
        datasets: [
            {
                label: 'Habits Completed',
                data: analytics.dailyActivity.slice(-7).map(d => d.habits),
                borderColor: '#a855f7',
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                tension: 0.4,
            },
            {
                label: 'Study Hours',
                data: analytics.dailyActivity.slice(-7).map(d => d.study),
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                tension: 0.4,
                yAxisID: 'y1',
            }
        ]
    };

    const habitRateData = {
        labels: analytics.habitCompletionRates.map(h => h.name.split(' ')[0]),
        datasets: [{
            label: 'Completion Rate %',
            data: analytics.habitCompletionRates.map(h => h.rate),
            backgroundColor: 'rgba(168, 85, 247, 0.6)',
            borderColor: '#a855f7',
            borderWidth: 2,
        }]
    };

    const categoryData = {
        labels: Object.keys(analytics.categoryHours),
        datasets: [{
            data: Object.values(analytics.categoryHours),
            backgroundColor: [
                'rgba(59, 130, 246, 0.7)', // Blue
                'rgba(236, 72, 153, 0.7)', // Pink
                'rgba(249, 115, 22, 0.7)', // Orange
                'rgba(6, 182, 212, 0.7)', // Cyan
                'rgba(16, 185, 129, 0.7)', // Emerald
            ],
            borderColor: [
                '#3b82f6',
                '#ec4899',
                '#f97316',
                '#06b6d4',
                '#10b981',
            ],
            borderWidth: 1,
        }]
    };

    const isDark = settings.theme === 'dark';
    const textColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)';
    const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: true, labels: { color: textColor } },
            tooltip: {
                backgroundColor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)',
                titleColor: isDark ? '#fff' : '#000',
                bodyColor: isDark ? '#ccc' : '#333',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                borderWidth: 1,
            }
        },
        scales: {
            y: {
                grid: { color: gridColor },
                ticks: { color: textColor },
            },
            x: {
                grid: { color: gridColor },
                ticks: { color: textColor },
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: { drawOnChartArea: false },
                ticks: { color: textColor },
            }
        }
    };

    return (
        <motion.div
            className={styles.container}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <header className={styles.header}>
                <h2><BarChart3 size={24} /> Advanced Analytics</h2>
                <p className={styles.subtitle}>Detailed insights into your productivity</p>
            </header>

            <div className={styles.statsGrid}>
                <motion.div
                    className={styles.statCard}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <TrendingUp size={24} />
                    <div className={styles.statValue}>
                        {analytics.weeklyChange >= 0 ? '+' : ''}{analytics.weeklyChange}%
                    </div>
                    <div className={styles.statLabel}>Weekly Change</div>
                </motion.div>

                <motion.div
                    className={styles.statCard}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Target size={24} />
                    <div className={styles.statValue}>{analytics.currentWeekCompletions}</div>
                    <div className={styles.statLabel}>This Week</div>
                </motion.div>

                <motion.div
                    className={styles.statCard}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <Clock size={24} />
                    <div className={styles.statValue}>{analytics.totalStudyHours}h</div>
                    <div className={styles.statLabel}>Total Study Time</div>
                </motion.div>

                <motion.div
                    className={styles.statCard}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <Calendar size={24} />
                    <div className={styles.statValue}>{analytics.daysSinceStart}</div>
                    <div className={styles.statLabel}>Days Active</div>
                </motion.div>
            </div>

            <div className={styles.chartsGrid}>
                <motion.div
                    className={styles.chartCard}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <h3>📈 Weekly Activity Trend</h3>
                    <div className={styles.chartContainer}>
                        <Line data={weeklyTrendData} options={chartOptions} />
                    </div>
                </motion.div>

                <motion.div
                    className={styles.chartCard}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <h3>🎯 Habit Completion Rates</h3>
                    <div className={styles.chartContainer}>
                        <Bar data={habitRateData} options={chartOptions} />
                    </div>
                </motion.div>

                <motion.div
                    className={styles.chartCard}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    <h3>⚡ Study Hours by Category</h3>
                    <div className={styles.chartContainer}>
                        <Doughnut data={categoryData} options={{ ...chartOptions, maintainAspectRatio: true }} />
                    </div>
                </motion.div>
            </div>

            <motion.div
                className={styles.insightsCard}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
            >
                <h3>💡 Key Insights</h3>
                <ul className={styles.insightsList}>
                    <li>
                        <Award size={18} />
                        <div>
                            <strong>Your best performing habit:</strong>{' '}
                            {analytics.habitCompletionRates.length > 0
                                ? analytics.habitCompletionRates.reduce((best, current) =>
                                    current.rate > best.rate ? current : best
                                ).name
                                : 'N/A'}
                        </div>
                    </li>
                    <li>
                        <TrendingUp size={18} />
                        <div>
                            <strong>Average study hours per day:</strong> {analytics.avgStudyHoursPerDay}h
                        </div>
                    </li>
                    <li>
                        <Target size={18} />
                        <div>
                            <strong>Most focused category:</strong>{' '}
                            {Object.keys(analytics.categoryHours).length > 0
                                ? Object.entries(analytics.categoryHours).reduce((max, [cat, hours]) =>
                                    hours > max[1] ? [cat, hours] : max
                                )[0]
                                : 'N/A'}
                        </div>
                    </li>
                </ul>
            </motion.div>
        </motion.div>
    );
};

export default Analytics;


