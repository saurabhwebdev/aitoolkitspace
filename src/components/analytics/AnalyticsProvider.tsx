'use client';

import { ReactNode } from 'react';
import { usePageAnalytics } from '@/hooks/usePageAnalytics';

interface AnalyticsProviderProps {
  children: ReactNode;
}

export default function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  // Use the hook to track page views
  usePageAnalytics();
  
  // Just render children, the hook handles the tracking
  return <>{children}</>;
} 