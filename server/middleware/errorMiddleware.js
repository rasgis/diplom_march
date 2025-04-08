// Обработчик для несуществующих маршрутов
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Обработчик ошибок
export const errorHandler = (err, req, res, next) => {
  // Если статус все еще 200, устанавливаем 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  console.error(`Error: ${err.message}`.red);
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
