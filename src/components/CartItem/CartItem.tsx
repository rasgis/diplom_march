import React, { useState } from "react";
import { useAppDispatch } from "../../hooks";
import { removeFromCart, updateQuantity } from "../../reducers/cartSlice";
import { CartItem as CartItemType } from "../../types";
import styles from "./CartItem.module.css";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteConfirmationModal from "../DeleteConfirmationModal/DeleteConfirmationModal";

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const dispatch = useAppDispatch();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleRemove = () => {
    dispatch(removeFromCart(item._id));
    setIsDeleteModalOpen(false);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0) {
      dispatch(updateQuantity({ _id: item._id, quantity: newQuantity }));
    }
  };

  return (
    <>
      <div className={styles.cartItem}>
        <div className={styles.imageContainer}>
          <img src={item.image} alt={item.name} className={styles.image} />
        </div>
        <div className={styles.info}>
          <h3 className={styles.name}>{item.name}</h3>
          <p className={styles.category}>
            {typeof item.category === "string"
              ? item.category
              : item.category.name}
          </p>
          <p className={styles.price}>{item.price} ₽</p>
        </div>
        <div className={styles.quantity}>
          <button
            className={styles.quantityButton}
            onClick={() => handleQuantityChange(item.quantity - 1)}
          >
            <RemoveIcon />
          </button>
          <span className={styles.quantityValue}>{item.quantity}</span>
          <button
            className={styles.quantityButton}
            onClick={() => handleQuantityChange(item.quantity + 1)}
          >
            <AddIcon />
          </button>
        </div>
        <button
          className={styles.removeButton}
          onClick={() => setIsDeleteModalOpen(true)}
        >
          <DeleteIcon />
        </button>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleRemove}
        title="Подтверждение удаления"
        itemName={item.name}
        itemType="товар"
      />
    </>
  );
};

export default CartItem;
