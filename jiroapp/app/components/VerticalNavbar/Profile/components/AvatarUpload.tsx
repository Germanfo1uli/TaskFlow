import { useRef, useState } from 'react';
import { FaUserCircle, FaCamera, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import styles from './AvatarUpload.module.css';

interface AvatarUploadProps {
    avatar: string | null;
    onAvatarChange: (file: File) => void;
    onAvatarDelete: () => void;
    isLoading: boolean;
}

export const AvatarUpload = ({ avatar, onAvatarChange, onAvatarDelete, isLoading }: AvatarUploadProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);

    const validateFile = (file: File): boolean => {
        setFileError(null);

        // Проверка типа файла
        if (!file.type.startsWith('image/')) {
            setFileError('Пожалуйста, выберите файл изображения');
            return false;
        }

        // Проверка размера файла (максимум 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB в байтах
        if (file.size > maxSize) {
            setFileError('Размер файла не должен превышать 5MB');
            return false;
        }

        // Проверка на очень маленькие изображения
        const minSize = 10 * 1024; // 10KB
        if (file.size < minSize) {
            setFileError('Файл слишком маленький');
            return false;
        }

        return true;
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (validateFile(file)) {
                onAvatarChange(file);
            }
            // Сбрасываем значение input чтобы можно было выбрать тот же файл снова
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragOver(false);
        setFileError(null);

        const file = event.dataTransfer.files?.[0];
        if (file) {
            if (validateFile(file)) {
                onAvatarChange(file);
            }
        }
    };

    const handleClick = () => {
        setFileError(null);
        fileInputRef.current?.click();
    };

    const handleDeleteClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = () => {
        onAvatarDelete();
        setShowDeleteConfirm(false);
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    const handleErrorClose = () => {
        setFileError(null);
    };

    return (
        <div className={styles.avatarUploadContainer}>
            <div
                className={`${styles.avatarUploadArea} ${isDragOver ? styles.dragOver : ''} ${isLoading ? styles.loading : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                {avatar ? (
                    <div className={styles.avatarPreview}>
                        <img src={avatar} alt="Аватар" className={styles.avatarImage} />
                        <div className={styles.avatarOverlay}>
                            <FaCamera className={styles.overlayIcon} />
                        </div>
                        <button
                            className={styles.deleteButton}
                            onClick={handleDeleteClick}
                            title="Удалить аватар"
                        >
                            <FaTrash className={styles.deleteIcon} />
                        </button>
                    </div>
                ) : (
                    <div className={styles.avatarPlaceholder}>
                        <FaUserCircle className={styles.placeholderIcon} />
                        <span className={styles.placeholderText}>Добавить фото</span>
                    </div>
                )}

                {isLoading && (
                    <div className={styles.avatarLoading}>
                        <div className={styles.loadingSpinner}></div>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    className={styles.avatarInput}
                />
            </div>

            {/* Сообщение об ошибке */}
            {fileError && (
                <div className={styles.errorMessage}>
                    <FaExclamationTriangle className={styles.errorIcon} />
                    <span>{fileError}</span>
                    <button
                        className={styles.errorCloseButton}
                        onClick={handleErrorClose}
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Модальное окно подтверждения удаления */}
            {showDeleteConfirm && (
                <div className={styles.deleteConfirmOverlay} onClick={handleCancelDelete}>
                    <div className={styles.deleteConfirmModal} onClick={e => e.stopPropagation()}>
                        <h4>Удалить аватар?</h4>
                        <p>Вы уверены, что хотите удалить текущий аватар?</p>
                        <div className={styles.deleteConfirmActions}>
                            <button
                                className={styles.deleteCancelButton}
                                onClick={handleCancelDelete}
                            >
                                Отмена
                            </button>
                            <button
                                className={styles.deleteConfirmButton}
                                onClick={handleConfirmDelete}
                            >
                                Удалить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};