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
import HomeIcon from "@mui/icons-material/Home";
import CategoryIcon from "@mui/icons-material/Category";
import { scrollToTop } from "../../utils/scroll";

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

      // Плавный скролл вверх при переходе на новую страницу
      scrollToTop();
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
        <div className={styles.content}>
          <div className={styles.emptyMessage}>
            <CategoryIcon style={{ fontSize: 48, marginBottom: "1rem" }} />
            <Typography variant="h5">Категория не найдена</Typography>
            <MuiLink
              component={Link}
              to={ROUTES.CATALOG}
              className={styles.returnLink}
              onClick={scrollToTop}
            >
              Вернуться в каталог
            </MuiLink>
          </div>
        </div>
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
          <MuiLink
            component={Link}
            to={ROUTES.HOME}
            className={styles.breadcrumbLink}
          >
            <HomeIcon style={{ marginRight: "4px", fontSize: 18 }} />
            Главная
          </MuiLink>
          <MuiLink
            component={Link}
            to={ROUTES.CATALOG}
            className={styles.breadcrumbLink}
          >
            <CategoryIcon style={{ marginRight: "4px", fontSize: 18 }} />
            Каталог
          </MuiLink>
          {categoryPath.map((category, index) => {
            const isLast = index === categoryPath.length - 1;
            return isLast ? (
              <Typography key={category.id} className={styles.breadcrumbActive}>
                {category.name}
              </Typography>
            ) : (
              <MuiLink
                key={category.id}
                component={Link}
                to={`${ROUTES.CATEGORY.replace(":categoryId", category.id)}`}
                className={styles.breadcrumbLink}
              >
                {category.name}
              </MuiLink>
            );
          })}
        </Breadcrumbs>

        <Typography variant="h4" component="h1" className={styles.title}>
          {currentCategory.name}
        </Typography>

        {subcategories.length > 0 && (
          <Box className={styles.section}>
            <div className={styles.subcategoriesContainer}>
              <CategoryGrid categories={subcategories} />
            </div>
          </Box>
        )}

        {categoryProducts.length > 0 && (
          <Box className={styles.section}>
            <Typography
              variant="h5"
              component="h2"
              className={styles.sectionTitle}
            >
              Товары в категории
            </Typography>
            <div className={styles.productGrid}>
              {categoryProducts.map((product: Product) => (
                <div key={product.id} className={styles.productGridItem}>
                  <ProductCard
                    product={product}
                    isAuthenticated={isAuthenticated}
                  />
                </div>
              ))}
            </div>
          </Box>
        )}

        {subcategories.length === 0 && categoryProducts.length === 0 && (
          <div className={styles.emptyMessage}>
            <CategoryIcon style={{ fontSize: 48, marginBottom: "1rem" }} />
            <Typography variant="h5">
              Товары в этой категории временно отсутствуют
            </Typography>
            <Typography variant="body1" className={styles.emptySubtext}>
              Пожалуйста, загляните позже или выберите другую категорию
            </Typography>
            <div style={{ marginTop: "2rem" }}>
              <MuiLink
                component={Link}
                to={ROUTES.CATALOG}
                className={styles.returnLink}
                onClick={scrollToTop}
              >
                Вернуться в каталог
              </MuiLink>
            </div>
          </div>
        )}
      </Box>
    </Container>
  );
};

export default CategoryPage;
