import { renderHook, act } from "@testing-library/react";
import { useCounter } from "./useCounter";

describe("useCounter hook", () => {
  test("initializes with default value of 0", () => {
    // Arrange
    // ... nothing

    // Act
    const { result } = renderHook(() => useCounter());

    // Assert
    expect(result.current.count).toBe(0);
  });

  test("initializes with custom initial value", () => {
    // Arrange
    // ... nothing

    // Act
    const { result } = renderHook(() => useCounter(5));

    // Assert
    expect(result.current.count).toBe(5);
  });

  test("increments count", () => {
    // Arrange
    const { result } = renderHook(() => useCounter(0));

    // Act
    act(() => {
      result.current.increment();
    });

    // Assert
    expect(result.current.count).toBe(1);
  });

  test("decrements count", () => {
    // Arrange
    const { result } = renderHook(() => useCounter(5));

    // Act
    act(() => {
      result.current.decrement();
    });

    // Assert
    expect(result.current.count).toBe(4);
  });

  test("resets count to initial value", () => {
    // Arrange
    const { result } = renderHook(() => useCounter(10));

    // Act
    act(() => {
      result.current.increment();
      result.current.increment();
    });

    // Assert
    expect(result.current.count).toBe(12);

    // Act
    act(() => {
      result.current.reset();
    });

    // Assert
    expect(result.current.count).toBe(10);
  });

  test("multiple increments", () => {
    // Arrange
    const { result } = renderHook(() => useCounter(0));

    // Act
    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.increment();
    });

    // Assert
    expect(result.current.count).toBe(3);
  });
});

