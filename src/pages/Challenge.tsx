import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy, Loader2, Medal, Share2 } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import SEOHead from '../components/SEOHead';

interface ChallengeData {
  id: string;
  title_ar: string | null;
  title_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  target_amount: number;
  start_date: string;
  end_date: string;
}

interface LeaderboardEntry {
  id: string;
  total_spent: number;
  items_count: number;
  users?: { display_name: string | null; trust_points: number };
}

export default function Challenge() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { user } = useAuth();

  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState('');
  const [itemsCount, setItemsCount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchChallenge();
  }, []);

  async function fetchChallenge() {
    try {
      const { data } = await api.get('/challenges/active');
      if (data.data) {
        setChallenge(data.data);
        fetchLeaderboard(data.data.id);
      }
    } catch {} finally { setLoading(false); }
  }

  async function fetchLeaderboard(challengeId: string) {
    try {
      const { data } = await api.get(`/challenges/${challengeId}/leaderboard`);
      setLeaderboard(data.data || []);
    } catch {}
  }

  async function handleSubmit() {
    if (!challenge || !totalSpent || !itemsCount) return;
    setSubmitting(true);
    try {
      await api.post(`/challenges/${challenge.id}/enter`, {
        total_spent: Number(totalSpent),
        items_count: Number(itemsCount),
      });
      setSubmitted(true);
      fetchLeaderboard(challenge.id);
    } catch {} finally { setSubmitting(false); }
  }

  function handleShare() {
    if (!challenge) return;
    const text = isAr
      ? `شاركت في تحدي بكام: ${challenge.title_ar || challenge.title_en}`
      : `I joined the Bekam Challenge: ${challenge.title_en || challenge.title_ar}`;

    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }

  const MEDALS = ['🥇', '🥈', '🥉'];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <Trophy className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          {t('challenge.title', 'Weekly Challenge')}
        </h1>
        <p className="text-gray-500">
          {t('challenge.no_active', 'No active challenge right now. Check back soon!')}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <SEOHead title={t('challenge.title', 'Weekly Challenge')} description="بكام Weekly Savings Challenge" />
      {/* Challenge Header */}
      <div className="card text-center" style={{ background: 'var(--theme-gradient)' }}>
        <Trophy className="w-12 h-12 text-white mx-auto mb-3" />
        <h1 className="text-xl font-bold text-white mb-1">
          {isAr ? challenge.title_ar : challenge.title_en}
        </h1>
        <p className="text-white/80 text-sm mb-3">
          {isAr ? challenge.description_ar : challenge.description_en}
        </p>
        <div className="bg-white/20 rounded-xl px-4 py-2 inline-block">
          <p className="text-white text-sm">
            {t('challenge.target', 'Target')}: <span className="font-bold text-lg">{challenge.target_amount} {t('price.egp')}</span>
          </p>
        </div>
        <p className="text-white/60 text-xs mt-2">
          {challenge.start_date} → {challenge.end_date}
        </p>
      </div>

      {/* Entry Form */}
      {user && !submitted && (
        <div className="card space-y-3">
          <h2 className="font-semibold">{t('challenge.enter', 'Submit Your Entry')}</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{t('challenge.total_spent', 'Total Spent')}</label>
              <input
                type="number"
                value={totalSpent}
                onChange={(e) => setTotalSpent(e.target.value)}
                className="input text-center"
                dir="ltr"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{t('challenge.items_count', 'Items')}</label>
              <input
                type="number"
                value={itemsCount}
                onChange={(e) => setItemsCount(e.target.value)}
                className="input text-center"
                dir="ltr"
                placeholder="0"
              />
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting || !totalSpent || !itemsCount}
            className="btn-primary w-full"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('challenge.submit', 'Submit Entry')}
          </button>
        </div>
      )}

      {submitted && (
        <div className="card text-center bg-success-50 border border-success-200">
          <Medal className="w-8 h-8 text-success-500 mx-auto mb-2" />
          <p className="font-semibold text-success-700">{t('challenge.submitted', 'Entry submitted!')}</p>
          <button onClick={handleShare} className="mt-3 text-sm text-primary-500 flex items-center gap-1 mx-auto">
            <Share2 className="w-4 h-4" /> {t('challenge.share', 'Share')}
          </button>
        </div>
      )}

      {/* Leaderboard */}
      <div className="card">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Medal className="w-5 h-5 text-warning-500" />
          {t('challenge.leaderboard', 'Leaderboard')}
        </h2>
        {leaderboard.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">{t('challenge.no_entries', 'No entries yet')}</p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, i) => (
              <div key={entry.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg w-6 text-center">{MEDALS[i] || `${i + 1}`}</span>
                  <span className="text-sm font-medium text-gray-700">
                    {entry.users?.display_name || t('common.anonymous', 'Anonymous')}
                  </span>
                </div>
                <div className="text-end">
                  <span className="font-bold text-primary-600">{Number(entry.total_spent).toFixed(2)} {t('price.egp')}</span>
                  <span className="text-xs text-gray-400 ms-1">({entry.items_count} items)</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
