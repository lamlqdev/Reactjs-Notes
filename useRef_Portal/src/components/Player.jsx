import { useState, useRef } from "react";

export default function Player() {
  const name = useRef();
  const [playerName, setPlayerName] = useState("Unknow");

  function handleClick() {
    setPlayerName(name.current.value || "Unknown");
    name.current.value = "";
  }

  return (
    <section id="player">
      <h2>Welcome {playerName || "Unknown"}</h2>
      <p>
        <input type="text" ref={name} />
        <button onClick={handleClick}>Set Name</button>
      </p>
    </section>
  );
}
