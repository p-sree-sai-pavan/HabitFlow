import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Plus } from 'lucide-react';
import styles from './EmptyState.module.css';

const EmptyState = ({ onAction, message = "No habits found. Start your journey today!", actionText = "Create First Habit" }) => {
    return (
        <motion.div
            className={styles.container}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className={styles.iconWrapper}>
                <Sparkles size={48} className={styles.icon} />
            </div>
            <h3 className={styles.title}>Fresh Start</h3>
            <p className={styles.description}>{message}</p>
            <button className={styles.button} onClick={onAction}>
                <Plus size={20} />
                {actionText}
            </button>
        </motion.div>
    );
};

export default EmptyState;
