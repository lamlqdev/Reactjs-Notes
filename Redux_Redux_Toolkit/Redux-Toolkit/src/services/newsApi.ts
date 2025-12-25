import type { Article, ArticlesResponse } from '../types';

const MOCK_ARTICLES: Article[] = [
  {
    id: 1,
    title: 'Công nghệ AI đang thay đổi thế giới',
    content: 'Trí tuệ nhân tạo đang trở thành xu hướng công nghệ hàng đầu...',
    excerpt: 'AI đang cách mạng hóa nhiều ngành công nghiệp',
    author: 'Nguyễn Văn A',
    publishedAt: '2024-01-15T10:00:00Z',
    category: 'Công nghệ',
    imageUrl: 'https://via.placeholder.com/800x400?text=AI+Technology',
    source: 'TechNews'
  },
  {
    id: 2,
    title: 'Kinh tế Việt Nam tăng trưởng ổn định',
    content: 'Nền kinh tế Việt Nam tiếp tục tăng trưởng mạnh mẽ...',
    excerpt: 'GDP tăng trưởng 6.5% trong quý đầu năm',
    author: 'Trần Thị B',
    publishedAt: '2024-01-14T09:00:00Z',
    category: 'Kinh tế',
    imageUrl: 'https://via.placeholder.com/800x400?text=Economy',
    source: 'Economic Times'
  },
  {
    id: 3,
    title: 'Đội tuyển Việt Nam giành chiến thắng',
    content: 'Đội tuyển bóng đá Việt Nam đã có chiến thắng quan trọng...',
    excerpt: 'Thắng 3-1 trước đối thủ mạnh',
    author: 'Lê Văn C',
    publishedAt: '2024-01-13T20:00:00Z',
    category: 'Thể thao',
    imageUrl: 'https://via.placeholder.com/800x400?text=Sports',
    source: 'Sports News'
  },
  {
    id: 4,
    title: 'Phim mới của đạo diễn nổi tiếng ra mắt',
    content: 'Bộ phim mới nhất của đạo diễn hàng đầu...',
    excerpt: 'Nhận được đánh giá tích cực từ giới phê bình',
    author: 'Phạm Thị D',
    publishedAt: '2024-01-12T15:00:00Z',
    category: 'Giải trí',
    imageUrl: 'https://via.placeholder.com/800x400?text=Entertainment',
    source: 'Entertainment Weekly'
  },
  {
    id: 5,
    title: 'Bí quyết sống khỏe mỗi ngày',
    content: 'Những thói quen đơn giản giúp bạn có sức khỏe tốt...',
    excerpt: '5 thói quen vàng cho sức khỏe',
    author: 'Hoàng Văn E',
    publishedAt: '2024-01-11T08:00:00Z',
    category: 'Sức khỏe',
    imageUrl: 'https://via.placeholder.com/800x400?text=Health',
    source: 'Health Magazine'
  },
  {
    id: 6,
    title: 'Giáo dục trực tuyến phát triển mạnh',
    content: 'Xu hướng học trực tuyến đang ngày càng phổ biến...',
    excerpt: 'Nhiều nền tảng giáo dục mới ra mắt',
    author: 'Vũ Thị F',
    publishedAt: '2024-01-10T14:00:00Z',
    category: 'Giáo dục',
    imageUrl: 'https://via.placeholder.com/800x400?text=Education',
    source: 'Education News'
  },
  {
    id: 7,
    title: '10 điểm đến du lịch đẹp nhất Việt Nam',
    content: 'Khám phá những địa điểm du lịch tuyệt vời...',
    excerpt: 'Danh sách các điểm đến không thể bỏ qua',
    author: 'Đỗ Văn G',
    publishedAt: '2024-01-09T11:00:00Z',
    category: 'Du lịch',
    imageUrl: 'https://via.placeholder.com/800x400?text=Travel',
    source: 'Travel Guide'
  },
  {
    id: 8,
    title: 'Công nghệ blockchain và tương lai',
    content: 'Blockchain đang mở ra nhiều cơ hội mới...',
    excerpt: 'Ứng dụng blockchain trong các lĩnh vực',
    author: 'Nguyễn Văn H',
    publishedAt: '2024-01-08T16:00:00Z',
    category: 'Công nghệ',
    imageUrl: 'https://via.placeholder.com/800x400?text=Blockchain',
    source: 'TechNews'
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const newsApi = {
  // Fetch articles với pagination và filters
  async fetchArticles(
    page: number = 1,
    pageSize: number = 10,
    filters?: {
      search?: string;
      category?: string;
      dateFrom?: string;
      dateTo?: string;
      sortBy?: 'date' | 'title' | 'author';
    }
  ): Promise<ArticlesResponse> {
    await delay(500);

    let filteredArticles = [...MOCK_ARTICLES];

    // Apply filters
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredArticles = filteredArticles.filter(
        article =>
          article.title.toLowerCase().includes(searchLower) ||
          article.content.toLowerCase().includes(searchLower) ||
          article.author.toLowerCase().includes(searchLower)
      );
    }

    if (filters?.category && filters.category !== 'Tất cả') {
      filteredArticles = filteredArticles.filter(
        article => article.category === filters.category
      );
    }

    // Sort
    if (filters?.sortBy) {
      filteredArticles.sort((a, b) => {
        switch (filters.sortBy) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'author':
            return a.author.localeCompare(b.author);
          case 'date':
          default:
            return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        }
      });
    }

    // Pagination
    const totalItems = filteredArticles.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedArticles = filteredArticles.slice(startIndex, endIndex);

    return {
      articles: paginatedArticles,
      pagination: {
        currentPage: page,
        totalPages,
        pageSize,
        totalItems
      }
    };
  },

  // Fetch single article by ID
  async fetchArticleById(id: number): Promise<Article> {
    await delay(300);
    const article = MOCK_ARTICLES.find(a => a.id === id);
    if (!article) {
      throw new Error(`Article with id ${id} not found`);
    }
    return article;
  },

  // Search articles
  async searchArticles(query: string): Promise<Article[]> {
    await delay(400);
    const queryLower = query.toLowerCase();
    return MOCK_ARTICLES.filter(
      article =>
        article.title.toLowerCase().includes(queryLower) ||
        article.content.toLowerCase().includes(queryLower) ||
        article.author.toLowerCase().includes(queryLower)
    );
  }
};

