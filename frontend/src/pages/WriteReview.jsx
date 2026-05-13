import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from '../services/api';
import { Star, MessageSquare, AlertTriangle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const WriteReview = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  // Get movie details passed via state (optional, for title/poster)
  const movie = location.state?.movie;

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [spoilerTag, setSpoilerTag] = useState(false);

  const mutation = useMutation({
    mutationFn: reviewApi.create,
    onSuccess: () => {
      toast.success('Review submitted successfully!');
      queryClient.invalidateQueries(['reviews', movieId]);
      navigate(`/movie/${movieId}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (reviewText.trim().length < 10) {
      toast.error('Review text must be at least 10 characters');
      return;
    }

    mutation.mutate({
      movieId: parseInt(movieId),
      movieTitle: movie?.title || 'Unknown Title',
      moviePoster: movie?.poster_path,
      rating,
      reviewText,
      spoilerTag,
    });
  };

  const handleStarClick = (star) => {
    if (rating === star) {
      setRating(star - 0.5);
    } else if (rating === star - 0.5) {
      setRating(0);
    } else {
      setRating(star);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> BACK
      </button>

      <div className="bg-surface rounded-2xl border border-white/10 p-8 shadow-2xl">
        <h1 className="text-3xl font-black mb-2 italic">RATE & REVIEW</h1>
        <p className="text-muted mb-8">{movie?.title}</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Rating Stars */}
          <div className="space-y-4">
            <label className="text-xs font-black tracking-widest text-muted uppercase">Your Rating: <span className="text-primary">{rating}</span></label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="relative transition-transform active:scale-90"
                  onClick={() => handleStarClick(star)}
                >
                  {/* Background Empty Star */}
                  <Star className="w-10 h-10 text-white/10" />
                  
                  {/* Filled Star with clip path for half stars */}
                  <div 
                    className="absolute inset-0 overflow-hidden text-primary"
                    style={{ 
                      width: rating >= star ? '100%' : (rating === star - 0.5 ? '50%' : '0%'),
                      transition: 'width 0.2s ease-in-out'
                    }}
                  >
                    <Star className="w-10 h-10 fill-primary" />
                  </div>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted italic">Tip: Click the same star again to give a half-star.</p>
          </div>

          {/* Review Text */}
          <div className="space-y-4">
            <label className="text-xs font-black tracking-widest text-muted uppercase flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Your Review
            </label>
            <textarea
              className="w-full bg-background border border-white/10 rounded-xl p-4 min-h-[200px] focus:outline-none focus:border-primary/50 transition-colors"
              placeholder="What did you think of this movie?"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
          </div>

          {/* Options */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="spoiler"
              className="w-4 h-4 rounded border-white/10 bg-background text-primary focus:ring-primary/50"
              checked={spoilerTag}
              onChange={(e) => setSpoilerTag(e.target.checked)}
            />
            <label htmlFor="spoiler" className="text-sm font-semibold text-muted flex items-center gap-2 cursor-pointer">
              <AlertTriangle className="w-4 h-4 text-secondary" /> Contains Spoilers
            </label>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-primary text-black py-4 rounded-xl font-black text-lg hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {mutation.isPending ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WriteReview;
