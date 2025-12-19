import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import styles from './AddHabitModal.module.css';

// Default categories as fallback
const DEFAULT_CATEGORIES = ['Health', 'Learning', 'Work', 'Mindfulness', 'Fitness', 'Creativity', 'Other'];
const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

// Helper to get initial state from props
const getInitialState = (initialData, defaultCategory) => ({
    name: initialData?.name || '',
    category: initialData?.category || defaultCategory || 'General',
    goal: initialData?.goal || 30,
    color: initialData?.color || '#3b82f6',
    frequency: initialData?.frequency || 'daily',
    customDays: initialData?.customDays || [0, 1, 2, 3, 4, 5, 6],
});

const AddHabitModal = ({ isOpen, onClose, onSave, initialData = null, categories: propCategories = [] }) => {
    // Use prop categories or fallback to defaults
    const categories = propCategories.length > 0 ? propCategories : DEFAULT_CATEGORIES;

    const [name, setName] = useState('');
    const [category, setCategory] = useState(categories[0] || 'General');
    const [goal, setGoal] = useState(30);
    const [color, setColor] = useState('#3b82f6');
    const [frequency, setFrequency] = useState('daily');
    const [customDays, setCustomDays] = useState([0, 1, 2, 3, 4, 5, 6]);

    // CRITICAL FIX: Reset state when modal opens or initialData changes
    useEffect(() => {
        if (isOpen) {
            const initial = getInitialState(initialData, categories[0]);
            setName(initial.name);
            setCategory(initial.category);
            setGoal(initial.goal);
            setColor(initial.color);
            setFrequency(initial.frequency);
            setCustomDays(initial.customDays);
        }
    }, [isOpen, initialData, categories]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            name,
            category,
            goal: parseInt(goal),
            color,
            frequency,
            customDays
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className={styles.overlay} onClick={onClose}>
                <motion.div
                    className={styles.modal}
                    onClick={e => e.stopPropagation()}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                >
                    <div className={styles.header}>
                        <h2>{initialData ? 'Edit Habit' : 'Create New Habit'}</h2>
                        <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.group}>
                            <label>Habit Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g., Read 30 mins"
                                autoFocus
                                required
                            />
                        </div>

                        <div className={styles.row}>
                            <div className={styles.group}>
                                <label>Monthly Goal</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="31"
                                    value={goal}
                                    onChange={e => setGoal(e.target.value)}
                                />
                            </div>
                            <div className={styles.group}>
                                <label>Category</label>
                                <select value={category} onChange={e => setCategory(e.target.value)}>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className={styles.group}>
                            <label>Color Tag</label>
                            <div className={styles.colors}>
                                {COLORS.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        className={`${styles.colorBtn} ${color === c ? styles.selected : ''}`}
                                        style={{ backgroundColor: c }}
                                        onClick={() => setColor(c)}
                                    >
                                        {color === c && <Check size={12} color='white' strokeWidth={4} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.group}>
                            <label>Frequency</label>
                            <select
                                value={frequency}
                                onChange={e => {
                                    setFrequency(e.target.value);
                                    // Auto-set days for presets
                                    if (e.target.value === 'daily') setCustomDays([0, 1, 2, 3, 4, 5, 6]);
                                    if (e.target.value === 'weekdays') setCustomDays([1, 2, 3, 4, 5]);
                                    if (e.target.value === 'weekends') setCustomDays([0, 6]);
                                }}
                            >
                                <option value="daily">Every Day</option>
                                <option value="weekdays">Weekdays (Mon-Fri)</option>
                                <option value="weekends">Weekends (Sat-Sun)</option>
                                <option value="custom">Custom Days</option>
                            </select>
                        </div>

                        {frequency === 'custom' && (
                            <div className={styles.group}>
                                <label>Select Days</label>
                                <div className={styles.daysContainer}>
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            className={`${styles.dayBtn} ${customDays.includes(i) ? styles.active : ''}`}
                                            onClick={() => {
                                                if (customDays.includes(i)) {
                                                    setCustomDays(customDays.filter(day => day !== i));
                                                } else {
                                                    setCustomDays([...customDays, i]);
                                                }
                                            }}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className={styles.actions}>
                            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                            <button type="submit" className={styles.saveBtn}>
                                {initialData ? 'Update Habit' : 'Create Habit'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AddHabitModal;
