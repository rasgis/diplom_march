import React, { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";
import { scrollToTop } from "../../utils/scroll";
import styles from "./ScrollTop.module.css";

/**
 * Компонент для отображения кнопки прокрутки вверх страницы
 * Появляется, когда пользователь прокручивает страницу вниз на определенное расстояние
 */
const ScrollTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Показываем кнопку, когда пользователь прокрутил страницу вниз на 300px
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    // Очистка слушателя событий при размонтировании
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <button
      className={`${styles.scrollTopButton} ${isVisible ? styles.visible : ""}`}
      onClick={scrollToTop}
      aria-label="Прокрутить вверх"
    >
      <FaArrowUp />
    </button>
  );
};

export default ScrollTop;
