import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'User Profile | AIToolKit.space',
  description: 'Manage your AIToolKit.space profile, preferences, and saved tools.',
}

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 