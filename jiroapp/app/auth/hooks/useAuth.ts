import { useState } from 'react';
import { useNotification } from './useNotification';

export const useAuth = () => {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const { showSuccess, showError, showLoading, dismissToast } = useNotification();

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

    const loginUser = async (email: string, password: string, navigate?: (path: string) => void) => {
        const loadingToast = showLoading('Выполняется вход...');

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.pair?.accessToken) {
                    localStorage.setItem('token', data.pair.accessToken);
                    if (data.pair.refreshToken) {
                        localStorage.setItem('refreshToken', data.pair.refreshToken);
                    }
                    localStorage.setItem('user', JSON.stringify({
                        userId: data.userId,
                        username: data.username,
                        email: data.email,
                        tag: data.tag,
                        bio: data.bio || '',
                        position: data.position || 'Сотрудник',
                        joinDate: data.joinDate || new Date().toISOString().split('T')[0]
                    }));

                    dismissToast(loadingToast);
                    showSuccess('Вход выполнен успешно!');
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                if (navigate) {
                    navigate('/main');
                }
                return { success: true, user: data };
            } else {
                dismissToast(loadingToast);
                const errorMessage = data.message || 'Неверный email или пароль';
                showError(errorMessage);
                return { success: false, message: errorMessage };
            }
        } catch (error) {
            dismissToast(loadingToast);
            const errorMessage = 'Ошибка сети. Проверьте соединение и адрес сервера.';
            showError(errorMessage);
            return { success: false, message: errorMessage };
        }
    };

    const registerUser = async (username: string, email: string, password: string, navigate?: (path: string) => void) => {
        const loadingToast = showLoading('Регистрация...');

        try {
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.pair?.accessToken) {
                    localStorage.setItem('token', data.pair.accessToken);
                    if (data.pair.refreshToken) {
                        localStorage.setItem('refreshToken', data.pair.refreshToken);
                    }
                    localStorage.setItem('user', JSON.stringify({
                        userId: data.userId,
                        username: data.username,
                        email: data.email,
                        tag: data.tag,
                        bio: data.bio || '',
                        position: data.position || 'Сотрудник',
                        joinDate: data.joinDate || new Date().toISOString().split('T')[0]
                    }));

                    dismissToast(loadingToast);
                    showSuccess('Регистрация завершена успешно!');

                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                if (navigate) {
                    navigate('/main');
                }
                return { success: true, user: data };
            } else {
                dismissToast(loadingToast);
                const errorMessage = data.message || 'Ошибка при регистрации';
                showError(errorMessage);
                return { success: false, message: errorMessage };
            }
        } catch (error) {
            dismissToast(loadingToast);
            const errorMessage = 'Ошибка сети. Проверьте соединение и адрес сервера.';
            showError(errorMessage);
            return { success: false, message: errorMessage };
        }
    };

    const logoutUser = (navigate?: (path: string) => void) => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        showSuccess('Вы вышли из системы');
        if (navigate) {
            navigate('/');
        }
    };

    const isAuthenticated = () => {
        return !!localStorage.getItem('token');
    };

    const getCurrentUser = () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    };

    const updateUserData = (newUserData: any) => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            const updatedUser = { ...user, ...newUserData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
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
        getCurrentUser,
        updateUserData,
    };
};