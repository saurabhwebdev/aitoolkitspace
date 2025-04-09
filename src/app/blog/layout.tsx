import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | AIToolKit.space",
  description: "Read the latest articles, guides, and insights about AI tools and technologies.",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 