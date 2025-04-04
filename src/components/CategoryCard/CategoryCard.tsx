import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { Category } from "../../types";
import styles from "./CategoryCard.module.css";

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link
      to={ROUTES.CATEGORY.replace(":categoryId", category.id)}
      className={styles.link}
    >
      <div className={styles.card}>
        <div className={styles.media}>
          <img src={category.image || "/placeholder.jpg"} alt={category.name} />
        </div>
        <div className={styles.title}>{category.name}</div>
      </div>
    </Link>
  );
};

export default CategoryCard;
