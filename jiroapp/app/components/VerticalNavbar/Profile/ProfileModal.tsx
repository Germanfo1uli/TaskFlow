import { memo, useCallback, useEffect, useRef } from 'react';
import { FaTimes, FaSignOutAlt, FaCopy } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from './hooks/useProfile';
import { AvatarUpload } from './components/AvatarUpload';
import { ProfileForm } from './components/ProfileForm';
import { ProfileStats } from './components/ProfileStats';
import { LogoutConfirmation } from './components/LogoutConfirmation';
import styles from './ProfileModal.module.css';
import { useAuth } from '@/app/auth/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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

    return (
        <AnimatePresence>
            {isOpen && (
                <>
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
                                            Управление персональной информацией и настройками
                                        </p>
                                    </div>

                                    <div className={styles.headerActions}>
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

                    <LogoutConfirmation
                        isOpen={showLogoutConfirm}
                        onConfirm={handleConfirmLogout}
                        onCancel={handleCancelLogout}
                    />
                </>
            )}
        </AnimatePresence>
    );
});

ProfileModal.displayName = 'ProfileModal';