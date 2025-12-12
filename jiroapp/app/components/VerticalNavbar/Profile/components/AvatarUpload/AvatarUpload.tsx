import { memo, useRef, useState, useCallback } from 'react';
import { FaUserCircle, FaCamera, FaExclamationTriangle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AvatarUpload.module.css';

interface AvatarUploadProps {
    avatar: string | null;
    onAvatarChange: (file: File) => void;
    onAvatarDelete: () => void;
    isLoading: boolean;
}

export const AvatarUpload = memo(({ avatar, onAvatarChange, onAvatarDelete, isLoading }: AvatarUploadProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);

    const validateFile = useCallback((file: File): boolean => {
        setFileError(null);

        if (!file.type.startsWith('image/')) {
            setFileError('Пожалуйста, выберите файл изображения');
            return false;
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            setFileError('Размер файла не должен превышать 5MB');
            return false;
        }

        const minSize = 10 * 1024;
        if (file.size < minSize) {
            setFileError('Файл слишком маленький');
            return false;
        }

        return true;
    }, []);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (validateFile(file)) {
                onAvatarChange(file);
            }
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [onAvatarChange, validateFile]);

    const handleDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        setIsDragOver(false);
        setFileError(null);

        const file = event.dataTransfer.files?.[0];
        if (file && validateFile(file)) {
            onAvatarChange(file);
        }
    }, [onAvatarChange, validateFile]);

    const handleClick = useCallback(() => {
        setFileError(null);
        fileInputRef.current?.click();
    }, []);

    const handleErrorClose = useCallback(() => setFileError(null), []);

    return (
        <div className={styles.avatarUploadContainer}>
            <motion.div
                className={`${styles.avatarUploadArea} ${isDragOver ? styles.dragOver : ''} ${isLoading ? styles.loading : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
            >
                <AnimatePresence mode="wait">
                    {avatar ? (
                        <motion.div
                            key="avatar"
                            className={styles.avatarPreview}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <img src={avatar} alt="Аватар" className={styles.avatarImage} />
                            <div className={styles.avatarOverlay}>
                                <FaCamera className={styles.overlayIcon} />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="placeholder"
                            className={styles.avatarPlaceholder}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <FaUserCircle className={styles.placeholderIcon} />
                            <span className={styles.placeholderText}>Добавить фото</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isLoading && (
                        <motion.div
                            className={styles.avatarLoading}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className={styles.loadingSpinner}></div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    className={styles.avatarInput}
                />
            </motion.div>

            <AnimatePresence>
                {fileError && (
                    <motion.div
                        className={styles.errorMessage}
                        initial={{ opacity: 0, y: -4, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -4, height: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    >
                        <FaExclamationTriangle className={styles.errorIcon} />
                        <span>{fileError}</span>
                        <button
                            className={styles.errorCloseButton}
                            onClick={handleErrorClose}
                            aria-label="Закрыть ошибку"
                        >

                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

AvatarUpload.displayName = 'AvatarUpload';