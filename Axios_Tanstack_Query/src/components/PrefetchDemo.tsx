import { usePrefetchPost } from '../hooks/usePosts';
import { useState } from 'react';

/**
 * Component demonstrating Prefetching
 * 
 * Prefetching = Fetch data before user needs it
 * - Improves perceived performance
 * - Data ready when user navigates
 */
export function PrefetchDemo() {
  const prefetchPost = usePrefetchPost();
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const postIds = [1, 2, 3, 4, 5];

  return (
    <div className="prefetch-demo">
      <h3>Prefetch Demo (hover to prefetch)</h3>
      <p>Hover over a post link to prefetch its data</p>
      
      <div className="post-links">
        {postIds.map((id) => (
          <div
            key={id}
            className={`post-link ${hoveredId === id ? 'hovered' : ''}`}
            onMouseEnter={() => {
              setHoveredId(id);
              prefetchPost(id); // Prefetch on hover
            }}
            onMouseLeave={() => setHoveredId(null)}
          >
            <a href={`#post-${id}`}>Post #{id}</a>
            {hoveredId === id && <span className="prefetch-indicator">Prefetching...</span>}
          </div>
        ))}
      </div>
      
      <p className="info">
        When you click a link, the data is already cached, so it loads instantly!
      </p>
    </div>
  );
}

