export interface LoginFormData {
  username: string;
  password: string;
  remember_me: boolean;
}

export interface LoginFormProps {
  onSubmit?: (data: LoginFormData) => void;
  isLoading?: boolean;
  error?: string | null;
  success?: string | null;
  autoFocus?: boolean;
}

export interface ValidationErrors {
  username?: string;
  password?: string;
  general?: string;
}