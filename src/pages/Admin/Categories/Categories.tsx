import React from "react";
import styles from "./Categories.module.css";

const Categories: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Управление категориями</h1>
        <div className={styles.adminPanel}>{/* Содержимое страницы */}</div>
      </div>
    </div>
  );
};

export default Categories;
