import { useState, useEffect, useRef } from 'react';
import { FaTimes, FaTrash, FaExclamationTriangle, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './DeleteProfileModal.module.css';

interface DeleteProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (password: string) => Promise<void>;
    userName: string;
}

const DeleteProfileModal = ({ isOpen, onClose, onConfirm, userName }: DeleteProfileModalProps) => {
    const [password, setPassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const passwordInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setPassword('');
            setError('');
            setIsDeleting(false);
            setShowPassword(false);
            // Фокус на поле ввода пароля после открытия модального окна
            setTimeout(() => {
                passwordInputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!password.trim()) {
            setError('Пожалуйста, введите ваш пароль');
            return;
        }

        setIsDeleting(true);
        setError('');

        try {
            await onConfirm(password);
            // При успешном удалении модальное окно закроется автоматически через onClose в ProfileModal
        } catch (err: any) {
            console.error('Ошибка в DeleteProfileModal:', err);
            setError(err.message || 'Ошибка при удалении профиля. Проверьте пароль.');
            setIsDeleting(false);
        }
    };

    const getConsequences = () => [
        'Все ваши личные данные будут удалены',
        'Все проекты и задачи под вашим управлением будут удалены',
        'Вы потеряете доступ ко всем функциям системы',
        'Вся история активности будет стерта',
        'Восстановление учетной записи невозможно'
    ];

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && password.trim() && !isDeleting) {
            handleSubmit();
        }
        if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={styles.deleteModal}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className={styles.modalContent}
                        onKeyDown={handleKeyDown}
                    >
                        <div className={styles.modalHeader}>
                            <div className={styles.headerContent}>
                                <div className={styles.headerIconWrapper}>
                                    <FaExclamationTriangle className={styles.headerIcon} />
                                </div>
                                <h2 className={styles.modalTitle}>Удаление профиля</h2>
                                <p className={styles.modalSubtitle}>
                                    Это действие нельзя отменить
                                </p>
                            </div>
                            <button
                                className={styles.closeButton}
                                onClick={onClose}
                                disabled={isDeleting}
                                aria-label="Закрыть"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.warningSection}>
                                <div className={styles.warningCard}>
                                    <div className={styles.warningIcon}>
                                        <FaExclamationTriangle />
                                    </div>
                                    <div className={styles.warningContent}>
                                        <h3 className={styles.warningTitle}>
                                            Вы собираетесь удалить профиль "{userName}"
                                        </h3>
                                        <p className={styles.warningText}>
                                            Для подтверждения удаления введите ваш пароль. Это <strong>безвозвратное</strong> действие.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.consequencesSection}>
                                <h3 className={styles.sectionTitle}>
                                    <FaLock className={styles.sectionIcon} />
                                    Что будет удалено:
                                </h3>
                                <div className={styles.consequencesGrid}>
                                    {getConsequences().map((consequence, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={styles.consequenceItem}
                                        >
                                            <div className={styles.consequenceIcon}>🗑️</div>
                                            <span className={styles.consequenceText}>{consequence}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.confirmationSection}>
                                <h3 className={styles.sectionTitle}>
                                    <FaLock className={styles.sectionIcon} />
                                    Подтверждение паролем
                                </h3>

                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>
                                        Введите ваш пароль для подтверждения удаления
                                    </label>
                                    <div className={styles.passwordInputWrapper}>
                                        <input
                                            ref={passwordInputRef}
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                setError('');
                                            }}
                                            placeholder="Введите ваш текущий пароль"
                                            className={styles.codeInput}
                                            disabled={isDeleting}
                                        />
                                        <button
                                            type="button"
                                            className={styles.togglePasswordButton}
                                            onClick={() => setShowPassword(!showPassword)}
                                            disabled={isDeleting}
                                            aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={styles.errorMessage}
                                        >
                                            {error}
                                        </motion.div>
                                    )}
                                </div>

                                <div className={styles.securityCheck}>
                                    <label className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            className={styles.checkboxInput}
                                            checked={password.length > 0}
                                            readOnly
                                        />
                                        <span className={styles.checkboxCustom} />
                                        <span className={styles.checkboxText}>
                                            Я понимаю, что все мои данные будут удалены без возможности восстановления
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                className={styles.cancelButton}
                                onClick={onClose}
                                disabled={isDeleting}
                            >
                                Отмена
                            </button>
                            <motion.button
                                className={`${styles.deleteButton} ${!password.trim() ? styles.deleteButtonDisabled : ''}`}
                                onClick={handleSubmit}
                                disabled={!password.trim() || isDeleting}
                                whileHover={password.trim() && !isDeleting ? { scale: 1.02 } : {}}
                                whileTap={password.trim() && !isDeleting ? { scale: 0.98 } : {}}
                            >
                                {isDeleting ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            className={styles.deletingSpinner}
                                        />
                                        Удаление...
                                    </>
                                ) : (
                                    <>
                                        <FaTrash className={styles.deleteIcon} />
                                        Удалить профиль
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DeleteProfileModal;