import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Palette, Calendar, CalendarDays } from 'lucide-react';
import { useHabitFlow } from '../../context/HabitFlowContext';
import styles from './SettingsComponents.module.css';

const AppearanceSettings = () => {
    const { settings, setSettings } = useHabitFlow();

    const toggleTheme = () => {
        const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
        setSettings({ ...settings, theme: newTheme });
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const togglePastEditing = () => {
        setSettings({ ...settings, allowPastEditing: !settings.allowPastEditing });
    };

    const updateWeekStartDay = (day) => {
        setSettings({ ...settings, weekStartDay: day });
    };

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <Palette size={24} />
                <div>
                    <h2>Appearance & Behavior</h2>
                    <p>Customize how HabitFlow looks and works</p>
                </div>
            </div>

            <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                    <label>Theme Mode</label>
                    <span>Choose between dark and light mode</span>
                </div>
                <motion.button
                    className={styles.themeToggle}
                    onClick={toggleTheme}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {settings.theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                    <span>{settings.theme === 'dark' ? 'Dark' : 'Light'} Mode</span>
                </motion.button>
            </div>

            <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                    <label>
                        <Calendar size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                        Allow Past Date Editing
                    </label>
                    <span>When enabled, you can edit habit entries for any past date and log study sessions for custom dates</span>
                </div>
                <motion.button
                    className={`${styles.toggleBtn} ${settings.allowPastEditing ? styles.toggleOn : styles.toggleOff}`}
                    onClick={togglePastEditing}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <span className={styles.toggleSlider} />
                    <span className={styles.toggleLabel}>
                        {settings.allowPastEditing ? 'ON' : 'OFF'}
                    </span>
                </motion.button>
            </div>

            <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                    <label>
                        <CalendarDays size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                        Week Starts On
                    </label>
                    <span>Choose which day your week begins</span>
                </div>
                <select
                    className={styles.select}
                    value={settings.weekStartDay || 'monday'}
                    onChange={(e) => updateWeekStartDay(e.target.value)}
                >
                    <option value="sunday">Sunday</option>
                    <option value="monday">Monday</option>
                </select>
            </div>

            <div className={styles.previewCard}>
                <h4>Theme Preview</h4>
                <div className={styles.themePreview} data-theme={settings.theme}>
                    <div className={styles.previewHeader}>HabitFlow</div>
                    <div className={styles.previewContent}>
                        <div className={styles.previewCard} />
                        <div className={styles.previewCard} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppearanceSettings;

