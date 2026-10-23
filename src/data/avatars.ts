export interface CartoonAvatar {
  id: string;
  name: string;
  gender: 'Female' | 'Male' | 'Neutral';
  accentColor: string;
  tag: string;
  svgDataUri: string;
}

// Generate high quality, vivid cartoon vector avatars encoded as reliable Data URIs
function makeAvatarDataUri(svgInner: string, bg1: string, bg2: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg1}" />
        <stop offset="100%" stop-color="${bg2}" />
      </linearGradient>
    </defs>
    <circle cx="60" cy="60" r="56" fill="url(#bg)" />
    ${svgInner}
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const PRESET_AVATARS: CartoonAvatar[] = [
  {
    id: 'avatar-female-1',
    name: 'Maya Tech',
    gender: 'Female',
    accentColor: '#8B5CF6',
    tag: 'Focus Scholar',
    svgDataUri: makeAvatarDataUri(`
      <!-- Body & Neck -->
      <path d="M42 108 C42 85 78 85 78 108" fill="#7C3AED" />
      <path d="M50 78 C50 86 70 86 70 78 L70 65 L50 65 Z" fill="#FBBF24" />
      <!-- Head -->
      <ellipse cx="60" cy="54" rx="22" ry="24" fill="#FCD34D" />
      <!-- Hair Back & Front -->
      <path d="M38 52 C35 32 46 22 60 22 C74 22 85 32 82 52 C78 36 68 34 60 34 C52 34 42 36 38 52 Z" fill="#4C1D95" />
      <path d="M36 50 C34 65 37 78 44 82 C40 70 38 60 40 50 Z" fill="#4C1D95" />
      <path d="M84 50 C86 65 83 78 76 82 C80 70 82 60 80 50 Z" fill="#4C1D95" />
      <!-- Big Cute Eyes -->
      <ellipse cx="51" cy="52" rx="4" ry="5.5" fill="#1E1B4B" />
      <circle cx="52.5" cy="50.5" r="1.6" fill="#FFFFFF" />
      <ellipse cx="69" cy="52" rx="4" ry="5.5" fill="#1E1B4B" />
      <circle cx="70.5" cy="50.5" r="1.6" fill="#FFFFFF" />
      <!-- Cheeks -->
      <ellipse cx="45" cy="58" rx="3.5" ry="2" fill="#F87171" opacity="0.6" />
      <ellipse cx="75" cy="58" rx="3.5" ry="2" fill="#F87171" opacity="0.6" />
      <!-- Friendly Smile -->
      <path d="M54 62 Q60 67 66 62" stroke="#B45309" stroke-width="2" stroke-linecap="round" fill="none" />
      <!-- Glasses -->
      <circle cx="51" cy="52" r="8" stroke="#A78BFA" stroke-width="2.5" fill="none" />
      <circle cx="69" cy="52" r="8" stroke="#A78BFA" stroke-width="2.5" fill="none" />
      <line x1="59" y1="52" x2="61" y2="52" stroke="#A78BFA" stroke-width="2.5" />
    `, '#2E1065', '#4C1D95')
  },
  {
    id: 'avatar-male-1',
    name: 'Leo Code',
    gender: 'Male',
    accentColor: '#3B82F6',
    tag: 'Algo Master',
    svgDataUri: makeAvatarDataUri(`
      <!-- Body & Hoodie -->
      <path d="M40 108 C40 84 80 84 80 108" fill="#2563EB" />
      <path d="M52 74 C52 82 68 82 68 74 L68 64 L52 64 Z" fill="#FBBF24" />
      <!-- Head -->
      <ellipse cx="60" cy="54" rx="21" ry="23" fill="#FCD34D" />
      <!-- Cool Haircut -->
      <path d="M38 46 C40 26 55 20 76 25 C82 30 84 42 81 48 C76 34 68 31 60 31 C50 31 42 37 38 46 Z" fill="#1E293B" />
      <!-- Beanie Hat Rim -->
      <path d="M37 38 Q60 30 83 38 Q60 34 37 38 Z" fill="#0EA5E9" />
      <!-- Eyes with sparkle -->
      <circle cx="52" cy="52" r="3.8" fill="#0F172A" />
      <circle cx="53" cy="50.8" r="1.3" fill="#FFFFFF" />
      <circle cx="68" cy="52" r="3.8" fill="#0F172A" />
      <circle cx="69" cy="50.8" r="1.3" fill="#FFFFFF" />
      <!-- Eyebrows -->
      <path d="M47 45 Q53 43 56 46" stroke="#0F172A" stroke-width="2" stroke-linecap="round" fill="none" />
      <path d="M64 46 Q67 43 73 45" stroke="#0F172A" stroke-width="2" stroke-linecap="round" fill="none" />
      <!-- Smile -->
      <path d="M54 63 Q60 68 66 63" stroke="#B45309" stroke-width="2.2" stroke-linecap="round" fill="none" />
      <!-- Headphones -->
      <path d="M35 48 C32 30 88 30 85 48" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" fill="none" />
      <rect x="31" y="47" width="8" height="15" rx="4" fill="#F59E0B" />
      <rect x="81" y="47" width="8" height="15" rx="4" fill="#F59E0B" />
    `, '#172554', '#1E3A8A')
  },
  {
    id: 'avatar-female-2',
    name: 'Aria Science',
    gender: 'Female',
    accentColor: '#10B981',
    tag: 'Bio Researcher',
    svgDataUri: makeAvatarDataUri(`
      <!-- Body -->
      <path d="M42 108 C42 85 78 85 78 108" fill="#059669" />
      <path d="M52 76 L68 76 L68 64 L52 64 Z" fill="#FBBF24" />
      <!-- Hair Bun -->
      <circle cx="60" cy="22" r="14" fill="#78350F" />
      <!-- Head -->
      <ellipse cx="60" cy="54" rx="21" ry="24" fill="#FCD34D" />
      <!-- Hair Strands -->
      <path d="M39 48 C38 30 50 25 60 25 C70 25 82 30 81 48 C76 34 68 33 60 33 C52 33 44 34 39 48 Z" fill="#78350F" />
      <!-- Starry Eyes -->
      <ellipse cx="51" cy="52" rx="4" ry="5.5" fill="#064E3B" />
      <circle cx="52.5" cy="50" r="1.8" fill="#FFFFFF" />
      <ellipse cx="69" cy="52" rx="4" ry="5.5" fill="#064E3B" />
      <circle cx="70.5" cy="50" r="1.8" fill="#FFFFFF" />
      <!-- Blush -->
      <circle cx="44" cy="59" r="3" fill="#F87171" opacity="0.6" />
      <circle cx="76" cy="59" r="3" fill="#F87171" opacity="0.6" />
      <!-- Smile -->
      <path d="M53 62 Q60 67 67 62" stroke="#B45309" stroke-width="2.2" stroke-linecap="round" fill="none" />
      <!-- Hairclip / Flower -->
      <circle cx="74" cy="34" r="5" fill="#F43F5E" />
      <circle cx="74" cy="34" r="2" fill="#FEF08A" />
    `, '#064E3B', '#047857')
  },
  {
    id: 'avatar-male-2',
    name: 'Ethan Books',
    gender: 'Male',
    accentColor: '#F59E0B',
    tag: 'Deep Thinker',
    svgDataUri: makeAvatarDataUri(`
      <!-- Body & Collar -->
      <path d="M40 108 C40 84 80 84 80 108" fill="#D97706" />
      <polygon points="60,76 50,68 70,68" fill="#FEF3C7" />
      <path d="M52 72 L68 72 L68 64 L52 64 Z" fill="#FBBF24" />
      <!-- Head -->
      <ellipse cx="60" cy="53" rx="21" ry="23" fill="#FCD34D" />
      <!-- Side Part Hair -->
      <path d="M38 46 C37 28 50 19 68 20 C78 22 83 30 82 48 C76 33 66 28 58 28 C48 28 41 36 38 46 Z" fill="#451A03" />
      <!-- Glasses -->
      <rect x="42" y="46" width="16" height="12" rx="3" stroke="#1E293B" stroke-width="2.5" fill="none" />
      <rect x="62" y="46" width="16" height="12" rx="3" stroke="#1E293B" stroke-width="2.5" fill="none" />
      <line x1="58" y1="52" x2="62" y2="52" stroke="#1E293B" stroke-width="2" />
      <!-- Eyes -->
      <circle cx="50" cy="52" r="3.2" fill="#1E293B" />
      <circle cx="70" cy="52" r="3.2" fill="#1E293B" />
      <!-- Warm Smile -->
      <path d="M54 64 Q60 68 66 64" stroke="#92400E" stroke-width="2.2" stroke-linecap="round" fill="none" />
    `, '#451A03', '#78350F')
  },
  {
    id: 'avatar-female-3',
    name: 'Chloe Art',
    gender: 'Female',
    accentColor: '#EC4899',
    tag: 'Creative Mind',
    svgDataUri: makeAvatarDataUri(`
      <!-- Body -->
      <path d="M42 108 C42 85 78 85 78 108" fill="#DB2777" />
      <path d="M52 75 L68 75 L68 64 L52 64 Z" fill="#FBBF24" />
      <!-- Beret Hat -->
      <path d="M33 34 C33 22 87 18 87 32 C87 40 45 42 33 34 Z" fill="#BE185D" />
      <circle cx="62" cy="20" r="3" fill="#BE185D" />
      <!-- Head -->
      <ellipse cx="60" cy="54" rx="21" ry="24" fill="#FCD34D" />
      <!-- Wavy Hair -->
      <path d="M38 52 C34 70 36 84 44 86 C38 72 37 60 40 50 Z" fill="#18181B" />
      <path d="M82 52 C86 70 84 84 76 86 C82 72 83 60 80 50 Z" fill="#18181B" />
      <!-- Joyful Eyes -->
      <path d="M47 52 Q51 47 55 52" stroke="#18181B" stroke-width="2.8" stroke-linecap="round" fill="none" />
      <path d="M65 52 Q69 47 73 52" stroke="#18181B" stroke-width="2.8" stroke-linecap="round" fill="none" />
      <!-- Bright Open Smile -->
      <path d="M52 62 Q60 70 68 62 Z" fill="#BE123C" />
      <path d="M55 62 Q60 64 65 62" stroke="#FFFFFF" stroke-width="1.8" fill="none" />
      <!-- Cheeks -->
      <ellipse cx="44" cy="60" rx="3" ry="1.8" fill="#FDA4AF" />
      <ellipse cx="76" cy="60" rx="3" ry="1.8" fill="#FDA4AF" />
    `, '#831843', '#9D174D')
  },
  {
    id: 'avatar-male-3',
    name: 'Kai Swift',
    gender: 'Male',
    accentColor: '#06B6D4',
    tag: 'Quick Learner',
    svgDataUri: makeAvatarDataUri(`
      <!-- Body -->
      <path d="M40 108 C40 84 80 84 80 108" fill="#0891B2" />
      <path d="M52 74 L68 74 L68 64 L52 64 Z" fill="#FBBF24" />
      <!-- Head -->
      <ellipse cx="60" cy="54" rx="21" ry="23" fill="#FCD34D" />
      <!-- Spiky Cool Hair -->
      <path d="M38 46 L44 26 L54 32 L62 20 L70 30 L80 25 L82 46 Z" fill="#1E293B" />
      <!-- Confident Eyes -->
      <circle cx="51" cy="52" r="3.8" fill="#0F172A" />
      <circle cx="52" cy="50.8" r="1.3" fill="#FFFFFF" />
      <circle cx="69" cy="52" r="3.8" fill="#0F172A" />
      <circle cx="70" cy="50.8" r="1.3" fill="#FFFFFF" />
      <!-- Smirk -->
      <path d="M54 64 Q62 67 67 62" stroke="#0F172A" stroke-width="2.3" stroke-linecap="round" fill="none" />
      <!-- Lightning cheek mark -->
      <path d="M75 56 L77 60 L74 60 L76 64" stroke="#F59E0B" stroke-width="1.6" fill="none" />
    `, '#164E63', '#155E75')
  },
  {
    id: 'avatar-female-4',
    name: 'Zoe Genius',
    gender: 'Female',
    accentColor: '#F97316',
    tag: 'Exam Champ',
    svgDataUri: makeAvatarDataUri(`
      <!-- Body -->
      <path d="M42 108 C42 85 78 85 78 108" fill="#EA580C" />
      <path d="M52 76 L68 76 L68 64 L52 64 Z" fill="#FBBF24" />
      <!-- Ponytail on side -->
      <ellipse cx="80" cy="30" rx="9" ry="14" fill="#312E81" />
      <!-- Head -->
      <ellipse cx="60" cy="54" rx="21" ry="24" fill="#FCD34D" />
      <!-- Hair with bangs -->
      <path d="M38 50 C38 32 46 22 60 22 C74 22 82 32 82 50 C76 38 68 36 60 36 C52 36 44 38 38 50 Z" fill="#312E81" />
      <!-- Big round glasses -->
      <circle cx="50" cy="53" r="8" stroke="#F59E0B" stroke-width="2.2" fill="none" />
      <circle cx="70" cy="53" r="8" stroke="#F59E0B" stroke-width="2.2" fill="none" />
      <line x1="58" y1="53" x2="62" y2="53" stroke="#F59E0B" stroke-width="2.2" />
      <!-- Eyes inside glasses -->
      <circle cx="50" cy="53" r="3.2" fill="#1E1B4B" />
      <circle cx="51.2" cy="51.8" r="1.1" fill="#FFFFFF" />
      <circle cx="70" cy="53" r="3.2" fill="#1E1B4B" />
      <circle cx="71.2" cy="51.8" r="1.1" fill="#FFFFFF" />
      <!-- Smile -->
      <path d="M54 64 Q60 68 66 64" stroke="#9A3412" stroke-width="2.2" stroke-linecap="round" fill="none" />
    `, '#431407', '#7C2D12')
  },
  {
    id: 'avatar-male-4',
    name: 'Noah Flash',
    gender: 'Male',
    accentColor: '#10B981',
    tag: 'Streak Knight',
    svgDataUri: makeAvatarDataUri(`
      <!-- Body -->
      <path d="M40 108 C40 84 80 84 80 108" fill="#047857" />
      <path d="M52 74 L68 74 L68 64 L52 64 Z" fill="#FBBF24" />
      <!-- Head -->
      <ellipse cx="60" cy="54" rx="21" ry="23" fill="#FCD34D" />
      <!-- Curly Hair -->
      <circle cx="44" cy="34" r="8" fill="#18181B" />
      <circle cx="56" cy="28" r="9" fill="#18181B" />
      <circle cx="68" cy="28" r="9" fill="#18181B" />
      <circle cx="78" cy="36" r="8" fill="#18181B" />
      <ellipse cx="60" cy="36" rx="18" ry="10" fill="#18181B" />
      <!-- Determined Eyes -->
      <circle cx="51" cy="52" r="3.6" fill="#18181B" />
      <circle cx="52" cy="50.8" r="1.2" fill="#FFFFFF" />
      <circle cx="69" cy="52" r="3.6" fill="#18181B" />
      <circle cx="70" cy="50.8" r="1.2" fill="#FFFFFF" />
      <!-- Smile -->
      <path d="M53 63 Q60 67 67 63" stroke="#064E3B" stroke-width="2.2" stroke-linecap="round" fill="none" />
      <!-- Star on collar -->
      <polygon points="60,86 62,91 67,91 63,94 65,99 60,96 55,99 57,94 53,91 58,91" fill="#FBBF24" />
    `, '#064E3B', '#065F46')
  }
];

export const DEFAULT_AVATAR = PRESET_AVATARS[0];

export function getAvatarById(id?: string): CartoonAvatar {
  if (!id) return DEFAULT_AVATAR;
  return PRESET_AVATARS.find(a => a.id === id) || DEFAULT_AVATAR;
}
