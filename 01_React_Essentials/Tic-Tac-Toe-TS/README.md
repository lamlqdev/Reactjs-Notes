# Tic-Tac-Toe — React useState Deep Dive (TypeScript)

This project builds a classic Tic-Tac-Toe game to explore how React's `useState` actually works — the mental model, the common pitfalls, and the design decisions that follow from understanding state correctly. The project is written in **TypeScript + Vite**.

---

## 1. Problem Overview

### 1.1 The Game

Two players take turns marking X or O on a 3×3 board. The first player to place three marks in a row (horizontally, vertically, or diagonally) wins. If all 9 squares are filled with no winner, the game is a draw.

![Tic-Tac-Toe Game](./public/tic-tac-game.png)

### 1.2 Technical Challenges

Building this game surfaces several concrete questions that require a correct mental model of React state to answer:

- How do we know whose turn it is?
- How do we update the board?
- Which component owns the data, which ones just display it?
- How do we let a player edit their name without affecting the running game?

---

## 2. useState Mental Model

Before examining design decisions, it's important to build a correct mental model of how `useState` works. Every design decision in this project follows directly from these four principles.

### 2.1 State is a snapshot of one render, not a live variable

`useState` does not return a variable you can reassign — it returns:

- A **frozen value** for this specific render
- A **setter function** to request a new render with a new value

```ts
type GameTurn = {
  square: { row: number; col: number };
  player: 'X' | 'O';
};

const [gameTurns, setGameTurns] = useState<GameTurn[]>([]);
```

`gameTurns` here is a local constant for this render — it does not change until the component renders again.

### 2.2 setState is a request, not an immediate update

Calling `setGameTurns(...)` does not change the current render's value. It tells React: "use this value for the *next* render." The current value stays unchanged until re-render.

```tsx
function handleSelectSquare(rowIndex: number, colIndex: number) {
  setGameTurns((prevGameTurns) => {
    // ...
    return updatedGameTurns;
  });
  // gameTurns here is still the OLD array — React has not re-rendered yet
}
```

**In this game:** After a player clicks a square, `setGameTurns` schedules a re-render. The current render's `gameTurns` does not change — the new value only appears in the next render cycle.

### 2.3 React remembers State — the Function component does not

On every render, the function component runs from scratch — all local variables are re-created from zero. React stores the actual state values **outside** the component, in its internal Fiber structure, keyed by the **order of hook calls**.

`useState([])` on subsequent renders does not re-initialize to `[]` — it asks React: *"what is the current value of hook N?"* and receives the stored value back, ignoring the initial argument entirely. This is why hooks cannot be called inside `if` statements or loops — React identifies which state belongs to which hook by position, not by variable name.

### 2.4 Functional update — when the new value depends on the previous one

When a state update depends on the previous value, use the callback form of the setter:

```tsx
setGameTurns((prevGameTurns) => {
  const currentPlayer = deriveActivePlayer(prevGameTurns);
  const updatedGameTurns: GameTurn[] = [
    { square: { row: rowIndex, col: colIndex }, player: currentPlayer },
    ...prevGameTurns,
  ];
  return updatedGameTurns;
});
```

React guarantees that `prevGameTurns` receives the **latest value from its update queue** — not whatever `gameTurns` the current closure holds. This prevents stale-value bugs when updates stack up.

---

## 3. Design Decisions

### 3.1 Derived State

**Question from Section 1.2:** *How do we know whose turn it is?*

**Derived State**: don't store values that can be calculated from existing data — keep one source of truth and compute the rest each render. Here, `gameTurns` is the only state; `activePlayer` and `gameBoard` are derived from it on every render instead of stored separately.

```ts
type PlayerSymbol = 'X' | 'O';
type GameTurn = {
  square: { row: number; col: number };
  player: PlayerSymbol;
};

function deriveActivePlayer(gameTurns: GameTurn[]): PlayerSymbol {
  if (gameTurns.length > 0 && gameTurns[0].player === 'X') {
    return 'O';
  }
  return 'X';
}
```

