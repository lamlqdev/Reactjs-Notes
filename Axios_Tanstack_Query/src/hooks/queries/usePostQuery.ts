import { useQuery, useQueryClient } from "@tanstack/react-query";
import { postApi } from "../../api/post.api";
import { queryKeys } from "../../constants/queryKeys";

export function usePosts() {
  return useQuery({
    queryKey: queryKeys.posts.lists(),
    queryFn: postApi.getPosts,
  });
}

export function usePost(id: number) {
  return useQuery({
    queryKey: queryKeys.posts.detail(id),
    queryFn: () => postApi.getPostById(id),
    enabled: !!id,
  });
}

export function usePostsByUser(userId: number) {
  return useQuery({
    queryKey: queryKeys.posts.byUser(userId),
    queryFn: () => postApi.getPostsByUser(userId),
    enabled: !!userId,
  });
}

// Prefetch a post on hover — data is ready before user navigates
export function usePrefetchPost() {
  const queryClient = useQueryClient();

  return (id: number) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.posts.detail(id),
      queryFn: () => postApi.getPostById(id),
      staleTime: 1000 * 60 * 5,
    });
  };
}
