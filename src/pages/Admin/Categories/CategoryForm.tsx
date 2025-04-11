import React from "react";
import { Category } from "../../../types/category";
import styles from "./CategoryForm.module.css";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import * as Yup from "yup";
import { useFormik } from "formik";

interface CategoryFormProps {
  category?: Category;
  categories: Category[];
  parentId?: string;
  onSubmit: (
    data: Omit<Category, "_id" | "slug" | "order" | "createdAt" | "updatedAt">
  ) => void;
  onCancel: () => void;
}

const validationSchema = Yup.object({
  name: Yup.string().required("Название категории обязательно"),
  description: Yup.string(),
  image: Yup.string()
    .required("URL изображения обязателен")
    .url("Введите корректный URL изображения"),
  parentId: Yup.string(),
});

const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  categories,
  parentId,
  onSubmit,
  onCancel,
}) => {
  const formik = useFormik({
    initialValues: {
      name: category?.name || "",
      description: category?.description || "",
      image: category?.image || "",
      parentId: parentId || category?.parentId || "",
    },
    validationSchema,
    onSubmit: async (values) => {
      onSubmit(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="name">Название категории</label>
        <input
          id="name"
          name="name"
          type="text"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
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
          onBlur={formik.handleBlur}
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
        <label htmlFor="image">URL изображения</label>
        <input
          id="image"
          name="image"
          type="url"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.image}
          className={
            formik.touched.image && formik.errors.image ? styles.error : ""
          }
          placeholder="https://example.com/image.jpg"
        />
        {formik.touched.image && formik.errors.image && (
          <div className={styles.errorMessage}>{formik.errors.image}</div>
        )}
        {formik.values.image && (
          <div className={styles.imagePreview}>
            <img src={formik.values.image} alt="Предпросмотр" />
          </div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="parentId">Родительская категория</label>
        <select
          id="parentId"
          name="parentId"
          onChange={formik.handleChange}
          value={formik.values.parentId}
          className={
            formik.touched.parentId && formik.errors.parentId
              ? styles.error
              : ""
          }
        >
          <option value="">Нет (корневая категория)</option>
          {categories
            .filter((cat) => cat._id !== category?._id)
            .map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
        </select>
        {formik.touched.parentId && formik.errors.parentId && (
          <div className={styles.errorMessage}>{formik.errors.parentId}</div>
        )}
      </div>

      <div className={styles.formActions}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.cancelButton}
        >
          <CancelIcon /> Отмена
        </button>
        <button type="submit" className={styles.submitButton}>
          <SaveIcon /> {category ? "Сохранить изменения" : "Создать категорию"}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
