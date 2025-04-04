import React from "react";
import CategoryCard from "../CategoryCard/CategoryCard";
import { Category } from "../../types";
import styles from "./CategoryGrid.module.css";

interface CategoryGridProps {
  categories: Category[];
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ categories }) => {
  return (
    <div className={styles.gridContainer}>
      <div className={styles.categoryGrid}>
        {categories.map((category) => (
          <div key={category.id} className={styles.gridItem}>
            <CategoryCard category={category} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
