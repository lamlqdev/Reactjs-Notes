import React, { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar/SearchBar";
import FilterPanel from "../components/FilterPanel/FilterPanel";
import ArticleList from "../components/ArticleList/ArticleList";
import Pagination from "../components/Pagination/Pagination";

import "./HomePage.css";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchArticles } from "../features/articles/articlesApi";
import {
  selectAllArticles,
  selectArticlesLoading,
  selectArticlesError,
  selectArticlesPagination,
} from "../features/articles/articlesSelectors";

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();

  // Sử dụng selectors từ Redux
  const articles = useAppSelector(selectAllArticles);
  const loading = useAppSelector(selectArticlesLoading);
  const error = useAppSelector(selectArticlesError);
  const pagination = useAppSelector(selectArticlesPagination);

  // Filter states - Local state (vì không có filters slice)
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [sortBy, setSortBy] = useState<"date" | "title" | "author">("date");

  // Fetch articles khi filters hoặc pagination thay đổi
  useEffect(() => {
    dispatch(
      fetchArticles({
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        filters: {
          search: searchQuery,
          category: category !== "Tất cả" ? category : undefined,
          sortBy: sortBy,
        },
      })
    );
  }, [
    dispatch,
    pagination.currentPage,
    pagination.pageSize,
    searchQuery,
    category,
    sortBy,
  ]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Reset về trang 1 khi search - dispatch trực tiếp để tránh useEffect chạy 2 lần
    dispatch(
      fetchArticles({
        page: 1,
        pageSize: pagination.pageSize,
        filters: {
          search: query,
          category: category !== "Tất cả" ? category : undefined,
          sortBy: sortBy,
        },
      })
    );
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    // Reset về trang 1 khi đổi category
    dispatch(
      fetchArticles({
        page: 1,
        pageSize: pagination.pageSize,
        filters: {
          search: searchQuery,
          category: newCategory !== "Tất cả" ? newCategory : undefined,
          sortBy: sortBy,
        },
      })
    );
  };

  const handleSortChange = (newSortBy: "date" | "title" | "author") => {
    setSortBy(newSortBy);
    // Fetch lại với sort mới
    dispatch(
      fetchArticles({
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        filters: {
          search: searchQuery,
          category: category !== "Tất cả" ? category : undefined,
          sortBy: newSortBy,
        },
      })
    );
  };

  const handlePageChange = (page: number) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    dispatch(
      fetchArticles({
        page: page,
        pageSize: pagination.pageSize,
        filters: {
          search: searchQuery,
          category: category !== "Tất cả" ? category : undefined,
          sortBy: sortBy,
        },
      })
    );
  };

  return (
    <div className="home-page">
      <header className="home-page__header">
        <div className="container">
          <h1 className="home-page__title">Tin Tức Mới Nhất</h1>
          <SearchBar onSearch={handleSearch} />
        </div>
      </header>

      <main className="home-page__main">
        <div className="container">
          <FilterPanel
            category={category}
            sortBy={sortBy}
            onCategoryChange={handleCategoryChange}
            onSortChange={handleSortChange}
          />

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : (
            <>
              <ArticleList articles={articles} />

              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
