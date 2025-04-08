import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import { authRoutes } from "./routes/auth.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Для поддержки __dirname в ES модулях
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Подключение к базе данных
connectDB();

// Middleware
const clientUrl =
  process.env.NODE_ENV === "production"
    ? process.env.FRONTEND_URL || "https://your-vercel-app.vercel.app"
    : "http://localhost:5173";

app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));

// Настройка статических файлов
const uploadsDir = path.join(__dirname, "..", "uploads");
const publicDir = path.join(__dirname, "..", "public");
app.use("/uploads", express.static(uploadsDir));
app.use("/public", express.static(publicDir));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/upload", uploadRoutes);

// Базовый роут для проверки
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "API работает корректно!" });
});

// Для обработки путей в production (Vercel)
if (process.env.NODE_ENV === "production") {
  // Путь к статическим файлам сборки
  const distPath = path.join(__dirname, "..", "dist");
  app.use(express.static(distPath));

  // Любые запросы не к API перенаправляем на React приложение
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api/")) {
      res.sendFile(path.join(distPath, "index.html"));
    }
  });
}

const PORT = process.env.PORT || 3001;

// Для локального сервера запускаем на указанном порту
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
  });
}

// Для Vercel экспортируем приложение
export default app;
