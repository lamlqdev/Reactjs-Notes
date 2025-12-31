import { useState, useEffect } from 'react'

interface UseFetchState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

interface UseFetchOptions {
  skip?: boolean // Skip the fetch on mount
}

/**
 * Custom hook to fetch data from an API
 * @param url - The URL to fetch from
 * @param options - Optional configuration
 * @returns Object with data, loading, error, and refetch function
 */
function useFetch<T = unknown>(
  url: string,
  options?: UseFetchOptions
): UseFetchState<T> & { refetch: () => void } {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: !options?.skip,
    error: null,
  })

  const fetchData = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setState({ data, loading: false, error: null })
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error : new Error('An unknown error occurred'),
      })
    }
  }

  useEffect(() => {
    if (!options?.skip) {
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, options?.skip])

  return { ...state, refetch: fetchData }
}

export default useFetch

