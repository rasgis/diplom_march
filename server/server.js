import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import "colors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { connectDB } from "./config/db.js";
import { authRoutes } from "./routes/auth.js";
import { userRoutes } from "./routes/user.js";
import { categoryRoutes } from "./routes/category.js";
import { productRoutes } from "./routes/products.js";
import { cartRoutes } from "./routes/cart.js";
import { uploadRoutes } from "./routes/uploadRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import fs from "fs";

// Инициализация переменных окружения
dotenv.config();

// Подключение к базе данных
connectDB();

const app = express();

// Настройка CORS
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://diplom-march2-fcd1maedg-rasgis-projects.vercel.app",
    ];

app.use(
  cors({
    origin: function (origin, callback) {
      // Разрешить запросы без origin (например, мобильные приложения или curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Настройка логирования запросов
app.use(morgan("dev"));

// Парсинг JSON
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Получаем текущую директорию
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Проверяем и создаем директорию uploads если она не существует
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Настройка статических файлов
app.use("/uploads", express.static(uploadsDir));

// Настройка маршрутов API
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/upload", uploadRoutes);

// Маршрут для проверки здоровья API
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "API is running" });
});

// Обработка маршрутов для SPA фронтенда в production
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "..", "dist");
  app.use(express.static(distPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API запущен...");
  });
}

// Обработка ошибок
app.use(notFound);
app.use(errorHandler);

// Запуск сервера
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(
    `Сервер запущен в режиме ${process.env.NODE_ENV} на порту ${PORT}`.yellow
      .bold
  );
});
