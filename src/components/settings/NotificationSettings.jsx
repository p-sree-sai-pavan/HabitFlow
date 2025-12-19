import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, Clock, Volume2, VolumeX } from 'lucide-react';
import { useHabitFlow } from '../../context/HabitFlowContext';
import styles from './SettingsComponents.module.css';

const NotificationSettings = () => {
    const { settings, setSettings } = useHabitFlow();

    // Local state for notification settings
    const [remindersEnabled, setRemindersEnabled] = useState(settings.remindersEnabled || false);
    const [reminderTime, setReminderTime] = useState(settings.reminderTime || '09:00');
    const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled !== false); // Default true

    // Request notification permission
    const requestPermission = async () => {
        if (!('Notification' in window)) {
            alert('This browser does not support notifications');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    };

    const toggleReminders = async () => {
        if (!remindersEnabled) {
            const granted = await requestPermission();
            if (!granted) {
                alert('Please enable notifications in your browser settings to use reminders.');
                return;
            }
        }

        const newValue = !remindersEnabled;
        setRemindersEnabled(newValue);
        setSettings({ ...settings, remindersEnabled: newValue });
    };

    const updateReminderTime = (time) => {
        setReminderTime(time);
        setSettings({ ...settings, reminderTime: time });
    };

    const toggleSound = () => {
        const newValue = !soundEnabled;
        setSoundEnabled(newValue);
        setSettings({ ...settings, soundEnabled: newValue });
    };

    // Get permission status text
    const getPermissionStatus = () => {
        if (!('Notification' in window)) return 'Not Supported';
        return Notification.permission === 'granted' ? 'Allowed' :
            Notification.permission === 'denied' ? 'Blocked' : 'Not Set';
    };

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <Bell size={24} />
                <div>
                    <h2>Notifications & Reminders</h2>
                    <p>Configure reminders to stay on track</p>
                </div>
            </div>

            {/* Daily Reminder Toggle */}
            <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                    <label>
                        {remindersEnabled ? <Bell size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                            : <BellOff size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />}
                        Daily Habit Reminder
                    </label>
                    <span>Get reminded to complete your daily habits</span>
                </div>
                <motion.button
                    className={`${styles.toggleBtn} ${remindersEnabled ? styles.toggleOn : styles.toggleOff}`}
                    onClick={toggleReminders}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <span className={styles.toggleSlider} />
                    <span className={styles.toggleLabel}>
                        {remindersEnabled ? 'ON' : 'OFF'}
                    </span>
                </motion.button>
            </div>

            {/* Reminder Time Picker */}
            {remindersEnabled && (
                <motion.div
                    className={styles.settingItem}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                >
                    <div className={styles.settingInfo}>
                        <label>
                            <Clock size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                            Reminder Time
                        </label>
                        <span>When should we remind you?</span>
                    </div>
                    <input
                        type="time"
                        value={reminderTime}
                        onChange={(e) => updateReminderTime(e.target.value)}
                        className={styles.timeInput}
                    />
                </motion.div>
            )}

            {/* Sound Effects Toggle */}
            <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                    <label>
                        {soundEnabled ? <Volume2 size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                            : <VolumeX size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />}
                        Sound Effects
                    </label>
                    <span>Play sounds for habit completion and other actions</span>
                </div>
                <motion.button
                    className={`${styles.toggleBtn} ${soundEnabled ? styles.toggleOn : styles.toggleOff}`}
                    onClick={toggleSound}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <span className={styles.toggleSlider} />
                    <span className={styles.toggleLabel}>
                        {soundEnabled ? 'ON' : 'OFF'}
                    </span>
                </motion.button>
            </div>

            {/* Permission Status */}
            <div className={styles.previewCard}>
                <h4>Browser Notification Status</h4>
                <div className={styles.permissionStatus}>
                    <span className={`${styles.statusDot} ${getPermissionStatus() === 'Allowed' ? styles.statusAllowed :
                            getPermissionStatus() === 'Blocked' ? styles.statusBlocked : styles.statusPending
                        }`} />
                    <span>{getPermissionStatus()}</span>
                </div>
                {getPermissionStatus() === 'Blocked' && (
                    <p className={styles.helpText}>
                        To enable notifications, click the lock icon in your browser's address bar and allow notifications.
                    </p>
                )}
            </div>
        </div>
    );
};

export default NotificationSettings;
