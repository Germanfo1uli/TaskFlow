import { Card, Row, Col, Statistic } from 'antd'
import { FaTasks, FaCheckCircle, FaClock, FaExclamationTriangle, FaChartLine } from 'react-icons/fa'
import { motion } from 'framer-motion'
import type { ProjectStats } from '../../types/reports.types'
import styles from './StatsCards.module.css'

interface StatsCardsProps {
    stats: ProjectStats
}

export const StatsCards = ({ stats }: StatsCardsProps) => {
    const cards = [
        {
            title: 'Всего задач',
            value: stats.totalTasks,
            icon: <FaTasks className={styles.statIcon} />,
            color: '#3b82f6'
        },
        {
            title: 'Выполнено',
            value: stats.completedTasks,
            icon: <FaCheckCircle className={styles.statIcon} />,
            color: '#10b981'
        },
        {
            title: 'В процессе',
            value: stats.inProgressTasks,
            icon: <FaClock className={styles.statIcon} />,
            color: '#f59e0b'
        },
        {
            title: 'Ожидают',
            value: stats.pendingTasks,
            icon: <FaTasks className={styles.statIcon} />,
            color: '#6b7280'
        },
        {
            title: 'Просрочено',
            value: stats.overdueTasks,
            icon: <FaExclamationTriangle className={styles.statIcon} />,
            color: '#ef4444'
        },
        {
            title: 'Эффективность',
            value: stats.completionRate,
            suffix: '%',
            icon: <FaChartLine className={styles.statIcon} />,
            color: '#8b5cf6'
        }
    ]

    return (
        <Row gutter={[16, 16]} className={styles.statsRow}>
            {cards.map((card, index) => (
                <Col xs={24} sm={12} lg={8} xl={4} key={card.title}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
                        whileHover={{ scale: 1.02 }}
                    >
                        <Card className={styles.statCard} style={{ ['--color' as any]: card.color }}>
                            <Statistic
                                title={card.title}
                                value={card.value}
                                suffix={card.suffix}
                                prefix={card.icon}
                                styles={{
                                    content: { color: card.color, fontSize: '28px', fontWeight: 700 }
                                }}
                                className={styles.statistic}
                            />
                        </Card>
                    </motion.div>
                </Col>
            ))}
        </Row>
    )
}