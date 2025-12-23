# React Behind The Scenes

Dự án này giúp bạn hiểu sâu hơn về cách React hoạt động bên trong, bao gồm các khái niệm quan trọng về hiệu suất, Virtual DOM, và cơ chế quản lý state.

---

## 1. Tối ưu hóa Re-render Component

React re-render một component khi:

- State của component đó thay đổi
- Props của component đó thay đổi
- Component cha re-render, theo mặc định, tất cả component con cũng re-render

Việc re-render không cần thiết có thể làm giảm hiệu suất ứng dụng. Dưới đây là các kỹ thuật để tối ưu hóa.

### React.memo

**Mục đích**: Ngăn component re-render khi props không thay đổi.

#### Đầu vào (Input)

```javascript
React.memo(Component, arePropsEqual?)
```

- **Component**: Component cần được memoize.
- **arePropsEqual** (tùy chọn): Hàm so sánh tùy chỉnh `(prevProps, nextProps) => boolean`. Mặc định React sử dụng shallow comparison.

**Cơ chế hoạt động:**

1. React.memo bọc component và tạo một "memoized version"
2. Khi component cha re-render, React kiểm tra props của component được memo
3. Nếu props không thay đổi (theo shallow comparison hoặc hàm `arePropsEqual`), React bỏ qua việc re-render và sử dụng kết quả render trước đó
4. Nếu props thay đổi, component sẽ được re-render bình thường

**Đầu ra (Output):**

- Component được memoize, chỉ re-render khi props thay đổi

**Khi nào nên dùng:**

✅ **Nên dùng khi:**

- Component render thường xuyên với cùng props
- Component có logic render phức tạp hoặc tốn kém
- Component nhận props từ component cha thường xuyên re-render nhưng props không đổi

❌ **Không nên dùng khi:**

- Component luôn nhận props mới (ví dụ: object/array được tạo mới mỗi lần render)
- Component đơn giản, render nhanh
- Component nhận hàm callback không được memoize (useCallback)

**Ví dụ trong project:**

```1:14:src/components/UI/IconButton.jsx
import { memo } from "react";
import { log } from "../../log.js";

const IconButton = memo(function IconButton({ children, icon, ...props }) {
  log("<IconButton /> rendered", 2);

  const Icon = icon;
  return (
    <button {...props} className="button">
      <Icon className="button-icon" />
      <span className="button-text">{children}</span>
    </button>
  );
});
export default IconButton;
```

`IconButton` được wrap bằng `memo` để tránh re-render không cần thiết khi component cha (`Counter`) re-render nhưng props của `IconButton` không thay đổi.

---

### Component Composition

**Mục đích**: Giảm re-render bằng cách di chuyển state xuống component con, tránh truyền props không cần thiết.

**Cơ chế hoạt động:**

Thay vì truyền nhiều props xuống component con, bạn có thể:

1. **Di chuyển state xuống component con**: State chỉ ảnh hưởng đến component con, không làm component cha re-render
2. **Sử dụng children prop**: Component cha chỉ render phần không thay đổi, phần động được truyền qua `children`
3. **Tách component**: Tách phần thường thay đổi thành component riêng

**Khi nào nên dùng:**

✅ **Nên dùng khi:**

- Component cha re-render thường xuyên nhưng chỉ một phần UI cần cập nhật
- Muốn giảm số lượng props truyền xuống
- Cần tách biệt logic và UI

**Ví dụ:**

**Cách không tối ưu:**

```javascript
function App() {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState({ name: "John" });

  return (
    <div>
      <Header user={user} /> {/* Header re-render khi count thay đổi */}
      <Counter count={count} />
    </div>
  );
}
```

**Cách tối ưu với Component Composition:**

```javascript
function App() {
  return (
    <div>
      <Header /> {/* Header không re-render khi Counter thay đổi */}
      <CounterWrapper />
    </div>
  );
}

function CounterWrapper() {
  const [count, setCount] = useState(0);
  return <Counter count={count} />;
}
```

---

### useCallback

**Mục đích**: Memoize hàm callback để tránh tạo hàm mới mỗi lần render, giúp `React.memo` hoạt động đúng.

**Đầu vào (Input):**

```javascript
useCallback(fn, dependencies);
```

- **fn**: Hàm cần được memoize
- **dependencies**: Mảng các dependencies. Hàm sẽ được tạo lại khi bất kỳ dependency nào thay đổi

**Cơ chế hoạt động:**

