/**
 * CandidateAvatar — professional male / female silhouette avatars
 * with vibrant, per-candidate background colours.
 *
 * Style: white business-professional silhouette on a solid colour circle,
 * matching the reference image (suit + tie for male, bob hair + blouse for female).
 */

// ── Colour palette ──────────────────────────────────────────────────────────
const COLOURS = [
  '#2563EB', // blue
  '#7C3AED', // violet
  '#DB2777', // pink
  '#059669', // emerald
  '#D97706', // amber
  '#DC2626', // red
  '#0891B2', // cyan
  '#9333EA', // purple
  '#EA580C', // orange
  '#0F766E', // teal
  '#BE185D', // rose
  '#1D4ED8', // indigo
];

function pickColour(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff;
  return COLOURS[h % COLOURS.length];
}

// ── Male silhouette — business suit with tie ────────────────────────────────
function MaleSilhouette({ bg }: { bg: string }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Background */}
      <circle cx="50" cy="50" r="50" fill={bg} />

      {/* Head */}
      <circle cx="50" cy="31" r="15" fill="white" />

      {/* Neck */}
      <rect x="44.5" y="45" width="11" height="7" rx="1.5" fill="white" />

      {/* Suit body */}
      <path
        d="M14,102 L14,70 Q28,59 42,55 L50,67 L58,55 Q72,59 86,70 L86,102 Z"
        fill="white"
      />

      {/* Left lapel (slightly darker — same bg colour, low opacity) */}
      <path d="M42,55 L36,65 L50,67 Z" fill={bg} opacity="0.18" />
      {/* Right lapel */}
      <path d="M58,55 L64,65 L50,67 Z" fill={bg} opacity="0.18" />

      {/* Tie */}
      <path d="M47.5,55 L50,73 L52.5,55 L51,51 L49,51 Z" fill={bg} opacity="0.28" />
    </svg>
  );
}

// ── Female silhouette — bob haircut + blouse ────────────────────────────────
function FemaleSilhouette({ bg }: { bg: string }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Background */}
      <circle cx="50" cy="50" r="50" fill={bg} />

      {/* Bob hair shape — wider than head, comes down on both sides */}
      <path
        d="M31,36 Q31,15 50,15 Q69,15 69,36
           L69,52 Q69,60 61,61 L61,56 Q66,54 66,50
           L66,33 Q66,19 50,19 Q34,19 34,33
           L34,50 Q34,54 39,56 L39,61
           Q31,60 31,52 Z"
        fill="white"
      />
      {/* Side hair — left curtain extending down */}
      <path d="M31,36 Q27,46 29,57 L36,57 Q34,46 34,36 Z" fill="white" />
      {/* Side hair — right curtain extending down */}
      <path d="M69,36 Q73,46 71,57 L64,57 Q66,46 66,36 Z" fill="white" />

      {/* Head (face circle — sits over hair, same white) */}
      <circle cx="50" cy="32" r="14" fill="white" />

      {/* Neck */}
      <rect x="44.5" y="45" width="11" height="7" rx="1.5" fill="white" />

      {/* Blouse / body */}
      <path
        d="M14,102 L14,70 Q28,60 42,56 L50,67 L58,56 Q72,60 86,70 L86,102 Z"
        fill="white"
      />
    </svg>
  );
}

// ── Public component ────────────────────────────────────────────────────────
type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CLASS: Record<AvatarSize, string> = {
  xs: 'h-8  w-8',
  sm: 'h-10 w-10',
  md: 'h-20 w-20',
  lg: 'h-28 w-28',
  xl: 'h-32 w-32',
};

interface CandidateAvatarProps {
  gender: 'male' | 'female';
  id: string;
  size?: AvatarSize;
  className?: string;
}

export function CandidateAvatar({ gender, id, size = 'md', className = '' }: CandidateAvatarProps) {
  const bg = pickColour(id);
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 ${SIZE_CLASS[size]} ${className}`}
      role="img"
      aria-label={`${gender} candidate avatar`}
    >
      {gender === 'female'
        ? <FemaleSilhouette bg={bg} />
        : <MaleSilhouette bg={bg} />
      }
    </span>
  );
}

// ── UserAvatar — for sidebar / topbar (client · recruiter · admin) ───────────
const ROLE_COLOURS: Record<string, string> = {
  client:    '#2563EB',
  recruiter: '#7C3AED',
  admin:     '#0F766E',
};

interface UserAvatarProps {
  role: string;
  id: string;
  size?: AvatarSize;
  className?: string;
}

export function UserAvatar({ role, id, size = 'sm', className = '' }: UserAvatarProps) {
  const bg = ROLE_COLOURS[role] ?? pickColour(id);
  // Admins and recruiters get a generic professional look; clients too.
  // We use the male silhouette as a neutral professional icon for role avatars.
  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl overflow-hidden shrink-0 ${SIZE_CLASS[size]} ${className}`}
      role="img"
      aria-label={`${role} user avatar`}
    >
      <MaleSilhouette bg={bg} />
    </span>
  );
}
