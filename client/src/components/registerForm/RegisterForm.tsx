import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './RegisterForm.module.scss';
import { apiService } from '../../services/api';

interface RegisterFormData {
  email: string;
  username: string;
  full_name: string;
  password: string;
  confirmPassword: string;
}

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    username: '',
    full_name: '',
    password: '',
    confirmPassword: '',
  });

  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    username?: string;
    full_name?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }

    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Неверный формат email';
    }

    // Username validation
    if (!formData.username.trim()) {
      errors.username = 'Логин обязателен';
    } else if (formData.username.length < 3) {
      errors.username = 'Логин должен содержать минимум 3 символа';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Логин может содержать только буквы, цифры и подчеркивание';
    }

    // Full name validation
    if (!formData.full_name.trim()) {
      errors.full_name = 'Полное имя обязательно';
    } else if (formData.full_name.length < 2) {
      errors.full_name = 'Полное имя должно содержать минимум 2 символа';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Пароль обязателен';
    } else if (formData.password.length < 8) {
      errors.password = 'Пароль должен содержать минимум 8 символов';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Пароль должен содержать строчные, прописные буквы и цифры';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Подтвердите пароль';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await apiService.register({
        email: formData.email,
        username: formData.username,
        full_name: formData.full_name,
        password: formData.password,
      });

      setSuccess('Регистрация прошла успешно! Перенаправление на страницу входа...');

      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: { from: 'register', username: formData.username }
        });
      }, 2000);

    } catch (err: any) {
      console.error('Registration error:', err);

      let errorMessage = 'Не удалось зарегистрироваться. Пожалуйста, попробуйте снова.';

      if (err.response) {
        const { status, data } = err.response;

        if (status === 400) {
          errorMessage = data?.detail || 'Некорректные данные';
        } else if (status === 409) {
          errorMessage = 'Пользователь с таким email или логином уже существует';
        } else if (status >= 500) {
          errorMessage = 'Ошибка сервера. Пожалуйста, попробуйте позже.';
        }
      } else if (err.request) {
        errorMessage = 'Нет ответа от сервера. Проверьте подключение к интернету.';
      } else {
        errorMessage = err.message || 'Произошла ошибка при регистрации';
      }

      setError(errorMessage);

    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/login');
  };

  const emailInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  return (
    <div className={styles.registerContainer} role="main" aria-label="Форма регистрации">
      <header className={styles.registerHeader}>
        <h1 className={styles.welcomeTitle}>Создать аккаунт</h1>
        <p className={styles.subtitle}>Заполните форму для регистрации</p>
      </header>

      {/* Success Message */}
      {success && (
        <div
          className={styles.successMessage}
          role="alert"
          aria-live="polite"
        >
          <span className={styles.successIcon}>✓</span>
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          className={styles.errorMessage}
          role="alert"
          aria-live="assertive"
        >
          <span className={styles.errorIcon}>⚠</span>
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={styles.registerForm}
        noValidate
        aria-label="Форма регистрации"
      >
        {/* Email Field */}
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.formLabel}>
            Email
            <span className={styles.requiredAsterisk} aria-hidden="true"> *</span>
          </label>
          <input
            ref={emailInputRef}
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`${styles.formInput} ${
              validationErrors.email ? styles.inputError : ''
            }`}
            placeholder="example@mail.com"
            disabled={isLoading}
            aria-label="Email"
            aria-required="true"
            aria-invalid={!!validationErrors.email}
            aria-describedby={validationErrors.email ? 'email-error' : undefined}
            autoComplete="email"
            required
          />
          {validationErrors.email && (
            <span
              id="email-error"
              className={styles.errorText}
              role="alert"
            >
              {validationErrors.email}
            </span>
          )}
        </div>

        {/* Username Field */}
        <div className={styles.formGroup}>
          <label htmlFor="username" className={styles.formLabel}>
            Логин
            <span className={styles.requiredAsterisk} aria-hidden="true"> *</span>
          </label>
          <input
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className={`${styles.formInput} ${
              validationErrors.username ? styles.inputError : ''
            }`}
            placeholder="Введите логин"
            disabled={isLoading}
            aria-label="Логин"
            aria-required="true"
            aria-invalid={!!validationErrors.username}
            aria-describedby={validationErrors.username ? 'username-error' : undefined}
            autoComplete="username"
            required
          />
          {validationErrors.username && (
            <span
              id="username-error"
              className={styles.errorText}
              role="alert"
            >
              {validationErrors.username}
            </span>
          )}
        </div>

        {/* Full Name Field */}
        <div className={styles.formGroup}>
          <label htmlFor="full_name" className={styles.formLabel}>
            Полное имя
            <span className={styles.requiredAsterisk} aria-hidden="true"> *</span>
          </label>
          <input
            id="full_name"
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            className={`${styles.formInput} ${
              validationErrors.full_name ? styles.inputError : ''
            }`}
            placeholder="Иванов Иван Иванович"
            disabled={isLoading}
            aria-label="Полное имя"
            aria-required="true"
            aria-invalid={!!validationErrors.full_name}
            aria-describedby={validationErrors.full_name ? 'full_name-error' : undefined}
            autoComplete="name"
            required
          />
          {validationErrors.full_name && (
            <span
              id="full_name-error"
              className={styles.errorText}
              role="alert"
            >
              {validationErrors.full_name}
            </span>
          )}
        </div>

        {/* Password Field */}
        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.formLabel}>
            Пароль
            <span className={styles.requiredAsterisk} aria-hidden="true"> *</span>
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`${styles.formInput} ${
              validationErrors.password ? styles.inputError : ''
            }`}
            placeholder="Введите пароль"
            disabled={isLoading}
            aria-label="Пароль"
            aria-required="true"
            aria-invalid={!!validationErrors.password}
            aria-describedby={validationErrors.password ? 'password-error' : undefined}
            autoComplete="new-password"
            required
          />
          {validationErrors.password && (
            <span
              id="password-error"
              className={styles.errorText}
              role="alert"
            >
              {validationErrors.password}
            </span>
          )}
          <p className={styles.passwordHint}>
            Минимум 8 символов, включая строчные и прописные буквы, цифры
          </p>
        </div>

        {/* Confirm Password Field */}
        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword" className={styles.formLabel}>
            Подтвердите пароль
            <span className={styles.requiredAsterisk} aria-hidden="true"> *</span>
          </label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={`${styles.formInput} ${
              validationErrors.confirmPassword ? styles.inputError : ''
            }`}
            placeholder="Повторите пароль"
            disabled={isLoading}
            aria-label="Подтвердите пароль"
            aria-required="true"
            aria-invalid={!!validationErrors.confirmPassword}
            aria-describedby={validationErrors.confirmPassword ? 'confirmPassword-error' : undefined}
            autoComplete="new-password"
            required
          />
          {validationErrors.confirmPassword && (
            <span
              id="confirmPassword-error"
              className={styles.errorText}
              role="alert"
            >
              {validationErrors.confirmPassword}
            </span>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading}
          aria-busy={isLoading}
          aria-label={isLoading ? 'Выполняется регистрация...' : 'Зарегистрироваться'}
        >
          {isLoading ? (
            <>
              <span className={styles.loadingSpinner} aria-hidden="true"></span>
              <span className={styles.buttonText}>Регистрация...</span>
            </>
          ) : (
            'Зарегистрироваться'
          )}
        </button>

        {/* Footer Links */}
        <div className={styles.footer}>
          <p className={styles.footerText}>
            Уже есть аккаунт?{' '}
            <button
              type="button"
              className={styles.loginLink}
              onClick={handleBackToLogin}
              disabled={isLoading}
              aria-label="Вернуться на страницу входа"
            >
              Войти
            </button>
          </p>
        </div>
      </form>

      {/* Accessibility Announcement */}
      <div className="visually-hidden" role="status" aria-live="polite">
        {isLoading ? 'Выполняется регистрация...' : ''}
        {error ? `Ошибка: ${error}` : ''}
        {success ? success : ''}
      </div>
    </div>
  );
};

export default RegisterForm;