1. Lần render đầu tiên: `useCallback` trả về hàm `fn` và lưu vào memory
2. Các lần render tiếp theo:
   - Nếu dependencies không thay đổi: Trả về hàm đã lưu (cùng reference)
   - Nếu dependencies thay đổi: Tạo hàm mới và lưu lại

**Đầu ra (Output):**

- Hàm callback được memoize với cùng reference nếu dependencies không đổi

**Khi nào nên dùng:**

✅ **Nên dùng khi:**

- Truyền hàm callback vào component được wrap bằng `React.memo`
- Hàm callback là dependency của hook khác (useEffect, useMemo)
- Hàm callback được truyền xuống nhiều component con

❌ **Không nên dùng khi:**

- Hàm callback không được truyền vào component được memoize
- Hàm callback đơn giản, không tốn kém để tạo lại
- Dependencies thay đổi thường xuyên (không có lợi ích)

**Ví dụ trong project:**

```43:55:src/components/Counter/Counter.jsx
  const handleDecrement = useCallback(function handleDecrement() {
    setCounterChangers((prevCounter) => [
      { value: -1, id: Math.random() * 1000 },
      ...prevCounter,
    ]);
  }, []);

  const handleIncrement = useCallback(function handleIncrement() {
    setCounterChangers((prevCounter) => [
      { value: 1, id: Math.random() * 1000 },
      ...prevCounter,
    ]);
  }, []);
```

`handleDecrement` và `handleIncrement` được memoize với `useCallback` và dependency array rỗng `[]`, nghĩa là chúng chỉ được tạo một lần và không bao giờ thay đổi. Điều này đảm bảo `IconButton` (được wrap bằng `memo`) không re-render không cần thiết.

---

### useMemo

**Mục đích**: Memoize kết quả tính toán phức tạp để tránh tính toán lại mỗi lần render.

**Đầu vào (Input):**

```javascript
useMemo(calculateValue, dependencies);
```

- **calculateValue**: Hàm tính toán trả về giá trị cần memoize
- **dependencies**: Mảng các dependencies. Giá trị sẽ được tính lại khi bất kỳ dependency nào thay đổi

**Cơ chế hoạt động:**

1. Lần render đầu tiên: Thực thi `calculateValue()`, lưu kết quả vào memory
2. Các lần render tiếp theo:
   - Nếu dependencies không thay đổi: Trả về giá trị đã lưu (không tính toán lại)
   - Nếu dependencies thay đổi: Thực thi lại `calculateValue()` và lưu kết quả mới

**Đầu ra (Output):**

- Giá trị được memoize, chỉ tính toán lại khi dependencies thay đổi

**Khi nào nên dùng:**

✅ **Nên dùng khi:**

- Tính toán phức tạp, tốn kém (ví dụ: filter, sort, map trên mảng lớn)
- Giá trị được sử dụng làm dependency của hook khác (useEffect, useMemo khác)
- Giá trị được truyền vào component được memoize và cần so sánh reference

❌ **Không nên dùng khi:**

- Tính toán đơn giản, nhanh (không có lợi ích, chỉ tốn memory)
- Dependencies thay đổi thường xuyên (luôn phải tính lại)
- Giá trị primitive (string, number, boolean) - không cần memoize

**Ví dụ trong project:**

```10:32:src/components/Counter/Counter.jsx
function isPrime(number) {
  log("Calculating if is prime number", 2, "other");
  if (number <= 1) {
    return false;
  }

  const limit = Math.sqrt(number);

  for (let i = 2; i <= limit; i++) {
    if (number % i === 0) {
      return false;
    }
  }

  return true;
}

const Counter = function Counter({ initialCount }) {
  log("<Counter /> rendered", 1);
  const initialCountIsPrime = useMemo(
    () => isPrime(initialCount),
    [initialCount]
  );
```

Hàm `isPrime` là một tính toán phức tạp. `useMemo` đảm bảo `isPrime(initialCount)` chỉ được tính toán khi `initialCount` thay đổi, không phải mỗi lần component re-render.

---

## 2. Virtual DOM

### Khái niệm

**Virtual DOM** là một bản sao JavaScript của DOM thật, được React sử dụng để tối ưu hóa việc cập nhật UI.

### Cơ chế hoạt động

#### Bước 1: Render Phase (Giai đoạn Render)

Khi state hoặc props thay đổi:

1. React tạo một Virtual DOM tree mới (mô tả UI mong muốn)
2. So sánh Virtual DOM mới với Virtual DOM cũ (quá trình gọi là **Diffing**)

#### Bước 2: Commit Phase (Giai đoạn Commit)

Sau khi diffing:

