import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { createProduct } from "../../../reducers/productSlice";
import { fetchCategories } from "../../../reducers/categorySlice";
import { Product } from "../../../types/product";
import { Category } from "../../../types/category";
import styles from "./Admin.module.css";
import { Loader } from "../../../components";

const ProductCreate: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: categories } = useAppSelector((state) => state.categories);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<
    Omit<Product, "_id" | "id" | "createdAt" | "updatedAt">
  >({
    name: "",
    description: "",
    price: 0,
    category: "",
    image: "",
    unitOfMeasure: "шт",
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await dispatch(createProduct(formData)).unwrap();
      navigate("/admin/products");
    } catch (error) {
      console.error("Error creating product:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Произошла ошибка при создании товара"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
  };

  if (isLoading) {
    return <Loader message="Создание товара..." />;
  }

  return (
    <div className={styles.container}>
      <h2>Создание нового товара</h2>
      {error && <div className={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Название товара</label>
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
          <label htmlFor="description">Описание</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="price">Цена</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="image">URL изображения</label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            required
          />
          {formData.image && (
            <div className={styles.imagePreview}>
              <img src={formData.image} alt="Предпросмотр" />
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="category">Категория</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Выберите категорию</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="unitOfMeasure">Единица измерения</label>
          <select
            id="unitOfMeasure"
            name="unitOfMeasure"
            value={formData.unitOfMeasure}
            onChange={handleChange}
            required
          >
            <option value="">Выберите единицу измерения</option>
            <option value="шт">Штуки</option>
            <option value="м²">Квадратные метры</option>
            <option value="м³">Кубические метры</option>
            <option value="м">Метры</option>
            <option value="кг">Килограммы</option>
            <option value="т">Тонны</option>
            <option value="уп">Упаковка</option>
            <option value="рул">Рулон</option>
            <option value="лист">Лист</option>
            <option value="пал">Паллета</option>
            <option value="компл">Комплект</option>
          </select>
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className={styles.cancelButton}
          >
            Отмена
          </button>
          <button type="submit" className={styles.submitButton}>
            Создать товар
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductCreate;
