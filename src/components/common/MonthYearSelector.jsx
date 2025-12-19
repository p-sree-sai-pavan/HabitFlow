import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useHabitFlow } from '../../context/HabitFlowContext';
import { format } from 'date-fns';
import styles from './MonthYearSelector.module.css';

const MonthYearSelector = () => {
    const { settings, setSettings } = useHabitFlow();

    const navigateMonth = (direction) => {
        const newDate = new Date(settings.year, settings.month + direction, 1);
        setSettings({
            ...settings,
            year: newDate.getFullYear(),
            month: newDate.getMonth()
        });
    };

    const goToToday = () => {
        const today = new Date();
        setSettings({
            ...settings,
            year: today.getFullYear(),
            month: today.getMonth()
        });
    };

    const currentMonthYear = format(new Date(settings.year, settings.month), 'MMMM yyyy');
    const isCurrentMonth = new Date().getMonth() === settings.month &&
        new Date().getFullYear() === settings.year;

    return (
        <div className={styles.selector}>
            <button
                className={styles.navButton}
                onClick={() => navigateMonth(-1)}
                aria-label="Previous month"
            >
                <ChevronLeft size={20} />
            </button>

            <button
                className={`${styles.monthButton} ${isCurrentMonth ? styles.current : ''}`}
                onClick={goToToday}
            >
                {currentMonthYear}
                {isCurrentMonth && <span className={styles.todayBadge}>Today</span>}
            </button>

            <button
                className={styles.navButton}
                onClick={() => navigateMonth(1)}
                aria-label="Next month"
                disabled={isCurrentMonth}
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
};

export default MonthYearSelector;


