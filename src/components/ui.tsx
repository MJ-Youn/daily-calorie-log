import React from 'react';
import { cn } from '../lib/utils';

/**
 * 카드 컨테이너 컴포넌트입니다.
 * 
 * @author 윤명준 (MJ Yune)
 * @since 2026-01-28
 * @param {Object} props 컴포넌트 속성
 * @returns {JSX.Element} 카드 UI
 */
export const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => {
    return (
        <div className={cn('bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm rounded-none p-6', className)}>
            {children}
        </div>
    );
};

/**
 * 공통 버튼 컴포넌트입니다. 로딩 상태를 지원합니다.
 * 
 * @author 윤명준 (MJ Yune)
 * @since 2026-01-28
 * @param {Object} props 컴포넌트 속성
 * @returns {JSX.Element} 버튼 UI
 */
export const Button = ({ className, isLoading, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { isLoading?: boolean }) => {
    return (
        <button
            className={cn(
                'inline-flex items-center justify-center rounded-none bg-gray-900 dark:bg-white px-4 py-2 text-sm font-bold text-white dark:text-gray-900 transition-all hover:opacity-90 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:pointer-events-none shadow-sm',
                className,
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && (
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {props.children}
        </button>
    );
};
