import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import {
  createProduct,
  updateProduct,
  fetchProductById,
} from "../../../reducers";
import { ROUTES } from "../../../constants/routes";
import { CATEGORIES } from "../../../constants/categories";
import styles from "./Admin.module.css";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { Product, ProductFormData, Category } from "../../../types";
import ImageUpload from "../../../components/ImageUpload/ImageUpload";
import { categoryService } from "../../../services/categoryService";

// Добавляем список единиц измерения
const UNITS_OF_MEASURE = [
  { value: "шт", label: "Штуки" },
  { value: "м²", label: "Квадратные метры" },
  { value: "м³", label: "Кубические метры" },
  { value: "м", label: "Метры" },
  { value: "кг", label: "Килограммы" },
  { value: "т", label: "Тонны" },
  { value: "уп", label: "Упаковка" },
  { value: "рул", label: "Рулон" },
  { value: "лист", label: "Лист" },
  { value: "пал", label: "Паллета" },
  { value: "компл", label: "Комплект" },
];

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  onSubmit: (values: ProductFormData) => Promise<void>;
  onCancel: () => void;
}

// Функция для построения дерева категорий
const buildCategoryTree = (categories: Category[]): Category[] => {
  const categoryMap = new Map<string, Category>();
  const rootCategories: Category[] = [];

  // Создаем Map для быстрого доступа к категориям
  categories.forEach((category) => {
    categoryMap.set(category._id, { ...category, children: [] });
  });

  // Строим дерево
  categories.forEach((category) => {
    const currentCategory = categoryMap.get(category._id);
    if (currentCategory) {
      if (category.parentId) {
        const parentCategory = categoryMap.get(category.parentId);
        if (parentCategory) {
          if (!parentCategory.children) {
            parentCategory.children = [];
          }
          parentCategory.children.push(currentCategory);
        }
      } else {
        rootCategories.push(currentCategory);
      }
    }
  });

  return rootCategories;
};

// Компонент для рекурсивного отображения категорий
const CategoryOption: React.FC<{ category: Category; level: number }> = ({
  category,
  level,
}) => {
  const prefix = "\u00A0".repeat(level * 4);
  return (
    <>
      <option value={category._id}>
        {prefix}
        {category.name}
      </option>
      {category.children?.map((child) => (
        <CategoryOption key={child._id} category={child} level={level + 1} />
      ))}
    </>
  );
};

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  categories,
  onSubmit,
  onCancel,
}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const {
    selectedProduct: productState,
    loading,
    error,
  } = useAppSelector((state) => state.products);

  const isEdit = id !== "create";

  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.image || null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const validationSchema = Yup.object({
    name: Yup.string().required("Название обязательно"),
    description: Yup.string().required("Описание обязательно"),
    price: Yup.number()
      .required("Цена обязательна")
      .min(0, "Цена не может быть отрицательной"),
    category: Yup.string().required("Категория обязательна"),
    image: Yup.mixed().required("Изображение обязательно"),
    unitOfMeasure: Yup.string().required("Единица измерения обязательна"),
  });

  const formik = useFormik<ProductFormData>({
    initialValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || 0,
      category: getProductCategoryId(product),
      image: product?.image || "",
      unitOfMeasure: product?.unitOfMeasure || "",
    },
    validationSchema,
    onSubmit: async (values) => {
      // Создаем новый объект с File вместо base64 строки
      const submitData = {
        ...values,
        image: selectedFile || values.image,
      };
      await onSubmit(submitData);
    },
  });

  // Функция для получения ID категории из продукта
  function getProductCategoryId(product?: Product) {
    if (!product) return "";

    // Если category - объект, извлекаем _id
    if (typeof product.category === "object" && product.category !== null) {
      return (product.category as { _id: string })._id;
    }

    // Иначе возвращаем как есть (строка)
    return product.category || "";
  }

  useEffect(() => {
    if (isEdit && id) {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, isEdit, id]);

  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      formik.setFieldValue("image", file);
    };
    reader.readAsDataURL(file);
  };

  // Получаем категории в виде плоского списка с уровнями вложенности
  const flatCategories = categoryService.getAllCategoriesFlat(categories);

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <form onSubmit={formik.handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="name">Название</label>
        <input
          id="name"
          name="name"
          type="text"
          onChange={formik.handleChange}
          value={formik.values.name}
          className={
            formik.touched.name && formik.errors.name ? styles.error : ""
          }
        />
        {formik.touched.name && formik.errors.name && (
          <div className={styles.errorMessage}>{formik.errors.name}</div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description">Описание</label>
        <textarea
          id="description"
          name="description"
          onChange={formik.handleChange}
          value={formik.values.description}
          className={
            formik.touched.description && formik.errors.description
              ? styles.error
              : ""
          }
        />
        {formik.touched.description && formik.errors.description && (
          <div className={styles.errorMessage}>{formik.errors.description}</div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="price">Цена</label>
        <input
          id="price"
          name="price"
          type="number"
          onChange={formik.handleChange}
          value={formik.values.price}
          className={
            formik.touched.price && formik.errors.price ? styles.error : ""
          }
        />
        {formik.touched.price && formik.errors.price && (
          <div className={styles.errorMessage}>{formik.errors.price}</div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="category">Категория</label>
        <select
          id="category"
          name="category"
          onChange={formik.handleChange}
          value={formik.values.category as string}
          className={
            formik.touched.category && formik.errors.category
              ? styles.error
              : ""
          }
        >
          <option value="">Выберите категорию</option>
          {flatCategories.map((cat) => (
            <option
              key={cat.id}
              value={cat.id}
              style={{ paddingLeft: `${cat.level * 20}px` }}
            >
              {"\u00A0".repeat(cat.level * 2)}
              {cat.isParent ? "📁 " : "📄 "}
              {cat.name}
            </option>
          ))}
        </select>
        {formik.touched.category && formik.errors.category && (
          <div className={styles.errorMessage}>{formik.errors.category}</div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="unitOfMeasure">Единица измерения</label>
        <select
          id="unitOfMeasure"
          name="unitOfMeasure"
          onChange={formik.handleChange}
          value={formik.values.unitOfMeasure}
          className={
            formik.touched.unitOfMeasure && formik.errors.unitOfMeasure
              ? styles.error
              : ""
          }
        >
          <option value="">Выберите единицу измерения</option>
          {UNITS_OF_MEASURE.map((unit) => (
            <option key={unit.value} value={unit.value}>
              {unit.label}
            </option>
          ))}
        </select>
        {formik.touched.unitOfMeasure && formik.errors.unitOfMeasure && (
          <div className={styles.errorMessage}>
            {formik.errors.unitOfMeasure}
          </div>
        )}
      </div>

      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
        <label htmlFor="image">Изображение</label>
        <ImageUpload
          onImageSelect={handleImageSelect}
          currentImage={product?.image}
        />
        {formik.touched.image && formik.errors.image && (
          <div className={styles.errorMessage}>{formik.errors.image}</div>
        )}
      </div>

      <div className={`${styles.formActions} ${styles.fullWidth}`}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={onCancel}
        >
          <CancelIcon fontSize="small" className={styles.buttonIcon} />
          Отмена
        </button>
        <button type="submit" className={styles.submitButton}>
          <SaveIcon fontSize="small" className={styles.buttonIcon} />
          {product ? "Сохранить" : "Добавить"}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
