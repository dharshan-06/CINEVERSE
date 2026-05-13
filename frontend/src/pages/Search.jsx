import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { movieApi } from '../services/api';
import MovieCard from '../components/MovieCard';
import { Search as SearchIcon } from 'lucide-react';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');

  const { data: results, isLoading, isError } = useQuery({
    queryKey: ['search', query],
    queryFn: () => movieApi.search(query),
    enabled: !!query,
  });

  if (isError) return <div className="max-w-7xl mx-auto px-8 py-20 text-center text-red-500 font-bold">Failed to search movies. Please try again later.</div>;

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <div className="mb-12">
        <h1 className="text-sm font-bold text-muted uppercase tracking-[0.2em] mb-4">SEARCH RESULTS FOR</h1>
        <div className="flex items-center gap-4">
          <SearchIcon className="w-10 h-10 text-primary" />
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">"{query}"</h2>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-surface rounded-lg animate-pulse" />
          ))}
        </div>
      ) : results?.results?.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {results.results
            .filter(item => item.media_type === 'movie' || !item.media_type)
            .map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-muted text-xl">No movies found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default Search;
