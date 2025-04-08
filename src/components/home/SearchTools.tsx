'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { searchTools } from '@/lib/firebase-services';
import { Tool } from '@/lib/models';

export default function SearchTools() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true);
        try {
          const searchResults = await searchTools(query);
          setResults(searchResults);
          setShowResults(true);
        } catch (error) {
          console.error('Error searching tools:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowResults(false);
    }
  };

  return (
    <div ref={searchRef} className="w-full max-w-4xl mx-auto relative z-10">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for AI tools..."
            className="w-full px-8 py-6 text-xl rounded-2xl border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 shadow-lg bg-white/90 backdrop-blur-sm"
          />
          <button
            type="submit"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {showResults && (query.trim().length >= 2) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-20 w-full mt-4 bg-white rounded-xl shadow-xl border border-gray-100 max-h-[480px] overflow-y-auto backdrop-blur-lg bg-white/95"
          >
            {loading ? (
              <div className="p-4 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : results.length > 0 ? (
              <ul className="py-2">
                {results.map((tool) => (
                  <li key={tool.id}>
                    <button
                      onClick={() => {
                        router.push(`/tools/${tool.slug}`);
                        setShowResults(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center"
                    >
                      {tool.imageUrl && (
                        <img
                          src={tool.imageUrl}
                          alt={tool.name}
                          className="w-8 h-8 rounded-full mr-3 object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium">{tool.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{tool.description}</div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500">No results found</div>
            )}
          </motion.div>
        )}
      </form>
    </div>
  );
} 