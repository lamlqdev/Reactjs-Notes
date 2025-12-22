import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchArticleById } from "../features/articles/articlesApi";
import {
  selectArticleById,
  selectArticlesLoading,
  selectArticlesError,
} from "../features/articles/articlesSelectors";
import "./ArticleDetailPage.css";

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  // Lấy article từ Redux state
  const articleId = id ? parseInt(id) : 0;
  const article = useAppSelector((state) =>
    selectArticleById(state, articleId)
  );
  const loading = useAppSelector(selectArticlesLoading);
  const error = useAppSelector(selectArticlesError);

  useEffect(() => {
    if (id && articleId) {
      // Kiểm tra xem article đã có trong state chưa
      // Nếu chưa có thì fetch
      if (!article) {
        dispatch(fetchArticleById(articleId));
      }
    }
  }, [id, articleId, dispatch, article]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="article-detail-page">
        <div className="container">
          <div className="loading">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="article-detail-page">
        <div className="container">
          <div className="error-message">
            <p>{error || "Không tìm thấy bài viết"}</p>
            <Link to="/" className="back-link">
              ← Quay về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="article-detail-page">
      <div className="container">
        <Link to="/" className="back-button">
          ← Quay lại
        </Link>

        <article className="article-detail">
          <header className="article-detail__header">
            <div className="article-detail__meta">
              <span className="article-detail__category">
                {article.category}
              </span>
              <span className="article-detail__date">
                {formatDate(article.publishedAt)}
              </span>
            </div>

            <h1 className="article-detail__title">{article.title}</h1>

            <div className="article-detail__author-info">
              <span className="article-detail__author">
                Tác giả: {article.author}
              </span>
              {article.source && (
                <span className="article-detail__source">
                  Nguồn: {article.source}
                </span>
              )}
            </div>
          </header>

          {article.imageUrl && (
            <div className="article-detail__image-container">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="article-detail__image"
              />
            </div>
          )}

          <div className="article-detail__content">
            <p className="article-detail__excerpt">{article.excerpt}</p>
            <div className="article-detail__body">
              {article.content.split("\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default ArticleDetailPage;
