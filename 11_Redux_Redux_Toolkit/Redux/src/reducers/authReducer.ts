import { LOGIN, LOGOUT } from "../constants/auth";
import { AuthState, AuthAction } from "../types";

const initialState: AuthState = {
  isAuthenticated: false,
};

export const authReducer = (
  state: AuthState = initialState,
  action: AuthAction
): AuthState => {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        isAuthenticated: true,
      };
    case LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
      };
    default:
      return state;
  }
};
