'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllTools, isToolBookmarked, addBookmark, removeBookmark, searchTools } from '@/lib/firebase-services';
import { Tool, ToolCategory, ToolPricing } from '@/lib/models';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import Image from 'next/image';

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPricing, setSelectedPricing] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'newest'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarkedTools, setBookmarkedTools] = useState<Record<string, boolean>>({});
  const [bookmarkLoading, setBookmarkLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const { user } = useAuth();
  const toolsPerPage = 9; // Number of tools to display per page

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        const allTools = await getAllTools();
        setTools(allTools);
        
        // Extract unique categories from tools
        const categories = new Set<string>();
        allTools.forEach(tool => {
          if (tool.category) {
            const cats = tool.category.split(',').map(cat => cat.trim());
            cats.forEach(cat => categories.add(cat));
          }
        });
        setAvailableCategories(Array.from(categories).sort());
        
      } catch (err) {
        console.error('Error fetching tools:', err);
        setError('Failed to load tools. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  // Check which tools are bookmarked by the user
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!user) {
        setBookmarkedTools({});
        return;
      }

      try {
        const bookmarkStatuses: Record<string, boolean> = {};
        
        for (const tool of tools) {
          if (tool.id) {
            const isBookmarked = await isToolBookmarked(user.uid, tool.id);
            if (isBookmarked) {
              bookmarkStatuses[tool.id] = true;
            }
          }
        }
        
        setBookmarkedTools(bookmarkStatuses);
      } catch (err) {
        console.error('Error checking bookmark status:', err);
      }
    };

    checkBookmarkStatus();
  }, [user, tools]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedPricing, sortBy, searchQuery]);

  const handleBookmarkToggle = async (e: React.MouseEvent, tool: Tool) => {
    e.preventDefault(); // Prevent navigation to tool detail page
    e.stopPropagation(); // Stop event propagation
    
    if (!user) {
      alert('Please log in to bookmark tools');
      return;
    }
    
    if (!tool.id) return;
    
    try {
      setBookmarkLoading(tool.id);
      
      if (bookmarkedTools[tool.id]) {
        // Remove bookmark
        await removeBookmark(user.uid, tool.id);
        setBookmarkedTools(prev => ({ ...prev, [tool.id!]: false }));
      } else {
        // Add bookmark
        await addBookmark({
          userId: user.uid,
          toolId: tool.id,
          toolName: tool.name,
          toolImageUrl: tool.imageUrl
        });
        setBookmarkedTools(prev => ({ ...prev, [tool.id!]: true }));
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    } finally {
      setBookmarkLoading(null);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      setLoading(true);
      const searchResults = await searchTools(searchQuery);
      setTools(searchResults);
    } catch (err) {
      console.error('Error searching tools:', err);
      setError('Failed to search tools. Please try again later.');
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    // Reset to all tools
    const fetchTools = async () => {
      try {
        setLoading(true);
        const allTools = await getAllTools();
        setTools(allTools);
      } catch (err) {
        console.error('Error fetching tools:', err);
        setError('Failed to load tools. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchTools();
  };

  // Function to get category array from a tool
  const getToolCategories = (tool: Tool): string[] => {
    if (!tool.category) return [];
    return tool.category.split(',').map(cat => cat.trim());
  };

  const filteredTools = tools.filter(tool => {
    // Category filter - now handles comma-separated categories
    const categoryMatch = selectedCategory === 'all' || 
                         getToolCategories(tool).includes(selectedCategory);
    
    // Pricing filter
    const pricingMatch = selectedPricing === 'all' || tool.pricing.includes(selectedPricing as ToolPricing);
    
    return categoryMatch && pricingMatch;
  });

  const sortedTools = [...filteredTools].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    // Handle both Date and Timestamp objects for createdAt
    const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : (a.createdAt?.toMillis?.() || 0);
    const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : (b.createdAt?.toMillis?.() || 0);
    return dateB - dateA;
  });

  // Calculate pagination
  const totalTools = sortedTools.length;
  const totalPages = Math.ceil(totalTools / toolsPerPage);
  const startIndex = (currentPage - 1) * toolsPerPage;
  const endIndex = startIndex + toolsPerPage;
  const currentTools = sortedTools.slice(startIndex, endIndex);

  // Handle page navigation
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate pagination items with ellipsis
  const getPaginationItems = () => {
    const items = [];
    
    // Always show first page
    items.push(1);
    
    // Calculate range around current page
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Adjust if we're near the start or end
    if (currentPage <= 3) {
      endPage = Math.min(5, totalPages - 1);
    } else if (currentPage >= totalPages - 2) {
      startPage = Math.max(2, totalPages - 4);
    }
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      items.push('ellipsis-start');
    }
    
    // Add pages around current page
    for (let i = startPage; i <= endPage; i++) {
      items.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      items.push('ellipsis-end');
    }
    
    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(totalPages);
    }
    
    return items;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">AI Tools Directory</h1>
          <p className="text-gray-600">Discover and compare the best AI tools for your needs</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for AI tools..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              )}
              Search
            </button>
          </form>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            <option value="all">All Categories</option>
            {availableCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={selectedPricing}
            onChange={(e) => setSelectedPricing(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            <option value="all">All Pricing</option>
            {Object.values(ToolPricing).map((pricing) => (
              <option key={pricing} value={pricing}>{pricing}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'newest')}
            className="px-4 py-2 border rounded-md"
          >
            <option value="newest">Newest First</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentTools.map((tool, index) => (
            <div key={tool.id} className="relative">
              <Link href={`/tools/${tool.slug}`}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 h-full flex flex-col"
                >
                  <div className="relative w-full aspect-video mb-4 overflow-hidden rounded-lg">
                    {tool.imageUrl ? (
                      <Image
                        src={tool.imageUrl}
                        alt={tool.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-contain bg-gray-50"
                        priority={index < 3} // Prioritize loading the first 3 images
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>

                  <h2 className="text-xl font-semibold mb-2">{tool.name}</h2>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
                    {tool.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-auto">
                    {getToolCategories(tool).map((category, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {category}
                      </span>
                    ))}
                    {tool.pricing.map((price) => (
                      <span
                        key={price}
                        className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                      >
                        {price}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </Link>
              <button
                onClick={(e) => handleBookmarkToggle(e, tool)}
                disabled={bookmarkLoading === tool.id}
                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                aria-label={bookmarkedTools[tool.id!] ? "Remove from bookmarks" : "Add to bookmarks"}
              >
                {bookmarkLoading === tool.id ? (
                  <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg 
                    className={`w-5 h-5 ${bookmarkedTools[tool.id!] ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill={bookmarkedTools[tool.id!] ? "currentColor" : "none"}
                    stroke="currentColor" 
                    strokeWidth={bookmarkedTools[tool.id!] ? "0" : "2"}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex flex-col items-center">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-md flex items-center ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
                aria-label="Previous page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              {getPaginationItems().map((item, index) => (
                item === 'ellipsis-start' || item === 'ellipsis-end' ? (
                  <span key={`ellipsis-${index}`} className="px-2 py-2 text-gray-500">
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => handlePageChange(item as number)}
                    className={`px-3 py-2 rounded-md ${
                      currentPage === item
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                    aria-label={`Page ${item}`}
                    aria-current={currentPage === item ? 'page' : undefined}
                  >
                    {item}
                  </button>
                )
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-md flex items-center ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
                aria-label="Next page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {/* Results count */}
            <div className="mt-4 text-sm text-gray-500">
              Showing {startIndex + 1}-{Math.min(endIndex, totalTools)} of {totalTools} tools
            </div>
          </div>
        )}

        {sortedTools.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No tools found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
} 