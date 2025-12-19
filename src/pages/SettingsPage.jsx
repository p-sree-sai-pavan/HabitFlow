import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Settings as SettingsIcon,
    Palette,
    User,
    BarChart3,
    Plus,
    Edit3,
    Trash2,
    Archive,
    ChevronRight,
    HelpCircle,
    Bell,
    RefreshCw
} from 'lucide-react';
import AppearanceSettings from '../components/settings/AppearanceSettings';
import HelpModal from '../components/common/HelpModal';
import ProfileSettings from '../components/settings/ProfileSettings';
import ProgressSettings from '../components/settings/ProgressSettings';
import HabitManagement from '../components/settings/HabitManagement';
import DataEditor from '../components/settings/DataEditor';
import DataManagement from '../components/settings/DataManagement';
import TaskArchive from '../components/settings/TaskArchive';
import NotificationSettings from '../components/settings/NotificationSettings';
import CategoryMigration from '../components/settings/CategoryMigration';
import styles from './SettingsPage.module.css';

const SettingsPage = () => {
    const [helpOpen, setHelpOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('profile');

    const sections = [
        { id: 'profile', label: 'Profile / Account', icon: User, component: ProfileSettings },
        { id: 'appearance', label: 'Appearance', icon: Palette, component: AppearanceSettings },
        { id: 'notifications', label: 'Notifications', icon: Bell, component: NotificationSettings },
        { id: 'habits', label: 'Habit Management', icon: Plus, component: HabitManagement },
        { id: 'archive', label: 'Archived Habits', icon: Archive, component: TaskArchive },
        { id: 'progress', label: 'Progress Overview', icon: BarChart3, component: ProgressSettings },
        { id: 'data-editor', label: 'Edit Past Data', icon: Edit3, component: DataEditor },
        { id: 'category-migration', label: 'Fix Old Categories', icon: RefreshCw, component: CategoryMigration },
        { id: 'data-management', label: 'Data & Danger Zone', icon: Trash2, component: DataManagement, isDanger: true },
    ];

    const ActiveComponent = sections.find(s => s.id === activeSection)?.component || AppearanceSettings;

    return (
        <div className={styles.container}>
            <motion.header
                className={styles.header}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <SettingsIcon size={28} />
                <h1>Settings</h1>
            </motion.header>

            <div className={styles.layout}>
                <motion.nav
                    className={styles.sidebar}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    {sections.map((section, index) => (
                        <motion.button
                            key={section.id}
                            className={`${styles.navItem} ${activeSection === section.id ? styles.active : ''} ${section.isDanger ? styles.dangerItem : ''}`}
                            onClick={() => setActiveSection(section.id)}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ x: 5 }}
                        >
                            <section.icon size={18} />
                            <span>{section.label}</span>
                            <ChevronRight size={16} className={styles.chevron} />
                        </motion.button>
                    ))}

                    <section className={styles.section}>
                        <h2>Support</h2>
                        <div className={styles.card}>
                            <button className={styles.menuItem} onClick={() => setHelpOpen(true)}>
                                <div className={styles.menuIcon}><HelpCircle size={20} /></div>
                                <div className={styles.menuContent}>
                                    <h3>Help Center</h3>
                                    <p>FAQs and support contact</p>
                                </div>
                            </button>
                        </div>
                    </section>
                </motion.nav>

                <motion.main
                    className={styles.content}
                    key={activeSection}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ActiveComponent />
                </motion.main>
            </div>

            <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
        </div>
    );
};

export default SettingsPage;
