import React from 'react';
import { Volume2, VolumeX, Shield, Moon, Sun, Monitor, Users } from 'lucide-react';
import { soundEffects } from '../utils/audioEffects';

interface NavbarProps {
  onlineCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  theme: 'dark' | 'light' | 'classic';
  onChangeTheme: (theme: 'dark' | 'light' | 'classic') => void;
  onOpenRules: () => void;
  inChat: boolean;
  onLeaveChat?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onlineCount,
  soundEnabled,
  onToggleSound,
  theme,
  onChangeTheme,
  onOpenRules,
  inChat,
  onLeaveChat,
}) => {
  return (
    <header className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => {
            if (inChat && onLeaveChat) {
              if (window.confirm('Leave active chat and return to lobby?')) {
                onLeaveChat();
              }
            }
          }}
          className="flex items-center gap-2 group text-left focus:outline-none"
        >
          {/* Authentic Omegle Wordmark */}
          <div className="flex items-center font-black tracking-tight text-xl sm:text-2xl select-none">
            <span className="text-sky-500 group-hover:text-sky-400 transition-colors">Om</span>
            <span className="text-amber-500 group-hover:text-amber-400 transition-colors">egle</span>
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider ml-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Web
            </span>
          </div>
        </button>

        {/* Live Online Count */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pl-3 border-l border-slate-200 dark:border-slate-800 tabular-nums">
          <Users className="w-3.5 h-3.5 text-emerald-500" />
          <span>{onlineCount.toLocaleString()}</span>
          <span>online</span>
        </div>
      </div>

      {/* Zone 2: Navigation & Quick Info */}
      <div className="hidden lg:flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
        <span>Talk to strangers</span>
        <span aria-hidden="true">·</span>
        <span>Instant Video & Audio</span>
        <span aria-hidden="true">·</span>
        <span>100% Free & Anonymous</span>
      </div>

      {/* Zone 3: Functional Utilities */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Sound toggle */}
        <button
          onClick={() => {
            soundEffects.playClick();
            onToggleSound();
          }}
          title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
          aria-label={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-sky-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
        </button>

        {/* Theme toggle */}
        <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            onClick={() => {
              soundEffects.playClick();
              onChangeTheme('dark');
            }}
            title="Dark theme"
            className={`p-1.5 min-h-[34px] min-w-[34px] flex items-center justify-center rounded-md transition-colors ${
              theme === 'dark' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              soundEffects.playClick();
              onChangeTheme('light');
            }}
            title="Light theme"
            className={`p-1.5 min-h-[34px] min-w-[34px] flex items-center justify-center rounded-md transition-colors ${
              theme === 'light' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              soundEffects.playClick();
              onChangeTheme('classic');
            }}
            title="Classic 2010 Omegle Blue theme"
            className={`p-1.5 min-h-[34px] min-w-[34px] flex items-center justify-center rounded-md text-[11px] font-semibold transition-colors ${
              theme === 'classic' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Safety Guidelines Modal */}
        <button
          onClick={() => {
            soundEffects.playClick();
            onOpenRules();
          }}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
        >
          <Shield className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">Rules & Safety</span>
        </button>
      </div>
    </header>
  );
};
