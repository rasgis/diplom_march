import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../hooks";
import { clearCart } from "../../reducers/cartSlice";
import CartItem from "../../components/CartItem/CartItem";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal/DeleteConfirmationModal";
import styles from "./Cart.module.css";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { scrollToTop } from "../../utils/scroll";

const Cart: React.FC = () => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const total = useAppSelector((state) => state.cart.total);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  useEffect(() => {
    // Плавный скролл вверх при переходе на страницу
    scrollToTop();
  }, []);

  const handleClearCart = () => {
    dispatch(clearCart());
    setIsClearModalOpen(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.cart}>
          <h1 className={styles.title}>Корзина</h1>
          {cartItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <ShoppingCartIcon className={styles.emptyIcon} />
              <h2>Корзина пуста</h2>
              <p>Добавьте товары в корзину, чтобы оформить заказ</p>
            </div>
          ) : (
            <>
              <div className={styles.cartItems}>
                {cartItems.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
              <div className={styles.cartSummary}>
                <div className={styles.total}>
                  <span>Итого:</span>
                  <span className={styles.totalAmount}>{total} ₽</span>
                </div>
                <div className={styles.actions}>
                  <button
                    className={styles.clearButton}
                    onClick={() => setIsClearModalOpen(true)}
                  >
                    <DeleteIcon />
                    Очистить корзину
                  </button>
                  <button className={styles.checkoutButton}>
                    Оформить заказ
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleClearCart}
        title="Подтверждение очистки"
        itemName="все товары из корзины"
        itemType="корзину"
      />
    </div>
  );
};

export default Cart;
