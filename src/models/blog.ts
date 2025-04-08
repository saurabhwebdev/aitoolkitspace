export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  authorName: string;
  authorEmail: string;
  imageUrl: string;
  tags: string[];
  relatedTools: string[];
  published: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
} 