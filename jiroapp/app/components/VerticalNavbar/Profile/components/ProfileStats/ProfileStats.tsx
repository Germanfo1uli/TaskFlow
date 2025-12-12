import { memo } from 'react';
import { FaTasks, FaProjectDiagram, FaCalendarAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import styles from './ProfileStats.module.css';

interface ProfileStatsProps {
    completedTasks: number;
    activeProjects: number;
    joinDate: string;
}

export const ProfileStats = memo(({ completedTasks, activeProjects, joinDate }: ProfileStatsProps) => {
    const formatJoinDate = (dateString: string) => {
        if (!dateString) return 'Не указано';
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const stats = [
        {
            icon: FaTasks,
            value: completedTasks,
            label: 'Завершено задач',
            color: '#3d6bb3'
        },
        {
            icon: FaProjectDiagram,
            value: activeProjects,
            label: 'Активных проектов',
            color: '#4facfe'
        },
        {
            icon: FaCalendarAlt,
            value: formatJoinDate(joinDate),
            label: 'В команде с',
            color: '#10b981'
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -12 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                type: 'spring',
                stiffness: 320,
                damping: 24
            }
        }
    };

    return (
        <div className={styles.profileStats}>
            <h3 className={styles.statsTitle}>Статистика активности</h3>
            <motion.div
                className={styles.statsGrid}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        className={styles.statItem}
                        variants={itemVariants}
                        whileHover={{
                            y: -2,
                            transition: { type: 'spring', stiffness: 400, damping: 20 }
                        }}
                    >
                        <div
                            className={styles.statIconWrapper}
                            style={{ background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}99 100%)` }}
                        >
                            <stat.icon className={styles.statIcon} />
                        </div>
                        <div className={styles.statInfo}>
                            <h3>{stat.value}</h3>
                            <p>{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
});

ProfileStats.displayName = 'ProfileStats';