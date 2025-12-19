import React from 'react';
import { motion } from 'framer-motion';
import { Archive, TrendingUp, RotateCcw, Trash2, Calendar, CheckCircle } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { format, parseISO, eachDayOfInterval, subDays } from 'date-fns';
import { useHabitFlow } from '../../context/HabitFlowContext';
import styles from './SettingsComponents.module.css';

const TaskArchive = () => {
    const {
        archivedHabits = [],
        completedHabits = [],
        habitHistory,
        restoreHabit,
        deleteArchivedHabit,
        restoreCompletedHabit,
        deleteCompletedHabit
    } = useHabitFlow();

    // Calculate trends for habits
    const getHabitTrend = (habitId) => {
        const last30Days = eachDayOfInterval({
            start: subDays(new Date(), 29),
            end: new Date()
        });

        return last30Days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            return habitHistory[dateStr]?.[habitId] ? 1 : 0;
        });
    };

    const getHabitStats = (habitId) => {
        const allDates = Object.keys(habitHistory).sort();
        let totalCompletions = 0;
        let longestStreak = 0;
        let tempStreak = 0;

        allDates.forEach(dateStr => {
            if (habitHistory[dateStr]?.[habitId]) {
                totalCompletions++;
                tempStreak++;
                longestStreak = Math.max(longestStreak, tempStreak);
            } else {
                tempStreak = 0;
            }
        });

        return { totalCompletions, longestStreak };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
            y: {
                display: false,
                min: 0,
                max: 1.2
            },
            x: {
                display: false
            }
        },
        elements: {
            point: { radius: 0 },
            line: { tension: 0.4 }
        }
    };

    const handleRestoreCompleted = (habitId) => {
        if (confirm('Restore this habit to your active habits?')) {
            if (typeof restoreCompletedHabit === 'function') {
                restoreCompletedHabit(habitId);
            }
        }
    };

    const handleDeleteCompleted = (habitId) => {
        if (confirm('Permanently delete this completed habit and all its history?')) {
            if (typeof deleteCompletedHabit === 'function') {
                deleteCompletedHabit(habitId);
            }
        }
    };

    const handleRestore = (habitId) => {
        if (confirm('Restore this habit to your active habits?')) {
            if (typeof restoreHabit === 'function') {
                restoreHabit(habitId);
            }
        }
    };

    const handleDelete = (habitId) => {
        if (confirm('Permanently delete this archived habit and all its history?')) {
            if (typeof deleteArchivedHabit === 'function') {
                deleteArchivedHabit(habitId);
            }
        }
    };

    const renderHabitCard = (habit, index, isCompleted = false) => {
        const trendData = getHabitTrend(habit.id);
        const stats = getHabitStats(habit.id);

        const chartData = {
            labels: trendData.map((_, i) => i),
            datasets: [{
                data: trendData,
                borderColor: isCompleted ? '#10b981' : '#a855f7',
                backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(168, 85, 247, 0.1)',
                fill: true,
            }]
        };

        const dateLabel = isCompleted
            ? (habit.completedAt ? format(parseISO(habit.completedAt), 'MMM d, yyyy') : 'Unknown')
            : (habit.archivedAt ? format(parseISO(habit.archivedAt), 'MMM d, yyyy') : 'Unknown');

        return (
            <motion.div
                key={habit.id}
                className={styles.archiveCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
            >
                <div className={styles.archiveHeader}>
                    <div className={styles.archiveInfo}>
                        <h4>{habit.name}</h4>
                        <span className={styles.archiveMeta}>
                            {habit.category} • {isCompleted ? 'Completed' : 'Archived'}: {dateLabel}
                        </span>
                    </div>
                    <div className={styles.archiveActions}>
                        <button
                            onClick={() => isCompleted ? handleRestoreCompleted(habit.id) : handleRestore(habit.id)}
                            className={styles.restoreBtn}
                            title="Restore habit"
                        >
                            <RotateCcw size={16} />
                        </button>
                        <button
                            onClick={() => isCompleted ? handleDeleteCompleted(habit.id) : handleDelete(habit.id)}
                            className={styles.deleteBtn}
                            title="Delete permanently"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                <div className={styles.archiveStats}>
                    <div className={styles.archiveStat}>
                        <span className={styles.statNum}>{stats.totalCompletions}</span>
                        <span className={styles.statLabel}>Total Completions</span>
                    </div>
                    <div className={styles.archiveStat}>
                        <span className={styles.statNum}>{stats.longestStreak}</span>
                        <span className={styles.statLabel}>Best Streak</span>
                    </div>
                </div>

                <div className={styles.trendChart}>
                    <div className={styles.trendLabel}>
                        <TrendingUp size={14} />
                        <span>Last 30 Days</span>
                    </div>
                    <div className={styles.miniChart}>
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className={styles.section}>
            {/* Completed Habits Section */}
            <div className={styles.sectionHeader}>
                <CheckCircle size={24} style={{ color: '#10b981' }} />
                <div>
                    <h2>Completed Habits</h2>
                    <p>Habits you've marked as done</p>
                </div>
            </div>

            {completedHabits.length === 0 ? (
                <div className={styles.emptyState}>
                    <CheckCircle size={48} />
                    <h3>No Completed Habits</h3>
                    <p>When you mark habits as "done" from the habit management section, they'll appear here.</p>
                </div>
            ) : (
                <div className={styles.archiveList}>
                    {completedHabits.map((habit, index) => renderHabitCard(habit, index, true))}
                </div>
            )}

            {/* Archived Habits Section */}
            <div className={styles.sectionHeader} style={{ borderTop: '1px solid var(--border)' }}>
                <Archive size={24} />
                <div>
                    <h2>Archived Habits</h2>
                    <p>Habits you've paused or removed</p>
                </div>
            </div>

            {archivedHabits.length === 0 ? (
                <div className={styles.emptyState}>
                    <Archive size={48} />
                    <h3>No Archived Habits</h3>
                    <p>When you archive habits from the "Add / Remove Habits" section, they'll appear here with their historical trends preserved.</p>
                </div>
            ) : (
                <div className={styles.archiveList}>
                    {archivedHabits.map((habit, index) => renderHabitCard(habit, index, false))}
                </div>
            )}

            <div className={styles.infoCard}>
                <Calendar size={18} />
                <p>
                    Completed and archived habits preserve all historical data. You can restore them at any time
                    and continue tracking from where you left off.
                </p>
            </div>
        </div>
    );
};

export default TaskArchive;
