import { useInfinitePosts } from '../hooks/usePosts';

/**
 * Component demonstrating Infinite Query / Pagination
 * 
 * Features:
 * - Infinite scroll
 * - Automatic deduplication
 * - Pagination management
 */
export function InfiniteScrollDemo() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    status,
  } = useInfinitePosts();

  if (status === 'pending') {
    return <div>Loading...</div>;
  }

  if (status === 'error') {
    return <div>Error loading posts</div>;
  }

  return (
    <div className="infinite-scroll-demo">
      <h3>Infinite Scroll Demo</h3>
      
      <div className="posts-list">
        {data?.pages.map((page, pageIndex) => (
          <div key={pageIndex} className="page">
            {page.map((post) => (
              <div key={post.id} className="post-item">
                <h4>{post.title}</h4>
                <p>{post.body}</p>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="pagination-controls">
        {hasNextPage && (
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Loading more...' : 'Load More'}
          </button>
        )}
        
        {!hasNextPage && <p>No more posts to load</p>}
        
        {isFetching && !isFetchingNextPage && <p>Background refetching...</p>}
      </div>
    </div>
  );
}

