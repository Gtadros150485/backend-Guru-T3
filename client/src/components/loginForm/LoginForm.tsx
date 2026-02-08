import React, { useState, type FormEvent } from 'react';
import styles from './LoginForm.module.scss';
import type { LoginFormData, LoginFormProps } from '../../types';

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<LoginFormData>({
    login: 'test',
    password: '',
    remember: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <div className={styles.loginContainer} role="main" aria-label="Login form">
      <header className={styles.loginHeader}>
        <h1 className={styles.welcomeTitle}>Добро пожаловать!</h1>
        <p className={styles.subtitle}>Пожалуйста, авторизируйтесь</p>
      </header>

      <form
        onSubmit={handleSubmit}
        className={styles.loginForm}
        noValidate
      >
        <div className={styles.formGroup}>
          <label htmlFor="login" className={styles.formLabel}>
            Логин
          </label>
          <input
            id="login"
            type="text"
            name="login"
            value={formData.login}
            onChange={handleInputChange}
            className={styles.formInput}
            placeholder="test"
            disabled={isLoading}
            aria-label="Логин"
            aria-required="true"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.formLabel}>
            Пароль
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={styles.formInput}
            placeholder="●●●●●●●●●"
            disabled={isLoading}
            aria-label="Пароль"
            aria-required="true"
            autoComplete="current-password"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.checkboxContainer}>
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.remember}
              onChange={handleInputChange}
              disabled={isLoading}
              className={styles.checkboxInput}
              aria-label="Запомнить данные"
            />
            <span className={styles.checkboxCustom}></span>
            <span className={styles.checkboxLabel}>Запомнить данные</span>
          </label>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <span className={styles.loadingSpinner}>Загрузка...</span>
          ) : (
            'Войти'
          )}
        </button>

        <div className={styles.divider} aria-hidden="true">
          <span className={styles.dividerText}>или</span>
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Нет аккаунта?{' '}
            <a
              href="/register"
              className={styles.footerLink}
              aria-label="Создать аккаунт"
            >
              Создать
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;