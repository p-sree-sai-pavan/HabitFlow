import React, { useState, useEffect, useLayoutEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Activity, BookOpen, BarChart3, Settings, LogOut, User, Menu, X, Cloud, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabitFlow } from '../../context/HabitFlowContext';
import styles from './Navbar.module.css';

const Navbar = ({ onLogout, user }) => {
    const { isSaving } = useHabitFlow();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change - useLayoutEffect is appropriate here
    // as it syncs state with navigation before paint
    useLayoutEffect(() => {
        setMobileMenuOpen(false);
    }, [location]);

    const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

    const navLinks = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/dashboard', label: 'Dashboard', icon: Activity },
        { path: '/entry', label: 'Daily Entry', icon: BookOpen },
        { path: '/analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <motion.nav
            className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            role="navigation"
            aria-label="Main navigation"
        >
            <NavLink to="/" className={styles.logo} aria-label="HabitFlow home">
                HabitFlow <span className={styles.version} aria-hidden="true">v1.0</span>
            </NavLink>

            {/* Desktop Navigation */}
            <div className={styles.links}>
                {navLinks.map(link => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        className={({ isActive }) =>
                            `${styles.link} ${isActive ? styles.active : ''}`
                        }
                    >
                        <link.icon size={18} aria-hidden="true" />
                        <span>{link.label}</span>
                    </NavLink>
                ))}

                <div className={styles.userSection}>
                    {/* Sync Indicator */}
                    <div className={styles.syncStatus} title={isSaving ? "Syncing..." : "Synced"} role="status" aria-live="polite">
                        {isSaving ? (
                            <Cloud size={16} className={styles.syncing} aria-hidden="true" />
                        ) : (
                            <CheckCircle2 size={16} className={styles.synced} aria-hidden="true" />
                        )}
                    </div>

                    <div className={styles.userInfo}>
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt={displayName} className={styles.avatar} />
                        ) : (
                            <div className={styles.avatarPlaceholder} aria-label="User avatar">
                                <User size={16} aria-hidden="true" />
                            </div>
                        )}
                        <span className={styles.userName}>{displayName}</span>
                    </div>
                    <button onClick={onLogout} className={styles.logoutBtn} title="Logout" aria-label="Logout">
                        <LogOut size={18} aria-hidden="true" />
                    </button>
                </div>
            </div>

            {/* Mobile Menu Button */}
            <button
                className={styles.mobileMenuBtn}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
            >
                {mobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
            </button>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        className={styles.mobileMenu}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {navLinks.map(link => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                className={({ isActive }) =>
                                    `${styles.mobileLink} ${isActive ? styles.active : ''}`
                                }
                            >
                                <link.icon size={20} aria-hidden="true" />
                                <span>{link.label}</span>
                            </NavLink>
                        ))}
                        <div className={styles.mobileDivider} />
                        <div className={styles.mobileUserSection}>
                            <div className={styles.mobileUserInfo}>
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt={displayName} className={styles.avatar} />
                                ) : (
                                    <div className={styles.avatarPlaceholder} aria-label="User avatar">
                                        <User size={16} aria-hidden="true" />
                                    </div>
                                )}
                                <span>{displayName}</span>
                            </div>
                            <button onClick={onLogout} className={styles.mobileLogoutBtn} aria-label="Logout">
                                <LogOut size={18} aria-hidden="true" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
