import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";
import ScrollTop from "../ScrollTop/ScrollTop";
import { scrollToTop } from "../../utils/scroll";
import styles from "./Layout.module.css";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  // Scroll to top when location changes
  useEffect(() => {
    scrollToTop();
  }, [location]);

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
