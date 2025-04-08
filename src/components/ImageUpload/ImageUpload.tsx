import React, { useRef, useState } from "react";
import styles from "./ImageUpload.module.css";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { optimizeImage } from "../../utils/imageUtils";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  currentImage?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  currentImage,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.7,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setLoading(true);

      try {
        // Оптимизируем изображение перед отправкой
        const optimizedFile = await optimizeImage(
          file,
          maxWidth,
          maxHeight,
          quality
        );

        // Отправляем оптимизированный файл
        onImageSelect(optimizedFile);

        // Создаем превью изображения
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
          setLoading(false);
        };
        reader.readAsDataURL(optimizedFile);
      } catch (error) {
        console.error("Ошибка при оптимизации изображения:", error);

        // В случае ошибки используем оригинальный файл
        onImageSelect(file);

        // Создаем превью оригинального изображения
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
          setLoading(false);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.container}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className={styles.input}
        hidden
      />
      <div className={styles.preview} onClick={handleClick}>
        {loading ? (
          <div className={styles.loading}>
            <span>Обработка изображения...</span>
          </div>
        ) : preview ? (
          <img src={preview} alt="Preview" className={styles.image} />
        ) : (
          <div className={styles.placeholder}>
            <CloudUploadIcon style={{ fontSize: 48, marginBottom: "0.5rem" }} />
            <span>Нажмите для загрузки изображения</span>
            <span
              style={{ fontSize: "0.8rem", opacity: 0.8, marginTop: "0.25rem" }}
            >
              Поддерживаются форматы JPG, PNG
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
