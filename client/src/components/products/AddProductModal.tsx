import React, { useState } from 'react';
import styles from './AddProductModal.module.scss';

interface AddProductModalProps {
  onClose: () => void;
  onAdd: (product: any) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    vendor: '',
    article: '',
    rating: 0,
    price: 0,
    quantity: 0,
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'rating' || name === 'quantity'
        ? parseFloat(value) || 0
        : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Название обязательно';
    if (!formData.category.trim()) newErrors.category = 'Категория обязательна';
    if (!formData.vendor.trim()) newErrors.vendor = 'Вендор обязателен';
    if (!formData.article.trim()) newErrors.article = 'Артикул обязателен';
    if (formData.price <= 0) newErrors.price = 'Цена должна быть больше 0';
    if (formData.rating < 0 || formData.rating > 5) newErrors.rating = 'Оценка должна быть от 0 до 5';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onAdd(formData);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Добавить товар</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Название *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? styles.error : ''}
              />
              {errors.name && <span className={styles.errorText}>{errors.name}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>Категория *</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={errors.category ? styles.error : ''}
              />
              {errors.category && <span className={styles.errorText}>{errors.category}</span>}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Вендор *</label>
              <input
                type="text"
                name="vendor"
                value={formData.vendor}
                onChange={handleChange}
                className={errors.vendor ? styles.error : ''}
              />
              {errors.vendor && <span className={styles.errorText}>{errors.vendor}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>Артикул *</label>
              <input
                type="text"
                name="article"
                value={formData.article}
                onChange={handleChange}
                className={errors.article ? styles.error : ''}
              />
              {errors.article && <span className={styles.errorText}>{errors.article}</span>}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Цена (₽) *</label>
              <input
                type="number"
                name="price"
                value={formData.price || ''}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={errors.price ? styles.error : ''}
              />
              {errors.price && <span className={styles.errorText}>{errors.price}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>Оценка (0-5)</label>
              <input
                type="number"
                name="rating"
                value={formData.rating || ''}
                onChange={handleChange}
                step="0.1"
                min="0"
                max="5"
                className={errors.rating ? styles.error : ''}
              />
              {errors.rating && <span className={styles.errorText}>{errors.rating}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>Количество</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity || ''}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Описание</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
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
