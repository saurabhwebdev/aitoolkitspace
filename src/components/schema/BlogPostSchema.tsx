import { BlogPost } from '@/lib/models';

interface BlogPostSchemaProps {
  post: BlogPost;
}

export default function BlogPostSchema({ post }: BlogPostSchemaProps) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.summary || post.title,
    "image": post.imageUrl || undefined,
    "datePublished": post.createdAt?.toISOString() || new Date().toISOString(),
    "dateModified": post.updatedAt?.toISOString() || post.createdAt?.toISOString() || new Date().toISOString(),
    "author": {
      "@type": "Organization",
      "name": "AIToolKit.space",
      "url": "https://aitoolkit.space"
    },
    "publisher": {
      "@type": "Organization",
      "name": "AIToolKit.space",
      "url": "https://aitoolkit.space",
      "logo": {
        "@type": "ImageObject",
        "url": "https://aitoolkit.space/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://aitoolkit.space/blog/${post.slug}`
    },
    "keywords": post.tags?.join(", ") || ""
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
} 