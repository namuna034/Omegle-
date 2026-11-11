import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  RefreshCw,
  Flag,
  Download,
  Send,
  Maximize2,
  Minimize2,
  Sparkles,
  Smile,
  Volume2,
  Layers,
} from 'lucide-react';
import { soundEffects } from '../utils/audioEffects';
import { VIDEO_FILTERS, FUN_MASKS, drawMaskOnCanvas } from '../utils/videoFilters';
import {
  StrangerPersona,
  STRANGER_PERSONAS,
  CanvasStrangerSimulator,
  MultiTabHub,
  PeerMessage,
} from '../utils/strangerEngine';
import { ReportModal } from './ReportModal';
import { SnapshotModal } from './SnapshotModal';

export interface ChatMessage {
  id: string;
  sender: 'system' | 'you' | 'stranger';
  text: string;
  timestamp: string;
}

interface FloatingReaction {
  id: string;
  emoji: string;
  x: number;
}

interface VideoChatStageProps {
  initialInterests: string[];
  collegeOnly: boolean;
  initialStream: MediaStream | null;
  initialFilterId: string;
  initialMaskId: string;
  onExitToLobby: () => void;
}

export const VideoChatStage: React.FC<VideoChatStageProps> = ({
  initialInterests,
  collegeOnly,
  initialStream,
  initialFilterId,
  initialMaskId,
  onExitToLobby,
}) => {
  // Connection states
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [stopButtonState, setStopButtonState] = useState<'stop' | 'really' | 'new'>('stop');

  // Peer & Stranger state
  const [currentPersona, setCurrentPersona] = useState<StrangerPersona | null>(null);
  const [isPeerTab, setIsPeerTab] = useState(false);
  const [mutualInterests, setMutualInterests] = useState<string[]>([]);

  // Video / Audio hardware states
  const [camEnabled, setCamEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [selectedFilter, setSelectedFilter] = useState(initialFilterId);
  const [selectedMask, setSelectedMask] = useState(initialMaskId);
  const [isPipSmall, setIsPipSmall] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Chat messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStrangerTyping, setIsStrangerTyping] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);

  // Modals
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const [isSnapshotOpen, setIsSnapshotOpen] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Mobile chat view toggle
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  // Refs
  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  const selfVideoRef = useRef<HTMLVideoElement | null>(null);
  const selfCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const strangerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const strangerSimulatorRef = useRef<CanvasStrangerSimulator | null>(null);
  const localStreamRef = useRef<MediaStream | null>(initialStream);
  const multiTabHubRef = useRef<MultiTabHub | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initialize local webcam stream if not provided or when facingMode flips
  useEffect(() => {
    let active = true;

    async function ensureStream() {
      if (!localStreamRef.current) {
        try {
          const s = await navigator.mediaDevices.getUserMedia({
            video: { facingMode, width: { ideal: 640 }, height: { ideal: 480 } },
            audio: true,
          });
          if (!active) {
            s.getTracks().forEach((t) => t.stop());
            return;
          }
          localStreamRef.current = s;
        } catch {
          // Camera denied/unavailable
        }
      }

      if (selfVideoRef.current && localStreamRef.current) {
        selfVideoRef.current.srcObject = localStreamRef.current;
        selfVideoRef.current.play().catch(() => {});
      }
    }

    ensureStream();

    return () => {
      active = false;
    };
  }, [facingMode]);

  // 2. Self AR Mask drawing loop
  useEffect(() => {
    let animId: number;
    const canvas = selfCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = Date.now();
    const render = () => {
      const t = Date.now() - startTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (selectedMask !== 'none') {
        drawMaskOnCanvas(ctx, selectedMask, canvas.width, canvas.height, t);
      }
      animId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [selectedMask]);

  // 3. Multi-Tab Hub setup for cross-tab real user pairing
  useEffect(() => {
    const hub = new MultiTabHub();
    multiTabHubRef.current = hub;

    hub.setListener((msg: PeerMessage) => {
      if (msg.type === 'DISCOVER') {
        // Another tab is looking for a match
        hub.broadcast('OFFER', { accepted: true }, initialInterests);
      } else if (msg.type === 'OFFER') {
        setIsPeerTab(true);
        hub.connectedPeerId = msg.senderId;
        connectToStranger(null, true, msg.interests);
      } else if (msg.type === 'CHAT') {
        // Message from peer tab
        soundEffects.playMessageReceived();
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: 'stranger',
            text: String(msg.payload || ''),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else if (msg.type === 'REACTION') {
        triggerReaction(String(msg.payload || '❤️'), false);
      } else if (msg.type === 'SKIP') {
        handleStrangerDisconnected('Stranger has disconnected.');
      }
    });

    return () => {
      hub.close();
    };
  }, []);

  // 4. Connecting & Matching with Stranger
  const connectToStranger = (
    chosenPersona: StrangerPersona | null = null,
    isPeer: boolean = false,
    peerInterests: string[] = []
  ) => {
    setConnectionState('connecting');
    setStopButtonState('stop');
    setIsStrangerTyping(false);

    // Initial connecting messages
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

    // Check for other tabs looking
    if (multiTabHubRef.current) {
      multiTabHubRef.current.broadcast('DISCOVER', {}, initialInterests);
    }

    // Short matching delay for realistic matchmaking feel (1.2s - 2.5s)
    const matchDelay = isPeer ? 300 : Math.floor(Math.random() * 1200) + 1200;

    const timer = setTimeout(() => {
      // Pick stranger persona
      let persona = chosenPersona;
      if (!persona) {
        // Filter by mutual interests if any
        if (initialInterests.length > 0) {
          const matching = STRANGER_PERSONAS.filter((p) =>
            p.interests.some((i) => initialInterests.includes(i))
          );
          if (matching.length > 0) {
            persona = matching[Math.floor(Math.random() * matching.length)];
          }
        }
        if (!persona) {
          persona = STRANGER_PERSONAS[Math.floor(Math.random() * STRANGER_PERSONAS.length)];
        }
      }

      setCurrentPersona(persona);
      setIsPeerTab(isPeer);

      // Find common interests
      const matched = isPeer
        ? initialInterests.filter((i) => peerInterests.includes(i))
        : initialInterests.filter((i) => persona!.interests.includes(i));
      setMutualInterests(matched);

      setConnectionState('connected');
      soundEffects.playConnect();

      // System messages
      const connectMsgs: ChatMessage[] = [
        {
          id: Math.random().toString(),
          sender: 'system',
          text: "You're now chatting with a random stranger. Say hi!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ];

      if (matched.length > 0) {
        connectMsgs.push({
          id: Math.random().toString(),
          sender: 'system',
          text: `You both like: ${matched.map((m) => `#${m}`).join(', ')}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }

      setMessages((prev) => [...prev, ...connectMsgs]);

      // Stranger initial greeting simulation
      if (!isPeer && persona) {
        const greetingDelay = Math.floor(Math.random() * 1500) + 1200;
        typingTimeoutRef.current = setTimeout(() => {
          setIsStrangerTyping(true);
          if (strangerSimulatorRef.current) {
            strangerSimulatorRef.current.setSpeaking(true);
          }

          setTimeout(() => {
            setIsStrangerTyping(false);
            if (strangerSimulatorRef.current) {
              strangerSimulatorRef.current.setSpeaking(false);
            }
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
          }, 1400);
        }, greetingDelay);
      }
    }, matchDelay);

    return () => clearTimeout(timer);
  };

  // Start initial match on mount
  useEffect(() => {
    connectToStranger();
  }, []);

  // 5. Setup Canvas Stranger Video Simulator when connected
  useEffect(() => {
    if (connectionState === 'connected' && strangerCanvasRef.current && currentPersona && !isPeerTab) {
      if (strangerSimulatorRef.current) {
        strangerSimulatorRef.current.stop();
      }
      const sim = new CanvasStrangerSimulator(strangerCanvasRef.current, currentPersona);
      strangerSimulatorRef.current = sim;
      sim.start();

      return () => {
        sim.stop();
      };
    }
  }, [connectionState, currentPersona, isPeerTab]);

  // 6. Handle Disconnection
  const handleStrangerDisconnected = (reason: string = 'Stranger has disconnected.') => {
    if (connectionState === 'disconnected') return;
    soundEffects.playDisconnect();
    if (strangerSimulatorRef.current) {
      strangerSimulatorRef.current.stop();
    }
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

  // 7. Iconic Omegle "Stop" -> "Really?" -> "New [Esc]" Cycle
  const handleStopClick = () => {
    if (stopButtonState === 'stop') {
      soundEffects.playClick();
      setStopButtonState('really');
    } else if (stopButtonState === 'really') {
      soundEffects.playDisconnect();
      if (multiTabHubRef.current) multiTabHubRef.current.broadcast('SKIP');
      handleStrangerDisconnected('You have disconnected.');
    } else if (stopButtonState === 'new') {
      soundEffects.playSkip();
      connectToStranger();
    }
  };

  // ESC Keyboard Shortcut handler
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

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStrangerTyping]);

  // 8. Send User Message & Handle Dynamic Stranger Dialogue
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    soundEffects.playMessageSent();
    const newMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'you',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // If connected to real peer tab, broadcast it!
    if (isPeerTab && multiTabHubRef.current) {
      multiTabHubRef.current.broadcast('CHAT', text);
      return;
    }

    // Otherwise, simulate persona response
    if (connectionState === 'connected' && currentPersona) {
      // Analyze text for keywords
      const lower = text.toLowerCase();
      let responseCategory = 'default';

      if (/asl|m or f|age|sex|where.*from|country|city/i.test(lower)) {
        responseCategory = 'asl';
      } else if (/hi|hey|hello|yo|sup|how are you|hru|good/i.test(lower)) {
        responseCategory = 'greeting';
      } else if (/game|gaming|val|steam|play|console|pc|xbox/i.test(lower)) {
        responseCategory = 'gaming';
      } else if (/music|song|band|artist|guitar|listen/i.test(lower)) {
        responseCategory = 'music';
      } else if (/anime|manga|watch|series|movie/i.test(lower)) {
        responseCategory = 'anime';
      } else if (/filter|camera|mask|cool|shades/i.test(lower)) {
        responseCategory = 'filter';
      }

      const availableResponses =
        currentPersona.responses[responseCategory] || currentPersona.responses.default;
      const chosenReply = availableResponses[Math.floor(Math.random() * availableResponses.length)];

      // Random delay before typing
      const preTypeDelay = Math.floor(Math.random() * 800) + 600;
      const typingDuration = Math.min(2500, Math.max(1200, chosenReply.length * 40));

      setTimeout(() => {
        if (connectionState !== 'connected') return;
        setIsStrangerTyping(true);
        if (strangerSimulatorRef.current) {
          strangerSimulatorRef.current.setSpeaking(true);
        }

        setTimeout(() => {
          if (connectionState !== 'connected') return;
          setIsStrangerTyping(false);
          if (strangerSimulatorRef.current) {
            strangerSimulatorRef.current.setSpeaking(false);
          }

          soundEffects.playMessageReceived();
          setMessages((prev) => [
            ...prev,
            {
              id: Math.random().toString(),
              sender: 'stranger',
              text: chosenReply,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }, typingDuration);
      }, preTypeDelay);
    }
  };

  // 9. Floating Emoji Reaction Burst
  const triggerReaction = (emoji: string, broadcast: boolean = true) => {
    soundEffects.playReaction();
    const id = Math.random().toString();
    const x = Math.floor(Math.random() * 60) + 20; // 20% to 80%

    setFloatingReactions((prev) => [...prev, { id, emoji, x }]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2000);

    if (broadcast && isPeerTab && multiTabHubRef.current) {
      multiTabHubRef.current.broadcast('REACTION', emoji);
    }
  };

  // 10. Photobooth Snapshot with 3-2-1 countdown
  const handleTakeSnapshot = () => {
    soundEffects.playClick();
    setCountdown(3);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          captureCallCanvas();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const captureCallCanvas = () => {
    soundEffects.playShutter();
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Left half: Stranger
    if (strangerCanvasRef.current) {
      ctx.drawImage(strangerCanvasRef.current, 0, 0, 640, 720);
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 640, 720);
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px sans-serif';
      ctx.fillText('Stranger', 40, 60);
    }

    // Right half: Self video
    if (selfVideoRef.current && camEnabled) {
      ctx.drawImage(selfVideoRef.current, 640, 0, 640, 720);
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(640, 0, 640, 720);
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px sans-serif';
      ctx.fillText('You', 680, 60);
    }

    // Authentic Omegle Watermark Banner
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 650, 1280, 70);

    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = '#0ea5e9';
    ctx.fillText('Om', 30, 695);
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('egle Web', 78, 695);

    ctx.font = '16px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(new Date().toLocaleString(), 1000, 695);

    const dataUrl = canvas.toDataURL('image/png');
    setSnapshotUrl(dataUrl);
    setIsSnapshotOpen(true);
  };

  // 11. Save Chat Transcript
  const handleSaveLog = () => {
    soundEffects.playClick();
    const transcript = messages
      .map((m) => {
        if (m.sender === 'system') return `[System]: ${m.text}`;
        if (m.sender === 'you') return `[You (${m.timestamp})]: ${m.text}`;
        return `[Stranger (${m.timestamp})]: ${m.text}`;
      })
      .join('\n');

    const blob = new Blob([`Omegle Web Chat Transcript\nDate: ${new Date().toLocaleString()}\n\n` + transcript], {
      type: 'text/plain',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omegle-transcript-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    soundEffects.playClick();
    if (!document.fullscreenElement && stageContainerRef.current) {
      stageContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Flip Camera
  const flipCamera = () => {
    soundEffects.playClick();
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const activeCssFilter = VIDEO_FILTERS.find((f) => f.id === selectedFilter)?.cssFilter || 'none';

  return (
    <div
      ref={stageContainerRef}
      className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-61px)] w-full overflow-hidden bg-slate-900 text-slate-100"
    >
      {/* LEFT AREA: Video Stage & Controls */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* VIDEO DISPLAY AREA */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
          {/* 1. STRANGER VIDEO (Main Canvas / Stream) */}
          <div className="w-full h-full relative flex items-center justify-center">
            {connectionState === 'connecting' && (
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-sky-500/30 animate-ping" />
                  <div className="w-16 h-16 rounded-full border-3 border-sky-500 border-t-transparent animate-spin" />
                  <Camera className="w-7 h-7 text-sky-400 absolute" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Looking for a stranger...</h3>
                  <p className="text-xs text-slate-400">
                    {initialInterests.length > 0
                      ? `Searching people who like: ${initialInterests.map((t) => `#${t}`).join(', ')}`
                      : 'Matching with random people worldwide'}
                  </p>
                </div>
              </div>
            )}

            {connectionState === 'connected' && (
              <>
                <canvas
                  ref={strangerCanvasRef}
                  width={640}
                  height={480}
                  className="w-full h-full object-cover"
                />

                {/* Stranger Info Badge */}
                <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                  <span className="text-base">{currentPersona?.flag || '🌐'}</span>
                  <div>
                    <span className="font-bold text-white block leading-tight">
                      {isPeerTab ? 'Stranger (Live Peer)' : currentPersona?.name || 'Stranger'}
                      {!isPeerTab && currentPersona ? `, ${currentPersona.age}` : ''}
                    </span>
                    <span className="text-[10px] text-slate-300">
                      {isPeerTab ? 'Connected via Browser Tab' : currentPersona?.city + ', ' + currentPersona?.country}
                    </span>
                  </div>

                  {/* Equalizer indicator */}
                  <div className="flex items-center gap-0.5 ml-2">
                    <span className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="w-1 h-4 bg-emerald-400 rounded-full animate-pulse delay-75" />
                    <span className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse delay-150" />
                  </div>
                </div>

                {/* Mutual Interests Pill Banner */}
                {mutualInterests.length > 0 && (
                  <div className="absolute top-3 right-3 hidden sm:flex items-center gap-1.5 bg-sky-950/80 backdrop-blur-md border border-sky-500/40 px-3 py-1 rounded-xl text-xs text-sky-200 z-20">
                    <span className="font-semibold">Mutual:</span>
                    {mutualInterests.map((i) => (
                      <span key={i} className="font-bold">
                        #{i}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}

            {connectionState === 'disconnected' && (
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-sm">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-1">
                  <CameraOff className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-white">Stranger has disconnected</h3>
                <p className="text-xs text-slate-400">
                  Ready for someone new? Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-sky-400">Esc</kbd> or tap the New button below.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      soundEffects.playSkip();
                      connectToStranger();
                    }}
                    className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm transition-colors shadow-lg shadow-sky-500/25"
                  >
                    Find New Stranger [Esc]
                  </button>
                  <button
                    onClick={handleSaveLog}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Save Log</span>
                  </button>
                </div>
              </div>
            )}

            {/* Floating Reactions overlay */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-25">
              {floatingReactions.map((reaction) => (
                <div
                  key={reaction.id}
                  style={{ left: `${reaction.x}%` }}
                  className="absolute bottom-10 text-3xl animate-bounce transform transition-all duration-1000 opacity-90"
                >
                  {reaction.emoji}
                </div>
              ))}
            </div>

            {/* Snapshot Countdown Overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-30">
                <div className="text-8xl font-black text-white animate-ping">{countdown}</div>
              </div>
            )}
          </div>

          {/* 2. USER SELF VIDEO (Picture-in-Picture Tile) */}
          <div
            className={`absolute z-25 transition-all duration-200 border-2 border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl bg-slate-950 ${
              isPipSmall
                ? 'bottom-4 right-4 w-32 sm:w-44 md:w-56 aspect-4/3'
                : 'top-4 right-4 bottom-20 w-80 max-w-[50%]'
            }`}
          >
            {/* Real Video */}
            <video
              ref={selfVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform ${facingMode === 'user' ? 'scale-x-[-1]' : ''} ${
                !camEnabled ? 'opacity-0' : 'opacity-100'
              }`}
              style={{ filter: activeCssFilter }}
            />

            {/* AR Canvas */}
            <canvas
              ref={selfCanvasRef}
              width={320}
              height={240}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
            />

            {/* Camera Muted Fallback */}
            {!camEnabled && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-2 text-center z-5">
                <CameraOff className="w-6 h-6 mb-1 text-slate-500" />
                <span className="text-[10px] font-medium text-slate-300">Camera Off</span>
              </div>
            )}

            {/* Self Video Mini Toolbar */}
            <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-20">
              <button
                onClick={() => setIsPipSmall(!isPipSmall)}
                className="p-1 rounded bg-black/60 text-slate-300 hover:text-white"
                title={isPipSmall ? 'Enlarge' : 'Minimize'}
              >
                <Layers className="w-3 h-3" />
              </button>
            </div>

            {/* Bottom Self Controls */}
            <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg z-20">
              <span className="text-[10px] font-bold text-white">You</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    if (localStreamRef.current) {
                      const t = localStreamRef.current.getVideoTracks()[0];
                      if (t) {
                        t.enabled = !t.enabled;
                        setCamEnabled(t.enabled);
                      }
                    } else {
                      setCamEnabled(!camEnabled);
                    }
                  }}
                  className={`p-1 rounded ${camEnabled ? 'text-slate-300' : 'text-red-400'}`}
                >
                  {camEnabled ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    if (localStreamRef.current) {
                      const a = localStreamRef.current.getAudioTracks()[0];
                      if (a) {
                        a.enabled = !a.enabled;
                        setMicEnabled(a.enabled);
                      }
                    } else {
                      setMicEnabled(!micEnabled);
                    }
                  }}
                  className={`p-1 rounded ${micEnabled ? 'text-slate-300' : 'text-red-400'}`}
                >
                  {micEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={flipCamera}
                  className="p-1 rounded text-slate-300 hover:text-white"
                  title="Flip camera"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR (The Classic Omegle Bar + Modern Tools) */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* THE BIG STOP / REALLY / NEW BUTTON */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleStopClick}
              className={`h-11 sm:h-12 px-5 sm:px-7 rounded-xl font-black text-sm sm:text-base tracking-wide transition-all shadow-md active:scale-[0.97] cursor-pointer flex items-center justify-center select-none ${
                stopButtonState === 'stop'
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  : stopButtonState === 'really'
                  ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                  : 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/25'
              }`}
            >
              {stopButtonState === 'stop' && 'Stop [Esc]'}
              {stopButtonState === 'really' && 'Really? [Esc]'}
              {stopButtonState === 'new' && 'New Stranger [Esc]'}
            </button>

            {/* Quick Reactions Bar */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
              {['❤️', '🔥', '😂', '👏', '😮', '💀', '🎸', '👋'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => triggerReaction(emoji)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-sm sm:text-base transition-transform hover:scale-125 active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Call Utilities */}
          <div className="flex items-center gap-2">
            {/* Filter Selector */}
            <div className="hidden md:flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
              <span className="text-[11px] text-slate-400 px-2 font-medium">Filter:</span>
              <select
                value={selectedFilter}
                onChange={(e) => {
                  soundEffects.playClick();
                  setSelectedFilter(e.target.value);
                }}
                className="bg-transparent text-xs text-white focus:outline-none pr-2 cursor-pointer"
              >
                {VIDEO_FILTERS.map((f) => (
                  <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* AR Mask Selector */}
            <div className="hidden md:flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
              <span className="text-[11px] text-slate-400 px-2 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Mask:
              </span>
              <select
                value={selectedMask}
                onChange={(e) => {
                  soundEffects.playClick();
                  setSelectedMask(e.target.value);
                }}
                className="bg-transparent text-xs text-white focus:outline-none pr-2 cursor-pointer"
              >
                {FUN_MASKS.map((m) => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                    {m.icon} {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Photobooth Snapshot Button */}
            <button
              onClick={handleTakeSnapshot}
              title="Take call photo snapshot"
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Camera className="w-4 h-4 text-sky-400" />
            </button>

            {/* Report Stranger Button */}
            <button
              onClick={() => {
                soundEffects.playClick();
                setIsReportOpen(true);
              }}
              title="Report inappropriate behavior"
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            >
              <Flag className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              title="Fullscreen"
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Mobile Chat Drawer Toggle */}
            <button
              onClick={() => setIsMobileChatOpen(!isMobileChatOpen)}
              className="lg:hidden px-3 py-2 rounded-xl bg-sky-500 text-white text-xs font-bold"
            >
              {isMobileChatOpen ? 'Hide Chat' : `Chat (${messages.length})`}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT AREA: Interactive Text Chat Column (Desktop Always, Mobile Collapsible) */}
      <div
        className={`w-full lg:w-96 flex flex-col bg-slate-950 border-l border-slate-800 h-full transition-all duration-200 ${
          isMobileChatOpen ? 'fixed inset-x-0 bottom-0 top-32 z-40 lg:relative lg:top-0' : 'hidden lg:flex'
        }`}
      >
        {/* Chat Header */}
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Text Chat</span>
            {isStrangerTyping && (
              <span className="text-[11px] text-amber-400 font-medium animate-pulse">
                Stranger is typing...
              </span>
            )}
          </div>
          <button
            onClick={handleSaveLog}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save Log</span>
          </button>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs sm:text-sm">
          {messages.map((msg) => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id} className="text-center my-2">
                  <span className="inline-block text-[11px] font-medium text-amber-300/80 bg-amber-950/30 border border-amber-900/40 px-3 py-1 rounded-lg">
                    {msg.text}
                  </span>
                </div>
              );
            }

            const isYou = msg.sender === 'you';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isYou ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-0.5">
                  <span className="font-bold text-slate-400">{isYou ? 'You' : 'Stranger'}</span>
                  <span>·</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div
                  className={`px-3 py-2 rounded-2xl max-w-[85%] text-slate-100 break-words leading-relaxed ${
                    isYou
                      ? 'bg-sky-600 rounded-tr-xs'
                      : 'bg-slate-800 text-slate-200 rounded-tl-xs border border-slate-700/60'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}

          {/* Stranger typing indicator bubble */}
          {isStrangerTyping && (
            <div className="flex flex-col items-start">
              <div className="text-[10px] text-slate-500 mb-0.5">Stranger is typing...</div>
              <div className="px-3.5 py-2.5 bg-slate-800 rounded-2xl rounded-tl-xs border border-slate-700/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Icebreaker Suggestions */}
        <div className="px-3 py-1.5 border-t border-slate-800/80 bg-slate-900/30 flex gap-1.5 overflow-x-auto scrollbar-none">
          {['ASL?', 'Where are you from?', 'What games do you play?', 'Cool filter! 🔥', 'What music do you like?'].map(
            (ice) => (
              <button
                key={ice}
                onClick={() => {
                  setInputText(ice);
                }}
                className="text-[10px] whitespace-nowrap px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                {ice}
              </button>
            )
          )}
        </div>

        {/* Input Box */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900/80 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={connectionState !== 'connected'}
            placeholder={
              connectionState === 'connected'
                ? 'Type your message and press Enter...'
                : 'Waiting for stranger to connect...'
            }
            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-800 rounded-xl border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={connectionState !== 'connected' || !inputText.trim()}
            className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center justify-center transition-colors cursor-pointer shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Modals */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        strangerName={currentPersona?.name || 'Stranger'}
        onConfirmReport={(reason) => {
          setIsReportOpen(false);
          handleStrangerDisconnected(`Stranger reported: ${reason}`);
          setTimeout(() => {
            connectToStranger();
          }, 800);
        }}
      />

      <SnapshotModal
        isOpen={isSnapshotOpen}
        onClose={() => setIsSnapshotOpen(false)}
        imageUrl={snapshotUrl}
      />
    </div>
  );
};
