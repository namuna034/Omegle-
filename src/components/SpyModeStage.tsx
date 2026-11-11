import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, Eye, MessageSquare, Send, ArrowLeft, RefreshCw } from 'lucide-react';
import { soundEffects } from '../utils/audioEffects';

interface SpyModeStageProps {
  onBackToLobby: () => void;
}

interface SpyMessage {
  id: string;
  sender: 'system' | 'stranger1' | 'stranger2' | 'spy';
  text: string;
}

const DEFAULT_QUESTIONS = [
  'If you could have dinner with anyone from history, who would it be and why?',
  'Is cereal considered a soup? Defend your stance.',
  'Would you rather know the date of your death or the cause of your death?',
  'What is the most overrated trend of this decade?',
  'If aliens visited Earth tomorrow, what single item would you show them to represent humanity?',
];

export const SpyModeStage: React.FC<SpyModeStageProps> = ({ onBackToLobby }) => {
  const [role, setRole] = useState<'spy' | 'discussant'>('spy');
  const [question, setQuestion] = useState(DEFAULT_QUESTIONS[0]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [messages, setMessages] = useState<SpyMessage[]>([]);
  const [typingSender, setTypingSender] = useState<'stranger1' | 'stranger2' | null>(null);

  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startSpySession = (activeQuestion: string) => {
    soundEffects.playConnect();
    setIsStarted(true);
    setMessages([
      {
        id: '1',
        sender: 'system',
        text: 'Looking for two strangers to discuss your question...',
      },
      {
        id: '2',
        sender: 'system',
        text: `Question: "${activeQuestion}"`,
      },
    ]);

    // Simulate Stranger 1 & Stranger 2 entering and having a debate
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: '3',
          sender: 'system',
          text: 'Stranger 1 and Stranger 2 have connected! Sit back and watch them discuss.',
        },
      ]);

      const debateFlow: { sender: 'stranger1' | 'stranger2'; text: string; delay: number }[] = [
        { sender: 'stranger1', text: 'yo, interesting question!', delay: 1500 },
        { sender: 'stranger2', text: 'haha yeah, I actually have strong opinions on this', delay: 2200 },
        {
          sender: 'stranger1',
          text:
            activeQuestion.includes('cereal')
              ? 'Cereal is 100% cold breakfast soup. It has solid ingredients suspended in a broth/liquid!'
              : 'I think the answer depends on whether you value knowledge or peace of mind.',
          delay: 3000,
        },
        {
          sender: 'stranger2',
          text:
            activeQuestion.includes('cereal')
              ? 'No way! Soup requires cooking and savory stock. Milk is a dressing or beverage, not a broth!'
              : 'Totally agree. But honestly curiosity would get the better of most people.',
          delay: 3500,
        },
        {
          sender: 'stranger1',
          text: 'What about gazpacho? That is served cold with no cooking!',
          delay: 3000,
        },
        {
          sender: 'stranger2',
          text: 'Touché... okay maybe you have a point haha. Spy, what do you think?',
          delay: 2800,
        },
      ];

      let accumulatedTime = 0;
      debateFlow.forEach((item) => {
        accumulatedTime += item.delay;
        setTimeout(() => {
          setTypingSender(item.sender);
          setTimeout(() => {
            setTypingSender(null);
            soundEffects.playMessageReceived();
            setMessages((prev) => [
              ...prev,
              {
                id: Math.random().toString(),
                sender: item.sender,
                text: item.text,
              },
            ]);
          }, 1000);
        }, accumulatedTime);
      });
    }, 2000);
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingSender]);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-61px)] w-full max-w-4xl mx-auto p-4 sm:p-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onBackToLobby}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lobby</span>
        </button>
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-purple-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Omegle Spy Mode</h2>
        </div>
      </div>

      {!isStarted ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto space-y-6">
          <div className="p-4 rounded-3xl bg-purple-500/10 text-purple-500">
            <HelpCircle className="w-12 h-12" />
          </div>

          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
              Ask Strangers a Question
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Pose a question, then sit back and watch two random strangers connect and debate it in real time!
            </p>
          </div>

          <div className="w-full space-y-3 text-left">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Choose or Type a Question:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customQuestion || question}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  const nextQ = DEFAULT_QUESTIONS[Math.floor(Math.random() * DEFAULT_QUESTIONS.length)];
                  setQuestion(nextQ);
                  setCustomQuestion('');
                }}
                className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                title="Random Question"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {DEFAULT_QUESTIONS.slice(0, 3).map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setCustomQuestion(q);
                  }}
                  className="text-left text-[11px] p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors truncate max-w-full"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => startSpySession(customQuestion.trim() || question)}
            className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-base shadow-lg shadow-purple-500/25 active:scale-[0.98] transition-all cursor-pointer"
          >
            Launch Spy Question
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col my-4 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 overflow-hidden shadow-inner">
          <div className="flex-1 overflow-y-auto space-y-3 p-2">
            {messages.map((msg) => {
              if (msg.sender === 'system') {
                return (
                  <div key={msg.id} className="text-center my-2">
                    <span className="inline-block text-[11px] font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/40 px-3 py-1 rounded-lg">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              const isS1 = msg.sender === 'stranger1';
              return (
                <div key={msg.id} className="flex flex-col items-start">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                    <span className={`font-bold ${isS1 ? 'text-sky-500' : 'text-amber-500'}`}>
                      {isS1 ? 'Stranger 1' : 'Stranger 2'}
                    </span>
                  </div>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl max-w-[85%] text-xs sm:text-sm leading-relaxed ${
                      isS1
                        ? 'bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-100 rounded-tl-xs'
                        : 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100 rounded-tl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {typingSender && (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                <span>{typingSender === 'stranger1' ? 'Stranger 1' : 'Stranger 2'} is typing...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-purple-500 font-medium flex items-center gap-1.5">
              <Eye className="w-4 h-4" /> You are observing silently as the Spy
            </span>
            <button
              onClick={() => {
                soundEffects.playClick();
                setIsStarted(false);
              }}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Ask Another Question
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
