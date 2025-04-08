'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import LoginButton from '@/components/auth/LoginButton';

const Navbar = () => {
  const [activeTab, setActiveTab] = useState('/');
  const { isAdmin, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
              <PillNavLink 
                href="/tools" 
                active={activeTab === '/tools'} 
                onClick={() => setActiveTab('/tools')}
              >
                Tools
              </PillNavLink>
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
            <MobileNavLink 
              href="/tools" 
              active={activeTab === '/tools'} 
              onClick={() => {
                setActiveTab('/tools');
                setIsMobileMenuOpen(false);
              }}
            >
              Tools
            </MobileNavLink>
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