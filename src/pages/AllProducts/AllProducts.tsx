import React, { useEffect, useState } from "react";
import { Container, Typography, Box, Grid, Pagination } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchProducts } from "../../reducers/productSlice";
import ProductCard from "../../components/ProductCard/ProductCard";
import SearchBar from "../../components/SearchBar";
import Loader from "../../components/Loader";
import styles from "./AllProducts.module.css";
import { scrollToTop } from "../../utils/scroll";

const ITEMS_PER_PAGE = 20; // Количество товаров на странице

const AllProducts: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    items: products,
    loading: productsLoading,
    error: productsError,
  } = useAppSelector((state) => state.products);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [currentPage, setCurrentPage] = useState(1); // Состояние текущей страницы

  useEffect(() => {
    dispatch(fetchProducts());
    // Плавный скролл вверх при переходе на страницу
    scrollToTop();
  }, [dispatch]);

  useEffect(() => {
    if (products) {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
      setCurrentPage(1); // Сбрасываем на первую страницу при новом поиске/фильтрации
    }
  }, [products, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // --- Логика пагинации ---
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
    scrollToTop(); // Скролл вверх при смене страницы
  };
  // --- Конец логики пагинации ---

  if (productsLoading) {
    return (
      <Container className={styles.container}>
        <Loader message="Загрузка товаров..." />
      </Container>
    );
  }

  if (productsError) {
    return (
      <Container className={styles.container}>
        <Typography color="error">{productsError}</Typography>
      </Container>
    );
  }

  return (
    <Container className={styles.container}>
      <Box className={styles.content}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          className={styles.title}
        >
          Поиск товара
        </Typography>

        <SearchBar onSearch={handleSearch} />

        {currentProducts.length === 0 ? (
          <Typography style={{ marginTop: "2rem", color: "#d4ffea" }}>
            {searchQuery
              ? "По вашему запросу товары не найдены."
              : "Нет доступных товаров."}
          </Typography>
        ) : (
          <Grid container spacing={3} className={styles.productGrid}>
            {currentProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <ProductCard
                  product={product}
                  isAuthenticated={isAuthenticated}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {totalPages > 1 && (
          <Box className={styles.paginationContainer}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              variant="outlined"
              shape="rounded"
            />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default AllProducts;
