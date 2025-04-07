import fs from "fs";
import path from "path";

// Путь к файлу db.json
const dbPath = path.join(process.cwd(), "src", "db.json");

// Функция для чтения данных из db.json
const readData = () => {
  const rawData = fs.readFileSync(dbPath);
  return JSON.parse(rawData);
};

// Функция для записи данных в db.json
const writeData = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

export default function handler(req, res) {
  if (req.method === "GET") {
    // Чтение данных из db.json
    const data = readData();
    res.status(200).json(data);
  } else if (req.method === "POST") {
    // Добавление нового поста в db.json
    const data = readData();
    const newPost = req.body;
    newPost.id = data.posts.length + 1; // Генерация нового ID
    data.posts.push(newPost);

    // Запись обновленных данных в db.json
    writeData(data);

    res.status(201).json(newPost);
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