1. React xác định những thay đổi cần thiết (diff)
2. Cập nhật DOM thật một cách hiệu quả nhất (chỉ cập nhật những phần thay đổi)
3. Gọi các lifecycle methods và effects nếu cần

### Diffing Algorithm (Thuật toán So sánh)

React sử dụng các quy tắc sau khi so sánh:

1. **So sánh theo element type**:

   - Nếu type khác nhau → Unmount component cũ, mount component mới
   - Nếu type giống nhau → Chỉ cập nhật props/attributes

2. **So sánh theo key** (xem phần Key trong React):

   - Key giúp React xác định element nào tương ứng với element nào

3. **So sánh theo level**:
   - React so sánh từng level của tree, không so sánh toàn bộ

### Lợi ích của Virtual DOM

**Hiệu suất**: Chỉ cập nhật những phần DOM thật sự thay đổi

**Tối ưu batch updates**: React có thể batch nhiều state updates thành một lần cập nhật DOM

**Đơn giản hóa logic**: Developer không cần quan tâm đến việc cập nhật DOM thủ công

### Ví dụ minh họa

```javascript
// Virtual DOM cũ
<div>
  <h1>Hello</h1>
  <p>World</p>
</div>

// Virtual DOM mới (sau khi state thay đổi)
<div>
  <h1>Hello</h1>
  <p>React</p>  {/* Chỉ phần này thay đổi */}
</div>

// React chỉ cập nhật text content của <p> trong DOM thật
```

---

## 3. Key trong React

### Key là gì?

**Key** là một prop đặc biệt mà React sử dụng để xác định các element trong danh sách. Key giúp React biết element nào đã thay đổi, được thêm, hoặc bị xóa.

### Tại sao cần Key?

Khi render danh sách, React cần cách để phân biệt các element. Nếu không có key, React sẽ sử dụng index làm key mặc định, điều này có thể gây ra các vấn đề:

1. **Re-render không hiệu quả**: React có thể re-render toàn bộ danh sách
2. **State bị nhầm lẫn**: State của component có thể được giữ lại ở element sai
3. **Hiệu suất kém**: Không thể tối ưu hóa việc cập nhật

**Cơ chế hoạt động:**

1. **Render lần đầu**: React tạo mapping giữa key và element
2. **Re-render**: React so sánh keys:
   - Key mới → Tạo element mới
   - Key cũ không còn → Unmount element
   - Key giữ nguyên → Chỉ cập nhật props nếu cần

### Quy tắc sử dụng Key

✅ **Nên:**

- Sử dụng ID duy nhất từ data (ví dụ: `user.id`, `post.id`)
- Key phải stable (không thay đổi giữa các lần render)
- Key phải unique trong cùng một danh sách

❌ **Không nên:**

- Sử dụng index làm key khi danh sách có thể thay đổi thứ tự
- Sử dụng random values (tạo mới mỗi lần render)
- Sử dụng key trùng lặp trong cùng danh sách

**Ví dụ trong project:**

```24:30:src/components/Counter/CounterHistory.jsx
export default function CounterHistory({ history }) {
  log("<CounterHistory /> rendered", 2);

  return (
    <ol>
      {history.map((count) => (
        <HistoryItem key={count.id} count={count.value} />
      ))}
    </ol>
  );
}
```

`CounterHistory` sử dụng `count.id` làm key. Mỗi item trong `history` có một `id` duy nhất được tạo khi thêm vào:

```43:47:src/components/Counter/Counter.jsx
  const handleDecrement = useCallback(function handleDecrement() {
    setCounterChangers((prevCounter) => [
      { value: -1, id: Math.random() * 1000 },
      ...prevCounter,
    ]);
  }, []);
```

### Ví dụ về vấn đề khi dùng index làm key

```javascript
// ❌ KHÔNG NÊN: Dùng index làm key khi có thể xóa/sắp xếp lại
{
  items.map((item, index) => <Item key={index} data={item} />);
}

// ✅ NÊN: Dùng ID duy nhất
{
  items.map((item) => <Item key={item.id} data={item} />);
}
```

**Vấn đề với index:**

- Khi xóa item đầu tiên, tất cả items sau đó sẽ có key mới
- React sẽ re-render toàn bộ danh sách thay vì chỉ xóa item đầu tiên
- State của component có thể bị nhầm lẫn

### Key và Component Reset

Key cũng có thể được sử dụng để reset component:

```24:24:src/App.jsx
        <Counter key={chosenCount} initialCount={chosenCount} />
```

Khi `chosenCount` thay đổi, `key` của `Counter` cũng thay đổi. React sẽ:

