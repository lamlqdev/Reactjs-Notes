import { usePost } from '../hooks/usePosts';

/**
 * Component demonstrating Query Lifecycle States
 * 
 * Query Lifecycle:
 * - idle: Initial state before query runs
 * - loading: First fetch in progress (isLoading = true)
 * - success: Data fetched successfully (isSuccess = true, data available)
 * - error: Fetch failed (isError = true, error available)
 * - refetching: Background refetch in progress (isRefetching = true)
 */
export function QueryLifecycleDemo({ postId }: { postId: number }) {
  const {
    data,
    isLoading, // true when fetching for the first time
    isError, // true when query failed
    error, // error object
    isSuccess, // true when query succeeded
    isFetching, // true when fetching (including background refetch)
    isRefetching, // true when refetching in background
    isPending, // alias for isLoading (v5)
    status, // 'pending' | 'error' | 'success'
    fetchStatus, // 'fetching' | 'paused' | 'idle'
    refetch, // function to manually refetch
  } = usePost(postId);

  return (
    <div className="query-lifecycle-demo">
      <h3>Query Lifecycle States</h3>
      
      <div className="status-indicators">
        <div className={`status ${status === 'pending' ? 'active' : ''}`}>
          Status: {status}
        </div>
        <div className={`status ${fetchStatus === 'fetching' ? 'active' : ''}`}>
          Fetch Status: {fetchStatus}
        </div>
      </div>

      <div className="state-checks">
        <p>isLoading: {isLoading ? '✅' : '❌'}</p>
        <p>isPending: {isPending ? '✅' : '❌'}</p>
        <p>isFetching: {isFetching ? '✅' : '❌'}</p>
        <p>isRefetching: {isRefetching ? '✅' : '❌'}</p>
        <p>isSuccess: {isSuccess ? '✅' : '❌'}</p>
        <p>isError: {isError ? '✅' : '❌'}</p>
      </div>

      {isLoading && <div className="loading">Loading post...</div>}
      
      {isError && (
        <div className="error">
          Error: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      )}
      
      {isSuccess && data && (
        <div className="success">
          <h4>{data.title}</h4>
          <p>{data.body}</p>
        </div>
      )}

      <button onClick={() => refetch()} disabled={isFetching}>
        {isFetching ? 'Refetching...' : 'Manual Refetch'}
      </button>
    </div>
  );
}

