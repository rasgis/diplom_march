import React, { useState, useEffect } from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Поиск товаров...",
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Добавляем небольшую задержку для предотвращения частых вызовов при вводе
    const timer = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleClear = () => {
    setSearchQuery("");
  };

  return (
    <div className={styles.searchContainer}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleChange}
        className={styles.searchField}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon className={styles.searchIcon} />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton onClick={handleClear} edge="end" size="small">
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </div>
  );
};

export default SearchBar;
