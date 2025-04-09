import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | AIToolKit.space',
  description: 'Learn about how AIToolKit.space collects, uses, and protects your personal information.',
}

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 