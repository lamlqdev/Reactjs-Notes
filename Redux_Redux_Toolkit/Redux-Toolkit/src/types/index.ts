// Article types
export interface Article {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  category: string;
  imageUrl?: string;
  url?: string;
  source?: string;
}

// User types
export interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
}

// Filter types
export interface Filters {
  search: string;
  category: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy: 'date' | 'title' | 'author';
}

// Pagination types
export interface Pagination {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}

export interface ArticlesResponse {
  articles: Article[];
  pagination: Pagination;
}

