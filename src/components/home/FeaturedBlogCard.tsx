'use client';

import { BlogPost } from '@/lib/models';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Timestamp } from 'firebase/firestore';

interface FeaturedBlogCardProps {
  post: BlogPost;
  index: number;
}

export default function FeaturedBlogCard({ post, index }: FeaturedBlogCardProps) {
  const formatDate = (date: Date | Timestamp) => {
    if (!date) {
      return 'No date';
    }
    
    // Convert Firebase Timestamp to Date if needed
    let dateObj: Date;
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'object' && 'toDate' in date) {
      // Handle Firebase Timestamp
      dateObj = date.toDate();
    } else {
      // Try to parse as date string
      dateObj = new Date(date);
    }
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group"
    >
      <Link href={`/blog/${post.slug}`}>
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden h-full flex flex-col">
          <div className="relative h-48">
            {post.imageUrl ? (
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                onError={(e) => {
                  // Replace broken images with fallback
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/images/blog-placeholder.jpg';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
            )}
            {post.category && (
              <div className="absolute top-3 right-3">
                <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                  {post.category}
                </span>
              </div>
            )}
          </div>
          <div className="p-5 flex-grow flex flex-col">
            <div className="flex items-center text-xs text-gray-500 mb-2">
              <span>{formatDate(post.createdAt)}</span>
              <span className="mx-2">•</span>
              <span>By {post.author}</span>
            </div>
            <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {post.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
              {post.summary}
            </p>
            <div className="flex items-center text-blue-600 font-medium text-sm mt-auto">
              Read article
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
} 