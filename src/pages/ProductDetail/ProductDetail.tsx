import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchProductById } from "../../reducers/productSlice";
import { fetchCategories } from "../../reducers/categorySlice";
import { addToCart } from "../../reducers/cartSlice";
import {
  Container,
  Typography,
  Box,
  Grid,
  Breadcrumbs,
  Link as MuiLink,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { ROUTES } from "../../constants/routes";
import { categoryService } from "../../services/categoryService";
import styles from "./ProductDetail.module.css";

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const {
    selectedProduct: product,
    loading: productLoading,
    error: productError,
  } = useAppSelector((state) => state.products);
  const {
    items: categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useAppSelector((state) => state.categories);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
    dispatch(fetchCategories());
  }, [dispatch, id]);

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart({ ...product, quantity: 1 }));
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (productLoading || categoriesLoading) {
    return (
      <Container>
        <Typography>Загрузка...</Typography>
      </Container>
    );
  }

  if (productError || categoriesError) {
    return (
      <Container>
        <Typography color="error">{productError || categoriesError}</Typography>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container>
        <Typography>Товар не найден</Typography>
      </Container>
    );
  }

  // Получаем категорию товара
  const productCategory = categories.find(
    (category) => category.id === product.categoryId
  );

  // Получаем полный путь категории
  const categoryPath = categoryService.getCategoryPath(
    categories,
    product.categoryId
  );

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <MuiLink component={Link} to={ROUTES.CATALOG} color="inherit">
            Каталог
          </MuiLink>
          {categoryPath.map((category, index) => {
            const isLast = index === categoryPath.length - 1;
            return isLast ? (
              <Typography key={category.id} color="text.primary">
                {category.name}
              </Typography>
            ) : (
              <MuiLink
                key={category.id}
                component={Link}
                to={`${ROUTES.CATEGORY.replace(":categoryId", category.id)}`}
                color="inherit"
              >
                {category.name}
              </MuiLink>
            );
          })}
          <Typography color="text.primary">{product.name}</Typography>
        </Breadcrumbs>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <img
              src={product.image}
              alt={product.name}
              className={styles.image}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box className={styles.info}>
              <Typography variant="h4" className={styles.title}>
                {product.name}
              </Typography>
              <Typography className={styles.description}>
                {product.description}
              </Typography>
              <Typography className={styles.price}>
                {product.price} ₽ / {product.unitOfMeasure}
              </Typography>
              <Typography className={styles.category}>
                Категория: {productCategory?.name || "Неизвестная категория"}
              </Typography>
              {isAuthenticated && (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleAddToCart}
                  sx={{ mt: 2 }}
                >
                  Добавить в корзину
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
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
    </Container>
  );
};

export default ProductDetail;
