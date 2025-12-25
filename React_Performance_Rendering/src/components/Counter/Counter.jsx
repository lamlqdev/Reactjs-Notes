import { useState, memo, useCallback, useMemo } from "react";

import IconButton from "../UI/IconButton.jsx";
import MinusIcon from "../UI/Icons/MinusIcon.jsx";
import PlusIcon from "../UI/Icons/PlusIcon.jsx";
import CounterOutput from "./CounterOutput.jsx";
import CounterHistory from "./CounterHistory.jsx";
import { log } from "../../log.js";

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

  //const [counter, setCounter] = useState(initialCount);
  const [counterChangers, setCounterChangers] = useState([
    { value: initialCount, id: Math.random() * 1000 },
  ]);
  const currentCounter = counterChangers.reduce(
    (prevCounter, counterChanger) => prevCounter + counterChanger.value,
    0
  );

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

  return (
    <section className="counter">
      <p className="counter-info">
        The initial counter value was <strong>{initialCount}</strong>. It{" "}
        <strong>is {initialCountIsPrime ? "a" : "not a"}</strong> prime number.
      </p>
      <p>
        <IconButton icon={MinusIcon} onClick={handleDecrement}>
          Decrement
        </IconButton>
        <CounterOutput value={currentCounter} />
        <IconButton icon={PlusIcon} onClick={handleIncrement}>
          Increment
        </IconButton>
      </p>
      <CounterHistory history={counterChangers} />
    </section>
  );
};

export default Counter;
