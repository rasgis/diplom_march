import jsonServer from "json-server";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import cors from "cors";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = jsonServer.create();
const router = jsonServer.router("src/db.json");
const middlewares = jsonServer.defaults();

// Настройка CORS
server.use(cors());

// Создаем директорию для загрузок, если она не существует
const uploadDir = path.join(__dirname, "public");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Created upload directory:", uploadDir);
}

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("Saving file to:", uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    console.log("Generated filename:", filename);
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

// Middleware для логирования запросов
server.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Обработчик для корневого пути
server.get("/", (req, res) => {
  res.json({ status: "ok", message: "File upload server is running" });
});

// Middleware для обработки загрузки файлов
server.post("/upload", upload.single("file"), (req, res) => {
  console.log("Received upload request");
  try {
    if (!req.file) {
      console.log("No file received");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("File received:", req.file);
    const filePath = "/" + req.file.filename;
    console.log("Returning file path:", filePath);
    res.json({ filePath });
  } catch (error) {
    console.error("Error processing upload:", error);
    res.status(500).json({ error: "Error uploading file" });
  }
});

// Обработка ошибок
server.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Something broke!" });
});

server.use(middlewares);
server.use(router);

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Upload directory: ${uploadDir}`);
});
