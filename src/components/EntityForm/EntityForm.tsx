import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { RootState } from "../../store";
import styles from "./EntityForm.module.css";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import { createProduct, updateProduct } from "../../reducers/productSlice";
import { createCategory, updateCategory } from "../../reducers/categorySlice";
import { Category } from "../../types/category";
import { Product } from "../../types/product";
import { fetchCategories } from "../../reducers/categorySlice";
import { categoryService } from "../../services/categoryService";

// Импорт действий для пользователей (нужно создать, если отсутствуют)
// import { createUser, updateUser } from "../../reducers/userSlice";

// Единицы измерения товаров
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

// Определяем типы для полей форм
interface FieldOption {
  value: string;
  label: string;
}

interface FormField {
  name: string;
  type:
    | "text"
    | "textarea"
    | "select"
    | "number"
    | "email"
    | "password"
    | "url";
  label: string;
  required: boolean;
  options?: FieldOption[];
}

type EntityType = "product" | "category" | "user";

// Поля для каждого типа сущности
const ENTITY_FIELDS: Record<EntityType, FormField[]> = {
  product: [
    { name: "name", type: "text", label: "Название товара", required: true },
    {
      name: "description",
      type: "textarea",
      label: "Описание",
      required: true,
    },
    { name: "price", type: "number", label: "Цена", required: true },
    { name: "image", type: "url", label: "URL изображения", required: true },
    {
      name: "category",
      type: "select",
      label: "Категория",
      required: true,
      options: [],
    },
    {
      name: "unitOfMeasure",
      type: "select",
      label: "Единица измерения",
      required: true,
      options: UNITS_OF_MEASURE,
    },
  ],
  category: [
    { name: "name", type: "text", label: "Название категории", required: true },
    {
      name: "description",
      type: "textarea",
      label: "Описание",
      required: false,
    },
    { name: "image", type: "url", label: "URL изображения", required: true },
    {
      name: "parentId",
      type: "select",
      label: "Родительская категория",
      required: false,
      options: [],
    },
  ],
  user: [
    { name: "name", type: "text", label: "Имя пользователя", required: true },
    { name: "email", type: "email", label: "Email", required: true },
    { name: "login", type: "text", label: "Логин", required: true },
    { name: "password", type: "password", label: "Пароль", required: true },
    {
      name: "role",
      type: "select",
      label: "Роль",
      required: true,
      options: [
        { value: "user", label: "Пользователь" },
        { value: "admin", label: "Администратор" },
      ],
    },
  ],
};

// Типы для формы продукта
interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  unitOfMeasure: string;
}

// Типы для формы категории
interface CategoryFormValues {
  name: string;
  description: string;
  image: string;
  parentId: string;
}

// Типы для формы пользователя
interface UserFormValues {
  name: string;
  email: string;
  login: string;
  password: string;
  role: string;
}

type FormValues = ProductFormValues | CategoryFormValues | UserFormValues;

// Схемы валидации для каждого типа сущности
const getValidationSchema = (entityType: EntityType) => {
  const baseSchemas = {
    product: Yup.object({
      name: Yup.string().required("Название обязательно"),
      description: Yup.string().required("Описание обязательно"),
      price: Yup.number()
        .required("Цена обязательна")
        .min(0, "Цена не может быть отрицательной"),
      category: Yup.string().required("Категория обязательна"),
      image: Yup.string()
        .required("URL изображения обязателен")
        .url("Введите корректный URL изображения"),
      unitOfMeasure: Yup.string().required("Единица измерения обязательна"),
    }),
    category: Yup.object({
      name: Yup.string().required("Название категории обязательно"),
      description: Yup.string(),
      image: Yup.string()
        .required("URL изображения обязателен")
        .url("Введите корректный URL изображения"),
      parentId: Yup.string(),
    }),
    user: Yup.object({
      name: Yup.string()
        .required("Имя обязательно")
        .min(2, "Минимум 2 символа"),
      email: Yup.string()
        .email("Введите корректный email")
        .required("Email обязателен"),
      login: Yup.string()
        .required("Логин обязателен")
        .min(3, "Минимум 3 символа")
        .matches(/^[a-zA-Z0-9_]+$/, "Только буквы, цифры и подчеркивание"),
      password: Yup.string()
        .required("Пароль обязателен")
        .min(6, "Минимум 6 символов"),
      role: Yup.string().required("Роль обязательна"),
    }),
  };

  return baseSchemas[entityType];
};

// Получение начальных значений в зависимости от типа сущности
const getInitialValues = (
  entityType: EntityType,
  entityData: any
): FormValues => {
  const initialValues = {
    product: {
      name: "",
      description: "",
      price: 0,
      category: "",
      image: "",
      unitOfMeasure: "шт",
    },
    category: {
      name: "",
      description: "",
      image: "",
      parentId: "",
    },
    user: {
      name: "",
      email: "",
      login: "",
      password: "",
      role: "user",
    },
  };

  // Если есть данные, заполняем ими форму
  if (entityData) {
    if (entityType === "product") {
      return {
        name: entityData.name || "",
        description: entityData.description || "",
        price: entityData.price || 0,
        category:
          typeof entityData.category === "object"
            ? entityData.category._id
            : entityData.category || "",
        image: entityData.image || "",
        unitOfMeasure: entityData.unitOfMeasure || "шт",
      } as ProductFormValues;
    } else if (entityType === "category") {
      return {
        name: entityData.name || "",
        description: entityData.description || "",
        image: entityData.image || "",
        parentId: entityData.parentId || "",
      } as CategoryFormValues;
    } else if (entityType === "user") {
      return {
        name: entityData.name || "",
        email: entityData.email || "",
        login: entityData.login || "",
        password: "", // Пароль всегда пустой при редактировании
        role: entityData.role || "user",
      } as UserFormValues;
    }
  }

  return initialValues[entityType];
};

