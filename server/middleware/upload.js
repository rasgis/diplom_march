import multer from "multer";
import path from "path";
import generateFileName from "../utils/generateFileName.js";

// Настройка хранилища для загрузки файлов
export const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Используем нашу утилиту для генерации имени файла
    const newFileName = generateFileName(file.originalname);
    cb(null, newFileName);
  },
});

// Фильтр файлов
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Не поддерживаемый формат файла."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export default upload;
