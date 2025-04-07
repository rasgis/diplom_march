import multer from "multer";
import path from "path";
import fs from "fs";

// Создаем директорию для загрузок в текущей рабочей директории
const uploadDir = path.join(process.cwd(), "public");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Папка для загрузки
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Уникальное имя для файла
  },
});

const upload = multer({ storage: storage });

export default function handler(req, res) {
  if (req.method === "POST") {
    return new Promise((resolve, reject) => {
      upload.single("file")(req, res, (err) => {
        if (err) {
          console.error("Error processing file:", err);
          res.status(500).json({ error: "Error uploading file" });
          reject(err);
        }
        // Файл успешно загружен
        const filePath = `/public/${req.file.filename}`; // Путь к файлу
        res.status(200).json({ filePath });
        resolve();
      });
    });
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
