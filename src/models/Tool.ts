export enum ToolCategory {
  AI_CHAT = 'AI Chat',
  AI_WRITING = 'AI Writing',
  AI_IMAGE = 'AI Image',
  AI_VIDEO = 'AI Video',
  AI_AUDIO = 'AI Audio',
  AI_CODE = 'AI Code',
  AI_DATA = 'AI Data',
  AI_OTHER = 'AI Other'
}

export enum PricingType {
  FREE = 'Free',
  FREEMIUM = 'Freemium',
  PAID = 'Paid',
  CONTACT = 'Contact'
}

export enum ToolStatus {
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
  ARCHIVED = 'Archived'
}

export interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  websiteUrl: string;
  category: ToolCategory;
  pricing: PricingType;
  status: ToolStatus;
  tags: string[];
  features: string[];
  pros: string[];
  cons: string[];
  alternatives: string[];
  image: string;
  createdAt: Date;
  updatedAt: Date;
} 