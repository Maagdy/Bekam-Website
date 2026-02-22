import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return `${price.toFixed(2)} EGP`;
}

export function formatDate(date: string, lang: string = 'ar'): string {
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function timeAgo(date: string, lang: string = 'ar'): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (lang === 'ar') {
    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    return formatDate(date, lang);
  }

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date, lang);
}

const TRUST_LEVELS = [
  { min: 0, name_en: 'Newcomer', name_ar: 'مبتدئ', emoji: '🌱' },
  { min: 50, name_en: 'Contributor', name_ar: 'مساهم', emoji: '⭐' },
  { min: 150, name_en: 'Trusted', name_ar: 'موثوق', emoji: '🏅' },
  { min: 500, name_en: 'Expert', name_ar: 'خبير', emoji: '🏆' },
  { min: 1000, name_en: 'Champion', name_ar: 'بطل', emoji: '👑' },
];

export function getTrustLevel(points: number) {
  let level = TRUST_LEVELS[0];
  for (const l of TRUST_LEVELS) {
    if (points >= l.min) level = l;
  }
  return level;
}
