'use client'

import { Formik, Form } from 'formik';
import { FaSave, FaCog, FaUsers, FaUserTag, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { settingsValidationSchema } from './utils/validationSchemas';
import { useSettingsForm } from './hooks/useSettingsForm';
import AvatarSection from './components/AvatarSection/AvatarSection';
import ProjectInfoSection from './components/ProjectInfoSection/ProjectInfoSection';
import InviteSection from './components/InviteSection/InviteSection';
import RolesSection from './components/RolesSection/RolesSection';
import DeleteProjectModal from './components/DeleteProjectModal/DeleteProjectModal';
import { ConfirmModal } from './components/ConfirmModal/ConfirmModal';
import { Notification } from './Notification/Notification';
import styles from './SettingsContent.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { api } from '@/app/auth/hooks/useTokenRefresh';
import { useProjectData } from '../VerticalNavbar/CreateProject/hooks/useProjectData';

interface SettingsContentProps {
    project: {
        id: string;
        name: string;
        description: string;
    };
    onBackClick: () => void;
}

const SettingsContent = ({ project, onBackClick }: SettingsContentProps) => {
    const { refreshProject } = useProjectData();
    const [activeTab, setActiveTab] = useState('general');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRefreshConfirm, setShowRefreshConfirm] = useState(false);
    const [avatar, setAvatar] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleProjectUpdated = () => {
        refreshProject(project.id);
    };

    const {
        settings,
        loading,
        error,
        inviteLink,
        handleSubmit,
        copyInviteLink,
        refreshInviteLink
    } = useSettingsForm(project.id, handleProjectUpdated);

    useEffect(() => {
        const fetchAvatar = async () => {
            try {
                const response = await api.get(`/projects/${project.id}/avatar`, {
                    responseType: 'blob'
                });
                if (response.data && response.data.size > 0) {
                    const imageUrl = URL.createObjectURL(response.data);
                    setAvatar(imageUrl);
                }
            } catch (error) {
                console.log('Аватар не найден');
            }
        };

        fetchAvatar();
    }, [project.id]);

    const handleAvatarChange = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post(`/projects/${project.id}/avatar`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const imageUrl = URL.createObjectURL(file);
            setAvatar(imageUrl);
            refreshProject(project.id);
            window.location.reload();
        } catch (error) {
            console.error('Ошибка при загрузке аватара:', error);
            throw error;
        }
    };

    const handleAvatarRemove = async () => {
        try {
            await api.delete(`/projects/${project.id}/avatar`);
            setAvatar(null);
            refreshProject(project.id);
            window.location.reload();
        } catch (error) {
            console.error('Ошибка при удалении аватара:', error);
            throw error;
        }
    };

    const handleDeleteProject = async () => {
        try {
            await api.patch(`/projects/${project.id}/delete`);
            onBackClick();
        } catch (error) {
            console.error('Ошибка при удалении проекта:', error);
        }
    };

    const tabs = [
        { id: 'general', label: 'Основные', icon: <FaCog /> },
        { id: 'roles', label: 'Роли и доступы', icon: <FaUserTag /> },
    ];

    const handleCopyLink = async () => {
        try {
            await copyInviteLink();
            showNotification('Ссылка скопирована в буфер обмена!', 'success');
        } catch (err) {
            showNotification('Не удалось скопировать ссылку', 'error');
        }
    };

    const handleRefreshLink = () => {
        setShowRefreshConfirm(true);
    };

    const confirmRefreshLink = async () => {
        try {
            await refreshInviteLink();
            setShowRefreshConfirm(false);
            showNotification('Пригласительная ссылка успешно обновлена!', 'success');
        } catch (err) {
            showNotification('Не удалось обновить ссылку', 'error');
        }
    };

    if (loading) {
        return <div>Загрузка...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className={styles.settingsContent}
            >
                <div className={styles.settingsContainer}>
                    <div className={styles.settingsHeader}>
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className={styles.headerContent}
                        >
                            <div className={styles.titleWrapper}>
                                <h1 className={styles.pageTitle}>
                                    <span className={styles.titleGradient}>Настройки проекта</span>
                                </h1>
                                <p className={styles.pageSubtitle}>
                                    Управление базовой информацией, ролями и доступом участников
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className={styles.settingsTabs}
                        >
                            <div className={styles.tabsContainer}>
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabActive : ''}`}
                                        onClick={() => setActiveTab(tab.id)}
                                    >
                                        <span className={styles.tabIcon}>{tab.icon}</span>
                                        {tab.label}
                                        {activeTab === tab.id && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className={styles.tabIndicator}
                                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    <div className={styles.settingsMain}>
                        <AnimatePresence mode="wait">
                            {activeTab === 'general' && settings && (
                                <motion.div
                                    key="general"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className={styles.generalTab}
                                >
                                    <Formik
                                        initialValues={settings}
                                        validationSchema={settingsValidationSchema}
                                        onSubmit={handleSubmit}
                                        enableReinitialize
                                    >
                                        {({ isSubmitting, dirty, isValid, resetForm }) => (
                                            <Form className={styles.settingsForm}>
                                                <div className={styles.formGrid}>
                                                    <motion.div
                                                        initial={{ y: 20, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        transition={{ delay: 0.1 }}
                                                        className={styles.formColumn}
                                                    >
                                                        <div className={styles.formSection}>
                                                            <AvatarSection
                                                                projectId={project.id}
                                                                currentAvatar={avatar}
                                                                onAvatarChange={handleAvatarChange}
                                                                onAvatarRemove={handleAvatarRemove}
                                                            />
                                                        </div>

                                                        <div className={styles.formSection}>
                                                            <InviteSection
                                                                inviteLink={inviteLink || ''}
                                                                onCopyLink={handleCopyLink}
                                                                onRefreshLink={handleRefreshLink}
                                                            />
                                                        </div>
                                                    </motion.div>

                                                    <motion.div
                                                        initial={{ y: 20, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        transition={{ delay: 0.2 }}
                                                        className={styles.formColumn}
                                                    >
                                                        <div className={styles.formSection}>
                                                            <ProjectInfoSection />
                                                        </div>

                                                        <div className={styles.dangerZone}>
                                                            <div className={styles.dangerHeader}>
                                                                <FaExclamationTriangle className={styles.dangerIcon} />
                                                                <h3 className={styles.dangerTitle}>Опасная зона</h3>
                                                            </div>
                                                            <p className={styles.dangerDescription}>
                                                                Удаление проекта приведет к безвозвратному удалению всех данных.
                                                            </p>
                                                            <motion.button
                                                                type="button"
                                                                className={styles.deleteProjectButton}
                                                                onClick={() => setShowDeleteModal(true)}
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                            >
                                                                <FaTrash className={styles.deleteIcon} />
                                                                Удалить проект
                                                            </motion.button>
                                                        </div>
                                                    </motion.div>
                                                </div>

                                                <div className={styles.bottomActions}>
                                                    <AnimatePresence>
                                                        {dirty && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -20 }}
                                                                className={styles.formActions}
                                                            >
                                                                <div className={styles.actionsContainer}>
                                                                    <div className={styles.unsavedChanges}>
                                                                        <motion.div
                                                                            animate={{ scale: [1, 1.2, 1] }}
                                                                            transition={{ repeat: Infinity, duration: 2 }}
                                                                            className={styles.changeDot}
                                                                        />
                                                                        Есть несохранённые изменения
                                                                    </div>
                                                                    <div className={styles.actionButtons}>
                                                                        <motion.button
                                                                            type="button"
                                                                            className={styles.cancelButton}
                                                                            onClick={() => resetForm()}
                                                                            disabled={isSubmitting}
                                                                            whileHover={{ scale: 1.02 }}
                                                                            whileTap={{ scale: 0.98 }}
                                                                        >
                                                                            Отменить
                                                                        </motion.button>
                                                                        <motion.button
                                                                            type="submit"
                                                                            className={styles.saveButton}
                                                                            disabled={!isValid || isSubmitting}
                                                                            whileHover={{ scale: 1.02 }}
                                                                            whileTap={{ scale: 0.98 }}
                                                                        >
                                                                            <FaSave className={styles.saveIcon} />
                                                                            {isSubmitting ? (
                                                                                <motion.span
                                                                                    initial={{ opacity: 0 }}
                                                                                    animate={{ opacity: 1 }}
                                                                                >
                                                                                    Сохранение...
                                                                                </motion.span>
                                                                            ) : (
                                                                                'Сохранить изменения'
                                                                            )}
                                                                        </motion.button>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </Form>
                                        )}
                                    </Formik>
                                </motion.div>
                            )}

                            {activeTab === 'roles' && (
                                <motion.div
                                    key="roles"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <RolesSection projectId={project.id} />
                                </motion.div>
                            )}

                            {activeTab === 'team' && (
                                <motion.div
                                    key="team"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className={styles.placeholderContent}
                                >
                                    <div className={styles.placeholderCard}>
                                        <FaUsers className={styles.placeholderIcon} />
                                        <h3>Управление командой</h3>
                                        <p>Настройки участников и ролей будут доступны в этом разделе</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>

            <DeleteProjectModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteProject}
                projectName={settings?.projectName || project.name}
            />

            <ConfirmModal
                isOpen={showRefreshConfirm}
                onClose={() => setShowRefreshConfirm(false)}
                onConfirm={confirmRefreshLink}
                title="Обновить пригласительную ссылку?"
                message="Вы уверены, что хотите обновить пригласительную ссылку? Старая ссылка станет недействительной. Все текущие участники сохранят доступ."
                confirmText="Обновить"
                cancelText="Отмена"
            />

            <AnimatePresence>
                {notification && (
                    <Notification
                        message={notification.message}
                        type={notification.type}
                        onClose={() => setNotification(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default SettingsContent;