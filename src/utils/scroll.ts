import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Функция для плавного скролла страницы вверх
 * Может использоваться как обработчик события клика
 */
export const scrollToTop = (
  eventOrDuration?: React.MouseEvent | number
): void => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

/**
 * Хук для использования в useEffect для автоматического скролла вверх при переходе на страницу
 */
export const useScrollTop = (): void => {
  scrollToTop();
};

/**
 * Компонент для автоматического скролла страницы вверх при изменении маршрута
 * Используется в корневом компоненте App.tsx или Layout
 */
export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};
