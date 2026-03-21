import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postApi } from "../../api/post.api";
import { queryKeys } from "../../constants/queryKeys";
import { AppError } from "../../api/axios-instance";
import { CreatePostDTO, UpdatePostDTO } from "../../types/post";
import { Post } from "../../types/post";

export function useCreatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostDTO) => postApi.createPost(data),
    onSuccess: (newPost) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.byUser(newPost.userId),
      });
    },
    onError: (error) => {
      if (error instanceof AppError) {
        console.error(`[${error.code}] ${error.message}`);
      }
    },
  });
}

export function useUpdatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePostDTO }) =>
      postApi.updatePost(id, data),

    // Optimistic update — update cache before server responds
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.detail(id) });
      const previousPost = queryClient.getQueryData<Post>(
        queryKeys.posts.detail(id)
      );

      queryClient.setQueryData<Post>(queryKeys.posts.detail(id), (old) =>
        old ? { ...old, ...data } : old
      );

      return { previousPost };
    },

    // Roll back on failure
    onError: (error, { id }, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(queryKeys.posts.detail(id), context.previousPost);
      }
      if (error instanceof AppError) {
        console.error(`[${error.code}] ${error.message}`);
      }
    },

    // Always sync with server after mutation
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
    },
  });
}

export function useDeletePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => postApi.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
    },
  });
}
