import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from './ui';

interface StatsProps {
    data: {
        recorded_date: string;
        net_calories: number;
        total_protein: number;
    }[];
    isDarkMode?: boolean;
}

/**
 * 사용자의 칼로리 소비 추이를 시각화하는 차트 컴포넌트입니다.
 * Recharts를 사용하여 일자별 순 칼로리 변화를 AreaChart로 표시합니다.
 * 
 * @author 윤명준 (MJ Yune)
 * @since 2026-01-28
 * @param {StatsProps} props 컴포넌트 속성
 * @returns {JSX.Element} 통계 차트 UI
 */
export const StatsChart: React.FC<StatsProps> = ({ data, isDarkMode = false }) => {
    if (!data || data.length === 0) {
        return <div className="text-center py-10 text-gray-400">Not enough data to display chart.</div>;
    }

    return (
        <Card className="p-4 border-none shadow-none bg-transparent">
            <h3 className="font-bold text-gray-700 mb-4 px-2">Net Calories Trend</h3>
            <div className="h-[250px] w-full">
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient
                                id="colorCalories"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#3b82f6"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#3b82f6"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#E5E7EB"
                        />
                        <XAxis
                            dataKey="recorded_date"
                            tick={{ fontSize: 12, fill: '#9CA3AF' }}
                            tickFormatter={(val) => val.substring(5)} // Show MM-DD
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: '#9CA3AF' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                                color: isDarkMode ? '#f3f4f6' : '#111827',
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="net_calories"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorCalories)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
