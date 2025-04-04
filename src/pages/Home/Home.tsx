import React, { useState } from "react";
import { Link } from "react-router-dom";
import { WeatherWidget } from "../../components/WeatherWidget";
import {
  LocalOffer,
  PersonAdd,
  Star,
  Discount,
  ArrowForward,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import styles from "./Home.module.css";

const Home: React.FC = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь будет логика отправки формы
    console.log("Form submitted:", formData);
    setIsSubmitted(true);
    setFormData({
      name: "",
      email: "",
      phone: "",
      message: "",
    });
  };

  return (
    <div className={styles.container}>
      <WeatherWidget />
      <section className={styles.hero}>
        <div className={styles.logoContainer}>
          <img
            src="/logo-stroy.jpg"
            alt="Stroy City Logo"
            className={styles.logo}
          />
        </div>
        <h1 className={styles.title}>Добро пожаловать в Stroy City</h1>
        <p className={styles.subtitle}>
          Лучшие строительные и кровельные материалы по доступным ценам
        </p>
        <Link to="/catalog" className={styles.ctaButton}>
          ПЕРЕЙТИ В КАТАЛОГ
        </Link>
      </section>

      {!isAuthenticated && (
        <section className={styles.discountBanner}>
          <h2 className={styles.discountTitle}>
            <LocalOffer className={styles.discountIcon} />
            Специальное предложение для гостей!
          </h2>
          <p className={styles.discountText}>
            Зарегистрируйтесь на нашем сайте и получите дополнительную скидку 5%
            на все товары при оформлении заказа. Это отличная возможность
            сэкономить на покупке качественных строительных и кровельных
            материалов!
          </p>
          <div className={styles.discountFeatures}>
            <div className={styles.discountFeature}>
              <Star className={styles.discountFeatureIcon} />
              <span>Эксклюзивные предложения</span>
            </div>
            <div className={styles.discountFeature}>
              <Discount className={styles.discountFeatureIcon} />
              <span>Постоянная скидка 5%</span>
            </div>
          </div>
          <Link to="/register" className={styles.discountButton}>
            <PersonAdd className={styles.discountIcon} />
            Зарегистрироваться и получить скидку
            <ArrowForward className={styles.discountIcon} />
          </Link>
        </section>
      )}

      <section className={styles.features}>
        <div className={styles.feature}>
          <h3>Широкий выбор</h3>
          <p>Большой ассортимент строительных материалов различных категорий</p>
        </div>
        <div className={styles.feature}>
          <h3>Быстрая доставка</h3>
          <p>Доставка по всей республике в кратчайшие сроки</p>
        </div>
        <div className={styles.feature}>
          <h3>Гарантия качества</h3>
          <p>Все товары проходят строгий контроль качества</p>
        </div>
      </section>

      <section className={styles.about}>
        <h2>О нашем магазине</h2>
        <p>
          Мы рады приветствовать вас в Stroy City! Наша компания уже более 10
          лет предоставляет качественные строительные материалы нашим клиентам.
          Мы гордимся тем, что можем предложить вам широкий выбор продукции по
          конкурентным ценам.
        </p>
        <p>
          Наша миссия - сделать покупки строительных материалов максимально
          удобными и приятными для каждого клиента. Мы постоянно работаем над
          улучшением сервиса и расширением ассортимента.
        </p>
      </section>

      <section className={styles.contact}>
        <h2>Свяжитесь с нами</h2>
        {isSubmitted ? (
          <div className={styles.successMessage}>
            <p>
              Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.
            </p>
          </div>
        ) : (
          <form className={styles.contactForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Ваше имя</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="phone">Телефон</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="message">Сообщение</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
              ></textarea>
            </div>
            <button type="submit" className={styles.submitButton}>
              Отправить
            </button>
          </form>
        )}
      </section>
    </div>
  );
};

export default Home;
