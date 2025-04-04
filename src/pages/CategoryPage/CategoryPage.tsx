import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Grid,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchCategories } from "../../reducers/categorySlice";
import { fetchProducts } from "../../reducers/productSlice";
import CategoryGrid from "../../components/CategoryGrid/CategoryGrid";
import ProductCard from "../../components/ProductCard/ProductCard";
import Loader from "../../components/Loader";
import { ROUTES } from "../../constants/routes";
import { Category, Product } from "../../types";
import { categoryService } from "../../services/categoryService";
import styles from "./CategoryPage.module.css";

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const dispatch = useAppDispatch();
  const {
    items: categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useAppSelector((state) => state.categories);
  const {
    items: products,
    loading: productsLoading,
    error: productsError,
  } = useAppSelector((state) => state.products);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (categoryId) {
      dispatch(fetchCategories());
      dispatch(fetchProducts());
    }
  }, [dispatch, categoryId]);

  if (categoriesLoading || productsLoading) {
    return (
      <Container className={styles.container}>
        <Loader message="Загрузка категории и товаров..." />
      </Container>
    );
  }

  if (categoriesError || productsError) {
    return (
      <Container className={styles.container}>
        <Typography color="error">
          {categoriesError || productsError}
        </Typography>
      </Container>
    );
  }

  const currentCategory = categories.find(
    (category: Category) => category.id === categoryId
  );

  if (!currentCategory) {
    return (
      <Container className={styles.container}>
        <Typography>Категория не найдена</Typography>
      </Container>
    );
  }

  // Получаем полный путь категории
  const categoryPath = categoryService.getCategoryPath(
    categories,
    categoryId || ""
  );

  // Фильтруем только подкатегории текущей категории
  const subcategories = categories.filter(
    (category: Category) => category.parentId === categoryId
  );

  // Фильтруем продукты текущей категории
  const categoryProducts = products.filter(
    (product: Product) => product.categoryId === categoryId
  );

  return (
    <Container className={styles.container}>
      <Box className={styles.content}>
        <Breadcrumbs aria-label="breadcrumb" className={styles.breadcrumbs}>
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
        </Breadcrumbs>

        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          className={styles.title}
        >
          {currentCategory.name}
        </Typography>

        {subcategories.length > 0 && (
          <Box className={styles.section}>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              className={styles.sectionTitle}
            >
              Подкатегории
            </Typography>
            <CategoryGrid categories={subcategories} />
          </Box>
        )}

        {categoryProducts.length > 0 && (
          <Box className={styles.section}>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              className={styles.sectionTitle}
            >
              Товары в категории
            </Typography>
            <Grid container spacing={3} className={styles.productGrid}>
              {categoryProducts.map((product: Product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                  <ProductCard
                    product={product}
                    isAuthenticated={isAuthenticated}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {subcategories.length === 0 && categoryProducts.length === 0 && (
          <Typography className={styles.emptyMessage}>
            В данной категории нет подкатегорий и товаров
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default CategoryPage;
