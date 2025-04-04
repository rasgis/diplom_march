import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User,
} from "../types/auth";

const API_URL = "http://localhost:3001";
const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const authService = {
  // Сохранение токена и данных пользователя
  setAuthData(token: string, user: User) {
    console.log("Сохранение данных авторизации:", { token, user });
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
    console.log("Получение пользователя из localStorage:", userStr);
    return userStr ? JSON.parse(userStr) : null;
  },

  // Очистка данных авторизации
  clearAuthData() {
    console.log("Очистка данных авторизации");
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Проверка авторизации
  isAuthenticated(): boolean {
    const token = this.getToken();
    console.log("Проверка авторизации:", !!token);
    return !!token;
  },

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      console.log("Попытка входа с данными:", credentials);

      // Определяем, является ли identifier email или логином
      const isEmail = credentials.identifier.includes("@");
      const queryParam = isEmail ? "email" : "login";
      const queryValue = credentials.identifier;

      console.log(
        "Запрос к API:",
        `${API_URL}/users?${queryParam}=${queryValue}`
      );
      const response = await fetch(
        `${API_URL}/users?${queryParam}=${queryValue}`
      );

      if (!response.ok) {
        console.error(
          "Ошибка ответа API:",
          response.status,
          response.statusText
        );
        throw new Error("Ошибка при попытке входа");
      }

      const users = await response.json();
      console.log("Полученные пользователи:", users);

      const user = users[0];

      if (!user) {
        console.error("Пользователь не найден");
        throw new Error("Пользователь не найден");
      }

      if (user.password !== credentials.password) {
        console.error("Неверный пароль");
        throw new Error("Неверный пароль");
      }

      // Создаем простой токен (в реальном приложении здесь должен быть JWT)
      const token = btoa(`${user.email}:${user.password}`);

      // Сохраняем данные авторизации
      this.setAuthData(token, user);

      console.log("Успешный вход:", user);
      return user;
    } catch (error) {
      console.error("Ошибка при входе:", error);
      throw error;
    }
  },

  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      console.log("Попытка регистрации с данными:", credentials);

      // Проверяем, существует ли пользователь с таким email
      const emailResponse = await fetch(
        `${API_URL}/users?email=${credentials.email}`
      );
      const existingEmailUsers = await emailResponse.json();
      console.log("Существующие пользователи по email:", existingEmailUsers);

      // Проверяем, существует ли пользователь с таким логином
      const loginResponse = await fetch(
        `${API_URL}/users?login=${credentials.login}`
      );
      const existingLoginUsers = await loginResponse.json();
      console.log("Существующие пользователи по логину:", existingLoginUsers);

      if (existingEmailUsers.length > 0) {
        throw new Error("Пользователь с таким email уже существует");
      }

      if (existingLoginUsers.length > 0) {
        throw new Error("Пользователь с таким логином уже существует");
      }

      const newUser = {
        id: Date.now().toString(),
        name: credentials.name,
        email: credentials.email,
        login: credentials.login,
        password: credentials.password,
        role: "user" as const,
      };

      console.log("Создание нового пользователя:", newUser);
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        console.error(
          "Ошибка создания пользователя:",
          response.status,
          response.statusText
        );
        throw new Error("Ошибка при регистрации");
      }

      // Создаем простой токен (в реальном приложении здесь должен быть JWT)
      const token = btoa(`${newUser.email}:${newUser.password}`);

      // Сохраняем данные авторизации
      this.setAuthData(token, newUser);

      console.log("Успешная регистрация:", newUser);
      return newUser;
    } catch (error) {
      console.error("Ошибка при регистрации:", error);
      throw error;
    }
  },

  logout() {
    console.log("Выход из системы");
    this.clearAuthData();
  },
};
