import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { postsApi, Post, CreatePostDTO, UpdatePostDTO, PostQueryParams } from '../api/postsApi';
import { normalizeError } from '../utils/errorHandler';

// ============================================
// Query Keys - Hierarchical Structure
// ============================================

/**
 * Query keys factory
 * 
 * Benefits:
 * - Type-safe query key management
 * - Easy invalidation with hierarchical structure
 * - Prevents typos and inconsistencies
 */
export const postKeys = {
  // Root key
  all: ['posts'] as const,
  
  // List queries
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filters?: PostQueryParams) => [...postKeys.lists(), { filters }] as const,
  
  // Detail queries
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: number) => [...postKeys.details(), id] as const,
  
  // Paginated queries
  paginated: (params: PostQueryParams) => [...postKeys.all, 'paginated', params] as const,
  
  // Infinite queries
  infinite: (filters?: PostQueryParams) => [...postKeys.all, 'infinite', filters] as const,
};

// ============================================
// Query Hooks - useQuery Examples
// ============================================

/**
 * Hook to fetch list of posts
 * 
 * Query Lifecycle States:
 * - idle: Initial state before query runs
 * - loading: First fetch in progress
 * - success: Data fetched successfully
 * - error: Fetch failed
 * - refetching: Background refetch in progress
 */
export function usePosts(params?: PostQueryParams) {
  return useQuery({
    queryKey: postKeys.list(params),
    queryFn: () => postsApi.getPosts(params),
    staleTime: 1000 * 60 * 5, // 5 minutes - data is fresh for 5 min
    gcTime: 1000 * 60 * 10, // 10 minutes - cache time (formerly cacheTime)
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: true, // Refetch when component mounts
    refetchOnReconnect: true, // Refetch when network reconnects
    retry: 3, // Retry 3 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

/**
 * Hook to fetch a post by ID
 * 
 * Demonstrates:
 * - enabled option (conditional fetching)
 * - Type inference from queryFn
 */
export function usePost(id: number, options?: Omit<UseQueryOptions<Post>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => postsApi.getPostById(id),
    enabled: !!id, // Only fetch when id exists
    staleTime: 1000 * 60 * 5,
    ...options, // Allow override of default options
  });
}

/**
 * Hook with polling (refetch at intervals)
 * 
 * Demonstrates:
 * - refetchInterval for polling
 * - refetchIntervalInBackground
 */
export function usePostsWithPolling(interval: number = 5000) {
  return useQuery({
    queryKey: postKeys.lists(),
    queryFn: postsApi.getPosts,
    refetchInterval: interval, // Refetch every 5 seconds
    refetchIntervalInBackground: false, // Don't poll when tab is in background
  });
}

/**
 * Hook with prefetching
 * 
 * Demonstrates prefetch pattern
 */
export function usePrefetchPost() {
  const queryClient = useQueryClient();

  return (id: number) => {
    queryClient.prefetchQuery({
      queryKey: postKeys.detail(id),
      queryFn: () => postsApi.getPostById(id),
      staleTime: 1000 * 60 * 5,
    });
  };
}

// ============================================
// Infinite Query Hook
// ============================================

/**
 * Hook for infinite scroll / pagination
 * 
 * Demonstrates:
 * - useInfiniteQuery
 * - getNextPageParam
 * - getPreviousPageParam
 * - Deduplication (automatic)
 */
export function useInfinitePosts(params?: Omit<PostQueryParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: postKeys.infinite(params),
    queryFn: ({ pageParam = 1 }) =>
      postsApi.getPosts({ ...params, page: pageParam, limit: 10 }),
    getNextPageParam: (lastPage, allPages) => {
      // Return next page number or undefined if no more pages
      // In real app, check lastPage.hasNextPage or similar
      return allPages.length < 10 ? allPages.length + 1 : undefined; // Mock logic
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
  });
}

// ============================================
// Mutation Hooks - useMutation Examples
// ============================================

/**
 * Hook to create a new post
 * 
 * Demonstrates:
 * - Cache invalidation
 * - Optimistic updates (commented)
 * - Error handling
 */
export function useCreatePost(
  options?: Omit<UseMutationOptions<Post, Error, CreatePostDTO>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostDTO) => postsApi.createPost(data),
    onSuccess: () => {
      // Invalidate and refetch posts list after successful creation
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      
      // Alternative: Refetch immediately
      // queryClient.refetchQueries({ queryKey: postKeys.lists() });
    },
    onError: (error) => {
      // Normalize error for consistent error handling
      const normalizedError = normalizeError(error);
      console.error('Create post error:', normalizedError);
    },
    ...options,
  });
}

/**
 * Hook to update a post with optimistic updates
 * 
 * Demonstrates:
 * - Optimistic updates
 * - Rollback on error
 * - Cache updates
 */
export function useUpdatePost(
  options?: Omit<UseMutationOptions<Post, Error, { id: number; data: UpdatePostDTO }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePostDTO }) =>
      postsApi.updatePost(id, data),
    
    // Optimistic update
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: postKeys.detail(id) });

      // Snapshot previous value
      const previousPost = queryClient.getQueryData<Post>(postKeys.detail(id));

      // Optimistically update cache
      queryClient.setQueryData<Post>(postKeys.detail(id), (old) => {
        if (!old) return old;
        return { ...old, ...data };
      });

      // Also update in list cache
      queryClient.setQueryData<Post[]>(postKeys.lists(), (old) => {
        if (!old) return old;
        return old.map((post) => (post.id === id ? { ...post, ...data } : post));
      });

      // Return context for rollback
      return { previousPost };
    },
    
    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(postKeys.detail(variables.id), context.previousPost);
      }
    },
    
    // Invalidate after success
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
    
    ...options,
  });
}

/**
 * Hook to delete a post
 * 
 * Demonstrates:
 * - Cache invalidation
 * - Manual cache updates
 */
export function useDeletePost(
  options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => postsApi.deletePost(id),
    onSuccess: (_, deletedId) => {
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      
      // Remove from cache
      queryClient.removeQueries({ queryKey: postKeys.detail(deletedId) });
    },
    ...options,
  });
}
