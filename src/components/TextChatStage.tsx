import React, { useState, useEffect, useRef } from 'react';
import { Send, Download, Flag, MessageSquare } from 'lucide-react';
import { soundEffects } from '../utils/audioEffects';
import { StrangerPersona, STRANGER_PERSONAS } from '../utils/strangerEngine';
import { ReportModal } from './ReportModal';

interface TextChatMessage {
  id: string;
  sender: 'system' | 'you' | 'stranger';
  text: string;
  timestamp: string;
}

interface TextChatStageProps {
  initialInterests: string[];
  collegeOnly: boolean;
  onExitToLobby: () => void;
}

export const TextChatStage: React.FC<TextChatStageProps> = ({
  initialInterests,
  collegeOnly,
  onExitToLobby,
}) => {
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [stopButtonState, setStopButtonState] = useState<'stop' | 'really' | 'new'>('stop');
  const [currentPersona, setCurrentPersona] = useState<StrangerPersona | null>(null);
  const [messages, setMessages] = useState<TextChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStrangerTyping, setIsStrangerTyping] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const connectToStranger = () => {
    setConnectionState('connecting');
    setStopButtonState('stop');
    setIsStrangerTyping(false);

    setMessages([
      {
        id: '1',
        sender: 'system',
        text: 'Connecting to server...',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      {
        id: '2',
        sender: 'system',
        text: 'Looking for someone you can chat with...',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    const delay = Math.floor(Math.random() * 1000) + 1000;
    const timer = setTimeout(() => {
      // Pick matching or random persona
      let persona = null;
      if (initialInterests.length > 0) {
        const matches = STRANGER_PERSONAS.filter((p) =>
          p.interests.some((i) => initialInterests.includes(i))
        );
        if (matches.length > 0) {
          persona = matches[Math.floor(Math.random() * matches.length)];
        }
      }
      if (!persona) {
        persona = STRANGER_PERSONAS[Math.floor(Math.random() * STRANGER_PERSONAS.length)];
      }

      setCurrentPersona(persona);
      setConnectionState('connected');
      soundEffects.playConnect();

      const matched = initialInterests.filter((i) => persona!.interests.includes(i));
      const newMsgs: TextChatMessage[] = [
        {
          id: Math.random().toString(),
          sender: 'system',
          text: "You're now chatting with a random stranger. Say hi!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ];

      if (matched.length > 0) {
        newMsgs.push({
          id: Math.random().toString(),
          sender: 'system',
          text: `You both like: ${matched.map((m) => `#${m}`).join(', ')}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }

      setMessages((prev) => [...prev, ...newMsgs]);

      // Stranger initial greeting
      setTimeout(() => {
        setIsStrangerTyping(true);
        setTimeout(() => {
          setIsStrangerTyping(false);
          const greetings = persona!.initialGreetings;
          const greet = greetings[Math.floor(Math.random() * greetings.length)];
          soundEffects.playMessageReceived();
          setMessages((prev) => [
            ...prev,
            {
              id: Math.random().toString(),
              sender: 'stranger',
              text: greet,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }, 1200);
      }, 1000);
    }, delay);

    return () => clearTimeout(timer);
  };

  useEffect(() => {
    connectToStranger();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStrangerTyping]);

  const handleStopClick = () => {
    if (stopButtonState === 'stop') {
      soundEffects.playClick();
      setStopButtonState('really');
    } else if (stopButtonState === 'really') {
      soundEffects.playDisconnect();
      handleDisconnect('You have disconnected.');
    } else if (stopButtonState === 'new') {
      soundEffects.playSkip();
      connectToStranger();
    }
  };

  const handleDisconnect = (reason: string = 'Stranger has disconnected.') => {
    if (connectionState === 'disconnected') return;
    setConnectionState('disconnected');
    setStopButtonState('new');
    setIsStrangerTyping(false);
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: 'system',
        text: reason,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Keyboard shortcut for Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleStopClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stopButtonState, connectionState]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || connectionState !== 'connected') return;

    soundEffects.playMessageSent();
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: 'you',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInputText('');

    if (currentPersona) {
      const lower = text.toLowerCase();
      let cat = 'default';
      if (/asl|m or f|age|where.*from/i.test(lower)) cat = 'asl';
      else if (/hi|hey|hello|yo|sup|hru/i.test(lower)) cat = 'greeting';
      else if (/game|val|steam|play/i.test(lower)) cat = 'gaming';
      else if (/music|song|band/i.test(lower)) cat = 'music';
      else if (/anime|manga/i.test(lower)) cat = 'anime';

      const replies = currentPersona.responses[cat] || currentPersona.responses.default;
      const reply = replies[Math.floor(Math.random() * replies.length)];

      setTimeout(() => {
        if (connectionState !== 'connected') return;
        setIsStrangerTyping(true);
        setTimeout(() => {
          if (connectionState !== 'connected') return;
          setIsStrangerTyping(false);
          soundEffects.playMessageReceived();
          setMessages((prev) => [
            ...prev,
            {
              id: Math.random().toString(),
              sender: 'stranger',
              text: reply,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }, 1400);
      }, 700);
    }
  };

  const handleSaveLog = () => {
    soundEffects.playClick();
    const transcript = messages
      .map((m) => {
        if (m.sender === 'system') return `[System]: ${m.text}`;
        if (m.sender === 'you') return `[You]: ${m.text}`;
        return `[Stranger]: ${m.text}`;
      })
      .join('\n');

    const blob = new Blob([`Omegle Text Chat Transcript\nDate: ${new Date().toLocaleString()}\n\n` + transcript], {
      type: 'text/plain',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omegle-text-chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-61px)] w-full max-w-4xl mx-auto p-3 sm:p-6">
      {/* Stage Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Text Mode {currentPersona && `· Stranger from ${currentPersona.country}`}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEffects.playClick();
              setIsReportOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
            title="Report stranger"
          >
            <Flag className="w-4 h-4" />
          </button>
          <button
            onClick={handleSaveLog}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save Log</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 my-4 shadow-inner">
        {messages.map((msg) => {
          if (msg.sender === 'system') {
            return (
              <div key={msg.id} className="text-center my-2">
                <span className="inline-block text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 px-3 py-1 rounded-lg">
                  {msg.text}
                </span>
              </div>
            );
          }

          const isYou = msg.sender === 'you';
          return (
            <div key={msg.id} className={`flex flex-col ${isYou ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                <span className={`font-bold ${isYou ? 'text-sky-500' : 'text-red-500'}`}>
                  {isYou ? 'You' : 'Stranger'}
                </span>
                <span>·</span>
                <span>{msg.timestamp}</span>
              </div>
              <div
                className={`px-3.5 py-2.5 rounded-2xl max-w-[85%] text-xs sm:text-sm leading-relaxed ${
                  isYou
                    ? 'bg-sky-500 text-white rounded-tr-xs shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200 dark:border-slate-700/60'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {isStrangerTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic">
            <span>Stranger is typing...</span>
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100" />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200" />
            </span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Omegle Action Toolbar & Message Input */}
      <div className="flex items-center gap-2">
        {/* Omegle Stop / Really / New Cycle Button */}
        <button
          onClick={handleStopClick}
          className={`h-12 px-5 sm:px-7 rounded-xl font-black text-sm tracking-wide transition-all shadow-md active:scale-[0.97] cursor-pointer flex items-center justify-center select-none ${
            stopButtonState === 'stop'
              ? 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
              : stopButtonState === 'really'
              ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
              : 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/25'
          }`}
        >
          {stopButtonState === 'stop' && 'Stop [Esc]'}
          {stopButtonState === 'really' && 'Really? [Esc]'}
          {stopButtonState === 'new' && 'New [Esc]'}
        </button>

        {/* Input box */}
        <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={connectionState !== 'connected'}
            placeholder={
              connectionState === 'connected'
                ? 'Type your message and press Enter...'
                : 'Waiting for stranger...'
            }
            className="flex-1 px-4 py-3 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={connectionState !== 'connected' || !inputText.trim()}
            className="px-5 py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center justify-center transition-colors cursor-pointer shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        strangerName={currentPersona?.name || 'Stranger'}
        onConfirmReport={() => {
          setIsReportOpen(false);
          handleDisconnect('Stranger was reported and disconnected.');
          setTimeout(() => {
            connectToStranger();
          }, 600);
        }}
      />
    </div>
  );
};
