import { memo } from 'react';
import { FaTimes, FaSignOutAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './LogoutConfirmation.module.css';
import styles2 from '../../../CreateProject/CreateProjectModal.module.css';

interface LogoutConfirmationProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const LogoutConfirmation = memo(({ isOpen, onConfirm, onCancel }: LogoutConfirmationProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className={styles.confirmOverlay}
                    onClick={onCancel}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <motion.div
                        className={styles.confirmModal}
                        onClick={e => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.92, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 16 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                        role="dialog"
                        aria-labelledby="logout-title"
                        aria-modal="true"
                    >
                        <div className={styles.modalHeader}>
                            <div className={styles.headerContent}>
                                <div className={styles.titleSection}>
                                    <div className={styles.titleText}>
                                        <h1 id="logout-title" className={styles.modalTitle}>
                                            Подтверждение выхода
                                        </h1>
                                        <p className={styles.modalSubtitle}>Завершение текущей сессии</p>
                                    </div>
                                </div>
                                <motion.button
                                    className={styles2.closeButton}
                                    onClick={onCancel}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    aria-label="Закрыть"
                                >
                                    <FaTimes />
                                </motion.button>
                            </div>
                        </div>

                        <div className={styles.modalContent}>
                            <div className={styles.warningMessage}>
                                <h3 className={styles.warningTitle}>Вы собираетесь выйти из системы</h3>
                                <p className={styles.warningText}>
                                    После выхода вам потребуется снова ввести логин и пароль для доступа к системе.
                                </p>
                            </div>
                        </div>

                        <motion.div
                            className={styles.modalActions}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <motion.button
                                className={styles.cancelButton}
                                onClick={onCancel}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Отмена
                            </motion.button>
                            <motion.button
                                className={styles.confirmButton}
                                onClick={onConfirm}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <FaSignOutAlt className={styles.confirmIcon} />
                                <span>Выйти</span>
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
});

LogoutConfirmation.displayName = 'LogoutConfirmation';