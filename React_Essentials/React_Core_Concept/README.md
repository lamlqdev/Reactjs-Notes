# React Core Concepts - Tài liệu học tập

Tài liệu này giúp bạn hiểu các khái niệm cơ bản nhất của React thông qua ví dụ thực tế trong project này.

---

## 1. Core Concepts

React được xây dựng dựa trên 4 khái niệm cốt lõi:

### 1.1. Components

**Components** là các khối xây dựng cơ bản của ứng dụng React. Mỗi component là một module độc lập (HTML + CSS + JavaScript) có thể tái sử dụng.

**Ví dụ trong project:**

- `Header.jsx` - Component hiển thị header
- `CoreConcept.jsx` - Component hiển thị một concept
- `TabButton.jsx` - Component nút tab
- `App.jsx` - Component chính chứa tất cả

**Đặc điểm:**

- Mỗi component là một function trả về JSX
- Component có thể được sử dụng nhiều lần
- Component giúp code dễ đọc và bảo trì

### 1.2. JSX (JavaScript XML)

**JSX** là cú pháp mở rộng của JavaScript, cho phép viết HTML-like code trong JavaScript.

**Ví dụ:**

```jsx
return (
  <div>
    <h1>Hello, World!</h1>
    <p>Chào mừng đến với React!</p>
  </div>
);
```

**Đặc điểm:**

- JSX trông giống HTML nhưng thực chất là JavaScript
- Có thể nhúng biến và biểu thức JavaScript bằng `{}`
- Phải có một phần tử cha (parent element) bao bọc

### 1.3. Props (Properties)

**Props** là cách truyền dữ liệu từ component cha xuống component con. Props giống như tham số của function.

**Ví dụ trong project:**

- `CoreConcept` nhận props: `image`, `title`, `description`
- `TabButton` nhận props: `children`, `onSelect`, `isSelected`

**Đặc điểm:**

- Props là read-only
- Props giúp component có thể tái sử dụng với dữ liệu khác nhau
- Props được truyền từ component cha xuống component con

### 1.4. State

**State** là dữ liệu được quản lý bởi React. Khi state thay đổi, component sẽ tự động re-render để cập nhật UI.

**Ví dụ trong project:**

- `selectedTopic` là state lưu topic được chọn
- Khi state thay đổi, UI tự động cập nhật

**Đặc điểm:**

- State chỉ có thể thay đổi bằng hàm setter (như `setSelectedTopic`)
- Khi state thay đổi, React tự động re-render component
- State giúp UI phản ứng với tương tác người dùng

---

## 2. Cách React hoạt động

### 2.1. Quy trình cơ bản

1. **Khởi tạo ứng dụng:**

   - React tìm phần tử `root` trong HTML (`index.html`)
   - Render component `App` vào phần tử đó

2. **Render component:**

   - React đọc JSX và chuyển thành các phần tử DOM
   - Hiển thị lên màn hình

3. **Cập nhật UI:**
   - Khi state thay đổi, React tự động re-render
   - Chỉ cập nhật những phần thay đổi (hiệu quả)

### 2.2. Component Tree

```text
App
├── Header
└── main
    ├── section (Core Concepts)
    │   └── CoreConcept (x4)
    └── section (Examples)
        ├── TabButton (x4)
        └── tabContent
```

Mỗi component có thể chứa các component con khác, tạo thành một cây component.

### 2.3. Data Flow

- **Props Down:** Dữ liệu truyền từ component cha xuống component con
- **Events Up:** Sự kiện từ component con truyền lên component cha qua callback functions

---

## 3. Examples

Hãy cùng phân tích code trong project để hiểu cách các khái niệm trên được áp dụng.

### 3.1. Component và JSX

#### Ví dụ 1: Component Header

```1:23:src/components/Header/Header.jsx
import reactImg from '../../assets/react-core-concepts.png';
import './Header.css';

const reactDescriptions = ['Fundamental', 'Crucial', 'Core'];

function genRandomInt(max) {
  return Math.floor(Math.random() * (max + 1));
}

export default function Header() {
  const description = reactDescriptions[genRandomInt(2)];

  return (
    <header>
      <img src={reactImg} alt="Stylized atom" />
      <h1>React Essentials</h1>
      <p>
        {description} React concepts you will need for almost any app you are
        going to build!
      </p>
    </header>
  );
}
```

**Giải thích:**

- `Header` là một function component
- Component trả về JSX (HTML-like code)
- Sử dụng biến JavaScript trong JSX: `{description}`
- Component có thể chứa logic JavaScript (hàm `genRandomInt`)

#### Ví dụ 2: Component CoreConcept

```1:9:src/components/CoreConcept.jsx
export default function CoreConcept({ image, title, description }) {
  return (
    <li>
      <img src={image} alt={title} />
      <h3>{title}</h3>
      <p>{description}</p>
    </li>
  );
}
```

**Giải thích:**

