import { useState, useCallback } from 'react'

/**
 * Custom hook to toggle a boolean value
 * @param initialValue - The initial boolean value (default: false)
 * @returns [value, toggle, setValue] - Tuple with current value, toggle function, and setter
 */
function useToggle(initialValue: boolean = false): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState<boolean>(initialValue)

  const toggle = useCallback(() => {
    setValue((prev) => !prev)
  }, [])

  return [value, toggle, setValue]
}

export default useToggle

