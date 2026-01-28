import React from 'react';
import { Github, Globe, Mail } from 'lucide-react';

/**
 * 어플리케이션 하단에 위치하는 푸터 컴포넌트입니다.
 * 저작권 정보와 개발자의 GitHub, 블로그 링크를 포함합니다.
 *
 * @author 윤명준 (MJ Yune)
 * @since 2026-01-28
 */
export const Footer: React.FC = () => {
    return (
        <footer className="fixed bottom-0 left-0 right-0 w-full py-4 border-t border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-40 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    {/* Copyright Section */}
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        © 2026 <span className="font-bold text-gray-900 dark:text-white">윤명준 (MJ Yun)</span>. All rights reserved.
                    </div>

                    {/* Social Links Section */}
                    <div className="flex items-center space-x-6">
                        <a
                            href="https://github.com/mj-youn"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            title="GitHub"
                        >
                            <Github className="h-5 w-5" />
                        </a>
                        <a
                            href="https://mj.is-a.dev"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            title="Blog"
                        >
                            <Globe className="h-5 w-5" />
                        </a>
                        <a
                            href="mailto:yun0244@naver.com"
                            className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            title="Contact Email"
                        >
                            <Mail className="h-5 w-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
