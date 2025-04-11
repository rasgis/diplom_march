import React, { useState, useEffect } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Поиск товаров...",
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
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
    onSearch("");
  };

  return (
    <div className={styles.searchContainer}>
      <FaSearch className={styles.searchIcon} />
      <input
        type="text"
        className={styles.searchInput}
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleChange}
        aria-label={placeholder}
      />
      {searchQuery && (
        <button
          type="button"
          onClick={handleClear}
          className={styles.clearButton}
          aria-label="Очистить поиск"
        >
          <FaTimes />
        </button>
      )}
    </div>
  );
};
