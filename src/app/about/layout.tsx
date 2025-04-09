import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us | AIToolKit.space',
  description: 'Learn about AIToolKit.space, our mission, and our team dedicated to making AI tools accessible to everyone.',
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 