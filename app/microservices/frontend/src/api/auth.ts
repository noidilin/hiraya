import { z } from "zod";

import { apiGet, apiPost, clearAccessToken, setAccessToken } from "./client";
import {
  authRequestSchema,
  authResponseSchema,
  registerRequestSchema,
  userSchema,
  type AuthRequest,
  type AuthResponse,
  type RegisterRequest,
  type User,
} from "./schemas";

export async function login(credentials: AuthRequest): Promise<AuthResponse> {
  const payload = authRequestSchema.parse(credentials);
  const response = await apiPost("/auth/login", payload, authResponseSchema);
  setAccessToken(response.token);
  return response;
}

export async function register(details: RegisterRequest): Promise<AuthResponse> {
  const payload = registerRequestSchema.parse(details);
  const response = await apiPost("/auth/register", payload, authResponseSchema);
  setAccessToken(response.token);
  return response;
}

export function me(): Promise<User> {
  return apiGet("/auth/me", userSchema);
}

export async function logout(): Promise<void> {
  try {
    await apiPost("/auth/logout", undefined, z.null());
  } finally {
    clearAccessToken();
  }
}
