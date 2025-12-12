import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { FaTimes, FaSignOutAlt, FaCopy, FaTrash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from './hooks/useProfile';
import { AvatarUpload } from './components/AvatarUpload/AvatarUpload';
import { ProfileForm } from './components/ProfileForm/ProfileForm';
import { ProfileStats } from './components/ProfileStats/ProfileStats';
import { LogoutConfirmation } from './components/LogoutConfirrmation/LogoutConfirmation';
import DeleteProfileModal from './components/DeleteProfileModal/DeleteProfileModal';
import styles from './ProfileModal.module.css';
import { useAuth } from '@/app/auth/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/app/auth/hooks/useNotification';
import type { ProfileFormData } from './types/profile.types';
import { api } from '@/app/auth/hooks/useTokenRefresh';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProfileModal = memo(({ isOpen, onClose }: ProfileModalProps) => {
    const { profile, isLoading, updateProfile, updateAvatar, deleteAvatar, loadUserProfile } = useProfile();
    const { logoutUser, getCurrentUser, updateUserData } = useAuth();
    const { showSuccess, showError } = useNotification();
    const router = useRouter();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showDeleteProfile, setShowDeleteProfile] = useState(false);
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && modalRef.current) {
            const firstFocusable = modalRef.current.querySelector<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            firstFocusable?.focus();
        }
    }, [isOpen]);

    const handleProfileSubmit = useCallback(async (formData: ProfileFormData) => {
        try {
            await updateProfile(formData);
            showSuccess('Профиль успешно обновлен!');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Ошибка при обновлении профиля';
            console.error('Ошибка при обновлении профиля:', error);
            showError(message);
        }
    }, [updateProfile, showSuccess, showError]);

    const handleEmailChange = useCallback(async (newEmail: string, password: string) => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                throw new Error('Refresh token не найден');
            }

            const response = await api.patch('/auth/change-email', {
                newEmail,
                password,
                refreshToken
            });

            const { pair, message, newEmail: updatedEmail } = response.data;

            if (pair.accessToken && pair.refreshToken) {
                localStorage.setItem('token', pair.accessToken);
                localStorage.setItem('refreshToken', pair.refreshToken);
                api.defaults.headers.common['Authorization'] = `Bearer ${pair.accessToken}`;

                updateUserData({ email: updatedEmail });

                showSuccess(message || 'Email успешно изменен!');

                await loadUserProfile();
            }
        } catch (error: any) {
            let errorMessage = 'Ошибка при смене email';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            showError(errorMessage);
            throw error;
        }
    }, [updateUserData, showSuccess, showError, loadUserProfile]);

    const handleAvatarChange = useCallback(async (file: File) => {
        try {
            setAvatarError(null);
            await updateAvatar(file);
            showSuccess('Аватар успешно обновлен!');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Ошибка при обновлении аватара';
            console.error('Ошибка при обновлении аватара:', error);
            showError(message);
            setAvatarError(message);
        }
    }, [updateAvatar, showSuccess, showError]);

    const handleAvatarDelete = useCallback(async () => {
        try {
            setAvatarError(null);
            await deleteAvatar();
            showSuccess('Аватар успешно удален!');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Ошибка при удалении аватара';
            console.error('Ошибка при удалении аватара:', error);
            showError(message);
        }
    }, [deleteAvatar, showSuccess, showError]);

    const handleDeleteProfile = useCallback(async (password: string) => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            const accessToken = localStorage.getItem('token');

            if (!refreshToken) {
                throw new Error('Refresh token не найден');
            }
            if (!accessToken) {
                throw new Error('Access token не найден');
            }

            console.log('Отправка запроса на удаление профиля...');
            console.log('Пароль для удаления:', password ? 'передан' : 'не передан');

            // ОТПРАВЛЯЕМ ПАРОЛЬ СТРОКОЙ, БЕЗ КАВЫЧЕК
            const response = await api.delete('/auth/account', {
                data: {
                    refreshToken,
                    password: password // Просто строка, как есть
                },
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Профиль успешно удален, ответ:', response.data);

            showSuccess('Ваш профиль успешно удален');

            // Очищаем локальное хранилище
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');

            // Перенаправляем на welcome страницу
            router.push('/welcome');
            handleCloseDeleteProfile();
            onClose();

        } catch (error: any) {
            console.error('Ошибка при удалении профиля:', error);

            let errorMessage = 'Не удалось удалить профиль. Попробуйте позже.';

            if (error.response) {
                console.error('Статус ошибки:', error.response.status);
                console.error('Данные ошибки:', error.response.data);

                if (error.response.status === 401) {
                    if (error.response.data?.message?.toLowerCase().includes('password')) {
                        errorMessage = 'Неверный пароль. Попробуйте еще раз.';
                    } else if (error.response.data?.message?.toLowerCase().includes('token')) {
                        errorMessage = 'Токен устарел. Попробуйте выйти и войти заново.';
                    } else {
                        errorMessage = 'Ошибка авторизации.';
                    }
                } else if (error.response.status === 403) {
                    errorMessage = 'У вас недостаточно прав для удаления профиля.';
                } else if (error.response.status === 404) {
                    errorMessage = 'Сервис удаления профиля временно недоступен.';
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.request) {
                console.error('Нет ответа от сервера:', error.request);
                errorMessage = 'Нет ответа от сервера. Проверьте подключение к интернету.';
            } else {
                console.error('Ошибка настройки запроса:', error.message);
            }

            throw new Error(errorMessage);
        }
    }, [router, onClose, showSuccess]);

    const handleLogoutClick = useCallback(() => setShowLogoutConfirm(true), []);
    const handleCancelLogout = useCallback(() => setShowLogoutConfirm(false), []);

    const handleConfirmLogout = useCallback(async () => {
        try {
            const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

            if (refreshToken && token) {
                await api.patch('/auth/logout', { refreshToken });
            }

            logoutUser(router.push);
            onClose();
        } catch (error) {
            console.error('Ошибка при выходе:', error);
            logoutUser(router.push);
            onClose();
        }
    }, [logoutUser, router, onClose]);

    const handleCopyTag = useCallback(async () => {
        const tag = profile.tag || getCurrentUser()?.tag;
        if (tag) {
            try {
                await navigator.clipboard.writeText(`#${tag}`);
                showSuccess('Тег скопирован в буфер обмена!');
            } catch {
                const textArea = document.createElement('textarea');
                textArea.value = `#${tag}`;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showSuccess('Тег скопирован в буфер обмена!');
            }
        }
    }, [profile.tag, getCurrentUser, showSuccess]);

    const currentUser = getCurrentUser();

    const handleOpenDeleteProfile = useCallback(() => {
        setShowDeleteProfile(true);
    }, []);

    const handleCloseDeleteProfile = useCallback(() => {
        setShowDeleteProfile(false);
    }, []);

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={styles.profileModalOverlay}
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                        <motion.div
                            ref={modalRef}
                            className={styles.profileModal}
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, y: 16, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 16, scale: 0.96 }}
                            transition={{ duration: 0.3, ease: 'easeOut', type: 'spring', stiffness: 320, damping: 24 }}
                            role="dialog"
                            aria-labelledby="profile-modal-title"
                            aria-modal="true"
                        >
                            <div className={styles.modalHeader}>
                                <div className={styles.headerContent}>
                                    <div className={styles.titleSection}>
                                        <h1 id="profile-modal-title" className={styles.modalTitle}>
                                            Профиль сотрудника
                                        </h1>
                                        <p className={styles.modalSubtitle}>
                                            Управление персональной информации и настройками
                                        </p>
                                    </div>

                                    <div className={styles.headerActions}>
                                        <motion.button
                                            className={styles.deleteProfileButton}
                                            onClick={handleOpenDeleteProfile}
                                            title="Удалить профиль"
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                        >
                                            <FaTrash className={styles.deleteIcon} />
                                            Удалить профиль
                                        </motion.button>

                                        <motion.button
                                            className={styles.logoutButton}
                                            onClick={handleLogoutClick}
                                            title="Выйти из системы"
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                        >
                                            <FaSignOutAlt className={styles.logoutIcon} />
                                            Выйти
                                        </motion.button>

                                        <motion.button
                                            className={styles.closeButton}
                                            onClick={onClose}
                                            whileHover={{ scale: 1.08 }}
                                            whileTap={{ scale: 0.92 }}
                                            aria-label="Закрыть модальное окно"
                                        >
                                            <FaTimes className={styles.closeIcon} />
                                        </motion.button>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.modalContent}>
                                <div className={styles.profileMainContent}>
                                    <motion.div
                                        className={styles.profileHeader}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <AvatarUpload
                                            avatar={profile.avatar}
                                            onAvatarChange={handleAvatarChange}
                                            onAvatarDelete={handleAvatarDelete}
                                            isLoading={isLoading}
                                        />
                                        <div className={styles.profileHeaderInfo}>
                                            <h2 className={styles.profileName}>
                                                {profile.name || currentUser?.username || 'Пользователь'}
                                            </h2>
                                            <div className={styles.profileTags}>
                                                <span className={styles.profileEmail}>
                                                    {profile.email || currentUser?.email}
                                                </span>
                                                <div className={styles.tagContainer}>
                                                    <span className={styles.profileTag}>
                                                        #{profile.tag || currentUser?.tag}
                                                    </span>
                                                    <motion.button
                                                        className={styles.copyButton}
                                                        onClick={handleCopyTag}
                                                        title="Скопировать тег"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <FaCopy className={styles.copyIcon} />
                                                    </motion.button>
                                                </div>
                                            </div>
                                            {avatarError && (
                                                <motion.div
                                                    className={styles.avatarError}
                                                    initial={{ opacity: 0, y: -4 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                >
                                                    <span>{avatarError}</span>
                                                    <button
                                                        onClick={() => setAvatarError(null)}
                                                        className={styles.avatarErrorClose}
                                                        aria-label="Закрыть ошибку"
                                                    >
                                                        ×
                                                    </button>
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        className={styles.contentGrid}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.15 }}
                                    >
                                        <div className={styles.statsSection}>
                                            <ProfileStats
                                                completedTasks={profile.completedTasks}
                                                activeProjects={profile.activeProjects}
                                                joinDate={profile.joinDate}
                                            />
                                        </div>

                                        <div className={styles.formSection}>
                                            <ProfileForm
                                                initialData={{
                                                    name: profile.name || currentUser?.username || '',
                                                    email: profile.email || currentUser?.email || '',
                                                    bio: profile.bio || currentUser?.bio || '',
                                                }}
                                                onSubmit={handleProfileSubmit}
                                                onChangeEmail={handleEmailChange}
                                                isLoading={isLoading}
                                            />
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <LogoutConfirmation
                isOpen={showLogoutConfirm}
                onConfirm={handleConfirmLogout}
                onCancel={handleCancelLogout}
            />

            <DeleteProfileModal
                isOpen={showDeleteProfile}
                onClose={handleCloseDeleteProfile}
                onConfirm={handleDeleteProfile}
                userName={profile.name || currentUser?.username || 'Пользователь'}
            />
        </>
    );
});

ProfileModal.displayName = 'ProfileModal';