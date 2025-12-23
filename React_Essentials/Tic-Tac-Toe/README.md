# Tic-Tac-Toe – Tổng hợp kiến thức React (Deep Dive)

Tài liệu này tổng hợp các kiến thức React nâng cao thông qua dự án Tic-Tac-Toe. Dự án này minh họa các khái niệm quan trọng như derived state, functional updates, immutable updates, lifting state up, controlled components, và nhiều kỹ thuật khác.

---

## 1. Core Concepts

### 1.1. Derived State (Tránh lưu state thừa)

**Derived State** là khái niệm không lưu những giá trị có thể tính được từ dữ liệu sẵn có. Chỉ lưu "single source of truth" và tính toán các giá trị khác từ đó.

**Ví dụ trong project:**

Trong dự án Tic-Tac-Toe, chúng ta không lưu `activePlayer` và `gameBoard` vào state. Thay vào đó, chúng được tính toán từ `gameTurns` mỗi lần component render.

```15:21:src/App.js
function deriveActivePlayer(gameTurns) {
  let currentPlayer = "X";
  if (gameTurns.length > 0 && gameTurns[0].player === "X") {
    currentPlayer = "O";
  }
  return currentPlayer;
}
```

```27:34:src/App.js
  let gameBoard = [...initialGameBoard.map((innerArray) => [...innerArray])];
  let winner;

  for (const turn of gameTurns) {
    const { square, player } = turn;
    const { row, col } = square;
    gameBoard[row][col] = player;
  }
```

**Giải thích:**

- `activePlayer` được tính từ `gameTurns` bằng hàm `deriveActivePlayer()`
- `gameBoard` được tính lại mỗi lần render dựa trên `gameTurns`
- Chỉ `gameTurns` được lưu trong state, đây là "single source of truth"

**Lợi ích:**

- Giảm rủi ro lệch state (state không đồng bộ)
- Đơn giản hóa việc cập nhật state
- Dễ debug vì chỉ có một nguồn dữ liệu chính

### 1.2. Functional State Updates (Tránh stale closures)

**Functional State Updates** là kỹ thuật sử dụng callback function khi cập nhật state phụ thuộc vào giá trị trước đó. Điều này giúp tránh vấn đề stale closures.

**Ví dụ trong project:**

Khi thêm lượt chơi mới, chúng ta cần dựa vào `gameTurns` hiện tại để xác định người chơi tiếp theo:

```57:67:src/App.js
  function handleSelectSquare(rowIndex, colIndex) {
    setGameTurns((preGameTurns) => {
      const currentPlayer = deriveActivePlayer(preGameTurns);

      const updatedGameTurns = [
        { square: { row: rowIndex, col: colIndex }, player: currentPlayer },
        ...preGameTurns,
      ];
      return updatedGameTurns;
    });
  }
```

**Giải thích:**

- `setGameTurns((preGameTurns) => ...)` nhận giá trị state trước đó làm tham số
- `deriveActivePlayer(preGameTurns)` tính người chơi hiện tại dựa trên state cũ
- Đảm bảo luôn sử dụng giá trị state mới nhất, tránh stale closures

**Khi nào cần dùng:**

- Khi cập nhật state phụ thuộc vào giá trị trước đó
- Khi có nhiều state updates liên tiếp
- Khi muốn đảm bảo tính nhất quán của state

### 1.3. Immutable Updates (Không mutate trực tiếp)

**Immutable Updates** là nguyên tắc luôn tạo bản sao mới cho mảng/đối tượng khi cập nhật state, không thay đổi trực tiếp giá trị cũ.

**Ví dụ trong project:**

```61:65:src/App.js
      const updatedGameTurns = [
        { square: { row: rowIndex, col: colIndex }, player: currentPlayer },
        ...preGameTurns,
      ];
      return updatedGameTurns;
```

```73:80:src/App.js
  function handlePlayerNameChange(symbol, newName) {
    setPlayers((prevPlayer) => {
      return {
        ...prevPlayer,
        [symbol]: newName,
      };
    });
  }
```

**Giải thích:**

