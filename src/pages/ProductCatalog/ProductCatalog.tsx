import React, { useEffect } from "react";
import { Container, Typography, Box } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchCategories } from "../../reducers/categorySlice";
import CategoryGrid from "../../components/CategoryGrid/CategoryGrid";
import Loader from "../../components/Loader";
import { categoryService } from "../../services/categoryService";
import styles from "./ProductCatalog.module.css";

const ProductCatalog: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    items: categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useAppSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  if (categoriesLoading) {
    return (
      <Container className={styles.container}>
        <Loader message="Загрузка категорий..." />
      </Container>
    );
  }

  if (categoriesError) {
    return (
      <Container className={styles.container}>
        <Typography color="error">{categoriesError}</Typography>
      </Container>
    );
  }

  const rootCategories = categoryService.buildCategoryTree(categories);

  return (
    <Container className={styles.container}>
      <Box className={styles.content}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          className={styles.title}
        >
          Каталог товаров
        </Typography>

        {rootCategories.length === 0 ? (
          <Typography>Нет доступных категорий</Typography>
        ) : (
          <Box className={styles.categoriesContainer}>
            <CategoryGrid categories={rootCategories} />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ProductCatalog;
