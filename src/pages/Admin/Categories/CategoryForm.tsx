import React, { useState, useEffect } from "react";
import { Category } from "../../../types/category";
import ImageUpload from "../../../components/ImageUpload/ImageUpload";
import { fileService } from "../../../services/fileService";
import styles from "./CategoryForm.module.css";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

interface CategoryFormProps {
  category?: Category;
  categories: Category[];
  parentId?: string;
  onSubmit: (
    data: Omit<Category, "_id" | "slug" | "order" | "createdAt" | "updatedAt">
  ) => void;
  onCancel: () => void;
}

// Компонент для рекурсивного отображения категорий
const CategoryOption: React.FC<{
  category: Category;
  level: number;
  currentCategoryId?: string;
}> = ({ category, level, currentCategoryId }) => {
  // Пропускаем текущую категорию и её подкатегории при редактировании
  if (currentCategoryId && category._id === currentCategoryId) {
    return null;
  }

  const prefix = "\u00A0".repeat(level * 4);
  return (
    <>
      <option value={category._id}>
        {prefix}
        {level > 0 ? "— " : ""}
        {category.name}
      </option>
      {category.children?.map((child) => (
        <CategoryOption
          key={`option-${child._id}`}
          category={child}
          level={level + 1}
          currentCategoryId={currentCategoryId}
        />
      ))}
    </>
  );
};

const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  categories,
  parentId,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>(
    parentId
  );
  const [image, setImage] = useState<File | null>(null);
  const [imagePath, setImagePath] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setSelectedParentId(category.parentId);
      setImagePath(category.image || undefined);
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let finalImagePath = imagePath || "";

      if (image) {
        finalImagePath = await fileService.saveImage(image);
      }

      const categoryData = {
        name,
        image: finalImagePath,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        order: category?.order || 0,
        parentId: selectedParentId || undefined,
      };

      onSubmit(categoryData);
    } catch (error) {
      console.error("Error saving category:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Произошла ошибка при сохранении категории"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (file: File) => {
    setImage(file);
  };

  // Фильтруем категории, чтобы исключить текущую категорию и её подкатегории
  const buildCategoryTree = (categories: Category[]): Category[] => {
    const categoryMap = new Map<string, Category>();
    categories.forEach((category) => {
      if (category._id) {
        categoryMap.set(category._id, { ...category, children: [] });
      }
    });

    const rootCategories: Category[] = [];
    categories.forEach((category) => {
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent && category._id) {
          parent.children = parent.children || [];
          parent.children.push(categoryMap.get(category._id)!);
        }
      } else if (category._id) {
        rootCategories.push(categoryMap.get(category._id)!);
      }
    });

    return rootCategories;
  };

  const categoryTree = buildCategoryTree(categories);

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="name">Название категории</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="parentId">Родительская категория</label>
        <select
          id="parentId"
          value={selectedParentId || ""}
          onChange={(e) => setSelectedParentId(e.target.value || undefined)}
          className={styles.select}
        >
          <option value="">Нет</option>
          {categoryTree.map((cat) => (
            <CategoryOption
              key={`option-root-${cat._id}`}
              category={cat}
              level={0}
              currentCategoryId={category?._id}
            />
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Изображение</label>
        <ImageUpload
          onImageSelect={handleImageSelect}
          currentImage={category?.image}
          maxWidth={600}
          maxHeight={600}
          quality={0.75}
        />
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.cancelButton}
          disabled={isLoading}
        >
          <CancelIcon fontSize="small" className={styles.buttonIcon} />
          Отмена
        </button>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading}
        >
          <SaveIcon fontSize="small" className={styles.buttonIcon} />
          {isLoading ? "Сохранение..." : "Сохранить"}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
