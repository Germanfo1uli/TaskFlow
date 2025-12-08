import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import type { RadialBarChartProps } from 'recharts'

interface ProgressGaugeProps {
    completionRate: number
}

export const ProgressGauge = ({ completionRate }: ProgressGaugeProps) => {
    const validRate = isNaN(completionRate) ? 0 : Math.max(0, Math.min(100, completionRate))
    const color = validRate >= 70 ? '#10b981' : validRate >= 40 ? '#f59e0b' : '#ef4444'

    const data = [{ name: 'Завершено', value: validRate, fill: color }]

    return (
        <div style={{ width: '100%', height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={250}>
                <RadialBarChart
                    data={data}
                    startAngle={210}
                    endAngle={-30}
                    innerRadius="70%"
                    outerRadius="85%"
                >
                    <PolarAngleAxis
                        type="number"
                        domain={[0, 100]}
                        tick={false}
                    />
                    <RadialBar
                        background
                        dataKey="value"
                        cornerRadius={10}
                    />
                </RadialBarChart>
            </ResponsiveContainer>
            <div style={{ textAlign: 'center', marginTop: -30 }}>
                <div style={{ fontSize: 16, color: '#64748b', fontWeight: 500 }}>Завершено</div>
                <div style={{ fontSize: 32, fontWeight: 800, color }}>{validRate.toFixed(0)}%</div>
            </div>
        </div>
    )
}