/**
 * Visual Filters & AR Canvas Stickers Engine
 */

export interface VideoFilter {
  id: string;
  name: string;
  cssFilter: string;
  overlayClass?: string;
}

export const VIDEO_FILTERS: VideoFilter[] = [
  { id: 'normal', name: 'Normal', cssFilter: 'none' },
  { id: 'warm', name: 'Warm Sunset', cssFilter: 'sepia(0.25) saturate(1.3) brightness(1.05) contrast(1.05)' },
  { id: 'noir', name: 'Noir B&W', cssFilter: 'grayscale(1) contrast(1.35) brightness(0.95)' },
  { id: 'cyberpunk', name: 'Cyberpunk', cssFilter: 'contrast(1.4) hue-rotate(185deg) saturate(1.8)' },
  { id: 'vintage', name: '90s Camcorder', cssFilter: 'sepia(0.35) contrast(1.15) brightness(1.1) saturate(1.2)' },
  { id: 'glow', name: 'Soft Glow', cssFilter: 'brightness(1.12) contrast(0.95) saturate(1.1)' },
  { id: 'invert', name: 'Negative', cssFilter: 'invert(1) hue-rotate(180deg)' },
];

export interface FunMask {
  id: string;
  name: string;
  icon: string;
}

export const FUN_MASKS: FunMask[] = [
  { id: 'none', name: 'None', icon: '🚫' },
  { id: 'shades', name: 'Thug Shades', icon: '🕶️' },
  { id: 'party', name: 'Party Hat', icon: '🎉' },
  { id: 'cat', name: 'Cat Ears', icon: '🐱' },
  { id: 'mustache', name: 'Gentleman', icon: '🥸' },
  { id: 'alien', name: 'Alien Visor', icon: '👽' },
  { id: 'crown', name: 'Gold Crown', icon: '👑' },
];

/**
 * Draws the selected fun AR mask onto an HTML Canvas given normalized face coordinates.
 */
