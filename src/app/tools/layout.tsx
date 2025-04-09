import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Tools Directory | AIToolKit.space',
  description: 'Discover and explore the best AI tools for your needs. Browse our curated collection of AI-powered solutions.',
}

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 