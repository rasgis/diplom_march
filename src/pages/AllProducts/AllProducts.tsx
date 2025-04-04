import React, { useEffect, useState } from "react";
import { Container, Typography, Box, Grid } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchProducts } from "../../reducers/productSlice";
import ProductCard from "../../components/ProductCard/ProductCard";
import SearchBar from "../../components/SearchBar";
import Loader from "../../components/Loader";
import styles from "./AllProducts.module.css";

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

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (products) {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [products, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

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
          Все товары
        </Typography>

        <SearchBar onSearch={handleSearch} />

        {filteredProducts.length === 0 ? (
          <Typography>
            {searchQuery ? "Товары не найдены" : "Нет доступных товаров"}
          </Typography>
        ) : (
          <Grid container spacing={3} className={styles.productGrid}>
            {filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <ProductCard
                  product={product}
                  isAuthenticated={isAuthenticated}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default AllProducts;
