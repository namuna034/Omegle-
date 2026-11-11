/**
 * Stranger Persona Engine & Multi-Tab P2P Broadcast Channel
 */

export interface StrangerPersona {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'NB';
  country: string;
  city: string;
  flag: string;
  interests: string[];
  bio: string;
  avatarSeed: number;
  backgroundTheme: 'neon_bedroom' | 'cozy_library' | 'sunny_cafe' | 'studio_guitar' | 'gamer_den' | 'art_loft';
  accentColor: string;
  initialGreetings: string[];
  responses: Record<string, string[]>;
}

export const STRANGER_PERSONAS: StrangerPersona[] = [
  {
    id: 'alex_ca',
    name: 'Alex',
    age: 22,
    gender: 'M',
    country: 'Canada',
    city: 'Vancouver',
    flag: '🇨🇦',
    interests: ['gaming', 'coding', 'anime', 'music', 'coffee'],
    bio: 'CS student building indie games & listening to lo-fi',
    avatarSeed: 101,
    backgroundTheme: 'gamer_den',
    accentColor: '#3b82f6',
    initialGreetings: [
      'yo! what’s good?',
      'hey hey, nice setup! how are you?',
      'sup! what brings you to Omegle today?',
      'hey! you caught me between game rounds haha',
    ],
    responses: {
      asl: ['22 m Canada, you?', '22 M Vancouver! wbu?', '22 guy from Canada. ASL?'],
      greeting: ['doing pretty chill today! just drinking iced coffee. how’s your day going?', 'all good here, working on some code earlier! what are you up to?'],
      gaming: ['no way, what games are you into right now? I’ve been hooked on Valorant and Elden Ring!', 'gaming is life haha. Console or PC?'],
      music: ['I love indie rock and synthwave. Who is your top artist on Spotify right now?', 'music makes everything better. Got any song recommendations?'],
      anime: ['yesss! Have you seen Jujutsu Kaisen or Attack on Titan? What’s your all-time favorite?', 'huge anime fan! Currently watching Chainsaw Man and Solo Leveling!'],
      filter: ['haha nice filter! Looks like a retro VHS tape or superhero movie!', 'your camera vibe is super clean!'],
      default: [
        'that’s honestly pretty cool.',
        'haha yeah totally get that.',
        'damn for real? that’s interesting!',
        'nice! what else do you like doing in your free time?',
        'tell me something random about yourself!',
      ],
    },
  },
  {
    id: 'chloe_uk',
    name: 'Chloe',
    age: 21,
    gender: 'F',
    country: 'UK',
    city: 'London',
    flag: '🇬🇧',
    interests: ['music', 'art', 'travel', 'fashion', 'photography'],
    bio: 'Art history major with a passion for film cameras',
    avatarSeed: 202,
    backgroundTheme: 'art_loft',
    accentColor: '#ec4899',
    initialGreetings: [
      'hello there! 👋',
      'heyyy! where are you from?',
      'hi! love bumping into cool people on here ✨',
      'good day! how are you doing?',
    ],
    responses: {
      asl: ['21 f London, hbu?', '21 female from London! ASL?', '21 F UK ✨ you?'],
      greeting: ['I’m doing great, just sketching some prints! How’s your week been?', 'brilliant actually, just had some earl grey tea. What are you up to?'],
      art: ['oh awesome! Do you draw or paint? I love acrylics and 35mm film photography!', 'art is everything! Favorite museum or aesthetic?'],
      music: ['huge fan of Fleetwood Mac, Lana Del Rey, and Arctic Monkeys! What do you listen to?', 'live music is unbeatable. Ever been to any good festivals?'],
      travel: ['I was just backpacking in Spain last summer! What’s your dream destination?', 'traveling is the best. Where’s the favorite place you’ve visited?'],
      default: [
        'aw that’s lovely!',
        'haha you seem really chill! :)',
        'no way, tell me more!',
        'such a vibe honestly ✨',
        'what kind of music are you listening to right now?',
      ],
    },
  },
  {
    id: 'kenji_jp',
    name: 'Kenji',
    age: 24,
    gender: 'M',
    country: 'Japan',
    city: 'Tokyo',
    flag: '🇯🇵',
    interests: ['anime', 'gaming', 'music', 'tech', 'travel'],
    bio: 'Sound designer & street photographer living in Shibuya',
    avatarSeed: 303,
    backgroundTheme: 'neon_bedroom',
    accentColor: '#8b5cf6',
    initialGreetings: [
      'Konnichiwa! Hey there!',
      'Hello from Tokyo! 🗼',
      'Yo! Nice to meet you!',
      'Hey! What time is it where you are?',
    ],
    responses: {
      asl: ['24 m Tokyo, you?', '24 M Japan! What about you?', '24 guy in Tokyo! ASL?'],
      greeting: ['Doing well! It’s nighttime here in Tokyo, beautiful neon lights outside.', 'Great! Working on a music remix. How is your day?'],
      anime: ['Awesome! In Japan we have so many good series right now. Do you like Evangelion, Ghibli, or shonen?', 'Anime culture here is wild! Akihabara is right down the road!'],
      tech: ['I love messing with synthesizers and custom mechanical keyboards! Do you code or build stuff?', 'Tech is fascinating, especially robotics and sound gear!'],
      default: [
        'Sugoi! That sounds really neat.',
        'Haha I love that.',
        'Tokyo says hello! 🎌',
        'What is your favorite food from around the world?',
        'Do you ever plan to visit Japan?',
      ],
    },
  },
  {
    id: 'elena_de',
    name: 'Elena',
    age: 23,
    gender: 'F',
    country: 'Germany',
    city: 'Berlin',
    flag: '🇩🇪',
    interests: ['fitness', 'techno', 'philosophy', 'movies', 'books'],
    bio: 'Architecture student & weekend DJ who loves cinema',
    avatarSeed: 404,
    backgroundTheme: 'cozy_library',
    accentColor: '#10b981',
    initialGreetings: [
      'Guten Tag! Hey :)',
      'Hallo! How’s your evening going?',
      'Hey stranger, what are you watching or reading today?',
      'Servus! Nice to meet someone friendly on here!',
    ],
    responses: {
      asl: ['23 f Berlin, you?', '23 F Germany! ASL?', '23 female from Berlin :)'],
      greeting: ['Really good, just got back from a bike ride around the Spree river. You?', 'Pretty relaxed! Studying architecture diagrams and chilling.'],
      movies: ['Cinema is my big passion. Denis Villeneuve and Christopher Nolan films are masterpieces! Favorite movie ever?', 'What’s the last movie that blew your mind?'],
      books: ['Currently reading some existentialist philosophy and sci-fi! Any book recommendations?', 'Nothing beats reading with a warm cup of coffee.'],
      default: [
        'That is very interesting!',
        'Haha exactly.',
        'Greetings from Berlin! 🇩🇪',
        'What’s the most exciting thing you did this month?',
        'Do you play any instruments or sports?',
      ],
    },
  },
  {
    id: 'lucas_br',
    name: 'Lucas',
    age: 20,
    gender: 'M',
    country: 'Brazil',
    city: 'São Paulo',
    flag: '🇧🇷',
    interests: ['music', 'soccer', 'guitar', 'fitness', 'travel'],
    bio: 'Guitarist playing bossa nova & rock, loves surfing',
    avatarSeed: 505,
    backgroundTheme: 'studio_guitar',
    accentColor: '#f59e0b',
    initialGreetings: [
      'Fala aí! Hey bro! 🎸',
      'Sup man! How’s it going?',
      'Hey from Brazil! Warm weather here today!',
      'Yo! Nice to connect with you!',
    ],
    responses: {
      asl: ['20 m Brazil, you?', '20 M São Paulo! ASL bro?', '20 guy from Brazil! wbu?'],
      greeting: ['Tudo bem! Just jamming on my acoustic guitar. What’s going on with you?', 'Super energized! Played football this morning. How’s your day?'],
      music: ['I play acoustic and electric guitar! Do you play any instrument or sing?', 'Music is pure energy! Rock, funk, bossa nova, I love it all!'],
      soccer: ['Football/soccer is in our blood haha! Do you watch Premier League or World Cup?', 'Neymar, Ronaldinho, Pele legends! You play any sports?'],
      default: [
        'Haha that’s dope!',
        'Much love from South America!',
        'You seem like a cool dude! 🤙',
        'What kind of music do you jam to when driving or walking?',
      ],
    },
  },
  {
    id: 'maya_us',
    name: 'Maya',
    age: 21,
    gender: 'F',
    country: 'USA',
    city: 'Austin',
    flag: '🇺🇸',
    interests: ['coding', 'music', 'coffee', 'art', 'dogs'],
    bio: 'UX designer & dog mom who loves taco trucks',
    avatarSeed: 606,
    backgroundTheme: 'sunny_cafe',
    accentColor: '#6366f1',
    initialGreetings: [
      'hey hey! how are you doing?',
      'hi there! where in the world are you?',
      'yo! hope your day is going great :)',
      'heyyy! love meeting random folks here!',
    ],
    responses: {
      asl: ['21 f Texas, you?', '21 F Austin, USA! ASL?', '21 girl in Texas :) wbu?'],
      greeting: ['Doing awesome! Sipping an oat milk latte and hanging out with my golden retriever.', 'Pretty chill, just browsing design inspiration! How about you?'],
      coding: ['UX/UI design and frontend dev here! What stack or languages do you use?', 'Tech is so fun when you build cool visual things!'],
      dogs: ['Aww dogs are the absolute best! Do you have any pets?', 'My dog is literally sleeping on my feet right now haha.'],
      default: [
        'Haha love that for you!',
        'Oh wow really? That’s super neat.',
        'Austin sends warm vibes! 🤠',
        'Tell me the best thing that happened to you today!',
      ],
    },
  },
];