- `[...preGameTurns]` tạo mảng mới bằng spread operator
- `{ ...prevPlayer, [symbol]: newName }` tạo object mới với thuộc tính được cập nhật
- Không bao giờ mutate trực tiếp: `preGameTurns.push(...)` hoặc `prevPlayer[symbol] = newName`

**Lợi ích:**

- React có thể phát hiện thay đổi và re-render
- Tránh bugs khó phát hiện
- Hỗ trợ tốt cho các tính năng như time-travel debugging

### 1.4. Lifting State Up & Callback Props

**Lifting State Up** là kỹ thuật quản lý state chung ở component cha và truyền dữ liệu xuống component con qua props. Component con có thể thông báo thay đổi lên cha qua callback functions.

**Ví dụ trong project:**

`App` component quản lý tất cả state quan trọng và truyền xuống các component con:

```82:105:src/App.js
  return (
    <main>
      <div id="game-container">
        <ol id="players" className="highlight-player">
          <Player
            initialName="Player 1"
            symbol="X"
            isActive={activePlayer === "X"}
            onChangeName={handlePlayerNameChange}
          />
          <Player
            initialName="Player 2"
            symbol="O"
            isActive={activePlayer === "O"}
            onChangeName={handlePlayerNameChange}
          />
        </ol>
        {(winner || hasDraw) && (
          <GameOver winner={winner} onRestart={handleRestart} />
        )}
        <GameBoard onSelectSquare={handleSelectSquare} board={gameBoard} />
      </div>
      <Log turns={gameTurns} />
    </main>
  );
```

**Giải thích:**

- `App` quản lý: `players`, `gameTurns`, `gameBoard`, `winner`, `hasDraw`
- Truyền callback xuống: `onSelectSquare` cho `GameBoard`, `onChangeName` cho `Player`
- Truyền dữ liệu xuống: `board` cho `GameBoard`, `turns` cho `Log`

**Component Tree:**

```text
App (state: players, gameTurns)
├── Player (X) - callback: onChangeName
├── Player (O) - callback: onChangeName
├── GameBoard - props: board, callback: onSelectSquare
├── GameOver - props: winner, callback: onRestart
└── Log - props: turns
```

### 1.5. Controlled Components & Two-Way Binding

**Controlled Components** là các input elements mà giá trị được kiểm soát hoàn toàn bởi React state. Đây là cách React thực hiện "two-way binding" - state điều khiển UI và UI cập nhật state.

**Ví dụ trong project:**

Component `Player` sử dụng controlled input để chỉnh sửa tên người chơi:

```9:29:src/components/Player.js
  const [playerName, setPlayerName] = useState(initialName);
  const [isEditting, setIsEditting] = useState(false);

  const handleClick = () => {
    setIsEditting((prevIsEditting) => !prevIsEditting);
    if (isEditting) {
      onChangeName(symbol, playerName);
    }
  };

  const handleChange = (event) => {
    setPlayerName(event.target.value);
  };

  let playerNameContainer = <span className="player-name">{playerName}</span>;

  if (isEditting) {
    playerNameContainer = (
      <input type="text" required value={playerName} onChange={handleChange} />
    );
  }
```

**Giải thích:**

- `value={playerName}` - giá trị input được kiểm soát bởi state
- `onChange={handleChange}` - mỗi khi người dùng gõ, state được cập nhật
- `setPlayerName(event.target.value)` - cập nhật state từ giá trị input
- Đây là "two-way binding": state → UI (qua `value`) và UI → state (qua `onChange`)

**Luồng hoạt động:**

1. Người dùng click "Edit" → `isEditting` thành `true` → hiển thị input
2. Người dùng gõ → `onChange` trigger → `setPlayerName()` cập nhật state
3. State thay đổi → React re-render → input hiển thị giá trị mới
4. Người dùng click "Save" → `onChangeName()` được gọi → cập nhật state ở `App`

### 1.6. Local State vs Shared State

**Local State** là state chỉ được sử dụng trong một component. **Shared State** là state được chia sẻ giữa nhiều component và được quản lý ở component cha.

**Ví dụ trong project:**

Component `Player` sử dụng cả local state và callback để sync với shared state:

```9:10:src/components/Player.js
  const [playerName, setPlayerName] = useState(initialName);
  const [isEditting, setIsEditting] = useState(false);
```

