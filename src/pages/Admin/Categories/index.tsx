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
      "_id" | "slug" | "order" | "createdAt" | "updatedAt"
    >
  ) => {
    const category = {
      ...categoryData,
      slug: categoryData.name.toLowerCase().replace(/\s+/g, "-"),
      order: categories.length,
    };
    await dispatch(createCategory(category));
    dispatch(fetchCategories());
  };

  const handleUpdateCategory = async (
    id: string,
    categoryData: Omit<
      Category,
      "_id" | "slug" | "order" | "createdAt" | "updatedAt"
    >
  ) => {
    const existingCategory = categories.find((c) => c._id === id);
    const category = {
      ...categoryData,
      slug:
        existingCategory?.slug ||
        categoryData.name.toLowerCase().replace(/\s+/g, "-"),
      order: existingCategory?.order || 0,
    };
    await dispatch(updateCategory({ id, category }));
    dispatch(fetchCategories());
  };

  const handleDeleteCategory = async (id: string) => {
    await dispatch(deleteCategory(id));
    dispatch(fetchCategories());
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
