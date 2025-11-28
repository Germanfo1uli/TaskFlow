import { FaTimes, FaSignOutAlt, FaCopy } from 'react-icons/fa';
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

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
    const { profile, isLoading, updateProfile, updateAvatar } = useProfile();
    const { logoutUser, getCurrentUser } = useAuth();
    const { showSuccess, showError } = useNotification();
    const router = useRouter();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    if (!isOpen) return null;

    const handleProfileSubmit = async (formData: any) => {
        try {
            await updateProfile(formData);
            showSuccess('Профиль успешно обновлен!');
        } catch (error: any) {
            console.error('Ошибка при обновлении профиля:', error);
            showError(error.message || 'Ошибка при обновлении профиля');
        }
    };

    const handleAvatarChange = async (file: File) => {
        try {
            await updateAvatar(file);
            showSuccess('Аватар успешно обновлен!');
        } catch (error: any) {
            console.error('Ошибка при обновлении аватара:', error);
            showError(error.message || 'Ошибка при обновлении аватара');
        }
    };

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const handleConfirmLogout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            const token = localStorage.getItem('token');

            if (refreshToken && token) {
                await fetch('http://localhost:8080/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ refreshToken }),
                });
            }

            logoutUser(router.push);
            onClose();

        } catch (error) {
            console.error('Ошибка при выходе:', error);
            logoutUser(router.push);
            onClose();
        }
    };

    const handleCancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    const handleCopyTag = async () => {
        const tag = profile.tag || getCurrentUser()?.tag;
        if (tag) {
            try {
                await navigator.clipboard.writeText(`#${tag}`);
                showSuccess('Тег скопирован в буфер обмена!');
            } catch (err) {
                const textArea = document.createElement('textarea');
                textArea.value = `#${tag}`;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showSuccess('Тег скопирован в буфер обмена!');
            }
        }
    };
    const currentUser = getCurrentUser();
    return (
        <>
            <div className={styles.profileModalOverlay} onClick={onClose}>
                <div className={styles.profileModal} onClick={e => e.stopPropagation()}>
                    <div className={styles.modalHeader}>
                        <div className={styles.headerContent}>
                            <div className={styles.titleSection}>
                                <h1 className={styles.modalTitle}>Профиль сотрудника</h1>
                                <p className={styles.modalSubtitle}>
                                    Управление персональной информацией и настройками
                                </p>
                            </div>

                            <div className={styles.headerActions}>
                                <button
                                    className={styles.logoutButton}
                                    onClick={handleLogoutClick}
                                    title="Выйти из системы"
                                >
                                    <FaSignOutAlt className={styles.logoutIcon} />
                                    Выйти
                                </button>

                                <button className={styles.closeButton} onClick={onClose}>
                                    <FaTimes className={styles.closeIcon} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={styles.modalContent}>
                        <div className={styles.profileMainContent}>
                            <div className={styles.profileHeader}>
                                <AvatarUpload
                                    avatar={profile.avatar}
                                    onAvatarChange={handleAvatarChange}
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
                                            <button
                                                className={styles.copyButton}
                                                onClick={handleCopyTag}
                                                title="Скопировать тег"
                                            >
                                                <FaCopy className={styles.copyIcon} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.contentGrid}>
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
                                        isLoading={isLoading}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <LogoutConfirmation
                isOpen={showLogoutConfirm}
                onConfirm={handleConfirmLogout}
                onCancel={handleCancelLogout}
            />
        </>
    );
};