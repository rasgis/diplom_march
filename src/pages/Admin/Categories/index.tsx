import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../../reducers/categorySlice";
import CategoryList from "./CategoryList";
import { Category } from "../../../types";
import styles from "./Categories.module.css";

const CategoryListContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    items: categories,
    loading,
    error,
  } = useAppSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleCreateCategory = async (
    categoryData: Omit<
      Category,
      "id" | "slug" | "order" | "createdAt" | "updatedAt"
    >
  ) => {
    // Slug и order будут добавлены на бэкенде, но можно и здесь их добавить
    const category = {
      ...categoryData,
      slug: categoryData.name.toLowerCase().replace(/\s+/g, "-"),
      order: categories.length,
    };
    await dispatch(createCategory(category));
  };

  const handleUpdateCategory = async (
    id: string,
    categoryData: Omit<
      Category,
      "id" | "slug" | "order" | "createdAt" | "updatedAt"
    >
  ) => {
    const existingCategory = categories.find((c) => c.id === id);
    const category = {
      ...categoryData,
      slug:
        existingCategory?.slug ||
        categoryData.name.toLowerCase().replace(/\s+/g, "-"),
      order: existingCategory?.order || 0,
    };
    await dispatch(updateCategory({ id, category }));
  };

  const handleDeleteCategory = async (id: string) => {
    await dispatch(deleteCategory(id));
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Загрузка категорий...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>Ошибка при загрузке категорий: {error}</p>
      </div>
    );
  }

  return (
    <CategoryList
      categories={categories}
      onAdd={handleCreateCategory}
      onEdit={handleUpdateCategory}
      onDelete={handleDeleteCategory}
      onReorder={() => Promise.resolve()}
    />
  );
};

export default CategoryListContainer;
