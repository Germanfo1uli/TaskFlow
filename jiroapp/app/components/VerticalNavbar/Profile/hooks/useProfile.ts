import { useState, useEffect } from 'react';
import { UserProfile, ProfileFormData } from '../types/profile.types';
import { useAuth } from '@/app/auth/hooks/useAuth';
import toast from 'react-hot-toast';
import { api } from '@/app/auth/hooks/useTokenRefresh';

export const useProfile = () => {
    const { getCurrentUser, updateUserData } = useAuth();
    const [profile, setProfile] = useState<UserProfile>({
        id: '',
        name: '',
        email: '',
        tag: '',
        avatar: null,
        bio: '',
        position: 'Сотрудник',
        joinDate: '',
        completedTasks: 0,
        activeProjects: 0
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initializeProfile = async () => {
            await loadUserProfile();
            await loadUserAvatar();
            setIsInitialized(true);
        };
        initializeProfile();
    }, []);

    const loadUserProfile = async (): Promise<void> => {
        setIsLoading(true);
        try {
            const user = getCurrentUser();
            if (!user?.userId) {
                console.error('User ID not found');
                return;
            }

            const response = await api.get(`/users/${user.userId}/profile`);
            const profileData = response.data;

            setProfile(prev => ({
                ...prev,
                id: profileData.id || user.userId || '',
                name: profileData.name || profileData.username || user.username || '',
                email: profileData.email || user.email || '',
                tag: profileData.tag || user.tag || '',
                bio: profileData.bio || user.bio || '',
                avatar: profileData.avatar || user.avatar || null,
                position: profileData.position || user.position || 'Сотрудник',
                joinDate: profileData.joinDate || user.joinDate || new Date().toISOString().split('T')[0],
                completedTasks: profileData.completedTasks || 0,
                activeProjects: profileData.activeProjects || 0
            }));

            updateUserData({
                username: profileData.name || profileData.username || user.username,
                email: profileData.email || user.email,
                tag: profileData.tag || user.tag,
                bio: profileData.bio || user.bio,
                position: profileData.position || user.position,
                joinDate: profileData.joinDate || user.joinDate,
                avatar: profileData.avatar || user.avatar
            });

        } catch (error: any) {
            console.error('Error loading user profile:', error);

            const user = getCurrentUser();
            if (user) {
                setProfile(prev => ({
                    ...prev,
                    id: user.userId || '',
                    name: user.username || '',
                    email: user.email || '',
                    tag: user.tag || '',
                    bio: user.bio || '',
                    avatar: user.avatar || null,
                    position: user.position || 'Сотрудник',
                    joinDate: user.joinDate || new Date().toISOString().split('T')[0]
                }));
            }

            if (error.code === 'ERR_NETWORK') {
                toast.error('Сервер недоступен. Используются локальные данные');
            } else if (error.response?.status === 404) {
                console.log('Profile endpoint not found, using local data');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const updateProfile = async (formData: ProfileFormData): Promise<void> => {
        setIsLoading(true);

        try {
            const payload = {
                username: formData.name,
                bio: formData.bio
            };

            let response = await api.patch('/users/me/update', payload);

            if (response.status === 405) {
                response = await api.put('/users/me/update', payload);
            }

            const data = response.data;

            setProfile(prev => ({
                ...prev,
                ...formData,
                name: data.name || data.username || formData.name,
                tag: data.tag || prev.tag,
                bio: data.bio || formData.bio
            }));

            updateUserData({
                username: data.name || data.username || formData.name,
                tag: data.tag,
                bio: data.bio || formData.bio
            });

            await loadUserProfile();

            toast.success('Профиль успешно обновлен');

        } catch (error: any) {
            if (error.code === 'ERR_NETWORK') {
                toast.error('Сервер недоступен. Изменения сохранены локально');
                setProfile(prev => ({
                    ...prev,
                    ...formData
                }));
                updateUserData({
                    username: formData.name,
                    bio: formData.bio
                });
            } else {
                let errorMessage = 'Ошибка при обновлении профиля';
                if (error.response) {
                    const errorData = error.response.data;
                    if (error.response.status === 400 && errorData.errors) {
                        const validationErrors = Object.values(errorData.errors).join(', ');
                        errorMessage = `Ошибка валидации: ${validationErrors}`;
                    } else {
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    }
                    if (error.response.status === 500) {
                        errorMessage = 'Ошибка сервера при обновлении профиля. Пожалуйста, попробуйте позже.';
                    }
                } else if (error.request) {
                    errorMessage = 'Нет ответа от сервера';
                } else {
                    errorMessage = error.message;
                }
                toast.error(errorMessage);
                throw error;
            }
        } finally {
            setIsLoading(false);
        }
    };

    const updateAvatar = async (avatarFile: File): Promise<void> => {
        setIsLoading(true);

        const localAvatarUrl = URL.createObjectURL(avatarFile);

        setProfile(prev => ({
            ...prev,
            avatar: localAvatarUrl
        }));

        updateUserData({
            avatar: localAvatarUrl
        });

        try {
            const formData = new FormData();
            formData.append('file', avatarFile);

            await api.post('/users/me/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            await loadUserProfile();

            toast.success('Аватар успешно обновлен');

        } catch (error: any) {
            let errorMessage = 'Ошибка при синхронизации аватара с сервером';
            if (error.response) {
                errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
            } else if (error.code === 'ERR_NETWORK') {
                errorMessage = 'Сервер недоступен. Аватар сохранен локально.';
            }
            toast.warning(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteAvatar = async (): Promise<void> => {
        setIsLoading(true);

        setProfile(prev => ({
            ...prev,
            avatar: null
        }));

        updateUserData({
            avatar: null
        });

        try {
            await api.delete('/users/me/avatar');

            await loadUserProfile();

            toast.success('Аватар успешно удален');
        } catch (error: any) {
            let errorMessage = 'Ошибка при удалении аватара с сервера';
            if (error.response) {
                errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
            } else if (error.code === 'ERR_NETWORK') {
                errorMessage = 'Сервер недоступен. Аватар удален локально.';
            }
            toast.warning(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const loadUserAvatar = async (): Promise<void> => {
        try {
            const user = getCurrentUser();
            if (!user?.userId) {
                console.log('User ID not found for avatar request');
                return;
            }

            const avatarUrl = `/users/${user.userId}/avatar?t=${Date.now()}`;
            const response = await api.get(avatarUrl, {
                responseType: 'blob'
            });

            if (response.status === 200) {
                const blob = response.data;
                const avatarObjectUrl = URL.createObjectURL(blob);

                setProfile(prev => ({
                    ...prev,
                    avatar: avatarObjectUrl
                }));

                updateUserData({
                    avatar: avatarObjectUrl
                });
            }
        } catch (error: any) {
            if (error.response?.status !== 404) {
                console.warn('Ошибка при загрузке аватара с сервера:', error.message);
            }
        }
    };

    const deleteAccount = async (): Promise<void> => {
        setIsLoading(true);

        try {
            const refreshToken = localStorage.getItem('refreshToken');
            const accessToken = localStorage.getItem('token');

            if (!refreshToken) {
                throw new Error('Refresh token не найден');
            }
            if (!accessToken) {
                throw new Error('Access token не найден');
            }

            await api.delete('/auth/account', {
                data: { refreshToken },
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            toast.success('Учетная запись успешно удалена');
        } catch (error: any) {
            let errorMessage = 'Ошибка при удалении учетной записи';
            if (error.response) {
                errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
            }
            toast.error(errorMessage);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        profile,
        isLoading,
        isInitialized,
        updateProfile,
        updateAvatar,
        deleteAvatar,
        loadUserAvatar,
        loadUserProfile,
        deleteAccount
    };
};