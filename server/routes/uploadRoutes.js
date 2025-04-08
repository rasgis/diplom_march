import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import { protect } from "../middleware/authMiddleware.js";
import generateFileName from "../utils/generateFileName.js";

const router = express.Router();

// Получаем путь к текущей директории
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Создаем директорию для загрузок, если она не существует
const uploadsDir = path.join(__dirname, "..", "..", "server", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Настройка хранилища для multer
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename(req, file, cb) {
    // Используем нашу утилиту для генерации имени файла
    const newFileName = generateFileName(file.originalname);
    cb(null, newFileName);
  },
});

// Фильтр файлов - разрешаем только изображения
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Разрешены только изображения!"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5000000 }, // 5MB
});

// POST /api/upload - загрузка одного файла
router.post("/", protect, upload.single("file"), (req, res) => {
  const filePath = "/uploads/" + req.file.filename;
  res.json({ filePath });
});

export default router;
