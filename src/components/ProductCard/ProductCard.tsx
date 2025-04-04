import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Product } from "../../types/product";
import { ROUTES } from "../../constants/routes";
import { useAppSelector, useAppDispatch } from "../../hooks/redux";
import { addToCart } from "../../reducers/cartSlice";
import { Button, Snackbar, Alert } from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
  isAuthenticated: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isAuthenticated,
}) => {
  const { items: categories } = useAppSelector((state) => state.categories);
  const dispatch = useAppDispatch();
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Получаем название категории
  const categoryName =
    categories.find((cat) => cat.id === product.categoryId)?.name ||
    "Неизвестная категория";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Предотвращаем переход по ссылке
    e.stopPropagation(); // Предотвращаем всплытие события
    dispatch(addToCart({ ...product, quantity: 1 }));
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <>
      <Link
        to={ROUTES.PRODUCT_DETAIL.replace(":id", product.id)}
        className={styles.cardLink}
      >
        <div className={styles.card}>
          <div className={styles.imageContainer}>
            <img
              src={product.image}
              alt={product.name}
              className={styles.image}
              loading="lazy"
            />
          </div>
          <div className={styles.content}>
            <h3 className={styles.title}>{product.name}</h3>
            <p className={styles.description}>{product.description}</p>
            <div className={styles.category}>{categoryName}</div>
            <div className={styles.price}>
              {product.price} ₽ / {product.unitOfMeasure}
            </div>
            {isAuthenticated && (
              <div className={styles.actions}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddToCart}
                  className={styles.cartButton}
                  startIcon={<AddShoppingCartIcon />}
                >
                  В корзину
                </Button>
              </div>
            )}
          </div>
        </div>
      </Link>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          Товар добавлен в корзину
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProductCard;
