import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { fetchProducts } from "../../reducers/productSlice";
import ProductCard from "../ProductCard/ProductCard";
import styles from "./ProductList.module.css";
import { Product } from "../../types";

const ProductList: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    items: products,
    loading,
    error,
  } = useAppSelector((state) => state.products);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        await dispatch(fetchProducts()).unwrap();
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    loadProducts();
  }, [dispatch]);

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
    <div className={styles.productList}>
      {products.map((product: Product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
