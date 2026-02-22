import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, ThumbsUp, Flag, Send, Loader2 } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';

interface Comment {
  id: string;
  body: string;
  likes_count: number;
  created_at: string;
  users?: { display_name: string | null; trust_points: number };
  replies?: Comment[];
}

interface CommentSectionProps {
  priceId: string;
}

export default function CommentSection({ priceId }: CommentSectionProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [priceId]);

  async function fetchComments() {
    try {
      const { data } = await api.get(`/prices/${priceId}/comments`);
      setComments(data.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      await api.post(`/prices/${priceId}/comments`, {
        body: newComment.trim(),
        parent_id: replyTo || undefined,
      });
      setNewComment('');
      setReplyTo(null);
      fetchComments();
    } catch {
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLike(commentId: string) {
    try {
      await api.post(`/prices/comments/${commentId}/like`);
      fetchComments();
    } catch {}
  }

  async function handleReport(commentId: string) {
    try {
      await api.post(`/prices/comments/${commentId}/report`, { reason: 'inappropriate' });
    } catch {}
  }

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  }

  if (loading) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-700">
          {t('comments.title', 'Comments')} ({comments.length})
        </h3>
      </div>

      {comments.map((comment) => (
        <div key={comment.id} className="space-y-2">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {comment.users?.display_name || t('common.anonymous', 'Anonymous')}
              </span>
              <span className="text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{comment.body}</p>
            <div className="flex items-center gap-3 mt-2">
              <button onClick={() => handleLike(comment.id)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-500">
                <ThumbsUp className="w-3 h-3" /> {comment.likes_count || 0}
              </button>
              {user && (
                <button onClick={() => setReplyTo(comment.id)} className="text-xs text-gray-400 hover:text-primary-500">
                  {t('comments.reply', 'Reply')}
                </button>
              )}
              <button onClick={() => handleReport(comment.id)} className="text-xs text-gray-400 hover:text-red-500">
                <Flag className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Replies */}
          {comment.replies?.map((reply) => (
            <div key={reply.id} className="ms-6 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {reply.users?.display_name || t('common.anonymous', 'Anonymous')}
                </span>
                <span className="text-xs text-gray-400">{timeAgo(reply.created_at)}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{reply.body}</p>
            </div>
          ))}
        </div>
      ))}

      {/* Comment input */}
      {user && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={replyTo
              ? t('comments.reply_placeholder', 'Write a reply...')
              : t('comments.placeholder', 'Add a comment...')}
            className="input flex-1 text-sm py-2"
            maxLength={500}
            minLength={3}
          />
          <button
            type="submit"
            disabled={submitting || newComment.trim().length < 3}
            className="btn-primary px-3 py-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
          {replyTo && (
            <button type="button" onClick={() => setReplyTo(null)} className="btn-ghost px-2 text-xs">
              {t('common.cancel')}
            </button>
          )}
        </form>
      )}
    </div>
  );
}