export function drawMaskOnCanvas(
  ctx: CanvasRenderingContext2D,
  maskId: string,
  width: number,
  height: number,
  t: number
) {
  if (maskId === 'none') return;

  const centerX = width / 2;
  const centerY = height * 0.44;
  const faceScale = Math.min(width, height) / 320;

  // Gentle float bobbing
  const bob = Math.sin(t * 0.003) * 3;

  ctx.save();

  if (maskId === 'shades') {
    // 8-bit black pixel sunglasses
    const glassW = 140 * faceScale;
    const glassH = 34 * faceScale;
    const y = centerY - 15 * faceScale + bob;

    ctx.fillStyle = '#0a0a0a';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 8;

    // Left lens
    ctx.fillRect(centerX - glassW * 0.48, y, glassW * 0.42, glassH);
    // Right lens
    ctx.fillRect(centerX + glassW * 0.06, y, glassW * 0.42, glassH);
    // Bridge
    ctx.fillRect(centerX - glassW * 0.1, y + glassH * 0.2, glassW * 0.2, glassH * 0.3);

    // White glare reflection
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 0;
    ctx.fillRect(centerX - glassW * 0.42, y + 4 * faceScale, 8 * faceScale, 8 * faceScale);
    ctx.fillRect(centerX - glassW * 0.35, y + 14 * faceScale, 8 * faceScale, 8 * faceScale);
    ctx.fillRect(centerX + glassW * 0.12, y + 4 * faceScale, 8 * faceScale, 8 * faceScale);
    ctx.fillRect(centerX + glassW * 0.19, y + 14 * faceScale, 8 * faceScale, 8 * faceScale);
  } else if (maskId === 'party') {
    // Colorful party cone hat on head
    const hatBaseY = centerY - 95 * faceScale + bob;
    const hatPeakY = hatBaseY - 110 * faceScale;
    const hatWidth = 80 * faceScale;

    // Hat triangle
    ctx.beginPath();
    ctx.moveTo(centerX, hatPeakY);
    ctx.lineTo(centerX - hatWidth / 2, hatBaseY);
    ctx.lineTo(centerX + hatWidth / 2, hatBaseY);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(centerX - hatWidth / 2, hatBaseY, centerX + hatWidth / 2, hatPeakY);
    gradient.addColorStop(0, '#f43f5e');
    gradient.addColorStop(0.5, '#fbbf24');
    gradient.addColorStop(1, '#06b6d4');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Pom pom on top
    ctx.beginPath();
    ctx.arc(centerX, hatPeakY, 12 * faceScale, 0, Math.PI * 2);
    ctx.fillStyle = '#facc15';
    ctx.fill();

    // Stripes
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4 * faceScale;
    ctx.beginPath();
    ctx.moveTo(centerX - 15 * faceScale, hatBaseY - 30 * faceScale);
    ctx.lineTo(centerX + 20 * faceScale, hatBaseY - 45 * faceScale);
    ctx.stroke();
  } else if (maskId === 'cat') {
    // Cute cat ears and whiskers
    const earBaseY = centerY - 80 * faceScale + bob;
    const earH = 65 * faceScale;
    const earW = 45 * faceScale;

    // Left ear
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.moveTo(centerX - 75 * faceScale, earBaseY);
    ctx.lineTo(centerX - 95 * faceScale, earBaseY - earH);
    ctx.lineTo(centerX - 35 * faceScale, earBaseY - 20 * faceScale);
    ctx.closePath();
    ctx.fill();

    // Left inner ear
    ctx.fillStyle = '#fdf2f8';
    ctx.beginPath();
    ctx.moveTo(centerX - 70 * faceScale, earBaseY - 5 * faceScale);
    ctx.lineTo(centerX - 88 * faceScale, earBaseY - earH + 15 * faceScale);
    ctx.lineTo(centerX - 45 * faceScale, earBaseY - 20 * faceScale);
    ctx.closePath();
    ctx.fill();

    // Right ear
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.moveTo(centerX + 75 * faceScale, earBaseY);
    ctx.lineTo(centerX + 95 * faceScale, earBaseY - earH);
    ctx.lineTo(centerX + 35 * faceScale, earBaseY - 20 * faceScale);
    ctx.closePath();
    ctx.fill();

    // Right inner ear
    ctx.fillStyle = '#fdf2f8';
    ctx.beginPath();
    ctx.moveTo(centerX + 70 * faceScale, earBaseY - 5 * faceScale);
    ctx.lineTo(centerX + 88 * faceScale, earBaseY - earH + 15 * faceScale);
    ctx.lineTo(centerX + 45 * faceScale, earBaseY - 20 * faceScale);
    ctx.closePath();
    ctx.fill();

    // Whiskers
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5 * faceScale;
    // Left whiskers
    ctx.beginPath();
    ctx.moveTo(centerX - 35 * faceScale, centerY + 25 * faceScale);
    ctx.lineTo(centerX - 100 * faceScale, centerY + 18 * faceScale);
    ctx.moveTo(centerX - 35 * faceScale, centerY + 35 * faceScale);
    ctx.lineTo(centerX - 95 * faceScale, centerY + 38 * faceScale);
    ctx.stroke();

    // Right whiskers
    ctx.beginPath();
    ctx.moveTo(centerX + 35 * faceScale, centerY + 25 * faceScale);
    ctx.lineTo(centerX + 100 * faceScale, centerY + 18 * faceScale);
    ctx.moveTo(centerX + 35 * faceScale, centerY + 35 * faceScale);
    ctx.lineTo(centerX + 95 * faceScale, centerY + 38 * faceScale);
    ctx.stroke();

    // Cute pink nose
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.arc(centerX, centerY + 22 * faceScale, 7 * faceScale, 0, Math.PI * 2);
    ctx.fill();
  } else if (maskId === 'mustache') {
    // Classy curly mustache + monocle
    const mY = centerY + 38 * faceScale + bob;
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.moveTo(centerX, mY);
    ctx.quadraticCurveTo(centerX - 25 * faceScale, mY - 10 * faceScale, centerX - 55 * faceScale, mY + 12 * faceScale);
    ctx.quadraticCurveTo(centerX - 70 * faceScale, mY + 22 * faceScale, centerX - 75 * faceScale, mY + 10 * faceScale);
    ctx.quadraticCurveTo(centerX - 45 * faceScale, mY + 2 * faceScale, centerX, mY + 14 * faceScale);
    ctx.quadraticCurveTo(centerX + 45 * faceScale, mY + 2 * faceScale, centerX + 75 * faceScale, mY + 10 * faceScale);
    ctx.quadraticCurveTo(centerX + 70 * faceScale, mY + 22 * faceScale, centerX + 55 * faceScale, mY + 12 * faceScale);
    ctx.quadraticCurveTo(centerX + 25 * faceScale, mY - 10 * faceScale, centerX, mY);
    ctx.closePath();
    ctx.fill();

    // Monocle on right eye
    const eyeX = centerX + 32 * faceScale;
    const eyeY = centerY - 14 * faceScale + bob;
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 3.5 * faceScale;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 22 * faceScale, 0, Math.PI * 2);
    ctx.stroke();

    // Monocle cord
    ctx.beginPath();
    ctx.moveTo(eyeX + 20 * faceScale, eyeY + 8 * faceScale);
    ctx.quadraticCurveTo(eyeX + 35 * faceScale, eyeY + 45 * faceScale, eyeX + 25 * faceScale, eyeY + 85 * faceScale);
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.5 * faceScale;
    ctx.stroke();
  } else if (maskId === 'alien') {
    // Neon Cyber Alien Visor
    const vY = centerY - 18 * faceScale + bob;
    const vW = 160 * faceScale;
    const vH = 32 * faceScale;

    ctx.save();
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 18;
    ctx.fillStyle = 'rgba(6, 182, 212, 0.85)';
    ctx.fillRect(centerX - vW / 2, vY, vW, vH);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(centerX - vW / 2 + 10 * faceScale, vY + 4 * faceScale, vW - 20 * faceScale, 3 * faceScale);
    ctx.restore();
  } else if (maskId === 'crown') {
    // Gold King/Queen Crown
    const cBaseY = centerY - 88 * faceScale + bob;
    const cW = 100 * faceScale;
    const cH = 48 * faceScale;

    ctx.save();
    ctx.shadowColor = 'rgba(234, 179, 8, 0.6)';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#eab308';

    ctx.beginPath();
    ctx.moveTo(centerX - cW / 2, cBaseY);
    ctx.lineTo(centerX - cW / 2, cBaseY - cH);
    ctx.lineTo(centerX - cW / 4, cBaseY - cH * 0.4);
    ctx.lineTo(centerX, cBaseY - cH * 1.15);
    ctx.lineTo(centerX + cW / 4, cBaseY - cH * 0.4);
    ctx.lineTo(centerX + cW / 2, cBaseY - cH);
    ctx.lineTo(centerX + cW / 2, cBaseY);
    ctx.closePath();
    ctx.fill();

    // Ruby jewel in center
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(centerX, cBaseY - cH * 0.45, 6 * faceScale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}
