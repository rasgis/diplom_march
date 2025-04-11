import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { User } from "../../../types/user";
import { userService } from "../../../services/userService";
import styles from "../Products/Admin.module.css";
import { Loader } from "../../../components";

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Загрузка пользователей
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Произошла ошибка при загрузке пользователей");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Обработчик открытия модального окна удаления
  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Обработчик удаления пользователя
  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      await userService.deleteUser(selectedUser._id);
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers(); // Перезагрузка списка пользователей
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Произошла ошибка при удалении пользователя");
      }
    }
  };

  // Рендеринг строки таблицы для пользователя
  const renderUserRow = (user: User) => {
    return (
      <tr key={user._id}>
        <td>{user._id}</td>
        <td>{user.name}</td>
        <td>{user.email}</td>
        <td>{user.login}</td>
        <td>
          <span
            className={
              user.role === "admin" ? styles.adminRole : styles.userRole
            }
          >
            {user.role === "admin" ? "Администратор" : "Пользователь"}
          </span>
        </td>
        <td>
          <div className={styles.actions}>
            <Link
              to={`/admin/users/edit/${user._id}`}
              className={styles.editButton}
            >
              <FaEdit />
            </Link>
            <button
              className={styles.deleteButton}
              onClick={() => handleDeleteClick(user)}
            >
              <FaTrash />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Управление пользователями</h2>
        <Link to="/admin/users/create" className={styles.addButton}>
          <FaPlus className={styles.addIcon} />
          Добавить пользователя
        </Link>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <Loader message="Загрузка пользователей..." />
      ) : (
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Email</th>
                <th>Логин</th>
                <th>Роль</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyMessage}>
                    Пользователи не найдены
                  </td>
                </tr>
              ) : (
                users.map(renderUserRow)
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Модальное окно подтверждения удаления */}
      {showDeleteModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Подтверждение удаления</h3>
              <button
                className={styles.closeButton}
                onClick={() => setShowDeleteModal(false)}
              >
                &times;
              </button>
            </div>
            <div className={styles.modalBody}>
              {selectedUser && (
                <p>
                  Вы действительно хотите удалить пользователя{" "}
                  <strong>{selectedUser.name}</strong>?
                </p>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowDeleteModal(false)}
              >
                Отмена
              </button>
              <button
                className={styles.confirmButton}
                onClick={handleDeleteConfirm}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
