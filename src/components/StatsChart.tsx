import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from './ui';

interface StatsProps {
    data: {
        recorded_date: string;
        total_intake: number;
        total_exercise: number;
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
export const StatsChart = React.memo(({ data, isDarkMode = false }: StatsProps) => {
    const [visibility, setVisibility] = React.useState({
        net: true,
        intake: true,
        exercise: true,
    });

    if (!data || data.length === 0) {
        return <div className="text-center py-10 text-gray-400">데이터가 충분하지 않습니다.</div>;
    }

    const toggleVisibility = (key: keyof typeof visibility) => {
        setVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <Card className="p-4 border-none shadow-none bg-transparent">
            <div className="flex flex-wrap items-center justify-between mb-4 px-2 gap-2">
                <h3 className="font-bold text-gray-700 dark:text-gray-200">기간별 추이</h3>
                <div className="flex items-center gap-3 text-sm">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={visibility.net}
                            onChange={() => toggleVisibility('net')}
                            className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-blue-600 dark:text-blue-400 font-medium">순칼로리</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={visibility.intake}
                            onChange={() => toggleVisibility('intake')}
                            className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-orange-600 dark:text-orange-400 font-medium">섭취</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={visibility.exercise}
                            onChange={() => toggleVisibility('exercise')}
                            className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                        />
                        <span className="text-purple-600 dark:text-purple-400 font-medium">운동</span>
                    </label>
                </div>
            </div>

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
                                id="colorNet"
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
                            <linearGradient
                                id="colorIntake"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#f97316"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#f97316"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                            <linearGradient
                                id="colorExercise"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#a855f7"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#a855f7"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke={isDarkMode ? '#374151' : '#E5E7EB'}
                        />
                        <XAxis
                            dataKey="recorded_date"
                            tick={{ fontSize: 12, fill: isDarkMode ? '#9CA3AF' : '#9CA3AF' }}
                            tickFormatter={(val) => val.substring(5)}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: isDarkMode ? '#9CA3AF' : '#9CA3AF' }}
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
                                fontSize: '12px',
                            }}
                            formatter={(value: any, name: any) => {
                                if (value === undefined) return [];
                                let label = String(name);
                                if (label === 'Intake') label = '섭취';
                                if (label === 'Exercise') label = '운동';
                                if (label === 'Net Calories') label = '순칼로리';
                                return [`${value} kcal`, label];
                            }}
                            labelFormatter={(label: any) => {
                                if (typeof label !== 'string') return '';
                                const [y, m, d] = label.split('-');
                                return `${y}년 ${m}월 ${d}일`;
                            }}
                        />
                        {visibility.intake && (
                            <Area
                                type="monotone"
                                dataKey="total_intake"
                                stroke="#f97316"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorIntake)"
                                name="Intake"
                            />
                        )}
                        {visibility.exercise && (
                            <Area
                                type="monotone"
                                dataKey="total_exercise"
                                stroke="#a855f7"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorExercise)"
                                name="Exercise"
                            />
                        )}
                        {visibility.net && (
                            <Area
                                type="monotone"
                                dataKey="net_calories"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorNet)"
                                name="Net Calories"
                            />
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
});

StatsChart.displayName = 'StatsChart';
