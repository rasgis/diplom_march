import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import { AppDispatch, RootState } from "../../store";
import styles from "./EntityForm.module.css";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import { createProduct, updateProduct } from "../../reducers/productSlice";
import { createCategory, updateCategory } from "../../reducers/categorySlice";
import { fetchCategories } from "../../reducers/categorySlice";
import { categoryService } from "../../services/categoryService";
import { EntityType } from "../../types/entity";
import { ENTITY_FIELDS } from "./formConfig";
import { getValidationSchema } from "./validationSchemas";
import { getInitialValues, getTitleByEntityType } from "./utils";
import * as Yup from "yup";
import { Button, TextField, MenuItem, Box, Typography } from "@mui/material";
import { productService } from "../../services/productService";
import { fetchProducts } from "../../reducers/productSlice";
import { FormValues, ProductFormValues, CategoryFormValues } from "./types";

interface EntityFormProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: EntityType;
  entityData?: any;
  afterSubmit?: () => void;
}

export const EntityForm: React.FC<EntityFormProps> = ({
  isOpen,
  onClose,
  entityType,
  entityData,
  afterSubmit,
}) => {
  const dispatch = useDispatch<AppDispatch>();
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
      dispatch(fetchCategories())
        .unwrap()
        .catch((err: Error) => {
          setError("Ошибка при загрузке категорий");
        });
    }
  }, [isOpen, dispatch, entityType, categories.length, categoriesLoading]);

  useEffect(() => {
    if (categories.length > 0) {
      const categoryOptions = categoryService
        .getAllCategoriesFlat(categories)
        .map((cat) => ({
          value: cat.id,
          label: "—".repeat(cat.level) + " " + cat.name,
        }));

      if (entityType === "product") {
        const categoryField = ENTITY_FIELDS.product.find(
          (field) => field.name === "categoryId"
        );
        if (categoryField) {
          categoryField.options = categoryOptions;
        }
      }

      if (entityType === "category") {
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

  const formik = useFormik<FormValues>({
    initialValues: getInitialValues(entityType, entityData) as FormValues,
    validationSchema: getValidationSchema(entityType),
    onSubmit: async (values) => {
      try {
        // Помечаем все поля как затронутые перед валидацией
        Object.keys(values).forEach((key) => {
          formik.setFieldTouched(key, true, false);
        });

        // Проверяем валидность формы вручную
        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) {
          setError("Пожалуйста, проверьте правильность заполнения полей");
          return;
        }

        setLoading(true);
        setError(null);

        if (entityData) {
          if (entityType === "product") {
            try {
              const productValues = values as ProductFormValues;
              const productData = {
                name: productValues.name,
                description: productValues.description,
                price: productValues.price,
                image: productValues.image,
                category: productValues.categoryId,
                unitOfMeasure: productValues.unitOfMeasure || "шт",
              };

              if (!entityData._id) {
                throw new Error("Отсутствует ID товара для обновления");
              }

              const result = await productService.updateProduct(
                entityData._id,
                productData
              );

              dispatch(fetchProducts());

              onClose();
            } catch (updateError) {
              throw updateError;
            }
          } else if (entityType === "category") {
            const categoryValues = values as CategoryFormValues;
            await dispatch(
              updateCategory({
                id: entityData._id || entityData.id,
                category: {
                  name: categoryValues.name,
                  description: categoryValues.description,
                  image: categoryValues.image,
                  parentId: categoryValues.parentId,
                  _id: entityData._id || entityData.id,
                },
              })
            ).unwrap();

            onClose();
          }
        } else {
          if (entityType === "product") {
            try {
              const productValues = values as ProductFormValues;
              const productData = {
                name: productValues.name,
                description: productValues.description,
                price: productValues.price,
                image: productValues.image,
                category: productValues.categoryId,
                unitOfMeasure: productValues.unitOfMeasure || "шт",
              };

              const result = await productService.createProduct(productData);

              dispatch(fetchProducts());

              onClose();
            } catch (createError) {
              throw createError;
            }
          } else if (entityType === "category") {
            const categoryValues = values as CategoryFormValues;
            await dispatch(
              createCategory({
                name: categoryValues.name,
                description: categoryValues.description,
                image: categoryValues.image,
                parentId: categoryValues.parentId,
              })
            ).unwrap();

            onClose();
          }
        }

        if (afterSubmit) {
          afterSubmit();
        }
      } catch (error: any) {
        setError(error.message || `Ошибка при сохранении ${entityType}`);
      } finally {
        setLoading(false);
      }
    },
  });

  // Сбросить значения формы при изменении entityData
  useEffect(() => {
    if (entityData) {
      const initialValues = getInitialValues(
        entityType,
        entityData
      ) as FormValues;
      formik.resetForm({
        values: initialValues,
      });
    }
  }, [entityData, entityType]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {getTitleByEntityType(entityType, entityData)}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {error && <div className={styles.formError}>{error}</div>}

        <form onSubmit={formik.handleSubmit} className={styles.form}>
          {ENTITY_FIELDS[entityType].map((field) => (
            <div key={field.name} className={styles.formGroup}>
              <label htmlFor={field.name}>{field.label}</label>
              {field.type === "textarea" ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  value={
                    formik.values[field.name as keyof FormValues] as string
                  }
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched[field.name as keyof FormValues] &&
                    formik.errors[field.name as keyof FormValues]
                      ? styles.error
                      : ""
                  }
                />
              ) : field.type === "select" ? (
                <select
                  id={field.name}
                  name={field.name}
                  value={
                    formik.values[field.name as keyof FormValues] as string
                  }
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched[field.name as keyof FormValues] &&
                    formik.errors[field.name as keyof FormValues]
                      ? styles.error
                      : ""
                  }
                >
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  value={
                    formik.values[field.name as keyof FormValues] as
                      | string
                      | number
                  }
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched[field.name as keyof FormValues] &&
                    formik.errors[field.name as keyof FormValues]
                      ? styles.error
                      : ""
                  }
                />
              )}
              {formik.touched[field.name as keyof FormValues] &&
                formik.errors[field.name as keyof FormValues] && (
                  <div className={styles.errorMessage}>
                    {formik.errors[field.name as keyof FormValues] as string}
                  </div>
                )}
              {field.type === "url" &&
                formik.values[field.name as keyof FormValues] && (
                  <div className={styles.imagePreview}>
                    <img
                      src={
                        formik.values[field.name as keyof FormValues] as string
                      }
                      alt="Предпросмотр"
                    />
                  </div>
                )}
            </div>
          ))}

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={loading}
            >
              <CancelIcon />
              Отмена
            </button>
            <button
              type="button"
              className={styles.submitButton}
              disabled={loading}
              onClick={(e) => {
                e.preventDefault();
                // Помечаем все поля как затронутые
                Object.keys(formik.values).forEach((key) => {
                  formik.setFieldTouched(key, true, false);
                });

                // Вызываем отправку формы
                formik.handleSubmit();
              }}
            >
              <SaveIcon />
              {loading ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