**Giải thích:**

- `playerName` và `isEditting` là **local state** - chỉ dùng trong `Player` component
- Khi nhấn "Save", `onChangeName(symbol, playerName)` được gọi để cập nhật **shared state** ở `App`
- Local state quản lý UI (hiển thị input hay span), shared state quản lý dữ liệu game (tên người chơi)

**Khi nào dùng local state:**

- State chỉ liên quan đến UI của component đó (như `isEditting`)
- State tạm thời không cần chia sẻ (như giá trị input khi đang edit)

**Khi nào dùng shared state:**

- Dữ liệu cần chia sẻ giữa nhiều component
- Dữ liệu quan trọng cho logic ứng dụng (như `players`, `gameTurns`)

---

## 2. Advanced Techniques

### 2.1. Conditional Rendering & Dynamic Classes

**Conditional Rendering** là kỹ thuật hiển thị nội dung khác nhau dựa trên điều kiện. **Dynamic Classes** là áp dụng class CSS động dựa trên state hoặc props.

**Ví dụ trong project:**

```99:101:src/App.js
        {(winner || hasDraw) && (
          <GameOver winner={winner} onRestart={handleRestart} />
        )}
```

```32:32:src/components/Player.js
    <li className={isActive ? "active" : undefined}>
```

**Giải thích:**

- `{(winner || hasDraw) && <GameOver />}` - chỉ hiển thị `GameOver` khi game kết thúc
- `className={isActive ? "active" : undefined}` - thêm class `active` khi player đang đến lượt
- Toán tử `&&` và ternary operator được sử dụng để render có điều kiện

**Các cách conditional rendering:**

```jsx
// Cách 1: Toán tử &&
{
  condition && <Component />;
}

// Cách 2: Ternary operator
{
  condition ? <ComponentA /> : <ComponentB />;
}

// Cách 3: if-else trong function
function renderContent() {
  if (condition) return <ComponentA />;
  return <ComponentB />;
}
```

### 2.2. Key Prop và Render Lists

**Key Prop** là thuộc tính đặc biệt giúp React nhận diện từng phần tử trong danh sách. Key phải unique và stable.

**Ví dụ trong project:**

```4:8:src/components/Log.js
      {turns.map((turn) => (
        <li key={`${turn.square.row}${turn.square.col}`}>
          {turn.player} select {turn.square.row},{turn.square.col}
        </li>
      ))}
```

```4:18:src/components/GameBoard.js
      {board.map((row, rowIndex) => (
        <li key={rowIndex}>
          <ol>
            {row.map((playerSymbol, colIndex) => (
              <li key={colIndex}>
                <button
                  onClick={() => onSelectSquare(rowIndex, colIndex)}
                  disabled={playerSymbol !== null}
                >
                  {playerSymbol}
                </button>
              </li>
            ))}
          </ol>
        </li>
      ))}
```

**Giải thích:**

- `Log` dùng key kết hợp từ `row` và `col` - unique và stable cho mỗi lượt chơi
- `GameBoard` dùng `rowIndex` và `colIndex` - ổn định trong ngữ cảnh lưới tĩnh 3x3
- Key giúp React nhận biết phần tử nào thay đổi, thêm, hoặc xóa

**Lưu ý:**

- Không dùng index làm key nếu danh sách có thể thay đổi thứ tự
- Key phải unique trong cùng một danh sách
- Key không được thay đổi giữa các lần render

### 2.3. Event Handlers với Parameters

Khi cần truyền tham số cho event handler, chúng ta sử dụng arrow function hoặc bind.

**Ví dụ trong project:**

```9:10:src/components/GameBoard.js
                  onClick={() => onSelectSquare(rowIndex, colIndex)}
                  disabled={playerSymbol !== null}
```

**Giải thích:**

- `onClick={() => onSelectSquare(rowIndex, colIndex)}` - arrow function để truyền `rowIndex` và `colIndex`
- Không thể viết `onClick={onSelectSquare(rowIndex, colIndex)}` vì sẽ gọi function ngay lập tức
- Arrow function tạo một function mới mỗi lần render, nhưng trong trường hợp này là acceptable

