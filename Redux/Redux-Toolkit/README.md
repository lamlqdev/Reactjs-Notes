# REDUX TOOLKIT

## Core terminology

**createSlice**:

- Function that generates reducer, action creators and action types together.
- Reduces boilerplate code.

**configureStore**:

- Function that creates a store with good defaults.
- Replace the older `createStore`.

**createSelector**:

- Function that creates a selector function.
- Used to create memoized selectors.

**createAsyncThunk**:

- Create thunk actions for async operations (API calls).
- Automatically generates pending, fulfilled, and rejected action.

**thunk**:

- A function that returns a function (instead of an action object).
- Used to handle asynchronous operations.

**Immer**:

- Library that lets you writte "mutating" logic while create immutable updates.
- Redux Toolkit uses Immer automatically.

---

## Basic: Implement Auth Feature

Phần này hướng dẫn cách implement một feature đơn giản với Redux Toolkit, không có async operations.

### Bước 1: Setup Store

#### 1.1. Tạo Root Reducer với `combineReducers`

**Hàm**: `combineReducers(reducers)`

**Tham số**:

- `reducers`: Object chứa các reducer, key là tên slice trong state, value là reducer function

**Đầu ra**: Một reducer function duy nhất kết hợp tất cả các reducer

**Ví dụ**:

```typescript
import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import articlesReducer from "../features/articles/articlesSlice";

export const rootReducer = combineReducers({
  auth: authReducer,
  articles: articlesReducer,
});
```

**Giải thích**:

- `combineReducers` gộp nhiều reducer thành một reducer duy nhất
- State sẽ có cấu trúc: `{ auth: {...}, articles: {...} }`
- Mỗi reducer chỉ quản lý phần state của nó

#### 1.2. Tạo Store với `configureStore`

**Hàm**: `configureStore(options)`

**Tham số**:

- `options.reducer`: Root reducer (có thể là reducer function hoặc object với combineReducers)
- `options.middleware`: (Optional) Custom middleware
- `options.devTools`: (Optional) Enable/disable Redux DevTools

**Đầu ra**: Redux store object với các methods: `getState()`, `dispatch()`, `subscribe()`

**Ví dụ**:

```typescript
import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "./rootReducer";

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**Giải thích**:

- `configureStore` tự động setup Redux DevTools, thunk middleware
- `RootState` type giúp TypeScript biết cấu trúc state
- `AppDispatch` type giúp TypeScript biết các action có thể dispatch

#### 1.3. Setup Provider trong App

**Component**: `<Provider store={store}>`

**Tham số**:

- `store`: Store object đã tạo từ `configureStore`

**Ví dụ**:

```typescript
import { Provider } from "react-redux";
import { store } from "./store/index.ts";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
  </Provider>
);
```

**Giải thích**: Provider làm cho store có thể truy cập từ mọi component con

#### 1.4. Tạo Typed Hooks

**Hàm**: `useDispatch.withTypes<AppDispatch>()` và `useSelector.withTypes<RootState>()`

**Tham số**: Type parameters cho TypeScript

**Đầu ra**: Typed hooks với TypeScript support

**Ví dụ**:

```typescript
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./index";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

**Giải thích**:

- Giúp TypeScript tự động gợi ý và kiểm tra type khi sử dụng
- Tránh lỗi type khi dispatch action hoặc select state

### Bước 2: Tạo Auth Slice với `createSlice`

**Hàm**: `createSlice(options)`

**Tham số**:

- `options.name`: Tên slice (dùng làm prefix cho action types)
- `options.initialState`: State ban đầu của slice
- `options.reducers`: Object chứa các reducer functions
- `options.extraReducers`: (Optional) Xử lý actions từ bên ngoài (như async thunks)

**Đầu ra**: Object chứa:

- `actions`: Object chứa các action creators
- `reducer`: Reducer function để đưa vào store
- `caseReducers`: Các reducer functions riêng lẻ

**Ví dụ**:

```typescript
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types";

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
```

**Giải thích**:

- `createSlice` tự động tạo action types: `"auth/login"`, `"auth/logout"`
- Tự động tạo action creators: `login(user)`, `logout()`
- Tự động tạo reducer xử lý các actions đó
- **Tác dụng**: Thay vì phải viết riêng action types, action creators và reducer, giờ chỉ cần định nghĩa reducers trong một object
- `PayloadAction<T>` giúp TypeScript biết type của `action.payload`
- Có thể viết "mutating" logic (như `state.isAuthenticated = true`) nhờ Immer tự động convert thành immutable update

