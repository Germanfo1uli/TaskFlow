import { FaTimes } from 'react-icons/fa';
import { useProfile } from './hooks/useProfile';
import { AvatarUpload } from './components/AvatarUpload';
import { ProfileForm } from './components/ProfileForm';
import { ProfileStats } from './components/ProfileStats';
import styles from './ProfileModal.module.css';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
    const { profile, isLoading, updateProfile, updateAvatar } = useProfile();

    if (!isOpen) return null;

    const handleProfileSubmit = async (formData: any) => {
        await updateProfile(formData);
    };

    const handleAvatarChange = async (file: File) => {
        await updateAvatar(file);
    };

    return (
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

                        <button className={styles.closeButton} onClick={onClose}>
                            <FaTimes className={styles.closeIcon} />
                        </button>
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
                                <h2 className={styles.profileName}>{profile.name}</h2>
                                <p className={styles.profilePosition}>{profile.position}</p>
                                <span className={styles.profileEmail}>{profile.email}</span>
                            </div>
                        </div>

                        <div className={styles.contentGrid}>
                            <div className={styles.statsSection}>
                                <ProfileStats
                                    completedTasks={profile.completedTasks}
                                    activeProjects={profile.activeProjects}
                                    joinDate={profile.joinDate}
                                    position={profile.position}
                                />
                            </div>

                            <div className={styles.formSection}>
                                <ProfileForm
                                    initialData={{
                                        name: profile.name,
                                        email: profile.email,
                                        bio: profile.bio,
                                        position: profile.position
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
    );
};