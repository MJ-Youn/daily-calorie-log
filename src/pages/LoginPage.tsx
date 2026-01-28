import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Utensils, Activity, Sparkles } from 'lucide-react';
import { Card, Button } from '../components/ui';

export const LoginPage: React.FC = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    return (
        <div className="flex-1 flex items-center justify-center p-4 transition-colors duration-300">
            <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Logo / Branding */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20 mb-4">
                        <Utensils className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">AI 칼로리 로그</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                        먹은 음식과 운동을 말만 하세요. <br />
                        나머지는 <span className="text-blue-600 dark:text-blue-400 font-bold">AI</span>가 정리해 드릴게요.
                    </p>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 border-none bg-white/50 dark:bg-gray-900/50 backdrop-blur border text-center hover:scale-105 transition-transform">
                        <div className="mx-auto w-10 h-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center mb-2">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">AI 자동 분석</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            사진이나 텍스트로 <br />
                            간편 입력
                        </p>
                    </Card>
                    <Card className="p-4 border-none bg-white/50 dark:bg-gray-900/50 backdrop-blur border text-center hover:scale-105 transition-transform">
                        <div className="mx-auto w-10 h-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mb-2">
                            <Activity className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">건강 트래킹</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            칼로리와 성분 <br />
                            완벽 분석
                        </p>
                    </Card>
                </div>

                {/* Login Button */}
                <div className="space-y-4">
                    <Button
                        onClick={login}
                        className="w-full py-6 text-lg rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 transition-all shadow-sm flex items-center justify-center gap-3"
                    >
                        <img
                            src="https://www.google.com/favicon.ico"
                            alt="Google"
                            className="w-6 h-6"
                        />
                        <span>Google 계정으로 시작하기</span>
                    </Button>
                    <p className="text-center text-xs text-gray-400 dark:text-gray-600">계속 진행하면 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.</p>
                </div>
            </div>
        </div>
    );
};
