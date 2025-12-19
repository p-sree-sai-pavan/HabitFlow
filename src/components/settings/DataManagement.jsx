import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Download, Upload, AlertTriangle } from 'lucide-react';
import { useHabitFlow } from '../../context/HabitFlowContext';
import { useAuth } from '../../context/AuthContext';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import styles from './SettingsComponents.module.css';

const DataManagement = () => {
    const {
        habits,
        habitHistory,
        studyLogs,
        gamification,
        shareableProgress,
        settings,
        setHabits,
        setHabitHistory,
        setStudyLogs,
        setGamification,
        setShareableProgress,
        setSettings
    } = useHabitFlow();
    const { user } = useAuth();

    const [exportSuccess, setExportSuccess] = useState(false);
    const [importSuccess, setImportSuccess] = useState(false);
    const fileInputRef = React.useRef(null);

    const exportData = () => {
        const dataToExport = {
            version: '2.0',
            exportDate: new Date().toISOString(),
            user: user?.email || 'unknown',
            data: {
                habits,
                habitHistory,
                studyLogs,
                gamification,
                shareableProgress,
                settings
            }
        };

        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `habitflow-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 3000);
    };

    const importData = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (imported.data) {
                    if (confirm('Import will replace your current data. Continue?')) {
                        if (imported.data.habits) setHabits(imported.data.habits);
                        if (imported.data.habitHistory) setHabitHistory(imported.data.habitHistory);
                        if (imported.data.studyLogs) setStudyLogs(imported.data.studyLogs);
                        if (imported.data.gamification) setGamification(imported.data.gamification);
                        if (imported.data.shareableProgress) setShareableProgress(imported.data.shareableProgress);
                        if (imported.data.settings) setSettings(imported.data.settings);
                        setImportSuccess(true);
                        setTimeout(() => setImportSuccess(false), 3000);
                    }
                }
            } catch (error) {
                alert('Invalid backup file: ' + error.message);
            }
        };
        reader.readAsText(file);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const resetAllData = async () => {
        if (confirm('⚠️ This will DELETE ALL your data permanently.\n\nThis includes:\n• All habits\n• All habit history\n• All study logs\n• All gamification progress\n• All settings\n\nThis action CANNOT be undone. Are you absolutely sure?')) {
            if (confirm('🚨 FINAL WARNING!\n\nYou are about to delete EVERYTHING.\n\nType "DELETE" in your mind and click OK to proceed.')) {
                try {
                    if (user?.uid) {
                        const userDocRef = doc(db, 'users', user.uid);
                        await deleteDoc(userDocRef);
                    }
                    localStorage.removeItem('theme');
                    alert('All data has been deleted. The page will now reload.');
                    window.location.reload();
                } catch (error) {
                    console.error('Error deleting data:', error);
                    alert('Failed to delete data. Please try again.');
                }
            }
        }
    };

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <Trash2 size={24} />
                <div>
                    <h2>Data Management</h2>
                    <p>Export, import, or delete your data</p>
                </div>
            </div>

            <div className={styles.dataActions}>
                <div className={styles.dataAction}>
                    <div className={styles.actionInfo}>
                        <Download size={20} />
                        <div>
                            <h4>Export Data</h4>
                            <p>Download a backup of all your data as JSON</p>
                        </div>
                    </div>
                    <motion.button
                        onClick={exportData}
                        className={styles.secondaryBtn}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {exportSuccess ? '✓ Exported!' : 'Export'}
                    </motion.button>
                </div>

                <div className={styles.dataAction}>
                    <div className={styles.actionInfo}>
                        <Upload size={20} />
                        <div>
                            <h4>Import Data</h4>
                            <p>Restore from a backup file</p>
                        </div>
                    </div>
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={importData}
                            className={styles.fileInput}
                            id="import-file"
                        />
                        <label htmlFor="import-file" className={styles.secondaryBtn}>
                            {importSuccess ? '✓ Imported!' : 'Import'}
                        </label>
                    </div>
                </div>
            </div>

            <div className={styles.dangerZone}>
                <div className={styles.dangerHeader}>
                    <AlertTriangle size={20} />
                    <h3>Danger Zone</h3>
                </div>
                <p>
                    Once you delete your data, there is no going back. Please be certain.
                </p>
                <motion.button
                    onClick={resetAllData}
                    className={styles.dangerBtn}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Trash2 size={18} />
                    Delete All Data
                </motion.button>
            </div>
        </div>
    );
};

export default DataManagement;
