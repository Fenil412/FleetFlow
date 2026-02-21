import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ collapse }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group
                ${theme === 'dark'
                    ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700'
                    : 'bg-white text-slate-600 hover:bg-gray-100'
                } border border-border shadow-sm w-full outline-none
            `}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
            <div className="relative">
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
