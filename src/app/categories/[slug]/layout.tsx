import type { Metadata } from "next";

// Generate dynamic metadata based on the category
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Format the category name from the slug
  const categoryName = params.slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `${categoryName} AI Tools | AIToolKit.space`,
    description: `Discover the best AI tools for ${categoryName.toLowerCase()} in our comprehensive directory.`,
  };
}

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 