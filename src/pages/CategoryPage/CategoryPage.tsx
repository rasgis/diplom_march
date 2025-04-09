import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
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
    (category: Category) => category._id === categoryId
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

  // Получаем ID всех подкатегорий (включая все уровни вложенности)
  const getAllSubcategoryIds = (parentCategoryId: string): string[] => {
    const directSubcategories = categories.filter(
      (category) => category.parentId === parentCategoryId
    );

    if (directSubcategories.length === 0) {
      return [parentCategoryId];
    }

    const allSubcategoryIds = directSubcategories.flatMap((subcat) =>
      getAllSubcategoryIds(subcat._id)
    );

    return [parentCategoryId, ...allSubcategoryIds];
  };

  // Получаем все ID категорий, включая текущую и все подкатегории
  const allCategoryIds = getAllSubcategoryIds(categoryId || "");

  // Фильтруем продукты текущей категории и всех её подкатегорий
  const categoryProducts = products.filter((product: Product) => {
    const productCategoryId =
      typeof product.category === "object" && product.category !== null
        ? product.category._id
        : product.category;

    return allCategoryIds.includes(productCategoryId);
  });

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
              <Typography
                key={category._id}
                className={styles.breadcrumbActive}
              >
                {category.name}
              </Typography>
            ) : (
              <MuiLink
                key={category._id}
                component={Link}
                to={`${ROUTES.CATEGORY.replace(":categoryId", category._id)}`}
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
                <div key={product._id} className={styles.productGridItem}>
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
