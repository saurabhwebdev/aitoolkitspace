import { Timestamp } from 'firebase/firestore';

/**
 * Format a Firestore timestamp into a readable date string
 * @param timestamp Firestore timestamp to format
 * @returns Formatted date string (e.g., "Jan 1, 2023")
 */
export const formatDate = (timestamp: Timestamp): string => {
  if (!timestamp || !timestamp.toDate) {
    return 'N/A';
  }
  
  const date = timestamp.toDate();
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format a JavaScript Date object into a readable date string
 * @param date Date object to format
 * @returns Formatted date string (e.g., "Jan 1, 2023")
 */
export const formatDateFromJSDate = (date: Date): string => {
  if (!date) {
    return 'N/A';
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Generate a slug from a string by removing special characters and replacing spaces with hyphens
 * @param text The string to convert to a slug
 * @returns A URL-friendly slug
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Truncate a string to a specified length and add ellipsis if needed
 * @param text The string to truncate
 * @param maxLength Maximum length of the output string (including ellipsis)
 * @returns Truncated string
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  return text.slice(0, maxLength - 3) + '...';
};

/**
 * Get relative time string (e.g., "2 days ago") from a timestamp
 * @param timestamp Firestore timestamp or Date object
 * @returns Relative time string
 */
export const getRelativeTimeString = (timestamp: Timestamp | Date): string => {
  const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
  const now = new Date();
  
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  if (diffSecs < 60) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDays < 30) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  } else if (diffMonths < 12) {
    return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
  } else {
    return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
  }
}; 