import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Edit2, CheckCircle2, Circle } from 'lucide-react';
import { useHabitFlow } from '../../context/HabitFlowContext';
import styles from './Goals.module.css';

const Goals = () => {
    const { habits, setHabits, getHabitStats } = useHabitFlow();
    const [editingId, setEditingId] = useState(null);
    const [editGoal, setEditGoal] = useState(0);

    const handleEditGoal = (habitId, currentGoal) => {
        setEditingId(habitId);
        setEditGoal(currentGoal);
    };

    const saveGoal = (habitId) => {
        setHabits(prev => prev.map(h =>
            h.id === habitId ? { ...h, goal: editGoal } : h
        ));
        setEditingId(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    return (
        <motion.div
            className={styles.container}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <header className={styles.header}>
                <h2><Target size={24} /> Goals & Targets</h2>
                <p className={styles.subtitle}>Customize your monthly goals for each habit</p>
            </header>

            <div className={styles.goalsGrid}>
                {habits.map((habit, index) => {
                    const isEditing = editingId === habit.id;
                    const stats = getHabitStats(habit.id);

                    return (
                        <motion.div
                            key={habit.id}
                            className={styles.goalCard}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, y: -4 }}
                        >
                            <div className={styles.goalHeader}>
                                <div className={styles.habitInfo}>
                                    <div className={styles.categoryDot} style={{
                                        background: habit.color || '#a855f7'
                                    }}></div>
                                    <h3>{habit.name}</h3>
                                </div>
                                {!isEditing && (
                                    <button
                                        className={styles.editBtn}
                                        onClick={() => handleEditGoal(habit.id, habit.goal)}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                )}
                            </div>

                            {isEditing ? (
                                <div className={styles.editMode}>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={editGoal}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setEditGoal(isNaN(val) ? 1 : Math.max(1, Math.min(100, val)));
                                        }}
                                        className={styles.goalInput}
                                        autoFocus
                                    />
                                    <div className={styles.editActions}>
                                        <button
                                            className={styles.saveBtn}
                                            onClick={() => saveGoal(habit.id)}
                                        >
                                            <CheckCircle2 size={16} />
                                            Save
                                        </button>
                                        <button
                                            className={styles.cancelBtn}
                                            onClick={cancelEdit}
                                        >
                                            <Circle size={16} />
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.goalDisplay}>
                                    <div className={styles.goalValue}>
                                        <span className={styles.currentGoal}>{habit.goal}</span>
                                        <span className={styles.goalLabel}>per month</span>
                                    </div>
                                    <div className={styles.progressBar}>
                                        <motion.div
                                            className={styles.progressFill}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, habit.goal > 0 ? (stats.completed / habit.goal) * 100 : 0)}%` }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                    <div className={styles.goalStats}>
                                        <span>Progress: {stats.completed}/{habit.goal}</span>
                                        <span>{habit.goal > 0 ? Math.round((stats.completed / habit.goal) * 100) : 0}%</span>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            <motion.div
                className={styles.infoCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <Target size={20} />
                <div>
                    <strong>About Goals</strong>
                    <p>Set realistic monthly targets for each habit. Goals help you stay focused and track your progress throughout the month.</p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Goals;
