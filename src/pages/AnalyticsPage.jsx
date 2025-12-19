import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Target, Share2 } from 'lucide-react';
import Analytics from '../components/analytics/Analytics';
import ShareableProgress from '../components/analytics/ShareableProgress';
import Goals from '../components/habits/Goals';
import styles from './AnalyticsPage.module.css';

const AnalyticsPage = () => {
    const [activeTab, setActiveTab] = useState('analytics');

    const tabs = [
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'goals', label: 'Goals', icon: Target },
        { id: 'share', label: 'Share Progress', icon: Share2 },
    ];

    return (
        <div className={styles.container}>
            {/* Tab Navigation */}
            <div className={styles.tabNav}>
                {tabs.map((tab) => (
                    <motion.button
                        key={tab.id}
                        className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <tab.icon size={18} />
                        <span>{tab.label}</span>
                        {activeTab === tab.id && (
                            <motion.div
                                className={styles.activeIndicator}
                                layoutId="activeTab"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                    </motion.button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={styles.content}
                >
                    {activeTab === 'analytics' && <Analytics />}
                    {activeTab === 'goals' && <Goals />}
                    {activeTab === 'share' && <ShareableProgress />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default AnalyticsPage;
