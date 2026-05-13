import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, LogOut, Menu, X, Film, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { movieApi } from '../services/api';
import SearchableFilter from './SearchableFilter';

const Navbar = () => {
  const { user, logout, updateUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [filters, setFilters] = useState({ 
    genre: null, 
    year: '', 
    language: null,
    actor: null,
    director: null 
  });
  
  const navigate = useNavigate();

  const { data: genresData } = useQuery({ 
    queryKey: ['genres'], 
    queryFn: movieApi.getGenres,
    staleTime: Infinity 
  });
  
  const { data: languagesData } = useQuery({ 
    queryKey: ['languages'], 
    queryFn: movieApi.getLanguages,
    staleTime: Infinity 
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
      setSearchQuery('');
    }
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (filters.genre?.id) params.append('genre', filters.genre.id);
    if (filters.year && filters.year.trim() !== '') params.append('year', filters.year.trim());
    if (filters.language?.iso_639_1) {
      params.append('language', filters.language.iso_639_1);
      params.append('langName', filters.language.english_name);
    }
    if (filters.actor?.id) {
      params.append('cast', filters.actor.id);
      params.append('actorName', filters.actor.name);
    }
    if (filters.director?.id) {
      params.append('crew', filters.director.id);
      params.append('directorName', filters.director.name);
    }
    
    navigate(`/discover?${params.toString()}`);
    setIsFilterOpen(false);
  };

  const searchGenres = async (q) => {
    if (!genresData?.genres) {
      // Re-fetch if missing
      const data = await movieApi.getGenres();
      return data.genres.filter(g => g.name.toLowerCase().includes(q.toLowerCase()));
    }
    return genresData.genres.filter(g => g.name.toLowerCase().includes(q.toLowerCase()));
  };

  const searchLanguages = async (q) => {
    let langs = languagesData;
    if (!langs) {
      langs = await movieApi.getLanguages();
    }
    return langs
      .filter(l => l.english_name.toLowerCase().includes(q.toLowerCase()))
      .map(l => ({ ...l, name: l.english_name }));
  };

  const searchPeople = async (q) => {
    const data = await movieApi.searchPerson(q);
    return data.results.slice(0, 5);
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-white/10 px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-primary font-black text-2xl tracking-tighter">
          <Film className="w-8 h-8 fill-primary" />
          <span className="hidden sm:inline text-xl">CINEVERSE</span>
        </Link>

        {/* Search & Filter Container */}
        <div className="flex-1 max-w-2xl flex items-center gap-2">
          <form onSubmit={handleSearch} className="flex-1 relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search movies, actors..."
              className="w-full bg-surface/50 border border-white/10 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-2 rounded-full border transition-all ${isFilterOpen ? 'bg-primary text-black border-primary' : 'bg-surface/50 border-white/10 text-muted hover:text-white'}`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>

            {/* Filter Dropdown */}
            {isFilterOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-surface border border-white/10 rounded-2xl p-6 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
                <h3 className="font-black text-sm mb-6 tracking-widest uppercase text-primary">Advanced Filters</h3>
                
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                  <SearchableFilter 
                    label="Genre"
                    placeholder="Search genre..."
                    onSearch={searchGenres}
                    onSelect={(g) => setFilters({...filters, genre: g})}
                    value={filters.genre?.name || ''}
                  />

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted tracking-widest">Release Year</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 2024"
                      value={filters.year}
                      onChange={(e) => setFilters({...filters, year: e.target.value})}
                      className="w-full bg-background border border-white/10 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>

                  <SearchableFilter 
                    label="Language"
                    placeholder="Search language..."
                    onSearch={searchLanguages}
                    onSelect={(l) => setFilters({...filters, language: l})}
                    value={filters.language?.english_name || ''}
                  />

                  <SearchableFilter 
                    label="Actor"
                    placeholder="Search actor..."
                    onSearch={searchPeople}
                    onSelect={(p) => setFilters({...filters, actor: p})}
                    value={filters.actor?.name || ''}
                  />

                  <SearchableFilter 
                    label="Director"
                    placeholder="Search director..."
                    onSearch={searchPeople}
                    onSelect={(p) => setFilters({...filters, director: p})}
                    value={filters.director?.name || ''}
                  />

                  <div className="flex gap-2 pt-6">
                    <button 
                      onClick={() => setFilters({ genre: null, year: '', language: null, actor: null, director: null })}
                      className="flex-1 py-2 text-xs font-bold text-muted hover:text-white transition-colors"
                    >
                      RESET
                    </button>
                    <button 
                      onClick={handleApplyFilters}
                      className="flex-[2] bg-primary text-black py-2.5 rounded-lg text-xs font-black hover:bg-primary/90 transition-all"
                    >
                      APPLY FILTERS
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-muted">
          
          {user ? (
            <div className="flex items-center gap-4 ml-2">
              <Link to="/profile" className="flex items-center gap-2 hover:text-white transition-colors">
                <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-white/20" />
                <span>{user.username.toUpperCase()}</span>
              </Link>
              <button onClick={logout} className="p-2 hover:bg-white/10 rounded-full transition-colors text-secondary">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 ml-2">
              <Link to="/login" className="hover:text-white transition-colors">LOGIN</Link>
              <Link to="/register" className="bg-primary text-black px-4 py-2 rounded-md font-bold hover:bg-primary/90 transition-colors">SIGN UP</Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-surface border-b border-white/10 p-4 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
          {user ? (
            <>
              <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>PROFILE</Link>
              <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="text-left text-secondary font-bold">LOGOUT</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>LOGIN</Link>
              <Link to="/register" className="text-primary font-bold" onClick={() => setIsMobileMenuOpen(false)}>SIGN UP</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
