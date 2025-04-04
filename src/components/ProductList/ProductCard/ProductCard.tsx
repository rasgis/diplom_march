import React from "react";
import { Link } from "react-router-dom";
import { useAppDispatch } from "../../../hooks";
import { Product } from "../../../types";
import { ROUTES } from "../../../constants";
import { addToCart } from "../../../reducers";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useAppDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart(product));
  };

  return (
    <div className={styles.card}>
      <Link
        to={`${ROUTES.PRODUCTS}/${product.id}`}
        className={styles.imageLink}
      >
        <img src={product.image} alt={product.name} className={styles.image} />
      </Link>
      <div className={styles.content}>
        <Link to={`${ROUTES.PRODUCTS}/${product.id}`} className={styles.title}>
          {product.name}
        </Link>
        <p className={styles.category}>{product.category}</p>
        <p className={styles.price}>{product.price} ₽</p>
        <button
          onClick={handleAddToCart}
          className={styles.addToCart}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? "Нет в наличии" : "В корзину"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
