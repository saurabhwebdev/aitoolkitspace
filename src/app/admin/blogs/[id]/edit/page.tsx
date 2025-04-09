'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getBlogPostById, updateBlogPost, uploadImage } from '@/lib/firebase-services';
import { BlogPost } from '@/lib/models';
import { generateSlug } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { ImageUpload } from '@/components/common/ImageUpload';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface BlogFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  authorName: string;
  authorEmail: string;
  imageUrl: string;
  tags: string[];
  relatedTools: string[];
  published: boolean;
  featured: boolean;
  summary: string;
  author: string;
  category: string;
}

// Split into two components to avoid direct params access
export default function EditBlogPage({ params }: { params: { id: string } }) {
  // The correct way to access id from params in Next.js client components
  // is to pass it directly to a child component
  return <EditBlog id={params.id} />;
}

// Inner component that contains all the logic but doesn't directly access params
function EditBlog({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [blogId] = useState<string>(id);
  
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    authorName: '',
    authorEmail: '',
    imageUrl: '',
    tags: [],
    relatedTools: [],
    published: false,
    featured: false,
    summary: '',
    author: '',
    category: ''
  });

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        console.log('Fetching blog with ID:', blogId);
        // Get blog post from either collection using the updated getBlogPostById function
        const blog = await getBlogPostById(blogId);
        
        if (blog) {
          console.log('Blog found:', blog);
          setFormData({
            title: blog.title || '',
            slug: blog.slug || '',
            content: blog.content || '',
            excerpt: blog.summary || '',
            authorName: blog.author || '',
            authorEmail: '',
            imageUrl: blog.imageUrl || '',
            tags: blog.tags || [],
            relatedTools: [],
            published: blog.status === 'PUBLISHED',
            featured: blog.featured || false,
            summary: blog.summary || '',
            author: blog.author || '',
            category: blog.category || ''
          });
        } else {
          console.error('Blog not found with ID:', blogId);
          setError('Blog post not found');
        }
      } catch (err) {
        console.error('Error fetching blog:', err);
        setError('Failed to load blog data');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [blogId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
    } else if (name === 'title' && formData.slug === '') {
      // Auto-generate slug from title if slug is empty
      const slug = generateSlug(value);
      setFormData(prev => ({ ...prev, [name]: value, slug }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const arrayValue = value.split(',').map(item => item.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, [name]: arrayValue }));
  };

  const handleImageUploadComplete = (url: string) => {
    setFormData(prev => ({ ...prev, imageUrl: url }));
  };

  const handleImageUploadError = (error: string) => {
    setError(error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!formData.title || !formData.author || !formData.summary || !formData.content || !formData.category) {
        throw new Error('Please fill in all required fields');
      }

      // Update the blog post - no need to handle image upload separately
      // as it's handled by the ImageUpload component
      const blogData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.title!),
        tags: formData.tags || [],
        relatedTools: formData.relatedTools || [],
        status: formData.published ? 'PUBLISHED' : 'DRAFT'
      };
      
      await updateBlogPost(blogId, blogData as any);
      setSuccess(true);
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Error updating blog post:', err);
      setError(err.message || 'Failed to update blog post. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Edit Blog Post</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Blog post updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              Slug
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              placeholder="auto-generated from title if empty"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              placeholder="e.g., AI News, Tutorials, Opinion"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
              Author *
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="authorEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Author Email
            </label>
            <input
              type="email"
              id="authorEmail"
              name="authorEmail"
              value={formData.authorEmail}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
              Summary *
            </label>
            <input
              type="text"
              id="summary"
              name="summary"
              value={formData.summary}
              onChange={handleInputChange}
              required
              placeholder="A brief summary of the blog post (for SEO and previews)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              You can use Markdown for formatting. HTML tags are also supported.
            </p>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags?.join(', ')}
              onChange={handleArrayInputChange}
              placeholder="Comma-separated values (e.g., AI, Machine Learning, GPT-4)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="relatedTools" className="block text-sm font-medium text-gray-700 mb-1">
              Related Tools
            </label>
            <input
              type="text"
              id="relatedTools"
              name="relatedTools"
              value={formData.relatedTools?.join(', ')}
              onChange={handleArrayInputChange}
              placeholder="Comma-separated tool IDs"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Featured Image
            </label>
            <ImageUpload
              onUploadComplete={handleImageUploadComplete}
              onUploadError={handleImageUploadError}
              currentImageUrl={formData.imageUrl}
              className="mb-2"
            />
            <p className="text-xs text-gray-500 mt-1">Recommended: 1200x630px for optimal social sharing</p>
          </div>

          <div className="md:col-span-2 flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="published"
                name="published"
                checked={formData.published}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
                Published
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                Featured Post
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
} 