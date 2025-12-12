import { memo, useCallback, useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, useFormikContext } from 'formik';
import { FaSave, FaEdit, FaEnvelope, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';
import type { ProfileFormData } from '../../types/profile.types';
import { profileSchema } from '../../validation/profileSchema';
import { useNotification } from '@/app/auth/hooks/useNotification';
import styles from './ProfileForm.module.css';

interface ProfileFormProps {
    initialData: ProfileFormData;
    onSubmit: (data: ProfileFormData) => Promise<void>;
    onChangeEmail?: (newEmail: string, password: string) => Promise<void>;
    isLoading: boolean;
}

const EditButton = memo(() => {
    const { setFieldValue } = useFormikContext();

    const enableEditing = useCallback(() => {
        const form = document.querySelector(`.${styles.profileForm}`);
        const inputs = form?.querySelectorAll<HTMLElement>('input, textarea');
        inputs?.forEach(input => {
            if (input.id !== 'email') {
                input.removeAttribute('disabled');
                input.classList.remove(styles.disabled);
            }
        });
        setFieldValue('__editing', true);
    }, [setFieldValue]);

    return (
        <motion.button
            type="button"
            className={styles.editButton}
            onClick={enableEditing}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
        >
            <FaEdit className={styles.editIcon} />
            Редактировать
        </motion.button>
    );
});

EditButton.displayName = 'EditButton';

export const ProfileForm = memo(({ initialData, onSubmit, onChangeEmail, isLoading }: ProfileFormProps) => {
    const [showEmailChange, setShowEmailChange] = useState(false);
    const [emailChangeData, setEmailChangeData] = useState({ newEmail: '', password: '' });
    const [isChangingEmail, setIsChangingEmail] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const { showSuccess, showError, showWarning } = useNotification();

    const initialValues = {
        ...initialData,
        __editing: false
    };

    const handleSubmit = useCallback(async (values: typeof initialValues, { setSubmitting, resetForm }: any) => {
        const { __editing, ...formData } = values;
        await onSubmit(formData as ProfileFormData);
        setSubmitting(false);
        resetForm({ values: { ...formData, __editing: false } });
    }, [onSubmit]);

    const validateEmailChange = useCallback(() => {
        let isValid = true;

        // Сбросить предыдущие ошибки
        setEmailError(null);
        setPasswordError(null);

        // Проверка email
        if (!emailChangeData.newEmail.trim()) {
            setEmailError('Email обязателен для заполнения');
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailChangeData.newEmail)) {
            setEmailError('Введите корректный email адрес');
            isValid = false;
        } else if (emailChangeData.newEmail === initialData.email) {
            setEmailError('Новый email совпадает с текущим');
            showWarning('Введите другой email адрес для изменения');
            isValid = false;
        }

        // Проверка пароля
        if (!emailChangeData.password.trim()) {
            setPasswordError('Пароль обязателен для подтверждения');
            isValid = false;
        } else if (emailChangeData.password.length < 6) {
            setPasswordError('Пароль должен содержать минимум 6 символов');
            isValid = false;
        }

        return isValid;
    }, [emailChangeData, initialData.email, showWarning]);

    const handleEmailChangeSubmit = useCallback(async () => {
        if (!onChangeEmail) return;

        // Валидация перед отправкой
        if (!validateEmailChange()) {
            return;
        }

        try {
            setIsChangingEmail(true);
            // Сбросить ошибки перед отправкой
            setEmailError(null);
            setPasswordError(null);

            await onChangeEmail(emailChangeData.newEmail, emailChangeData.password);
            setShowEmailChange(false);
            setEmailChangeData({ newEmail: '', password: '' });
            showSuccess('Email успешно изменен! Проверьте новую почту для подтверждения.');
        } catch (error: any) {
            // Обработка ошибок сервера
            if (error.response?.status === 401 || error.response?.data?.message?.includes('password')) {
                setPasswordError('Неверный пароль. Пожалуйста, попробуйте снова.');
                showError('Неверный пароль. Проверьте правильность ввода.');
            } else if (error.response?.data?.message?.includes('exist') || error.response?.status === 409) {
                setEmailError('Этот email уже используется другим пользователем');
                showError('Email уже зарегистрирован. Используйте другой адрес.');
            } else if (error.response?.data?.message?.includes('same')) {
                setEmailError('Новый email совпадает с текущим');
                showWarning('Введите другой email адрес для изменения');
            } else if (error.response?.data?.message?.includes('invalid')) {
                setEmailError('Некорректный формат email');
                showError('Введите корректный email адрес');
            } else {
                const errorMessage = error.response?.data?.message || 'Не удалось изменить email. Попробуйте снова.';
                showError(errorMessage);
                setEmailError('Ошибка при изменении email');
            }
            throw error;
        } finally {
            setIsChangingEmail(false);
        }
    }, [onChangeEmail, emailChangeData, validateEmailChange, showSuccess, showError, showWarning]);

    // Сброс ошибок при закрытии формы смены email
    const handleCloseEmailChange = useCallback(() => {
        setShowEmailChange(false);
        setEmailChangeData({ newEmail: '', password: '' });
        setEmailError(null);
        setPasswordError(null);
    }, []);

    // Сброс ошибок при изменении полей
    useEffect(() => {
        if (emailChangeData.newEmail && emailError) {
            if (emailChangeData.newEmail !== initialData.email) {
                setEmailError(null);
            }
        }
    }, [emailChangeData.newEmail, emailError, initialData.email]);

    useEffect(() => {
        if (emailChangeData.password && passwordError) {
            setPasswordError(null);
        }
    }, [emailChangeData.password, passwordError]);

    return (
        <div className={styles.profileFormContainer}>
            <Formik
                initialValues={initialValues}
                validationSchema={profileSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ isSubmitting, isValid, dirty, values, resetForm }) => (
                    <>
                        <div className={styles.formHeader}>
                            <h3>Информация профиля</h3>
                            {!values.__editing && !dirty && <EditButton />}
                        </div>

                        <Form className={styles.profileForm}>
                            <div className={styles.formGrid}>
                                <motion.div
                                    className={styles.formGroup}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 }}
                                >
                                    <label htmlFor="name">Полное имя</label>
                                    <Field
                                        id="name"
                                        name="name"
                                        type="text"
                                        disabled={!values.__editing}
                                        className={!values.__editing ? styles.disabled : ''}
                                    />
                                    <ErrorMessage name="name" component="div" className={styles.errorMessage} />
                                </motion.div>

                                <motion.div
                                    className={styles.formGroup}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <div className={styles.emailHeader}>
                                        <label htmlFor="email">Email</label>
                                        {onChangeEmail && (
                                            <button
                                                type="button"
                                                className={styles.changeEmailButton}
                                                onClick={() => setShowEmailChange(true)}
                                            >
                                                <FaEnvelope className={styles.emailIcon} />
                                                Сменить email
                                            </button>
                                        )}
                                    </div>
                                    <Field
                                        id="email"
                                        name="email"
                                        type="email"
                                        disabled={true}
                                        className={styles.disabled}
                                    />
                                    <ErrorMessage name="email" component="div" className={styles.errorMessage} />
                                </motion.div>

                                <motion.div
                                    className={`${styles.formGroup} ${styles.fullWidth}`}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    <label htmlFor="bio">О себе</label>
                                    <Field
                                        id="bio"
                                        name="bio"
                                        as="textarea"
                                        disabled={!values.__editing}
                                        className={!values.__editing ? styles.disabled : ''}
                                        rows={3}
                                        placeholder="Расскажите о себе..."
                                    />
                                    <ErrorMessage name="bio" component="div" className={styles.errorMessage} />
                                </motion.div>
                            </div>

                            <AnimatePresence>
                                {showEmailChange && (
                                    <motion.div
                                        className={styles.emailChangeForm}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    >
                                        <div className={styles.emailChangeHeader}>
                                            <h4>Смена email адреса</h4>
                                            <p className={styles.emailChangeDescription}>
                                                Введите новый email адрес и текущий пароль для подтверждения
                                            </p>
                                        </div>

                                        <div className={styles.emailChangeFields}>
                                            <div className={styles.inputGroup}>
                                                <label className={styles.inputLabel}>Новый email</label>
                                                <input
                                                    type="email"
                                                    placeholder="example@domain.com"
                                                    value={emailChangeData.newEmail}
                                                    onChange={(e) => setEmailChangeData(prev => ({ ...prev, newEmail: e.target.value }))}
                                                    className={`${styles.emailInput} ${emailError ? styles.inputError : ''}`}
                                                    autoComplete="new-email"
                                                />
                                                {emailError && (
                                                    <div className={styles.fieldError}>
                                                        <FaExclamationTriangle className={styles.errorIcon} />
                                                        <span>{emailError}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className={styles.inputGroup}>
                                                <label className={styles.inputLabel}>Текущий пароль</label>
                                                <input
                                                    type="password"
                                                    placeholder="Введите текущий пароль"
                                                    value={emailChangeData.password}
                                                    onChange={(e) => setEmailChangeData(prev => ({ ...prev, password: e.target.value }))}
                                                    className={`${styles.passwordInput} ${passwordError ? styles.inputError : ''}`}
                                                    autoComplete="current-password"
                                                />
                                                {passwordError && (
                                                    <div className={styles.fieldError}>
                                                        <FaExclamationTriangle className={styles.errorIcon} />
                                                        <span>{passwordError}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className={styles.securityNotice}>
                                                <FaShieldAlt className={styles.securityIcon} />
                                                <span>Для вашей безопасности требуется подтверждение паролем</span>
                                            </div>
                                        </div>

                                        <div className={styles.emailChangeActions}>
                                            <button
                                                type="button"
                                                onClick={handleCloseEmailChange}
                                                className={styles.cancelEmailButton}
                                                disabled={isChangingEmail}
                                            >
                                                Отмена
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleEmailChangeSubmit}
                                                className={styles.confirmEmailButton}
                                                disabled={isChangingEmail || !emailChangeData.newEmail || !emailChangeData.password}
                                            >
                                                {isChangingEmail ? (
                                                    <span className={styles.loadingSpinner}></span>
                                                ) : (
                                                    'Подтвердить смену email'
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatePresence>
                                {values.__editing && (
                                    <motion.div
                                        className={styles.formActions}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 8 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    >
                                        <motion.button
                                            type="button"
                                            onClick={() => {
                                                resetForm();
                                            }}
                                            className={styles.cancelButton}
                                            disabled={isSubmitting}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            Отмена
                                        </motion.button>
                                        <motion.button
                                            type="submit"
                                            className={styles.saveButton}
                                            disabled={isSubmitting || !isValid || isLoading}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <FaSave className={styles.saveIcon} />
                                            {isSubmitting || isLoading ? 'Сохранение...' : 'Сохранить'}
                                        </motion.button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Form>
                    </>
                )}
            </Formik>
        </div>
    );
});

ProfileForm.displayName = 'ProfileForm';