1. Unmount `Counter` cũ (key cũ)
2. Mount `Counter` mới (key mới)
3. Component được reset hoàn toàn về trạng thái ban đầu

---

## 4. Cơ chế Lên lịch và Thực thi State Update

### Batching (Nhóm các Updates)

React tự động nhóm (batch) nhiều state updates thành một lần re-render để tối ưu hiệu suất.

**Automatic Batching (React 18+):**

Trong React 18, tất cả state updates được tự động batch, kể cả trong:

- Event handlers
- Promises
- setTimeout
- Native event handlers

**Ví dụ:**

```javascript
function handleClick() {
  setCount1((c) => c + 1); // Không trigger re-render ngay
  setCount2((c) => c + 1); // Không trigger re-render ngay
  setCount3((c) => c + 1); // Không trigger re-render ngay
  // Tất cả 3 updates được batch thành 1 lần re-render
}
```

### State Update Queue (Hàng đợi State Updates)

React duy trì một hàng đợi cho mỗi component để xử lý các state updates.

**Cơ chế hoạt động:**

1. **Khi gọi setState**: Update được thêm vào queue
2. **Sau khi event handler kết thúc**: React xử lý tất cả updates trong queue
3. **Re-render**: Component được re-render với state mới

### Functional Updates (Cập nhật dạng Hàm)

Khi state update phụ thuộc vào state trước đó, nên sử dụng functional form:

```javascript
// ❌ Có thể không chính xác nếu có nhiều updates
setCount(count + 1);
setCount(count + 1); // count vẫn là giá trị cũ

// ✅ Luôn chính xác
setCount((prevCount) => prevCount + 1);
setCount((prevCount) => prevCount + 1); // Sử dụng giá trị mới nhất
```

**Ví dụ trong project:**

```13:17:src/App.jsx
  function handleSetCount(newCount) {
    setChosenCount(newCount);
    // Function form will ensure that we always get the latest value
    setChosenCount((prevCount) => prevCount + 1);
  }
```

`handleSetCount` sử dụng functional update `(prevCount) => prevCount + 1` để đảm bảo luôn sử dụng giá trị mới nhất của `chosenCount`, ngay cả khi có nhiều updates được batch.

### Update Priority (Ưu tiên Updates)

React 18 giới thiệu **Concurrent Features** với các mức độ ưu tiên:

1. **Urgent updates**: User input, clicks (cần phản hồi ngay)
2. **Transition updates**: Navigation, data fetching (có thể trì hoãn)

**useTransition:**

```javascript
import { useTransition } from "react";

function App() {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(() => {
      // Updates trong đây có độ ưu tiên thấp
      setNonUrgentState(newValue);
    });
  }
}
```

### Thứ tự thực thi

1. **Synchronous code**: Chạy ngay lập tức
2. **State updates**: Được queue và xử lý sau
3. **Re-render**: Xảy ra sau khi tất cả updates được xử lý
4. **Effects**: Chạy sau khi render hoàn tất

### Ví dụ minh họa thứ tự

```javascript
function Component() {
  const [count, setCount] = useState(0);

  console.log("1. Render:", count);

  useEffect(() => {
    console.log("3. Effect:", count);
  }, [count]);

  function handleClick() {
    console.log("2. Before update:", count);
    setCount((c) => c + 1);
    console.log("2. After update (still old):", count);
    // count vẫn là giá trị cũ vì update chưa được xử lý
  }

  return <button onClick={handleClick}>Count: {count}</button>;
}
```

**Output khi click:**

```text
2. Before update: 0
2. After update (still old): 0
1. Render: 1
3. Effect: 1
```

### Tóm tắt

- ✅ React tự động batch các state updates
- ✅ Sử dụng functional updates khi phụ thuộc vào state trước đó
- ✅ State updates không đồng bộ - giá trị không thay đổi ngay lập tức
- ✅ Re-render xảy ra sau khi tất cả updates được xử lý
- ✅ Effects chạy sau khi render hoàn tất

---

## Tổng kết

Hiểu rõ các khái niệm trên giúp bạn:

1. **Tối ưu hiệu suất**: Giảm re-render không cần thiết với `memo`, `useCallback`, `useMemo`
2. **Hiểu cách React hoạt động**: Virtual DOM và diffing algorithm
3. **Sử dụng Key đúng cách**: Tránh bugs và tối ưu hiệu suất
4. **Quản lý State hiệu quả**: Hiểu batching và thứ tự thực thi

Hãy mở DevTools và quan sát console logs trong project này để thấy rõ các component nào được re-render và khi nào!
