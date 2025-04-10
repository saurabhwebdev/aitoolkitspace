'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getToolsByCategory, getAllTools, getToolsByCategoryCount } from '@/lib/firebase-services';
import { Tool } from '@/lib/models';
import { useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';

const TOOLS_PER_PAGE = 9; // Match the tools page pagination

// Component that uses useSearchParams
function CategoryContent() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalToolCount, setTotalToolCount] = useState(0);
  const [categoryName, setCategoryName] = useState<string>('');
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;

  // Initialize page from URL
  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam) {
      const pageNumber = parseInt(pageParam, 10);
      if (!isNaN(pageNumber) && pageNumber > 0) {
        setCurrentPage(pageNumber);
      }
    }
  }, [searchParams]);

  // Calculate pagination values based on total count
  const totalPages = Math.ceil(totalToolCount / TOOLS_PER_PAGE);
  const startIndex = (currentPage - 1) * TOOLS_PER_PAGE;
  const endIndex = Math.min(startIndex + TOOLS_PER_PAGE, totalToolCount);

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

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        // Convert slug to category name
        const formattedCategoryName = slug.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        setCategoryName(formattedCategoryName);

        // Get total count first
        const count = await getToolsByCategoryCount(formattedCategoryName);
        setTotalToolCount(count);

        // Then fetch page of tools
        if (count > 0) {
          const categoryTools = await getToolsByCategory(formattedCategoryName, currentPage, TOOLS_PER_PAGE);
          setTools(categoryTools);
        } else {
          // If no exact match found, fall back to the old method
          // Use a larger page size to make sure we get all tools for proper filtering
          const allTools = await getAllTools(1, 1000);
          const filteredTools = allTools.filter(tool => {
            if (!tool.category) return false;
            
            // Split categories and normalize them
            const toolCategories = tool.category.split(',')
              .map((cat: string) => cat.trim().toLowerCase());
            
            // Check if any of the tool's categories match our slug
            return toolCategories.includes(slug.toLowerCase()) ||
                   toolCategories.includes(formattedCategoryName.toLowerCase());
          });
          
          // Implement manual pagination for filtered tools
          const startIdx = (currentPage - 1) * TOOLS_PER_PAGE;
          const endIdx = startIdx + TOOLS_PER_PAGE;
          setTools(filteredTools.slice(startIdx, endIdx));
          setTotalToolCount(filteredTools.length);
        }
      } catch (err) {
        console.error('Error fetching tools:', err);
        setError('Failed to load tools. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchTools();
    }
  }, [slug, currentPage]);

  const handlePageChange = (pageNumber: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Use history state to maintain a clean URL with the page parameter
    const url = new URL(window.location.href);
    url.searchParams.set('page', pageNumber.toString());
    window.history.pushState({}, '', url);
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2 capitalize">{slug.replace(/-/g, ' ')}</h1>
          <p className="text-gray-600 mb-8">
            Discover the best AI tools in this category 
            {totalToolCount > 0 && ` (${totalToolCount} tools found)`}
          </p>

          {tools.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No tools found in this category.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {tools.map((tool) => (
                  <Link href={`/tools/${tool.slug}`} key={tool.id}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                    >
                      <div className="flex items-start space-x-4">
                        {tool.imageUrl ? (
                          <div className="relative w-16 h-16 flex-shrink-0">
                            <Image
                              src={tool.imageUrl}
                              alt={tool.name}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="rounded-lg object-contain p-1"
                              quality={80}
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-gray-400 text-xs">No image</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <h2 className="text-xl font-semibold mb-1">{tool.name}</h2>
                          <p className="text-gray-600 text-sm line-clamp-2">{tool.description}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {tool.pricing.map((price, index) => (
                              <span
                                key={index}
                                className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full"
                              >
                                {price}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
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
                    Showing {startIndex + 1}-{Math.min(endIndex, totalToolCount)} of {totalToolCount} tools
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// Loading fallback
function CategoryPageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function CategoryPage() {
  return (
    <Suspense fallback={<CategoryPageLoading />}>
      <CategoryContent />
    </Suspense>
  );
} 