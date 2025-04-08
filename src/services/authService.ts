import axios from "axios";
import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User,
} from "../types/auth";
import { API_CONFIG } from "../config/api";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const authService = {
  // Сохранение токена и данных пользователя
  setAuthData(token: string, user: User) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Получение токена
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Получение данных пользователя
  getUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  // Очистка данных авторизации
  clearAuthData() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Проверка авторизации
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  },

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`,
        {
          identifier: credentials.identifier,
          password: credentials.password,
        }
      );

      const { token, user } = response.data;
      this.setAuthData(token, user);
      return user;
    } catch (error) {
      console.error("Ошибка входа:", error);
      throw error;
    }
  },

  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`,
        {
          name: credentials.name,
          email: credentials.email,
          login: credentials.login,
          password: credentials.password,
        },
        {
          headers: API_CONFIG.HEADERS,
        }
      );

      const { token, ...user } = response.data;

      // Сохраняем данные авторизации
      this.setAuthData(token, user);

      return user;
    } catch (error) {
      console.error("Ошибка при регистрации:", error);
      throw error;
    }
  },

  async getUserProfile(): Promise<User> {
    try {
      const token = this.getToken();

      if (!token) {
        throw new Error("Не авторизован");
      }

      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.PROFILE}`,
        {
          headers: {
            ...API_CONFIG.HEADERS,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Ошибка при получении профиля:", error);
      throw error;
    }
  },

  logout() {
    this.clearAuthData();
  },
};
