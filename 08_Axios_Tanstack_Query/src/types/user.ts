export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
}

export interface CreateUserDTO {
  name: string;
  username: string;
  email: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  phone?: string;
}
