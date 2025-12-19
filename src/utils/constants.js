// HabitFlow Constants - Centralized configuration values

// XP and Leveling
export const XP_PER_LEVEL = 100;
export const XP_PER_STUDY_HOUR = 3;
export const XP_PER_HABIT = 1;

// Badge Thresholds (streak days required)
export const BADGE_THRESHOLDS = {
    starter: 7,
    committed: 14,
    grinder: 21,
    legend: 30
};

// Badge Definitions
export const BADGE_DEFINITIONS = [
    { id: 'starter', name: 'Starter', desc: '7 Day Streak', required: 7 },
    { id: 'committed', name: 'Committed', desc: '14 Day Streak', required: 14 },
    { id: 'grinder', name: 'Grinder', desc: '21 Day Streak', required: 21 },
    { id: 'legend', name: 'Legend', desc: '30 Day Streak', required: 30 },
];

// Categories
export const CATEGORIES = ['CP', 'WebDev', 'MLDS', 'Typing', 'Projects'];

// Default Habits - with all properties for consistency
export const DEFAULT_HABITS = [
    { id: 'cp', name: 'CP (solve ≥ 3 Qs)', goal: 25, category: 'CP', color: '#ef4444', frequency: 'daily', customDays: [0, 1, 2, 3, 4, 5, 6] },
    { id: 'webdev', name: 'WebDev (learn topic)', goal: 22, category: 'WebDev', color: '#3b82f6', frequency: 'daily', customDays: [0, 1, 2, 3, 4, 5, 6] },
    { id: 'mlds', name: 'ML/DS (study)', goal: 20, category: 'MLDS', color: '#10b981', frequency: 'daily', customDays: [0, 1, 2, 3, 4, 5, 6] },
    { id: 'typing', name: 'Typing Practice', goal: 25, category: 'Typing', color: '#f59e0b', frequency: 'daily', customDays: [0, 1, 2, 3, 4, 5, 6] },
    { id: 'project', name: 'PROJECT', goal: 20, category: 'Projects', color: '#a855f7', frequency: 'daily', customDays: [0, 1, 2, 3, 4, 5, 6] }
];

// UI Constants
export const HABIT_NAME_TRUNCATE_LENGTH = 18;
export const PROGRESS_LEVELS = [0, 25, 50, 75, 100];

// Debounce timing - instant saves (0ms delay)
export const SAVE_DEBOUNCE_MS = 0;

// Goal constraints
export const MIN_GOAL = 1;
export const MAX_GOAL = 100;

// Study hours constraints
export const MIN_STUDY_HOURS = 0.5;
export const MAX_STUDY_HOURS = 24;

// Streak calculation threshold - minimum number of habits to count as "completed day"
// Set to 1 to match heatmap behavior (any activity = streak continues)
export const STREAK_MIN_HABITS = 1; // At least 1 habit completed

// Generate unique ID (replaces Date.now() to avoid collisions)
export const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for older browsers
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};