/**
 * Multi-Tab Broadcast Channel for Real P2P Between Browser Windows
 */
export interface PeerMessage {
  type: 'DISCOVER' | 'OFFER' | 'ACCEPT' | 'CHAT' | 'REACTION' | 'SKIP' | 'FRAME_DATA';
  senderId: string;
  senderName: string;
  interests?: string[];
  payload?: unknown;
}

export class MultiTabHub {
  private channel: BroadcastChannel | null = null;
  public myId: string = Math.random().toString(36).substring(2, 9);
  public connectedPeerId: string | null = null;
  private onPeerMessageCallback: ((msg: PeerMessage) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('omegle_web_p2p_channel');
        this.channel.onmessage = (event) => {
          if (event.data && typeof event.data === 'object') {
            this.handleMessage(event.data as PeerMessage);
          }
        };
      } catch {}
    }
  }

  public setListener(cb: (msg: PeerMessage) => void) {
    this.onPeerMessageCallback = cb;
  }

  private handleMessage(msg: PeerMessage) {
    if (msg.senderId === this.myId) return; // Ignore own echoes
    if (this.onPeerMessageCallback) {
      this.onPeerMessageCallback(msg);
    }
  }

  public broadcast(type: PeerMessage['type'], payload?: unknown, interests?: string[]) {
    if (!this.channel) return;
    const msg: PeerMessage = {
      type,
      senderId: this.myId,
      senderName: 'Stranger (Peer Tab)',
      interests,
      payload,
    };
    try {
      this.channel.postMessage(msg);
    } catch {}
  }

  public close() {
    if (this.channel) {
      this.broadcast('SKIP');
    }
  }
}

