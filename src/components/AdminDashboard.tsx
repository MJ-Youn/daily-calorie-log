import React, { useEffect, useState } from 'react';
import { cn } from '../lib/utils';
import { Card } from './ui';
import { Users, FileText, Activity, ExternalLink, Search as SearchIcon } from 'lucide-react';

interface AdminStats {
    totalUsers: number;
    totalLogs: number;
    filteredTotal: number;
    recentLogs: any[];
    totalPages: number;
}

/**
 * 관리자 전용 대시보드 컴포넌트입니다.
 * 전체 사용자 통계와 최근 활동 로그를 관리하며 검색 및 페이징 기능을 제공합니다.
 * 
 * @author 윤명준 (MJ Yune)
 * @since 2026-01-28
 */
export const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [activeSearchQuery, setActiveSearchQuery] = useState('');

    const handleSearch = () => {
        setLoading(true);
        setActiveSearchQuery(search);
        setPage(1);
    };

    const handleLimitChange = (newLimit: number) => {
        setLoading(true);
        setLimit(newLimit);
        setPage(1);
    };

    const handlePageChange = (newPage: number) => {
        setLoading(true);
        setPage(newPage);
    };

    useEffect(() => {
        let isMounted = true;
        
        const query = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            search: activeSearchQuery,
        });

        fetch(`/api/admin/summary?${query.toString()}`)
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                if (isMounted) {
                    setStats(data);
                }
            })
            .catch(() => {
                // 관리자 통계 조회 실패 시 아무것도 하지 않음
            })
            .finally(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [page, limit, activeSearchQuery]);

    if (loading && !stats) {
        return <div className="p-4 text-xs text-gray-500 dark:text-gray-400">Loading admin data...</div>;
    }
    if (!stats) {
        return <div className="p-4 text-xs text-red-500">Failed to load data.</div>;
    }

    return (
        <div className={cn('space-y-4 animate-in fade-in duration-300 transition-opacity', loading ? 'opacity-60 pointer-events-none' : 'opacity-100')}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b dark:border-gray-800 pb-2 flex items-center justify-between">
                Admin Dashboard
                <span className="text-[10px] font-normal text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">v1.0</span>
            </h2>

            {/* Overview Cards */}
            <div className="grid grid-cols-2 gap-3">
                <Card className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-3 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Total Users</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                        <Users className="w-5 h-5" />
                    </div>
                </Card>
                <Card className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-3 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Total Logs</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalLogs}</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg text-emerald-600 dark:text-emerald-400">
                        <FileText className="w-5 h-5" />
                    </div>
                </Card>
            </div>

            {/* Recent System Activity */}
            <div className="bg-white dark:bg-gray-900 rounded-none border dark:border-gray-800 p-3 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
                    <h3 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 text-sm">
                        <Activity className="w-4 h-4" /> Global Recent Activity
                    </h3>
                    <div className="flex gap-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="text-xs pl-2 pr-7 py-1 rounded-none border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                            />
                            <button
                                onClick={handleSearch}
                                className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                            >
                                <SearchIcon className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <select
                            value={limit}
                            onChange={(e) => {
                                handleLimitChange(Number(e.target.value));
                            }}
                            className="text-xs px-2 py-1 rounded-none border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none cursor-pointer"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto min-h-[300px]">
                    <div className="w-full text-xs text-left">
                        {/* Table Header */}
                        <div className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-b dark:border-gray-700 grid grid-cols-4 font-medium sticky top-0">
                            <div className="px-3 py-2">User</div>
                            <div className="px-3 py-2">Content</div>
                            <div className="px-3 py-2">Type</div>
                            <div className="px-3 py-2">Date</div>
                        </div>
                        {/* Table Body */}
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {stats.recentLogs?.length === 0 ? (
                                <div className="p-4 text-center text-gray-400">No logs found.</div>
                            ) : (
                                stats.recentLogs?.map((log: any) => (
                                    <div
                                        key={log.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors grid grid-cols-4 items-center"
                                    >
                                        <div className="px-3 py-2">
                                            <div
                                                className="font-medium text-gray-900 dark:text-gray-200 truncate"
                                                title={log.name}
                                            >
                                                {log.name}
                                            </div>
                                            <div
                                                className="text-[10px] text-gray-400 dark:text-gray-500 truncate"
                                                title={log.email}
                                            >
                                                {log.email}
                                            </div>
                                        </div>
                                        <div
                                            className="px-3 py-2 text-gray-600 dark:text-gray-400 truncate"
                                            title={log.content}
                                        >
                                            {log.content}
                                        </div>
                                        <div className="px-3 py-2">
                                            <span
                                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                                    log.type === 'FOOD'
                                                        ? 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/30'
                                                        : 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-900/30'
                                                }`}
                                            >
                                                {log.type}
                                            </span>
                                        </div>
                                        <div className="px-3 py-2 text-gray-400 dark:text-gray-500 text-[10px]">{new Date(log.recorded_date).toLocaleDateString()}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between px-2 pt-2 text-xs border-t dark:border-gray-800 mt-2">
                    <span className="text-gray-500 dark:text-gray-400">Total {stats.filteredTotal} items</span>
                    <div className="flex gap-1">
                        <button
                            onClick={() => {
                                handlePageChange(Math.max(1, page - 1));
                            }}
                            disabled={page === 1}
                            className="px-2 py-1 rounded-none border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            Prev
                        </button>
                        <span className="px-2 py-1 text-gray-600 dark:text-gray-300 font-medium">
                            {page} / {stats.totalPages || 1}
                        </span>
                        <button
                            onClick={() => {
                                handlePageChange(Math.min(stats.totalPages || 1, page + 1));
                            }}
                            disabled={page >= (stats.totalPages || 1)}
                            className="px-2 py-1 rounded-none border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* System Status */}
            <SystemStatus />
        </div>
    );
};

/**
 * 시스템 통합 상태 및 외부 링크를 표시하는 보호된 컴포넌트입니다.
 * 
 * @author 윤명준 (MJ Yune)
 * @since 2026-01-28
 */
const SystemStatus: React.FC = () => {
    const [status, setStatus] = useState<any>(null);

    useEffect(() => {
        fetch('/api/admin/status')
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                setStatus(data);
            })
            .catch(() => {
                // 상태 체크 실패 시 아무것도 하지 않음
            });
    }, []);

    if (!status) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-none border dark:border-gray-800 p-3 shadow-sm">
            <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2 text-sm">
                <Activity className="w-4 h-4" /> System Status & Links
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <StatusItem
                    label="Google Cloud"
                    status={status.google?.status}
                    message={status.google?.message}
                    href="https://console.cloud.google.com/"
                />
                <StatusItem
                    label="Gemini AI Studio"
                    status={status.gemini?.status}
                    message={status.gemini?.message}
                    href="https://aistudio.google.com/"
                />
                <StatusItem
                    label="Cloudflare Dash"
                    status={status.cloudflare?.status}
                    message={status.cloudflare?.message}
                    href="https://dash.cloudflare.com/"
                />
                <StatusItem
                    label="D1 Database"
                    status={status.d1?.status}
                    message={status.d1?.message}
                    href="https://dash.cloudflare.com/?to=/:account/workers/d1"
                />
            </div>
        </div>
    );
};

/**
 * 개별 시스템 상태 항목을 렌더링합니다.
 * 
 * @author 윤명준 (MJ Yune)
 * @since 2026-01-28
 * @param {Object} props - 컴포넌트 속성
 * @param {string} props.label - 표시할 서비스 이름
 * @param {string} props.status - 현재 상태 (OK 등)
 * @param {string} props.message - 상세 메시지
 * @param {string} props.href - 클릭 시 이동할 외부 주소
 */
const StatusItem = ({ label, status, message, href }: { label: string; status: string; message: string; href: string }) => {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-none border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col gap-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
        >
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors">{label}</span>
                <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
            </div>
            <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${status === 'OK' ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={`font-bold text-xs ${status === 'OK' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>{status}</span>
            </div>
            <span
                className="text-[10px] text-gray-400 dark:text-gray-500 truncate"
                title={message}
            >
                {message}
            </span>
        </a>
    );
};
