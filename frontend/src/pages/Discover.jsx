import React from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { movieApi } from '../services/api';
import MovieCard from '../components/MovieCard';
import { SlidersHorizontal, Loader2, ArrowLeft, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Discover = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const genre = searchParams.get('genre');
  const year = searchParams.get('year');
  const language = searchParams.get('language');
  const langName = searchParams.get('langName');
  const cast = searchParams.get('cast');
  const actorName = searchParams.get('actorName');
  const crew = searchParams.get('crew');
  const directorName = searchParams.get('directorName');
  const page = parseInt(searchParams.get('page')) || 1;

  const { data: results, isLoading, isError } = useQuery({
    queryKey: ['discover', genre, year, language, cast, crew, page],
    queryFn: () => movieApi.discover({ genre, year, language, cast, crew, page }),
    keepPreviousData: true
  });

  const { data: genres } = useQuery({
    queryKey: ['genres'],
    queryFn: movieApi.getGenres,
  });

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > (results?.total_pages || 1)) return;
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage);
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getGenreName = (id) => {
    return genres?.genres?.find(g => g.id.toString() === id)?.name || id;
  };

  const renderPageNumbers = () => {
    const totalPages = results?.total_pages || 1;
    const pages = [];
    const maxVisible = 5;
    
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
            page === i 
              ? 'bg-primary text-black' 
              : 'bg-surface/50 text-muted hover:text-white border border-white/10'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-24">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-muted hover:text-primary transition-colors mb-8 group"
      >
        <div className="p-2 rounded-full bg-surface/50 border border-white/10 group-hover:border-primary/50">
          <ArrowLeft className="w-4 h-4" />
        </div>
        <span className="text-xs font-black uppercase tracking-widest">Back to Home</span>
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 border-b border-white/10 pb-8">
        <div>
          <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
            <SlidersHorizontal className="text-primary" /> DISCOVER
          </h1>
          <div className="flex flex-wrap gap-2">
            {genre && (
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                GENRE: {getGenreName(genre)}
              </span>
            )}
            {year && (
              <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                YEAR: {year}
              </span>
            )}
            {langName && (
              <span className="bg-white/10 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                LANG: {langName.toUpperCase()}
              </span>
            )}
            {actorName && (
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/30">
                ACTOR: {actorName.toUpperCase()}
              </span>
            )}
            {directorName && (
              <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-secondary/30">
                DIRECTOR: {directorName.toUpperCase()}
              </span>
            )}
            {!genre && !year && !language && !cast && !crew && (
              <span className="text-muted text-sm italic">Showing popular movies with current filters</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-muted font-bold text-sm">
            {results?.total_results?.toLocaleString()} MOVIES FOUND
          </p>
          <p className="text-[10px] text-primary font-black uppercase tracking-widest">
            Page {page} of {results?.total_pages || 1}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted font-bold tracking-widest uppercase text-xs">Exploring CineVerse...</p>
        </div>
      ) : isError ? (
        <div className="text-center py-24">
          <p className="text-red-500 font-bold">Failed to discover movies. Please try again.</p>
        </div>
      ) : results?.results?.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-16">
            {results.results.map((movie, idx) => (
              <MovieCard key={`${movie.id}-${idx}`} movie={movie} />
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col items-center gap-6 py-12 border-t border-white/10">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={page === 1}
                className="p-2.5 rounded-xl bg-surface/50 border border-white/10 text-muted hover:text-white disabled:opacity-30 transition-all"
                title="First Page"
              >
                <ChevronsLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="p-2.5 rounded-xl bg-surface/50 border border-white/10 text-muted hover:text-white disabled:opacity-30 transition-all"
                title="Previous Page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mx-2">
                {renderPageNumbers()}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= results.total_pages}
                className="p-2.5 rounded-xl bg-surface/50 border border-white/10 text-muted hover:text-white disabled:opacity-30 transition-all"
                title="Next Page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => handlePageChange(results.total_pages)}
                disabled={page >= results.total_pages}
                className="p-2.5 rounded-xl bg-surface/50 border border-white/10 text-muted hover:text-white disabled:opacity-30 transition-all"
                title="Last Page"
              >
                <ChevronsRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted">
              <span>Showing results {(page-1)*120 + 1} - {Math.min(page*120, results.total_results)}</span>
              <span className="w-1 h-1 rounded-full bg-white/20"></span>
              <span>Total {results.total_results.toLocaleString()}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-24 bg-surface/30 rounded-3xl border-2 border-dashed border-white/5">
          <p className="text-muted italic text-lg mb-2">No movies found matching these criteria.</p>
          <p className="text-muted text-sm">Try broadening your filters!</p>
        </div>
      )}
    </div>
  );
};

export default Discover;
