'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getAllCategories, getAllTools } from '@/lib/firebase-services';
import { Category, Tool } from '@/lib/models';

export default function CategoryFilters() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const categoriesPerPage = 10;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const allCategories = await getAllCategories();
        
        // If no categories are found in the categories collection, extract them from tools
        if (allCategories.length === 0) {
          const tools = await getAllTools();
          
          // Extract unique categories from tools
          const categoryMap = new Map<string, number>();
          
          tools.forEach(tool => {
            if (tool.category) {
              // Clean up category name - take only the first category if multiple are separated by commas
              const categoryName = tool.category.split(',')[0].trim();
              categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1);
            }
          });
          
          // Convert to Category objects
          const extractedCategories: Category[] = Array.from(categoryMap.entries()).map(([name, count]) => ({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name: name,
            slug: name.toLowerCase().replace(/\s+/g, '-'),
            description: `${name} AI tools`,
            toolCount: count
          }));
          
          // Sort by tool count (descending)
          const sortedCategories = extractedCategories.sort((a, b) => b.toolCount - a.toolCount);
          setCategories(sortedCategories);
        } else {
          // Clean up category names in the existing categories
          const cleanedCategories = allCategories.map(category => ({
            ...category,
            name: category.name.split(',')[0].trim()
          }));
          
          // Sort by tool count (descending)
          const sortedCategories = cleanedCategories.sort((a, b) => b.toolCount - a.toolCount);
          setCategories(sortedCategories);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Calculate pagination
  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = categories.slice(indexOfFirstCategory, indexOfLastCategory);
  const totalPages = Math.ceil(categories.length / categoriesPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="w-full py-12 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-12 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="w-full py-12 flex items-center justify-center">
        <div className="text-gray-500">No categories available.</div>
      </div>
    );
  }

  // Determine which categories to display
  const displayCategories = showAll ? currentCategories : categories.slice(0, 10);

  return (
    <div className="w-full py-16 relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            repeatType: "mirror"
          }}
          className="absolute top-[10%] left-[5%] w-64 h-64 bg-blue-100 rounded-full opacity-30 blur-3xl"
        ></motion.div>
        <motion.div 
          animate={{ 
            y: [0, 20, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            repeatType: "mirror"
          }}
          className="absolute bottom-[10%] right-[5%] w-80 h-80 bg-purple-100 rounded-full opacity-20 blur-3xl"
        ></motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4"
          >
            ORGANIZED COLLECTION
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Browse by Category
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-gray-600 max-w-2xl mx-auto"
          >
            Explore our curated collection of AI tools organized by category to find exactly what you need
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index % 4) }}
              viewport={{ once: true }}
            >
              <Link href={`/categories/${category.slug}`}>
                <motion.div
                  whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 h-full border border-gray-100 relative overflow-hidden group"
                >
                  {/* Category icon with gradient background */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-bl-full opacity-70 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex flex-col items-center text-center relative z-10">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-3 shadow-sm group-hover:shadow-md transition-shadow">
                      {category.icon ? (
                        <span className="text-xl text-white">{category.icon}</span>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      )}
                    </div>
                    <h3 className="font-bold text-base mb-1 group-hover:text-blue-600 transition-colors truncate w-full">{category.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{category.toolCount} tools</p>
                    
                    <div className="mt-auto pt-1 flex items-center text-blue-600 font-medium text-xs">
                      <span>Explore</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          {!showAll ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAll(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all"
            >
              View All Categories
            </motion.button>
          ) : (
            <>
              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mb-6">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === totalPages
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
              
              <Link href="/tools">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all"
                >
                  View All Tools
                </motion.button>
              </Link>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
} 