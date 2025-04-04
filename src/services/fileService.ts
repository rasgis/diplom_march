import axios from "axios";

const SERVER_URL = "http://localhost:3001";

export const fileService = {
  async saveImage(file: File): Promise<string> {
    try {
      // Проверяем доступность сервера
      try {
        const response = await axios.get(SERVER_URL);
        console.log("Server is available:", response.data);
      } catch (error) {
        console.error("Server is not available:", error);
        throw new Error(
          "Сервер для загрузки файлов не запущен. Пожалуйста, запустите сервер командой 'npm run server'"
        );
      }

      const formData = new FormData();
      formData.append("file", file);

      console.log("Sending file to server:", file.name);
      const response = await axios.post(`${SERVER_URL}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Server response:", response.data);

      if (!response.data.filePath) {
        throw new Error("Не получен путь к файлу от сервера");
      }

      return response.data.filePath;
    } catch (error) {
      console.error("Error in fileService.saveImage:", error);
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
