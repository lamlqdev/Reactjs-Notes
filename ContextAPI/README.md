# Dashboard Preferences Manager

Ứng dụng demo quản lý UI preferences sử dụng **Context API** kết hợp với **useReducer** trong React + TypeScript.

## Core Terminology

### Context API

**Context API** là một tính năng của React cho phép chia sẻ state giữa các components mà không cần truyền props qua nhiều cấp (prop drilling).

#### Các khái niệm cốt lõi

##### 1. Context

- Một object đặc biệt trong React dùng để chia sẻ state
- Được tạo bằng `createContext()`
- Mỗi Context có một **Provider** và nhiều **Consumer**

```typescript
const AppContext = createContext<AppContextValue | undefined>(undefined);
```

##### 2. Provider

- Component cung cấp giá trị cho Context
- Wrap các components con cần access vào Context
- Nhận prop `value` chứa dữ liệu muốn chia sẻ

```typescript
<AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
```

##### 3. Consumer

- Component hoặc Hook sử dụng giá trị từ Context
- Có 2 cách:
  - **Hook `useContext()`**: Cách hiện đại, được khuyến nghị
  - **Component `<Context.Consumer>`**: Cách cũ, ít dùng

```typescript
const { state, dispatch } = useContext(AppContext);
```

##### 4. Context Value

- Giá trị được cung cấp bởi Provider
- Có thể là bất kỳ kiểu dữ liệu nào (object, array, function, etc.)
- Trong project này: `{ state, dispatch }`

#### Luồng hoạt động của Context API

```text
1. Tạo Context → createContext()
2. Tạo Provider → wrap components cần dùng
3. Components con → useContext() để lấy giá trị
4. Update state → dispatch actions → reducer xử lý
```

---

### useReducer

**useReducer** là một Hook của React dùng để quản lý state phức tạp, thay thế cho `useState` khi logic state phức tạp hơn.

#### Cú pháp

```typescript
const [state, dispatch] = useReducer(reducer, initialState);
```

#### Các thành phần

##### 1. State

- Dữ liệu hiện tại của component
- Được khởi tạo từ `initialState`
- Chỉ thay đổi thông qua `dispatch`

```typescript
const initialState: AppState = {
  theme: "light",
  primaryColor: "#3b82f6",
  // ...
};
```

##### 2. Dispatch

- Function để trigger state update
- Nhận một **action object** làm tham số
- Gọi reducer function với state hiện tại và action

```typescript
dispatch({ type: AppActionType.SET_THEME, payload: "dark" });
```

##### 3. Reducer

- Pure function nhận `(state, action)` và return state mới
- **KHÔNG** mutate state cũ, luôn return state mới
- **KHÔNG** có side effects (API calls, timers, etc.)
- Xử lý logic dựa trên `action.type`

```typescript
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case AppActionType.SET_THEME:
      return { ...state, theme: action.payload };
    default:
      return state;
  }
}
```

##### 4. Action object

- Object mô tả "điều gì đã xảy ra"
- Có 2 phần:
  - `type`: Loại action (bắt buộc)
  - `payload`: Dữ liệu kèm theo (tùy chọn)

```typescript
// Action với payload
{ type: AppActionType.SET_THEME, payload: 'dark' }

// Action không có payload
{ type: AppActionType.TOGGLE_SIDEBAR }
```

#### Luồng hoạt động của useReducer

```text
1. User interaction → dispatch(action)
2. Reducer nhận (currentState, action)
3. Reducer xử lý logic → return newState
4. Component re-render với state mới
```

#### So sánh useReducer vs useState

| useReducer                    | useState                      |
| ----------------------------- | ----------------------------- |
| Phù hợp với state phức tạp    | Phù hợp với state đơn giản    |
| Logic tập trung trong reducer | Logic rải rác trong component |
| Dễ test và debug              | Khó test khi logic phức tạp   |
| Có thể tối ưu performance     | Đơn giản hơn cho state nhỏ    |

---

### Cấu trúc Project

```text
src/
├── context/
│   ├── AppContext.tsx      # Context và Provider
│   ├── appReducer.ts        # Reducer function
│   └── appTypes.ts          # TypeScript types
├── hooks/
│   └── useAppContext.ts     # Custom hook
├── components/
│   ├── Header.tsx           # Header component
│   ├── Sidebar.tsx          # Sidebar component
│   ├── SettingsPanel.tsx    # Settings panel
│   └── Preview.tsx          # Preview component
├── App.tsx                  # Root component
├── main.tsx                 # Entry point
└── index.css                # Global styles
```

