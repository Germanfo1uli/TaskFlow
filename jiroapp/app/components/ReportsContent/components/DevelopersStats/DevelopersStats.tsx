import { Card, Row, Col, Typography, Badge } from 'antd'
import { FaCheckCircle, FaExclamationTriangle, FaChartLine, FaUser } from 'react-icons/fa'
import { motion } from 'framer-motion'
import type { DeveloperStats } from '../../types/reports.types'
import styles from './DevelopersStats.module.css'

const { Text } = Typography

interface DevelopersStatsProps {
    developerStats: DeveloperStats[]
}

export const DevelopersStats = ({ developerStats }: DevelopersStatsProps) => {
    const getEfficiencyColor = (efficiency: number) => {
        if (efficiency >= 90) return '#10b981'
        if (efficiency >= 75) return '#3b82f6'
        if (efficiency >= 60) return '#f59e0b'
        return '#ef4444'
    }

    if (!developerStats || developerStats.length === 0) {
        return (
            <Card title="Статистика по участникам команды" className={styles.developersCard} variant="borderless">
                <div style={{ padding: '40px 0', textAlign: 'center' }}>
                    <Text type="secondary">Нет данных о разработчиках</Text>
                </div>
            </Card>
        )
    }

    return (
        <Card title="Статистика по участникам команды" className={styles.developersCard} variant="borderless">
            <Row gutter={[16, 16]}>
                {developerStats.map((dev, index) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={dev.name}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
                            whileHover={{ scale: 1.02 }}
                        >
                            <Card size="small" className={styles.devCard}>
                                <div className={styles.devHeader}>
                                    <div className={styles.avatar}>
                                        <FaUser />
                                    </div>
                                    <Text strong className={styles.devName}>
                                        {dev.name}
                                    </Text>
                                    <Badge
                                        count={`${dev.efficiency}%`}
                                        style={{ backgroundColor: getEfficiencyColor(dev.efficiency) }}
                                    />
                                </div>
                                <div className={styles.devStats}>
                                    <div className={styles.devStat}>
                                        <FaCheckCircle className={styles.statIcon} />
                                        <Text>{dev.completedTasks} выполнено</Text>
                                    </div>
                                    <div className={styles.devStat}>
                                        <FaExclamationTriangle className={styles.statIcon} />
                                        <Text>{dev.overdueTasks} просрочено</Text>
                                    </div>
                                    <div className={styles.devStat}>
                                        <FaChartLine className={styles.statIcon} />
                                        <Text>{dev.totalTasks} всего</Text>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </Col>
                ))}
            </Row>
        </Card>
    )
}