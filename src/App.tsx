/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Lobby } from './components/Lobby';
import { VideoChatStage } from './components/VideoChatStage';
import { TextChatStage } from './components/TextChatStage';
import { SpyModeStage } from './components/SpyModeStage';
import { RulesModal } from './components/RulesModal';
import { soundEffects } from './utils/audioEffects';

type AppMode = 'lobby' | 'video' | 'text' | 'spy';
type AppTheme = 'dark' | 'light' | 'classic';

export default function App() {
  const [mode, setMode] = useState<AppMode>('lobby');
  const [theme, setTheme] = useState<AppTheme>('dark');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [onlineCount, setOnlineCount] = useState(36492);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // User configured preferences
  const [userInterests, setUserInterests] = useState<string[]>(['gaming', 'music']);
  const [collegeOnly, setCollegeOnly] = useState(false);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
  const [activeFilterId, setActiveFilterId] = useState('normal');
  const [activeMaskId, setActiveMaskId] = useState('none');

  // Theme synchronization with document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'classic-omegle');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'classic') {
      root.classList.add('classic-omegle');
    }
  }, [theme]);

  // Sound sync
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEffects.enabled = next;
  };

  // Organic Online Count Fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount((prev) => {
        const delta = Math.floor(Math.random() * 9) - 4; // -4 to +4
        return Math.max(25000, prev + delta);
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Handlers for switching modes
  const handleStartVideo = (
    interests: string[],
    college: boolean,
    stream: MediaStream | null,
    filterId: string,
    maskId: string
  ) => {
    setUserInterests(interests);
    setCollegeOnly(college);
    setActiveStream(stream);
    setActiveFilterId(filterId);
    setActiveMaskId(maskId);
    setMode('video');
  };

  const handleStartText = (interests: string[], college: boolean) => {
    setUserInterests(interests);
    setCollegeOnly(college);
    setMode('text');
  };

  const handleStartSpy = () => {
    setMode('spy');
  };

  const handleBackToLobby = () => {
    setMode('lobby');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-sky-500 selection:text-white">
      {/* Top Bar Contract (Wordmark - Links - Action/Controls) */}
      <Navbar
        onlineCount={onlineCount}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        theme={theme}
        onChangeTheme={setTheme}
        onOpenRules={() => setIsRulesOpen(true)}
        inChat={mode !== 'lobby'}
        onLeaveChat={handleBackToLobby}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 flex flex-col justify-center">
        {mode === 'lobby' && (
          <Lobby
            onStartVideo={handleStartVideo}
            onStartText={handleStartText}
            onStartSpy={handleStartSpy}
            userInterests={userInterests}
            setUserInterests={setUserInterests}
          />
        )}

        {mode === 'video' && (
          <VideoChatStage
            initialInterests={userInterests}
            collegeOnly={collegeOnly}
            initialStream={activeStream}
            initialFilterId={activeFilterId}
            initialMaskId={activeMaskId}
            onExitToLobby={handleBackToLobby}
          />
        )}

        {mode === 'text' && (
          <TextChatStage
            initialInterests={userInterests}
            collegeOnly={collegeOnly}
            onExitToLobby={handleBackToLobby}
          />
        )}

        {mode === 'spy' && <SpyModeStage onBackToLobby={handleBackToLobby} />}
      </main>

      {/* Persistent Community Guidelines / Safety Modal */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
    </div>
  );
}
