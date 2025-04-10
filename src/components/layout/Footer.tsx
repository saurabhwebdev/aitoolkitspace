'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import AnimatedGradient from '@/components/ui/AnimatedGradient';
import { getAllCategories, getAllTools } from '@/lib/firebase-services';
import { Category } from '@/lib/models';

const Footer = () => {
  const [popularCategories, setPopularCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchPopularCategories = async () => {
      try {
        // First try to get from categories collection
        const allCategories = await getAllCategories();
        
        if (allCategories.length === 0) {
          // Fallback: Extract from tools
          const tools = await getAllTools(1, 500);
          
          // Count categories
          const categoryMap = new Map<string, number>();
          tools.forEach(tool => {
            if (tool.category) {
              const categoryName = tool.category.split(',')[0].trim();
              categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1);
            }
          });
          
          // Convert to Category objects and sort by count
          const extractedCategories = Array.from(categoryMap.entries())
            .map(([name, count]) => ({
              id: name.toLowerCase().replace(/\s+/g, '-'),
              name,
              slug: name.toLowerCase().replace(/\s+/g, '-'),
              description: `${name} AI tools`,
              toolCount: count
            }))
            .sort((a, b) => b.toolCount - a.toolCount)
            .slice(0, 6);
          
          setPopularCategories(extractedCategories);
        } else {
          // Use existing categories, sort by tool count
          const sortedCategories = allCategories
            .map(category => ({
              ...category,
              name: category.name.split(',')[0].trim()
            }))
            .sort((a, b) => b.toolCount - a.toolCount)
            .slice(0, 6);
          
          setPopularCategories(sortedCategories);
        }
      } catch (err) {
        console.error('Error fetching categories for footer:', err);
      }
    };

    fetchPopularCategories();
  }, []);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top section with logo and main columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Logo and description */}
          <div className="md:col-span-3">
            <Link href="/" className="text-2xl font-bold">
              <span className="text-blue-400">AIToolKit</span>
              <span className="text-gray-400">.space</span>
            </Link>
            <p className="text-gray-400 mt-4 text-sm leading-relaxed">
              Your curated directory of AI tools and platforms. Discover, compare, and find the perfect AI solutions for your needs.
            </p>
            
            {/* Social icons */}
            <div className="flex space-x-4 mt-6">
              <a 
                href="https://twitter.com/aitoolkit" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a 
                href="https://github.com/saurabhwebdev" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.237 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a 
                href="https://linkedin.com/company/aitoolkit" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a 
                href="mailto:contact@aitoolkit.space" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Email"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Popular Categories */}
          <div className="md:col-span-3">
            <h3 className="text-lg font-semibold mb-4 text-blue-400">Popular Categories</h3>
            <ul className="space-y-3">
              {popularCategories.map((category) => (
                <li key={category.id}>
                  <Link 
                    href={`/categories/${category.slug}`} 
                    className="text-gray-400 hover:text-white transition-colors text-sm flex items-center"
                  >
                    <span className="mr-2">→</span>
                    {category.name}
                    <span className="ml-2 text-xs text-gray-500">({category.toolCount})</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link 
                  href="/categories" 
                  className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium mt-2 inline-block"
                >
                  View all categories
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Tools */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-blue-400">Tools</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/tools" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Browse All Tools
                </Link>
              </li>
              <li>
                <Link href="/tools?category=text" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Text Generation
                </Link>
              </li>
              <li>
                <Link href="/tools?category=image" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Image Creation
                </Link>
              </li>
              <li>
                <Link href="/tools?category=audio" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Audio Processing
                </Link>
              </li>
              <li>
                <Link href="/tools?category=video" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Video Editing
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-blue-400">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Submit Tool */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-blue-400">Submit Your Tool</h3>
            <p className="text-gray-400 text-sm mb-4">
              Have an AI tool to share with our community? Submit it for review and get featured.
            </p>
            <Link href="/user/bookmarks?tab=submit">
              <AnimatedGradient className="rounded-xl shadow-lg">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2.5 flex items-center gap-2 font-medium text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Submit a Tool
                </motion.div>
              </AnimatedGradient>
            </Link>
          </div>
        </div>
        
        {/* Copyright with retro 90s video game style */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 py-4 px-6 mx-auto max-w-4xl">
            {/* Retro grid background with animation */}
            <div 
              className="absolute inset-0 z-0 opacity-20" 
              style={{
                backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent)',
                backgroundSize: '50px 50px',
                animation: 'gridMove 15s linear infinite'
              }}
            />
            
            {/* Floating pixels effect */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full opacity-70"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `float ${2 + Math.random() * 4}s ease-in-out ${Math.random() * 2}s infinite alternate`
                  }}
                />
              ))}
            </div>
            
            {/* Scanlines effect */}
            <div 
              className="absolute inset-0 z-0 opacity-10"
              style={{
                backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 50%, transparent 50%)',
                backgroundSize: '100% 4px',
                animation: 'scanline 0.5s linear infinite'
              }}
            />
            
            {/* Moving glow effects */}
            <div 
              className="absolute -left-10 w-20 h-20 rounded-full bg-blue-500 blur-xl opacity-30"
              style={{
                animation: 'moveGlow 8s ease-in-out infinite alternate'
              }}
            ></div>
            <div 
              className="absolute -right-10 bottom-0 w-20 h-20 rounded-full bg-purple-500 blur-xl opacity-30"
              style={{
                animation: 'moveGlow 8s ease-in-out 2s infinite alternate-reverse'
              }}
            ></div>
            
            {/* Text with glitch effect */}
            <div className="relative z-10 text-center">
              <p 
                className="relative text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-pink-300 font-mono font-bold tracking-wide text-base md:text-lg"
                style={{
                  textShadow: '0 0 5px rgba(0, 255, 255, 0.7), 0 0 10px rgba(0, 255, 255, 0.5)',
                  animation: 'textPulse 2s ease-in-out infinite'
                }}
              >
                &copy; {new Date().getFullYear()} AIToolKit.space. All rights reserved.
              </p>
              
              {/* Glitch overlay */}
              <div 
                className="absolute inset-0 opacity-0 text-center font-mono font-bold tracking-wide text-base md:text-lg text-pink-300"
                style={{
                  clipPath: 'inset(0 0 0 0)',
                  animation: 'glitch 3s infinite linear alternate-reverse',
                  textShadow: '2px 0 rgba(255, 0, 255, 0.7), -2px 0 rgba(0, 255, 255, 0.7)'
                }}
              >
                &copy; {new Date().getFullYear()} AIToolKit.space. All rights reserved.
              </div>
            </div>
          </div>
          
          {/* Add animation keyframes */}
          <style jsx>{`
            @keyframes gridMove {
              0% { background-position: 0 0; }
              100% { background-position: 50px 50px; }
            }
            
            @keyframes scanline {
              0% { transform: translateY(0); }
              100% { transform: translateY(4px); }
            }
            
            @keyframes moveGlow {
              0% { transform: translateY(-10px) translateX(0); }
              50% { transform: translateY(10px) translateX(10px); }
              100% { transform: translateY(0) translateX(20px); }
            }
            
            @keyframes float {
              0% { transform: translateY(0) scale(1); opacity: 0.5; }
              100% { transform: translateY(-10px) scale(1.5); opacity: 0.8; }
            }
            
            @keyframes textPulse {
              0%, 100% { opacity: 0.95; filter: brightness(1); }
              50% { opacity: 1; filter: brightness(1.2); }
            }
            
            @keyframes glitch {
              0% { 
                clip-path: inset(80% 0 0 0);
                transform: translate(-4px, -2px);
                opacity: 0.1;
              }
              10% { 
                clip-path: inset(10% 0 85% 0); 
                transform: translate(4px, 2px);
                opacity: 0.1;
              }
              20% { 
                clip-path: inset(80% 0 0 0);
                transform: translate(-3px, 0);
                opacity: 0.1; 
              }
              30% { 
                clip-path: inset(10% 0 85% 0);
                transform: translate(0, 2px); 
                opacity: 0;
              }
              40% { 
                clip-path: inset(50% 0 30% 0); 
                transform: translate(3px, -1px);
                opacity: 0.1;
              }
              50% { 
                clip-path: inset(10% 0 85% 0); 
                transform: translate(-3px, 1px);
                opacity: 0;
              }
              60% { 
                clip-path: inset(40% 0 43% 0);
                transform: translate(3px, -2px);
                opacity: 0.1;
              }
              70% { 
                clip-path: inset(30% 0 40% 0);
                transform: translate(-4px, 3px); 
                opacity: 0;
              }
              80% { 
                clip-path: inset(90% 0 1% 0);
                transform: translate(5px, -1px); 
                opacity: 0.1;
              }
              90% { 
                clip-path: inset(1% 0 95% 0);
                transform: translate(-7px, 5px); 
                opacity: 0;
              }
              100% { 
                clip-path: inset(10% 0 58% 0); 
                transform: translate(7px, -5px);
                opacity: 0.1;
              }
            }
          `}</style>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 