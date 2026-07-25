export const queryKeys = {
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    detail: (id: number) => [...queryKeys.users.all, "detail", id] as const,
  },
  posts: {
    all: ["posts"] as const,
    lists: () => [...queryKeys.posts.all, "list"] as const,
    detail: (id: number) => [...queryKeys.posts.all, "detail", id] as const,
    byUser: (userId: number) => [...queryKeys.posts.all, "byUser", userId] as const,
  },
};
