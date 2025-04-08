// Функция для определения базового URL в зависимости от окружения
const getBaseUrl = () => {
  // В production режиме используем относительные пути
  if (import.meta.env.PROD) {
    return "";
  }
  // В режиме разработки используем локальный сервер
  return "http://localhost:3001";
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  HEADERS: {
    "Content-Type": "application/json",
  },
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/api/auth/login",
      REGISTER: "/api/auth/register",
      PROFILE: "/api/auth/profile",
    },
    USERS: {
      BASE: "/api/users",
      PROFILE: "/api/users/profile",
    },
    PRODUCTS: {
      BASE: "/api/products",
      BY_ID: (id: string) => `/api/products/${id}`,
    },
    CATEGORIES: {
      BASE: "/api/categories",
      BY_ID: (id: string) => `/api/categories/${id}`,
    },
    FILES: {
      UPLOAD: "/api/upload",
    },
    CART: {
      BASE: "/api/cart",
      BY_ID: (id: string) => `/api/cart/${id}`,
    },
  },
};

export const getApiUrl = (endpoint: string) =>
  `${API_CONFIG.BASE_URL}${endpoint}`;