**Các cách truyền parameters:**

```jsx
// Cách 1: Arrow function (phổ biến nhất)
<button onClick={() => handleClick(id)}>Click</button>

// Cách 2: Bind (ít dùng)
<button onClick={handleClick.bind(null, id)}>Click</button>

// Cách 3: Wrapper function
const handleClickWrapper = () => handleClick(id);
<button onClick={handleClickWrapper}>Click</button>
```

### 2.4. Disabled State

**Disabled State** là thuộc tính HTML giúp vô hiệu hóa một element, thường dùng cho buttons và inputs.

**Ví dụ trong project:**

```11:11:src/components/GameBoard.js
                  disabled={playerSymbol !== null}
```

**Giải thích:**

- Button bị disabled khi `playerSymbol !== null` (ô đã được chọn)
- Ngăn người chơi chọn lại ô đã có ký hiệu
- Disabled buttons không thể click và có style khác (thường mờ hơn)

### 2.5. Tách biệt Logic Domain

**Separation of Concerns** là nguyên tắc tách logic nghiệp vụ (domain logic) ra khỏi component để dễ bảo trì và test.

**Ví dụ trong project:**

Các tổ hợp thắng được tách vào file riêng:

```1:42:src/winning-combination.js
export const WINNING_COMBINATIONS = [
  [
    { row: 0, column: 0 },
    { row: 0, column: 1 },
    { row: 0, column: 2 },
  ],
  [
    { row: 1, column: 0 },
    { row: 1, column: 1 },
    { row: 1, column: 2 },
  ],
  [
    { row: 2, column: 0 },
    { row: 2, column: 1 },
    { row: 2, column: 2 },
  ],
  [
    { row: 0, column: 0 },
    { row: 1, column: 0 },
    { row: 2, column: 0 },
  ],
  [
    { row: 0, column: 1 },
    { row: 1, column: 1 },
    { row: 2, column: 1 },
  ],
  [
    { row: 0, column: 2 },
    { row: 1, column: 2 },
    { row: 2, column: 2 },
  ],
  [
    { row: 0, column: 0 },
    { row: 1, column: 1 },
    { row: 2, column: 2 },
  ],
  [
    { row: 0, column: 2 },
    { row: 1, column: 1 },
    { row: 2, column: 0 },
  ],
];
```

```38:53:src/App.js
  for (const combination of WINNING_COMBINATIONS) {
    const firstSquareSymbol =
      gameBoard[combination[0].row][combination[0].column];
    const secondSquareSymbol =
      gameBoard[combination[1].row][combination[1].column];
    const thirdSquareSymbol =
      gameBoard[combination[2].row][combination[2].column];

    if (
      firstSquareSymbol &&
      firstSquareSymbol === secondSquareSymbol &&
      firstSquareSymbol === thirdSquareSymbol
    ) {
      winner = players[firstSquareSymbol];
    }
  }
```

**Giải thích:**

- `WINNING_COMBINATIONS` chứa dữ liệu domain (8 tổ hợp thắng)
- Logic kiểm tra thắng được tách ra khỏi component
- Dễ test và tái sử dụng

**Lợi ích:**

- Code dễ đọc và bảo trì
- Logic có thể test độc lập
- Có thể tái sử dụng ở nơi khác

### 2.6. Thuật toán kiểm tra thắng và xử lý hòa

**Game Logic** bao gồm việc kiểm tra điều kiện thắng và xử lý trường hợp hòa.

**Ví dụ trong project:**

```38:55:src/App.js
  for (const combination of WINNING_COMBINATIONS) {
    const firstSquareSymbol =
      gameBoard[combination[0].row][combination[0].column];
    const secondSquareSymbol =
      gameBoard[combination[1].row][combination[1].column];
    const thirdSquareSymbol =
      gameBoard[combination[2].row][combination[2].column];

    if (
      firstSquareSymbol &&
      firstSquareSymbol === secondSquareSymbol &&
      firstSquareSymbol === thirdSquareSymbol
    ) {
      winner = players[firstSquareSymbol];
    }
  }

  const hasDraw = gameTurns.length === 9 && !winner;
```

**Giải thích:**

