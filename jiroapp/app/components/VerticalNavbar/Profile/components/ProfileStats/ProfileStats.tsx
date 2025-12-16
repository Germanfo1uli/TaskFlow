import { memo } from 'react';
import { FaMedal, FaTrophy } from 'react-icons/fa';
import { motion } from 'framer-motion';
import styles from './ProfileStats.module.css';

interface ProfileStatsProps {
    completedTasks: number;
    activeProjects: number;
    joinDate: string;
}

export const ProfileStats = memo(({ completedTasks, activeProjects, joinDate }: ProfileStatsProps) => {
    const achievements = [
        {
            icon: FaTrophy,
            title: 'Новичок',
            description: 'Добро пожаловать в команду!',
            color: '#FFD700',
            unlocked: true
        },
        {
            icon: FaMedal,
            title: 'Первые шаги',
            description: 'Выполни первую задачу',
            color: '#C0C0C0',
            unlocked: false
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
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                type: 'spring',
                stiffness: 320,
                damping: 24
            }
        }
    };

    return (
        <div className={styles.profileStats}>
            <h3 className={styles.statsTitle}>Достижения</h3>
            <motion.div
                className={styles.statsGrid}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {achievements.map((achievement) => (
                    <motion.div
                        key={achievement.title}
                        className={`${styles.achievementItem} ${achievement.unlocked ? styles.unlocked : styles.locked}`}
                        variants={itemVariants}
                        whileHover={{
                            scale: 1.03,
                            transition: { type: 'spring', stiffness: 400, damping: 20 }
                        }}
                    >
                        <div
                            className={styles.achievementIconWrapper}
                            style={{
                                background: `linear-gradient(135deg, ${achievement.color} 0%, ${achievement.color}99 100%)`,
                                opacity: achievement.unlocked ? 1 : 0.5
                            }}
                        >
                            <achievement.icon className={styles.achievementIcon} />
                        </div>
                        <div className={styles.achievementInfo}>
                            <h3>{achievement.title}</h3>
                            <p>{achievement.description}</p>
                            <span className={styles.achievementStatus}>
                                {achievement.unlocked ? 'Получено' : 'Заблокировано'}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
});