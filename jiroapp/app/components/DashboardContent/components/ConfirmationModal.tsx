'use client'

import { FaExclamationTriangle, FaTimes, FaTrash, FaCheck } from 'react-icons/fa'
import styles from './ConfirmationModal.module.css'

interface ConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
}

const ConfirmationModal = ({
                               isOpen,
                               onClose,
                               onConfirm,
                               title,
                               message,
                               confirmText = "Удалить",
                               cancelText = "Отмена"
                           }: ConfirmationModalProps) => {
    if (!isOpen) return null

    const handleConfirm = () => {
        onConfirm()
        onClose()
    }

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div className={styles.titleSection}>
                        <FaExclamationTriangle className={styles.warningIcon} />
                        <h3 className={styles.modalTitle}>{title}</h3>
                    </div>
                    <button className={styles.closeButton} onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <p className={styles.message}>{message}</p>
                </div>

                <div className={styles.modalActions}>
                    <button
                        className={styles.cancelButton}
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={styles.confirmButton}
                        onClick={handleConfirm}
                    >
                        <FaTrash className={styles.confirmIcon} />
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmationModal