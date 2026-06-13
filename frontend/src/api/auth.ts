import { httpClient } from './http-client';

export type AuthUser = {
  id: number;
  name: string;
  username: string;
  email: string;
  createdAt: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type RegisterPayload = {
  name: string;
  username: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AvailabilityResponse = {
  emailAvailable?: boolean;
  usernameAvailable?: boolean;
};

export async function register(payload: RegisterPayload) {
  const response = await httpClient.post<AuthResponse>('/auth/register', payload);
  return response.data;
}

export async function login(payload: LoginPayload) {
  const response = await httpClient.post<AuthResponse>('/auth/login', payload);
  return response.data;
}

export async function getCurrentUser(token: string) {
  const response = await httpClient.get<AuthUser>('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function checkAvailability(params: { email?: string; username?: string }) {
  const response = await httpClient.get<AvailabilityResponse>('/auth/availability', {
    params,
  });

  return response.data;
}
