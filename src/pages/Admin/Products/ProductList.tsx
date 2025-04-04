import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import {
  fetchProducts,
  deleteProduct,
  createProduct,
  updateProduct,
} from "../../../reducers/productSlice";
import { fetchCategories } from "../../../reducers/categorySlice";
import { ROUTES } from "../../../constants/routes";
import ProductForm from "./ProductForm";
import styles from "./Admin.module.css";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import WarningIcon from "@mui/icons-material/Warning";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}

const DeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
}: DeleteModalProps) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <WarningIcon className={styles.buttonIcon} />
            {title}
          </h2>
          <button className={styles.modalClose} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className={styles.modalBody}>
          <p>Вы уверены, что хотите удалить этот товар?</p>
          <p>Это действие нельзя будет отменить.</p>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.modalCancelButton} onClick={onClose}>
            Отмена
          </button>
          <button className={styles.modalConfirmButton} onClick={onConfirm}>
            <DeleteIcon className={styles.buttonIcon} />
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductList: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    items: products,
    loading,
    error,
  } = useAppSelector((state) => state.products);
  const { items: categories } = useAppSelector((state) => state.categories);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [productToEdit, setProductToEdit] = useState<any | null>(null);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      try {
        await dispatch(deleteProduct(productToDelete)).unwrap();
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleAddClick = () => {
    setProductToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (product: any) => {
    setProductToEdit(product);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (values: any) => {
    try {
      if (productToEdit) {
        await dispatch(
          updateProduct({ id: productToEdit.id, product: values })
        ).unwrap();
      } else {
        await dispatch(createProduct(values)).unwrap();
      }
      setIsFormModalOpen(false);
      setProductToEdit(null);
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleFormCancel = () => {
    setIsFormModalOpen(false);
    setProductToEdit(null);
  };

  // Функция для получения названия категории по ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Неизвестная категория";
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!products || products.length === 0) {
    return <div className={styles.empty}>Товары не найдены</div>;
  }

  return (
    <div className={styles.adminContainer}>
      <div className={styles.header}>
        <h2>Управление товарами</h2>
        <button onClick={handleAddClick} className={styles.addButton}>
          <AddIcon className={styles.buttonIcon} />
          Добавить товар
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Изображение</th>
              <th>Название</th>
              <th>Описание</th>
              <th>Цена</th>
              <th>Категория</th>
              <th>Ед. изм.</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <img
                    src={product.image}
                    alt={product.name}
                    className={styles.productImage}
                  />
                </td>
                <td>{product.name}</td>
                <td>{product.description}</td>
                <td>{product.price} ₽</td>
                <td>
                  {categories.find((cat) => cat.id === product.categoryId)
                    ?.name || "Не указана"}
                </td>
                <td>{product.unitOfMeasure}</td>
                <td>
                  <div className={styles.actions}>
                    <button
                      onClick={() => handleEditClick(product)}
                      className={styles.editButton}
                    >
                      <EditIcon className={styles.buttonIcon} />
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDeleteClick(product.id)}
                      className={styles.deleteButton}
                    >
                      <DeleteIcon className={styles.buttonIcon} />
                      Удалить
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Подтверждение удаления"
      />

      {isFormModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {productToEdit ? "Редактирование товара" : "Добавление товара"}
              </h2>
              <button className={styles.modalClose} onClick={handleFormCancel}>
                <CloseIcon />
              </button>
            </div>
            <ProductForm
              product={productToEdit}
              categories={categories}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
