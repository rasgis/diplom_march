import React from "react";
import styles from "./Modal.module.css";
import CloseIcon from "@mui/icons-material/Close";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  hideActions?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  hideActions = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      {/* <div className={styles.modalBody}> */}
      {/* <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button onClick={onClose} className={styles.modalClose}>
            <CloseIcon fontSize="small" />
          </button>
        </div> */}
      {children}
      {!hideActions && (
        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.cancelButton}>
            Отмена
          </button>
          <button onClick={onConfirm} className={styles.confirmButton}>
            Подтвердить
          </button>
        </div>
      )}
      {/* </div> */}
    </div>
  );
};
