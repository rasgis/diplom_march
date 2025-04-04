import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import {
  updateProduct,
  fetchProductById,
} from "../../../reducers/productSlice";
import { fetchCategories } from "../../../reducers/categorySlice";
import { Product } from "../../../types/product";
import { Category } from "../../../types/category";
import ImageUpload from "../../../components/ImageUpload/ImageUpload";
import { fileService } from "../../../services/fileService";
import styles from "./Admin.module.css";

const ProductEdit: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { selectedProduct, loading: productLoading } = useAppSelector(
    (state) => state.products
  );
  const { items: categories } = useAppSelector((state) => state.categories);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePath, setImagePath] = useState<string | undefined>(undefined);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    categoryId: "",
    image: "",
    unitOfMeasure: "шт",
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
    dispatch(fetchCategories());
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedProduct) {
      setFormData({
        name: selectedProduct.name,
        description: selectedProduct.description,
        price: selectedProduct.price,
        categoryId: selectedProduct.categoryId,
        image: selectedProduct.image,
        unitOfMeasure: selectedProduct.unitOfMeasure || "шт",
      });
      setImagePath(selectedProduct.image);
    }
  }, [selectedProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      let finalImagePath = imagePath || "";

      if (imageFile) {
        console.log("Uploading image:", imageFile);
        finalImagePath = await fileService.saveImage(imageFile);
        console.log("Image uploaded successfully:", finalImagePath);
      }

      const productData = {
        ...formData,
        image: finalImagePath,
      };

      await dispatch(updateProduct({ id, product: productData })).unwrap();
      navigate("/admin/products");
    } catch (error) {
      console.error("Error updating product:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Произошла ошибка при обновлении товара"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }));
  };

  const handleImageSelect = (file: File) => {
    console.log("Image selected:", file);
    setImageFile(file);
  };

  // Функция для построения дерева категорий
  const buildCategoryTree = (
    categories: Category[],
    parentId?: string
  ): Category[] => {
    return categories
      .filter((category) => category.parentId === parentId)
      .map((category) => ({
        ...category,
        children: buildCategoryTree(categories, category.id),
      }));
  };

  // Функция для рекурсивного рендеринга опций категорий
  const renderCategoryOptions = (categories: Category[], level = 0) => {
    return categories.map((category) => (
      <React.Fragment key={category.id}>
        <option value={category.id} style={{ paddingLeft: `${level * 20}px` }}>
          {level > 0 ? "— " : ""}
          {category.name}
        </option>
        {category.children &&
          renderCategoryOptions(category.children, level + 1)}
      </React.Fragment>
    ));
  };

  // Построение дерева категорий
  const categoryTree = buildCategoryTree(categories);

  // Список единиц измерения
  const unitsOfMeasure = [
    "шт",
    "п.м.",
    "м²",
    "м³",
    "кг",
    "л",
    "уп",
    "компл",
    "рул",
    "пак",
  ];

  if (productLoading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  if (!selectedProduct) {
    return <div className={styles.error}>Товар не найден</div>;
  }

  return (
    <div className={styles.adminContainer}>
      <div className={styles.header}>
        <h2>Редактирование товара</h2>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Название</label>
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
            min="0"
            step="0.01"
            required
          />
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
            {unitsOfMeasure.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="categoryId">Категория</label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
          >
            <option value="">Выберите категорию</option>
            {renderCategoryOptions(categoryTree)}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Изображение товара</label>
          <ImageUpload
            onImageSelect={handleImageSelect}
            currentImage={imagePath}
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            disabled={isLoading}
          >
            Отмена
          </button>
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Сохранение..." : "Сохранить изменения"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductEdit;
