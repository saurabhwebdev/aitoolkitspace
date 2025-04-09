'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { getAllTools, isToolBookmarked, addBookmark, removeBookmark, searchTools, getToolsCount } from '@/lib/firebase-services';
import { Tool, ToolCategory, ToolPricing } from '@/lib/models';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

// Create a client component that uses useSearchParams
function ToolsContent() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPricing, setSelectedPricing] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'newest'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalToolsCount, setTotalToolsCount] = useState(0);
  const [bookmarkedTools, setBookmarkedTools] = useState<Record<string, boolean>>({});
  const [bookmarkLoading, setBookmarkLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const { user } = useAuth();
  const toolsPerPage = 9; // Number of tools to display per page
  const searchParams = useSearchParams();

  // Effect to initialize current page from URL
  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam) {
      const pageNumber = parseInt(pageParam, 10);
      if (!isNaN(pageNumber) && pageNumber > 0) {
        setCurrentPage(pageNumber);
      }
    }
  }, [searchParams]);

  // Effect to fetch tools based on current page
  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        const pageTools = await getAllTools(currentPage, toolsPerPage);
        setTools(pageTools);
        
        // Get total count for pagination
        const totalCount = await getToolsCount();
        setTotalToolsCount(totalCount);
        
        // Extract unique categories from tools
        const categories = new Set<string>();
        pageTools.forEach(tool => {
          if (tool.category) {
            const cats = tool.category.split(',').map((cat: string) => cat.trim());
            cats.forEach((cat: string) => categories.add(cat));
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

    // Only fetch tools if not searching
    if (!isSearching && !searchQuery) {
      fetchTools();
    }
  }, [currentPage, toolsPerPage, isSearching, searchQuery]);

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
      setTotalToolsCount(searchResults.length); // Update total count for search results
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
    setIsSearching(false);
    // Reset to first page and let the useEffect fetch tools again
    setCurrentPage(1);
  };

  // Function to get category array from a tool
  const getToolCategories = (tool: Tool): string[] => {
    if (!tool.category) return [];
    return tool.category.split(',').map(cat => cat.trim());
  };

  // Apply filters to the current page of tools
  const filteredTools = tools.filter(tool => {
    // Category filter - now handles comma-separated categories
    const categoryMatch = selectedCategory === 'all' || 
                         getToolCategories(tool).includes(selectedCategory);
    
    // Pricing filter
    const pricingMatch = selectedPricing === 'all' || tool.pricing.includes(selectedPricing as ToolPricing);
    
    return categoryMatch && pricingMatch;
  });

  // Sort the filtered tools
  const sortedTools = [...filteredTools].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    // Handle both Date and Timestamp objects for createdAt
    const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : (a.createdAt?.toMillis?.() || 0);
    const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : (b.createdAt?.toMillis?.() || 0);
    return dateB - dateA;
  });

  // Calculate pagination based on total count (not filtered count)
  const totalPages = Math.ceil(totalToolsCount / toolsPerPage);
  const startIndex = (currentPage - 1) * toolsPerPage;
  const endIndex = Math.min(startIndex + toolsPerPage, totalToolsCount);

  // Handle page navigation
  const handlePageChange = (pageNumber: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Use history state to maintain a clean URL with the page parameter
    const url = new URL(window.location.href);
    url.searchParams.set('page', pageNumber.toString());
    window.history.pushState({}, '', url);
    setCurrentPage(pageNumber);
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
        <h1 className="text-3xl font-bold mb-8">AI Tools Directory</h1>
        
        {/* Filters and search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Search */}
          <div className="md:col-span-3">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                placeholder="Search for tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Search
              </button>
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={handleClearSearch}
                  className="ml-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Clear
                </button>
              )}
            </form>
          </div>
          
          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {availableCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          {/* Pricing Filter */}
          <div>
            <label htmlFor="pricing" className="block text-sm font-medium text-gray-700 mb-1">
              Pricing
            </label>
            <select
              id="pricing"
              value={selectedPricing}
              onChange={(e) => setSelectedPricing(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Pricing</option>
              <option value="Free">Free</option>
              <option value="Freemium">Freemium</option>
              <option value="Paid">Paid</option>
              <option value="Free Trial">Free Trial</option>
            </select>
          </div>
          
          {/* Sort By */}
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'newest')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="name">A-Z</option>
            </select>
          </div>
        </div>
        
        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTools.map((tool) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Link 
                href={`/tools/${tool.slug}`}
                className="block h-full bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className="relative aspect-video overflow-hidden bg-gray-100">
                  {tool.imageUrl ? (
                    <Image
                      src={tool.imageUrl}
                      alt={tool.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain p-2"
                      quality={80}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                      <span className="text-gray-400 text-lg">No Image</span>
                    </div>
                  )}
                  
                  {/* Bookmark button */}
                  {user && (
                    <button
                      onClick={(e) => handleBookmarkToggle(e, tool)}
                      className="absolute top-2 right-2 p-2 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 shadow-sm transition-all duration-200"
                      disabled={bookmarkLoading === tool.id}
                    >
                      {bookmarkLoading === tool.id ? (
                        <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        bookmarkedTools[tool.id!] ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                        )
                      )}
                    </button>
                  )}
                  
                  {/* Pricing badge */}
                  {tool.pricing && (
                    <span className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-70 text-white text-xs rounded-full">
                      {tool.pricing}
                    </span>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{tool.name}</h3>
                  
                  {/* Categories */}
                  {tool.category && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {getToolCategories(tool).map((category, index) => (
                        <span 
                          key={index} 
                          className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-600 line-clamp-3">{tool.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        
        {/* Show pagination only if we have enough tools */}
        {!isSearching && sortedTools.length > 0 && totalPages > 1 && (
          <div className="mt-8">
            <div className="flex justify-center space-x-2">
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
                typeof item === 'number' ? (
                  <button
                    key={index}
                    onClick={() => handlePageChange(item)}
                    className={`px-3 py-2 rounded-md ${
                      currentPage === item
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    {item}
                  </button>
                ) : (
                  <span key={index} className="px-3 py-2">
                    ...
                  </span>
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
              Showing {startIndex + 1}-{Math.min(endIndex, totalToolsCount)} of {totalToolsCount} tools
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

// Loading fallback
function ToolsPageLoading() {
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

// Main page component with Suspense boundary
export default function ToolsPage() {
  return (
    <Suspense fallback={<ToolsPageLoading />}>
      <ToolsContent />
    </Suspense>
  );
} 