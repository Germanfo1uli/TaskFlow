import type { ProjectStats, DeveloperStats, TaskProgressData, EfficiencyData, TaskDistributionData } from '../types/reports.types'
import type { Board, Card } from '../../DashboardContent/types/dashboard.types'
import { isValid, parseISO, differenceInDays } from 'date-fns'

const DEFAULT_STATS: ProjectStats = {
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
    averageCompletionTime: 0
}

export const calculateTaskStats = (boards: Board[]): ProjectStats => {
    if (!Array.isArray(boards) || boards.length === 0) return { ...DEFAULT_STATS }

    let totalTasks = 0
    let completedTasks = 0
    let inProgressTasks = 0
    let pendingTasks = 0
    let overdueTasks = 0
    const now = new Date()

    boards.forEach(board => {
        if (!board?.cards?.length) return

        const title = board.title?.toLowerCase() || ''
        const isDone = title.includes('done') || title.includes('готово') || title.includes('выполнено')
        const isProgress = title.includes('progress') || title.includes('в процессе') || title.includes('в работе')
        const isTodo = title.includes('todo') || title.includes('ожидание') || title.includes('к выполнению')

        board.cards.forEach(card => {
            if (!card) return
            totalTasks++

            if (isDone) completedTasks++
            else if (isProgress) inProgressTasks++
            else if (isTodo) pendingTasks++

            if (card.dueDate && !isDone) {
                const dueDate = parseISO(card.dueDate)
                if (isValid(dueDate) && dueDate < now) overdueTasks++
            }
        })
    })

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return {
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        overdueTasks,
        completionRate,
        averageCompletionTime: calculateAverageCompletionTime(boards)
    }
}

const calculateAverageCompletionTime = (boards: Board[]): number => {
    let totalTime = 0
    let completedCount = 0

    boards.forEach(board => {
        const title = board.title?.toLowerCase() || ''
        if (!title.includes('done') && !title.includes('готово') && !title.includes('выполнено')) return

        board.cards?.forEach(card => {
            if (!card?.createdAt || !card?.updatedAt) return
            const created = parseISO(card.createdAt)
            const updated = parseISO(card.updatedAt)
            if (!isValid(created) || !isValid(updated)) return

            const days = Math.abs(differenceInDays(updated, created))
            if (!isNaN(days)) {
                totalTime += days
                completedCount++
            }
        })
    })

    return completedCount > 0 ? Math.round((totalTime / completedCount) * 10) / 10 : 0
}

export const generateDeveloperStats = (boards: Board[]): DeveloperStats[] => {
    if (!Array.isArray(boards) || boards.length === 0) return getDemoDeveloperStats()

    const devMap = new Map<string, { completed: number; total: number; overdue: number }>()
    const now = new Date()

    boards.forEach(board => {
        if (!board?.cards?.length) return
        const isDone = board.title?.toLowerCase().includes('done') || board.title?.toLowerCase().includes('готово')

        board.cards.forEach(card => {
            if (!card) return

            // Ключевое исправление: если нет assignee, пропускаем карточку
            if (!card.assignee?.trim()) return

            const name = card.assignee.trim()
            const stats = devMap.get(name) || { completed: 0, total: 0, overdue: 0 }

            stats.total++
            if (isDone) stats.completed++

            if (card.dueDate && !isDone) {
                const dueDate = parseISO(card.dueDate)
                if (isValid(dueDate) && dueDate < now) stats.overdue++
            }

            devMap.set(name, stats)
        })
    })

    // Если нет разработчиков с назначенными задачами, возвращаем демо-данные
    if (devMap.size === 0) return getDemoDeveloperStats()

    return Array.from(devMap.entries())
        .map(([name, stats]) => ({
            name,
            completedTasks: stats.completed,
            overdueTasks: stats.overdue,
            efficiency: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
            totalTasks: stats.total
        }))
        .sort((a, b) => b.efficiency - a.efficiency)
}

export const generateProgressData = (boards: Board[]): TaskProgressData[] => {
    if (!Array.isArray(boards) || boards.length === 0) return getDemoProgressData()

    const progressMap = new Map<string, number>()

    boards.forEach(board => {
        board.cards?.forEach(card => {
            if (!card?.createdAt) return
            const date = parseISO(card.createdAt)
            if (!isValid(date)) return

            const key = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
            progressMap.set(key, (progressMap.get(key) || 0) + 1)
        })
    })

    if (progressMap.size === 0) return getDemoProgressData()

    const sortedEntries = Array.from(progressMap.entries())
        .sort(([a], [b]) => {
            const [dayA, monthA] = a.split('.')
            const [dayB, monthB] = b.split('.')
            return new Date(2024, parseInt(monthA) - 1, parseInt(dayA)).getTime() -
                new Date(2024, parseInt(monthB) - 1, parseInt(dayB)).getTime()
        })
        .slice(-7)

    let cumulative = 0
    return sortedEntries.map(([date, tasks]) => {
        cumulative += tasks
        return { date, tasks, cumulative }
    })
}

export const generateEfficiencyData = (developerStats: DeveloperStats[]): EfficiencyData[] => {
    if (!Array.isArray(developerStats) || developerStats.length === 0) return []
    return developerStats
        .filter(dev => dev.totalTasks > 0)
        .map(dev => ({
            developer: dev.name,
            efficiency: dev.efficiency,
            completed: dev.completedTasks,
            total: dev.totalTasks
        }))
}

export const generateTaskDistributionData = (stats: ProjectStats): TaskDistributionData[] => {
    if (!stats || stats.totalTasks === 0) return getDemoDistributionData()

    const distribution = [
        { type: 'Выполнено', value: stats.completedTasks, color: '#10b981' },
        { type: 'В процессе', value: stats.inProgressTasks, color: '#3b82f6' },
        { type: 'Ожидают', value: stats.pendingTasks, color: '#f59e0b' },
        { type: 'Просрочено', value: stats.overdueTasks, color: '#ef4444' }
    ].filter(item => item.value > 0)

    return distribution.length > 0 ? distribution : getDemoDistributionData()
}

function getDemoDeveloperStats(): DeveloperStats[] {
    return [
        { name: 'Иван Иванов', completedTasks: 8, overdueTasks: 0, efficiency: 92, totalTasks: 9 },
        { name: 'Петр Петров', completedTasks: 6, overdueTasks: 1, efficiency: 82, totalTasks: 7 },
        { name: 'Анна Сидорова', completedTasks: 10, overdueTasks: 0, efficiency: 100, totalTasks: 10 },
        { name: 'Мария Козлова', completedTasks: 3, overdueTasks: 2, efficiency: 70, totalTasks: 5 }
    ]
}

function getDemoProgressData(): TaskProgressData[] {
    const dates = ['01.12', '02.12', '03.12', '04.12', '05.12', '06.12', '07.12']
    const tasksPerDay = [2, 3, 1, 4, 2, 3, 1]
    let cumulative = 0
    return dates.map((date, i) => {
        cumulative += tasksPerDay[i]
        return { date, tasks: tasksPerDay[i], cumulative }
    })
}

function getDemoDistributionData(): TaskDistributionData[] {
    return [
        { type: 'Выполнено', value: 15, color: '#10b981' },
        { type: 'В процессе', value: 8, color: '#3b82f6' },
        { type: 'Ожидают', value: 5, color: '#f59e0b' },
        { type: 'Просрочено', value: 3, color: '#ef4444' }
    ]
}