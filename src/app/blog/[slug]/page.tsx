'use client';

import { useState, useEffect } from 'react';
import { getBlogPostBySlug } from '@/lib/firebase-services';
import { BlogPost } from '@/lib/models';
import { Timestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setLoading(true);
        console.log(`Fetching blog post with slug: ${slug}`);
        
        const blogPost = await getBlogPostBySlug(slug);
        
        if (blogPost) {
          console.log(`Found blog post: ${blogPost.title}`);
          setPost(blogPost);
        } else {
          console.error(`Blog post with slug ${slug} not found`);
          setError('Blog post not found.');
        }
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Failed to load blog post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBlogPost();
    }
  }, [slug]);

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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Blog Post Not Found</h1>
            <p className="text-gray-600 mb-6">
              {error || 'The blog post you are looking for could not be found.'}
            </p>
            <Link href="/blog">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Back to Blog
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Function to check if content is plain text and needs formatting
  const formatPlainTextContent = (content: string): string => {
    if (!content) return '';
    
    // If already has HTML or markdown formatting, return as is
    if (content.includes('<') || content.includes('#') || content.includes('**')) {
      return content;
    }
    
    // Add markdown formatting to plain text
    let formattedContent = content;
    
    // Split into paragraphs and process each
    const paragraphs = formattedContent.split('\n\n');
    
    return paragraphs.map(paragraph => {
      // Check if it's a heading (ends with a colon and is short)
      if (paragraph.endsWith(':') && paragraph.length < 100) {
        return `## ${paragraph}`;
      }
      
      // Check if it looks like a heading (short and no punctuation in the end)
      if (paragraph.length < 80 && 
          !paragraph.endsWith('.') && 
          !paragraph.endsWith('?') && 
          !paragraph.endsWith('!') &&
          !paragraph.includes('\n')) {
        return `## ${paragraph}`;
      }
      
      return paragraph;
    }).join('\n\n');
  };

  // Define markdown components
  const markdownComponents: Components = {
    h1: ({children, ...props}) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props}>{children}</h1>,
    h2: ({children, ...props}) => <h2 className="text-2xl font-bold mt-6 mb-3" {...props}>{children}</h2>,
    h3: ({children, ...props}) => <h3 className="text-xl font-semibold mt-5 mb-2" {...props}>{children}</h3>,
    p: ({children, ...props}) => <p className="mb-4 leading-relaxed" {...props}>{children}</p>,
    ul: ({children, ...props}) => <ul className="list-disc pl-6 mb-4" {...props}>{children}</ul>,
    ol: ({children, ...props}) => <ol className="list-decimal pl-6 mb-4" {...props}>{children}</ol>,
    li: ({children, ...props}) => <li className="mb-1" {...props}>{children}</li>,
    a: ({children, ...props}) => <a className="text-blue-600 hover:text-blue-800 underline" {...props}>{children}</a>,
    blockquote: ({children, ...props}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-700" {...props}>{children}</blockquote>,
    code: ({children, className, ...props}) => {
      // Check if it's inline code (no className) or a code block
      const isInline = !className;
      return isInline 
        ? <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>
        : <code className="block bg-gray-100 p-4 rounded-md my-4 overflow-x-auto text-sm font-mono" {...props}>{children}</code>;
    },
    pre: ({children, ...props}) => <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto my-4" {...props}>{children}</pre>,
    img: ({alt, src, ...props}) => <img src={src} alt={alt} className="rounded-md my-6 mx-auto" {...props} />
  };

  return (
    <div className="min-h-screen pt-20 px-4 pb-16 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-8">
          <Link href="/blog">
            <span className="text-blue-600 hover:text-blue-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Blog
            </span>
          </Link>
        </div>

        {/* Featured Image */}
        {post.imageUrl && (
          <div className="mb-8 rounded-xl overflow-hidden shadow-md">
            <img 
              src={post.imageUrl} 
              alt={post.title} 
              className="w-full h-[400px] object-cover"
              onError={(e) => {
                // Replace broken images with fallback
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = '/images/blog-placeholder.jpg';
              }}
            />
          </div>
        )}

        {/* Blog Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center text-gray-600 mb-4">
            <span className="mr-4">{formatDate(post.createdAt)}</span>
            {post.category && (
              <>
                <span className="mr-4">•</span>
                <span className="mr-4">{post.category}</span>
              </>
            )}
            <span>By {post.author}</span>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Blog Content */}
        <div className="bg-white p-8 rounded-xl shadow-sm">
          <div className="prose prose-lg max-w-none">
            {/* Check if content looks like HTML */}
            {post.content && post.content.includes('<') ? (
              // Use dangerouslySetInnerHTML for HTML content
              <div dangerouslySetInnerHTML={{ __html: post.content }} className="blog-content" />
            ) : (
              // Use ReactMarkdown for markdown content or format plain text
              <ReactMarkdown components={markdownComponents}>
                {formatPlainTextContent(post.content)}
              </ReactMarkdown>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 