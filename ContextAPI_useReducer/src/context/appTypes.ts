export type Theme = 'light' | 'dark';
export type FontSize = 'small' | 'medium' | 'large';
export type Language = 'en' | 'vi';

export interface AppState {
  theme: Theme;
  primaryColor: string;
  fontSize: FontSize;
  sidebarCollapsed: boolean;
  headerVisible: boolean;
  language: Language;
  animationsEnabled: boolean;
}

export enum AppActionType {
  SET_THEME = 'SET_THEME',
  SET_PRIMARY_COLOR = 'SET_PRIMARY_COLOR',
  SET_FONT_SIZE = 'SET_FONT_SIZE',
  TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR',
  SET_SIDEBAR_COLLAPSED = 'SET_SIDEBAR_COLLAPSED',
  TOGGLE_HEADER = 'TOGGLE_HEADER',
  SET_HEADER_VISIBLE = 'SET_HEADER_VISIBLE',
  SET_LANGUAGE = 'SET_LANGUAGE',
  TOGGLE_ANIMATIONS = 'TOGGLE_ANIMATIONS',
  SET_ANIMATIONS_ENABLED = 'SET_ANIMATIONS_ENABLED',
}

export interface SetThemeAction {
  type: AppActionType.SET_THEME;
  payload: Theme;
}

export interface SetPrimaryColorAction {
  type: AppActionType.SET_PRIMARY_COLOR;
  payload: string;
}

export interface SetFontSizeAction {
  type: AppActionType.SET_FONT_SIZE;
  payload: FontSize;
}

export interface ToggleSidebarAction {
  type: AppActionType.TOGGLE_SIDEBAR;
}

export interface SetSidebarCollapsedAction {
  type: AppActionType.SET_SIDEBAR_COLLAPSED;
  payload: boolean;
}

export interface ToggleHeaderAction {
  type: AppActionType.TOGGLE_HEADER;
}

export interface SetHeaderVisibleAction {
  type: AppActionType.SET_HEADER_VISIBLE;
  payload: boolean;
}

export interface SetLanguageAction {
  type: AppActionType.SET_LANGUAGE;
  payload: Language;
}

export interface ToggleAnimationsAction {
  type: AppActionType.TOGGLE_ANIMATIONS;
}

export interface SetAnimationsEnabledAction {
  type: AppActionType.SET_ANIMATIONS_ENABLED;
  payload: boolean;
}

export type AppAction =
  | SetThemeAction
  | SetPrimaryColorAction
  | SetFontSizeAction
  | ToggleSidebarAction
  | SetSidebarCollapsedAction
  | ToggleHeaderAction
  | SetHeaderVisibleAction
  | SetLanguageAction
  | ToggleAnimationsAction
  | SetAnimationsEnabledAction;

