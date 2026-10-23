import { StreakBadge } from '../types';

export const ALL_STREAK_BADGES: StreakBadge[] = [
  {
    id: 'badge-1',
    tierLevel: 1,
    requiredDays: 1,
    title: 'Spark of Curiosity',
    description: 'Ignited your learning journey by completing day 1.',
    iconName: 'Zap',
    rarity: 'Common',
    category: 'Initiation'
  },
  {
    id: 'badge-3',
    tierLevel: 2,
    requiredDays: 3,
    title: 'Habit Builder',
    description: 'Maintained 3 consecutive days of focused study.',
    iconName: 'Sparkles',
    rarity: 'Common',
    category: 'Initiation'
  },
  {
    id: 'badge-7',
    tierLevel: 3,
    requiredDays: 7,
    title: 'One-Week Dynamo',
    description: 'Crushed a full 7-day streak with zero missed sessions.',
    iconName: 'Flame',
    rarity: 'Rare',
    category: 'Consistency'
  },
  {
    id: 'badge-10',
    tierLevel: 4,
    requiredDays: 10,
    title: 'Decade Scholar',
    description: 'Reached 10 consecutive active study days.',
    iconName: 'Shield',
    rarity: 'Rare',
    category: 'Consistency'
  },
  {
    id: 'badge-14',
    tierLevel: 5,
    requiredDays: 14,
    title: 'Fortnight Fortitude',
    description: 'Two unbroken weeks of mental resilience and discipline.',
    iconName: 'Trophy',
    rarity: 'Rare',
    category: 'Consistency'
  },
  {
    id: 'badge-21',
    tierLevel: 6,
    requiredDays: 21,
    title: 'Synaptic Mastery',
    description: '21 days! Behavioral psychology confirms the habit is wired.',
    iconName: 'Brain',
    rarity: 'Epic',
    category: 'Endurance'
  },
  {
    id: 'badge-30',
    tierLevel: 7,
    requiredDays: 30,
    title: 'Monthly Titan',
    description: 'Completed 30 uninterrupted days of continuous learning.',
    iconName: 'Crown',
    rarity: 'Epic',
    category: 'Endurance'
  },
  {
    id: 'badge-50',
    tierLevel: 8,
    requiredDays: 50,
    title: 'Half-Century Legend',
    description: 'Surpassed 50 days of relentless academic growth.',
    iconName: 'Star',
    rarity: 'Legendary',
    category: 'Ascent'
  },
  {
    id: 'badge-100',
    tierLevel: 9,
    requiredDays: 100,
    title: 'Centurion of Knowledge',
    description: 'The ultimate pinnacle: 100 consecutive days of mastery.',
    iconName: 'Medal',
    rarity: 'Legendary',
    category: 'Ascent'
  }
];
