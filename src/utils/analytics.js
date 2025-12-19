import { format, isSameDay, subDays, parseISO } from 'date-fns';

export const calculateStreaks = (habitId, habitHistory) => {
    // habitHistory: { 'YYYY-MM-DD': { habitId: true/false } }
    let currentStreak = 0;

    // Calculate Current Streak
    const today = new Date();
    let checkDate = today;

    // Check today or yesterday to start streak
    const todayStr = format(today, 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');

    if (habitHistory[todayStr]?.[habitId]) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
    } else if (habitHistory[yesterdayStr]?.[habitId]) {
        // If not done today but done yesterday, streak is still alive (but not incremented for today yet)
        // Actually, usually streak includes today if done. If not done today, it might be 0 or just paused.
        // Let's assume strict streak: must be consecutive days.
        // If today is not done, check yesterday.
        checkDate = subDays(checkDate, 1);
    } else {
        // Streak broken
        return { current: 0, longest: calculateLongestStreak(habitId, habitHistory) };
    }

    // Safety limit to prevent infinite loops
    for (let i = 0; i < 365; i++) {
        const dateStr = format(checkDate, 'yyyy-MM-dd');
        if (habitHistory[dateStr]?.[habitId]) {
            currentStreak++;
            checkDate = subDays(checkDate, 1);
        } else {
            break;
        }
    }

    return {
        current: currentStreak,
        longest: calculateLongestStreak(habitId, habitHistory)
    };
};

const calculateLongestStreak = (habitId, habitHistory) => {
    const dates = Object.keys(habitHistory).sort(); // Oldest first
    let maxStreak = 0;
    let currentRun = 0;
    let lastDate = null;

    for (const dateStr of dates) {
        if (habitHistory[dateStr]?.[habitId]) {
            const currentDate = parseISO(dateStr);

            if (lastDate && isSameDay(subDays(currentDate, 1), lastDate)) {
                currentRun++;
            } else {
                currentRun = 1;
            }
            lastDate = currentDate;
            maxStreak = Math.max(maxStreak, currentRun);
        }
    }
    return maxStreak;
};

export const calculateGlobalStats = (habits, habitHistory, studyLogs) => {
    // Total completed habits
    let totalCompleted = 0;

    // Simple approximation for now
    Object.values(habitHistory).forEach(day => {
        Object.values(day).forEach(entry => {
            // Handle both boolean and object entries
            const isCompleted = typeof entry === 'object' ? entry?.completed : !!entry;
            if (isCompleted) totalCompleted++;
        });
    });

    // Focus Distribution - Use category field, not topic matching
    const focusStats = {
        CP: 0,
        WebDev: 0,
        MLDS: 0,
        Typing: 0,
        Projects: 0
    };

    studyLogs.forEach(log => {
        // Use the category field directly
        const category = log.category;
        if (focusStats.hasOwnProperty(category)) {
            focusStats[category] += (log.hours || 0);
        }
    });

    return { totalCompleted, focusStats };
};
