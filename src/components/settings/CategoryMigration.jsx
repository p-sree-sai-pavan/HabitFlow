import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, ArrowRight, Check, AlertTriangle } from 'lucide-react';
import { useHabitFlow } from '../../context/HabitFlowContext';
import styles from './SettingsComponents.module.css';

const CategoryMigration = () => {
    const { studyLogs, setStudyLogs, habits } = useHabitFlow();
    const [migrated, setMigrated] = useState(false);
    const [migratedCount, setMigratedCount] = useState(0);

    // Get current habit categories
    const currentCategories = useMemo(() => {
        return [...new Set(habits.map(h => h.category).filter(Boolean))];
    }, [habits]);

    // Find old categories in study logs that don't match current habit categories
    const oldCategories = useMemo(() => {
        const logCategories = [...new Set(studyLogs.map(l => l.category).filter(Boolean))];
        return logCategories.filter(cat => !currentCategories.includes(cat));
    }, [studyLogs, currentCategories]);

    // Count logs with old categories
    const logsWithOldCategories = useMemo(() => {
        return studyLogs.filter(log => oldCategories.includes(log.category));
    }, [studyLogs, oldCategories]);

    // Mapping state for old -> new categories
    const [categoryMapping, setCategoryMapping] = useState({});

    // Handle migration
    const handleMigrate = () => {
        if (Object.keys(categoryMapping).length === 0) {
            alert('Please select new categories for the old ones');
            return;
        }

        let count = 0;
        const updatedLogs = studyLogs.map(log => {
            if (categoryMapping[log.category]) {
                count++;
                return { ...log, category: categoryMapping[log.category] };
            }
            return log;
        });

        setStudyLogs(updatedLogs);
        setMigratedCount(count);
        setMigrated(true);
    };

    if (oldCategories.length === 0) {
        return (
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <RefreshCw size={24} />
                    <div>
                        <h2>Category Migration</h2>
                        <p>Update old study log categories to match current habits</p>
                    </div>
                </div>
                <div className={styles.emptyState}>
                    <Check size={32} style={{ color: 'var(--success)' }} />
                    <p>All study log categories match your current habits!</p>
                </div>
            </div>
        );
    }

    if (migrated) {
        return (
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <RefreshCw size={24} />
                    <div>
                        <h2>Category Migration</h2>
                        <p>Update old study log categories to match current habits</p>
                    </div>
                </div>
                <div className={styles.successCard}>
                    <Check size={32} />
                    <h3>Migration Complete!</h3>
                    <p>Updated {migratedCount} study log entries.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <RefreshCw size={24} />
                <div>
                    <h2>Category Migration</h2>
                    <p>Update old study log categories to match current habits</p>
                </div>
            </div>

            <div className={styles.warningCard}>
                <AlertTriangle size={20} />
                <p>
                    Found <strong>{logsWithOldCategories.length}</strong> study logs with
                    old categories that don't match your current habits.
                </p>
            </div>

            <div className={styles.migrationList}>
                <h4>Map old categories to new ones:</h4>
                {oldCategories.map(oldCat => {
                    const logsCount = studyLogs.filter(l => l.category === oldCat).length;
                    return (
                        <div key={oldCat} className={styles.migrationRow}>
                            <span className={styles.oldCategory}>
                                {oldCat} <span className={styles.logCount}>({logsCount} logs)</span>
                            </span>
                            <ArrowRight size={18} />
                            <select
                                value={categoryMapping[oldCat] || ''}
                                onChange={(e) => setCategoryMapping(prev => ({
                                    ...prev,
                                    [oldCat]: e.target.value
                                }))}
                                className={styles.categorySelect}
                            >
                                <option value="">-- Select new category --</option>
                                {currentCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    );
                })}
            </div>

            <motion.button
                className={styles.primaryBtn}
                onClick={handleMigrate}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={Object.keys(categoryMapping).length === 0}
            >
                <RefreshCw size={16} />
                Migrate Categories
            </motion.button>
        </div>
    );
};

export default CategoryMigration;
