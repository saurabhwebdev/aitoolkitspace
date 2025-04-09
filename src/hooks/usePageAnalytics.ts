'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { pageview } from '@/lib/analytics';

// The base version that doesn't use search params (more compatible)
export function usePageAnalyticsBase() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      // Track pageview with Google Analytics (pathname only)
      pageview(pathname);
    }
  }, [pathname]);
}

// The full version with search params that requires Suspense
export function usePageAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      // Construct the URL from pathname and search params
      const url = searchParams?.toString() 
        ? `${pathname}?${searchParams.toString()}`
        : pathname;
        
      // Track pageview with Google Analytics
      pageview(url);
    }
  }, [pathname, searchParams]);
} 