export interface Author {
  name: string;
  role: string;
  avatar?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: Author;
  status: 'published' | 'draft';
  readTime: string;
  views: number;
  createdAt: string;
  updatedAt?: string;
}

export interface PostFormData {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  coverImage: string;
  tags: string;
  authorName: string;
  authorRole: string;
  status: 'published' | 'draft';
}
