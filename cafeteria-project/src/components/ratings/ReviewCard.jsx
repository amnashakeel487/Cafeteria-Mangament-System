import { useState } from 'react';
import StarDisplay from './StarDisplay';
import { timeAgo } from '../../utils/ratingsApi';

function initials(name) {
  if (!name) return 'S';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

export default function ReviewCard({ review, showReply = true, onReply }) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReply = async () => {
    if (!onReply || !replyText.trim()) return;
    setSubmitting(true);
    try {
      await onReply(review.id, replyText.trim());
      setReplyOpen(false);
      setReplyText('');
    } finally {
      setSubmitting(false);
    }
  };

  const name = review.student_display_name || review.student_name || 'Student';

  return (
    <article className="rounded-xl border border-[#594139]/20 bg-[#1E1E2F] p-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-[#FF6B35]/20 text-[#FFB59D] flex items-center justify-center text-sm font-bold shrink-0">
          {initials(name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <span className="font-semibold text-[#E3E0F8] text-sm">{name}</span>
            <span className="text-xs text-[#9ca3af]">{timeAgo(review.created_at)}</span>
          </div>
          <StarDisplay rating={review.rating} size="sm" />
          {review.review_text && (
            <p className="text-sm text-[#e1bfb5] mt-2 leading-relaxed">{review.review_text}</p>
          )}
        </div>
      </div>

      {showReply && review.cafeteria_reply && (
        <div className="mt-3 ml-12 pl-4 py-3 rounded-lg bg-[#121222]/80 border-l-2 border-[#FF6B35]/50">
          <p className="text-xs font-bold text-[#FFB59D] mb-1">Cafeteria reply</p>
          <p className="text-sm text-[#E3E0F8]">{review.cafeteria_reply}</p>
        </div>
      )}

      {showReply && onReply && !review.cafeteria_reply && (
        <div className="mt-3 ml-12">
          {!replyOpen ? (
            <button
              type="button"
              onClick={() => setReplyOpen(true)}
              className="text-xs font-bold text-[#59d5fb] hover:underline"
            >
              Reply
            </button>
          ) : (
            <div className="space-y-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={3}
                placeholder="Write a reply..."
                className="w-full rounded-lg bg-[#121222] border border-[#594139]/30 text-sm text-[#E3E0F8] p-3 resize-none focus:outline-none focus:border-[#FF6B35]/50"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={submitting || !replyText.trim()}
                  onClick={handleSubmitReply}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#FFB59D] text-[#5d1900] disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Submit reply'}
                </button>
                <button
                  type="button"
                  onClick={() => setReplyOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#e1bfb5]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