- Component nhận 3 props: `image`, `title`, `description`
- Sử dụng destructuring để lấy props: `{ image, title, description }`
- Props được sử dụng trực tiếp trong JSX

### 3.2. Props - Truyền dữ liệu

#### Ví dụ: Truyền props từ App xuống CoreConcept

```34:40:src/App.jsx
        <section id="core-concepts">
          <h2>Core Concepts</h2>
          <ul>
            {CORE_CONCEPTS.map((conceptItem) => (
              <CoreConcept key={conceptItem.title} {...conceptItem} />
            ))}
          </ul>
        </section>
```

**Giải thích:**

- `CORE_CONCEPTS` là mảng chứa dữ liệu (xem `data.js`)
- `.map()` duyệt qua từng phần tử và tạo component
- `{...conceptItem}` là spread operator, truyền tất cả properties của `conceptItem` làm props
- `key={conceptItem.title}` giúp React nhận biết từng phần tử (bắt buộc khi dùng `.map()`)

**Dữ liệu trong `data.js`:**

```6:31:src/data.js
export const CORE_CONCEPTS = [
  {
    image: componentsImg,
    title: 'Components',
    description:
      'The core UI building block - compose the user interface by combining multiple components.',
  },
  {
    image: jsxImg,
    title: 'JSX',
    description:
      'Return (potentially dynamic) HTML(ish) code to define the actual markup that will be rendered.',
  },
  {
    image: propsImg,
    title: 'Props',
    description:
      'Make components configurable (and therefore reusable) by passing input data to them.',
  },
  {
    image: stateImg,
    title: 'State',
    description:
      'React-managed data which, when changed, causes the component to re-render & the UI to update.',
  },
];
```

Khi render, React sẽ tạo 4 component `CoreConcept`, mỗi component nhận một object từ mảng làm props.

### 3.3. State - Quản lý trạng thái

#### Ví dụ: Sử dụng useState để quản lý topic được chọn

```9:14:src/App.jsx
function App() {
  const [selectedTopic, setSelectedTopic] = useState();

  function handleSelect(selectedButton) {
    setSelectedTopic(selectedButton);
  }
```

**Giải thích:**

- `useState()` là hook của React để tạo state
- `selectedTopic` là giá trị hiện tại của state (có thể là `undefined`, `"components"`, `"jsx"`, `"props"`, hoặc `"state"`)
- `setSelectedTopic` là hàm để thay đổi giá trị state
- Khi gọi `setSelectedTopic("components")`, state thay đổi và component tự động re-render

**Cách hoạt động:**

1. Ban đầu `selectedTopic = undefined`
2. Người dùng click vào tab "Components"
3. `handleSelect("components")` được gọi
4. `setSelectedTopic("components")` cập nhật state
5. React re-render component `App`
6. UI cập nhật để hiển thị nội dung tương ứng

### 3.4. Conditional Rendering

#### Ví dụ: Hiển thị nội dung dựa trên state

```16:28:src/App.jsx
  let tabContent = <p>Please select a topic.</p>;

  if (selectedTopic) {
    tabContent = (
      <div id="tab-content">
        <h3>{EXAMPLES[selectedTopic].title}</h3>
        <p>{EXAMPLES[selectedTopic].description}</p>
        <pre>
          <code>{EXAMPLES[selectedTopic].code}</code>
        </pre>
      </div>
    );
  }
```

**Giải thích:**

- **Conditional Rendering** là cách hiển thị nội dung khác nhau dựa trên điều kiện
- Ban đầu `tabContent` là một đoạn text mặc định
- Nếu `selectedTopic` có giá trị (truthy), `tabContent` được gán JSX mới
- JSX mới lấy dữ liệu từ object `EXAMPLES` dựa trên `selectedTopic`

**Các cách conditional rendering khác:**

```jsx
// Cách 1: Dùng if-else
if (condition) {
  return <ComponentA />;
} else {
  return <ComponentB />;
}

// Cách 2: Dùng toán tử ternary
{
  condition ? <ComponentA /> : <ComponentB />;
}

// Cách 3: Dùng toán tử &&
{
  condition && <ComponentA />;
}
```

### 3.5. Event Handling - Xử lý sự kiện

#### Ví dụ: Xử lý click event trên TabButton

```45:70:src/App.jsx
          <menu>
            <TabButton
              isSelected={selectedTopic === "components"}
              onSelect={() => handleSelect("components")}
            >
              Components
            </TabButton>
            <TabButton
              isSelected={selectedTopic === "jsx"}
              onSelect={() => handleSelect("jsx")}
            >
              JSX
            </TabButton>
            <TabButton
              isSelected={selectedTopic === "props"}
              onSelect={() => handleSelect("props")}
            >
              Props
            </TabButton>
            <TabButton
              isSelected={selectedTopic === "state"}
              onSelect={() => handleSelect("state")}
            >
              State
            </TabButton>
          </menu>
```

**Giải thích:**

