import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../store";

// Base selector: Lấy toàn bộ articles state
const selectArticlesState = (state: RootState) => state.articles;

// 1. Selector lấy tất cả articles (memoized)
export const selectAllArticles = createSelector(
  [selectArticlesState],
  (articlesState) => articlesState.items
);

// 2. Selector lấy article theo ID (memoized với id)
// Cách sử dụng: selectArticleById(state, articleId)
export const selectArticleById = createSelector(
  [selectAllArticles, (_state: RootState, id: number) => id],
  (articles, id) => articles.find((article) => article.id === id)
);

// 3. Selector lấy loading state
export const selectArticlesLoading = createSelector(
  [selectArticlesState],
  (articlesState) => articlesState.loading
);

// 4. Selector lấy error state
export const selectArticlesError = createSelector(
  [selectArticlesState],
  (articlesState) => articlesState.error
);

// 5. Selector lấy pagination info
export const selectArticlesPagination = createSelector(
  [selectArticlesState],
  (articlesState) => articlesState.pagination
);

// 6. Selector lấy số lượng articles
export const selectArticlesCount = createSelector(
  [selectAllArticles],
  (articles) => articles.length
);

// 7. Selector lọc articles theo category (nếu cần, có thể kết hợp với filters sau)
// Ví dụ: selectArticlesByCategory(state, 'Công nghệ')
export const selectArticlesByCategory = createSelector(
  [selectAllArticles, (category: string) => category],
  (articles, category) =>
    category === "Tất cả"
      ? articles
      : articles.filter((article) => article.category === category)
);
