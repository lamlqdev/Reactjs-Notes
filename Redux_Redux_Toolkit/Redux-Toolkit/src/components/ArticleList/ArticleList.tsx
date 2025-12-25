import React from 'react';
import type { Article } from '../../types';
import ArticleCard from './ArticleCard';
import './ArticleList.css';

interface ArticleListProps {
  articles: Article[];
  onBookmarkToggle?: (articleId: number) => void;
  bookmarkedIds?: number[];
  readArticleIds?: number[];
  loading?: boolean;
}

const ArticleList: React.FC<ArticleListProps> = ({
  articles,
  onBookmarkToggle,
  bookmarkedIds = [],
  readArticleIds = []
}) => {
  if (articles.length === 0) {
    return (
      <div className="article-list__empty">
        <p>Không tìm thấy bài viết nào.</p>
      </div>
    );
  }

  return (
    <div className="article-list">
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          isBookmarked={bookmarkedIds.includes(article.id)}
          isRead={readArticleIds.includes(article.id)}
          onBookmarkToggle={onBookmarkToggle}
        />
      ))}
    </div>
  );
};

export default ArticleList;

