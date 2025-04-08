import { MetadataRoute } from 'next';
import { getAllTools } from '@/lib/firebase-services';
import { getBlogPosts } from '@/lib/firebase-services';
import { BlogPost } from '@/lib/models';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URL
  const baseUrl = 'https://aitoolkit.space';
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
  
  // Dynamic tool pages
  const tools = await getAllTools();
  const toolSitemap: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: tool.updatedAt instanceof Date 
      ? tool.updatedAt 
      : tool.createdAt instanceof Date 
        ? tool.createdAt 
        : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));
  
  // Dynamic blog pages
  let blogSitemap: MetadataRoute.Sitemap = [];
  try {
    const blogPosts = await getBlogPosts();
    blogSitemap = blogPosts
      .filter((post: BlogPost) => post.status === 'PUBLISHED')
      .map((post: BlogPost) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt || post.createdAt || new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      }));
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
  }
  
  // Combine all routes
  return [...staticPages, ...toolSitemap, ...blogSitemap];
} 