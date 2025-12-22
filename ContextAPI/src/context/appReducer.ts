import { AppState, AppAction, AppActionType } from "./appTypes";

export const initialState: AppState = {
  theme: "light",
  primaryColor: "#3b82f6",
  fontSize: "medium",
  sidebarCollapsed: false,
  headerVisible: true,
  language: "en",
  animationsEnabled: true,
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case AppActionType.SET_THEME:
      return { ...state, theme: action.payload };

    case AppActionType.SET_PRIMARY_COLOR:
      return { ...state, primaryColor: action.payload };

    case AppActionType.SET_FONT_SIZE:
      return { ...state, fontSize: action.payload };

    case AppActionType.TOGGLE_SIDEBAR:
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };

    case AppActionType.SET_SIDEBAR_COLLAPSED:
      return { ...state, sidebarCollapsed: action.payload };

    case AppActionType.TOGGLE_HEADER:
      return { ...state, headerVisible: !state.headerVisible };

    case AppActionType.SET_HEADER_VISIBLE:
      return { ...state, headerVisible: action.payload };

    case AppActionType.SET_LANGUAGE:
      return { ...state, language: action.payload };

    case AppActionType.TOGGLE_ANIMATIONS:
      return { ...state, animationsEnabled: !state.animationsEnabled };

    case AppActionType.SET_ANIMATIONS_ENABLED:
      return { ...state, animationsEnabled: action.payload };

    default:
      const _exhaustiveCheck: never = action;
      return _exhaustiveCheck;
  }
}
