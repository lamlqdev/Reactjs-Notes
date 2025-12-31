import { useRef, useEffect } from 'react'

/**
 * Custom hook to get the previous value of a prop or state
 * @param value - The current value
 * @returns The previous value
 */
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

export default usePrevious

