import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';

import { DashboardPage } from './pages/DashboardPage';
import { Footer } from './components/Footer';

/**
 * 어플리케이션의 메인 컴포넌트입니다.
 * 라우팅 설정 및 컨텍스트 프로바이더를 초기화합니다.
 *
 * @author 윤명준 (MJ Yune)
 * @since 2026-01-28
 */
function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <AuthProvider>
                    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-300">
                        <div className="flex-1 pb-24">
                            <Routes>
                                <Route
                                    path="/"
                                    element={<LoginPage />}
                                />
                                <Route
                                    path="/dashboard"
                                    element={
                                        <ProtectedRoute>
                                            <DashboardPage />
                                        </ProtectedRoute>
                                    }
                                />
                                {/* Catch all - Redirect to Home */}
                                <Route
                                    path="*"
                                    element={
                                        <Navigate
                                            to="/"
                                            replace
                                        />
                                    }
                                />
                            </Routes>
                        </div>
                        <Footer />
                    </div>
                </AuthProvider>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
