import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    sub: string;
    email: string;
    name: string;
    picture: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 사용자 인증 정보를 관리하는 Context Provider입니다.
 * 세션 유지, 로그인, 로그아웃 기능을 제공합니다.
 * 
 * @author 윤명준 (MJ Yune)
 * @since 2026-01-28
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 현재 세션 정보 확인
        fetch('/api/auth/me')
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                if (data.user) {
                    setUser(data.user);
                }
            })
            .catch(() => {
                // console.error('Auth check failed');
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const login = () => {
        // 백엔드 로그인 엔드포인트로 리다이렉트
        window.location.href = '/api/auth/login';
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
            window.location.href = '/';
        } catch {
            // console.error('Logout failed');
        }
    };

    return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
};

/**
 * 인증 컨텍스트를 사용하기 위한 Hook입니다.
 * 
 * @author 윤명준 (MJ Yune)
 * @since 2026-01-28
 * @returns {AuthContextType} 인증 관련 상태 및 함수
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
