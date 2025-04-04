import React from "react";

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
