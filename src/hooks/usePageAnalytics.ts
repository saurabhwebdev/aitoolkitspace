import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { pageview } from '@/lib/analytics';

export function usePageAnalytics() {
  const pathname = usePathname();
  
  // Wrap useSearchParams in a try-catch to handle the case when it's used outside of a Suspense boundary
  let searchParams;
  try {
    searchParams = useSearchParams();
  } catch (error) {
    // If useSearchParams fails, use an empty string for search params
    searchParams = null;
  }

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