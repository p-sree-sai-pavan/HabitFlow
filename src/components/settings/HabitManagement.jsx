import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X, GripVertical, Archive, CheckCircle } from 'lucide-react';
import { useHabitFlow } from '../../context/HabitFlowContext';
import styles from './SettingsComponents.module.css';

const HabitManagement = () => {
    const { habits, setHabits, archiveHabit, completeHabit } = useHabitFlow();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newHabit, setNewHabit] = useState({ name: '', category: '', goal: 20 });

    // Get all unique categories from existing habits for suggestions
    const allCategories = [...new Set(habits.map(h => h.category).filter(Boolean))];
    const [editHabit, setEditHabit] = useState({ name: '', category: '', goal: 0 });

    const handleAddHabit = () => {
        if (!newHabit.name.trim()) return;

        const habit = {
            id: `custom-${Date.now()}`,
            name: newHabit.name.trim(),
            category: newHabit.category,
            goal: Math.max(1, Math.min(100, parseInt(newHabit.goal) || 20))
        };

        setHabits(prev => [...prev, habit]);
        setNewHabit({ name: '', category: allCategories[0] || '', goal: 20 });
        setIsAdding(false);
    };

    const handleEditHabit = (habit) => {
        setEditingId(habit.id);
        setEditHabit({ name: habit.name, category: habit.category, goal: habit.goal });
    };

    const handleSaveEdit = (habitId) => {
        setHabits(prev => prev.map(h =>
            h.id === habitId
                ? { ...h, name: editHabit.name, category: editHabit.category, goal: editHabit.goal }
                : h
        ));
        setEditingId(null);
    };

    const handleArchiveHabit = (habitId) => {
        if (confirm('Archive this habit? Its data will be preserved in the archive.')) {
            if (typeof archiveHabit === 'function') {
                archiveHabit(habitId);
            } else {
                // Fallback: just remove from active habits
                setHabits(prev => prev.filter(h => h.id !== habitId));
            }
        }
    };

    const handleDeleteHabit = (habitId) => {
        if (confirm('Delete this habit permanently? This cannot be undone.')) {
            setHabits(prev => prev.filter(h => h.id !== habitId));
        }
    };

    const handleCompleteHabit = (habitId) => {
        if (confirm('Mark this habit as done? It will be moved to the Completed section.')) {
            if (typeof completeHabit === 'function') {
                completeHabit(habitId);
            } else {
                // Fallback: just remove from active habits
                setHabits(prev => prev.filter(h => h.id !== habitId));
            }
        }
    };

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <Plus size={24} />
                <div>
                    <h2>Add / Remove Habits</h2>
                    <p>Manage your habit list</p>
                </div>
            </div>

            <div className={styles.habitList}>
                <AnimatePresence>
                    {habits.map((habit, index) => (
                        <motion.div
                            key={habit.id}
                            className={styles.habitRow}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <div className={styles.dragHandle}>
                                <GripVertical size={16} />
                            </div>

                            {editingId === habit.id ? (
                                <div className={styles.editForm}>
                                    <input
                                        type="text"
                                        value={editHabit.name}
                                        onChange={e => setEditHabit({ ...editHabit, name: e.target.value })}
                                        className={styles.input}
                                        placeholder="Habit name"
                                    />
                                    <input
                                        type="text"
                                        value={editHabit.category}
                                        onChange={e => setEditHabit({ ...editHabit, category: e.target.value })}
                                        className={styles.input}
                                        placeholder="Category"
                                        list="category-suggestions"
                                    />
                                    <input
                                        type="number"
                                        value={editHabit.goal}
                                        onChange={e => setEditHabit({ ...editHabit, goal: parseInt(e.target.value) || 1 })}
                                        className={styles.inputSmall}
                                        min="1"
                                        max="100"
                                    />
                                    <button onClick={() => handleSaveEdit(habit.id)} className={styles.saveBtn}>
                                        <Save size={16} />
                                    </button>
                                    <button onClick={() => setEditingId(null)} className={styles.cancelBtn}>
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className={styles.habitInfo}>
                                        <span
                                            className={styles.categoryDot}
                                            style={{
                                                background: habit.color || '#a855f7'
                                            }}
                                        />
                                        <span className={styles.habitName}>{habit.name}</span>
                                        <span className={styles.habitMeta}>
                                            {habit.category} • Goal: {habit.goal}/month
                                        </span>
                                    </div>
                                    <div className={styles.habitActions}>
                                        <button onClick={() => handleEditHabit(habit)} className={styles.actionBtn} title="Edit habit">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleCompleteHabit(habit.id)} className={styles.completeBtn} title="Mark as done">
                                            <CheckCircle size={16} />
                                        </button>
                                        <button onClick={() => handleArchiveHabit(habit.id)} className={styles.actionBtn} title="Archive habit">
                                            <Archive size={16} />
                                        </button>
                                        <button onClick={() => handleDeleteHabit(habit.id)} className={styles.deleteBtn} title="Delete permanently">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {isAdding ? (
                    <motion.div
                        className={styles.addForm}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <h4>Add New Habit</h4>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>Habit Name</label>
                                <input
                                    type="text"
                                    value={newHabit.name}
                                    onChange={e => setNewHabit({ ...newHabit, name: e.target.value })}
                                    className={styles.input}
                                    placeholder="e.g., Morning Meditation"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Category</label>
                                <input
                                    type="text"
                                    value={newHabit.category}
                                    onChange={e => setNewHabit({ ...newHabit, category: e.target.value })}
                                    className={styles.input}
                                    placeholder="e.g., Health, Learning, Work"
                                    list="category-suggestions"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Monthly Goal</label>
                                <input
                                    type="number"
                                    value={newHabit.goal}
                                    onChange={e => setNewHabit({ ...newHabit, goal: parseInt(e.target.value) || 20 })}
                                    className={styles.input}
                                    min="1"
                                    max="100"
                                />
                            </div>
                        </div>
                        <div className={styles.formActions}>
                            <button onClick={handleAddHabit} className={styles.primaryBtn}>
                                <Plus size={16} /> Add Habit
                            </button>
                            <button onClick={() => setIsAdding(false)} className={styles.secondaryBtn}>
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.button
                        className={styles.addButton}
                        onClick={() => setIsAdding(true)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Plus size={20} /> Add New Habit
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Datalist for category suggestions */}
            <datalist id="category-suggestions">
                {allCategories.map(cat => (
                    <option key={cat} value={cat} />
                ))}
            </datalist>
        </div>
    );
};

export default HabitManagement;
