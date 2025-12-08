export interface ProjectStats {
    totalTasks: number
    completedTasks: number
    inProgressTasks: number
    pendingTasks: number
    overdueTasks: number
    completionRate: number
    averageCompletionTime: number
}

export interface DeveloperStats {
    name: string
    completedTasks: number
    overdueTasks: number
    efficiency: number
    totalTasks: number
}

export interface TaskProgressData {
    date: string
    tasks: number
    cumulative: number
}

export interface EfficiencyData {
    developer: string
    efficiency: number
    completed: number
    total: number
}

export interface TaskDistributionData {
    type: string
    value: number
    color?: string
}

export interface DateRange {
    startDate: Date | null
    endDate: Date | null
}