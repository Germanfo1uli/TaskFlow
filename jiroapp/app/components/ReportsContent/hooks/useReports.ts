import { useState, useEffect, useCallback, useMemo } from 'react'
import { useDashboard } from '../../DashboardContent/hooks/useDashboard'
import type {
    ProjectStats,
    DeveloperStats,
    TaskProgressData,
    EfficiencyData,
    TaskDistributionData,
    DateRange
} from '../types/reports.types'
import {
    calculateTaskStats,
    generateProgressData,
    generateDeveloperStats,
    generateEfficiencyData,
    generateTaskDistributionData
} from '../utils/reports.utils'

export const useReports = () => {
    const { boards } = useDashboard()
    const [isLoading, setIsLoading] = useState(true)
    const [dateRange, setDateRange] = useState<DateRange | null>(null)

    const calculatedStats = useMemo(() => {
        if (!boards || boards.length === 0) {
            return {
                stats: {
                    totalTasks: 31,
                    completedTasks: 15,
                    inProgressTasks: 8,
                    pendingTasks: 5,
                    overdueTasks: 3,
                    completionRate: 48,
                    averageCompletionTime: 3.2
                } as ProjectStats,
                developerStats: [
                    { name: 'Иван Иванов', completedTasks: 8, overdueTasks: 0, efficiency: 92, totalTasks: 9 },
                    { name: 'Петр Петров', completedTasks: 6, overdueTasks: 1, efficiency: 82, totalTasks: 7 },
                    { name: 'Анна Сидорова', completedTasks: 10, overdueTasks: 0, efficiency: 100, totalTasks: 10 },
                    { name: 'Мария Козлова', completedTasks: 3, overdueTasks: 2, efficiency: 70, totalTasks: 5 }
                ] as DeveloperStats[],
                progressData: generateProgressData([]),
                efficiencyData: [] as EfficiencyData[],
                taskDistributionData: generateTaskDistributionData({
                    totalTasks: 31,
                    completedTasks: 15,
                    inProgressTasks: 8,
                    pendingTasks: 5,
                    overdueTasks: 3,
                    completionRate: 48,
                    averageCompletionTime: 3.2
                })
            }
        }

        try {
            const stats = calculateTaskStats(boards)
            const devStats = generateDeveloperStats(boards)
            const progress = generateProgressData(boards)
            const efficiency = generateEfficiencyData(devStats)
            const distribution = generateTaskDistributionData(stats)

            return { stats, developerStats: devStats, progressData: progress, efficiencyData: efficiency, taskDistributionData: distribution }
        } catch (error) {
            console.error('Ошибка расчета статистики:', error)
            return {
                stats: DEFAULT_STATS,
                developerStats: [],
                progressData: generateProgressData([]),
                efficiencyData: [],
                taskDistributionData: generateTaskDistributionData(DEFAULT_STATS)
            }
        }
    }, [boards])

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 400)
        return () => clearTimeout(timer)
    }, [calculatedStats])

    const handleDateRangeChange = useCallback((dates: [Date, Date] | null) => {
        if (dates && dates[0] && dates[1]) {
            setDateRange({ startDate: dates[0], endDate: dates[1] })
        } else {
            setDateRange(null)
        }
    }, [])

    const refreshData = useCallback(() => {
        setIsLoading(true)
        setTimeout(() => setIsLoading(false), 400)
    }, [])

    return {
        ...calculatedStats,
        isLoading,
        dateRange,
        setDateRange: handleDateRangeChange,
        refreshData
    }
}

const DEFAULT_STATS: ProjectStats = {
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
    averageCompletionTime: 0
}