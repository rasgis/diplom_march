import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import {
  fetchCategories,
  deleteCategory,
} from "../../../reducers/categorySlice";
import CategoryList from "./CategoryList";
import { Loader, EntityForm } from "../../../components";
import { Category } from "../../../types";
import styles from "./Categories.module.css";
import { DeleteConfirmationModal } from "../../../components/DeleteConfirmationModal/DeleteConfirmationModal";

const CategoryListContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    items: categories,
    loading,
    error,
  } = useAppSelector((state) => state.categories);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsFormModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsFormModalOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setDeleteCategoryId(categoryId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteCategoryId) {
      await dispatch(deleteCategory(deleteCategoryId));
      setIsDeleteModalOpen(false);
      setDeleteCategoryId(null);
    }
  };

  const handleFormClose = () => {
    setIsFormModalOpen(false);
    setSelectedCategory(null);
  };

  const handleFormSubmit = () => {
    dispatch(fetchCategories());
  };

  if (loading) {
    return <Loader message="Загрузка категорий..." />;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <CategoryList
        categories={categories}
        onAdd={handleAddCategory}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Удаление категории"
        itemName="категорию"
      />

      <EntityForm
        isOpen={isFormModalOpen}
        onClose={handleFormClose}
        entityType="category"
        entityData={selectedCategory}
        afterSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default CategoryListContainer;
