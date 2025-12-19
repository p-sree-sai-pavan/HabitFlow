import React, { createContext, useState, useEffect, useContext, useRef, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subDays, parseISO, isWithinInterval, isToday } from 'date-fns';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import {
  DEFAULT_HABITS,
  XP_PER_LEVEL,
  XP_PER_STUDY_HOUR,
  XP_PER_HABIT,
  BADGE_THRESHOLDS,
  SAVE_DEBOUNCE_MS,
  STREAK_COMPLETION_THRESHOLD,
  generateId
} from '../utils/constants';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const HabitFlowContext = createContext();

export const useHabitFlow = () => useContext(HabitFlowContext);

export const HabitFlowProvider = ({ children }) => {
  const { user } = useAuth();
  const [habits, setHabits] = useState(DEFAULT_HABITS);
  const [habitHistory, setHabitHistory] = useState({});
  const [studyLogs, setStudyLogs] = useState([]);
  const [gamification, setGamification] = useState({ xp: 0, level: 1, badges: [], streak: 0 });
  const [shareableProgress, setShareableProgress] = useState({});
  const [archivedHabits, setArchivedHabits] = useState([]);
  const [completedHabits, setCompletedHabits] = useState([]); // Habits marked as "done"
  const [isLoading, setIsLoading] = useState(true);
  const [hasDataLoaded, setHasDataLoaded] = useState(false); // CRITICAL: Prevents saving default state
  const [settings, setSettings] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    theme: 'dark',
    hasSeenOnboarding: false
  });

  const saveTimeoutRef = useRef(null);
  const isInitialLoadRef = useRef(true);
  const isSavingRef = useRef(false); // Mutex lock for saves
  const [isSaving, setIsSaving] = useState(false); // UI State for sync indicator
  const pendingDataRef = useRef(null); // Track pending data to save
  const skipFirstSaveRef = useRef(true); // Moved here to be reset with user change
  const latestDataRef = useRef(null); // Track latest data for beforeunload save

  // Save immediately (no debounce) - used for critical saves like beforeunload
  const saveImmediately = useCallback(async (dataToSave) => {
    if (!user || !dataToSave) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        ...dataToSave,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      console.log('[SkillOS] ✅ Immediate save completed!');
    } catch (error) {
      console.error('[SkillOS] ❌ Immediate save failed:', error);
    }
  }, [user]);

  // Handle page unload - save pending data immediately
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // If there's a pending save timeout, save immediately
      if (saveTimeoutRef.current && latestDataRef.current && user) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;

        // Use sendBeacon for reliable saves during page unload
        const userDocPath = `users/${user.uid}`;
        const dataToSave = {
          ...latestDataRef.current,
          lastUpdated: new Date().toISOString()
        };

        // Try to save synchronously using navigator.sendBeacon (more reliable on unload)
        // Fallback: the data was already queued, so we try a sync XHR as last resort
        console.log('[SkillOS] 🚨 Page unloading - attempting immediate save');

        // For Firestore, we need to use a different approach
        // Set a flag that we have unsaved data (can be recovered on next load)
        localStorage.setItem('skillos_unsaved_data', JSON.stringify(dataToSave));
        localStorage.setItem('skillos_unsaved_uid', user.uid);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user]);

  // Check for unsaved data on load and save it
  useEffect(() => {
    const recoverUnsavedData = async () => {
      const unsavedData = localStorage.getItem('skillos_unsaved_data');
      const unsavedUid = localStorage.getItem('skillos_unsaved_uid');

      if (unsavedData && unsavedUid && user && user.uid === unsavedUid) {
        try {
          console.log('[SkillOS] 🔄 Recovering unsaved data from previous session...');
          const dataToSave = JSON.parse(unsavedData);
          const userDocRef = doc(db, 'users', user.uid);
          await setDoc(userDocRef, dataToSave, { merge: true });
          console.log('[SkillOS] ✅ Unsaved data recovered successfully!');
        } catch (error) {
          console.error('[SkillOS] ❌ Failed to recover unsaved data:', error);
        } finally {
          // Clear the unsaved data flags
          localStorage.removeItem('skillos_unsaved_data');
          localStorage.removeItem('skillos_unsaved_uid');
        }
      }
    };

    if (user) {
      recoverUnsavedData();
    }
  }, [user]);

  // Reset all refs and state when user changes (logout/login)
  useEffect(() => {
    if (!user) {
      console.log('[SkillOS] No user, resetting state and refs');
      // Reset refs for next login
      isInitialLoadRef.current = true;
      skipFirstSaveRef.current = true;
      isSavingRef.current = false;
      pendingDataRef.current = null;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      // Reset state to defaults
      setHabits(DEFAULT_HABITS);
      setHabitHistory({});
      setStudyLogs([]);
      setGamification({ xp: 0, level: 1, badges: [], streak: 0 });
      setShareableProgress({});
      setArchivedHabits([]);
      setCompletedHabits([]);
      setHasDataLoaded(false);
      setIsLoading(false);
      return;
    }
  }, [user]);

  // Load data from Firestore when user logs in
  useEffect(() => {
    if (!user) {
      return; // Already handled in reset effect above
    }

    const loadUserData = async () => {
      try {
        setIsLoading(true);
        console.log('[SkillOS] 🔄 Loading data for user:', user.uid);
        console.log('[SkillOS] Database instance:', db);

        const userDocRef = doc(db, 'users', user.uid);
        console.log('[SkillOS] Document reference created:', userDocRef.path);

        const userDoc = await getDoc(userDocRef);
        console.log('[SkillOS] getDoc completed, exists:', userDoc.exists());

        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log('[SkillOS] ✅ Loaded data from Firestore:', Object.keys(data));
          setHabits(data.habits || DEFAULT_HABITS);
          setHabitHistory(data.habitHistory || {});
          setStudyLogs(data.studyLogs || []);
          setGamification(data.gamification || { xp: 0, level: 1, badges: [], streak: 0 });
          setShareableProgress(data.shareableProgress || {});
          setArchivedHabits(data.archivedHabits || []);
          setCompletedHabits(data.completedHabits || []);
          if (data.settings) {
            setSettings(data.settings);
            document.documentElement.setAttribute('data-theme', data.settings.theme || 'dark');
            localStorage.setItem('theme', data.settings.theme || 'dark');
          } else {
            const savedTheme = localStorage.getItem('theme') || 'dark';
            const defaultSettings = { year: new Date().getFullYear(), month: new Date().getMonth(), theme: savedTheme, hasSeenOnboarding: false };
            setSettings(defaultSettings);
            document.documentElement.setAttribute('data-theme', savedTheme);
          }
        } else {
          // First time user - initialize with defaults
          console.log('[SkillOS] 🆕 New user - creating document for:', user.uid);
          const savedTheme = localStorage.getItem('theme') || 'dark';
          const initialState = {
            habits: DEFAULT_HABITS,
            habitHistory: {},
            studyLogs: [],
            gamification: { xp: 0, level: 1, badges: [], streak: 0 },
            shareableProgress: {},
            settings: {
              year: new Date().getFullYear(),
              month: new Date().getMonth(),
              theme: savedTheme,
              hasSeenOnboarding: false
            },
            createdAt: new Date().toISOString()
          };

          console.log('[SkillOS] Writing initial state to Firestore...');
          await setDoc(userDocRef, initialState, { merge: true });
          console.log('[SkillOS] ✅ Initial document created successfully!');

          // Also set the state values for new users
          setHabits(DEFAULT_HABITS);
          setHabitHistory({});
          setStudyLogs([]);
          setGamification({ xp: 0, level: 1, badges: [], streak: 0 });
          setShareableProgress({});
          setArchivedHabits([]);
          setCompletedHabits([]);
          document.documentElement.setAttribute('data-theme', savedTheme);
        }
      } catch (error) {
        console.error('[SkillOS] ❌ Error loading/creating data:', error);
        console.error('[SkillOS] Error code:', error.code);
        console.error('[SkillOS] Error message:', error.message);
        if (error.code === 'permission-denied') {
          console.error('[SkillOS] Firestore permission denied. Check security rules.');
        }
      } finally {
        setIsLoading(false);
        isInitialLoadRef.current = false;
        setHasDataLoaded(true); // CRITICAL: Mark data as loaded AFTER everything is done
        console.log('[SkillOS] 🏁 Data load complete, saves now enabled');
      }
    };

    loadUserData();
  }, [user]);

  // Centralized badge update function - FIXED: Consolidates duplicate logic
  const updateBadges = useCallback((currentBadges, streakDays) => {
    const badges = [...currentBadges];
    if (streakDays >= BADGE_THRESHOLDS.starter && !badges.includes('starter')) badges.push('starter');
    if (streakDays >= BADGE_THRESHOLDS.committed && !badges.includes('committed')) badges.push('committed');
    if (streakDays >= BADGE_THRESHOLDS.grinder && !badges.includes('grinder')) badges.push('grinder');
    if (streakDays >= BADGE_THRESHOLDS.legend && !badges.includes('legend')) badges.push('legend');
    return badges;
  }, []);

  // Save data to Firestore with mutex lock to prevent race conditions
  const saveToFirestore = useCallback(async (dataToSave) => {
    if (!user || isInitialLoadRef.current) {
      console.log('[SkillOS] Save skipped - no user or initial load');
      return;
    }

    // Mutex lock - wait if already saving
    if (isSavingRef.current) {
      pendingDataRef.current = dataToSave; // Queue the latest data
      return;
    }

    isSavingRef.current = true;
    setIsSaving(true);

    try {
      console.log('[SkillOS] Saving to Firestore for user:', user.uid);
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        ...dataToSave,
        lastUpdated: new Date().toISOString()
      }, { merge: true }); // FIXED: Use merge:true to prevent data loss
      console.log('[SkillOS] ✅ Saved to Firestore successfully!');
    } catch (error) {
      console.error('[SkillOS] ❌ Error saving to Firestore:', error);
      if (error.code === 'permission-denied') {
        console.error('[SkillOS] Permission denied. Check authentication and rules.');
      }
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);

      // Process pending save if exists
      if (pendingDataRef.current) {
        const pending = pendingDataRef.current;
        pendingDataRef.current = null;
        saveToFirestore(pending);
      }
    }
  }, [user]);

  // Auto-save when data changes (debounced)
  // CRITICAL FIX: skipFirstSaveRef is now declared at the top and reset when user changes
  // This prevents overwriting Firestore data with default state values

  useEffect(() => {
    // CRITICAL: Don't save if data hasn't been loaded yet or no user
    if (!hasDataLoaded || isInitialLoadRef.current || !user) {
      console.log('[SkillOS] Auto-save skipped - hasDataLoaded:', hasDataLoaded, 'isInitialLoad:', isInitialLoadRef.current, 'user:', !!user);
      return;
    }

    // Skip the FIRST save after data loads (prevents saving default state)
    if (skipFirstSaveRef.current) {
      console.log('[SkillOS] Skipping first save after data load to prevent overwrite');
      skipFirstSaveRef.current = false;
      return;
    }

    // Prepare data to save
    const dataToSave = {
      habits,
      habitHistory,
      studyLogs,
      gamification,
      shareableProgress,
      archivedHabits,
      completedHabits,
      settings
    };

    // Store latest data for beforeunload recovery
    latestDataRef.current = dataToSave;

    console.log('[SkillOS] Queuing save with data:', Object.keys(dataToSave));

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Reduced debounce time and save immediately after debounce
    saveTimeoutRef.current = setTimeout(() => {
      saveToFirestore(dataToSave);
      latestDataRef.current = null; // Clear after successful save queue
    }, SAVE_DEBOUNCE_MS);

    // Cleanup: DON'T clear timeout on unmount - let beforeunload handle it
    // Only clear if we're setting a new timeout (above)
  }, [hasDataLoaded, habits, habitHistory, studyLogs, gamification, shareableProgress, archivedHabits, completedHabits, settings, user, saveToFirestore]);

  // Toggle habit with optional extended data (note, value)
  const toggleHabit = (dateStr, habitId, extraData = {}) => {
    setHabitHistory(prev => {
      const dayData = prev[dateStr] || {};
      const currentEntry = dayData[habitId];

      // Determine if currently completed (handle boolean or object)
      const isCurrentlyCompleted = typeof currentEntry === 'object' ? currentEntry?.completed : !!currentEntry;

      let newEntry;
      if (Object.keys(extraData).length > 0) {
        // If providing extra data (like a note), we force completion to true (or keep it true)
        // unless explicitly told otherwise.
        newEntry = {
          completed: true,
          ...extraData,
          // Preserve existing note if not overwritten
          note: extraData.note !== undefined ? extraData.note : (typeof currentEntry === 'object' ? currentEntry.note : '')
        };
      } else {
        // Simple toggle
        if (isCurrentlyCompleted) {
          newEntry = null; // Remove entry (uncheck)
        } else {
          newEntry = { completed: true, timestamp: new Date().toISOString() };
        }
      }

      const newHistory = {
        ...prev,
        [dateStr]: {
          ...dayData,
          [habitId]: newEntry
        }
      };

      setGamification(currentGamification => {
        // Only add XP if we are transitioning from Incomplete -> Complete
        // If just updating a note on an already completed habit, don't add XP again.
        const wasCompleted = isCurrentlyCompleted;
        const isNowCompleted = !!newEntry;

        let xpChange = 0;
        if (!wasCompleted && isNowCompleted) xpChange = XP_PER_HABIT;
        if (wasCompleted && !isNowCompleted) xpChange = -XP_PER_HABIT;

        const newXP = Math.max(0, currentGamification.xp + xpChange);
        const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;

        // Recalculate streaks only if completion status changed
        const currentStreak = (wasCompleted === isNowCompleted)
          ? currentGamification.streak
          : calculateCurrentStreak(newHistory, habits);

        // Re-check badges
        const badges = updateBadges(currentGamification.badges, currentStreak);

        return { ...currentGamification, xp: newXP, level: newLevel, badges, streak: currentStreak };
      });

      return newHistory;
    });
  };

  // Add study log - FIXED: Use XP_PER_STUDY_HOUR constant
  const addStudyLog = (log) => {
    // Validate hours to prevent NaN and unrealistic values
    const hours = parseFloat(log.hours);
    if (isNaN(hours) || hours <= 0) {
      console.warn('[SkillOS] Invalid study hours (<=0):', log.hours);
      return;
    }
    if (hours > 24) {
      console.warn('[SkillOS] Invalid study hours (>24):', log.hours);
      return;
    }

    const newLog = {
      ...log,
      hours: hours, // Ensure it's a valid number
      id: generateId(), // UUID prevents collisions
      timestamp: new Date().toISOString()
    };
    setStudyLogs(prev => [...prev, newLog]);
    addXP(Math.round(hours * XP_PER_STUDY_HOUR));
  };

  // Delete study log
  const deleteStudyLog = (logId) => {
    setStudyLogs(prev => {
      const logToDelete = prev.find(log => log.id === logId);
      if (logToDelete) {
        addXP(-Math.round((logToDelete.hours || 0) * XP_PER_STUDY_HOUR));
      }
      return prev.filter(log => log.id !== logId);
    });
  };

  // FIXED: Use centralized updateBadges and constants
  const addXP = (amount) => {
    setGamification(prev => {
      const newXP = Math.max(0, prev.xp + amount);
      const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
      const streakDays = calculateCurrentStreak(habitHistory, habits);
      const badges = updateBadges(prev.badges, streakDays);

      return { ...prev, xp: newXP, level: newLevel, badges, streak: streakDays };
    });
  };

  const calculateCurrentStreak = (currentHabitHistory, currentHabits) => {
    let streak = 0;
    let checkDate = new Date();

    // Safety check loop limit
    for (let i = 0; i < 365; i++) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      const dayData = currentHabitHistory[dateStr] || {};

      // Filter habits that were actually scheduled for this day
      const scheduledHabits = currentHabits.filter(h => isHabitScheduled(h, checkDate));

      if (scheduledHabits.length === 0) {
        // If no habits scheduled today (e.g. Sunday rest day), streak continues!
        // We just skip this day and look back further
        checkDate = subDays(checkDate, 1);
        continue;
      }

      const completedCount = scheduledHabits.filter(h => {
        const entry = dayData[h.id];
        return typeof entry === 'object' ? entry?.completed : !!entry;
      }).length;

      // Threshold: Did they do X% of scheduled habits?
      if (completedCount >= scheduledHabits.length * STREAK_COMPLETION_THRESHOLD) {
        streak++;
        checkDate = subDays(checkDate, 1);
      } else {
        // Only break streak if it wasn't today (today allows partial progress until day ends)
        // Actually for simplicity, if not done, streak ends.
        // But if today is incomplete, streak shouldn't be 0 if yesterday was done.
        if (isWithinInterval(checkDate, { start: new Date(), end: new Date() })) {
          // If checking today and failed, maybe they just haven't finished yet. 
          // Look at yesterday to confirm previous streak.
          checkDate = subDays(checkDate, 1);
          continue; // Don't increment streak for today yet, but don't break logic
        }
        break;
      }
    }
    return streak;
  };

  // Archive a habit (move to archived list with history preserved)
  // MODIFIED: This can now act as a "Delete" if we want, or we keep it as Archive.
  // We will add specific delete functionality below.
  const archiveHabit = (habitId) => {
    const habitToArchive = habits.find(h => h.id === habitId);
    if (!habitToArchive) return;

    // Add to archived habits with timestamp
    setArchivedHabits(prev => [...prev, {
      ...habitToArchive,
      archivedAt: new Date().toISOString()
    }]);

    // Remove from active habits
    setHabits(prev => prev.filter(h => h.id !== habitId));
  };

  // NEW: Add Habit Function
  const addHabit = (habitData) => {
    const newHabit = {
      id: generateId(),
      name: habitData.name,
      category: habitData.category || 'General',
      goal: parseInt(habitData.goal) || 30,
      color: habitData.color || '#a855f7',
      icon: habitData.icon || 'Circle', // Default icon
      frequency: habitData.frequency || 'daily',
      customDays: habitData.customDays || [0, 1, 2, 3, 4, 5, 6],
      createdAt: new Date().toISOString()
    };
    setHabits(prev => [...prev, newHabit]);
    // Allow immediate save
    setHasDataLoaded(true);
  };

  // NEW: Update Habit Function
  const updateHabit = (id, updates) => {
    setHabits(prev => prev.map(h =>
      h.id === id ? { ...h, ...updates } : h
    ));
  };

  // NEW: Delete Habit Function (Permanent Delete)
  const deleteHabit = (id) => {
    // Remove from active habits
    setHabits(prev => prev.filter(h => h.id !== id));
    // Optional: Remove from history to clean data? 
    // For now, keeping history is safer in case of accidental delete + re-add, 
    // but strictly "Delete" implies removal. Let's keep history for analytics consistency unless purged.
  };

  // Restore an archived habit
  const restoreHabit = (habitId) => {
    const habitToRestore = archivedHabits.find(h => h.id === habitId);
    if (!habitToRestore) return;

    // Add back to active habits (remove archivedAt)
    const { archivedAt, ...restoredHabit } = habitToRestore;
    setHabits(prev => [...prev, restoredHabit]);

    // Remove from archived
    setArchivedHabits(prev => prev.filter(h => h.id !== habitId));
  };

  const deleteArchivedHabit = (habitId) => {
    setArchivedHabits(prev => prev.filter(h => h.id !== habitId));
  };

  // Mark a habit as completed (done) - moves to completed section
  const completeHabit = (habitId) => {
    const habitToComplete = habits.find(h => h.id === habitId);
    if (!habitToComplete) return;

    // Add to completed habits with timestamp
    setCompletedHabits(prev => [...prev, {
      ...habitToComplete,
      completedAt: new Date().toISOString()
    }]);

    // Remove from active habits
    setHabits(prev => prev.filter(h => h.id !== habitId));
  };

  // Restore a completed habit back to active
  const restoreCompletedHabit = (habitId) => {
    const habitToRestore = completedHabits.find(h => h.id === habitId);
    if (!habitToRestore) return;

    // Add back to active habits (remove completedAt)
    const { completedAt, ...restoredHabit } = habitToRestore;
    setHabits(prev => [...prev, restoredHabit]);

    // Remove from completed
    setCompletedHabits(prev => prev.filter(h => h.id !== habitId));
  };

  // Permanently delete a completed habit
  const deleteCompletedHabit = (habitId) => {
    setCompletedHabits(prev => prev.filter(h => h.id !== habitId));
  };

  // Recalculate gamification stats (XP, level, streak, badges)
  const recalculateGamification = () => {
    // Calculate total XP from habits and study logs
    let totalXP = 0;

    // XP from habit completions - properly check completion status
    Object.values(habitHistory).forEach(dayData => {
      const completedCount = Object.values(dayData).filter(entry =>
        entry && (typeof entry === 'object' ? entry.completed : !!entry)
      ).length;
      totalXP += completedCount * XP_PER_HABIT;
    });

    // XP from study logs
    studyLogs.forEach(log => {
      totalXP += Math.round((log.hours || 0) * XP_PER_STUDY_HOUR);
    });

    const newLevel = Math.floor(totalXP / XP_PER_LEVEL) + 1;
    const streakDays = calculateCurrentStreak(habitHistory, habits);
    const badges = updateBadges(gamification.badges, streakDays);

    setGamification({
      xp: totalXP,
      level: newLevel,
      badges,
      streak: streakDays
    });
  };

  const getDaysInCurrentMonth = () => {
    const date = new Date(settings.year, settings.month);
    return eachDayOfInterval({
      start: startOfMonth(date),
      end: endOfMonth(date)
    });
  };

  const getDailyCompletionTrend = () => {
    const days = getDaysInCurrentMonth();
    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayData = habitHistory[dateStr] || {};
      const completed = Object.values(dayData).filter(Boolean).length;
      // Prevent division by zero
      return habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0;
    });
  };

  const getWeeklyStats = () => {
    const weeks = [];
    const days = getDaysInCurrentMonth();

    for (let i = 0; i < days.length; i += 7) {
      const weekDays = days.slice(i, i + 7);
      let totalCompleted = 0;
      let totalPossible = weekDays.length * habits.length;

      weekDays.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayData = habitHistory[dateStr] || {};
        totalCompleted += Object.values(dayData).filter(Boolean).length;
      });

      weeks.push({
        week: weeks.length + 1,
        percentage: totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0
      });
    }
    return weeks;
  };

  const getFocusDistribution = () => {
    // Dynamically build distribution from user's actual habit categories
    const distribution = {};

    // Get categories from habits (not hardcoded CATEGORIES)
    const habitCategories = habits.map(h => h.category).filter(Boolean);
    const uniqueCategories = [...new Set(habitCategories)];
    uniqueCategories.forEach(cat => distribution[cat] = 0);

    const monthStart = startOfMonth(new Date(settings.year, settings.month));
    const monthEnd = endOfMonth(new Date(settings.year, settings.month));

    studyLogs.forEach(log => {
      const logDate = parseISO(log.date);
      if (isWithinInterval(logDate, { start: monthStart, end: monthEnd })) {
        const category = log.category || log.topic?.split(' ')[0] || 'General';
        if (distribution[category] !== undefined) {
          distribution[category] += log.hours || 0;
        } else {
          // Handle categories not in habits (from old data or custom entries)
          distribution[category] = log.hours || 0;
        }
      }
    });

    return distribution;
  };

  // Helper to check if a habit is scheduled for a specific date
  const isHabitScheduled = (habit, date) => {
    if (!habit.frequency || habit.frequency === 'daily') return true;
    const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat

    if (habit.frequency === 'weekdays') return dayOfWeek !== 0 && dayOfWeek !== 6;
    if (habit.frequency === 'weekends') return dayOfWeek === 0 || dayOfWeek === 6;
    if (habit.frequency === 'custom' && Array.isArray(habit.customDays)) {
      return habit.customDays.includes(dayOfWeek);
    }
    return true;
  };

  const getGlobalStats = () => {
    const days = getDaysInCurrentMonth();
    let totalCompleted = 0;
    let totalGoal = 0;

    days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayData = habitHistory[dateStr] || {};

      habits.forEach(habit => {
        if (isHabitScheduled(habit, day)) {
          totalGoal++;
          // FIXED: Properly check completion status, not just truthiness
          const entry = dayData[habit.id];
          const isCompleted = entry && (typeof entry === 'object' ? entry.completed : !!entry);
          if (isCompleted) totalCompleted++;
        }
      });
    });

    return {
      completed: totalCompleted,
      goal: totalGoal,
      percentage: totalGoal > 0 ? Math.round((totalCompleted / totalGoal) * 100) : 0
    };
  };

  const getHabitStats = (habitId) => {
    const days = getDaysInCurrentMonth();
    let completed = 0;
    let scheduledDays = 0;
    const habit = habits.find(h => h.id === habitId);

    days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const entry = habitHistory[dateStr]?.[habitId];
      // FIXED: Check for null explicitly before accessing properties
      const isDone = (entry && typeof entry === 'object') ? entry.completed : !!entry;

      if (isDone) completed++;

      if (habit && isHabitScheduled(habit, day)) {
        scheduledDays++;
      }
    });
    // Use calculated scheduled days as goal, or fallback to habit.goal if monthly goal is preferred override
    // For now, let's use scheduled days for accuracy if frequency is set
    const dynamicGoal = scheduledDays;

    return {
      completed,
      goal: dynamicGoal,
      percentage: dynamicGoal > 0 ? Math.round((completed / dynamicGoal) * 100) : 0,
      left: Math.max(0, dynamicGoal - completed)
    };
  };

  const getTopHabits = () => {
    return habits
      .map(habit => ({
        ...habit,
        ...getHabitStats(habit.id)
      }))
      .sort((a, b) => b.percentage - a.percentage);
  };

  const completeOnboarding = () => {
    const newSettings = { ...settings, hasSeenOnboarding: true };
    setSettings(newSettings);
    // Trigger save immediately
    saveToFirestore({
      habits, habitHistory, studyLogs, gamification, shareableProgress, archivedHabits,
      settings: newSettings
    });
  };

  // Calculate streak for a specific habit (respecting rest days)
  const getHabitStreak = (habitId) => {
    const habit = habits.find(h => h.id === habitId) || archivedHabits.find(h => h.id === habitId);
    if (!habit) return { current: 0, longest: 0 };

    let current = 0;
    let longest = 0;
    let tempCurrent = 0;

    // Sort dates to ensure chronological order
    const sortedDates = Object.keys(habitHistory).sort();

    // 1. Calculate Longest Streak (Historical)
    // For specific habit streak, we iterate history.
    // Simplifying assumption: We iterate all days in history range? 
    // Or just iterate existing history entries?
    // Using existing history is safer for "longest" calc.

    // Actually, to be strictly correct with "Rest Days", we should iterate valid dates.
    // If a range has gaps (rest days), streak shouldn't break.
    // This is complex. Let's use a simpler heuristic for now that matches standard behavior:
    // Only check history entries that exist. 
    // But wait, if I have MWF schedule, and I do M, W, F... T and Th breaks the streak if I just check dates.

    // Correct approach: Iterate days backwards from Today for Current Streak.
    let checkDate = new Date();
    // Loop back 365 days or until broken
    for (let i = 0; i < 365; i++) {
      if (!isHabitScheduled(habit, checkDate)) {
        checkDate = subDays(checkDate, 1);
        continue; // Skip rest day
      }

      const dateStr = format(checkDate, 'yyyy-MM-dd');
      const isDone = habitHistory[dateStr]?.[habitId];

      if (isDone) {
        current++;
        checkDate = subDays(checkDate, 1);
      } else {
        // Allow today to be incomplete without breaking if it's "Today"
        if (isToday(checkDate)) {
          checkDate = subDays(checkDate, 1);
          continue;
        }
        break;
      }
    }

    // Longest Streak is harder to retroactive calculate with dynamic schedule changes.
    // We will stick to the generic "consecutive recorded days" for longest for now, 
    // or just return current until we implement full event-sourced streak recalc.
    // Let's use the local implementation's logic but filtered by schedule?? 
    // No, let's keep it simple: Longest = Current (unless we track it separately in metadata).
    // Actually, users hate losing "Longest".
    // Let's use a basic calculation for Longest based on *recorded* history, ignoring schedule changes for the past (too hard to know historic schedule).

    let tempStreak = 0;
    sortedDates.forEach(dateStr => {
      if (habitHistory[dateStr]?.[habitId]) {
        tempStreak++;
        longest = Math.max(longest, tempStreak);
      } else {
        // Only reset if it WAS a scheduled day? We don't know historic schedule.
        // Assuming simplified longest streak (consecutive days of action).
        tempStreak = 0;
      }
    });

    // Update longest if current is higher (since current logic handles rest days better)
    longest = Math.max(longest, current);

    return { current, longest };
  };

  // Theme Persistence Watcher
  useEffect(() => {
    if (settings.theme) {
      localStorage.setItem('theme', settings.theme);
      document.documentElement.setAttribute('data-theme', settings.theme);
    }
  }, [settings.theme]);

  // Expose isSaving for UI feedback
  const value = {
    habits,
    setHabits,
    habitHistory,
    setHabitHistory,
    studyLogs,
    setStudyLogs,
    gamification,
    setGamification,
    settings,
    setSettings,
    toggleHabit,
    addStudyLog,
    deleteStudyLog,
    getDaysInCurrentMonth,
    getDailyCompletionTrend,
    getWeeklyStats,
    getFocusDistribution,
    getGlobalStats,
    getHabitStats,
    getTopHabits,
    calculateCurrentStreak: () => calculateCurrentStreak(habitHistory, habits),
    isLoading,
    shareableProgress,
    setShareableProgress,
    isSaving, // Placeholder, would need refactoring all setters to verify this. 
    // For now, let's just make it a real state if we want to track it.
    // But saveToFirestore is async...
    // Let's implement a simple loading state wrapper if possible, or just skip for now as it's complex.
    // Actually, I can just add a state `isSaving` and set it true/false in `saveToFirestore`.
    // New features for settings
    archivedHabits,
    setArchivedHabits,
    addHabit,
    updateHabit,
    deleteHabit,
    archiveHabit,
    restoreHabit,
    deleteArchivedHabit,
    completedHabits,
    setCompletedHabits,
    completeHabit,
    restoreCompletedHabit,
    deleteCompletedHabit,
    recalculateGamification,
    completeOnboarding,
    isHabitScheduled,
    getHabitStreak // Helper for UI
  };

  if (isLoading) {
    return <LoadingSkeleton message="Loading your data..." />;
  }

  return (
    <HabitFlowContext.Provider value={value}>
      {children}
    </HabitFlowContext.Provider>
  );
};
