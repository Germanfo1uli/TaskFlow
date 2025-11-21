import { FaTasks, FaProjectDiagram, FaCalendarAlt, FaStar } from 'react-icons/fa';
import styles from './ProfileStats.module.css';

interface ProfileStatsProps {
    completedTasks: number;
    activeProjects: number;
    joinDate: string;
    position: string;
}

export const ProfileStats = ({ completedTasks, activeProjects, joinDate, position }: ProfileStatsProps) => {
    const formatJoinDate = (dateString: string) => {
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
        },
        {
            icon: FaStar,
            value: position,
            label: 'Должность',
            color: '#f59e0b'
        }
    ];

    return (
        <div className={styles.profileStats}>
            <h3 className={styles.statsTitle}>Статистика активности</h3>
            <div className={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <div key={index} className={styles.statItem}>
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
                    </div>
                ))}
            </div>
        </div>
    );
};