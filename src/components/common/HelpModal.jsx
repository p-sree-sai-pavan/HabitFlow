import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, Mail } from 'lucide-react';
import styles from './HelpModal.module.css';

const HelpModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const faqs = [
        { q: "How do I archive a habit?", a: "Click the 'Archive' icon (box) next to any habit. You can view archived habits by toggling the 'Archived' button." },
        { q: "What are 'Rest Days'?", a: "Rest days are days you haven't scheduled a habit for. They don't count against your streak." },
        { q: "How do I use the keyboard shortcuts?", a: "Press Ctrl+K (or Cmd+K) to open the Global Search bar." },
        { q: "Is my data saved?", a: "Yes, everything is saved to the cloud automatically." },
    ];

    return (
        <AnimatePresence>
            <div className={styles.overlay} onClick={onClose}>
                <motion.div
                    className={styles.modal}
                    onClick={e => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                >
                    <div className={styles.header}>
                        <h2><HelpCircle size={20} /> Help & Support</h2>
                        <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
                    </div>

                    <div className={styles.content}>
                        <h3>Frequently Asked Questions</h3>
                        <div className={styles.faqList}>
                            {faqs.map((item, index) => (
                                <div key={index} className={styles.faqItem}>
                                    <div className={styles.question}>{item.q}</div>
                                    <div className={styles.answer}>{item.a}</div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.contact}>
                            <h3>Still need help?</h3>
                            <a href="mailto:support@habitflow.app" className={styles.contactBtn}>
                                <Mail size={16} /> Contact Support
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default HelpModal;
