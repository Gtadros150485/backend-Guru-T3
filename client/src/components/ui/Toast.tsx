import React, { useEffect } from 'react';
import styles from './Toast.module.scss';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.icon}>
        {type === 'success' ? '✓' : '⚠'}
      </div>
      <div className={styles.message}>{message}</div>
      <button className={styles.closeBtn} onClick={onClose}>
        ×
      </button>
    </div>
  );
};

export default Toast;
