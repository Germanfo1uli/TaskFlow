import { memo } from 'react';
import { FaCalendarAlt, FaTrophy, FaRocket, FaChartLine, FaUsers, FaLightbulb } from 'react-icons/fa';
import { motion } from 'framer-motion';
import styles from './ProfileHighlights.module.css';

interface ProfileHighlightsProps {
    joinDate: string;
    completedTasks: number;
    activeProjects: number;
}

export const ProfileHighlights = memo(({ joinDate, completedTasks, activeProjects }: ProfileHighlightsProps) => {
    const calculateYearsInCompany = (dateString: string) => {
        if (!dateString) return 'Недавно';
        const joinDate = new Date(dateString);
        const now = new Date();
        const years = now.getFullYear() - joinDate.getFullYear();
        return years > 0 ? `${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'}` : 'Менее года';
    };

    const getPerformanceLevel = (tasks: number) => {
        if (tasks > 100) return { level: 'Эксперт', color: '#8b5cf6', icon: FaTrophy };
        if (tasks > 50) return { level: 'Профессионал', color: '#3d6bb3', icon: FaRocket };
        if (tasks > 20) return { level: 'Специалист', color: '#10b981', icon: FaChartLine };
        return { level: 'Новичок', color: '#4facfe', icon: FaUsers };
    };

    const getProjectScale = (projects: number) => {
        if (projects > 5) return 'Крупные проекты';
        if (projects > 2) return 'Несколько проектов';
        return 'Фокусный проект';
    };

    const highlights = [
        {
            icon: FaCalendarAlt,
            title: 'Опыт в компании',
            value: calculateYearsInCompany(joinDate),
            description: 'Время работы в команде',
            color: '#3d6bb3',
            gradient: 'linear-gradient(135deg, #3d6bb3 0%, #4facfe 100%)'
        },
        {
            icon: getPerformanceLevel(completedTasks).icon,
            title: 'Уровень эффективности',
            value: getPerformanceLevel(completedTasks).level,
            description: `${completedTasks} завершённых задач`,
            color: getPerformanceLevel(completedTasks).color,
            gradient: `linear-gradient(135deg, ${getPerformanceLevel(completedTasks).color} 0%, ${getPerformanceLevel(completedTasks).color}99 100%)`
        },
        {
            icon: FaLightbulb,
            title: 'Масштаб работы',
            value: getProjectScale(activeProjects),
            description: `${activeProjects} активных проектов`,
            color: '#10b981',
            gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 24
            }
        }
    };

    return (
        <div className={styles.profileHighlights}>
            <h3 className={styles.highlightsTitle}>Ключевые показатели</h3>
            <motion.div
                className={styles.highlightsGrid}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {highlights.map((highlight) => (
                    <motion.div
                        key={highlight.title}
                        className={styles.highlightCard}
                        variants={itemVariants}
                        whileHover={{
                            y: -6,
                            transition: { type: 'spring', stiffness: 400, damping: 18 }
                        }}
                    >
                        <div className={styles.cardHeader}>
                            <div
                                className={styles.iconWrapper}
                                style={{ background: highlight.gradient }}
                            >
                                <highlight.icon className={styles.icon} />
                            </div>
                            <div className={styles.cardTitleSection}>
                                <h4 className={styles.cardTitle}>{highlight.title}</h4>
                                <p className={styles.cardDescription}>{highlight.description}</p>
                            </div>
                        </div>
                        <div className={styles.cardValue}>
                            <span className={styles.valueText}>{highlight.value}</span>
                        </div>
                        <div className={styles.cardGlow} style={{ background: highlight.gradient }} />
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
});

ProfileHighlights.displayName = 'ProfileHighlights';