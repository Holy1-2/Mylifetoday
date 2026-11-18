import React from 'react';
import DOMPurify from 'dompurify';

interface SafeHTMLRendererProps {
  html: string;
  className?: string;
}

const ALLOWED_IFRAME_DOMAINS = [
  'youtube.com',
  'youtube-nocookie.com',
  'www.youtube.com',
  'youtu.be',
  'player.vimeo.com',
  'vimeo.com',
  'open.spotify.com',
  'w.soundcloud.com',
  'soundcloud.com',
];

const sanitize = (dirty: string): string => {
  if (!dirty) return '';

  const clean = DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target'],
    ADD_TAGS: ['iframe'],
  });

  const doc = new DOMParser().parseFromString(clean, 'text/html');
  const iframes = doc.querySelectorAll('iframe');

  iframes.forEach((iframe) => {
    const src = iframe.getAttribute('src') || '';
    try {
      const url = new URL(src);
      const hostname = url.hostname.replace(/^www\./, '');
      const isAllowed = ALLOWED_IFRAME_DOMAINS.some((d) =>
        hostname === d || hostname.endsWith('.' + d)
      );
      if (!isAllowed) {
        iframe.remove();
      }
    } catch {
      iframe.remove();
    }
  });

  // Remove remaining dangerous tags — do NOT include 'iframe' here;
  // we already handled allowed iframes above.
  const scripts = doc.querySelectorAll('script, style, [onclick], [onerror], [onload], form, input, meta, link');
  scripts.forEach((el) => el.remove());

  iframes.forEach((iframe) => {
    if (!iframe.parentNode) return;
    const src = iframe.getAttribute('src') || '';
    const isAudio = /spotify\.com|soundcloud\.com/i.test(src);
    const frame = doc.createElement('div');
    frame.className = isAudio ? 'embed-frame embed-audio' : 'embed-frame';
    iframe.removeAttribute('width');
    iframe.removeAttribute('height');
    iframe.parentNode.replaceChild(frame, iframe);
    frame.appendChild(iframe);
  });

  return doc.body.innerHTML;
};

const SafeHTMLRenderer: React.FC<SafeHTMLRendererProps> = ({ html, className = '' }) => {
  return (
    <div
      className={`article-body max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitize(html) }}
    />
  );
};

export default SafeHTMLRenderer;