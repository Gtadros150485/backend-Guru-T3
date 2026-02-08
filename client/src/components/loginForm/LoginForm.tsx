import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginForm.module.scss';
import { apiService } from '../../services/api';
import type { LoginRequest } from '../../services/api';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<LoginRequest>({
    username: 'test',
    password: '',
    remember_me: false,
  });

  const [validationErrors, setValidationErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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
    const errors: { username?: string; password?: string } = {};

    if (!formData.username.trim()) {
      errors.username = 'Логин обязателен';
    }

    if (!formData.password) {
      errors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      errors.password = 'Пароль должен содержать минимум 6 символов';
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
      const response = await apiService.login(formData);

      setSuccess('Успешный вход! Перенаправление...');

      if (formData.remember_me) {
        localStorage.setItem('remember_me', 'true');
      }

      setTimeout(() => {
        navigate('/dashboard', {
          replace: true,
          state: { from: 'login' }
        });
      }, 1000);

    } catch (err: any) {
      console.error('Login error:', err);

      let errorMessage = 'Не удалось войти. Пожалуйста, проверьте учетные данные.';

      if (err.response) {

        const { status, data } = err.response;

        if (status === 401) {
          errorMessage = data?.detail || 'Неверный логин или пароль';
        } else if (status === 400) {
          errorMessage = data?.detail || 'Некорректные данные';
        } else if (status === 403) {
          errorMessage = 'Учетная запись неактивна';
        } else if (status >= 500) {
          errorMessage = 'Ошибка сервера. Пожалуйста, попробуйте позже.';
        }
      } else if (err.request) {

        errorMessage = 'Нет ответа от сервера. Проверьте подключение к интернету.';
      } else {

        errorMessage = err.message || 'Произошла ошибка при входе';
      }

      setError(errorMessage);

    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/forgot-password');
  };

  const handleCreateAccount = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/register');
  };


  const loginInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (loginInputRef.current) {
      loginInputRef.current.focus();
    }


    const savedUsername = localStorage.getItem('saved_username');
    const rememberMe = localStorage.getItem('remember_me') === 'true';

    if (savedUsername && rememberMe) {
      setFormData(prev => ({
        ...prev,
        username: savedUsername,
        remember_me: true,
      }));
    }
  }, []);

  React.useEffect(() => {
    if (formData.remember_me && formData.username) {
      localStorage.setItem('saved_username', formData.username);
    } else if (!formData.remember_me) {
      localStorage.removeItem('saved_username');
    }
  }, [formData.remember_me, formData.username]);

  return (
    <div className={styles.loginContainer} role="main" aria-label="Форма входа">
      <header className={styles.loginHeader}>
        <h1 className={styles.welcomeTitle}>Добро пожаловать!</h1>
        <p className={styles.subtitle}>Пожалуйста, авторизируйтесь</p>
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
        className={styles.loginForm}
        noValidate
        aria-label="Форма входа"
      >
        {/* Username/Login Field */}
        <div className={styles.formGroup}>
          <label htmlFor="username" className={styles.formLabel}>
            Логин
            <span className={styles.requiredAsterisk} aria-hidden="true"> *</span>
          </label>
          <input
            ref={loginInputRef}
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className={`${styles.formInput} ${
              validationErrors.username ? styles.inputError : ''
            }`}
            placeholder="Введите логин или email"
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

        {/* Password Field */}
        <div className={styles.formGroup}>
          <div className={styles.passwordHeader}>
            <label htmlFor="password" className={styles.formLabel}>
              Пароль
              <span className={styles.requiredAsterisk} aria-hidden="true"> *</span>
            </label>
            <button
              type="button"
              className={styles.forgotPasswordLink}
              onClick={handleForgotPassword}
              disabled={isLoading}
              aria-label="Забыли пароль?"
            >
              Забыли пароль?
            </button>
          </div>
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
            autoComplete="current-password"
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
        </div>

        {/* Remember Me Checkbox */}
        <div className={styles.formGroup}>
          <label className={styles.checkboxContainer}>
            <input
              type="checkbox"
              name="remember_me"
              checked={formData.remember_me}
              onChange={handleInputChange}
              disabled={isLoading}
              className={styles.checkboxInput}
              aria-label="Запомнить данные"
            />
            <span className={styles.checkboxCustom}></span>
            <span className={styles.checkboxLabel}>Запомнить данные</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading}
          aria-busy={isLoading}
          aria-label={isLoading ? 'Выполняется вход...' : 'Войти'}
        >
          {isLoading ? (
            <>
              <span className={styles.loadingSpinner} aria-hidden="true"></span>
              <span className={styles.buttonText}>Вход...</span>
            </>
          ) : (
            'Войти'
          )}
        </button>

        {/* Divider */}
        <div className={styles.divider} aria-hidden="true">
          <span className={styles.dividerText}>или</span>
        </div>

        {/* Footer Links */}
        <div className={styles.footer}>
          <p className={styles.footerText}>
            Нет аккаунта?{' '}
            <button
              type="button"
              className={styles.createAccountLink}
              onClick={handleCreateAccount}
              disabled={isLoading}
              aria-label="Создать аккаунт"
            >
              Создать
            </button>
          </p>
        </div>

        {/* Demo Credentials Hint (for development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className={styles.demoHint}>
            <small>
              <strong>Демо доступ:</strong> test / test123
            </small>
          </div>
        )}
      </form>

      {/* Accessibility Announcement */}
      <div className="visually-hidden" role="status" aria-live="polite">
        {isLoading ? 'Выполняется вход...' : ''}
        {error ? `Ошибка: ${error}` : ''}
        {success ? success : ''}
      </div>
    </div>
  );
};

export default LoginForm;