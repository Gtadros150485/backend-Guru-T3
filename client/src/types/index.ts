export interface LoginFormData{
    login: string;
    password: string;
    remember: boolean;
}

export interface LoginFormProps{
    onSubmit: (data:LoginFormData) => void;
    isLoading?: boolean;
}
