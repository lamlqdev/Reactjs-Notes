import { useState } from "react";

import Counter from "./components/Counter/Counter.jsx";
import Header from "./components/Header.jsx";
import { log } from "./log.js";
import ConfigureCounter from "./components/Counter/ConfigureCounter.jsx";

function App() {
  log("<App /> rendered");

  const [chosenCount, setChosenCount] = useState(0);

  function handleSetCount(newCount) {
    setChosenCount(newCount);
    // Function form will ensure that we always get the latest value
    setChosenCount((prevCount) => prevCount + 1); 
  }

  return (
    <>
      <Header />
      <main>
        <ConfigureCounter onSetCount={handleSetCount} />
        <Counter key={chosenCount} initialCount={chosenCount} />
      </main>
    </>
  );
}

export default App;