/**
 * Canvas Video Persona Simulator:
 * Renders an animated human webcam feed on a canvas element with realistic motion,
 * breathing, blinking, mouth animation, subtle head tilt, room ambiance, and camera noise.
 */
export class CanvasStrangerSimulator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animId: number | null = null;
  public persona: StrangerPersona;
  private isSpeaking: boolean = false;
  private blinkTimer: number = 0;
  private isBlinking: boolean = false;
  private mouthOpenAmount: number = 0;
  private startTime: number = Date.now();

  constructor(canvas: HTMLCanvasElement, persona: StrangerPersona) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Cannot get 2d context');
    this.ctx = context;
    this.persona = persona;
  }

  public setSpeaking(speaking: boolean) {
    this.isSpeaking = speaking;
  }

  public start() {
    this.stop();
    this.startTime = Date.now();

    const render = () => {
      this.drawFrame();
      this.animId = requestAnimationFrame(render);
    };
    this.animId = requestAnimationFrame(render);
  }

  public stop() {
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  private drawFrame() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;
    const t = (Date.now() - this.startTime) / 1000;

    // Head bobbing & breathing
    const breathY = Math.sin(t * 1.5) * 4;
    const tilt = Math.sin(t * 0.8) * 0.03;
    const centerX = width / 2;
    const centerY = height * 0.48 + breathY;
    const scale = Math.min(width, height) / 360;

    // Handle blinking
    this.blinkTimer += 0.016;
    if (this.blinkTimer > 3.5 + Math.sin(this.persona.avatarSeed) * 1.2) {
      this.isBlinking = true;
      if (this.blinkTimer > 3.65 + Math.sin(this.persona.avatarSeed) * 1.2) {
        this.isBlinking = false;
        this.blinkTimer = 0;
      }
    }

    // Handle mouth speaking
    if (this.isSpeaking) {
      this.mouthOpenAmount = 0.5 + Math.sin(t * 12) * 0.5;
    } else {
      this.mouthOpenAmount = Math.max(0, this.mouthOpenAmount - 0.1);
    }

    // 1. Draw Background Room based on persona theme
    this.drawRoomBackground(width, height, t);

    // 2. Draw Body & Clothes
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(tilt);

    // Shoulders / Torso
    ctx.fillStyle = this.persona.accentColor;
    ctx.beginPath();
    ctx.ellipse(0, 160 * scale, 130 * scale, 90 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Collar / Hoodie details
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 95 * scale, 45 * scale, 25 * scale, 0, 0, Math.PI);
    ctx.fill();

    // Neck
    ctx.fillStyle = '#f5c396';
    ctx.fillRect(-22 * scale, 50 * scale, 44 * scale, 45 * scale);

    // Neck shadow
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath();
    ctx.arc(0, 50 * scale, 30 * scale, 0, Math.PI);
    ctx.fill();

    // 3. Head / Face shape
    ctx.fillStyle = '#fbd4b0';
    ctx.beginPath();
    ctx.ellipse(0, 10 * scale, 58 * scale, 74 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = '#f5c396';
    ctx.beginPath();
    ctx.ellipse(-56 * scale, 12 * scale, 10 * scale, 18 * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(56 * scale, 12 * scale, 10 * scale, 18 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    this.drawHair(ctx, scale);

    // Eyebrows
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 3.5 * scale;
    ctx.beginPath();
    // Left eyebrow
    ctx.moveTo(-38 * scale, -18 * scale);
    ctx.quadraticCurveTo(-24 * scale, -24 * scale, -10 * scale, -18 * scale);
    // Right eyebrow
    ctx.moveTo(10 * scale, -18 * scale);
    ctx.quadraticCurveTo(24 * scale, -24 * scale, 38 * scale, -18 * scale);
    ctx.stroke();

    // Eyes
    if (this.isBlinking) {
      // Closed eye line
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.moveTo(-36 * scale, -3 * scale);
      ctx.lineTo(-12 * scale, -3 * scale);
      ctx.moveTo(12 * scale, -3 * scale);
      ctx.lineTo(36 * scale, -3 * scale);
      ctx.stroke();
    } else {
      // Eye whites
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-24 * scale, -3 * scale, 14 * scale, 9 * scale, 0, 0, Math.PI * 2);
      ctx.ellipse(24 * scale, -3 * scale, 14 * scale, 9 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pupils (glancing slightly)
      const glanceX = Math.sin(t * 0.5) * 2 * scale;
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(-24 * scale + glanceX, -3 * scale, 6.5 * scale, 0, Math.PI * 2);
      ctx.arc(24 * scale + glanceX, -3 * scale, 6.5 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Eye reflections
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-22 * scale + glanceX, -5 * scale, 2.5 * scale, 0, Math.PI * 2);
      ctx.arc(26 * scale + glanceX, -5 * scale, 2.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Nose
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(0, -2 * scale);
    ctx.lineTo(3 * scale, 18 * scale);
    ctx.lineTo(-4 * scale, 20 * scale);
    ctx.stroke();

    // Mouth
    const mouthY = 38 * scale;
    if (this.mouthOpenAmount > 0.05) {
      // Open mouth when speaking
      ctx.fillStyle = '#881337';
      ctx.beginPath();
      ctx.ellipse(0, mouthY, 14 * scale, (8 + this.mouthOpenAmount * 8) * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Teeth
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-8 * scale, mouthY - 6 * scale, 16 * scale, 4 * scale);
    } else {
      // Subtle friendly smile
      ctx.strokeStyle = '#be123c';
      ctx.lineWidth = 2.8 * scale;
      ctx.beginPath();
      ctx.moveTo(-16 * scale, mouthY - 2 * scale);
      ctx.quadraticCurveTo(0, mouthY + 7 * scale, 16 * scale, mouthY - 2 * scale);
      ctx.stroke();
    }

    // Headset / Headphones for gamers
    if (this.persona.backgroundTheme === 'gamer_den' || this.persona.backgroundTheme === 'studio_guitar') {
      this.drawHeadset(ctx, scale);
    }

    ctx.restore();

    // 4. Subtle Webcam Grain / Glitch Overlay
    this.drawWebcamArtifacts(width, height, t);
  }

  private drawHair(ctx: CanvasRenderingContext2D, scale: number) {
    ctx.fillStyle = this.persona.gender === 'F' ? '#78350f' : '#1e1b4b';
    ctx.beginPath();

    if (this.persona.gender === 'F') {
      // Long hair framing face
      ctx.arc(0, -18 * scale, 68 * scale, Math.PI * 0.8, Math.PI * 2.2);
      ctx.lineTo(65 * scale, 90 * scale);
      ctx.lineTo(45 * scale, 90 * scale);
      ctx.lineTo(48 * scale, 10 * scale);
      ctx.lineTo(-48 * scale, 10 * scale);
      ctx.lineTo(-45 * scale, 90 * scale);
      ctx.lineTo(-65 * scale, 90 * scale);
      ctx.closePath();
      ctx.fill();
    } else {
      // Short modern crop / swept
      ctx.arc(0, -18 * scale, 64 * scale, Math.PI * 0.9, Math.PI * 2.1);
      ctx.lineTo(55 * scale, -10 * scale);
      ctx.lineTo(40 * scale, -28 * scale);
      ctx.lineTo(-40 * scale, -28 * scale);
      ctx.lineTo(-55 * scale, -10 * scale);
      ctx.closePath();
      ctx.fill();
    }
  }

  private drawHeadset(ctx: CanvasRenderingContext2D, scale: number) {
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 9 * scale;
    ctx.beginPath();
    ctx.arc(0, -16 * scale, 76 * scale, Math.PI * 0.95, Math.PI * 2.05);
    ctx.stroke();

    // Ear pads
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(-72 * scale, 0, 18 * scale, 40 * scale, 6 * scale);
    ctx.roundRect(54 * scale, 0, 18 * scale, 40 * scale, 6 * scale);
    ctx.fill();

    // Microphone arm
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.moveTo(-62 * scale, 24 * scale);
    ctx.lineTo(-35 * scale, 46 * scale);
    ctx.stroke();

    // Mic foam
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-33 * scale, 47 * scale, 6 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawRoomBackground(width: number, height: number, t: number) {
    const ctx = this.ctx;
    const gradient = ctx.createLinearGradient(0, 0, width, height);

    if (this.persona.backgroundTheme === 'gamer_den') {
      gradient.addColorStop(0, '#090d16');
      gradient.addColorStop(0.5, '#111827');
      gradient.addColorStop(1, '#0f172a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Neon LED strip on wall
      ctx.save();
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 24;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.28);
      ctx.lineTo(width, height * 0.28);
      ctx.stroke();
      ctx.restore();

      // Monitor glow in background
      ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
      ctx.fillRect(width * 0.08, height * 0.45, width * 0.24, height * 0.35);
    } else if (this.persona.backgroundTheme === 'cozy_library') {
      gradient.addColorStop(0, '#1c1917');
      gradient.addColorStop(0.6, '#292524');
      gradient.addColorStop(1, '#1c1917');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Bookshelves lines
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.2)';
      ctx.lineWidth = 6;
      ctx.strokeRect(width * 0.7, height * 0.1, width * 0.26, height * 0.75);

      // Warm lamp glow
      const lampGlow = ctx.createRadialGradient(width * 0.85, height * 0.2, 5, width * 0.85, height * 0.2, 140);
      lampGlow.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
      lampGlow.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = lampGlow;
      ctx.fillRect(0, 0, width, height);
    } else if (this.persona.backgroundTheme === 'art_loft') {
      gradient.addColorStop(0, '#18181b');
      gradient.addColorStop(0.5, '#27272a');
      gradient.addColorStop(1, '#18181b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Art frames on wall
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.35)';
      ctx.lineWidth = 3;
      ctx.strokeRect(width * 0.12, height * 0.14, 55, 75);
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.35)';
      ctx.strokeRect(width * 0.75, height * 0.18, 60, 50);

      // Fairy lights string
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.moveTo(0, height * 0.15);
      ctx.quadraticCurveTo(width * 0.5, height * 0.28, width, height * 0.12);
      ctx.stroke();

      for (let i = 0; i < 7; i++) {
        const lx = (width / 6) * i;
        const ly = height * 0.15 + Math.sin(i + t) * 8 + 12;
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(lx, ly, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Default clean room
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(0.5, '#1e293b');
      gradient.addColorStop(1, '#0f172a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Window blinds with daylight
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      for (let y = height * 0.1; y < height * 0.55; y += 14) {
        ctx.fillRect(width * 0.06, y, width * 0.22, 6);
      }
    }
  }

  private drawWebcamArtifacts(width: number, height: number, t: number) {
    const ctx = this.ctx;

    // Subtle film noise / sensor grain
    ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
    for (let i = 0; i < 40; i++) {
      const rx = (Math.sin(t * 100 + i * 17) * 0.5 + 0.5) * width;
      const ry = (Math.cos(t * 80 + i * 29) * 0.5 + 0.5) * height;
      ctx.fillRect(rx, ry, 2, 2);
    }

    // Vignette
    const vignette = ctx.createRadialGradient(width / 2, height / 2, width * 0.35, width / 2, height / 2, width * 0.75);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
  }
}
