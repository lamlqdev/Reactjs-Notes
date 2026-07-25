import { useState, useRef, useEffect } from "react";
import ResultModal, { ModalRef } from "./ResultModal";

interface TimeChallengeProps {
  title: string;
  targetime: number;
}

export default function TimeChallenge({
  title,
  targetime,
}: TimeChallengeProps) {
  const timer = useRef<number | undefined>(undefined);
  const dialog = useRef<ModalRef | null>(null);

  const [timeRemaining, setTimeRemaining] = useState<number>(targetime * 1000);

  const isTimerActive = timeRemaining > 0 && timeRemaining < targetime * 1000;

  useEffect(() => {
    if (timeRemaining <= 0) {
      if (timer.current) {
        clearInterval(timer.current);
      }
      dialog.current?.open();
    }
  }, [timeRemaining]);

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
      }
    };
  }, []);

  function handleReset() {
    setTimeRemaining(targetime * 1000);
  }

  function handleStart() {
    timer.current = setInterval(() => {
      setTimeRemaining((prevTimeRemaining) => prevTimeRemaining - 10);
    }, 10);
  }

  function handleStop() {
    if (timer.current) {
      clearInterval(timer.current);
    }
    dialog.current?.open();
  }

  return (
    <>
      <ResultModal
        ref={dialog}
        targetTime={targetime}
        remainingTime={timeRemaining}
        onReset={handleReset}
      />
      <section className="challenge">
        <h2>{title}</h2>
        <p className="challenge-time">
          {targetime} second{targetime > 1 ? "s" : ""}
        </p>
        <p>
          <button onClick={isTimerActive ? handleStop : handleStart}>
            {isTimerActive ? "Stop" : "Start"} challenge
          </button>
        </p>
        <p className={isTimerActive ? "active" : undefined}>
          {isTimerActive ? "Timer is running..." : "Timer inactive"}
        </p>
      </section>
    </>
  );
}
