import { MetadataRoute } from 'next';
import { getAllTools, getToolsCount, getBlogPosts } from '@/lib/firebase-services';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BlogPost, Tool } from '@/lib/models';

// Cache the sitemap result for better performance
let cachedSitemap: MetadataRoute.Sitemap | null = null;
let lastCacheTime: number = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

// Helper function to get all tools specifically for sitemap
async function getAllToolsForSitemap(): Promise<Tool[]> {
  try {
    console.log('Fetching all tools for sitemap directly from database...');
    const toolsRef = collection(db, 'tools');
    const snapshot = await getDocs(toolsRef);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Tool;
    });
  } catch (error) {
    console.error('Error fetching all tools for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Return cached sitemap if it's still valid
  const now = Date.now();
  if (cachedSitemap && lastCacheTime + CACHE_TTL > now) {
    console.log('Using cached sitemap');
    return cachedSitemap;
  }

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
  
  // Get tools directly with a single database query instead of using pagination
  console.time('Tools sitemap generation');
  const allTools = await getAllToolsForSitemap();
  
  const toolSitemap: MetadataRoute.Sitemap = allTools
    .filter(tool => tool.slug) // Make sure tools have slugs
    .map((tool) => ({
      url: `${baseUrl}/tools/${tool.slug}`,
      lastModified: tool.updatedAt instanceof Date 
        ? tool.updatedAt 
        : tool.createdAt instanceof Date 
          ? tool.createdAt 
          : new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  console.timeEnd('Tools sitemap generation');
  console.log(`Added ${toolSitemap.length} tools to sitemap`);
  
  // Dynamic blog pages
  console.time('Blog sitemap generation');
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
    console.log(`Added ${blogSitemap.length} blog posts to sitemap`);
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
  }
  console.timeEnd('Blog sitemap generation');
  
  // Combine all routes
  const result = [...staticPages, ...toolSitemap, ...blogSitemap];
  
  // Update cache
  cachedSitemap = result;
  lastCacheTime = now;
  
  return result;
} 