import React from "react";
import { useAppSelector } from "../../hooks";
import styles from "./Cart.module.css";

const Cart: React.FC = () => {
  const cartItems = useAppSelector((state) => state.cart.items);

  return (
    <div className="pageContainer">
      <div className="pageContent">
        <div className={styles.cart}>
          <h2>Корзина</h2>
          {cartItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <h2>Корзина пуста</h2>
              <p>Добавьте товары в корзину, чтобы оформить заказ</p>
            </div>
          ) : (
            <>
              <div className={styles.cartItems}>
                {cartItems.map((item) => (
                  <div key={item.id} className={styles.cartItem}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className={styles.itemImage}
                    />
                    <div className={styles.itemInfo}>
                      <h3>{item.name}</h3>
                      <p className={styles.category}>{item.category}</p>
                      <p className={styles.price}>{item.price} ₽</p>
                    </div>
                    <div className={styles.quantity}>
                      <button className={styles.quantityButton}>-</button>
                      <span>{item.quantity}</span>
                      <button className={styles.quantityButton}>+</button>
                    </div>
                    <button className={styles.removeButton}>Удалить</button>
                  </div>
                ))}
              </div>
              <div className={styles.cartSummary}>
                <div className={styles.total}>
                  <span>Итого:</span>
                  <span>
                    {cartItems.reduce(
                      (sum, item) => sum + item.price * item.quantity,
                      0
                    )}{" "}
                    ₽
                  </span>
                </div>
                <div className={styles.actions}>
                  <button className={styles.clearButton}>Очистить</button>
                  <button className={styles.checkoutButton}>
                    Оформить заказ
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