### Bước 3: Tạo Selectors với `createSelector`

**Hàm**: `createSelector(...inputSelectors, resultFunc)`

**Tham số**:

- `inputSelectors`: Mảng các selector functions hoặc một selector function
- `resultFunc`: Function nhận kết quả từ inputSelectors và trả về giá trị cuối cùng

**Đầu ra**: Memoized selector function

**Ví dụ**:

```typescript
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
```

**Giải thích**:

- `createSelector` tạo memoized selector: chỉ tính toán lại khi input thay đổi
- Tham số đầu: selector lấy giá trị từ state
- Tham số thứ hai: hàm transform (ở đây là identity function, không thay đổi giá trị)
- **Tác dụng**: Tối ưu performance, tránh re-render không cần thiết

### Bước 4: Sử dụng trong Component

#### 4.1. Dispatch Actions

**Hook**: `useAppDispatch()`

**Đầu ra**: Dispatch function với TypeScript support

**Ví dụ**:

```typescript
import { useAppDispatch } from "../store/hooks";
import { login } from "../features/auth/authSlice";

const LoginPage = () => {
  const dispatch = useAppDispatch();

  const handleSubmit = (e: React.FormEvent) => {
    dispatch(
      login({
        id: Date.now(),
        username: "john",
        email: "john@example.com",
        name: "John Doe",
      })
    );
  };
};
```

**Giải thích**:

- `dispatch(action)` gửi action đến store
- Action creator `login(user)` tự động tạo action object với type `"auth/login"` và payload là user

#### 4.2. Select State

**Hook**: `useAppSelector(selector)`

**Tham số**: Selector function

**Đầu ra**: Giá trị từ state

**Ví dụ**:

```typescript
import { useAppSelector } from "../store/hooks";
import {
  selectIsAuthenticated,
  selectUser,
} from "../features/auth/authSelectors";

const Component = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  return <div>{isAuthenticated ? `Hello ${user?.name}` : "Please login"}</div>;
};
```

**Giải thích**:

- `useAppSelector` tự động subscribe vào state changes
- Component sẽ re-render khi giá trị từ selector thay đổi
- Sử dụng memoized selector giúp tránh re-render khi giá trị không đổi

---

## Advanced: Implement Articles Feature

Phần này hướng dẫn cách implement feature phức tạp hơn với async operations và selectors nâng cao.

### Bước 1: Tạo Async Thunks với `createAsyncThunk`

**Hàm**: `createAsyncThunk(typePrefix, payloadCreator, options?)`

**Tham số**:

- `typePrefix`: String prefix cho action types (ví dụ: `"articles/fetchArticles"`)
- `payloadCreator`: Async function nhận tham số và trả về Promise
  - Tham số đầu: Payload được truyền vào khi dispatch
  - Tham số thứ hai: Object chứa `{ dispatch, getState, rejectWithValue, ... }`
- `options`: (Optional) Các tùy chọn bổ sung

**Đầu ra**: Async thunk function tự động tạo 3 action types:

- `typePrefix + "/pending"`: Khi bắt đầu async operation
- `typePrefix + "/fulfilled"`: Khi thành công (payload là giá trị return)
- `typePrefix + "/rejected"`: Khi thất bại (payload là giá trị từ `rejectWithValue`)

**Ví dụ**:

```typescript
import { createAsyncThunk } from "@reduxjs/toolkit";
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
      const response = await newsApi.fetchArticles(
        params.page,
        params.pageSize,
        params.filters
      );
      return response; // Trả về data → sẽ là action.payload trong fulfilled
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch articles");
      // rejectWithValue → sẽ là action.payload trong rejected
    }
  }
);
```

**Giải thích**:

- `createAsyncThunk` tự động tạo 3 actions: `fetchArticles.pending`, `fetchArticles.fulfilled`, `fetchArticles.rejected`
- **Tác dụng**: Không cần tự viết action types và action creators cho async operations
- `rejectWithValue` giúp truyền error message vào action.payload thay vì throw error

### Bước 2: Tạo Articles Slice với `extraReducers`

**Hàm**: `createSlice` (giống Basic, nhưng thêm `extraReducers`)

**Tham số bổ sung**:

- `options.extraReducers`: Function nhận `builder` để xử lý actions từ bên ngoài (như async thunks)

**Ví dụ**:

