import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";
import ScrollTop from "../ScrollTop/ScrollTop";
import styles from "./Layout.module.css";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer />
      <ScrollTop />
    </div>
  );
};

export default Layout;