- Duyệt qua 8 tổ hợp thắng (3 hàng, 3 cột, 2 đường chéo)
- Kiểm tra nếu 3 ô có cùng ký hiệu và không null → có người thắng
- Nếu đủ 9 lượt mà không có người thắng → hòa

**Điều kiện thắng:**

- Ba ô cùng hàng có cùng ký hiệu
- Ba ô cùng cột có cùng ký hiệu
- Ba ô đường chéo có cùng ký hiệu

**Điều kiện hòa:**

- Đã có 9 lượt chơi (`gameTurns.length === 9`)
- Không có người thắng (`!winner`)

---

## 3. Examples

Hãy cùng phân tích code trong project để hiểu cách các khái niệm trên được áp dụng.

### 3.1. Component Structure

#### Ví dụ 1: Component App - Quản lý state chính

```23:36:src/App.js
function App() {
  const [players, setPlayers] = useState({ X: "Player 1", O: "Player 2" });
  const [gameTurns, setGameTurns] = useState([]);

  let gameBoard = [...initialGameBoard.map((innerArray) => [...innerArray])];
  let winner;

  for (const turn of gameTurns) {
    const { square, player } = turn;
    const { row, col } = square;
    gameBoard[row][col] = player;
  }

  const activePlayer = deriveActivePlayer(gameTurns);
```

**Giải thích:**

- `App` là component chính quản lý toàn bộ state của game
- Chỉ lưu `players` và `gameTurns` trong state
- `gameBoard`, `winner`, `activePlayer` được tính toán từ state (derived state)

#### Ví dụ 2: Component Player - Controlled Input

```3:40:src/components/Player.js
export default function Player({
  initialName,
  symbol,
  isActive,
  onChangeName,
}) {
  const [playerName, setPlayerName] = useState(initialName);
  const [isEditting, setIsEditting] = useState(false);

  const handleClick = () => {
    setIsEditting((prevIsEditting) => !prevIsEditting);
    if (isEditting) {
      onChangeName(symbol, playerName);
    }
  };

  const handleChange = (event) => {
    setPlayerName(event.target.value);
  };

  let playerNameContainer = <span className="player-name">{playerName}</span>;

  if (isEditting) {
    playerNameContainer = (
      <input type="text" required value={playerName} onChange={handleChange} />
    );
  }

  return (
    <li className={isActive ? "active" : undefined}>
      <span className="player">
        {playerNameContainer}
        <span className="player-symbol">{symbol}</span>
      </span>
      <button onClick={handleClick}>{isEditting ? "Save" : "Edit"}</button>
    </li>
  );
}
```

**Giải thích:**

- Sử dụng local state (`playerName`, `isEditting`) để quản lý UI
- Controlled input với `value={playerName}` và `onChange={handleChange}`
- Conditional rendering để hiển thị input hoặc span
- Callback `onChangeName` để sync với shared state ở `App`

#### Ví dụ 3: Component GameBoard - Render nested lists

```1:22:src/components/GameBoard.js
export default function GameBoard({ onSelectSquare, board }) {
  return (
    <ol id="game-board">
      {board.map((row, rowIndex) => (
        <li key={rowIndex}>
          <ol>
            {row.map((playerSymbol, colIndex) => (
              <li key={colIndex}>
                <button
                  onClick={() => onSelectSquare(rowIndex, colIndex)}
                  disabled={playerSymbol !== null}
                >
                  {playerSymbol}
                </button>
              </li>
            ))}
          </ol>
        </li>
      ))}
    </ol>
  );
}
```

**Giải thích:**

- Render nested lists (mảng 2 chiều) với `.map()` lồng nhau
- Key prop cho cả row và col
- Event handler với parameters qua arrow function
- Disabled state để ngăn chọn lại ô đã có ký hiệu

### 3.2. Luồng hoạt động của ứng dụng

#### Bước 1: Khởi tạo

```23:25:src/App.js
  const [players, setPlayers] = useState({ X: "Player 1", O: "Player 2" });
  const [gameTurns, setGameTurns] = useState([]);
```

- `players` được khởi tạo với tên mặc định
- `gameTurns` là mảng rỗng
- `gameBoard` được tính từ `gameTurns` (tất cả null)
- `activePlayer` là "X" (người chơi đầu tiên)

