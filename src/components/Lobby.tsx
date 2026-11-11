import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  MessageSquare,
  HelpCircle,
  Camera,
  CameraOff,
  Mic,
  MicOff,
  RefreshCw,
  Sparkles,
  Plus,
  X,
  GraduationCap,
  Volume2,
} from 'lucide-react';
import { VIDEO_FILTERS, FUN_MASKS, drawMaskOnCanvas } from '../utils/videoFilters';
import { soundEffects } from '../utils/audioEffects';

interface LobbyProps {
  onStartVideo: (interests: string[], collegeOnly: boolean, userMediaStream: MediaStream | null, filterId: string, maskId: string) => void;
  onStartText: (interests: string[], collegeOnly: boolean) => void;
  onStartSpy: () => void;
  userInterests: string[];
  setUserInterests: React.Dispatch<React.SetStateAction<string[]>>;
}

const POPULAR_INTERESTS = [
  'gaming',
  'anime',
  'music',
  'coding',
  'movies',
  'art',
  'fitness',
  'travel',
  'guitar',
  'pets',
  'philosophy',
];

export const Lobby: React.FC<LobbyProps> = ({
  onStartVideo,
  onStartText,
  onStartSpy,
  userInterests,
  setUserInterests,
}) => {
  const [tagInput, setTagInput] = useState('');
  const [collegeOnly, setCollegeOnly] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [showTermsWarning, setShowTermsWarning] = useState(false);

  // Local camera preview state
  const [camEnabled, setCamEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [selectedFilter, setSelectedFilter] = useState('normal');
  const [selectedMask, setSelectedMask] = useState('none');
  const [micLevel, setMicLevel] = useState(0);
  const [camError, setCamError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize camera preview
  useEffect(() => {
    let active = true;

    async function initCamera() {
      try {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 640 }, height: { ideal: 480 } },
          audio: true,
        });

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        mediaStreamRef.current = stream;
        setCamError(null);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }

        // Setup Audio Analyser for mic meter
        try {
          const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            audioContextRef.current = ctx;
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);
            analyserRef.current = analyser;

            const updateMeter = () => {
              if (!active) return;
              if (analyserRef.current && micEnabled) {
                const data = new Uint8Array(analyserRef.current.frequencyBinCount);
                analyserRef.current.getByteFrequencyData(data);
                let sum = 0;
                for (let i = 0; i < data.length; i++) sum += data[i];
                const avg = sum / data.length;
                setMicLevel(Math.min(100, Math.round((avg / 128) * 100)));
              } else {
                setMicLevel(0);
              }
              animFrameRef.current = requestAnimationFrame(updateMeter);
            };
            updateMeter();
          }
        } catch {}
      } catch (err: unknown) {
        if (!active) return;
        const msg = err instanceof Error ? err.message : 'Camera permission not granted';
        setCamError(msg);
      }
    }

    initCamera();

    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [facingMode]);

  // Handle Mute/Video toggle on local preview
  const toggleCam = () => {
    soundEffects.playClick();
    if (mediaStreamRef.current) {
      const vTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (vTrack) {
        vTrack.enabled = !vTrack.enabled;
        setCamEnabled(vTrack.enabled);
      }
    } else {
      setCamEnabled(!camEnabled);
    }
  };

  const toggleMic = () => {
    soundEffects.playClick();
    if (mediaStreamRef.current) {
      const aTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (aTrack) {
        aTrack.enabled = !aTrack.enabled;
        setMicEnabled(aTrack.enabled);
      }
    } else {
      setMicEnabled(!micEnabled);
    }
  };

  const flipCamera = () => {
    soundEffects.playClick();
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Mask drawing loop on top of preview
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
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

  // Handle Tag Input
  const handleAddTag = (tagToAdd?: string) => {
    const raw = tagToAdd || tagInput.trim().toLowerCase();
    if (!raw) return;
    const cleaned = raw.replace(/^#/, '').trim();
    if (cleaned && !userInterests.includes(cleaned)) {
      soundEffects.playClick();
      setUserInterests([...userInterests, cleaned]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    soundEffects.playClick();
    setUserInterests(userInterests.filter((t) => t !== tagToRemove));
  };

  const validateTerms = (): boolean => {
    if (!agreedTerms) {
      setShowTermsWarning(true);
      return false;
    }
    setShowTermsWarning(false);
    return true;
  };

  const handleStartVideoClick = () => {
    if (!validateTerms()) return;
    soundEffects.playClick();
    onStartVideo(userInterests, collegeOnly, mediaStreamRef.current, selectedFilter, selectedMask);
  };

  const handleStartTextClick = () => {
    if (!validateTerms()) return;
    soundEffects.playClick();
    onStartText(userInterests, collegeOnly);
  };

  const activeCssFilter = VIDEO_FILTERS.find((f) => f.id === selectedFilter)?.cssFilter || 'none';

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-10">
      {/* Hero Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
          Talk to Strangers!
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Omegle gives you random one-on-one video and text conversations with people from all across the globe. You are both anonymous.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Camera & Mic Setup */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Camera & Mic Preview
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className={`w-2 h-2 rounded-full ${camEnabled && !camError ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{camEnabled && !camError ? 'Cam Ready' : 'Virtual / Off'}</span>
            </div>
          </div>

          {/* Video Preview Frame */}
          <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center group shadow-inner">
            {/* Real Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform ${facingMode === 'user' ? 'scale-x-[-1]' : ''} ${
                !camEnabled ? 'opacity-0' : 'opacity-100'
              }`}
              style={{ filter: activeCssFilter }}
            />

            {/* Canvas for AR Masks */}
            <canvas
              ref={canvasRef}
              width={320}
              height={240}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
            />

            {/* Cam Off or Permission Denied Fallback */}
            {(!camEnabled || camError) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-slate-900 text-slate-400 z-5">
                <CameraOff className="w-10 h-10 mb-2 text-slate-500" />
                <span className="text-xs font-medium text-slate-300">
                  {camError ? 'Camera access not available' : 'Camera is muted'}
                </span>
                <span className="text-[11px] text-slate-500 mt-1 max-w-xs">
                  {camError
                    ? 'You can still chat with random strangers using text or virtual mode!'
                    : 'Tap the camera button below to enable video.'}
                </span>
              </div>
            )}

            {/* Mic Meter Bar on Video */}
            <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
              <Volume2 className={`w-3.5 h-3.5 ${micEnabled && micLevel > 5 ? 'text-emerald-400' : 'text-slate-400'}`} />
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-75 rounded-full"
                  style={{ width: `${micEnabled ? micLevel : 0}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-300 font-mono tabular-nums">
                {micEnabled ? `${micLevel}%` : 'Muted'}
              </span>
            </div>
          </div>

          {/* Quick Hardware Controls */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={toggleCam}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                camEnabled
                  ? 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                  : 'border-red-500/40 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400'
              }`}
            >
              {camEnabled ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
              <span>{camEnabled ? 'Cam On' : 'Cam Off'}</span>
            </button>

            <button
              type="button"
              onClick={toggleMic}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                micEnabled
                  ? 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                  : 'border-red-500/40 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400'
              }`}
            >
              {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              <span>{micEnabled ? 'Mic On' : 'Muted'}</span>
            </button>

            <button
              type="button"
              onClick={flipCamera}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Flip Cam</span>
            </button>
          </div>

          {/* Video Filter Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Video Color Filter</span>
              <span className="text-[10px] text-slate-400 capitalize">{selectedFilter}</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {VIDEO_FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedFilter(f.id);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors ${
                    selectedFilter === f.id
                      ? 'bg-sky-500 text-white font-medium shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* Fun AR Mask Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Fun Face Stickers
              </span>
              <span className="text-[10px] text-slate-400">
                {FUN_MASKS.find((m) => m.id === selectedMask)?.name}
              </span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {FUN_MASKS.map((mask) => (
                <button
                  key={mask.id}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedMask(mask.id);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors ${
                    selectedMask === mask.id
                      ? 'bg-amber-500 text-white font-medium shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{mask.icon}</span>
                  <span>{mask.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Mode Choice, Interests & Terms */}
        <div className="lg:col-span-7 space-y-6">
          {/* Interests Matching Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">What do you wanna talk about?</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Add mutual interests to match with strangers who like the same things (optional).
                </p>
              </div>
              {userInterests.length > 0 && (
                <button
                  onClick={() => setUserInterests([])}
                  className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Interest Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add interests (e.g., anime, coding, gaming)..."
                className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => handleAddTag()}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            {/* Active Tags */}
            {userInterests.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {userInterests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
                  >
                    #{interest}
                    <button
                      onClick={() => handleRemoveTag(interest)}
                      className="hover:text-red-500 transition-colors ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Popular Interests Quick Tap */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                Popular right now:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_INTERESTS.map((tag) => {
                  const isAdded = userInterests.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => (isAdded ? handleRemoveTag(tag) : handleAddTag(tag))}
                      className={`text-xs px-2.5 py-1 rounded-lg transition-colors border ${
                        isAdded
                          ? 'bg-sky-500 border-sky-500 text-white font-medium'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* College Student Chat Filter */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                  College Student Mode
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Prefer matching with college students & university peers
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                setCollegeOnly(!collegeOnly);
              }}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                collegeOnly ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  collegeOnly ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="space-y-1">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => {
                  setAgreedTerms(e.target.checked);
                  if (e.target.checked) setShowTermsWarning(false);
                }}
                className="mt-1 w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500 accent-sky-500"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400">
                I am at least 18 years old, or 13+ with parental consent. I agree to the{' '}
                <span className="text-sky-500 underline">Community Guidelines</span> and understand that video chat is
                unmoderated.
              </span>
            </label>
            {showTermsWarning && (
              <p className="text-xs font-semibold text-red-500 pl-7">
                You must accept the terms & community guidelines before starting.
              </p>
            )}
          </div>

          {/* Primary Big Start Buttons (Authentic Omegle Choice) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Video Mode Button */}
            <button
              type="button"
              onClick={handleStartVideoClick}
              className="flex items-center justify-center gap-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-base sm:text-lg shadow-lg shadow-sky-500/25 active:scale-[0.98] transition-all cursor-pointer group"
            >
              <div className="p-2 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="block leading-tight">Start Video</span>
                <span className="text-xs font-normal text-sky-100">Live Camera & Mic</span>
              </div>
            </button>

            {/* Text Mode Button */}
            <button
              type="button"
              onClick={handleStartTextClick}
              className="flex items-center justify-center gap-3 p-4 sm:p-5 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-base sm:text-lg shadow-md active:scale-[0.98] transition-all cursor-pointer group border border-slate-700"
            >
              <div className="p-2 bg-white/10 rounded-xl group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-amber-400" />
              </div>
              <div className="text-left">
                <span className="block leading-tight">Start Text</span>
                <span className="text-xs font-normal text-slate-300">Keyboard Only</span>
              </div>
            </button>
          </div>

          {/* Spy Mode Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                if (!validateTerms()) return;
                soundEffects.playClick();
                onStartSpy();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs font-medium transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-purple-500" />
              <span>Omegle Spy Mode: Ask a question or discuss as stranger</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
