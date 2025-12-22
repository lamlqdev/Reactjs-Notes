import { createAsyncThunk } from "@reduxjs/toolkit";
import { Article, ArticlesResponse } from "../../types";
import { newsApi } from "../../services/newsApi";

export const fetchArticles = createAsyncThunk(
  "articles/fetchArticles",
  async (
    params: {
      page: number;
      pageSize: number;
      filters?: {
        search?: string;
        category?: string;
        sortBy?: "date" | "title" | "author";
      };
    },
    { rejectWithValue }
  ) => {
    try {
      // Gọi API
      const response: ArticlesResponse = await newsApi.fetchArticles(
        params.page,
        params.pageSize,
        params.filters
      );

      // Trả về data - sẽ được đưa vào action.payload trong fulfilled
      return response;
    } catch (error: any) {
      // Nếu có lỗi, rejectWithValue sẽ đưa error vào action.payload
      return rejectWithValue(error.message || "Failed to fetch articles");
    }
  }
);

export const fetchArticleById = createAsyncThunk(
  "articles/fetchArticleById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response: Article = await newsApi.fetchArticleById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch article");
    }
  }
);

export const searchArticles = createAsyncThunk(
  "articles/searchArticles",
  async (query: string, { rejectWithValue }) => {
    try {
      const response: Article[] = await newsApi.searchArticles(query);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to search articles");
    }
  }
);
