import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X } from 'lucide-react';

const SearchableFilter = ({ label, placeholder, onSelect, onSearch, value = '', displayKey = 'name' }) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query || query.length < 1 || !isOpen) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await onSearch(query);
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, isOpen]);

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <label className="text-[10px] font-black uppercase text-muted tracking-widest">{label}</label>
      <div className="relative group">
        <input 
          type="text" 
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full bg-background border border-white/10 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary/50 transition-all pr-10"
        />
        {query && (
          <button 
            onClick={() => {
              setQuery('');
              onSelect(null);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {isOpen && (query || results.length > 0) && (
        <div className="absolute top-full left-0 w-full mt-1 bg-surface border border-white/10 rounded-xl overflow-hidden shadow-2xl z-[70] max-h-60 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="p-4 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          ) : results.length > 0 ? (
            results.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(item[displayKey]);
                  onSelect(item);
                  setIsOpen(false);
                }}
                className="w-full text-left p-3 text-sm hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 flex items-center justify-between group"
              >
                <span>{item[displayKey]}</span>
                <span className="text-[10px] opacity-0 group-hover:opacity-100 text-primary font-black uppercase">Select</span>
              </button>
            ))
          ) : query.length > 0 ? (
            <div className="p-4 text-center text-xs text-muted italic">No results found</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchableFilter;