```typescript
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchArticles, fetchArticleById, searchArticles } from "./articlesApi";

const articlesSlice = createSlice({
  name: "articles",
  initialState,
  reducers: {
    // Synchronous reducers (giống Basic)
    setArticles: (state, action: PayloadAction<Article[]>) => {
      state.items = action.payload;
    },
    // ... các reducers khác
  },
  extraReducers: (builder) => {
    builder
      // Xử lý khi fetchArticles.pending
      .addCase(fetchArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Xử lý khi fetchArticles.fulfilled
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.articles; // action.payload là giá trị return từ async function
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      // Xử lý khi fetchArticles.rejected
      .addCase(fetchArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch articles";
        // action.payload là giá trị từ rejectWithValue
      })
      // Tương tự cho các async thunks khác
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
      });
  },
});
```

**Giải thích**:

- `extraReducers` dùng để xử lý actions không được tạo từ `reducers` của slice này
- `builder.addCase(action, reducer)` thêm case xử lý cho một action cụ thể
- **Tác dụng**: Tập trung logic xử lý async states (loading, error) vào một nơi

### Bước 3: Tạo Advanced Selectors

**Ví dụ với nhiều input selectors**:

```typescript
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../store";

// Base selector
const selectArticlesState = (state: RootState) => state.articles;

// Selector với 1 input
export const selectAllArticles = createSelector(
  [selectArticlesState],
  (articlesState) => articlesState.items
);

// Selector với nhiều inputs (có tham số)
export const selectArticleById = createSelector(
  [selectAllArticles, (_state: RootState, id: number) => id],
  (articles, id) => articles.find((article) => article.id === id)
);

// Selector với filter
export const selectArticlesByCategory = createSelector(
  [selectAllArticles, (_state: RootState, category: string) => category],
  (articles, category) =>
    category === "Tất cả"
      ? articles
      : articles.filter((article) => article.category === category)
);
```

**Giải thích**:

- Selector có thể nhận nhiều inputs: `[selector1, selector2, ...]`
- Selector có thể nhận tham số: thêm function `(state, param) => param` vào mảng inputs
- **Tác dụng**: Tạo các selector phức tạp với memoization tự động

### Bước 4: Sử dụng Async Thunks trong Component

**Ví dụ**:

```typescript
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchArticles } from "../features/articles/articlesApi";
import {
  selectAllArticles,
  selectArticlesLoading,
} from "../features/articles/articlesSelectors";

const HomePage = () => {
  const dispatch = useAppDispatch();
  const articles = useAppSelector(selectAllArticles);
  const loading = useAppSelector(selectArticlesLoading);

  useEffect(() => {
    dispatch(
      fetchArticles({
        page: 1,
        pageSize: 10,
        filters: {
          search: "react",
          category: "Technology",
          sortBy: "date",
        },
      })
    );
  }, [dispatch]);

  if (loading) return <div>Đang tải...</div>;
  return <div>{/* Render articles */}</div>;
};
```

**Giải thích**:

- Dispatch async thunk giống như dispatch action thường
- Redux Toolkit tự động dispatch `pending` → `fulfilled`/`rejected`
- Component tự động re-render khi state thay đổi (loading, articles, error)

---

## Tóm tắt lợi ích của Redux Toolkit

1. **createSlice**: Giảm boilerplate bằng cách gộp action types, action creators và reducer vào một nơi
2. **createAsyncThunk**: Tự động tạo 3 action types cho async operations (pending/fulfilled/rejected)
3. **configureStore**: Tự động setup middleware và DevTools
4. **createSelector**: Tự động memoize selectors để tối ưu performance
5. **Immer**: Cho phép viết "mutating" logic mà vẫn đảm bảo immutability

---

## Tìm hiểu thêm

Sau khi nắm vững các khái niệm cơ bản và nâng cao ở trên, bạn có thể tiếp tục học các chủ đề sau:

### 1. RTK Query - Data Fetching và Caching

**RTK Query** là giải pháp data fetching và caching được xây dựng trên Redux Toolkit, giúp đơn giản hóa việc fetch data từ API.

**Tính năng chính**:

- Tự động generate API endpoints và hooks
- Tự động cache và refetch data
- Tự động quản lý loading và error states
- Hỗ trợ optimistic updates
- Hỗ trợ pagination, infinite scroll

**Khi nào sử dụng**:

- Khi bạn có nhiều API calls
- Cần cache và sync data giữa các components
- Muốn giảm boilerplate code cho data fetching

