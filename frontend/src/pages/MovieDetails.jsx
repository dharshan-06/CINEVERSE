import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { movieApi } from '../services/api';
import { Star, Clock, Calendar, Users, Heart, Bookmark, Share2, AlertTriangle, Film } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { reviewApi, userApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import domtoimage from 'dom-to-image-more';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const movieId = parseInt(id);

  // References for the shareable poster
  const posterRef = React.useRef(null);

  const { data: movie, isLoading: movieLoading, isError: movieError } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => movieApi.getDetails(id),
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => reviewApi.getMovieReviews(id),
  });

  const averageRating = reviews?.length > 0 
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
    : 'N/A';

  const userId = user?._id || user?.id;

  // Auth/Profile data
  const { data: profile } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => userApi.getProfile(userId),
    enabled: !!userId,
  });

  const isFavorite = profile?.favoriteMovies?.includes(movieId);
  const isInWatchlist = profile?.watchlist?.includes(movieId);

  // Mutations
  const favoriteMutation = useMutation({
    mutationFn: () => isFavorite ? userApi.removeFromFavorites(movieId) : userApi.addToFavorites(movieId),
    onSuccess: () => {
      queryClient.invalidateQueries(['profile', userId]);
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites (Max 4, FIFO)');
    }
  });

  const watchlistMutation = useMutation({
    mutationFn: () => isInWatchlist ? userApi.removeFromWatchlist(movieId) : userApi.addToWatchlist(movieId),
    onSuccess: () => {
      queryClient.invalidateQueries(['profile', userId]);
      toast.success(isInWatchlist ? 'Removed from watchlist' : 'Added to watchlist');
    }
  });

  const [shareData, setShareData] = React.useState({ poster: null, avatar: null });

  const getBase64Image = (url) => {
    if (!url) return Promise.resolve(null);
    return new Promise((resolve) => {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch (e) {
          console.error('Canvas conversion failed:', e);
          resolve(url);
        }
      };
      img.onerror = () => {
        console.warn('Image load failed for Base64, falling back to URL:', url);
        resolve(url);
      };
      img.src = url;
    });
  };

  const handleShare = async () => {
    if (!user) {
      toast.error('Please login to share your rating');
      return;
    }
    const userReview = reviews?.find(r => (r.user?._id || r.user) === userId);
    if (!userReview) {
      toast.error('Rate the movie first to share your rating!');
      return;
    }

    toast.loading('Generating shareable poster...', { id: 'share' });
    try {
      // Attempt Base64 conversion but don't let it crash the whole flow
      const posterUrl = `https://image.tmdb.org/t/p/w500${movie?.poster_path}`;
      const [posterBase64, avatarBase64] = await Promise.all([
        getBase64Image(posterUrl),
        getBase64Image(user?.avatar)
      ]);

      setShareData({ 
        poster: posterBase64 || posterUrl, 
        avatar: avatarBase64 || user?.avatar 
      });

      // Allow DOM to update
      setTimeout(async () => {
        try {
          const dataUrl = await domtoimage.toPng(posterRef.current, {
            quality: 1,
            bgcolor: '#0a0a0a',
          });
          
          const link = document.createElement('a');
          link.download = `${movie.title.replace(/\s+/g, '_')}_CineVerse.png`;
          link.href = dataUrl;
          link.click();
          toast.success('Poster downloaded!', { id: 'share' });
        } catch (innerErr) {
          console.error('Final capture error:', innerErr);
          toast.error('Failed to capture final image.', { id: 'share' });
        }
      }, 600);
    } catch (err) {
      console.error('Share process error:', err);
      toast.error('Failed to prepare sharing materials.', { id: 'share' });
    }
  };

  if (movieLoading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (movieError) return <div className="h-screen flex items-center justify-center text-red-500 font-bold">Failed to load movie details. Please try again later.</div>;

  return (
    <div className="pb-20">
      {/* Backdrop Section */}
      <div className="relative h-[60vh] w-full">
        <img 
          src={`https://image.tmdb.org/t/p/original${movie?.backdrop_path}`} 
          alt={movie?.title}
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-[-200px] relative z-10">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Poster and Actions */}
          <div className="w-full md:w-1/3 lg:w-1/4 shrink-0">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl overflow-hidden border-2 border-white/10 shadow-2xl mb-6"
            >
              <img 
                src={`https://image.tmdb.org/t/p/w500${movie?.poster_path}`} 
                alt={movie?.title}
                className="w-full h-auto"
              />
            </motion.div>
            
            <div className="bg-surface p-4 rounded-xl border border-white/10 space-y-4">
              <div className="flex items-center justify-around">
                <button 
                  onClick={() => {
                    if (!user) return toast.error('Please login');
                    favoriteMutation.mutate();
                  }}
                  disabled={favoriteMutation.isPending}
                  className={`flex flex-col items-center gap-1 transition-all ${isFavorite ? 'text-primary scale-110' : 'text-muted hover:text-primary'}`}
                >
                  <Heart className={`w-6 h-6 ${isFavorite ? 'fill-primary stroke-primary' : ''}`} />
                  <span className="text-[10px] font-bold">FAVORITE</span>
                </button>
                <button 
                  onClick={() => {
                    if (!user) return toast.error('Please login');
                    watchlistMutation.mutate();
                  }}
                  disabled={watchlistMutation.isPending}
                  className={`flex flex-col items-center gap-1 transition-all ${isInWatchlist ? 'text-secondary scale-110' : 'text-muted hover:text-secondary'}`}
                >
                  <Bookmark className={`w-6 h-6 ${isInWatchlist ? 'fill-secondary stroke-secondary' : ''}`} />
                  <span className="text-[10px] font-bold">WATCHLIST</span>
                </button>
                <button 
                  onClick={handleShare}
                  className="flex flex-col items-center gap-1 text-muted hover:text-white transition-colors"
                >
                  <Share2 className="w-6 h-6" />
                  <span className="text-[10px] font-bold">SHARE</span>
                </button>
              </div>
              <button 
                onClick={() => {
                  if (!user) {
                    toast.error('Please login to rate this movie');
                    navigate('/login', { state: { from: `/review/${id}`, movie } });
                    return;
                  }
                  navigate(`/review/${id}`, { state: { movie } });
                }}
                className="w-full bg-primary text-black py-3 rounded-lg font-black hover:bg-primary/90 transition-all"
              >
                RATE THIS MOVIE
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-8">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl md:text-6xl font-black">{movie?.title}</h1>
                <span className="text-2xl text-muted font-light">{movie?.release_date?.split('-')[0]}</span>
              </div>
              <p className="text-muted text-sm font-bold tracking-widest uppercase mb-6">
                Directed by <span className="text-white">{movie?.credits?.crew?.find(p => p.job === 'Director')?.name}</span>
              </p>
              
              <div className="flex flex-wrap gap-6 text-sm font-semibold text-muted">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <div key={star} className="relative">
                        <Star className="w-5 h-5 text-white/10" />
                        <div 
                          className="absolute inset-0 overflow-hidden text-primary"
                          style={{ width: averageRating >= star ? '100%' : (averageRating >= star - 0.5 ? '50%' : '0%') }}
                        >
                          <Star className="w-5 h-5 fill-primary" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <span className="text-white text-lg font-black ml-2">{averageRating}</span>
                  <span className="text-xs text-muted">({reviews?.length || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{movie?.runtime} mins</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{movie?.release_date}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black tracking-widest text-muted uppercase">OVERVIEW</h3>
              <p className="text-lg leading-relaxed text-white/90">{movie?.overview}</p>
            </div>

            {/* Cast */}
            <div className="space-y-4">
              <h3 className="text-xs font-black tracking-widest text-muted uppercase flex items-center gap-2">
                <Users className="w-4 h-4" /> CAST
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {movie?.credits?.cast?.slice(0, 10).map(person => (
                  <div key={person.id} className="shrink-0 w-24 text-center space-y-2">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10">
                      <img 
                        src={`https://image.tmdb.org/t/p/w185${person.profile_path}`} 
                        alt={person.name}
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.src = 'https://via.placeholder.com/185x185?text=No+Image'}
                      />
                    </div>
                    <p className="text-[10px] font-bold leading-tight">{person.name}</p>
                    <p className="text-[9px] text-muted leading-tight">{person.character}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-20 space-y-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-2xl font-black italic">REVIEWS</h3>
            <span className="text-muted font-bold text-sm">{reviews?.length || 0} REVIEWS</span>
          </div>

          {reviewsLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-32 bg-surface rounded-xl" />)}
            </div>
          ) : reviews?.length > 0 ? (
            <div className="grid gap-6">
              {reviews.map((review) => (
                <div key={review._id} className="bg-surface/50 border border-white/10 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={review.user?.avatar || 'https://via.placeholder.com/40'} 
                        alt={review.user?.username}
                        className="w-10 h-10 rounded-full border border-white/20"
                      />
                      <div>
                        <p className="font-bold text-sm uppercase tracking-wider">{review.user?.username}</p>
                        <p className="text-[10px] text-muted">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <div key={star} className="relative">
                            <Star className="w-3 h-3 text-primary/20" />
                            <div 
                              className="absolute inset-0 overflow-hidden text-primary"
                              style={{ width: review.rating >= star ? '100%' : (review.rating === star - 0.5 ? '50%' : '0%') }}
                            >
                              <Star className="w-3 h-3 fill-primary" />
                            </div>
                          </div>
                        ))}
                      </div>
                      <span className="text-sm font-black ml-1">{review.rating}</span>
                    </div>
                  </div>
                  
                  <div className="relative">
                    {review.spoilerTag ? (
                      <div className="group cursor-pointer">
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity rounded-lg z-10">
                          <p className="text-secondary font-black text-xs tracking-widest flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> SPOILERS
                          </p>
                        </div>
                        <p className="text-white/80 leading-relaxed italic">{review.reviewText}</p>
                      </div>
                    ) : (
                      <p className="text-white/80 leading-relaxed">{review.reviewText}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-surface/30 rounded-xl border border-dashed border-white/10">
              <p className="text-muted italic">No reviews yet. Be the first to rate this movie!</p>
            </div>
          )}
        </div>

        {/* Hidden Poster for Sharing - Refined minimal design */}
        <div style={{ position: 'fixed', left: '-1000vw', top: '0', opacity: '1', zIndex: -1000 }}>
          <div 
            ref={posterRef}
            style={{ 
              width: '450px', 
              backgroundColor: '#000', 
              padding: '48px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '24px',
              border: 'none',
              outline: 'none'
            }}
          >
            {/* User Profile Photo */}
            <div style={{ position: 'relative', zIndex: 20, marginBottom: '-40px', border: 'none' }}>
              <img 
                src={shareData.avatar || user?.avatar} 
                alt="" 
                style={{ 
                  width: '96px', 
                  height: '96px', 
                  borderRadius: '9999px', 
                  border: '4px solid #000', 
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>
            
            {/* Movie Poster */}
            <div style={{ 
              width: '100%', 
              aspectRatio: '2/3', 
              borderRadius: '8px', 
              overflow: 'hidden', 
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'block'
            }}>
              <img 
                src={shareData.poster || `https://image.tmdb.org/t/p/w500${movie?.poster_path}`} 
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>

            {/* Movie Info */}
            <div style={{ textAlign: 'center', width: '100%', border: 'none', marginTop: '20px' }}>
              {/* Rating Stars */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', border: 'none' }}>
                {[1, 2, 3, 4, 5].map(star => {
                  const userRating = reviews?.find(r => (r.user?._id || r.user) === userId)?.rating || 0;
                  return (
                    <div key={star} style={{ position: 'relative', border: 'none', width: '32px', height: '32px' }}>
                      <Star style={{ width: '32px', height: '32px', color: 'rgba(255,255,255,0.1)', border: 'none' }} />
                      <div 
                        style={{ 
                          position: 'absolute', 
                          inset: 0, 
                          overflow: 'hidden', 
                          width: userRating >= star ? '100%' : (userRating === star - 0.5 ? '50%' : '0%'),
                          border: 'none'
                        }}
                      >
                        <Star style={{ width: '32px', height: '32px', fill: '#00e054', color: '#00e054', border: 'none' }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Branding */}
              <p style={{ 
                fontSize: '10px', 
                fontWeight: '900', 
                letterSpacing: '0.3em', 
                color: 'rgba(255,255,255,0.3)', 
                textTransform: 'uppercase', 
                marginTop: '40px', 
                paddingTop: '16px', 
                borderTop: '1px solid rgba(255,255,255,0.05)',
                borderBottom: 'none',
                borderLeft: 'none',
                borderRight: 'none'
              }}>
                POWERED BY CINEVERSE
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
