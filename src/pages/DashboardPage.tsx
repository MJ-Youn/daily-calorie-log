import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';
import { Card, Button } from '../components/ui';
import { StatsChart } from '../components/StatsChart';
import { AdminDashboard } from '../components/AdminDashboard';
import { Send, Utensils, Activity, LogOut, CheckCircle, BarChart3, List, ShieldAlert, Sun, Moon, Trash2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface Log {
    id: number;
    type: 'FOOD' | 'EXERCISE';
    content: string;
    calories: number;
    protein: number;
    created_at: string;
    recorded_date: string;
    category?: string;
}

interface StatData {
    recorded_date: string;
    net_calories: number;
    total_protein: number;
}

interface AnalyzedItem {
    type: 'FOOD' | 'EXERCISE';
    name: string;
    calories: number;
    protein: number;
    category?: string;
}

/**
 * 메인 대시보드 페이지 컴포넌트입니다.
 * 사용자의 일일 섭취 및 운동량을 기록하고, AI 분석 기능을 통한 데이터 시각화를 제공합니다.
 * 
 * @author 윤명준 (MJ Yune)
 * @since 2026-01-28
 */
export const DashboardPage: React.FC = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const [inputMode, setInputMode] = useState<'BULK' | 'STRUCTURED'>('BULK');
    const [inputs, setInputs] = useState({
        bulk: '',
        breakfast: '',
        lunch: '',
        dinner: '',
        snack: '',
        morningExercise: '',
        eveningExercise: '',
    });

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [analyzedData, setAnalyzedData] = useState<{ items: AnalyzedItem[] } | null>(null);
    const [logs, setLogs] = useState<Log[]>([]);
    const [statsData, setStatsData] = useState<StatData[]>([]);
    const [viewMode, setViewMode] = useState<'LOG' | 'STATS' | 'ADMIN'>('LOG');
    const [statsRange, setStatsRange] = useState<'7' | '30' | 'ALL'>('ALL');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const bulkInputRef = React.useRef<HTMLTextAreaElement>(null);

    // Derived state to check if we have any input
    const hasAnyInput = inputMode === 'BULK' ? inputs.bulk.trim() !== '' : Object.entries(inputs).some(([k, v]) => {
        return k !== 'bulk' && v.trim() !== '';
    });

    // Use a simple boolean to control visibility if needed, but viewMode 'LOG' is primary.
    const inputsViewMode = viewMode === 'LOG';

    const handleInputChange = (field: string, value: string) => {
        setInputs((prev) => {
            return { ...prev, [field]: value };
        });
    };

    const fetchStats = React.useCallback(async () => {
        try {
            const res = await fetch(`/api/stats/summary?range=${statsRange}`);
            const data = await res.json();
            if (data.stats) {
                setStatsData(data.stats);
            }
        } catch {
            // 통계 조회 실패 시 아무것도 하지 않음
        }
    }, [statsRange]);

    const fetchLogs = React.useCallback(async () => {
        try {
            const res = await fetch(`/api/logs/list?date=${selectedDate}`);
            const data = await res.json();
            if (data.logs) {
                setLogs(data.logs);
            }

            fetchStats();
        } catch {
            // 로그 조회 실패 시 아무것도 하지 않음
        }
    }, [selectedDate, fetchStats]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    useEffect(() => {
        if (viewMode === 'STATS') {
            fetchStats();
        }
    }, [viewMode, fetchStats]);

    const handlePrevDate = () => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() - 1);
        setSelectedDate(d.toISOString().split('T')[0]);
    };

    const handleNextDate = () => {
        const today = new Date().toISOString().split('T')[0];
        if (selectedDate < today) {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() + 1);
            setSelectedDate(d.toISOString().split('T')[0]);
        }
    };

    const handleAnalyze = async () => {
        if (!hasAnyInput) return;

        setIsAnalyzing(true);
        setAnalyzedData(null);

        // Construct single proper text for AI based on mode
        let fullText = '';

        if (inputMode === 'BULK') {
            fullText = inputs.bulk;
        } else {
            fullText = [
                inputs.breakfast ? `아침 식사: ${inputs.breakfast}` : '',
                inputs.lunch ? `점심 식사: ${inputs.lunch}` : '',
                inputs.dinner ? `저녁 식사: ${inputs.dinner}` : '',
                inputs.snack ? `간식: ${inputs.snack}` : '',
                inputs.morningExercise ? `아침 운동: ${inputs.morningExercise}` : '',
                inputs.eveningExercise ? `저녁 운동: ${inputs.eveningExercise}` : '',
            ]
                .filter(Boolean)
                .join('\n');
        }

        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: fullText }),
            });
            const data = await res.json();
            // AI 분석 결과 확인 (개발 단계에서만 사용)
            if (data.error) {
                throw new Error(data.error);
            }

            // Ensure data has items array
            if (!data.items || !Array.isArray(data.items)) {
                // Fallback if valid single object returned (though we updated API)
                if (data.name) {
                    setAnalyzedData({ items: [data] });
                } else {
                    throw new Error('Invalid response format');
                }
            } else {
                setAnalyzedData(data);
            }
        } catch (error) {
            alert('분석 실패: ' + error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setAnalyzedData(null);
            }
        };
        if (analyzedData) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [analyzedData]);

    const handleSave = async () => {
        if (!analyzedData || !analyzedData.items || analyzedData.items.length === 0) return;
        setIsSaving(true);
        try {
            const payload = {
                items: analyzedData.items,
                recorded_date: selectedDate,
            };

            const res = await fetch('/api/logs/batch_create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                // 입력 필드 초기화
                setInputs({
                    bulk: '',
                    breakfast: '',
                    lunch: '',
                    dinner: '',
                    snack: '',
                    morningExercise: '',
                    eveningExercise: '',
                });
                if (bulkInputRef.current) {
                    bulkInputRef.current.style.height = 'auto';
                }
                setAnalyzedData(null);
                fetchLogs();
            }
        } catch {
            // 저장 실패 시 처리
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('정말 삭제하시겠습니까?')) {
            return;
        }
        try {
            const res = await fetch('/api/logs/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            if (res.ok) {
                fetchLogs();
            } else {
                alert('삭제 실패');
            }
        } catch {
            // 삭제 중 오류 발생 시 아무것도 하지 않음
        }
    };

    const removeItem = (index: number) => {
        if (!analyzedData) return;
        const newItems = [...analyzedData.items];
        newItems.splice(index, 1);
        setAnalyzedData({ items: newItems });
    };

    const updateCategory = (index: number, newCategory: string) => {
        if (!analyzedData) return;
        const newItems = [...analyzedData.items];
        newItems[index].category = newCategory;
        setAnalyzedData({ items: newItems });
    };

    const totalFoodCalories = logs.filter((l) => l.type === 'FOOD').reduce((sum, log) => sum + log.calories, 0);
    const totalExerciseCalories = logs.filter((l) => l.type !== 'FOOD').reduce((sum, log) => sum + Math.abs(log.calories), 0);
    const totalNetCalories = totalFoodCalories - totalExerciseCalories;
    const totalProtein = logs.reduce((sum, log) => sum + (log.protein || 0), 0);

    // Group logs by category for display
    const groupedLogs = React.useMemo(() => {
        const groups: Record<string, Log[]> = {
            아침: [],
            점심: [],
            저녁: [],
            간식: [],
            운동: [],
            기타: [],
        };

        logs.forEach((log) => {
            let key = '기타';
            if (log.type === 'EXERCISE') key = '운동';
            else if (log.category === 'BREAKFAST') key = '아침';
            else if (log.category === 'LUNCH') key = '점심';
            else if (log.category === 'DINNER') key = '저녁';
            else if (log.category === 'SNACK') key = '간식';
            else if (log.category === 'MORNING_EXERCISE' || log.category === 'EVENING_EXERCISE') key = '운동'; // backend might verify this

            if (!groups[key]) groups[key] = []; // Fallback
            groups[key].push(log);
        });
        return groups;
    }, [logs]);

    const CATEGORY_OPTIONS = [
        { value: 'BREAKFAST', label: '아침' },
        { value: 'LUNCH', label: '점심' },
        { value: 'DINNER', label: '저녁' },
        { value: 'SNACK', label: '간식' },
        { value: 'MORNING_EXERCISE', label: '아침 운동' },
        { value: 'EVENING_EXERCISE', label: '저녁 운동' },
        { value: 'OTHER', label: '기타' },
    ];

    return (
        <div className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
            {/* Header */}
            <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {user?.picture ? (
                            <img
                                src={user.picture}
                                alt={user.name}
                                className="w-10 h-10 rounded-full border-2 border-primary/20"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">{user?.name?.[0]}</div>
                        )}
                        <div>
                            <h1 className="font-bold text-lg leading-tight dark:text-white">안녕하세요, {user?.name}님</h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{selectedDate}</p>
                        </div>
                    </div>

                    <div className="flex gap-2 items-center">
                        <button
                            onClick={() => {
                                toggleTheme();
                            }}
                            className="p-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition relative z-50 cursor-pointer"
                        >
                            {theme === 'dark' ? (
                                <Sun className="w-5 h-5" />
                            ) : (
                                <Moon className="w-5 h-5" />
                            )}
                        </button>
                        <button
                            onClick={logout}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="로그아웃"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-3 py-3 space-y-3">
                {/* Date & View Toggle Header */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handlePrevDate}
                            className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                            title="이전 날짜"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-extrabold dark:text-white flex items-center gap-2">
                            {new Date(selectedDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}

                            <button
                                onClick={() => (document.querySelector('input[type="date"]') as HTMLInputElement)?.showPicker()}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-primary transition-colors relative"
                                title="날짜 선택"
                            >
                                <Calendar className="w-5 h-5" />
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </button>
                        </h2>
                        <button
                            onClick={handleNextDate}
                            disabled={selectedDate >= new Date().toISOString().split('T')[0]}
                            className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                            title="다음 날짜"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex bg-gray-100 dark:bg-slate-900 p-1 border border-gray-200 dark:border-slate-800">
                            <button
                                onClick={() => setViewMode('LOG')}
                                className={cn(
                                    'p-1.5 transition-all flex items-center gap-2 px-3',
                                    viewMode === 'LOG' ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-medium border border-gray-200 dark:border-slate-700 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-slate-300',
                                )}
                            >
                                <List className="w-4 h-4" /> 기록
                            </button>
                            <button
                                onClick={() => {
                                    setViewMode('STATS');
                                    fetchStats();
                                }}
                                className={cn(
                                    'p-1.5 transition-all flex items-center gap-2 px-3',
                                    viewMode === 'STATS' ? 'bg-white dark:bg-slate-800 text-primary font-medium border border-gray-200 dark:border-slate-700 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-slate-300',
                                )}
                            >
                                <BarChart3 className="w-4 h-4" /> 통계
                            </button>
                            {user?.role === 'ADMIN' && (
                                <button
                                    onClick={() => setViewMode('ADMIN')}
                                    className={cn('p-1.5 transition-all flex items-center gap-2 px-3', viewMode === 'ADMIN' ? 'bg-white dark:bg-slate-800 shadow text-red-500 font-medium border border-gray-200 dark:border-slate-700' : 'text-gray-400 hover:text-gray-600 dark:hover:text-slate-300')}
                                >
                                    <ShieldAlert className="w-4 h-4" /> 관리자
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Daily Summary Compact Grid */}
                {/* Daily Summary Compact Grid */}
                <div className="grid grid-cols-4 gap-2">
                    <Card className="bg-white dark:bg-slate-900/50 border-none shadow-none p-2 flex flex-col items-center justify-center text-center ring-1 ring-gray-100 dark:ring-slate-800">
                        <span className="text-[10px] text-gray-500 dark:text-slate-400 font-medium mb-1">섭취</span>
                        <span className="text-base font-bold text-gray-900 dark:text-white">{Math.round(totalFoodCalories)}</span>
                    </Card>
                    <Card className="bg-white dark:bg-slate-900/50 border-none shadow-none p-2 flex flex-col items-center justify-center text-center ring-1 ring-gray-100 dark:ring-slate-800">
                        <span className="text-[10px] text-gray-500 dark:text-slate-400 font-medium mb-1">운동</span>
                        <span className="text-base font-bold text-gray-900 dark:text-white">-{Math.round(totalExerciseCalories)}</span>
                    </Card>
                    <Card className="col-span-1 bg-blue-600 dark:bg-blue-500/10 text-white dark:text-blue-400 border-none dark:border dark:border-blue-500/20 shadow-none p-2 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] text-blue-100 dark:text-blue-400/70 font-medium mb-1">순칼로리</span>
                        <span className="text-base font-bold">{Math.round(totalNetCalories)}</span>
                    </Card>
                    <Card className="bg-emerald-600 dark:bg-emerald-500/10 text-white dark:text-emerald-400 border-none dark:border dark:border-emerald-500/20 shadow-none p-2 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] text-emerald-100 dark:text-emerald-400/70 font-medium mb-1">단백질</span>
                        <span className="text-base font-bold">{Math.round(totalProtein)}g</span>
                    </Card>
                </div>

                {viewMode !== 'ADMIN' && inputsViewMode && (
                    <div className="space-y-6">
                        {/* Input Mode Toggle */}
                        <div className="flex justify-center mb-2">
                            <div className="bg-gray-100 dark:bg-slate-900 p-1 flex text-sm font-medium border border-gray-200 dark:border-slate-800">
                                <button
                                    onClick={() => setInputMode('BULK')}
                                    className={cn(
                                        'px-4 py-1.5 transition-all flex items-center gap-2',
                                        inputMode === 'BULK' ? 'bg-white dark:bg-slate-800 text-primary border border-gray-200 dark:border-slate-700 shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white',
                                    )}
                                >
                                    <List className="w-4 h-4" /> 간편 입력 (한번에)
                                </button>
                                <button
                                    onClick={() => setInputMode('STRUCTURED')}
                                    className={cn(
                                        'px-4 py-1.5 transition-all flex items-center gap-2',
                                        inputMode === 'STRUCTURED' ? 'bg-white dark:bg-slate-800 text-primary border border-gray-200 dark:border-slate-700 shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white',
                                    )}
                                >
                                    <Utensils className="w-4 h-4" /> 상세 입력 (나눠서)
                                </button>
                            </div>
                        </div>

                        {inputMode === 'BULK' ? (
                            <Card className="border-gray-200 dark:border-gray-800 shadow-none p-0 overflow-hidden dark:bg-gray-900">
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-400">
                                    💡 하루 동안 먹은 음식과 운동을 자유롭게 적어주세요. AI가 알아서 분류해줍니다.
                                </div>
                                <div className="p-4">
                                    <textarea
                                        value={inputs.bulk}
                                        onChange={(e) => {
                                            handleInputChange('bulk', e.target.value);
                                            e.target.style.height = 'auto';
                                            e.target.style.height = e.target.scrollHeight + 'px';
                                        }}
                                        rows={2}
                                        ref={bulkInputRef}
                                        placeholder={`아침: 사과 1개, 계란 2개\n점심: 김치찌개\n저녁 운동: 런닝 30분\n...`}
                                        className="w-full min-h-[3.5rem] resize-none border-none focus:ring-0 bg-transparent text-sm placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-600 overflow-hidden"
                                    />
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
                                    <Button
                                        onClick={handleAnalyze}
                                        disabled={!hasAnyInput || isAnalyzing}
                                        className="px-6 py-2 bg-gray-900 hover:bg-black text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 transition-all text-sm font-bold"
                                    >
                                        {isAnalyzing ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                                분석 중...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4 mr-2" /> 분석 및 저장
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Card>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {/* Food Section */}
                                <Card className="border-gray-200 dark:border-gray-800 shadow-none p-5 dark:bg-gray-900">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                                        <div className="bg-orange-100 dark:bg-orange-900/50 p-1.5 text-orange-600 dark:text-orange-400">
                                            <Utensils className="w-5 h-5" />
                                        </div>
                                        식단 기록
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {[
                                            { id: 'breakfast', label: '아침', placeholder: '사과 1개, 계란 2개...' },
                                            { id: 'lunch', label: '점심', placeholder: '김치찌개, 공기밥 1개...' },
                                            { id: 'dinner', label: '저녁', placeholder: '닭가슴살 샐러드...' },
                                            { id: 'snack', label: '간식', placeholder: '프로틴 쉐이크, 아몬드...' },
                                        ].map((field) => (
                                            <div
                                                key={field.id}
                                                className="space-y-1"
                                            >
                                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 ml-1">{field.label}</label>
                                                <textarea
                                                    value={inputs[field.id as keyof typeof inputs]}
                                                    onChange={(e) => {
                                                        handleInputChange(field.id, e.target.value);
                                                        e.target.style.height = 'auto';
                                                        e.target.style.height = e.target.scrollHeight + 'px';
                                                    }}
                                                    rows={2}
                                                    placeholder={field.placeholder}
                                                    className="w-full min-h-[3rem] p-2 bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 focus:ring-0 focus:border-orange-500 dark:focus:border-orange-500 transition-all resize-none text-sm overflow-hidden border"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </Card>

                                {/* Exercise Section */}
                                <Card className="border-gray-200 dark:border-gray-800 shadow-none p-5 dark:bg-gray-900">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                                        <div className="bg-purple-100 dark:bg-purple-900/50 p-1.5 text-purple-600 dark:text-purple-400">
                                            <Activity className="w-5 h-5" />
                                        </div>
                                        운동 기록
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {[
                                            { id: 'morningExercise', label: '아침 운동', placeholder: '조깅 30분, 스트레칭...' },
                                            { id: 'eveningExercise', label: '저녁 운동', placeholder: '웨이트 50분, 런닝머신 20분...' },
                                        ].map((field) => (
                                            <div
                                                key={field.id}
                                                className="space-y-1"
                                            >
                                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 ml-1">{field.label}</label>
                                                <textarea
                                                    value={inputs[field.id as keyof typeof inputs]}
                                                    onChange={(e) => {
                                                        handleInputChange(field.id, e.target.value);
                                                        e.target.style.height = 'auto';
                                                        e.target.style.height = e.target.scrollHeight + 'px';
                                                    }}
                                                    rows={2}
                                                    placeholder={field.placeholder}
                                                    className="w-full min-h-[3rem] p-2 bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 focus:ring-0 focus:border-purple-500 dark:focus:border-purple-500 transition-all resize-none text-sm overflow-hidden border"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </Card>

                                <div className="flex justify-end pt-2">
                                    <Button
                                        onClick={handleAnalyze}
                                        disabled={!hasAnyInput || isAnalyzing}
                                        className="w-full md:w-auto px-8 py-3 bg-gray-900 hover:bg-black text-white dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700 transition-all text-base font-bold shadow-none"
                                    >
                                        {isAnalyzing ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3"></div>
                                                분석 및 저장 중...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5 mr-2" /> 기록 분석 및 저장
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {analyzedData && analyzedData.items && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-gray-900 shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-700">
                            <div className="p-5 border-b dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                                <h3 className="font-bold text-lg dark:text-white">분석 결과 ({analyzedData.items.length}개 항목)</h3>
                                <button
                                    onClick={() => setAnalyzedData(null)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    <LogOut className="w-5 h-5 rotate-180" />
                                </button>
                            </div>

                            <div className="p-4 overflow-y-auto space-y-3 flex-1">
                                {analyzedData.items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className={cn('w-2 h-2 rounded-full shrink-0', item.type === 'FOOD' ? 'bg-orange-500' : 'bg-purple-500')} />
                                            <div className="font-bold text-gray-900 dark:text-white truncate">{item.name}</div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="bg-white dark:bg-gray-700 px-2 py-0.5 text-xs font-medium border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300">{item.calories} kcal</span>
                                                {item.protein > 0 && <span className="bg-white dark:bg-gray-700 px-2 py-0.5 text-xs font-medium border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300">단 {item.protein}g</span>}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0 ml-4">
                                            <select
                                                value={item.category || 'OTHER'}
                                                onChange={(e) => updateCategory(idx, e.target.value)}
                                                className="text-xs border-none bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-1 px-2 focus:ring-0 cursor-pointer"
                                            >
                                                {CATEGORY_OPTIONS.map((opt) => (
                                                    <option
                                                        key={opt.value}
                                                        value={opt.value}
                                                    >
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => removeItem(idx)}
                                                className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-5 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex gap-3">
                                <Button
                                    onClick={() => setAnalyzedData(null)}
                                    className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 h-12 text-base"
                                >
                                    취소
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    isLoading={isSaving}
                                    className="flex-[2] bg-green-600 hover:bg-green-700 text-white h-12 text-base shadow-green-600/20 shadow-lg"
                                >
                                    <CheckCircle className="w-5 h-5 mr-2" /> 모두 저장하기
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content Area */}
                {viewMode === 'ADMIN' ? (
                    <AdminDashboard />
                ) : viewMode === 'STATS' ? (
                    <div className="animate-in fade-in duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">칼로리 추세</h2>
                            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-none border border-gray-200 dark:border-gray-700">
                                {(['7', '30', 'ALL'] as const).map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setStatsRange(r)}
                                        className={cn(
                                            'px-3 py-1 text-xs font-medium transition-all',
                                            statsRange === r ? 'bg-white dark:bg-gray-700 text-primary border border-gray-200 dark:border-gray-600 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
                                        )}
                                    >
                                        {r === 'ALL' ? '전체' : `${r}일`}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <StatsChart data={statsData} isDarkMode={theme === 'dark'} />

                        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 text-sm text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                            <p>💡 팁: 꾸준히 기록할수록 AI가 사용자의 패턴을 더 잘 이해할 수 있습니다.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3 animate-in fade-in duration-300 pb-10">
                        {Object.entries(groupedLogs).map(([category, items]) => {
                            // '기타' 카테고리는 데이터가 있을 때만 표시
                            if (category === '기타' && items.length === 0) return null;

                            const categoryTotal = items.reduce((s, i) => s + (i.type === 'FOOD' ? i.calories : -Math.abs(i.calories)), 0);

                            return (
                                <div
                                    key={category}
                                    className="space-y-2.5"
                                >
                                    <h3 className="font-bold text-gray-800 dark:text-gray-200 px-1 border-l-4 border-primary pl-3 flex items-center justify-between text-sm">
                                        {category}
                                        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-900 px-2 py-0.5 border border-gray-200 dark:border-slate-800">
                                            {categoryTotal > 0 ? '+' : ''}{categoryTotal} kcal
                                        </span>
                                    </h3>

                                    {items.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                            {items.map((log) => (
                                                <div
                                                    key={log.id}
                                                    className="group bg-white dark:bg-slate-900/50 p-3 border border-gray-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:border-primary/50 dark:hover:border-primary/50 transition-all"
                                                >
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div
                                                            className={cn(
                                                                'w-9 h-9 flex items-center justify-center shrink-0 border border-gray-100 dark:border-slate-800',
                                                                log.type === 'FOOD' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-500 dark:text-orange-400' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-500 dark:text-purple-400',
                                                            )}
                                                        >
                                                            {log.type === 'FOOD' ? <Utensils className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-sm text-gray-900 dark:text-slate-100 truncate">{log.content}</p>
                                                            <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-slate-400 font-medium">
                                                                <span className={cn(log.type === 'FOOD' ? 'text-orange-600 dark:text-orange-400' : 'text-purple-600 dark:text-purple-400')}>{log.calories} Kcal</span>
                                                                <span className="w-px h-2 bg-gray-300 dark:bg-slate-700" />
                                                                <span>{log.protein}g 단백질</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className="text-[10px] text-gray-400 dark:text-slate-500 font-mono">
                                                            {new Date(log.created_at).toLocaleTimeString('ko-KR', {
                                                                timeZone: 'Asia/Seoul',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                hour12: false,
                                                            })}
                                                        </span>
                                                        <button
                                                            onClick={() => handleDelete(log.id)}
                                                            className="p-1.5 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                            title="삭제"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-5 bg-gray-50/50 dark:bg-slate-900/20 border border-dashed border-gray-200 dark:border-slate-800/50 flex items-center justify-center text-gray-400 dark:text-slate-600 text-[11px]">
                                            <p>기록된 데이터가 없습니다.</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};
