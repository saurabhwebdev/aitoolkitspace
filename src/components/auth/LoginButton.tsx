'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

type LoginButtonProps = {
  className?: string;
};

export default function LoginButton({ className = '' }: LoginButtonProps) {
  const { user, isAdmin, signInWithGoogle, signInWithGithub, signInWithEmail, signUpWithEmail, resetPassword, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Redirect to admin dashboard if user is admin
  useEffect(() => {
    if (user && isAdmin) {
      router.push('/admin');
    }
  }, [user, isAdmin, router]);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      setShowEmailForm(false);
      setError('');
      setResetSent(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      setShowDropdown(false);
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    }
  };

  return (
    <div className="relative">
      {user ? (
        <>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleDropdown}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 ${className}`}
          >
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'User'} 
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center text-xs font-bold">
                {user.displayName?.[0] || user.email?.[0] || 'U'}
              </div>
            )}
            <span>{user.displayName?.split(' ')[0] || 'User'}</span>
          </motion.button>
          
          {showDropdown && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-10"
            >
              <div className="px-4 py-2 border-b">
                <p className="text-sm font-medium">{user.displayName}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <a
                href="/user/bookmarks"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span>My Bookmarks</span>
                </div>
              </a>
              <button 
                onClick={() => {
                  signOut();
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Sign out
              </button>
            </motion.div>
          )}
        </>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleDropdown}
          className={`px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 ${className}`}
        >
          Sign in
        </motion.button>
      )}
      
      {!user && showDropdown && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg py-2 z-10"
        >
          {!showEmailForm ? (
            <>
              <button 
                onClick={() => {
                  signInWithGoogle();
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </div>
              </button>
              <button 
                onClick={() => {
                  signInWithGithub();
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span>Sign in with GitHub</span>
                </div>
              </button>
              <button 
                onClick={() => setShowEmailForm(true)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Sign in with Email</span>
                </div>
              </button>
            </>
          ) : (
            <div className="px-4 py-2">
              {resetSent ? (
                <div className="text-sm text-green-600 mb-2">
                  Password reset email sent! Check your inbox.
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium">
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </h3>
                    <button 
                      onClick={() => setShowEmailForm(false)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Back
                    </button>
                  </div>
                  
                  {error && (
                    <div className="text-xs text-red-600 mb-2">
                      {error}
                    </div>
                  )}
                  
                  <form onSubmit={handleEmailSubmit} className="space-y-2">
                    <div>
                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 text-sm border rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 text-sm border rounded-md"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {isSignUp ? 'Sign Up' : 'Sign In'}
                    </button>
                  </form>
                  
                  <div className="mt-2 text-xs text-center">
                    {isSignUp ? (
                      <button 
                        onClick={() => setIsSignUp(false)}
                        className="text-blue-600 hover:underline"
                      >
                        Already have an account? Sign in
                      </button>
                    ) : (
                      <>
                        <button 
                          onClick={() => setIsSignUp(true)}
                          className="text-blue-600 hover:underline"
                        >
                          Don't have an account? Sign up
                        </button>
                        <div className="mt-1">
                          <button 
                            onClick={handleResetPassword}
                            className="text-blue-600 hover:underline"
                          >
                            Forgot password?
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
} 