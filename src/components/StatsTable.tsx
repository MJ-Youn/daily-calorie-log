import React, { useMemo } from 'react';
import { formatDate } from '../lib/dateUtils';
import { Card } from './ui';
import { Utensils, Activity, Flame } from 'lucide-react';

interface StatsTableProps {
    data: {
        recorded_date: string;
        total_intake: number;
        total_exercise: number;
        net_calories: number;
        total_protein: number;
    }[];
}

/**
 * 통계 데이터를 테이블 형태로 보여주는 컴포넌트입니다.
 *
 * @author 윤명준 (MJ Yune)
 * @since 2026-01-29
 */
export const StatsTable: React.FC<StatsTableProps> = ({ data }) => {
    // 날짜 내림차순 정렬 (최신순) - useMemo를 사용하여 데이터가 변경될 때만 정렬 수행
    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => new Date(b.recorded_date).getTime() - new Date(a.recorded_date).getTime());
    }, [data]);

    return (
        <Card className="overflow-hidden border-none shadow-none bg-white dark:bg-slate-900/50 ring-1 ring-gray-200 dark:ring-slate-800">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-700 dark:text-gray-300">
                        <tr>
                            <th className="px-4 py-3 font-medium">날짜</th>
                            <th className="px-4 py-3 font-medium text-right text-orange-600 dark:text-orange-400">
                                <div className="flex items-center justify-end gap-1">
                                    <Utensils className="w-3.5 h-3.5" /> 섭취
                                </div>
                            </th>
                            <th className="px-4 py-3 font-medium text-right text-purple-600 dark:text-purple-400">
                                <div className="flex items-center justify-end gap-1">
                                    <Activity className="w-3.5 h-3.5" /> 운동
                                </div>
                            </th>
                            <th className="px-4 py-3 font-medium text-right text-blue-600 dark:text-blue-400">
                                <div className="flex items-center justify-end gap-1">
                                    <Flame className="w-3.5 h-3.5" /> 순칼로리
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                        {sortedData.map((item) => (
                            <tr
                                key={item.recorded_date}
                                className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors"
                            >
                                <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">{formatDate(item.recorded_date, { month: 'long', day: 'numeric', weekday: 'short' })}</td>
                                <td className="px-4 py-3 text-right tabular-nums text-gray-700 dark:text-gray-300">{item.total_intake.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right tabular-nums text-gray-700 dark:text-gray-300">{item.total_exercise.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right tabular-nums font-bold text-gray-900 dark:text-gray-100">{item.net_calories.toLocaleString()}</td>
                            </tr>
                        ))}
                        {sortedData.length === 0 && (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                                >
                                    데이터가 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};
