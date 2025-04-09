import axios from "axios";
import { API_CONFIG } from "../config/api";
import { authService } from "./authService";
import { optimizeImage } from "../utils/imageUtils";

export const fileService = {
  async saveImage(file: File, type?: "product" | "category"): Promise<string> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Необходима авторизация для загрузки файлов");
      }

      // Оптимизируем изображение перед загрузкой
      const optimizedFile = await optimizeImage(file, 1200, 1200, 0.7);
      console.log(
        `Размер изображения после оптимизации: ${(
          optimizedFile.size /
          1024 /
          1024
        ).toFixed(2)} МБ`
      );

      const formData = new FormData();
      formData.append("file", optimizedFile);

      const headers = {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      };

      // Добавляем параметр типа загрузки в URL, если он предоставлен
      const url = type
        ? `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FILES.UPLOAD}?type=${type}`
        : `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FILES.UPLOAD}`;

      const response = await axios.post(url, formData, { headers });

      if (!response.data.filePath) {
        throw new Error("Не получен путь к файлу от сервера");
      }

      return response.data.filePath;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNREFUSED") {
          throw new Error(
            "Сервер для загрузки файлов не запущен. Пожалуйста, запустите сервер командой 'npm run server'"
          );
        }
        throw new Error(
          `Ошибка загрузки файла: ${
            error.response?.data?.error || error.message
          }`
        );
      }
      throw error;
    }
  },
};
