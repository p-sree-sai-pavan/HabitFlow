import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Calendar, Check, X, Clock, Save } from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';
import { useHabitFlow } from '../../context/HabitFlowContext';
import styles from './SettingsComponents.module.css';

const DataEditor = () => {
    const {
        habits,
        habitHistory,
        setHabitHistory,
        studyLogs,
        setStudyLogs,
        recalculateGamification
    } = useHabitFlow();

    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [editedHabits, setEditedHabits] = useState({});
    const [hasChanges, setHasChanges] = useState(false);

    // Get last 30 days for quick selection
    const recentDates = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(new Date(), i);
        return format(date, 'yyyy-MM-dd');
    });

    const currentDayData = habitHistory[selectedDate] || {};
    const dayStudyLogs = studyLogs.filter(log => log.date === selectedDate);

    const handleHabitToggle = (habitId) => {
        const currentValue = editedHabits[habitId] ?? currentDayData[habitId] ?? false;
        setEditedHabits(prev => ({
            ...prev,
            [habitId]: !currentValue
        }));
        setHasChanges(true);
    };

    const handleSaveChanges = () => {
        // Update habit history
        setHabitHistory(prev => ({
            ...prev,
            [selectedDate]: {
                ...prev[selectedDate],
                ...editedHabits
            }
        }));

        // Recalculate gamification if the function exists
        if (typeof recalculateGamification === 'function') {
            recalculateGamification();
        }

        setEditedHabits({});
        setHasChanges(false);
        alert('Changes saved! XP and streaks have been recalculated.');
    };

    const handleDeleteStudyLog = (logId) => {
        if (confirm('Delete this study log entry?')) {
            setStudyLogs(prev => prev.filter(log => log.id !== logId));
        }
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        setEditedHabits({});
        setHasChanges(false);
    };

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <Edit3 size={24} />
                <div>
                    <h2>Change Previous Data</h2>
                    <p>Edit habit completions and study logs for past dates</p>
                </div>
            </div>

            <div className={styles.dateSelector}>
                <label>Select Date to Edit</label>
                <div className={styles.dateInputWrapper}>
                    <Calendar size={18} />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={e => handleDateChange(e.target.value)}
                        className={styles.dateInput}
                        max={format(new Date(), 'yyyy-MM-dd')}
                    />
                </div>
                <div className={styles.quickDates}>
                    {recentDates.slice(0, 7).map(date => (
                        <button
                            key={date}
                            className={`${styles.quickDateBtn} ${selectedDate === date ? styles.active : ''}`}
                            onClick={() => handleDateChange(date)}
                        >
                            {date === format(new Date(), 'yyyy-MM-dd')
                                ? 'Today'
                                : date === format(subDays(new Date(), 1), 'yyyy-MM-dd')
                                    ? 'Yesterday'
                                    : format(parseISO(date), 'MMM d')}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.editSection}>
                <h4>Habit Completions for {format(parseISO(selectedDate), 'MMMM d, yyyy')}</h4>
                <div className={styles.habitEditList}>
                    {habits.map(habit => {
                        const isCompleted = editedHabits[habit.id] ?? currentDayData[habit.id] ?? false;
                        const hasEdit = editedHabits[habit.id] !== undefined;

                        return (
                            <motion.div
                                key={habit.id}
                                className={`${styles.habitEditRow} ${hasEdit ? styles.edited : ''}`}
                                whileHover={{ x: 5 }}
                            >
                                <label className={styles.habitCheckbox}>
                                    <input
                                        type="checkbox"
                                        checked={isCompleted}
                                        onChange={() => handleHabitToggle(habit.id)}
                                    />
                                    <span className={styles.checkmark}>
                                        {isCompleted && <Check size={14} />}
                                    </span>
                                    <span>{habit.name}</span>
                                </label>
                                {hasEdit && (
                                    <span className={styles.editedBadge}>Modified</span>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {dayStudyLogs.length > 0 && (
                <div className={styles.editSection}>
                    <h4>Study Logs for {format(parseISO(selectedDate), 'MMMM d, yyyy')}</h4>
                    <div className={styles.studyLogList}>
                        {dayStudyLogs.map(log => (
                            <div key={log.id} className={styles.studyLogRow}>
                                <div className={styles.logInfo}>
                                    <Clock size={16} />
                                    <span className={styles.logCategory}>{log.category}</span>
                                    <span className={styles.logTopic}>{log.topic}</span>
                                    <span className={styles.logHours}>{log.hours}h</span>
                                </div>
                                <button
                                    onClick={() => handleDeleteStudyLog(log.id)}
                                    className={styles.deleteBtn}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {hasChanges && (
                <motion.div
                    className={styles.saveBar}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <span>You have unsaved changes</span>
                    <button onClick={handleSaveChanges} className={styles.primaryBtn}>
                        <Save size={16} /> Save Changes
                    </button>
                </motion.div>
            )}

            <div className={styles.warningCard}>
                <span>⚠️</span>
                <p>
                    Editing historical data will recalculate your XP, streaks, and badges.
                    Changes are saved to the cloud immediately.
                </p>
            </div>
        </div>
    );
};

export default DataEditor;
