import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command, CheckSquare, Settings, Layout, BookOpen } from 'lucide-react';
import { useHabitFlow } from '../../context/HabitFlowContext';
import styles from './GlobalSearch.module.css';

const GlobalSearch = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);

    const { habits } = useHabitFlow();
    const navigate = useNavigate();

    // Helper to open the search modal with reset
    const openSearch = () => {
        setQuery('');
        setSelectedIndex(0);
        setIsOpen(true);
    };

    // Toggle with Cmd+K / Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (isOpen) {
                    setIsOpen(false);
                } else {
                    openSearch();
                }
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Define Searchable Items
    const pages = [
        { id: 'p1', title: 'Dashboard', icon: <Layout size={16} />, type: 'Page', action: () => navigate('/') },
        { id: 'p2', title: 'Habit Tracker', icon: <CheckSquare size={16} />, type: 'Page', action: () => navigate('/habits') },
        { id: 'p3', title: 'Study Log', icon: <BookOpen size={16} />, type: 'Page', action: () => navigate('/study') },
        { id: 'p4', title: 'Settings', icon: <Settings size={16} />, type: 'Page', action: () => navigate('/settings') },
    ];

    const habitItems = habits.map(h => ({
        id: `h_${h.id}`,
        title: h.name,
        icon: <div className={styles.habitDot} style={{ backgroundColor: h.color }}></div>,
        type: 'Habit',
        action: () => {
            // Navigate to habits page and maybe highlight it? 
            // Or just direct check-in? Let's just go to the page for now.
            navigate('/habits');
            // Small highlight effect could be added via location state later
        }
    }));

    const allItems = [...pages, ...habitItems].filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase())
    );

    // Keyboard Navigation
    useEffect(() => {
        const handleNav = (e) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % allItems.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + allItems.length) % allItems.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (allItems[selectedIndex]) {
                    allItems[selectedIndex].action();
                    setIsOpen(false);
                }
            }
        };

        window.addEventListener('keydown', handleNav);
        return () => window.removeEventListener('keydown', handleNav);
    }, [isOpen, allItems, selectedIndex]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.searchBar}>
                    <Search className={styles.searchIcon} size={20} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        placeholder="Type a command or search..."
                        className={styles.input}
                    />
                    <div className={styles.shortcutHint}><Command size={12} />K</div>
                </div>

                <div className={styles.results}>
                    {allItems.length === 0 ? (
                        <div className={styles.empty}>No results found.</div>
                    ) : (
                        allItems.map((item, index) => (
                            <div
                                key={item.id}
                                className={`${styles.item} ${index === selectedIndex ? styles.selected : ''}`}
                                onClick={() => {
                                    item.action();
                                    setIsOpen(false);
                                }}
                                onMouseEnter={() => setSelectedIndex(index)}
                            >
                                <span className={styles.itemIcon}>{item.icon}</span>
                                <span className={styles.itemTitle}>{item.title}</span>
                                <span className={styles.itemType}>{item.type}</span>
                                {index === selectedIndex && <span className={styles.enterKey}>↵</span>}
                            </div>
                        ))
                    )}
                </div>
                <div className={styles.footer}>
                    Use arrows to navigate, enter to select, esc to close
                </div>
            </div>
        </div>
    );
};

export default GlobalSearch;
