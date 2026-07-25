import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import articlesReducer from "../features/articles/articlesSlice";

export const rootReducer = combineReducers({
  auth: authReducer,
  articles: articlesReducer,
});
