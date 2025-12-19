import React from 'react';
import styles from './LoadingSkeleton.module.css';

const LoadingSkeleton = ({ message = 'Loading your data...' }) => {
    return (
        <div className={styles.skeletonContainer}>
            <div className={styles.skeletonCard}>
                <div className={styles.skeletonHeader}>
                    <div className={styles.skeletonAvatar}></div>
                    <div className={styles.skeletonTitle}></div>
                </div>
                <div className={styles.skeletonLine}></div>
                <div className={styles.skeletonLine}></div>
                <div className={styles.skeletonLine}></div>
                <div className={styles.skeletonStats}>
                    <div className={styles.skeletonStat}></div>
                    <div className={styles.skeletonStat}></div>
                    <div className={styles.skeletonStat}></div>
                    <div className={styles.skeletonStat}></div>
                </div>
            </div>
            <span className={styles.loadingText}>{message}</span>
        </div>
    );
};

export default LoadingSkeleton;