```ts
type SquareValue = PlayerSymbol | null;
type GameBoardState = SquareValue[][];

const gameBoard: GameBoardState = initialGameBoard.map((row) => [...row]);

for (const turn of gameTurns) {
  const { square, player } = turn;
  const { row, col } = square;
  gameBoard[row][col] = player;
}
```

### 3.2 Immutable Updates (Don't Mutate Directly)

**Question from Section 1.2:** *How do we update the board without subtle bugs?*

React detects changes by reference comparison, so mutating an array/object in place (`prevGameTurns.push(...)`) leaves the reference unchanged and React skips the re-render. Always build a new copy instead.

![Immutable Updates](./public/immutability.png)

```ts
const updatedGameTurns: GameTurn[] = [
  { square: { row: rowIndex, col: colIndex }, player: currentPlayer },
  ...prevGameTurns, // new array via spread
];
```

```ts
function handlePlayerNameChange(symbol: PlayerSymbol, newName: string) {
  setPlayers((prev) => ({ ...prev, [symbol]: newName })); // new object via spread
}
```

### 3.3 Functional State Updates

**Continuing from 3.2:** now that updates always build a new array, how do we guarantee it's built from the *latest* state and not a stale closure value? Pass a callback to the setter — React feeds it the latest queued value instead of whatever the current closure captured.

```ts
function handleSelectSquare(rowIndex: number, colIndex: number) {
  setGameTurns((prevGameTurns) => {
    const currentPlayer = deriveActivePlayer(prevGameTurns);
    const updatedGameTurns: GameTurn[] = [
      { square: { row: rowIndex, col: colIndex }, player: currentPlayer },
      ...prevGameTurns,
    ];
    return updatedGameTurns;
  });
}
```

### 3.4 Lifting State Up & Callback Props

**Question from Section 1.2:** *Which component owns the data, which ones just display it?*

**Lifting State Up**: `GameBoard`, `Log`, and `Player` all need data that comes from one source, so `App` owns the state and passes data down via props; children notify `App` of changes via callback props.

![Lifting State Up](./public/lifting-state-up.png)

```tsx
return (
  <main>
    <div id="game-container">
      <ol id="players" className="highlight-player">
        <Player
          initialName="Player 1"
          symbol="X"
          isActive={activePlayer === 'X'}
          onChangeName={handlePlayerNameChange}
        />
        <Player
          initialName="Player 2"
          symbol="O"
          isActive={activePlayer === 'O'}
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

**Component Tree:**

```text
App (state: players, gameTurns)
├── Player (X) - callback: onChangeName
├── Player (O) - callback: onChangeName
├── GameBoard - props: board, callback: onSelectSquare
├── GameOver - props: winner, callback: onRestart
└── Log - props: turns
```

### 3.5 Controlled Components & Two-Way Binding

**Question from Section 1.2:** *How do we let a player edit their name?*

**Controlled Components** are inputs whose value is driven entirely by React state: `value={state}` renders it, `onChange` updates it. This is React's "two-way binding."

**Example in this project:**

```tsx
const [playerName, setPlayerName] = useState(initialName);
const [isEditing, setIsEditing] = useState(false);

const handleClick = () => {
  setIsEditing((prev) => !prev);
  if (isEditing) {
    onChangeName(symbol, playerName);
  }
};

const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setPlayerName(event.target.value);
};

let playerNameContainer = <span className="player-name">{playerName}</span>;

