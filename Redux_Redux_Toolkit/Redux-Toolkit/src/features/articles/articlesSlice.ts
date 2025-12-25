import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Article, Pagination } from "../../types";
import { fetchArticles, fetchArticleById, searchArticles } from "./articlesApi";

export interface ArticlesState {
  items: Article[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
}

const initialState: ArticlesState = {
  items: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalItems: 0,
  },
};

const articlesSlice = createSlice({
  name: "articles",
  initialState,
  reducers: {
    setArticles: (state, action: PayloadAction<Article[]>) => {
      state.items = action.payload;
    },
    addArticle: (state, action: PayloadAction<Article>) => {
      state.items.push(action.payload);
    },
    updateArticle: (state, action: PayloadAction<Article>) => {
      const index = state.items.findIndex(
        (article) => article.id === action.payload.id
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removeArticle: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(
        (article) => article.id !== action.payload
      );
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setPagination: (state, action: PayloadAction<Pagination>) => {
      state.pagination = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Xử lý khi fetchArticles.pending (bắt đầu fetch)
      .addCase(fetchArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // Xử lý khi fetchArticles.fulfilled (thành công)
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload chính là data bạn return từ async function
        state.items = action.payload.articles;
        state.pagination = action.payload.pagination;
        state.error = null;
      })

      // Xử lý khi fetchArticles.rejected (thất bại)
      .addCase(fetchArticles.rejected, (state, action) => {
        state.loading = false;
        // action.payload là error message từ rejectWithValue
        state.error = (action.payload as string) || "Failed to fetch articles";
      })

      .addCase(fetchArticleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArticleById.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
        state.error = null;
      })
      .addCase(fetchArticleById.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch article";
      })

      .addCase(searchArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(searchArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to search articles";
      });
  },
});

export const {
  setArticles,
  addArticle,
  updateArticle,
  removeArticle,
  setLoading,
  setError,
  setPagination,
} = articlesSlice.actions;
export default articlesSlice.reducer;
