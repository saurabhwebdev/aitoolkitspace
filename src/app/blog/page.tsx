'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getBlogPosts } from '@/lib/firebase-services';
import { BlogPost } from '@/lib/models';
import { Timestamp } from 'firebase/firestore';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        console.log('Fetching blog posts...');
        
        const blogPosts = await getBlogPosts();
        console.log(`Found ${blogPosts.length} total blog posts`);
        
        // Log details about each blog post for debugging
        blogPosts.forEach((post, i) => {
          console.log(`Blog ${i+1}: "${post.title}", ID: ${post.id}, Status: ${post.status}, Slug: ${post.slug}`);
        });
        
        // Filter for published posts only
        const publishedPosts = blogPosts.filter(post => {
          // Consider a post published if its status is PUBLISHED (case insensitive)
          const status = typeof post.status === 'string' ? post.status.toUpperCase() : String(post.status).toUpperCase();
          console.log(`Post status for "${post.title}": ${status}, type: ${typeof post.status}`);
          return status === 'PUBLISHED';
        });
        
        console.log(`Total published posts: ${publishedPosts.length}`);
        setPosts(publishedPosts);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Failed to load blog posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

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

  if (error) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">AI Tools Blog</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Insights, tutorials, and updates about the latest AI tools and technologies
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No blog posts available yet. Please create some posts in the admin panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post.id}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden h-full flex flex-col"
                >
                  <div className="relative h-48">
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Replace broken images with fallback
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = '/images/blog-placeholder.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <span>{formatDate(post.createdAt)}</span>
                      {post.category && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{post.category}</span>
                        </>
                      )}
                    </div>
                    <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                    <p className="text-gray-600 mb-4 flex-grow">{post.summary}</p>
                    <div className="mt-auto">
                      <span className="text-blue-600 font-medium">Read more →</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 