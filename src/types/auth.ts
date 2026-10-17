export interface Role {
  id: string;
  name: string; // e.g. "ADMIN" | "USER"
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role | null;
  permissions: string[]; // per-user extra permissions on top of the role
  createdAt: string;
}

export interface AuthPayload {
  accessToken: string;
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}
