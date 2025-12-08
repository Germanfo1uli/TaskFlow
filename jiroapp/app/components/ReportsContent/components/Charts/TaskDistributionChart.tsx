import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { TaskDistributionData } from '../../types/reports.types'

interface TaskDistributionChartProps {
    data: TaskDistributionData[]
}

export const TaskDistributionChart = ({ data }: TaskDistributionChartProps) => {
    const chartData = data.length > 0 ? data : [{ type: 'Нет данных', value: 0, color: '#d1d5db' }]

    const total = chartData.reduce((sum, item) => sum + item.value, 0)

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="type"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={2}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} stroke="#fff" strokeWidth={2} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ borderRadius: 12, border: '1px solid rgba(59, 130, 246, 0.2)' }}
                        formatter={(value: number, name: string) => [`${value} задач`, name]}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div style={{ textAlign: 'center', marginTop: -45 }}>
                <div style={{ fontSize: 16, color: '#64748b', fontWeight: 600, }}>Всего</div>
                <div style={{ fontSize: 24, color: '#1e293b', fontWeight: 800 }}>{total}</div>
            </div>
        </div>
    )
}