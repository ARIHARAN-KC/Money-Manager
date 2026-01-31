import api from "../utils/apiClient";

interface AuthPayload {
  name?: string;
  email: string;
  password: string;
}

//Auth api calls
export const register = (data: AuthPayload) =>
  api.post("/auth/register", data);

export const login = (data: AuthPayload) =>
  api.post("/auth/login", data);

export const refreshToken = (token: string) =>
  api.post("/auth/refresh", { token });
