import axios from "axios";
import { apiBaseUrl } from "@/services/api";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
};

type AuthResponse = {
  message: string;
  user: AuthUser;
};

type MessageResponse = {
  message: string;
};

const authApi = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getAuthErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message;
  }

  return error instanceof Error ? error.message : "Request failed";
};

export const registerUser = async (payload: { name: string; email: string; password: string }) => {
  const response = await authApi.post<AuthResponse>("/users/signup", payload);
  return response.data;
};

export const loginUser = async (payload: { email: string; password: string }) => {
  const response = await authApi.post<AuthResponse>("/users/login", payload);
  return response.data;
};

export const logoutUser = async () => {
  const response = await authApi.post<MessageResponse>("/users/logout");
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await authApi.get<AuthResponse>("/users/me");
  return response.data;
};

export const requestPasswordReset = async (payload: { email: string }) => {
  const response = await authApi.post<MessageResponse>("/users/forgot-password", payload);
  return response.data;
};

export const resetPassword = async (token: string, payload: { password: string }) => {
  const response = await authApi.post<MessageResponse>(
    `/users/reset-password/${encodeURIComponent(token)}`,
    payload,
  );
  return response.data;
};