if (isEditing) {
  playerNameContainer = (
    <input type="text" required value={playerName} onChange={handleChange} />
  );
}
```

**Flow:** Click "Edit" → input shown → typing updates `playerName` on every keystroke via `handleChange` → click "Save" → `onChangeName()` lifts the final value up to `App`.

### 3.6 Local State vs Shared State

**Question from Section 1.2:** *How do we let a player edit their name without affecting the running game?*

**Local State** stays within one component (UI-only concerns). **Shared State** lives in a parent and is passed down when multiple components need it.

```ts
const [playerName, setPlayerName] = useState<string>(initialName);
const [isEditing, setIsEditing] = useState<boolean>(false);
```

`playerName` and `isEditing` are local to `Player` — only on "Save" does `onChangeName(symbol, playerName)` promote the value to shared state in `App`. 

Rule of thumb: keep state local unless another component needs it or it drives app logic (like `players`, `gameTurns`).

---

## 4. Supporting Techniques

These are the practical React mechanics that make the Section 3 design decisions work correctly. They are not architectural choices — they are tools.

### 4.1 Key Prop and Render Lists

**Key Prop** is a special property that helps React identify each element in a list. Keys must be unique and stable.

**Example in this project:**

```tsx
// src/components/Log.tsx
{turns.map((turn) => (
  <li key={`${turn.square.row}${turn.square.col}`}>
    {turn.player} selected {turn.square.row},{turn.square.col}
  </li>
))}
```

```tsx
// src/components/GameBoard.tsx
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

Key lets React identify what changed, was added, or removed — avoid index as key when the list can reorder, and keep keys unique and stable across renders.

---

## 5. App Flow

This section shows how the system works end-to-end. Each flow references the mental model and design decisions from earlier sections.

### 5.1 Initialization

```ts
type Players = Record<'X' | 'O', string>;

const [players, setPlayers] = useState<Players>({ X: 'Player 1', O: 'Player 2' });
const [gameTurns, setGameTurns] = useState<GameTurn[]>([]);
```

On first render:
- `players` holds default names
- `gameTurns` is an empty array (snapshot: `[]`)
- `gameBoard` is derived as all-null 3×3 grid
- `activePlayer` is derived as `'X'` (no turns yet)
- `winner` and `hasDraw` are both falsy — `GameOver` is not shown

### 5.2 Player Selects a Square (Main Flow)

```
1. Player clicks a square on GameBoard
2. onSelectSquare(rowIndex, colIndex) is called
3. handleSelectSquare calls setGameTurns(prev => ...)         [see 2.4, 3.3]
4. React schedules a re-render — gameTurns in current render unchanged   [see 2.2]
5. Re-render: React returns updated gameTurns from Fiber      [see 2.3]
6. gameBoard is re-derived from new gameTurns                 [see 3.1]
7. activePlayer is re-derived from new gameTurns              [see 3.1]
8. winner and hasDraw are re-computed from gameBoard
9. UI reflects new snapshot: board updates, active player switches  [see 2.1]
```

### 5.3 Player Edits Their Name

```
1. Player clicks "Edit" on Player component
2. setIsEditing(true) — local state, only Player re-renders  [see 3.6]
3. Input appears with value={playerName}                      [see 3.5]
4. Player types — each keystroke: handleChange → setPlayerName(event.target.value)
5. Player clicks "Save"
6. setIsEditing(false) — hides input, shows span
7. onChangeName(symbol, playerName) — callback to App        [see 3.4]
8. handlePlayerNameChange: setPlayers(prev => ({ ...prev, [symbol]: newName }))
9. App re-renders with updated player name                   [see 3.2]
```

### 5.4 Game End and Restart

```
1. After a turn, winner or hasDraw is derived during render  [see 3.1]
2. (winner || hasDraw) === true → GameOver component renders
3. Player clicks "Restart"
4. handleRestart calls setGameTurns([])
5. gameTurns resets to empty snapshot []                     [see 2.1]
6. All derived values re-compute to initial state
7. GameOver unmounts, GameBoard clears
```

---

## Summary

| Mental Model | Design Decision | Technique |
|---|---|---|
| State is a snapshot (2.1) | Derived State (3.1) | Key Prop (4.1) |
| setState is a request (2.2) | Immutable Updates (3.2) | Event Handlers with params (4.2) |
| React remembers state (2.3) | Functional Updates (3.3) | Domain Logic separation (4.3) |
| Functional update (2.4) | Lifting State Up (3.4) | |
| | Controlled Components (3.5) | |
| | Local vs Shared State (3.6) | |

The mental model (Section 2) is the foundation. Every design decision (Section 3) follows from it. The supporting techniques (Section 4) are the tools that make those decisions work in React. Section 5 shows them all working together.
