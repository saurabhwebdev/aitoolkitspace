import type { Metadata } from "next";
import { getToolBySlug } from "@/lib/firebase-services";

// Generate dynamic metadata based on the tool
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Fetch the tool data
  const tool = await getToolBySlug(params.slug);

  if (!tool) {
    return {
      title: "Tool Not Found | AIToolKit.space",
      description: "The requested AI tool could not be found.",
    };
  }

  return {
    title: `${tool.name} | AI Tools | AIToolKit.space`,
    description: tool.description || "Explore this AI tool and discover its features and capabilities.",
  };
}

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 