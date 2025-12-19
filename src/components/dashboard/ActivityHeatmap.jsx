import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, eachDayOfInterval, getDay, subYears } from 'date-fns';
import { useHabitFlow } from '../../context/HabitFlowContext';
import styles from './ActivityHeatmap.module.css';

const ActivityHeatmap = () => {
    const { habitHistory, habits, studyLogs } = useHabitFlow();

    const heatmapData = useMemo(() => {
        const today = new Date();
        const yearAgo = subYears(today, 1);
        const days = eachDayOfInterval({ start: yearAgo, end: today });

        return days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayHabits = habitHistory[dateStr] || {};

            // Count absolute completions (like GitHub counts commits)
            const habitsCompleted = Object.values(dayHabits).filter(entry =>
                entry && (typeof entry === 'object' ? entry.completed : !!entry)
            ).length;

            const dayStudyLogs = studyLogs.filter(log => log.date === dateStr);
            const studyHours = dayStudyLogs.reduce((acc, log) => acc + (log.hours || 0), 0);

            // Calculate activity level (0-4) using ABSOLUTE counts, not ratios
            // This is like GitHub's contribution graph - based on activity count
            // 0 = no activity
            // 1 = light (1 habit OR any study)
            // 2 = medium (2-3 habits OR 1-2 hours study)
            // 3 = good (4+ habits OR 3+ hours study)
            // 4 = excellent (5+ habits AND/OR 4+ hours study)

            const totalActivity = habitsCompleted + Math.floor(studyHours);

            let level = 0;
            if (totalActivity >= 1) level = 1;
            if (totalActivity >= 2) level = 2;
            if (totalActivity >= 4) level = 3;
            if (totalActivity >= 6) level = 4;

            return {
                date: day,
                dateStr,
                level,
                habitsCompleted,
                studyHours,
                weekDay: getDay(day)
            };
        });
    }, [habitHistory, habits, studyLogs]);

    // Group by weeks for grid layout
    const weeks = useMemo(() => {
        const result = [];
        let currentWeek = [];

        heatmapData.forEach((day, index) => {
            if (index === 0) {
                // Pad start of first week
                for (let i = 0; i < day.weekDay; i++) {
                    currentWeek.push(null);
                }
            }
            currentWeek.push(day);
            if (day.weekDay === 6) {
                result.push(currentWeek);
                currentWeek = [];
            }
        });

        if (currentWeek.length > 0) {
            result.push(currentWeek);
        }

        return result;
    }, [heatmapData]);

    const scrollRef = React.useRef(null);
    const [selectedDay, setSelectedDay] = React.useState(null);

    // Auto-scroll to end (latest data) on mount
    React.useLayoutEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        }
    }, [heatmapData]);

    // FIXED: Update selectedDay when habitHistory changes to show current data
    React.useEffect(() => {
        if (selectedDay) {
            const updatedDay = heatmapData.find(d => d.dateStr === selectedDay.dateStr);
            if (updatedDay && (updatedDay.habitsCompleted !== selectedDay.habitsCompleted ||
                updatedDay.studyHours !== selectedDay.studyHours)) {
                setSelectedDay(updatedDay);
            }
        }
    }, [heatmapData, selectedDay]);

    const totalContributions = heatmapData.filter(d => d.level > 0).length;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>Activity Heatmap</h3>
                <span className={styles.total}>{totalContributions} active days in the last year</span>
            </div>

            <div className={styles.heatmapWrapper} ref={scrollRef}>
                <div className={styles.weekLabels}>
                    <span>Mon</span>
                    <span>Wed</span>
                    <span>Fri</span>
                </div>

                <div className={styles.heatmap}>
                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className={styles.week}>
                            {week.map((day, dayIndex) => (
                                day ? (
                                    <motion.div
                                        key={day.dateStr}
                                        className={`${styles.day} ${styles[`level${day.level}`]} ${selectedDay?.dateStr === day.dateStr ? styles.selected : ''}`}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        whileTap={{ scale: 0.8 }}
                                        onClick={() => setSelectedDay(day)}
                                        transition={{ delay: weekIndex * 0.01 + dayIndex * 0.005 }}
                                    />
                                ) : (
                                    <div key={`empty-${dayIndex}`} className={styles.empty} />
                                )
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Selected Day Info (Mobile Friendly Tooltip) */}
            {selectedDay && (
                <motion.div
                    className={styles.dayInfo}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <strong>{format(selectedDay.date, 'MMM d, yyyy')}</strong>
                    <div className={styles.dayStats}>
                        <span>✅ {selectedDay.habitsCompleted} habits</span>
                        <span>📚 {selectedDay.studyHours}h study</span>
                    </div>
                </motion.div>
            )}

            <div className={styles.legend}>
                <span>Less</span>
                <div className={`${styles.legendDay} ${styles.level0}`} />
                <div className={`${styles.legendDay} ${styles.level1}`} />
                <div className={`${styles.legendDay} ${styles.level2}`} />
                <div className={`${styles.legendDay} ${styles.level3}`} />
                <div className={`${styles.legendDay} ${styles.level4}`} />
                <span>More</span>
            </div>
        </div>
    );
};

export default ActivityHeatmap;
