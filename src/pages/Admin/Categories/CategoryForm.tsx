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
  onSubmit: (data: Omit<Category, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  categories,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [image, setImage] = useState<File | null>(null);
  const [imagePath, setImagePath] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setParentId(category.parentId);
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
        console.log("Uploading image:", image);
        finalImagePath = await fileService.saveImage(image);
        console.log("Image uploaded successfully:", finalImagePath);
      }

      const categoryData = {
        name,
        image: finalImagePath,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        order: category?.order || 0,
        parentId: parentId || undefined,
      };

      console.log("Submitting category data:", categoryData);
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
    console.log("Image selected:", file);
    setImage(file);
  };

  // Фильтруем категории, чтобы исключить текущую категорию и её подкатегории
  const availableParentCategories = categories.filter((c) => {
    if (category && c.id === category.id) return false;
    return true;
  });

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
          value={parentId || ""}
          onChange={(e) => setParentId(e.target.value || undefined)}
          className={styles.select}
        >
          <option value="">Нет</option>
          {availableParentCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Изображение</label>
        <ImageUpload
          onImageSelect={handleImageSelect}
          currentImage={imagePath}
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
