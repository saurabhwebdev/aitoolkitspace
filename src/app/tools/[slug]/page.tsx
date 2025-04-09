'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getToolBySlug, incrementToolViewCount, isToolBookmarked, addBookmark, removeBookmark, submitFeedback, submitToolReport } from '@/lib/firebase-services';
import { Tool, ToolCategory, ToolPricing, ToolStatus, Feedback, ToolReport } from '@/lib/models';
import Link from 'next/link';
import RelatedTools from '@/components/tools/RelatedTools';
import { useParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/lib/AuthContext';
import ToolSchema from '@/components/schema/ToolSchema';
import Image from 'next/image';

export default function ToolDetail() {
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'reviews'>('overview');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'feedback' | 'report'>('feedback');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackReason, setFeedbackReason] = useState<'broken' | 'misleading' | 'spam' | 'other'>('other');
  const [feedbackCategory, setFeedbackCategory] = useState<'bug' | 'feature' | 'content' | 'other'>('content');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const { user } = useAuth();
  const params = useParams();
  const slug = params?.slug as string;

  useEffect(() => {
    if (!slug) return; // Don't fetch if slug is empty

    const fetchTool = async () => {
      try {
        setLoading(true);
        const toolData = await getToolBySlug(slug);
        if (toolData) {
          setTool(toolData);
          // Increment view count
          if (toolData.id) {
            await incrementToolViewCount(toolData.id);
          }
        } else {
          setError('Tool not found');
        }
      } catch (err) {
        console.error('Error fetching tool:', err);
        setError('Failed to load tool details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTool();
  }, [slug]);

  // Check if tool is bookmarked by the user
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (user && tool?.id) {
        try {
          const bookmarked = await isToolBookmarked(user.uid, tool.id);
          setIsBookmarked(bookmarked);
        } catch (err) {
          console.error('Error checking bookmark status:', err);
        }
      }
    };
    
    checkBookmarkStatus();
  }, [user, tool]);

  const handleBookmarkToggle = async () => {
    if (!user) {
      // If user is not logged in, show a message or redirect to login
      alert('Please log in to bookmark tools');
      return;
    }
    
    if (!tool?.id) return;
    
    try {
      setBookmarkLoading(true);
      
      if (isBookmarked) {
        // Remove bookmark
        await removeBookmark(user.uid, tool.id);
        setIsBookmarked(false);
      } else {
        // Add bookmark
        await addBookmark({
          userId: user.uid,
          toolId: tool.id,
          toolName: tool.name,
          toolImageUrl: tool.imageUrl
        });
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tool || !tool.id) return;
    
    setFeedbackSubmitting(true);
    setFeedbackError(null);
    
    try {
      if (feedbackType === 'feedback') {
        const feedback: Omit<Feedback, 'id' | 'createdAt' | 'status'> = {
          type: feedbackCategory,
          message: feedbackMessage,
          toolId: tool.id,
          ...(feedbackEmail ? { email: feedbackEmail } : {})
        };
        
        await submitFeedback(feedback);
      } else {
        const report: Omit<ToolReport, 'id' | 'createdAt' | 'status'> = {
          toolId: tool.id,
          reason: feedbackReason,
          details: feedbackMessage,
          ...(feedbackEmail ? { email: feedbackEmail } : {})
        };
        
        await submitToolReport(report);
      }
      
      setFeedbackSuccess(true);
      setTimeout(() => {
        setShowFeedbackModal(false);
        setFeedbackSuccess(false);
        setFeedbackMessage('');
        setFeedbackEmail('');
      }, 2000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setFeedbackError('Failed to submit feedback. Please try again later.');
    } finally {
      setFeedbackSubmitting(false);
    }
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

  if (error || !tool) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">{error}</h1>
            <Link href="/tools">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Back to Tools
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Format date for display
  const formattedDate = tool.createdAt 
    ? (tool.createdAt && typeof tool.createdAt.toDate === 'function' 
        ? formatDistanceToNow(tool.createdAt.toDate(), { addSuffix: true })
        : tool.createdAt && typeof tool.createdAt.seconds === 'number'
          ? formatDistanceToNow(new Date(tool.createdAt.seconds * 1000), { addSuffix: true })
          : tool.createdAt instanceof Date
            ? formatDistanceToNow(tool.createdAt, { addSuffix: true })
            : 'Recently')
    : 'Recently';

  // Calculate rating percentage for display
  const ratingPercentage = tool.rating ? (tool.rating / 5) * 100 : 0;

  // Get array of categories from comma-separated string
  const getCategories = (categoryString: string): string[] => {
    if (!categoryString) return [];
    return categoryString.split(',').map(cat => cat.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {tool && <ToolSchema tool={tool} />}
      
      {/* Hero Section with Glassmorphism */}
      <div className="relative pt-24 pb-12 px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-100 rounded-full opacity-20 blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              {/* Tool Logo/Image */}
              <div className="w-32 h-32 md:w-48 md:h-48 relative flex-shrink-0">
                {tool.imageUrl ? (
                  <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg relative">
                    <Image
                      src={tool.imageUrl}
                      alt={tool.name}
                      fill
                      sizes="(max-width: 768px) 128px, 192px"
                      className="object-cover"
                      priority
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                    <span className="text-5xl">🤖</span>
                  </div>
                )}
              </div>

              {/* Tool Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  {getCategories(tool.category).map((category, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {category}
                    </span>
                  ))}
                  {tool.status !== ToolStatus.ACTIVE && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      tool.status === ToolStatus.BETA 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tool.status}
                    </span>
                  )}
                </div>

                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  {tool.name}
                </h1>
                
                <p className="text-xl text-gray-600 mb-6 max-w-2xl">
                  {tool.description}
                </p>

                <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
                  {/* Primary Action Buttons */}
                  <a
                    href={tool.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    >
                      Visit Website
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </motion.button>
                  </a>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBookmarkToggle}
                    disabled={bookmarkLoading}
                    className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${
                      isBookmarked 
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {bookmarkLoading ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg 
                        className={`w-5 h-5 ${isBookmarked ? 'text-yellow-500 fill-yellow-500' : 'text-gray-500'}`} 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill={isBookmarked ? "currentColor" : "none"}
                        stroke="currentColor" 
                        strokeWidth={isBookmarked ? "0" : "2"}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                      </svg>
                    )}
                    {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </motion.button>
                  
                  {/* Feedback Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setFeedbackType('feedback');
                      setShowFeedbackModal(true);
                    }}
                    className="px-6 py-3 bg-white text-blue-600 border border-blue-200 rounded-xl font-medium hover:bg-blue-50 transition-all flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Feedback
                  </motion.button>
                  
                  {/* Report Issue Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setFeedbackType('report');
                      setShowFeedbackModal(true);
                    }}
                    className="px-6 py-3 bg-white text-red-600 border border-red-200 rounded-xl font-medium hover:bg-red-50 transition-all flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Report Issue
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Navigation Tabs */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="border-b border-gray-100">
                <div className="flex">
                  {['overview', 'features', 'reviews'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`flex-1 px-6 py-4 text-sm font-medium capitalize transition-colors ${
                        activeTab === tab
                          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {/* Tab Content */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {tool.longDescription && (
                      <div className="prose max-w-none">
                        <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                          About {tool.name}
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                          {tool.longDescription}
                        </p>
                      </div>
                    )}

                    {/* Pros & Cons Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {tool.pros && tool.pros.length > 0 && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                          <h3 className="text-xl font-semibold mb-4 text-green-800 flex items-center gap-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Pros
                          </h3>
                          <ul className="space-y-3">
                            {tool.pros.map((pro, index) => (
                              <li key={index} className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </span>
                                <span className="text-gray-700">{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {tool.cons && tool.cons.length > 0 && (
                        <div className="bg-gradient-to-br from-red-50 to-rose-50 p-6 rounded-xl border border-red-100">
                          <h3 className="text-xl font-semibold mb-4 text-red-800 flex items-center gap-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Cons
                          </h3>
                          <ul className="space-y-3">
                            {tool.cons.map((con, index) => (
                              <li key={index} className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </span>
                                <span className="text-gray-700">{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Tags Section */}
                    {tool.tags && tool.tags.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {tool.tags.map((tag, index) => (
                            <span 
                              key={index} 
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Features Tab */}
                {activeTab === 'features' && (
                  <div>
                    {tool.features && tool.features.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tool.features.map((feature, index) => (
                          <div 
                            key={index} 
                            className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-start gap-3"
                          >
                            <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Features Listed</h3>
                        <p className="text-gray-500">This tool hasn't listed any specific features yet.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Reviews Coming Soon!</h3>
                    <p className="text-gray-500">We're working on bringing you user reviews and ratings.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Alternatives Section */}
            {tool.alternatives && tool.alternatives.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  Alternative Tools
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tool.alternatives.map((alt, index) => (
                    <Link 
                      href={`/tools/${alt}`} 
                      key={index}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 hover:border-blue-300 hover:from-blue-50 hover:to-blue-100 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-blue-600">{alt}</span>
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Tool Details & Stats */}
          <div className="space-y-6">
            {/* Tool Stats Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Tool Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* View Count */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="text-sm text-gray-500 mb-1">Views</div>
                    <div className="text-2xl font-bold text-blue-600">{tool.viewCount || 0}</div>
                  </div>
                  
                  {/* Rating */}
                  {tool.rating && (
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="text-sm text-gray-500 mb-1">Rating</div>
                      <div className="flex items-center">
                        <span className="text-2xl font-bold text-green-600 mr-1">
                          {tool.rating.toFixed(1)}
                        </span>
                        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* Other Details */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Category</span>
                    <span className="font-medium">{tool.category}</span>
                  </div>
                  {tool.subcategory && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Subcategory</span>
                      <span className="font-medium">{tool.subcategory}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Pricing</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {tool.pricing.map((price) => (
                        <span
                          key={price}
                          className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                        >
                          {price}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Added</span>
                    <span className="font-medium">{formattedDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Tools */}
            <RelatedTools currentTool={tool} limit={3} />
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {feedbackType === 'feedback' ? 'Submit Feedback' : 'Report an Issue'}
              </h3>
              <button 
                onClick={() => setShowFeedbackModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {feedbackSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Thank You!</h4>
                <p className="text-gray-600">Your {feedbackType === 'feedback' ? 'feedback' : 'report'} has been submitted successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit}>
                <div className="mb-4">
                  <div className="flex space-x-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setFeedbackType('feedback')}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
                        feedbackType === 'feedback'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Feedback
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedbackType('report')}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
                        feedbackType === 'report'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Report Issue
                    </button>
                  </div>
                  
                  {feedbackType === 'feedback' ? (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={feedbackCategory}
                        onChange={(e) => setFeedbackCategory(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="content">Content Issue</option>
                        <option value="bug">Bug Report</option>
                        <option value="feature">Feature Request</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                      <select
                        value={feedbackReason}
                        onChange={(e) => setFeedbackReason(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="broken">Broken Link/Website</option>
                        <option value="misleading">Misleading Information</option>
                        <option value="spam">Spam/Scam</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {feedbackType === 'feedback' ? 'Your Feedback' : 'Details'}
                    </label>
                    <textarea
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder={feedbackType === 'feedback' 
                        ? "Please describe your feedback..." 
                        : "Please provide details about the issue..."}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                    <input
                      type="email"
                      value={feedbackEmail}
                      onChange={(e) => setFeedbackEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="your@email.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      We'll only use this to follow up on your {feedbackType === 'feedback' ? 'feedback' : 'report'} if needed.
                    </p>
                  </div>
                </div>
                
                {feedbackError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                    {feedbackError}
                  </div>
                )}
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="mr-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={feedbackSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {feedbackSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      'Submit'
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
} 