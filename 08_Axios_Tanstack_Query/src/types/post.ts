export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface CreatePostDTO {
  userId: number;
  title: string;
  body: string;
}

export interface UpdatePostDTO {
  title?: string;
  body?: string;
}
