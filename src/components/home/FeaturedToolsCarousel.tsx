'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { getFeaturedTools } from '@/lib/firebase-services';
import { Tool, ToolPricing } from '@/lib/models';
import { truncateText } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

const FeaturedToolsCarousel: React.FC = () => {
  const [featuredTools, setFeaturedTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    const fetchFeaturedTools = async () => {
      try {
        setLoading(true);
        setError(null);
        const tools = await getFeaturedTools();
        setFeaturedTools(tools);
      } catch (err) {
        console.error('Error fetching featured tools:', err);
        setError('Failed to load featured tools. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedTools();
  }, []);

  useEffect(() => {
    if (!autoplay || featuredTools.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredTools.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoplay, featuredTools.length]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === featuredTools.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? featuredTools.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const getPricingLabel = (pricing: ToolPricing[]) => {
    if (pricing.includes(ToolPricing.FREE)) return 'Free';
    if (pricing.includes(ToolPricing.FREEMIUM)) return 'Freemium';
    if (pricing.includes(ToolPricing.PAID)) return 'Paid';
    if (pricing.includes(ToolPricing.SUBSCRIPTION)) return 'Subscription';
    if (pricing.includes(ToolPricing.ENTERPRISE)) return 'Enterprise';
    return 'Contact for pricing';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (featuredTools.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Featured Tools Available</h3>
        <p className="text-gray-600">
          We don't have any featured tools at the moment. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4">
      <div className="relative overflow-hidden rounded-xl bg-white shadow-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col md:flex-row"
          >
            {/* Logo and Image Section */}
            <div className="w-full md:w-1/3 p-6 flex items-center justify-center bg-gray-50">
              <div className="relative w-32 h-32">
                {featuredTools[currentIndex].imageUrl ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={featuredTools[currentIndex].imageUrl}
                      alt={featuredTools[currentIndex].name}
                      fill
                      className="object-contain"
                      onError={(e) => {
                        // Fallback to emoji if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement?.classList.add('fallback-active');
                      }}
                    />
                    <div className="fallback-active hidden w-full h-full flex items-center justify-center bg-blue-100 rounded-lg">
                      <span className="text-4xl">🤖</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100 rounded-lg">
                    <span className="text-4xl">🤖</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content Section */}
            <div className="w-full md:w-2/3 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{featuredTools[currentIndex].name}</h2>
                {featuredTools[currentIndex].sponsored && (
                  <span className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full">
                    Sponsored
                  </span>
                )}
              </div>

              <p className="text-gray-600 mb-4">{truncateText(featuredTools[currentIndex].description, 150)}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {featuredTools[currentIndex].tags?.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Link
                    href={`/tools/${featuredTools[currentIndex].slug}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Learn More
                  </Link>
                  {featuredTools[currentIndex].websiteUrl && (
                    <a
                      href={featuredTools[currentIndex].websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                      Visit Website
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </a>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {getPricingLabel(featuredTools[currentIndex].pricing)}
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        {featuredTools.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>
          </>
        )}

        {/* Pagination Dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {featuredTools.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Autoplay Toggle */}
        <button
          onClick={() => setAutoplay(!autoplay)}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition-colors"
          aria-label={autoplay ? 'Pause autoplay' : 'Resume autoplay'}
        >
          {autoplay ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default FeaturedToolsCarousel; 