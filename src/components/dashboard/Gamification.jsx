import React from 'react';
import { useHabitFlow } from '../../context/HabitFlowContext';
import { Trophy, Star, Award, Zap, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './Gamification.module.css';

const Gamification = () => {
    const { gamification, studyLogs, getGlobalStats } = useHabitFlow();
    const { xp, level, badges, streak } = gamification;
    const globalStats = getGlobalStats();

    // Calculate totals from actual data
    const totalStudyHours = studyLogs.reduce((acc, l) => acc + (l.hours || 0), 0);

    const badgeDefinitions = [
        { id: 'starter', name: 'Starter', desc: '7 Day Streak', icon: Star, color: '#fbbf24', required: 7 },
        { id: 'committed', name: 'Committed', desc: '14 Day Streak', icon: Zap, color: '#f97316', required: 14 },
        { id: 'grinder', name: 'Grinder', desc: '21 Day Streak', icon: Award, color: '#3b82f6', required: 21 },
        { id: 'legend', name: 'Legend', desc: '30 Day Streak', icon: Trophy, color: '#a855f7', required: 30 },
    ];

    const milestones = [
        { name: 'Complete 100 Habits', current: globalStats.completed, target: 100, color: '#a855f7' },
        { name: 'Log 50 Study Hours', current: Math.round(totalStudyHours), target: 50, color: '#06b6d4' },
        { name: 'Reach Level 10', current: level, target: 10, color: '#ec4899' },
        { name: 'Earn 1000 XP', current: xp, target: 1000, color: '#10b981' },
    ];

    // XP needed to reach next level (level 2 = 100 XP, level 3 = 200 XP, etc.)
    const nextLevelXP = level * 100;
    const progressToNextLevel = xp - ((level - 1) * 100); // XP progress within current level
    const progress = Math.min(100, Math.max(0, progressToNextLevel));

    return (
        <div className={styles.container}>
            <motion.div
                className={styles.header}
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring" }}
            >
                <div className={styles.levelBadge}>
                    <motion.div
                        className={styles.levelNum}
                        key={level}
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                    >
                        {level}
                    </motion.div>
                    <div className={styles.levelLabel}>LEVEL</div>
                </div>
                <div className={styles.xpContainer}>
                    <div className={styles.xpHeader}>
                        <span className={styles.xpText}>{xp} XP</span>
                        <span className={styles.nextLevel}>Next: {nextLevelXP} XP</span>
                    </div>
                    <div className={styles.xpBar}>
                        <motion.div
                            className={styles.xpFill}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />
                    </div>
                    <div className={styles.streakInfo}>
                        <Flame size={18} /> {streak} Day Streak
                    </div>
                </div>
            </motion.div>

            <div className={styles.grid}>
                <div className={styles.section}>
                    <h3>🏅 Badges</h3>
                    <div className={styles.badgeGrid}>
                        {badgeDefinitions.map((badge, index) => {
                            const isUnlocked = badges.includes(badge.id) || streak >= badge.required;
                            return (
                                <motion.div
                                    key={badge.id}
                                    className={`${styles.badgeCard} ${!isUnlocked ? styles.locked : ''}`}
                                    initial={{ scale: 0, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: index * 0.1, type: "spring" }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <div
                                        className={styles.badgeIcon}
                                        style={{ backgroundColor: isUnlocked ? badge.color : 'rgba(255,255,255,0.1)' }}
                                    >
                                        <badge.icon size={28} color={isUnlocked ? '#fff' : '#666'} />
                                    </div>
                                    <div className={styles.badgeName}>{badge.name}</div>
                                    <div className={styles.badgeDesc}>{badge.desc}</div>
                                    {!isUnlocked && (
                                        <div className={styles.badgeProgress}>
                                            {streak}/{badge.required} days
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                <div className={styles.section}>
                    <h3>🎯 Milestones</h3>
                    <div className={styles.milestoneList}>
                        {milestones.map((milestone, index) => {
                            const percent = Math.min(100, Math.round((milestone.current / milestone.target) * 100));
                            return (
                                <motion.div
                                    key={milestone.name}
                                    className={styles.milestoneItem}
                                    initial={{ x: 50, opacity: 0 }}
                                    whileInView={{ x: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className={styles.milestoneInfo}>
                                        <span>{milestone.name}</span>
                                        <span style={{ color: milestone.color }}>{milestone.current}/{milestone.target}</span>
                                    </div>
                                    <div className={styles.progressBar}>
                                        <motion.div
                                            className={styles.progressFill}
                                            style={{ background: milestone.color }}
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${percent}%` }}
                                            transition={{ duration: 1 }}
                                        />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Gamification;
