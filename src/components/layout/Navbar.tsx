'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import LoginButton from '@/components/auth/LoginButton';

const Navbar = () => {
  const [activeTab, setActiveTab] = useState('/');
  const { isAdmin, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target as Node)) {
        setIsToolsDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 w-full bg-white/80 backdrop-blur-sm z-50 shadow-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              AIToolKit<span className="text-gray-500">.space</span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            <div className="bg-gray-100 rounded-full p-1 flex space-x-1">
              <PillNavLink 
                href="/" 
                active={activeTab === '/'} 
                onClick={() => setActiveTab('/')}
              >
                Home
              </PillNavLink>
              
              {/* Tools dropdown */}
              <div className="relative" ref={toolsDropdownRef}>
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center ${
                    activeTab === '/tools' || activeTab === '/categories'
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                  onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
                >
                  <span>Tools</span>
                  <svg 
                    className={`ml-1 w-4 h-4 transition-transform ${isToolsDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isToolsDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-10"
                  >
                    <Link 
                      href="/tools" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setActiveTab('/tools');
                        setIsToolsDropdownOpen(false);
                      }}
                    >
                      All Tools
                    </Link>
                    <Link 
                      href="/categories" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setActiveTab('/categories');
                        setIsToolsDropdownOpen(false);
                      }}
                    >
                      Browse by Category
                    </Link>
                  </motion.div>
                )}
              </div>
              
              <PillNavLink 
                href="/blog" 
                active={activeTab === '/blog'} 
                onClick={() => setActiveTab('/blog')}
              >
                Blog
              </PillNavLink>
              <PillNavLink 
                href="/about" 
                active={activeTab === '/about'} 
                onClick={() => setActiveTab('/about')}
              >
                About
              </PillNavLink>
              <PillNavLink 
                href="/contact" 
                active={activeTab === '/contact'} 
                onClick={() => setActiveTab('/contact')}
              >
                Contact
              </PillNavLink>
              {user && (
                <PillNavLink 
                  href="/user/bookmarks" 
                  active={activeTab === '/user/bookmarks'} 
                  onClick={() => setActiveTab('/user/bookmarks')}
                >
                  Bookmarks
                </PillNavLink>
              )}
              {isAdmin && (
                <PillNavLink 
                  href="/admin" 
                  active={activeTab === '/admin'} 
                  onClick={() => setActiveTab('/admin')}
                >
                  Admin
                </PillNavLink>
              )}
            </div>
            <LoginButton className="ml-4" />
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <LoginButton className="mr-2" />
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white shadow-lg"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <MobileNavLink 
              href="/" 
              active={activeTab === '/'} 
              onClick={() => {
                setActiveTab('/');
                setIsMobileMenuOpen(false);
              }}
            >
              Home
            </MobileNavLink>
            
            {/* Mobile Tools dropdown */}
            <div>
              <MobileNavLink 
                href="/tools" 
                active={activeTab === '/tools'} 
                onClick={() => {
                  setActiveTab('/tools');
                  setIsMobileMenuOpen(false);
                }}
              >
                <div className="flex justify-between items-center">
                  <span>Tools</span>
                </div>
              </MobileNavLink>
              
              <div className="pl-4 border-l-2 border-gray-100 ml-2 mt-1">
                <MobileNavLink 
                  href="/categories" 
                  active={activeTab === '/categories'} 
                  onClick={() => {
                    setActiveTab('/categories');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>Browse by Category</span>
                  </div>
                </MobileNavLink>
              </div>
            </div>
            
            <MobileNavLink 
              href="/blog" 
              active={activeTab === '/blog'} 
              onClick={() => {
                setActiveTab('/blog');
                setIsMobileMenuOpen(false);
              }}
            >
              Blog
            </MobileNavLink>
            <MobileNavLink 
              href="/about" 
              active={activeTab === '/about'} 
              onClick={() => {
                setActiveTab('/about');
                setIsMobileMenuOpen(false);
              }}
            >
              About
            </MobileNavLink>
            <MobileNavLink 
              href="/contact" 
              active={activeTab === '/contact'} 
              onClick={() => {
                setActiveTab('/contact');
                setIsMobileMenuOpen(false);
              }}
            >
              Contact
            </MobileNavLink>
            {user && (
              <MobileNavLink 
                href="/user/bookmarks" 
                active={activeTab === '/user/bookmarks'} 
                onClick={() => {
                  setActiveTab('/user/bookmarks');
                  setIsMobileMenuOpen(false);
                }}
              >
                Bookmarks
              </MobileNavLink>
            )}
            {isAdmin && (
              <MobileNavLink 
                href="/admin" 
                active={activeTab === '/admin'} 
                onClick={() => {
                  setActiveTab('/admin');
                  setIsMobileMenuOpen(false);
                }}
              >
                Admin
              </MobileNavLink>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

const PillNavLink = ({ 
  href, 
  children, 
  active, 
  onClick 
}: { 
  href: string; 
  children: React.ReactNode; 
  active: boolean;
  onClick: () => void;
}) => (
  <Link 
    href={href}
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
      active 
        ? 'bg-white text-blue-600 shadow-sm' 
        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
    }`}
  >
    {children}
  </Link>
);

const MobileNavLink = ({
  href,
  children,
  active,
  onClick
}: {
  href: string;
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) => (
  <Link
    href={href}
    onClick={onClick}
    className={`block px-3 py-2 rounded-md text-base font-medium ${
      active
        ? 'bg-blue-50 text-blue-600'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    {children}
  </Link>
);

export default Navbar; 