'use client'

import { memo } from 'react'
import { Alert, Row, Col, Card, Spin, Empty, ConfigProvider } from 'antd'
import { motion, AnimatePresence } from 'framer-motion'
import { useReports } from './hooks/useReports'
import { ReportsHeader } from './components/ReportsHeader/ReportsHeader'
import { StatsCards } from './components/StatsCards/StatsCards'
import { DevelopersStats } from './components/DevelopersStats/DevelopersStats'
import { TaskDistributionChart, ProgressChart, EfficiencyChart, ProgressGauge } from './components/Charts'
import styles from './ReportsPage.module.css'

const MemoizedStatsCards = memo(StatsCards)
const MemoizedDevelopersStats = memo(DevelopersStats)

export default function ReportsPage() {
    const {
        stats,
        developerStats,
        progressData,
        efficiencyData,
        taskDistributionData,
        isLoading,
        dateRange,
        setDateRange,
        refreshData
    } = useReports()

    if (isLoading && stats.totalTasks === 0) {
        return (
            <div className={styles.reportsSection}>
                <div className={styles.loadingContainer}>
                    <Spin size="large" tip="Загрузка отчетов..." />
                </div>
            </div>
        )
    }

    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#3b82f6', borderRadius: 12 } }}>
            <div className={styles.reportsSection}>
                <ReportsHeader
                    isLoading={isLoading}
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                    onRefresh={refreshData}
                />

                <AnimatePresence>
                    {stats.overdueTasks > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                        >
                            <Alert
                                message={`Внимание! У вас есть ${stats.overdueTasks} просроченных задач`}
                                type="warning"
                                showIcon
                                closable
                                className={styles.alert}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <MemoizedStatsCards stats={stats} />

                <Row gutter={[16, 16]} className={styles.chartsRow}>
                    <Col xs={24} lg={12}>
                        <Card title="Распределение задач" variant="borderless" className={styles.chartCard} loading={isLoading}>
                            <TaskDistributionChart data={taskDistributionData} />
                        </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Card title="Прогресс выполнения" variant="borderless" className={styles.chartCard} loading={isLoading}>
                            <ProgressChart data={progressData} />
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} className={styles.chartsRow}>
                    <Col xs={24} lg={12}>
                        <Card title="Эффективность разработчиков" variant="borderless" className={styles.chartCard} loading={isLoading}>
                            <EfficiencyChart data={efficiencyData} />
                        </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Card title="Общий прогресс проекта" variant="borderless" className={styles.chartCard} loading={isLoading}>
                            <ProgressGauge completionRate={stats.completionRate} />
                        </Card>
                    </Col>
                </Row>

                <MemoizedDevelopersStats developerStats={developerStats} />
            </div>
        </ConfigProvider>
    )
}