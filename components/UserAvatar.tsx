interface AvatarUser {
  uid?: string | null;
  email?: string | null;
  displayName?: string | null;
}

interface UserAvatarProps {
  user?: AvatarUser | null;
  seed?: string;
  className?: string;
  label?: string;
}

const hashString = (value: string) => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const BACKGROUNDS = [
  ['#FDE68A', '#F59E0B'],
  ['#BFDBFE', '#3B82F6'],
  ['#BBF7D0', '#10B981'],
  ['#FBCFE8', '#EC4899'],
  ['#DDD6FE', '#8B5CF6'],
  ['#FED7AA', '#FB923C'],
  ['#A5F3FC', '#06B6D4'],
  ['#E5E7EB', '#6B7280'],
] as const;

const SKIN_TONES = ['#F7D9C4', '#EFC3A0', '#DDA47A', '#C08457', '#96603A', '#6B3E22'];
const HAIR_COLORS = ['#1F2937', '#3F2A1D', '#6B4423', '#A16207', '#7C2D12', '#111827'];
const SHIRTS = ['#1F2937', '#7F1D1D', '#1E3A8A', '#065F46', '#6B21A8', '#B45309'];
const INK = '#2A211B';

const UserAvatar = ({ user, seed, className = 'h-10 w-10', label }: UserAvatarProps) => {
  const key = seed || user?.uid || user?.email || user?.displayName || 'guest';
  const hash = hashString(String(key));
  const pick = (shift: number, length: number) => (hash >>> shift) % length;

  const [bgFrom, bgTo] = BACKGROUNDS[pick(0, BACKGROUNDS.length)];
  const skin = SKIN_TONES[pick(5, SKIN_TONES.length)];
  const hair = HAIR_COLORS[pick(10, HAIR_COLORS.length)];
  const shirt = SHIRTS[pick(15, SHIRTS.length)];
  const hairStyle = (hash >>> 3) % 5;
  const eyeStyle = (hash >>> 7) % 3;
  const mouthStyle = (hash >>> 9) % 3;
  const glasses = ((hash >>> 12) & 1) === 1;
  const freckles = ((hash >>> 14) & 1) === 1;
  const earrings = ((hash >>> 16) & 1) === 1;
  const gradientId = `avatar-${hash.toString(36)}`;

  const eyes = () => {
    if (eyeStyle === 1) {
      return (
        <g stroke={INK} strokeWidth="1.7" strokeLinecap="round" fill="none">
          <path d="M37.5 46.5q3.5-3.6 7 0" />
          <path d="M55.5 46.5q3.5-3.6 7 0" />
        </g>
      );
    }
    if (eyeStyle === 2) {
      return (
        <g fill={INK}>
          <ellipse cx="41" cy="47" rx="2.3" ry="2.8" />
          <ellipse cx="59" cy="47" rx="2.3" ry="2.8" />
          <circle cx="41.8" cy="46" r="0.8" fill="#fff" />
          <circle cx="59.8" cy="46" r="0.8" fill="#fff" />
        </g>
      );
    }
    return (
      <g fill={INK}>
        <circle cx="41" cy="47" r="1.9" />
        <circle cx="59" cy="47" r="1.9" />
      </g>
    );
  };

  const mouth = () => {
    if (mouthStyle === 1) {
      return <path d="M45.5 59.5h9" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />;
    }
    if (mouthStyle === 2) {
      return (
        <g>
          <path d="M44 57.5q6 6.5 12 0Z" fill="#7F1D1D" />
          <path d="M46 58.5h8" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
        </g>
      );
    }
    return <path d="M44.5 57.5q5.5 5 11 0" stroke={INK} strokeWidth="1.8" strokeLinecap="round" fill="none" />;
  };

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={label || 'Profile avatar'}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={bgFrom} />
          <stop offset="100%" stopColor={bgTo} />
        </linearGradient>
      </defs>

      <rect width="100" height="100" fill={`url(#${gradientId})`} />
      <circle cx="22" cy="22" r="16" fill="#ffffff" opacity="0.16" />
      <circle cx="82" cy="76" r="22" fill="#ffffff" opacity="0.12" />

      {hairStyle === 3 && (
        <path
          d="M26 45c0-16 10-25 24-25s24 9 24 25v19c0 4-5 5-7 1-2-4-3-8-3-12H36c0 4-1 8-3 12-2 4-7 3-7-1Z"
          fill={hair}
        />
      )}

      <path d="M12 100c3-17 17-26 38-26s35 9 38 26Z" fill={shirt} />
      <path d="M43 74l7 8 7-8-7 18Z" fill="#ffffff" opacity="0.85" />

      <rect x="43" y="62" width="14" height="15" rx="6" fill={skin} />
      <ellipse cx="50" cy="72" rx="7" ry="3" fill="#000000" opacity="0.08" />

      <circle cx="28" cy="48" r="4.2" fill={skin} />
      <circle cx="72" cy="48" r="4.2" fill={skin} />
      <ellipse cx="50" cy="45" rx="21" ry="23" fill={skin} />

      {hairStyle === 0 && (
        <path
          d="M29 43c0-13 9-23 21-23s21 10 21 23c-4-5-9-8-13-12-3 4-5 6-8 6s-5-2-8-6c-4 4-9 7-13 12Z"
          fill={hair}
        />
      )}
      {hairStyle === 1 && (
        <path
          d="M28 44c0-14 10-24 22-24s22 10 22 24c0 3-1 5-3 5l-3-1c-2-8-3-11-5-14-3 5-7 7-11 7s-8-2-11-7c-2 3-3 6-5 14l-3 1c-2 0-3-2-3-5Z"
          fill={hair}
        />
      )}
      {hairStyle === 2 && (
        <g fill={hair}>
          <circle cx="34" cy="32" r="9" />
          <circle cx="45" cy="26" r="9" />
          <circle cx="57" cy="27" r="9" />
          <circle cx="67" cy="35" r="8" />
          <circle cx="30" cy="43" r="6" />
          <circle cx="70" cy="44" r="6" />
        </g>
      )}
      {hairStyle === 3 && (
        <path
          d="M29 42c0-13 9-22 21-22s21 9 21 22c-3-4-7-7-11-11-3 4-6 6-10 6s-7-2-10-6c-4 4-8 7-11 11Z"
          fill={hair}
        />
      )}
      {hairStyle === 4 && (
        <g fill={hair}>
          <path d="M27 43c0-14 10-23 23-23s23 9 23 23c0 3-2 4-5 3-5-2-10-3-18-3s-13 1-18 3c-3 1-5 0-5-3Z" />
          <circle cx="71" cy="28" r="5" />
        </g>
      )}

      <g stroke={hair} strokeWidth="1.7" strokeLinecap="round">
        <path d="M36 39.5h8" />
        <path d="M56 39.5h8" />
      </g>

      {eyes()}
      <path d="M50 51v4" stroke="#000000" strokeOpacity="0.22" strokeWidth="1.4" strokeLinecap="round" />
      {mouth()}

      {freckles && (
        <g fill="#000000" opacity="0.16">
          <circle cx="36" cy="54" r="0.9" />
          <circle cx="39" cy="56" r="0.9" />
          <circle cx="62" cy="54" r="0.9" />
          <circle cx="65" cy="56" r="0.9" />
        </g>
      )}

      {glasses && (
        <g stroke={INK} strokeWidth="1.7" fill="none" opacity="0.85">
          <rect x="34" y="42.5" width="13" height="10" rx="4.5" />
          <rect x="53" y="42.5" width="13" height="10" rx="4.5" />
          <path d="M47 47h6" />
        </g>
      )}

      {earrings && (
        <g fill="#FACC15" stroke="#B45309" strokeWidth="0.8">
          <circle cx="28" cy="52" r="2.4" />
          <circle cx="72" cy="52" r="2.4" />
        </g>
      )}
    </svg>
  );
};

export default UserAvatar;
