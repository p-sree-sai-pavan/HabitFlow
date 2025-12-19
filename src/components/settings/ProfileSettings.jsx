import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Calendar, Edit2, LogOut, Check, X, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHabitFlow } from '../../context/HabitFlowContext';
import { updateProfile } from 'firebase/auth';
import styles from './SettingsComponents.module.css';

const ProfileSettings = () => {
    const { user, logout } = useAuth();
    const { gamification } = useHabitFlow();

    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState(user?.displayName || '');
    const [saving, setSaving] = useState(false);

    const memberSince = user?.metadata?.creationTime
        ? new Date(user.metadata.creationTime).toLocaleDateString()
        : 'N/A';

    const handleSaveName = async () => {
        if (!newName.trim() || !user) return;
        setSaving(true);
        try {
            await updateProfile(user, { displayName: newName.trim() });
            setIsEditingName(false);
        } catch (error) {
            console.error('Error updating name:', error);
            alert('Failed to update name. Please try again.');
        }
        setSaving(false);
    };

    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to logout?')) {
            try {
                await logout();
            } catch (error) {
                console.error('Logout error:', error);
            }
        }
    };

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <User size={24} />
                <div>
                    <h2>Profile / Account</h2>
                    <p>Manage your account settings</p>
                </div>
            </div>

            <div className={styles.profileCard}>
                <div className={styles.avatar}>
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="Profile" />
                    ) : (
                        <User size={40} />
                    )}
                </div>
                <div className={styles.profileInfo}>
                    {isEditingName ? (
                        <div className={styles.editNameRow}>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className={styles.nameInput}
                                placeholder="Enter your name"
                                autoFocus
                            />
                            <button
                                onClick={handleSaveName}
                                className={styles.iconBtnSuccess}
                                disabled={saving}
                            >
                                <Check size={16} />
                            </button>
                            <button
                                onClick={() => setIsEditingName(false)}
                                className={styles.iconBtnCancel}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className={styles.nameRow}>
                            <h3>{user?.displayName || user?.email?.split('@')[0] || 'User'}</h3>
                            <button
                                onClick={() => {
                                    setNewName(user?.displayName || '');
                                    setIsEditingName(true);
                                }}
                                className={styles.editBtn}
                                title="Edit name"
                            >
                                <Edit2 size={14} />
                            </button>
                        </div>
                    )}
                    <p>Level {gamification.level} • {gamification.xp} XP</p>
                </div>
            </div>

            <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                    <Mail size={18} />
                    <div>
                        <label>Email</label>
                        <span>{user?.email || 'Not available'}</span>
                    </div>
                </div>
                <div className={styles.infoItem}>
                    <Shield size={18} />
                    <div>
                        <label>Account Type</label>
                        <span>{user?.providerData?.[0]?.providerId === 'google.com' ? 'Google' : 'Email/Password'}</span>
                    </div>
                </div>
                <div className={styles.infoItem}>
                    <Calendar size={18} />
                    <div>
                        <label>Member Since</label>
                        <span>{memberSince}</span>
                    </div>
                </div>
            </div>

            <div className={styles.syncStatus}>
                <div className={styles.syncDot} />
                <span>Data synced to cloud</span>
            </div>

            {/* Logout Button */}
            <motion.button
                onClick={handleLogout}
                className={styles.logoutBtn}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <LogOut size={18} />
                Logout
            </motion.button>

            {/* App Info */}
            <div className={styles.appInfo}>
                <Info size={16} />
                <span>HabitFlow v2.0.0</span>
            </div>
        </div>
    );
};

export default ProfileSettings;
