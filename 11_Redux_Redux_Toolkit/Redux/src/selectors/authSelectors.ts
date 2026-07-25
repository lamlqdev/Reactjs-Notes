import { RootState } from "../types";

export const selectIsAuthenticated = (state: RootState): boolean =>
  state.auth.isAuthenticated;
