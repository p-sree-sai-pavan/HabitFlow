import React, { useMemo, useCallback, useState, useRef, useLayoutEffect, useEffect } from 'react';
import { format, getDate, isToday, isFuture } from 'date-fns';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Archive, RotateCcw, Lock, CheckSquare } from 'lucide-react';
import { useHabitFlow } from '../../context/HabitFlowContext';
import { useToast } from '../../context/ToastContext';
import { XP_PER_HABIT } from '../../utils/constants';
import { playCompletionSound, playMilestoneSound, playSuccessChime } from '../../utils/soundEffects';
import MonthYearSelector from '../common/MonthYearSelector';
import AddHabitModal from './AddHabitModal';
import HabitDetailsModal from './HabitDetailsModal';
import styles from './HabitTracker.module.css';

const HabitTracker = () => {
    const {
        habits,
        habitHistory,
        addHabit,
        updateHabit,
        deleteHabit,
        archiveHabit,
        restoreHabit, // Assuming this exists now
        settings,
        getDaysInCurrentMonth,
        getGlobalStats,
        isHabitScheduled, // New helper from Context
        toggleHabit,    // Needed for checkbox
        getHabitStats,
        getHabitStreak,
        archivedHabits,
        deleteArchivedHabit
    } = useHabitFlow();

    const { addToast } = useToast();
    // const addToast = (msg, type, undo) => console.log(msg); // Mock

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState(null);
    const [showArchived, setShowArchived] = useState(false);

    // State for Details Modal (Notes)
    const [detailsModal, setDetailsModal] = useState({
        isOpen: false,
        habit: null,
        date: null,
        dateStr: null,
        data: null
    });

    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedHabits, setSelectedHabits] = useState(new Set());

    // Memoize expensive calculations - include the getter functions
    const days = useMemo(() => getDaysInCurrentMonth(), [getDaysInCurrentMonth]);
    const globalStats = useMemo(() => getGlobalStats(), [getGlobalStats]);

    // Get unique categories from habits for modal
    const categories = useMemo(() => {
        const habitCategories = habits.map(h => h.category).filter(Boolean);
        const uniqueCategories = [...new Set(habitCategories)];
        return uniqueCategories.length > 0 ? uniqueCategories : ['General'];
    }, [habits]);

    const handleAddHabit = (data) => {
        if (editingHabit) {
            updateHabit(editingHabit.id, data);
        } else {
            addHabit(data);
        }
        setIsModalOpen(false);
        setEditingHabit(null);
    };

    const toggleSelection = (id) => {
        const newSet = new Set(selectedHabits);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedHabits(newSet);
    };

    const handleBulkArchive = () => {
        if (window.confirm(`Archive ${selectedHabits.size} habits?`)) {
            selectedHabits.forEach(id => archiveHabit(id));
            setSelectionMode(false);
            setSelectedHabits(new Set());
        }
    };

    const handleBulkDelete = () => {
        if (window.confirm(`Permanently delete ${selectedHabits.size} habits? This cannot be undone.`)) {
            selectedHabits.forEach(id => deleteHabit(id));
            setSelectionMode(false);
            setSelectedHabits(new Set());
        }
    };

    const openEditModal = (habit) => {
        setEditingHabit(habit);
        setIsModalOpen(true);
    };

    const handleCellContextMenu = (e, habit, date, dateStr, currentData) => {
        e.preventDefault(); // Prevent browser context menu
        setDetailsModal({
            isOpen: true,
            habit,
            date: format(date, 'MMMM do, yyyy'),
            dateStr,
            data: currentData
        });
    };

    const handleDelete = (id, name) => {
        // Just using deleteHabit (which is permanent)
        // Archive button handles the "soft delete"
        if (window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
            deleteHabit(id);
        }
    };

    // Local calculateStreak removed in favor of context getHabitStreak usage

    const gridContainerRef = React.useRef(null);
    const prevPercentage = React.useRef(globalStats.percentage);
    // Track last scrolled month/year to prevent unnecessary scroll resets
    const lastScrolledMonth = React.useRef(null);

    // Auto-scroll to "Today" column only on mount or when month/year ACTUALLY changes
    React.useLayoutEffect(() => {
        const currentMonthKey = `${settings.year}-${settings.month}`;

        // Only auto-scroll if month changed (not on every state update)
        if (lastScrolledMonth.current === currentMonthKey) {
            return; // Same month, don't reset scroll
        }

        lastScrolledMonth.current = currentMonthKey;

        if (gridContainerRef.current) {
            const container = gridContainerRef.current;
            const todayElement = container.querySelector('[data-is-today="true"]');

            if (todayElement) {
                // Calculate position to center "Today" (accounting for sticky column ~140px)
                const stickyOffset = 150;
                const targetScroll = todayElement.offsetLeft - stickyOffset - 20;
                container.scrollLeft = Math.max(0, targetScroll);
            } else {
                // Fallback: If no today (e.g. looking at past month), start at beginning
                container.scrollLeft = 0;
            }
        }
    }, [days, settings.year, settings.month]);

    // Celebration Effect - Enhanced with milestones
    React.useEffect(() => {
        if (globalStats.percentage === 100 && prevPercentage.current < 100) {
            // 100% daily completion - Epic celebration!
            import('canvas-confetti').then((confetti) => {
                // First burst - center
                confetti.default({
                    particleCount: 150,
                    spread: 90,
                    origin: { y: 0.6 },
                    colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']
                });
                // Second burst - left side after delay
                setTimeout(() => {
                    confetti.default({
                        particleCount: 75,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0, y: 0.7 },
                        colors: ['#6366f1', '#10b981', '#8b5cf6']
                    });
                }, 200);
                // Third burst - right side
                setTimeout(() => {
                    confetti.default({
                        particleCount: 75,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1, y: 0.7 },
                        colors: ['#f59e0b', '#ec4899', '#10b981']
                    });
                }, 400);
            });
            // Play celebration sound if enabled
            if (settings.soundEnabled !== false) {
                playMilestoneSound();
            }
            addToast('🎉 Perfect Day! All habits completed!', 'success');
        }
        prevPercentage.current = globalStats.percentage;
    }, [globalStats.percentage, addToast, settings.soundEnabled]);

    // Streak milestone celebrations
    const celebrateStreakMilestone = useCallback((habitName, streakCount) => {
        const milestones = [7, 14, 21, 30, 50, 100, 365];
        if (milestones.includes(streakCount)) {
            let message = '';
            let emoji = '🔥';

            if (streakCount === 7) {
                message = `One week streak for "${habitName}"!`;
                emoji = '🔥';
            } else if (streakCount === 14) {
                message = `Two weeks strong on "${habitName}"!`;
                emoji = '⭐';
            } else if (streakCount === 21) {
                message = `21 days - Habit formed! "${habitName}"`;
                emoji = '🏆';
            } else if (streakCount === 30) {
                message = `Monthly master! 30 days of "${habitName}"`;
                emoji = '👑';
            } else if (streakCount === 50) {
                message = `50 day legend! "${habitName}"`;
                emoji = '💎';
            } else if (streakCount === 100) {
                message = `CENTURY! 100 days of "${habitName}"`;
                emoji = '🏅';
            } else if (streakCount === 365) {
                message = `ONE YEAR! 365 days of "${habitName}"`;
                emoji = '🎖️';
            }

            addToast(`${emoji} ${message}`, 'success');

            // Play sound for milestones if enabled
            if (settings.soundEnabled !== false) {
                if (streakCount >= 21) {
                    playMilestoneSound(); // Major celebration sound
                } else {
                    playSuccessChime(); // Minor celebration sound
                }
            }

            // Special confetti for major milestones
            if (streakCount >= 21) {
                import('canvas-confetti').then((confetti) => {
                    confetti.default({
                        particleCount: 80,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#fb923c', '#fbbf24', '#f59e0b'] // Streak orange colors
                    });
                });
            }
        }
    }, [addToast, settings.soundEnabled]);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h2>Habit Tracker</h2>
                    <p className={styles.subtitle}>
                        {globalStats.completed}/{globalStats.goal} completed this month
                    </p>
                    <div className={styles.controlsRow}>
                        <div className={styles.selectorWrapper}>
                            <MonthYearSelector />
                        </div>
                        <button
                            className={styles.addHabitBtn}
                            onClick={() => {
                                setEditingHabit(null);
                                setIsModalOpen(true);
                            }}
                        >
                            <Plus size={16} />
                            Add Habit
                        </button>
                        <button
                            className={`${styles.iconBtn} ${selectionMode ? styles.activeBtn : ''}`}
                            onClick={() => {
                                setSelectionMode(!selectionMode);
                                setSelectedHabits(new Set());
                            }}
                            title="Bulk Actions"
                        >
                            <CheckSquare size={18} />
                        </button>
                    </div>
                </div>
                {selectionMode && selectedHabits.size > 0 ? (
                    <div className={styles.bulkActions}>
                        <span>{selectedHabits.size} selected</span>
                        <button onClick={handleBulkArchive} className={styles.bulkActionBtn}>
                            <Archive size={14} /> Archive
                        </button>
                        <button onClick={handleBulkDelete} className={`${styles.bulkActionBtn} ${styles.deleteBtn}`}>
                            <Trash2 size={14} /> Delete
                        </button>
                    </div>
                ) : (
                    <div className={styles.legend}>
                        <button
                            className={`${styles.toggleViewBtn} ${showArchived ? styles.activeView : ''}`}
                            onClick={() => setShowArchived(!showArchived)}
                        >
                            {showArchived ? "Back to Active" : "Archived"}
                        </button>
                        {!showArchived && (
                            <>
                                <span className={styles.legendItem}><span className={styles.dotDone}></span> Done</span>
                                <span className={styles.legendItem}><span className={styles.dotMissed}></span> Pending</span>
                                <span className={styles.legendItem}><Lock size={12} /> Past</span>
                                <span className={styles.legendItem} style={{ color: 'var(--color-accent)' }}>
                                    {settings.allowPastEditing ? 'All dates editable' : 'Today only editable'}
                                </span>
                            </>
                        )}
                    </div>
                )}
            </header>

            <div className={styles.gridContainer} ref={gridContainerRef}>
                <table className={styles.grid}>
                    <thead>
                        <tr>
                            <th className={styles.habitHeader}>Habit</th>
                            <th className={styles.goalHeader}>Goal</th>
                            {!showArchived && days.map(day => {
                                const isTodayDate = isToday(day);
                                return (
                                    <th
                                        key={day.toString()}
                                        className={`${styles.dayHeader} ${isTodayDate ? styles.todayHeader : ''}`}
                                        data-is-today={isTodayDate}
                                    >
                                        <div className={styles.dayName}>{format(day, 'EEE')}</div>
                                        <div className={styles.dayNum}>{getDate(day)}</div>
                                    </th>
                                );
                            })}
                            <th className={styles.statsHeader}>Done</th>
                            <th className={styles.statsHeader}>Streak</th>
                            <th className={styles.statsHeader}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(showArchived ? archivedHabits : habits).length === 0 ? (
                            <tr>
                                <td colSpan={days.length + 5} className={styles.emptyState}>
                                    <div className={styles.emptyContent}>
                                        <p>{showArchived ? "No archived habits." : "No habits yet. Start your journey!"}</p>
                                        {!showArchived && (
                                            <button onClick={() => { setEditingHabit(null); setIsModalOpen(true); }} className={styles.emptyBtn}>
                                                <Plus size={16} /> Create First Habit
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            (showArchived ? archivedHabits : habits).map((habit, index) => {
                                const stats = getHabitStats(habit.id);
                                const streaks = getHabitStreak(habit.id); // Use context helper

                                return (
                                    <motion.tr
                                        key={habit.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        viewport={{ once: true }}
                                        className={selectionMode && selectedHabits.has(habit.id) ? styles.selectedRow : ''}
                                    >
                                        <td className={styles.habitName}>
                                            <div className={styles.habitNameWrapper}>
                                                {selectionMode && (
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedHabits.has(habit.id)}
                                                        onChange={() => toggleSelection(habit.id)}
                                                        className={styles.rowCheckbox}
                                                    />
                                                )}
                                                <div className={styles.habitColorStrip} style={{ backgroundColor: habit.color || '#a855f7' }}></div>
                                                <span>{habit.name}</span>
                                                {/* Only show row actions for Active items if not archived AND not in selection mode */}
                                                {!selectionMode && (
                                                    <div className={styles.rowActions}>
                                                        <button onClick={() => openEditModal(habit)} className={styles.actionBtn}>
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button onClick={() => handleDelete(habit.id, habit.name)} className={`${styles.actionBtn} ${styles.deleteBtn}`}>
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className={styles.habitGoal}>{habit.goal}</td>

                                        {/* Render checkboxes only for Active view */}
                                        {!showArchived && days.map(day => {
                                            const dateStr = format(day, 'yyyy-MM-dd');
                                            const entry = habitHistory[dateStr]?.[habit.id];
                                            const isCompleted = (entry && typeof entry === 'object') ? entry.completed : !!entry;
                                            const hasNote = (entry && typeof entry === 'object') && entry.note;

                                            const isTodayDate = isToday(day);
                                            const isFutureDate = isFuture(day);
                                            const isScheduled = isHabitScheduled(habit, day);
                                            const isEditable = isTodayDate || (settings.allowPastEditing && !isFutureDate);

                                            return (
                                                <td
                                                    key={day.toString()}
                                                    className={`${styles.cell} ${isTodayDate ? styles.today : ''} ${!isScheduled ? styles.restDay : ''}`}
                                                    onContextMenu={(e) => {
                                                        if (isEditable && isScheduled) {
                                                            handleCellContextMenu(e, habit, day, dateStr, entry);
                                                        }
                                                    }}
                                                >
                                                    {!isScheduled ? (
                                                        <span className={styles.restDayIcon} title="Rest Day">•</span>
                                                    ) : isFutureDate ? (
                                                        <span className={styles.futureCell}>-</span>
                                                    ) : (
                                                        <div className={styles.checkboxWrapper}>
                                                            <input
                                                                type="checkbox"
                                                                checked={isCompleted}
                                                                onChange={() => {
                                                                    if (isEditable) {
                                                                        toggleHabit(dateStr, habit.id);
                                                                        if (navigator.vibrate) navigator.vibrate(15);

                                                                        // Play completion sound if enabled
                                                                        if (!isCompleted && settings.soundEnabled !== false) {
                                                                            playCompletionSound();
                                                                        }

                                                                        // Show toast on completion
                                                                        if (!isCompleted) {
                                                                            addToast(`Habit completed! +${XP_PER_HABIT} XP`, 'success', () => {
                                                                                toggleHabit(dateStr, habit.id); // Undo
                                                                            });

                                                                            // Check for streak milestones (after state updates, use timeout)
                                                                            setTimeout(() => {
                                                                                const newStreaks = getHabitStreak(habit.id);
                                                                                celebrateStreakMilestone(habit.name, newStreaks.current);
                                                                            }, 100);
                                                                        }
                                                                    }
                                                                }}
                                                                disabled={!isEditable}
                                                                className={`${styles.checkbox} ${!isEditable ? styles.disabledCheckbox : ''}`}
                                                                aria-label={`Mark ${habit.name} as ${isCompleted ? 'incomplete' : 'complete'} for ${format(day, 'MMMM d')}`}
                                                                role="checkbox"
                                                                aria-checked={isCompleted}
                                                            />
                                                            {hasNote && <div className={styles.noteIndicator} />}
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}

                                        <td className={styles.doneCount}>{stats.completed}</td>
                                        <td className={styles.streak}>
                                            {streaks.current}
                                            <span className={styles.subStreak}>/{streaks.longest}</span>
                                        </td>

                                        {/* Actions Column */}
                                        <td className={styles.actionsCell}>
                                            <div className={styles.rowActionsStatic}>
                                                {showArchived ? (
                                                    <>
                                                        <button
                                                            onClick={() => restoreHabit(habit.id)}
                                                            className={styles.actionBtn}
                                                            title="Restore"
                                                        >
                                                            <RotateCcw size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (window.confirm('Delete this habit permanently?')) deleteArchivedHabit(habit.id);
                                                            }}
                                                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                                            title="Delete Forever"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <>
                                                            <button
                                                                onClick={() => openEditModal(habit)}
                                                                className={styles.actionBtn}
                                                                title="Edit"
                                                                aria-label={`Edit ${habit.name}`}
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (window.confirm(`Archive "${habit.name}"?`)) archiveHabit(habit.id);
                                                                }}
                                                                className={styles.actionBtn}
                                                                title="Archive"
                                                                aria-label={`Archive ${habit.name}`}
                                                            >
                                                                <Archive size={16} />
                                                            </button>
                                                        </>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Details/Notes Modal */}
            <HabitDetailsModal
                isOpen={detailsModal.isOpen}
                onClose={() => setDetailsModal(prev => ({ ...prev, isOpen: false }))}
                habit={detailsModal.habit}
                date={detailsModal.date}
                currentData={detailsModal.data}
                onSave={(extraData) => {
                    // Save note (and mark complete if not already, or just update data)
                    toggleHabit(detailsModal.dateStr, detailsModal.habit.id, extraData);
                    setDetailsModal(prev => ({ ...prev, isOpen: false }));
                }}
            />

            <AddHabitModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleAddHabit}
                initialData={editingHabit}
                categories={categories}
            />
        </div >
    );
};

export default HabitTracker;
