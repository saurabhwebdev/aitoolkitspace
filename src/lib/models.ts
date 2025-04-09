import { Timestamp } from 'firebase/firestore';

// Tool categories
export enum ToolCategory {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  DATA = 'data',
  PRODUCTIVITY = 'productivity',
  CODING = 'coding',
  RESEARCH = 'research',
  EDUCATION = 'education',
  MARKETING = 'marketing',
  PROJECT_MANAGEMENT = 'project management',
  CUSTOMER_SUPPORT = 'customer support',
  OTHER = 'other'
}

// Tool pricing types
export enum ToolPricing {
  FREE = 'free',
  FREEMIUM = 'freemium',
  PAID = 'paid',
  SUBSCRIPTION = 'subscription',
  ENTERPRISE = 'enterprise'
}

// Tool status
export enum ToolStatus {
  ACTIVE = 'active',
  BETA = 'beta',
  DISCONTINUED = 'discontinued'
}

// Tool interface
export interface Tool {
  id?: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  imageUrl: string;
  websiteUrl: string;
  category: string;
  subcategory?: string;
  pricing: ToolPricing[];
  tags: string[];
  features: string[];
  pros?: string[];
  cons?: string[];
  alternatives?: string[];
  affiliateLink?: string;
  sponsored?: boolean;
  status: ToolStatus;
  featured?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  viewCount: number;
  rating?: number;
  ratingCount?: number;
}

// Blog post interface
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  imageUrl?: string;
  category?: string;
  tags: string[];
  author: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'DRAFT' | 'PUBLISHED';
  featured?: boolean;
}

// User interface (extended from Firebase User)
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isAdmin: boolean;
  isEditor?: boolean;
  createdAt: Timestamp | null;
  lastLoginAt: Timestamp | null;
}

// Category interface for category pages
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  featuredImage?: string;
  toolCount: number;
}

// Feedback submission
export interface Feedback {
  id?: string;
  type: 'bug' | 'feature' | 'content' | 'other';
  message: string;
  email?: string;
  toolId?: string;
  createdAt: Timestamp | null;
  status: 'new' | 'in-progress' | 'resolved' | 'closed';
  adminNotes?: string;
}

// Tool report
export interface ToolReport {
  id?: string;
  toolId: string;
  reason: 'broken' | 'misleading' | 'spam' | 'other';
  details: string;
  email?: string;
  createdAt: Timestamp | null;
  status: 'new' | 'reviewing' | 'resolved';
  adminNotes?: string;
}

// Bookmark
export interface Bookmark {
  id?: string;
  userId: string;
  toolId: string;
  toolName?: string;
  toolImageUrl?: string;
  notes?: string;
  createdAt: Timestamp;
}

// Contact form submission
export interface Contact {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Timestamp | null;
  status: 'new' | 'read' | 'replied' | 'closed';
} 