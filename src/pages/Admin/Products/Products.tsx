import React, { useState } from "react";
import { useAppSelector } from "../../../hooks";
import styles from "./Products.module.css";

const Products: React.FC = () => {
  const products = useAppSelector((state) => state.products.items);
  const categories = useAppSelector((state) => state.categories.items);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Получаем название категории по ID
  const getCategoryName = (categoryId: string) => {
    return (
      categories.find((cat) => cat.id === categoryId)?.name ||
      "Неизвестная категория"
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Управление продуктами</h1>
        <div className={styles.adminPanel}>
          <div className={styles.controls}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Поиск продуктов..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <button className={styles.addButton}>Добавить продукт</button>
          </div>

          <div className={styles.productsList}>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product.id} className={styles.productItem}>
                  <div className={styles.productImage}>
                    <img src={product.image} alt={product.name} />
                  </div>
                  <div className={styles.productInfo}>
                    <h3>{product.name}</h3>
                    <p className={styles.category}>
                      {getCategoryName(product.categoryId)}
                    </p>
                    <p className={styles.price}>{product.price} ₽</p>
                  </div>
                  <div className={styles.productActions}>
                    <button className={styles.editButton}>Редактировать</button>
                    <button className={styles.deleteButton}>Удалить</button>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>Продукты не найдены</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
