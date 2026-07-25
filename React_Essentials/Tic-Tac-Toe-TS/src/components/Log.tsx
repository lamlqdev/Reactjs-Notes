type PlayerSymbol = 'X' | 'O';

type GameTurn = {
  square: { row: number; col: number };
  player: PlayerSymbol;
};

type LogProps = {
  turns: GameTurn[];
};

export default function Log({ turns }: LogProps) {
  return (
    <ol id="log">
      {turns.map((turn) => (
        <li key={`${turn.square.row}${turn.square.col}`}>
          {turn.player} selected {turn.square.row},{turn.square.col}
        </li>
      ))}
    </ol>
  );
}