#### Bước 2: Người chơi chọn ô

1. Người chơi click vào một ô trên `GameBoard`
2. `onSelectSquare(rowIndex, colIndex)` được gọi
3. `handleSelectSquare` được thực thi:

```57:67:src/App.js
  function handleSelectSquare(rowIndex, colIndex) {
    setGameTurns((preGameTurns) => {
      const currentPlayer = deriveActivePlayer(preGameTurns);

      const updatedGameTurns = [
        { square: { row: rowIndex, col: colIndex }, player: currentPlayer },
        ...preGameTurns,
      ];
      return updatedGameTurns;
    });
  }
```

4. State `gameTurns` được cập nhật với lượt chơi mới
5. React re-render component

#### Bước 3: Tính toán derived state

Sau khi state thay đổi, React re-render và tính toán lại:

- `gameBoard` được tính lại từ `gameTurns`
- `activePlayer` được tính lại từ `gameTurns`
- `winner` được kiểm tra từ `gameBoard`
- `hasDraw` được kiểm tra nếu có 9 lượt

#### Bước 4: Cập nhật UI

- `GameBoard` hiển thị ký hiệu mới
- `Player` component có `isActive` được cập nhật
- `Log` hiển thị lượt chơi mới
- Nếu có `winner` hoặc `hasDraw`, `GameOver` được hiển thị

### 3.3. Ví dụ: Chỉnh sửa tên người chơi

#### Luồng hoạt động

1. **Người chơi click "Edit":**

   - `handleClick()` được gọi
   - `setIsEditting(true)` → hiển thị input

2. **Người chơi gõ tên mới:**

   - `handleChange(event)` được gọi mỗi lần gõ
   - `setPlayerName(event.target.value)` cập nhật local state
   - Input hiển thị giá trị mới (controlled component)

3. **Người chơi click "Save":**

   - `handleClick()` được gọi lại
   - `setIsEditting(false)` → ẩn input
   - `onChangeName(symbol, playerName)` được gọi
   - `handlePlayerNameChange` ở `App` cập nhật shared state

4. **State được sync:**
   - `players` state ở `App` được cập nhật
   - Tên mới được hiển thị ở tất cả nơi sử dụng `players`

---

## 📝 Tóm tắt

### Các khái niệm đã học

1. **Derived State**: Tính toán giá trị từ state thay vì lưu trữ
2. **Functional State Updates**: Sử dụng callback để cập nhật state dựa trên giá trị trước đó
3. **Immutable Updates**: Luôn tạo bản sao mới khi cập nhật state
4. **Lifting State Up**: Quản lý state chung ở component cha
5. **Controlled Components**: Two-way binding với input elements
6. **Local vs Shared State**: Phân biệt state chỉ dùng trong component và state chia sẻ
7. **Conditional Rendering**: Hiển thị nội dung dựa trên điều kiện
8. **Key Prop**: Giúp React nhận diện phần tử trong danh sách
9. **Event Handlers với Parameters**: Truyền tham số cho event handlers
10. **Separation of Concerns**: Tách logic domain ra khỏi component

### Các kỹ thuật đã thực hành

- Tính toán derived state từ single source of truth
- Sử dụng functional updates để tránh stale closures
- Tạo immutable updates với spread operator
- Quản lý state ở component cha và truyền callback xuống con
- Sử dụng controlled components cho two-way binding
- Phân biệt local state và shared state
- Conditional rendering với toán tử logic
- Render nested lists với key prop
- Xử lý events với parameters
- Tách logic domain vào module riêng

### Lưu ý quan trọng

1. **Single Source of Truth**: Chỉ lưu dữ liệu cần thiết, tính toán phần còn lại
2. **Functional Updates**: Luôn dùng callback khi cập nhật state phụ thuộc giá trị trước đó
3. **Immutable Updates**: Không bao giờ mutate trực tiếp state
4. **Controlled Components**: Luôn dùng `value` và `onChange` cho inputs
5. **Key Prop**: Luôn cần key unique và stable khi render lists
6. **Event Handlers**: Truyền function, không gọi function (dùng arrow function)

---
