'use client';

import { Suspense } from 'react';
import { usePageAnalytics } from '@/hooks/usePageAnalytics';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

// Separate component that uses the hook
function AnalyticsTracker() {
  usePageAnalytics();
  return null;
}

export default function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  return (
    <>
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
      {children}
    </>
  );
} 