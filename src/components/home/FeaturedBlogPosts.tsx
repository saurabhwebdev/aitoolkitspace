'use client';

import { useEffect, useState } from 'react';
import { getFeaturedBlogPosts } from '@/lib/firebase-services';
import { BlogPost } from '@/lib/models';
import FeaturedBlogCard from './FeaturedBlogCard';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function FeaturedBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        setLoading(true);
        const featuredPosts = await getFeaturedBlogPosts(3);
        setPosts(featuredPosts);
      } catch (err) {
        console.error('Error fetching featured blog posts:', err);
        setError('Failed to load featured posts.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-xl">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // If there are no featured posts, try to get regular posts
  if (posts.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <FeaturedBlogCard key={post.id} post={post} index={index} />
        ))}
      </div>
      
      <div className="mt-8 flex justify-center">
        <Link href="/blog">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-white text-blue-600 rounded-full font-medium border border-blue-200 hover:shadow-md transition-all flex items-center gap-2"
          >
            View All Blog Posts
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </motion.button>
        </Link>
      </div>
    </div>
  );
} 