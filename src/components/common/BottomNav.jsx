import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Activity, BookOpen, BarChart3, Settings } from 'lucide-react';
import styles from './BottomNav.module.css';

const BottomNav = () => {
    const navLinks = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/dashboard', label: 'Dashboard', icon: Activity },
        { path: '/entry', label: 'Log', icon: BookOpen },
        { path: '/analytics', label: 'Stats', icon: BarChart3 },
        { path: '/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <nav className={styles.bottomNav} role="navigation" aria-label="Mobile navigation">
            {navLinks.map((link) => (
                <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                        `${styles.navItem} ${isActive ? styles.active : ''}`
                    }
                    aria-label={link.label}
                >
                    <link.icon aria-hidden="true" />
                    <span aria-hidden="true">{link.label}</span>
                </NavLink>
            ))}
        </nav>
    );
};

export default BottomNav;
