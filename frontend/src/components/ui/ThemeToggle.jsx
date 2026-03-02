import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ collapse }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`flex items-center rounded-xl transition-all duration-300 group outline-none border border-border shadow-sm
                ${theme === 'dark'
                    ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700'
                    : 'bg-white text-slate-600 hover:bg-gray-100'
                }
                ${collapse ? 'w-[48px] h-[48px] justify-center p-0 gap-0' : 'w-full px-3 py-2.5 gap-3'}
            `}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
            <div className={`relative ${collapse ? '' : 'min-w-[20px]'}`}>
                {theme === 'dark' ? (
                    <Sun size={20} className="animate-in zoom-in duration-300" />
                ) : (
                    <Moon size={20} className="animate-in zoom-in duration-300" />
                )}
            </div>
            {!collapse && (
                <span className="text-sm font-semibold whitespace-nowrap overflow-hidden transition-all duration-300">
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
            )}
        </button>
    );
};

export default ThemeToggle;
