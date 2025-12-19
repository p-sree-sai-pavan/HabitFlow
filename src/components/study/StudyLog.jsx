import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Calendar } from 'lucide-react';
import { useHabitFlow } from '../../context/HabitFlowContext';
import { format, parseISO } from 'date-fns';
import { XP_PER_STUDY_HOUR } from '../../utils/constants';
import styles from './StudyLog.module.css';

const StudyLog = () => {
    const { studyLogs, addStudyLog, deleteStudyLog, getFocusDistribution, settings, habits } = useHabitFlow();
    const focusStats = getFocusDistribution();
    const today = format(new Date(), 'yyyy-MM-dd');

    // Get unique categories from user's habits dynamically
    const categories = useMemo(() => {
        const habitCategories = habits
            .map(h => h.category)
            .filter(Boolean); // Remove empty/null categories

        // Get unique categories, preserving order
        const uniqueCategories = [...new Set(habitCategories)];

        // If no categories, provide a default
        if (uniqueCategories.length === 0) {
            return ['General'];
        }

        return uniqueCategories;
    }, [habits]);

    const [selectedDate, setSelectedDate] = useState(today);
    const [formData, setFormData] = useState({
        category: categories[0] || 'General',
        topic: '',
        hours: '',
        notes: ''
    });

    // Update default category when categories change
    React.useEffect(() => {
        if (categories.length > 0 && !categories.includes(formData.category)) {
            setFormData(prev => ({ ...prev, category: categories[0] }));
        }
    }, [categories, formData.category]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.topic || !formData.hours) return;

        addStudyLog({
            date: settings.allowPastEditing ? selectedDate : today,
            category: formData.category,
            topic: formData.topic,
            hours: parseFloat(formData.hours),
            notes: formData.notes
        });

        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate([20, 50, 20]);

        setFormData({
            category: categories[0] || 'General',
            topic: '',
            hours: '',
            notes: ''
        });
    };

    const totalHours = Object.values(focusStats).reduce((a, b) => a + b, 0);
    const displayDate = settings.allowPastEditing ? selectedDate : today;
    const displayDateLogs = studyLogs.filter(l => l.date === displayDate);
    const displayDateHours = displayDateLogs.reduce((acc, l) => acc + (l.hours || 0), 0);

    // Format display date for header
    const formattedDisplayDate = settings.allowPastEditing && selectedDate !== today
        ? format(parseISO(selectedDate), 'MMMM d, yyyy')
        : format(new Date(), 'MMMM d, yyyy');

    return (
        <div className={styles.container}>
            <motion.div
                className={styles.formCard}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
            >
                <h3>📝 {settings.allowPastEditing ? 'Log Study Session' : "Log Today's Study"}</h3>
                <p className={styles.subtitle}>
                    <strong>{formattedDisplayDate}</strong> •
                    {selectedDate === today ? 'Today' : 'Selected'}: <span className={styles.highlight}>{displayDateHours.toFixed(1)}h</span> •
                    Month: {totalHours.toFixed(1)}h
                </p>

                {/* Date Picker - Only visible when allowPastEditing is enabled */}
                {settings.allowPastEditing && (
                    <div className={styles.datePickerRow}>
                        <Calendar size={18} />
                        <label>Select Date:</label>
                        <input
                            type="date"
                            value={selectedDate}
                            max={today}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className={styles.dateInput}
                        />
                        {selectedDate !== today && (
                            <button
                                type="button"
                                className={styles.todayBtn}
                                onClick={() => setSelectedDate(today)}
                            >
                                Reset to Today
                            </button>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Category</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Hours</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                max="24"
                                placeholder="1.5"
                                value={formData.hours}
                                onChange={e => {
                                    const val = e.target.value;
                                    // Basic validation limit
                                    if (parseFloat(val) < 0) return;
                                    if (parseFloat(val) > 24) return;
                                    setFormData({ ...formData, hours: val });
                                }}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Topic / What you studied</label>
                        <input
                            type="text"
                            placeholder="e.g., Binary Search problems, React hooks..."
                            value={formData.topic}
                            onChange={e => setFormData({ ...formData, topic: e.target.value })}
                            list="recent-topics"
                        />
                        <datalist id="recent-topics">
                            {[...new Set(studyLogs.map(l => l.topic))].slice(-5).map((t, i) => (
                                <option key={i} value={t} />
                            ))}
                        </datalist>

                        {/* Quick Suggestions Chips */}
                        <div className={styles.suggestions}>
                            <span className={styles.suggestionLabel}>Recent:</span>
                            {[...new Set(studyLogs.filter(l => l.category === formData.category).map(l => l.topic))].reverse().slice(0, 3).map((t, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    className={styles.chip}
                                    onClick={() => setFormData({ ...formData, topic: t })}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Notes (optional)</label>
                        <textarea
                            placeholder="Key learnings, resources used..."
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <motion.button
                        type="submit"
                        className={styles.submitBtn}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={!formData.topic || !formData.hours}
                    >
                        Add Entry (+{formData.hours ? Math.round(parseFloat(formData.hours) * XP_PER_STUDY_HOUR) : 0} XP)
                    </motion.button>
                </form>
            </motion.div>

            <motion.div
                className={styles.historyCard}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
            >
                <h3>📚 Recent Sessions</h3>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Category</th>
                            <th>Topic</th>
                            <th>Hours</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {studyLogs.slice().reverse().slice(0, 15).map((log, index) => (
                            <motion.tr
                                key={log.id}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className={log.date === today ? styles.todayRow : ''}
                            >
                                <td>{log.date === today ? 'Today' : log.date}</td>
                                <td>
                                    <span className={styles.categoryBadge} data-category={log.category}>
                                        {log.category}
                                    </span>
                                </td>
                                <td>{log.topic}</td>
                                <td className={styles.hours}>{log.hours}h</td>
                                <td>
                                    <motion.button
                                        className={styles.deleteBtn}
                                        onClick={() => {
                                            if (confirm('Delete this study log entry?')) {
                                                deleteStudyLog(log.id);
                                            }
                                        }}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        title="Delete entry"
                                    >
                                        <Trash2 size={16} />
                                    </motion.button>
                                </td>
                            </motion.tr>
                        ))}
                        {studyLogs.length === 0 && (
                            <tr>
                                <td colSpan="5" className={styles.empty}>No sessions yet. Log your first study session!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </motion.div>
        </div>
    );
};

export default StudyLog;
