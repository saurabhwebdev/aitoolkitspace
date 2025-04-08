'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import FeaturedToolsCarousel from '@/components/home/FeaturedToolsCarousel';
import CategoryFilters from '@/components/home/CategoryFilters';
import SearchTools from '@/components/home/SearchTools';
import { getAllCategories, getAllTools } from '@/lib/firebase-services';
import { Category, Tool } from '@/lib/models';

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          
          setCategories(extractedCategories);
        } else {
          // Clean up category names in the existing categories
          const cleanedCategories = allCategories.map(category => ({
            ...category,
            name: category.name.split(',')[0].trim()
          }));
          setCategories(cleanedCategories);
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

  return (
    <div className="min-h-screen">
      {/* Hero Section - Simplified and Minimal */}
      <section className="min-h-[80vh] flex items-center relative overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        {/* Simple background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full opacity-20 blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block px-4 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-6"
            >
              Discover the Future of AI
            </motion.span>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              Find the Perfect <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">AI Tools</span> for Your Needs
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-xl text-gray-600 mb-12"
            >
              Search through our curated collection of AI tools to enhance your workflow and boost productivity
            </motion.p>

            {/* Search Component */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mb-8"
            >
              <SearchTools />
            </motion.div>

            {/* Popular Categories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-wrap justify-center gap-3"
            >
              <span className="text-sm text-gray-500 mr-2 mt-2">Popular categories:</span>
              {loading ? (
                <div className="w-full flex justify-center py-4">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 text-sm">{error}</div>
              ) : categories.length > 0 ? (
                // Sort categories by tool count and take only the top 10
                categories
                  .sort((a, b) => b.toolCount - a.toolCount)
                  .slice(0, 10)
                  .map((category) => (
                  <Link href={`/categories/${category.slug}`} key={category.id}>
                    <motion.span
                      whileHover={{ scale: 1.05, backgroundColor: '#EEF2FF' }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium cursor-pointer hover:shadow-sm transition-all flex items-center gap-2"
                    >
                      {category.name}
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                        {category.toolCount}
                      </span>
                    </motion.span>
                  </Link>
                ))
              ) : (
                <div className="text-gray-500 text-sm">No categories available</div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Tools Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] bg-repeat opacity-5"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-30"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-3">HANDPICKED SELECTION</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Featured AI Tools</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our carefully selected collection of the most innovative and powerful AI tools
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <FeaturedToolsCarousel />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link href="/tools">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.2)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-50 transition-all border border-blue-200 shadow-md hover:shadow-lg flex items-center gap-2 mx-auto"
              >
                View All Tools
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-100 rounded-full filter blur-3xl opacity-30"></div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-50 rounded-full opacity-70"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <CategoryFilters />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              y: [0, -15, 0],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ 
              duration: 5,
              repeat: Infinity,
              repeatType: "mirror"
            }}
            className="absolute top-[20%] left-[10%] w-64 h-64 bg-white rounded-full opacity-30 blur-3xl"
          ></motion.div>
          <motion.div 
            animate={{ 
              y: [0, 20, 0],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ 
              duration: 7,
              repeat: Infinity,
              repeatType: "mirror"
            }}
            className="absolute bottom-[10%] right-[10%] w-80 h-80 bg-white rounded-full opacity-20 blur-3xl"
          ></motion.div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 shadow-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-sm font-medium mb-4">STAY IN THE LOOP</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Stay Updated with AI Trends</h2>
              <p className="text-blue-100 max-w-2xl mx-auto mb-8 text-lg">
                Subscribe to our blog for the latest insights, tutorials, and updates on AI tools and technologies that are shaping the future
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                <Link href="/blog">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(255, 255, 255, 0.2)" }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    Read Our Blog
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                  </motion.button>
                </Link>
                
                <Link href="/contact">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-transparent text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition-all border border-white flex items-center justify-center gap-2"
                  >
                    Subscribe to Updates
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    title: 'Curated Selection',
    description: 'Hand-picked AI tools across various categories, ensuring quality and relevance.',
    icon: '🎯',
  },
  {
    title: 'SEO Optimized',
    description: 'Find the right tools quickly with our optimized search and categorization.',
    icon: '🔍',
  },
  {
    title: 'Regular Updates',
    description: 'Stay current with the latest AI innovations and tool releases.',
    icon: '🔄',
  },
];
