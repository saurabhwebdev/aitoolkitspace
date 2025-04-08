import { Tool, ToolPricing } from '@/lib/models';

interface ToolSchemaProps {
  tool: Tool;
}

export default function ToolSchema({ tool }: ToolSchemaProps) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.name,
    "description": tool.description,
    "applicationCategory": "AIApplication",
    "operatingSystem": "Web",
    "url": `https://aitoolkit.space/tools/${tool.slug}`,
    "offers": {
      "@type": "Offer",
      "price": tool.pricing.includes(ToolPricing.FREE) ? "0" : undefined,
      "priceCurrency": "USD",
      "availability": "https://schema.org/OnlineOnly"
    },
    "aggregateRating": tool.rating ? {
      "@type": "AggregateRating",
      "ratingValue": tool.rating.toString(),
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "1"
    } : undefined,
    "image": tool.imageUrl || undefined,
    "potentialAction": {
      "@type": "ViewAction",
      "target": tool.websiteUrl
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
} 