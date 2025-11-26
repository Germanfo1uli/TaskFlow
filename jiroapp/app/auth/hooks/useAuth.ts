import { useState } from 'react';

export const useAuth = () => {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

    const loginUser = async (email: string, password: string) => {
        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return { success: false, message: errorData.message || 'Ошибка авторизации' };
            }

            const data = await response.json();

            if (data.success && data.token) {
                localStorage.setItem('token', data.token);
                return { success: true };
            } else {
                return { success: false, message: data.message || 'Ошибка авторизации' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Ошибка сети. Проверьте соединение и адрес сервера.' };
        }
    };

    const registerUser = async (name: string, email: string, password: string) => {
        try {
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return { success: false, message: errorData.message || 'Ошибка регистрации' };
            }

            const data = await response.json();

            if (data.success && data.token) {
                localStorage.setItem('token', data.token);
                return { success: true };
            } else {
                return { success: false, message: data.message || 'Ошибка регистрации' };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Ошибка сети. Проверьте соединение и адрес сервера.' };
        }
    };

    const logoutUser = () => {
        localStorage.removeItem('token');
    };

    const isAuthenticated = () => {
        return !!localStorage.getItem('token');
    };

    return {
        showPassword,
        showConfirmPassword,
        togglePasswordVisibility,
        toggleConfirmPasswordVisibility,
        loginUser,
        registerUser,
        logoutUser,
        isAuthenticated,
    };
};