import { Typography, Button, Space, DatePicker, Tooltip, ConfigProvider } from 'antd'
import { FaChartLine, FaSync, FaCalendarAlt } from 'react-icons/fa'
import { motion } from 'framer-motion'
import type { DateRange } from '../../types/reports.types'
import styles from './ReportsHeader.module.css'

const { RangePicker } = DatePicker

interface ReportsHeaderProps {
    isLoading: boolean
    dateRange: DateRange | null
    onDateRangeChange: (dates: [Date, Date] | null) => void
    onRefresh: () => void
}

export const ReportsHeader = ({ isLoading, dateRange, onDateRangeChange, onRefresh }: ReportsHeaderProps) => {
    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#3b82f6', borderRadius: 12 } }}>
            <motion.div
                className={styles.reportsHeader}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
            >
                <div className={styles.headerTop}>
                    <div className={styles.titleSection}>
                        <div className={styles.titleRow}>
                            <Typography.Title level={1} className={styles.pageTitle}>
                                <FaChartLine className={styles.titleIcon} />
                                Отчеты по проекту
                            </Typography.Title>
                            <Button
                                type="primary"
                                onClick={onRefresh}
                                loading={isLoading}
                                icon={<FaSync />}
                                className={styles.refreshButton}
                                size="large"
                            >
                                Обновить
                            </Button>
                        </div>
                        <Typography.Text className={styles.pageSubtitle}>
                            Аналитика производительности и отслеживание прогресса проекта
                        </Typography.Text>
                    </div>
                </div>
            </motion.div>
        </ConfigProvider>
    )
}