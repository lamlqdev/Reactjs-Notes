import { LOGIN, LOGOUT } from "../constants/auth";
import { AuthAction } from "../types";

export const login = (): AuthAction => {
  return { type: LOGIN };
};

export const logout = (): AuthAction => {
  return { type: LOGOUT };
};

