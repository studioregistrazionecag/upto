// src/components/AlertModal.jsx
import React from 'react';
import styles from './AlertModal.module.css';

const AlertModal = ({ title, message, onClose }) => {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>{title}</h3>
        {/* Usiamo <p> e .split('\n') per gestire le andate a capo nel messaggio */}
        <div className={styles.message}>
          {message.split('\n').map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
        <button onClick={onClose} className={styles.closeButton}>
          Ho capito
        </button>
      </div>
    </div>
  );
};

export default AlertModal;