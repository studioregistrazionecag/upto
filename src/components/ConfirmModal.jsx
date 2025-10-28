// src/components/ConfirmModal.jsx
import React from 'react';
import styles from './ConfirmModal.module.css';

const ConfirmModal = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.buttonGroup}>
          <button onClick={onCancel} className={styles.cancelButton}>
            Annulla
          </button>
          <button onClick={onConfirm} className={styles.confirmButton}>
            Conferma
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;