import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import styles from './WelcomeModal.module.css';

const WelcomeModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className={styles.overlay}>
                <motion.div
                    className={styles.modal}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                >
                    <div className={styles.content}>
                        <div className={styles.iconWrapper}>
                            <Sparkles size={48} />
                        </div>
                        <h1>Welcome to HabitFlow!</h1>
                        <p className={styles.subtitle}>Your journey to mastery begins here. We've redesigned everything to help you build better habits.</p>

                        <div className={styles.features}>
                            <div className={styles.feature}>
                                <CheckCircle size={20} className={styles.check} />
                                <span><strong>Track Habits</strong> with interactive check-ins</span>
                            </div>
                            <div className={styles.feature}>
                                <CheckCircle size={20} className={styles.check} />
                                <span><strong>Visualize Progress</strong> with beautiful charts</span>
                            </div>
                            <div className={styles.feature}>
                                <CheckCircle size={20} className={styles.check} />
                                <span><strong>Level Up</strong> your life with gamification</span>
                            </div>
                        </div>

                        <button className={styles.ctaBtn} onClick={onClose}>
                            Let's Get Started <ArrowRight size={20} />
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default WelcomeModal;
