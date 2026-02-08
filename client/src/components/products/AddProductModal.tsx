import React, { useState } from 'react';
import styles from './AddProductModal.module.scss';

interface AddProductModalProps {
  onClose: () => void;
  onAdd: (product: ProductFormData) => void;
}

interface ProductFormData {
  name: string;
  vendor: string;
  article: string;
  price: number;
  rating?: number;
  category?: string;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    vendor: '',
    article: '',
    price: 0,
    rating: undefined,
    category: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'rating' ? parseFloat(value) || 0 : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Название обязательно';
    }

    if (!formData.vendor.trim()) {
      newErrors.vendor = 'Вендор обязателен';
    }

    if (!formData.article.trim()) {
      newErrors.article = 'Артикул обязателен';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Цена должна быть больше 0';
    }

    if (formData.rating !== undefined && (formData.rating < 0 || formData.rating > 5)) {
      newErrors.rating = 'Рейтинг должен быть от 0 до 5';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onAdd(formData);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Добавить товар</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Наименование <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
              placeholder="Введите название товара"
            />
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="vendor" className={styles.label}>
              Вендор <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="vendor"
              name="vendor"
              value={formData.vendor}
              onChange={handleChange}
              className={`${styles.input} ${errors.vendor ? styles.inputError : ''}`}
              placeholder="Введите производителя"
            />
            {errors.vendor && <span className={styles.errorText}>{errors.vendor}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="article" className={styles.label}>
              Артикул <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="article"
              name="article"
              value={formData.article}
              onChange={handleChange}
              className={`${styles.input} ${errors.article ? styles.inputError : ''}`}
              placeholder="Введите артикул"
            />
            {errors.article && <span className={styles.errorText}>{errors.article}</span>}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="price" className={styles.label}>
                Цена (₽) <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price || ''}
                onChange={handleChange}
                className={`${styles.input} ${errors.price ? styles.inputError : ''}`}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              {errors.price && <span className={styles.errorText}>{errors.price}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="rating" className={styles.label}>
                Рейтинг (0-5)
              </label>
              <input
                type="number"
                id="rating"
                name="rating"
                value={formData.rating || ''}
                onChange={handleChange}
                className={`${styles.input} ${errors.rating ? styles.inputError : ''}`}
                placeholder="4.5"
                step="0.1"
                min="0"
                max="5"
              />
              {errors.rating && <span className={styles.errorText}>{errors.rating}</span>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="category" className={styles.label}>
              Категория
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={styles.input}
              placeholder="Электроника, Аксессуары..."
            />
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className={styles.submitBtn}>
              Добавить товар
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
