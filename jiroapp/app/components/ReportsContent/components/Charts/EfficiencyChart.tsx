import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { EfficiencyData } from '../../types/reports.types'

interface EfficiencyChartProps {
    data: EfficiencyData[]
}

export const EfficiencyChart = ({ data }: EfficiencyChartProps) => {
    const chartData = data.length > 0 ? data.map(item => ({
        ...item,
        developer: item.developer || 'Неизвестный',
        efficiency: typeof item.efficiency === 'number' ? item.efficiency : 0
    })) : [{ developer: 'Нет данных', efficiency: 0, completed: 0, total: 0 }]

    const getColor = (efficiency: number) => {
        if (efficiency >= 90) return '#10b981'
        if (efficiency >= 75) return '#3b82f6'
        if (efficiency >= 60) return '#f59e0b'
        return '#ef4444'
    }

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.1)" />
                    <XAxis
                        dataKey="developer"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value: string) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
                    />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{ borderRadius: 12, border: '1px solid rgba(59, 130, 246, 0.2)' }}
                        formatter={(value: number, name: string, props: any) => {
                            if (name === 'efficiency') return [`${value}%`, 'Эффективность']
                            return [value, name]
                        }}
                        labelFormatter={(label: string) => `Разработчик: ${label}`}
                    />
                    <Bar dataKey="efficiency">
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getColor(entry.efficiency)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}