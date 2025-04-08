import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  // Получаем токен из заголовка
  const token = req.header("x-auth-token");

  // Проверяем наличие токена
  if (!token) {
    return res
      .status(401)
      .json({ message: "Нет токена, авторизация отклонена" });
  }

  try {
    // Верифицируем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Токен недействителен" });
  }
};
