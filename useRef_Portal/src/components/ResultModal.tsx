import React, { useImperativeHandle, useRef } from "react";
import { createPortal } from "react-dom";

interface ResultModalProps {
  targetTime: number;
  remainingTime: number;
  onReset: () => void;
  ref: React.Ref<ModalRef>;
}

export interface ModalRef {
  open: () => void;
}

function ResultModal({
  targetTime,
  remainingTime,
  onReset,
  ref,
}: ResultModalProps) {
  const dialog = useRef<HTMLDialogElement>(null);

  const userLost = remainingTime <= 0;
  const formattedRemainingTime = (remainingTime / 1000).toFixed(2);
  const score = Math.round((1 - remainingTime / (targetTime * 1000)) * 100);

  useImperativeHandle(ref, () => {
    return {
      open() {
        dialog.current?.showModal();
      },
    };
  });

  const modalContainer = document.getElementById("modal");

  if (!modalContainer) {
    console.error("Modal container not found");
    return null;
  }

  return createPortal(
    <dialog ref={dialog} className="result-modal" onClose={onReset}>
      {userLost && <h2>You lost</h2>}
      {!userLost && <h2>You score: {score}</h2>}
      <p>
        The target time was <strong>{targetTime} seconds.</strong>
      </p>
      <p>
        You stopped the timer with{" "}
        <strong>{formattedRemainingTime} second left.</strong>
      </p>
      <form method="dialog" onSubmit={onReset}>
        <button>Close</button>
      </form>
    </dialog>,
    modalContainer
  );
}

export default ResultModal;
