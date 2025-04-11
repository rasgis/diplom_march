import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { fetchProducts, deleteProduct } from "../../../reducers/productSlice";
import { fetchCategories } from "../../../reducers/categorySlice";
import { ROUTES } from "../../../constants/routes";
import styles from "./Admin.module.css";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import CloseIcon from "@mui/icons-material/Close";
import { DeleteConfirmationModal } from "../../../components/DeleteConfirmationModal/DeleteConfirmationModal";
import { Loader, EntityForm } from "../../../components";
import { Product } from "../../../types";

const ProductList: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    items: products,
    loading,
    error,
  } = useAppSelector((state) => state.products);
  const { items: categories } = useAppSelector((state) => state.categories);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleAddClick = () => {
    setSelectedProduct(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (productId: string) => {
    setDeleteProductId(productId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteProductId) {
      await dispatch(deleteProduct(deleteProductId));
      setIsDeleteModalOpen(false);
      setDeleteProductId(null);
    }
  };

  const handleFormClose = () => {
    setIsFormModalOpen(false);
    setSelectedProduct(null);
  };

  const handleFormSubmit = () => {
    dispatch(fetchProducts());
  };

  if (loading) {
    return <Loader message="Загрузка списка товаров..." />;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Управление товарами</h2>
        <button onClick={handleAddClick} className={styles.addButton}>
          <FaPlus className={styles.addIcon} />
          Добавить товар
        </button>
      </div>

      {products.length === 0 ? (
        <div className={styles.empty}>Нет товаров</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Изображение</th>
                <th>Название</th>
                <th>Цена</th>
                <th>Категория</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className={styles.productImage}
                      />
                    )}
                  </td>
                  <td>{product.name}</td>
                  <td>
                    {product.price} ₽ / {product.unitOfMeasure}
                  </td>
                  <td>
                    {product.category
                      ? typeof product.category === "object"
                        ? product.category.name || "Без названия"
                        : categories.find((cat) => cat._id === product.category)
                            ?.name || "Неизвестная категория"
                      : "Без категории"}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        onClick={() => handleEditClick(product)}
                        className={styles.editButton}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product._id)}
                        className={styles.deleteButton}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Удаление товара"
        message="Вы уверены, что хотите удалить этот товар? Это действие нельзя отменить."
      />

      <EntityForm
        isOpen={isFormModalOpen}
        onClose={handleFormClose}
        entityType="product"
        entityData={selectedProduct}
        afterSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default ProductList;
