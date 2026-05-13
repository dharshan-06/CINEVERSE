import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const MovieCard = ({ movie }) => {
  const imageUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Poster';

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="relative group cursor-pointer"
    >
      <Link to={`/movie/${movie.id}`}>
        <div className="aspect-[2/3] rounded-lg overflow-hidden border border-white/10 group-hover:border-primary/50 transition-colors">
          <img 
            src={imageUrl} 
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <h3 className="text-sm font-bold line-clamp-2">{movie.title}</h3>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] text-muted">{movie.release_date?.split('-')[0]}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default MovieCard;
