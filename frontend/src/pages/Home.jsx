import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { movieApi } from '../services/api';
import MovieCard from '../components/MovieCard';
import { Play, Info, TrendingUp, Calendar, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [showTrailer, setShowTrailer] = useState(false);

  const { data: trending, isLoading: trendingLoading, isError: trendingError } = useQuery({
    queryKey: ['trending'],
    queryFn: movieApi.getTrending,
  });

  const heroMovie = trending?.results[0];

  const { data: heroDetails } = useQuery({
    queryKey: ['movie', heroMovie?.id],
    queryFn: () => movieApi.getDetails(heroMovie?.id),
    enabled: !!heroMovie?.id,
  });

  const trailer = heroDetails?.videos?.results?.find(
    (v) => v.type === 'Trailer' && v.site === 'YouTube'
  );

  if (trendingLoading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (trendingError) return <div className="h-screen flex items-center justify-center text-red-500 font-bold">Failed to load movies. Please try again later.</div>;

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={`https://image.tmdb.org/t/p/original${heroMovie?.backdrop_path}`} 
            alt={heroMovie?.title}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-8 flex flex-col justify-center gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold tracking-widest mb-4 inline-block">
              TRENDING TODAY
            </span>
            <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight">
              {heroMovie?.title}
            </h1>
            <p className="max-w-2xl text-muted text-lg mb-8 line-clamp-3">
              {heroMovie?.overview}
            </p>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  if (trailer) setShowTrailer(true);
                  else window.open(`https://www.youtube.com/results?search_query=${heroMovie?.title}+trailer`, '_blank');
                }}
                className="bg-white text-black px-8 py-3 rounded-md font-bold flex items-center gap-2 hover:bg-white/90 transition-all transform hover:scale-105"
              >
                <Play className="fill-black" /> Watch Trailer
              </button>
              <button 
                onClick={() => navigate(`/movie/${heroMovie?.id}`)}
                className="bg-white/10 glass px-8 py-3 rounded-md font-bold flex items-center gap-2 hover:bg-white/20 transition-all"
              >
                <Info /> More Info
              </button>
            </div>
          </motion.div>
        </div>

        {/* Trailer Modal Overlay */}
        <AnimatePresence>
          {showTrailer && trailer && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-black/95 backdrop-blur-md"
            >
              <button 
                onClick={() => setShowTrailer(false)}
                className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-10 h-10" />
              </button>
              <div className="w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <iframe 
                  src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Movie Sections */}
      <div className="max-w-7xl mx-auto px-8 mt-[-100px] relative z-10 space-y-16">
        {/* Trending Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <TrendingUp className="text-primary" /> TRENDING NOW
            </h2>
            <button className="text-muted text-sm font-bold hover:text-primary transition-colors">VIEW ALL</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {trending?.results?.slice(0, 12).map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>

        {/* Categories (Placeholder sections) */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <Calendar className="text-secondary" /> UPCOMING RELEASES
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {trending?.results?.slice(12, 18).map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
