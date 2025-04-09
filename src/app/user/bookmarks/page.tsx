'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { getUserBookmarks, getToolById } from '@/lib/firebase-services';
import { Tool, Bookmark } from '@/lib/models';
import ToolSubmissionForm from '@/components/ToolSubmissionForm';
import { useSearchParams } from 'next/navigation';

// Extract tab selection logic to a separate client component
function TabSelector({ onTabChange }: { onTabChange: (tab: 'bookmarks' | 'submit') => void }) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  useEffect(() => {
    if (tabParam === 'submit') {
      onTabChange('submit');
    } else {
      onTabChange('bookmarks');
    }
  }, [tabParam, onTabChange]);
  
  return null; // This component just handles the logic, no UI
}

export default function BookmarksPage() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'submit'>('bookmarks');

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userBookmarks = await getUserBookmarks(user.uid);
        setBookmarks(userBookmarks);
        
        // Fetch tool details for each bookmark
        const toolPromises = userBookmarks.map(bookmark => getToolById(bookmark.toolId));
        const toolResults = await Promise.all(toolPromises);
        const validTools = toolResults.filter((tool): tool is Tool => tool !== null);
        setTools(validTools);
      } catch (err) {
        console.error('Error fetching bookmarks:', err);
        setError('Failed to load bookmarks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to view your bookmarks</h2>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gray-50 py-12">
      {/* Wrap useSearchParams in a Suspense boundary */}
      <Suspense fallback={null}>
        <TabSelector onTabChange={setActiveTab} />
      </Suspense>
      
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Dashboard</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('bookmarks')}
                className={`px-4 py-2 rounded-md ${
                  activeTab === 'bookmarks'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Bookmarks
              </button>
              <button
                onClick={() => setActiveTab('submit')}
                className={`px-4 py-2 rounded-md ${
                  activeTab === 'submit'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Submit Tool
              </button>
            </div>
          </div>

          {activeTab === 'bookmarks' ? (
            <>
              <p className="text-gray-600 mb-8">
                Your saved AI tools and resources ({tools.length} items)
              </p>

              {tools.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No bookmarks</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by bookmarking some tools you like.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/tools"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Browse Tools
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tools.map((tool) => (
                    <Link href={`/tools/${tool.slug}`} key={tool.id}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                      >
                        <div className="flex items-start space-x-4">
                          <img
                            src={tool.imageUrl}
                            alt={tool.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
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
              )}
            </>
          ) : (
            <ToolSubmissionForm />
          )}
        </motion.div>
      </div>
    </div>
  );
} 