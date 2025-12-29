import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store/index.ts";

export const selectIsAuthenticated = createSelector(
  (state: RootState) => state.auth.isAuthenticated,
  (isAuthenticated) => isAuthenticated
);

export const selectUser = createSelector(
  (state: RootState) => state.auth.user,
  (user) => user
);
