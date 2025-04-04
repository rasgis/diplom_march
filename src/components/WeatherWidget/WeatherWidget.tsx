import React, { useEffect, useState } from "react";
import {
  WbSunny,
  Cloud,
  WaterDrop,
  Air,
  Thunderstorm,
} from "@mui/icons-material";
import styles from "./WeatherWidget.module.css";

const STORAGE_KEY = "weather_city_key";
const DEFAULT_CITY = "Владикавказ";

export const WeatherWidget = () => {
  const [weather, setWeather] = useState({
    temperature: 0,
    condition: "sunny",
    humidity: 0,
    windSpeed: 0,
    city: "",
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCity, setNewCity] = useState("");
  const [error, setError] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes("солн"))
      return <WbSunny className={styles.weatherIcon} />;
    if (conditionLower.includes("облачн"))
      return <Cloud className={styles.weatherIcon} />;
    if (conditionLower.includes("дожд"))
      return <WaterDrop className={styles.weatherIcon} />;
    if (conditionLower.includes("снег"))
      return <Cloud className={styles.weatherIcon} />;
    if (conditionLower.includes("гроз"))
      return <Thunderstorm className={styles.weatherIcon} />;
    return <WbSunny className={styles.weatherIcon} />;
  };

  const fetchWeather = (city: string) => {
    setLoading(true);
    setError("");
    console.log("Запрашиваю погоду для города:", city);

    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=ru&appid=df89244c7d25e01ef07fc0f9f1715a8d`
    )
      .then((response) => {
        if (!response.ok) throw new Error("Город не найден");
        return response.json();
      })
      .then(({ name, main, weather, wind }) => {
        const weatherData = {
          temperature: Math.round(main.temp),
          condition: weather[0].description,
          humidity: main.humidity,
          windSpeed: Math.round(wind.speed),
          city: name,
        };

        setWeather(weatherData);
        console.log("Получены данные о погоде:", weatherData);

        // Сохраняем выбранный город в localStorage
        localStorage.setItem(STORAGE_KEY, name);
        console.log("Сохранен город в localStorage:", name);

        setIsModalOpen(false);
        setNewCity("");
        setIsVisible(true);
      })
      .catch((error) => {
        setError(error.message);
        console.error("Ошибка при получении данных о погоде:", error);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // Очищаем старые ключи, которые могли остаться в localStorage
    localStorage.removeItem("weather_city");

    // Добавляем логирование для отладки
    const savedCity = localStorage.getItem(STORAGE_KEY);
    console.log("Сохраненный город из localStorage:", savedCity);

    // Если нет сохраненного города, устанавливаем Владикавказ и сохраняем его
    if (!savedCity) {
      localStorage.setItem(STORAGE_KEY, DEFAULT_CITY);
      console.log("Установлен город по умолчанию:", DEFAULT_CITY);
    }

    // Используем сохраненный город или Владикавказ
    fetchWeather(savedCity || DEFAULT_CITY);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCity.trim()) {
      fetchWeather(newCity.trim());
    }
  };

  const handleOpenModal = () => {
    setNewCity(weather.city);
    setIsModalOpen(true);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 100);
  };

  // Добавляем кнопку обновления погоды для текущего города
  const refreshWeather = () => {
    const currentCity = localStorage.getItem(STORAGE_KEY) || DEFAULT_CITY;
    console.log("Принудительное обновление погоды для города:", currentCity);
    fetchWeather(currentCity);
  };

  if (loading) return null;

  return (
    <div className={styles.weatherWidgetContainer}>
      {isHovered && !isModalOpen && (
        <div
          className={`${styles.weatherWidget} ${
            isVisible ? styles.visible : ""
          }`}
          style={{ cursor: "pointer" }}
        >
          <button
            className={styles.refreshButton}
            onClick={refreshWeather}
            title="Обновить данные"
          >
            ↻
          </button>
          <div className={styles.location}>
            <h2>{weather.city}</h2>
          </div>
          <div className={styles.weatherInfo}>
            <div className={styles.mainInfo}>
              {getWeatherIcon(weather.condition)}
              <div className={styles.temperature}>{weather.temperature}°C</div>
            </div>
            <div className={styles.condition}>{weather.condition}</div>
            <div className={styles.details}>
              <div className={styles.detail}>
                <span>Влажность: {weather.humidity}%</span>
              </div>
              <div className={styles.detail}>
                <span>Ветер: {weather.windSpeed} м/с</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        className={styles.toggleButton}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleOpenModal}
      >
        {getWeatherIcon(weather.condition)}
      </button>

      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsModalOpen(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Введите название города</h3>
            <p className={styles.currentCity}>
              Текущий город: <strong>{weather.city}</strong>
            </p>
            <form onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="text"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="Например: Москва"
                className={styles.input}
              />
              {error && <div className={styles.error}>{error}</div>}
              <div className={styles.modalButtons}>
                <button type="submit" className={styles.submitButton}>
                  Найти
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setIsModalOpen(false);
                    setNewCity("");
                    setError("");
                    // Если была ошибка, проверяем сохраненный город
                    if (error) {
                      const savedCity = localStorage.getItem(STORAGE_KEY);
                      if (savedCity) {
                        console.log(
                          "Возврат к сохраненному городу:",
                          savedCity
                        );
                        // Если поиск был с ошибкой, возвращаемся к прежнему городу
                        fetchWeather(savedCity);
                      }
                    }
                  }}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
