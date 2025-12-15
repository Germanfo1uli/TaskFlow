import { useState, useCallback } from 'react';
import { useNotification } from './useNotification';
import { useTokenRefresh, api } from './useTokenRefresh';

export const useAuth = () => {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const { showSuccess, showError, showLoading, dismissToast } = useNotification();

    const updateTokensInStorage = useCallback((accessToken: string, refreshToken: string) => {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        console.log('Tokens updated in storage');
    }, []);

    const handleLogoutAndClear = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        console.log('User logged out');
    }, []);

    const { refreshToken } = useTokenRefresh(updateTokensInStorage, handleLogoutAndClear);

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

    const loginUser = async (email: string, password: string, navigate?: (path: string) => void) => {
        const loadingToast = showLoading('Выполняется вход...');

        try {
            const response = await api.post('/auth/login', { email, password });
            const data = response.data;

            if (data.pair?.accessToken) {
                updateTokensInStorage(data.pair.accessToken, data.pair.refreshToken);

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

                if (navigate) {
                    navigate('/main');
                }
                return { success: true, user: data };
            }
        } catch (error: any) {
            dismissToast(loadingToast);
            const errorMessage = error.response?.data?.message || 'Неверный логин или пароль.';
            showError(errorMessage);
            return { success: false, message: errorMessage };
        }
    };

    const registerUser = async (username: string, email: string, password: string, navigate?: (path: string) => void) => {
        const loadingToast = showLoading('Регистрация...');

        try {
            const response = await api.post('/auth/register', { username, email, password });
            const data = response.data;

            if (data.pair?.accessToken) {
                updateTokensInStorage(data.pair.accessToken, data.pair.refreshToken);

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

                if (navigate) {
                    navigate('/main');
                }
                return { success: true, user: data };
            }
        } catch (error: any) {
            dismissToast(loadingToast);
            const errorMessage = error.response?.data?.message || 'Ошибка при регистрации';
            showError(errorMessage);
            return { success: false, message: errorMessage };
        }
    };

    const logoutUser = (navigate?: (path: string) => void) => {
        handleLogoutAndClear();
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

    const manualRefreshToken = async () => {
        return await refreshToken();
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
        manualRefreshToken,
        api
    };
};