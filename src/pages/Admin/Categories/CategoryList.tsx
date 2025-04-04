import React, { useState } from "react";
import { Category } from "../../../types";
import CategoryForm from "./CategoryForm";
import styles from "./CategoryList.module.css";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

interface CategoryListProps {
  categories: Category[];
  onAdd: (
    category: Omit<
      Category,
      "id" | "slug" | "order" | "createdAt" | "updatedAt"
    >
  ) => Promise<void>;
  onEdit: (
    id: string,
    category: Omit<
      Category,
      "id" | "slug" | "order" | "createdAt" | "updatedAt"
    >
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReorder: (categories: Category[]) => Promise<void>;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories = [],
  onAdd,
  onEdit,
  onDelete,
  onReorder,
}) => {
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});

  const handleAdd = (parentId?: string) => {
    setEditingCategory(null);
    setOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setOpen(true);
  };

  const handleDelete = (category: Category) => {
    setDeletingCategory(category);
  };

  const handleConfirmDelete = async () => {
    if (deletingCategory) {
      await onDelete(deletingCategory.id);
      setDeletingCategory(null);
    }
  };

  const handleSubmit = async (
    category: Omit<
      Category,
      "id" | "slug" | "order" | "createdAt" | "updatedAt"
    >
  ) => {
    if (editingCategory) {
      await onEdit(editingCategory.id, category);
    } else {
      await onAdd(category);
    }
    setOpen(false);
  };

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const renderCategoryRow = (category: Category, level: number = 0) => {
    const hasChildren = categories.some((c) => c.parentId === category.id);
    const isExpanded = expandedCategories[category.id] || false;

    return (
      <React.Fragment key={category.id}>
        <div
          className={styles.categoryItem}
          style={{ marginLeft: `${level * 20}px` }}
        >
          <div className={styles.categoryInfo}>
            <div className={styles.expandButtonContainer}>
              {hasChildren ? (
                <button
                  className={styles.expandButton}
                  onClick={() => toggleExpand(category.id)}
                >
                  {isExpanded ? (
                    <ExpandLessIcon fontSize="small" />
                  ) : (
                    <ExpandMoreIcon fontSize="small" />
                  )}
                </button>
              ) : (
                <div className={styles.expandButtonPlaceholder}></div>
              )}
            </div>
            {category.image && (
              <img
                src={category.image}
                alt={category.name}
                className={styles.categoryImage}
              />
            )}
            <h3>{category.name}</h3>
          </div>
          <div className={styles.actions}>
            <button
              className={styles.editButton}
              onClick={() => handleEdit(category)}
            >
              <EditIcon fontSize="small" className={styles.buttonIcon} />
              Редактировать
            </button>
            <button
              className={styles.deleteButton}
              onClick={() => handleDelete(category)}
            >
              <DeleteIcon fontSize="small" className={styles.buttonIcon} />
              Удалить
            </button>
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div className={styles.childrenContainer}>
            {categories
              .filter((c) => c.parentId === category.id)
              .map((child) => renderCategoryRow(child, level + 1))}
          </div>
        )}
      </React.Fragment>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Категории</h1>
        <button className={styles.addButton} onClick={() => handleAdd()}>
          <AddIcon fontSize="small" className={styles.buttonIcon} />
          Добавить категорию
        </button>
      </div>

      <div className={styles.list}>
        {categories
          .filter((category) => !category.parentId)
          .map((category) => renderCategoryRow(category))}
      </div>

      {open && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>
              {editingCategory
                ? "Редактировать категорию"
                : "Добавить категорию"}
            </h2>
            <CategoryForm
              category={editingCategory || undefined}
              categories={categories}
              onSubmit={handleSubmit}
              onCancel={() => setOpen(false)}
            />
          </div>
        </div>
      )}

      {deletingCategory && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Подтверждение удаления</h2>
            <p>
              Вы уверены, что хотите удалить категорию "{deletingCategory.name}
              "?
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setDeletingCategory(null)}
              >
                Отмена
              </button>
              <button
                className={styles.confirmButton}
                onClick={handleConfirmDelete}
              >
                <DeleteIcon fontSize="small" className={styles.buttonIcon} />
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