- Mỗi `TabButton` nhận 2 props:
  - `isSelected`: boolean để xác định tab nào đang được chọn
  - `onSelect`: function callback được gọi khi click vào button
- `selectedTopic === "components"` so sánh state với string, trả về `true` hoặc `false`
- `() => handleSelect("components")` là arrow function, khi click sẽ gọi `handleSelect` với tham số `"components"`

#### Component TabButton xử lý event

```1:10:src/components/TabButton.jsx
export default function TabButton({ children, onSelect, isSelected }) {
  return (
    <li>
      <button className={isSelected ? 'active' : undefined} onClick={onSelect}>
        {children}
      </button>
    </li>
  );
}
```

**Giải thích:**

- `onClick={onSelect}` gán function `onSelect` (từ props) vào sự kiện click
- Khi button được click, function `onSelect` được gọi
- `children` là prop đặc biệt, chứa nội dung giữa thẻ mở và đóng: `<TabButton>Components</TabButton>`
- `className={isSelected ? 'active' : undefined}` áp dụng class CSS nếu tab được chọn

**Luồng xử lý sự kiện:**

1. Người dùng click vào button "Components"
2. `onClick` trigger, gọi `onSelect()` (tức là `handleSelect("components")`)
3. `handleSelect` gọi `setSelectedTopic("components")`
4. State thay đổi → React re-render
5. `selectedTopic === "components"` trả về `true`
6. TabButton nhận `isSelected={true}` → button có class `active`
7. `tabContent` được cập nhật với nội dung mới

### 3.6. Tổng hợp: Luồng hoạt động của ứng dụng

#### Bước 1: Khởi tạo

```1:8:src/index.jsx
import ReactDOM from "react-dom/client";

import App from "./App.jsx";
import "./index.css";

const entryPoint = document.getElementById("root");
ReactDOM.createRoot(entryPoint).render(<App />);
```

- React tìm element có `id="root"` trong HTML
- Render component `App` vào đó

#### Bước 2: Render lần đầu

```30:74:src/App.jsx
  return (
    <div>
      <Header />
      <main>
        <section id="core-concepts">
          <h2>Core Concepts</h2>
          <ul>
            {CORE_CONCEPTS.map((conceptItem) => (
              <CoreConcept key={conceptItem.title} {...conceptItem} />
            ))}
          </ul>
        </section>

        <section id="examples">
          <h2>Examples</h2>
          <menu>
            <TabButton
              isSelected={selectedTopic === "components"}
              onSelect={() => handleSelect("components")}
            >
              Components
            </TabButton>
            <TabButton
              isSelected={selectedTopic === "jsx"}
              onSelect={() => handleSelect("jsx")}
            >
              JSX
            </TabButton>
            <TabButton
              isSelected={selectedTopic === "props"}
              onSelect={() => handleSelect("props")}
            >
              Props
            </TabButton>
            <TabButton
              isSelected={selectedTopic === "state"}
              onSelect={() => handleSelect("state")}
            >
              State
            </TabButton>
          </menu>
          {tabContent}
        </section>
      </main>
    </div>
  );
```

**Khi render lần đầu:**

- `selectedTopic = undefined` (chưa chọn tab nào)
- Tất cả `TabButton` có `isSelected={false}`
- `tabContent = <p>Please select a topic.</p>`

#### Bước 3: Tương tác người dùng

- Người dùng click vào tab "JSX"
- `handleSelect("jsx")` được gọi
- `setSelectedTopic("jsx")` cập nhật state
- React re-render component

#### Bước 4: Re-render

- `selectedTopic = "jsx"`
- TabButton "JSX" có `isSelected={true}` → có class `active`
- `tabContent` được cập nhật với nội dung từ `EXAMPLES["jsx"]`
- UI hiển thị title, description và code example của JSX

---

## 📝 Tóm tắt

### Các khái niệm đã học

1. **Components**: Khối xây dựng cơ bản, có thể tái sử dụng
2. **JSX**: Cú pháp viết HTML trong JavaScript
3. **Props**: Truyền dữ liệu từ component cha xuống component con
4. **State**: Dữ liệu được quản lý bởi React, khi thay đổi sẽ re-render

### Các kỹ thuật đã thực hành

- Tạo và sử dụng components
- Truyền props giữa các components
- Sử dụng `useState` để quản lý state
- Conditional rendering (render theo điều kiện)
- Event handling (xử lý sự kiện click)
- Render danh sách với `.map()`
- Sử dụng `key` prop khi render danh sách

### Lưu ý quan trọng

1. **Props là read-only**: Không thể thay đổi props từ component con
2. **State chỉ thay đổi bằng setter**: Luôn dùng hàm setter (như `setSelectedTopic`) để thay đổi state
3. **Key prop**: Luôn cần `key` khi render danh sách với `.map()`
4. **Event handlers**: Truyền function, không gọi function (không dùng `onClick={handleSelect()}`)
