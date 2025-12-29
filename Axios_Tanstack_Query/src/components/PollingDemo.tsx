import { usePostsWithPolling } from '../hooks/usePosts';

/**
 * Component demonstrating Polling
 * 
 * Polling = Automatic refetch at intervals
 * - refetchInterval: Time in milliseconds between refetches
 * - refetchIntervalInBackground: Whether to poll when tab is in background
 */
export function PollingDemo() {
  const { data: posts, isFetching, dataUpdatedAt } = usePostsWithPolling(5000);

  return (
    <div className="polling-demo">
      <h3>Polling Demo (refetch every 5 seconds)</h3>
      
      <div className="polling-info">
        <p>Is Fetching: {isFetching ? 'Yes' : 'No'}</p>
        <p>Last Updated: {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : 'Never'}</p>
      </div>

      <div className="posts-count">
        <p>Total Posts: {posts?.length || 0}</p>
      </div>

      {posts && posts.length > 0 && (
        <ul>
          {posts.slice(0, 5).map((post) => (
            <li key={post.id}>{post.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