// Действия Redux в зависимости от типа сущности
const getReduxAction = (entityType: EntityType, isUpdate: boolean) => {
  const actions = {
    product: isUpdate ? updateProduct : createProduct,
    category: isUpdate ? updateCategory : createCategory,
    // Временно закомментируем, пока не создадим соответствующие действия
    user: isUpdate
      ? (data: any) => ({ type: "user/updateUser", payload: data })
      : (data: any) => ({ type: "user/createUser", payload: data }),
  };
  return actions[entityType];
};

interface EntityFormProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: EntityType;
  entityData?: any; // Данные для редактирования
  afterSubmit?: () => void; // Функция, вызываемая после успешного сохранения
}

export const EntityForm: React.FC<EntityFormProps> = ({
  isOpen,
  onClose,
  entityType,
  entityData,
  afterSubmit,
}) => {
  const dispatch = useDispatch();
  const categories = useSelector((state: RootState) => state.categories.items);
  const categoriesLoading = useSelector(
    (state: RootState) => state.categories.loading
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (
      isOpen &&
      (entityType === "category" || entityType === "product") &&
      categories.length === 0 &&
      !categoriesLoading
    ) {
      // Загружаем категории только если их нет и они не загружаются
      dispatch(fetchCategories())
        .unwrap()
        .catch((err) => {
          setError("Ошибка при загрузке категорий");
          console.error("Error fetching categories:", err);
        });
    }
  }, [isOpen, dispatch, entityType, categories.length, categoriesLoading]);

  // Обновляем опции для полей категорий
  useEffect(() => {
    if (categories.length > 0) {
      const categoryOptions = categoryService
        .getAllCategoriesFlat(categories)
        .map((cat) => ({
          value: cat.id,
          label: "—".repeat(cat.level) + " " + cat.name,
        }));

      // Обновляем опции для поля категории товара
      if (entityType === "product") {
        const categoryField = ENTITY_FIELDS.product.find(
          (field) => field.name === "category"
        );
        if (categoryField) {
          categoryField.options = categoryOptions;
        }
      }

      // Обновляем опции для поля родительской категории
      if (entityType === "category") {
        // Добавляем опцию "Без родительской категории"
        const parentCategoryOptions = [
          { value: "", label: "Без родительской категории" },
          ...categoryOptions,
        ];

        const parentCategoryField = ENTITY_FIELDS.category.find(
          (field) => field.name === "parentId"
        );
        if (parentCategoryField) {
          parentCategoryField.options = parentCategoryOptions;
        }
      }
    }
  }, [categories, entityType]);

  const validationSchema = getValidationSchema(entityType);
  const initialValues = getInitialValues(entityType, entityData);

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);

      try {
        const action = getReduxAction(entityType, !!entityData);

        // Если это обновление, добавляем id сущности
        const submitData = entityData?._id
          ? { ...values, _id: entityData._id }
          : values;

        await dispatch(action(submitData)).unwrap();

        onClose();
        if (afterSubmit) {
          afterSubmit();
        }
      } catch (error: any) {
        setError(error.message || `Ошибка при сохранении ${entityType}`);
        console.error("Error submitting form:", error);
      } finally {
        setLoading(false);
      }
    },
  });

  if (!isOpen) return null;

  // Определяем заголовок модального окна
  const getTitleByEntityType = () => {
    const titles = {
      product: entityData ? "Редактирование товара" : "Добавление товара",
      category: entityData
        ? "Редактирование категории"
        : "Добавление категории",
      user: entityData
        ? "Редактирование пользователя"
        : "Добавление пользователя",
    };
    return titles[entityType];
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{getTitleByEntityType()}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={formik.handleSubmit} className={styles.form}>
          {ENTITY_FIELDS[entityType].map((field) => (
            <div key={field.name} className={styles.formGroup}>
              <label htmlFor={field.name}>{field.label}</label>

              {field.type === "textarea" && (
                <textarea
                  id={field.name}
                  name={field.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values[field.name]}
                  className={
                    formik.touched[field.name] && formik.errors[field.name]
                      ? styles.error
                      : ""
                  }
                />
              )}

              {field.type === "select" && (
                <select
                  id={field.name}
                  name={field.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values[field.name]}
                  className={
                    formik.touched[field.name] && formik.errors[field.name]
                      ? styles.error
                      : ""
                  }
                >
                  <option value="">Выберите {field.label.toLowerCase()}</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}

              {(field.type === "text" ||
                field.type === "email" ||
                field.type === "password" ||
                field.type === "number" ||
                field.type === "url") && (
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values[field.name]}
                  className={
                    formik.touched[field.name] && formik.errors[field.name]
                      ? styles.error
                      : ""
                  }
                  placeholder={
                    field.type === "url" ? "https://example.com/image.jpg" : ""
                  }
                  step={field.type === "number" ? "0.01" : undefined}
                />
              )}

              {formik.touched[field.name] && formik.errors[field.name] && (
                <div className={styles.errorMessage}>
                  {formik.errors[field.name] as string}
                </div>
              )}

              {field.name === "image" && formik.values[field.name] && (
                <div className={styles.imagePreview}>
                  <img
                    src={formik.values[field.name] as string}
                    alt="Предпросмотр"
                  />
                </div>
              )}
            </div>
          ))}

          {error && <div className={styles.formError}>{error}</div>}

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={loading}
            >
              <CancelIcon /> Отмена
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              <SaveIcon />{" "}
              {loading ? "Сохранение..." : entityData ? "Сохранить" : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
