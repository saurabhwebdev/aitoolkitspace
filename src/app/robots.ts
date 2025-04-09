import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',     // Disallow admin area
        '/api/',       // Disallow API routes
        '/private/',   // Any private sections
      ],
    },
    sitemap: 'https://aitoolkit.space/sitemap.xml',
  };
} 