import { useState } from "react";

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
