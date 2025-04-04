import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import WarningIcon from "@mui/icons-material/Warning";
import styles from "./DeleteConfirmationModal.module.css";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  itemType: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemType,
}) => {
  if (!isOpen) return null;

  // Специальный случай для очистки корзины
  const isClearCart =
    itemType === "корзину" && itemName === "все товары из корзины";
  const confirmationText = isClearCart
    ? "Вы уверены, что хотите очистить корзину?"
    : `Вы уверены, что хотите удалить ${itemType} "${itemName}"?`;

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <WarningIcon className={styles.buttonIcon} />
            {title}
          </h2>
          <button className={styles.modalClose} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className={styles.modalBody}>
          <p>{confirmationText}</p>
          <p>Это действие нельзя будет отменить.</p>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.modalCancelButton} onClick={onClose}>
            Отмена
          </button>
          <button className={styles.modalConfirmButton} onClick={onConfirm}>
            <DeleteIcon className={styles.buttonIcon} />
            {isClearCart ? "Очистить" : "Удалить"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
