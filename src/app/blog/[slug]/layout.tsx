import type { Metadata } from "next";
import { getBlogPostBySlug } from "@/lib/firebase-services";

// Generate dynamic metadata based on the blog post
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Fetch the blog post data
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Post Not Found | AIToolKit.space",
      description: "The requested blog post could not be found.",
    };
  }

  return {
    title: `${post.title} | AIToolKit.space Blog`,
    description: post.summary || "Read this blog post from AIToolKit.space",
  };
}

export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 