**Tài liệu**: [RTK Query Documentation](https://redux-toolkit.js.org/rtk-query/overview)

### 2. Middleware và Custom Middleware

**Middleware** là các functions chạy giữa dispatch action và reducer, cho phép bạn:

- Log actions và state changes
- Thực hiện async operations
- Transform actions trước khi đến reducer
- Cancel hoặc delay actions

**Ví dụ middleware phổ biến**:

- `redux-logger`: Log mọi action và state changes
- `redux-persist`: Lưu state vào localStorage
- Custom middleware cho authentication, error handling

**Tài liệu**: [Redux Middleware](https://redux.js.org/tutorials/fundamentals/part-4-store#middleware)

### 3. Normalizing State Shape

**Normalization** là kỹ thuật tổ chức state dạng nested thành dạng flat, giúp:

- Tránh duplicate data
- Dễ dàng update và delete items
- Tối ưu performance khi select data
- Dễ dàng cache và sync data

**Ví dụ**:

```typescript
// ❌ Không normalized (nested)
{
  articles: [
    { id: 1, author: { id: 1, name: "John" } },
    { id: 2, author: { id: 1, name: "John" } }
  ]
}

// ✅ Normalized (flat)
{
  articles: {
    byId: { 1: {...}, 2: {...} },
    allIds: [1, 2]
  },
  authors: {
    byId: { 1: { id: 1, name: "John" } },
    allIds: [1]
  }
}
```

**Tài liệu**: [Normalizing State Shape](https://redux.js.org/usage/structuring-reducers/normalizing-state-shape)

### 4. Redux DevTools Extension

**Redux DevTools** là browser extension giúp debug Redux applications:

- Xem toàn bộ action history
- Time-travel debugging (quay lại state trước đó)
- Inspect state tại mọi thời điểm
- Export/import state để test
- Monitor performance

**Cài đặt**: [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools-extension)

### 5. Testing Redux Code

**Testing** Redux code bao gồm:

- **Unit test** cho reducers: Test logic xử lý state
- **Unit test** cho selectors: Test tính toán từ state
- **Integration test** cho async thunks: Test API calls và error handling
- **Component test**: Test component sử dụng Redux hooks

**Công cụ hỗ trợ**:

- `@testing-library/react`: Test React components
- `@reduxjs/toolkit/query/react`: Test RTK Query
- Mock store cho testing

**Tài liệu**: [Testing Redux](https://redux.js.org/usage/writing-tests)

### 6. Code Splitting và Lazy Loading

**Code splitting** giúp tối ưu bundle size bằng cách:

- Chia Redux code thành các chunks nhỏ
- Load reducer và middleware khi cần
- Sử dụng dynamic imports cho features lớn

**Ví dụ**:

```typescript
// Lazy load reducer
const articlesReducer = await import("./features/articles/articlesSlice");
```

### 7. TypeScript Best Practices

**TypeScript** với Redux Toolkit:

- Sử dụng `PayloadAction<T>` cho typed actions
- Tạo typed hooks với `useAppDispatch` và `useAppSelector`
- Sử dụng `ReturnType` để infer types từ store
- Tạo utility types cho complex state shapes

**Tài liệu**: [TypeScript Quick Start](https://redux-toolkit.js.org/usage/usage-with-typescript)

### 8. Performance Optimization

**Tối ưu performance** trong Redux:

- Sử dụng `createSelector` để memoize expensive calculations
- Tránh re-render không cần thiết với `React.memo`
- Sử dụng `useMemo` và `useCallback` khi cần
- Normalize state để tránh deep nesting
- Sử dụng RTK Query cho automatic caching

### 9. Redux Toolkit Patterns

**Các patterns phổ biến**:

- **Feature-based folder structure**: Tổ chức code theo features
- **Ducks pattern**: Gộp actions, reducers, selectors vào một file
- **Normalized state**: Sử dụng entities pattern
- **Async patterns**: Xử lý loading, error, success states

### 10. Tài liệu chính thức và Cộng đồng

**Tài liệu chính thức**:

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Redux Essentials Tutorial](https://redux.js.org/tutorials/essentials/part-1-overview-concepts)
- [Redux Style Guide](https://redux.js.org/style-guide/)

**Cộng đồng**:

- [Redux GitHub](https://github.com/reduxjs/redux-toolkit)
- [Redux Discord](https://discord.gg/redux)
- [Stack Overflow - Redux tag](https://stackoverflow.com/questions/tagged/redux)