---

### Step-by-step Implementation

#### Bước 1: Định nghĩa State Structure

**File: `src/context/appTypes.ts`**

Định nghĩa cấu trúc state và các action types:

```typescript
// State structure
export interface AppState {
  theme: Theme;
  primaryColor: string;
  fontSize: FontSize;
  sidebarCollapsed: boolean;
  headerVisible: boolean;
  language: Language;
  animationsEnabled: boolean;
}

// Action types (enum hoặc string literals)
export enum AppActionType {
  SET_THEME = 'SET_THEME',
  SET_PRIMARY_COLOR = 'SET_PRIMARY_COLOR',
  // ...
}

// Action payloads
export interface SetThemeAction {
  type: AppActionType.SET_THEME;
  payload: Theme;
}

// Union type cho tất cả actions
export type AppAction = SetThemeAction | SetPrimaryColorAction | ...;
```

**Tại sao cần:**

- Type safety với TypeScript
- Dễ maintain và refactor
- IDE autocomplete tốt hơn

---

#### Bước 2: Tạo Reducer Function

**File: `src/context/appReducer.ts`**

Tạo reducer function xử lý state updates:

```typescript
export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case AppActionType.SET_THEME:
      return { ...state, theme: action.payload };

    case AppActionType.TOGGLE_SIDEBAR:
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };

    default:
      return state;
  }
}
```

**Nguyên tắc quan trọng:**

- **Pure function**: Không có side effects
- **Immutable**: Không mutate state cũ, luôn return state mới
- **Exhaustive**: Handle tất cả action types

---

#### Bước 3: Tạo Context và Provider

**File: `src/context/AppContext.tsx`**

```typescript
// 1. Định nghĩa Context Value type
export interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

// 2. Tạo Context
export const AppContext = createContext<AppContextValue | undefined>(undefined);

// 3. Tạo Provider component
export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const value: AppContextValue = {
    state,
    dispatch,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
```

**Luồng hoạt động:**

1. `useReducer` quản lý state
2. Provider cung cấp `{ state, dispatch }` cho children
3. Components con có thể access qua `useContext`

---

#### Bước 4: Tạo Custom Hook

**File: `src/hooks/useAppContext.ts`**

```typescript
export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error("useAppContext must be used within AppProvider");
  }

  return context;
}
```

**Lợi ích:**

- Type-safe access
- Error handling nếu dùng ngoài Provider
- Code ngắn gọn hơn `useContext(AppContext)`

---

#### Bước 5: Wrap App với Provider

**File: `src/App.tsx`**

```typescript
function App() {
  return (
    <AppProvider>
      <div className="app-container">
        <Header />
        <Sidebar />
        {/* ... */}
      </div>
    </AppProvider>
  );
}
```

**Lưu ý:**

- Provider phải wrap tất cả components cần dùng Context
- Thường đặt ở root level (App.tsx)

---

#### Bước 6: Sử dụng trong Components

**File: `src/components/Header.tsx`**

```typescript
export function Header() {
  // 1. Lấy state và dispatch từ Context
  const { state, dispatch } = useAppContext();

  // 2. Đọc state để render
  const isVisible = state.headerVisible;
  const theme = state.theme;

  // 3. Dispatch actions để update state
  const handleToggle = () => {
    dispatch({ type: AppActionType.TOGGLE_HEADER });
  };

  return (
    <header>
      <h1>Dashboard</h1>
      <button onClick={handleToggle}>Toggle</button>
    </header>
  );
}
```

**Pattern chung:**

1. **Đọc state**: `const { state } = useAppContext()`
2. **Dispatch action**: `dispatch({ type: ..., payload: ... })`
3. **Render**: Dùng state để hiển thị UI

---

**Best practices:**

- Luôn return object mới: `{ ...state, ... }`
- Không mutate: `state.theme = 'dark'` ❌
- Handle tất cả cases trong switch

---

## 🎯 Key Takeaways

1. **Context API** = Giải pháp cho prop drilling
2. **useReducer** = Quản lý state phức tạp tốt hơn useState
3. **Pattern**: Context + useReducer = State management đơn giản
4. **TypeScript** = Type safety cho state và actions
5. **Pure functions** = Reducer không có side effects

---

## 📚 Tài liệu tham khảo

- [React Context API](https://react.dev/reference/react/createContext)
- [useReducer Hook](https://react.dev/reference/react/useReducer)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
