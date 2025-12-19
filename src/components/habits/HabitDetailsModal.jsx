import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import styles from './HabitDetailsModal.module.css';

// Inner component that resets when key changes
const HabitDetailsForm = ({ habit, date, currentData, onSave, onClose }) => {
    // Initialize state from props - this component remounts when key changes
    const initialNote = (currentData && typeof currentData === 'object') ? (currentData.note || '') : '';
    const initialValue = (currentData && typeof currentData === 'object') ? (currentData.value || '') : '';

    const [note, setNote] = useState(initialNote);
    const [value, setValue] = useState(initialValue);

    const handleSave = () => {
        onSave({
            note,
            value: value ? parseFloat(value) : undefined
        });
        onClose();
    };

    return (
        <motion.div
            className={styles.modal}
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
        >
            <div className={styles.header}>
                <div className={styles.titleRow}>
                    <h2 style={{ color: habit.color }}>{habit.name}</h2>
                    <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
                </div>
                <p className={styles.date}>{date}</p>
            </div>

            <div className={styles.body}>
                {/* Partial Completion Input */}
                <div className={styles.inputGroup}>
                    <label>Progress Value (Goal: {habit.goal})</label>
                    <input
                        type="number"
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        placeholder="e.g. 15"
                        className={styles.numberInput}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Daily Note</label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="How did it go? Any blockers?"
                        className={styles.textarea}
                    />
                </div>
            </div>

            <div className={styles.actions}>
                <button className={styles.saveBtn} onClick={handleSave}>
                    <Save size={16} /> Save Note
                </button>
            </div>
        </motion.div>
    );
};

const HabitDetailsModal = ({ isOpen, onClose, habit, date, currentData, onSave }) => {
    // Create a unique key that changes when modal opens with new data
    const formKey = useMemo(() => {
        return `${habit?.id || 'none'}-${date}-${isOpen ? 'open' : 'closed'}`;
    }, [habit?.id, date, isOpen]);

    if (!isOpen || !habit) return null;

    return (
        <AnimatePresence>
            <div className={styles.overlay} onClick={onClose}>
                <HabitDetailsForm
                    key={formKey}
                    habit={habit}
                    date={date}
                    currentData={currentData}
                    onSave={onSave}
                    onClose={onClose}
                />
            </div>
        </AnimatePresence>
    );
};

export default HabitDetailsModal;
