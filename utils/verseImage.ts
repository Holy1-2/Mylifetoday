export interface VerseImageInput {
  reference: string;
  text: string;
  brand?: string;
  siteUrl?: string;
}

const WIDTH = 1080;
const HEIGHT = 1350;

const wrapLines = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
};

const loadLogo = (): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = '/logo.png';
  });

export const renderVerseImage = async (input: VerseImageInput): Promise<Blob> => {
  const brand = input.brand || "Kubanan'Imana";
  const siteUrl = input.siteUrl || 'kubananimanuburimunsi.vercel.app';

  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      /* fonts are best-effort */
    }
  }

  const logo = await loadLogo();

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not supported');

  const background = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  background.addColorStop(0, '#0a0a0a');
  background.addColorStop(0.6, '#1a1a1a');
  background.addColorStop(1, '#0a0a0a');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const glow = ctx.createRadialGradient(WIDTH * 0.5, HEIGHT * 0.3, 40, WIDTH * 0.5, HEIGHT * 0.3, 560);
  glow.addColorStop(0, 'rgba(220, 38, 38, 0.14)');
  glow.addColorStop(1, 'rgba(220, 38, 38, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 3;
  ctx.strokeRect(44, 44, WIDTH - 88, HEIGHT - 88);

  ctx.textAlign = 'left';
  if (logo && logo.naturalWidth > 0) {
    const maxH = 64;
    const maxW = 210;
    const ratio = logo.naturalWidth / logo.naturalHeight;
    let h = maxH;
    let w = h * ratio;
    if (w > maxW) {
      w = maxW;
      h = w / ratio;
    }
    ctx.drawImage(logo, 96, 96 + (maxH - h) / 2, w, h);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 30px Raleway, Helvetica, Arial, sans-serif';
    ctx.fillText(brand, 96 + w + 20, 140);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 32px Raleway, Helvetica, Arial, sans-serif';
    ctx.fillText(brand, 96, 138);
  }

  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(96, 176, 88, 4);

  ctx.fillStyle = '#dc2626';
  ctx.font = '700 96px Raleway, Helvetica, Arial, sans-serif';
  ctx.fillText('“', 88, 300);

  const text = String(input.text || '').trim();
  const fontSize = text.length > 280 ? 46 : text.length > 190 ? 54 : text.length > 120 ? 62 : 70;
  ctx.fillStyle = '#fafafa';
  ctx.font = `500 ${fontSize}px Raleway, Helvetica, Arial, sans-serif`;
  const lines = wrapLines(ctx, text, WIDTH - 200);
  const lineHeight = fontSize * 1.32;
  const blockHeight = lines.length * lineHeight;
  let y = Math.max(430, (HEIGHT - blockHeight) / 2 - 20);
  for (const line of lines) {
    ctx.fillText(line, 100, y);
    y += lineHeight;
  }

  ctx.fillStyle = '#dc2626';
  ctx.font = '700 34px Raleway, Helvetica, Arial, sans-serif';
  ctx.fillText(String(input.reference || '').toUpperCase(), 100, y + 74);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, HEIGHT - 150);
  ctx.lineTo(WIDTH - 100, HEIGHT - 150);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.font = '400 26px Raleway, Helvetica, Arial, sans-serif';
  ctx.fillText(siteUrl, 100, HEIGHT - 96);

  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(220, 38, 38, 0.95)';
  ctx.font = '700 24px Raleway, Helvetica, Arial, sans-serif';
  ctx.fillText("IJAMBO RY'UMUNSI", WIDTH - 100, HEIGHT - 96);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Could not create image'));
    }, 'image/png');
  });
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
};

/** Shares the image when the platform supports file sharing, else downloads it. */
export const shareVerseImage = async (
  blob: Blob,
  options: { title: string; text: string; filename: string }
): Promise<'shared' | 'downloaded'> => {
  const file = new File([blob], options.filename, { type: 'image/png' });
  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean;
    share?: (data: ShareData) => Promise<void>;
  };

  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: options.title, text: options.text });
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'shared';
    }
  }
  downloadBlob(blob, options.filename);
  return 'downloaded';
};
