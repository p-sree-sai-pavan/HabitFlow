import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { Share2, Download, Copy, Check } from 'lucide-react';
import { useHabitFlow } from '../../context/HabitFlowContext';
import { PROGRESS_LEVELS, HABIT_NAME_TRUNCATE_LENGTH } from '../../utils/constants';
import styles from './ShareableProgress.module.css';

const ShareableProgress = () => {
    const { habits, shareableProgress, setShareableProgress } = useHabitFlow();
    const chartRef = useRef(null);
    const [copied, setCopied] = useState(false);

    // Use context-based progress state (synced to Firestore)
    const taskProgress = useMemo(() => shareableProgress || {}, [shareableProgress]);

    // Memoize the update function to avoid stale closures
    const initializeMissingProgress = useCallback(() => {
        if (habits.length > 0) {
            const needsUpdate = habits.some(h => taskProgress[h.id] === undefined);
            if (needsUpdate) {
                const updated = { ...taskProgress };
                habits.forEach(h => {
                    if (updated[h.id] === undefined) {
                        updated[h.id] = 0;
                    }
                });
                setShareableProgress(updated);
            }
        }
    }, [habits, taskProgress, setShareableProgress]);

    // Initialize missing habits with 0% progress
    useEffect(() => {
        initializeMissingProgress();
    }, [initializeMissingProgress]);

    // Update progress when a checkbox is clicked
    const handleProgressChange = (habitId, level) => {
        setShareableProgress(prev => ({
            ...prev,
            [habitId]: level
        }));
    };


    // Calculate average progress - FIXED: Handle division by zero
    const averageProgress = habits.length > 0
        ? Math.round(Object.values(taskProgress).reduce((sum, val) => sum + val, 0) / habits.length)
        : 0;

    // Chart data - updates in real-time with checkbox changes
    const chartData = {
        labels: habits.map(h => h.name.length > 15 ? h.name.substring(0, 15) + '...' : h.name),
        datasets: [{
            label: 'Progress %',
            data: habits.map(h => taskProgress[h.id] || 0),
            backgroundColor: habits.map(h => {
                const progress = taskProgress[h.id] || 0;
                if (progress === 100) return 'rgba(16, 185, 129, 0.8)'; // Green
                if (progress >= 75) return 'rgba(6, 182, 212, 0.8)'; // Cyan
                if (progress >= 50) return 'rgba(168, 85, 247, 0.8)'; // Purple
                if (progress >= 25) return 'rgba(251, 191, 36, 0.8)'; // Yellow
                return 'rgba(239, 68, 68, 0.8)'; // Red
            }),
            borderRadius: 8,
            borderSkipped: false,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgba(168, 85, 247, 0.5)',
                borderWidth: 1,
                cornerRadius: 8,
                padding: 12,
            }
        },
        scales: {
            x: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: 'rgba(255,255,255,0.6)' },
                min: 0,
                max: 100,
            },
            y: {
                grid: { display: false },
                ticks: {
                    color: 'rgba(255,255,255,0.8)',
                    font: { size: 12, weight: '500' }
                }
            }
        }
    };

    // Generate shareable text
    const generateShareText = () => {
        let text = `📊 My HabitFlow Progress Report\n\n`;
        text += `🎯 Overall: ${averageProgress}%\n\n`;
        habits.forEach(habit => {
            const progress = taskProgress[habit.id] || 0;
            const bar = '█'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10));
            text += `${habit.name}: ${bar} ${progress}%\n`;
        });
        text += `\n📅 ${new Date().toLocaleDateString()}`;
        return text;
    };

    // Copy to clipboard with error handling
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(generateShareText());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
            alert('Failed to copy to clipboard. Please try again.');
        }
    };

    // Share using Web Share API
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My HabitFlow Progress',
                    text: generateShareText(),
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            handleCopy();
        }
    };

    // Download chart as image
    const handleDownload = () => {
        const canvas = chartRef.current?.canvas;
        if (canvas) {
            const link = document.createElement('a');
            link.download = 'habitflow-progress.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h2>📤 Share Your Progress</h2>
                    <p className={styles.subtitle}>
                        Set your progress for each task using checkboxes • Overall: <strong>{averageProgress}%</strong>
                    </p>
                </div>
                <div className={styles.actions}>
                    <motion.button
                        className={styles.actionBtn}
                        onClick={handleCopy}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                        {copied ? 'Copied!' : 'Copy'}
                    </motion.button>
                    <motion.button
                        className={styles.actionBtn}
                        onClick={handleDownload}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Download size={18} />
                        Download
                    </motion.button>
                    <motion.button
                        className={`${styles.actionBtn} ${styles.shareBtn}`}
                        onClick={handleShare}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Share2 size={18} />
                        Share
                    </motion.button>
                </div>
            </header>

            {/* Main Content Grid - Chart and Table side by side */}
            <div className={styles.contentGrid}>
                {/* Live Progress Chart */}
                <motion.div
                    className={styles.chartCard}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h3>📊 Live Progress</h3>
                    <div className={styles.chartContainer}>
                        <Bar ref={chartRef} data={chartData} options={chartOptions} />
                    </div>
                </motion.div>

                {/* Progress Table with Checkboxes */}
                <motion.div
                    className={styles.tableCard}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h3>✅ Set Progress</h3>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.taskHeader}>Task</th>
                                    {PROGRESS_LEVELS.map(level => (
                                        <th key={level} className={styles.levelHeader}>{level}%</th>
                                    ))}
                                    <th className={styles.currentHeader}>Done</th>
                                </tr>
                            </thead>
                            <tbody>
                                {habits.map((habit, index) => (
                                    <motion.tr
                                        key={habit.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                    >
                                        <td className={styles.taskName}>
                                            <span className={styles.categoryDot} style={{
                                                background: habit.color || '#a855f7'
                                            }}></span>
                                            {habit.name.length > 18 ? habit.name.substring(0, 18) + '...' : habit.name}
                                        </td>
                                        {PROGRESS_LEVELS.map(level => (
                                            <td key={level} className={styles.checkboxCell}>
                                                <input
                                                    type="checkbox"
                                                    checked={taskProgress[habit.id] === level}
                                                    onChange={() => handleProgressChange(habit.id, level)}
                                                    className={styles.progressCheckbox}
                                                    style={{
                                                        accentColor: level === 100 ? '#10b981' :
                                                            level === 75 ? '#06b6d4' :
                                                                level === 50 ? '#a855f7' :
                                                                    level === 25 ? '#fbbf24' :
                                                                        '#ef4444'
                                                    }}
                                                />
                                            </td>
                                        ))}
                                        <td className={styles.currentProgress}>
                                            <div className={styles.progressBadge} style={{
                                                background: taskProgress[habit.id] === 100 ? 'rgba(16, 185, 129, 0.2)' :
                                                    taskProgress[habit.id] >= 75 ? 'rgba(6, 182, 212, 0.2)' :
                                                        taskProgress[habit.id] >= 50 ? 'rgba(168, 85, 247, 0.2)' :
                                                            taskProgress[habit.id] >= 25 ? 'rgba(251, 191, 36, 0.2)' :
                                                                'rgba(239, 68, 68, 0.2)',
                                                color: taskProgress[habit.id] === 100 ? '#10b981' :
                                                    taskProgress[habit.id] >= 75 ? '#06b6d4' :
                                                        taskProgress[habit.id] >= 50 ? '#a855f7' :
                                                            taskProgress[habit.id] >= 25 ? '#fbbf24' :
                                                                '#ef4444'
                                            }}>
                                                {taskProgress[habit.id] || 0}%
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            {/* Preview Card - Compact */}
            <motion.div
                className={styles.previewCard}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h3>👁️ Share Preview</h3>
                <pre className={styles.previewText}>{generateShareText()}</pre>
            </motion.div>
        </div>
    );
};

export default ShareableProgress;
