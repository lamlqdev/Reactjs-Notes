import React from 'react';
import { Link } from 'react-router-dom';
import type { Article } from '../../types';
import BookmarkButton from '../BookmarkButton/BookmarkButton';
import './ArticleCard.css';

interface ArticleCardProps {
  article: Article;
  isBookmarked?: boolean;
  onBookmarkToggle?: (articleId: number) => void;
  isRead?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  isBookmarked = false,
  onBookmarkToggle,
  isRead = false
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBookmarkToggle?.(article.id);
  };

  return (
    <Link
      to={`/article/${article.id}`}
      className={`article-card ${isRead ? 'article-card--read' : ''}`}
    >
      {article.imageUrl && (
        <div className="article-card__image-container">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="article-card__image"
          />
        </div>
      )}
      
      <div className="article-card__content">
        <div className="article-card__header">
          <span className="article-card__category">{article.category}</span>
          <span className="article-card__date">{formatDate(article.publishedAt)}</span>
        </div>

        <h2 className="article-card__title">{article.title}</h2>
        
        <p className="article-card__excerpt">{article.excerpt}</p>

        <div className="article-card__footer">
          <div className="article-card__meta">
            <span className="article-card__author">Tác giả: {article.author}</span>
            {article.source && (
              <span className="article-card__source">{article.source}</span>
            )}
          </div>
          
          {onBookmarkToggle && (
            <BookmarkButton
              isBookmarked={isBookmarked}
              onToggle={handleBookmarkClick}
              size="small"
            />
          )}
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;

