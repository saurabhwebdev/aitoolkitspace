import { Metadata } from "next";
import { getToolBySlug } from "@/lib/firebase-services";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Fetch tool data here
  const tool = await getToolBySlug(params.slug);
  
  if (!tool) {
    return {
      title: "Tool Not Found | AIToolKit.space",
      description: "The requested AI tool could not be found.",
    };
  }

  return {
    title: `${tool.name} - AI Tool | AIToolKit.space`,
    description: tool.description || `Discover ${tool.name}, a powerful AI tool for ${tool.category}.`,
    openGraph: {
      title: `${tool.name} - AI Tool | AIToolKit.space`,
      description: tool.description || `Discover ${tool.name}, a powerful AI tool for ${tool.category}.`,
      url: `https://aitoolkit.space/tools/${params.slug}`,
      images: tool.imageUrl ? [{ url: tool.imageUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tool.name} - AI Tool | AIToolKit.space`,
      description: tool.description || `Discover ${tool.name}, a powerful AI tool for ${tool.category}.`,
      images: tool.imageUrl ? [tool.imageUrl] : undefined,
    },
  };
} 