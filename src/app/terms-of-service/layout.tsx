import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | AIToolKit.space',
  description: 'Read our terms of service to understand the rules and guidelines for using AIToolKit.space.',
}

export default function TermsOfServiceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 