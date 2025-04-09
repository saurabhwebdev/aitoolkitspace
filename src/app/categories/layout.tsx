import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Tool Categories | AIToolKit.space',
  description: 'Browse AI tools by category. Find the perfect AI solution for your specific needs.',
}

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 