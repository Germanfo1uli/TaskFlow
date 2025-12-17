import React from 'react'
import { Sprint } from '../types/types'
import styles from './DeleteSprintModal.module.css'
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa'

interface DeleteSprintModalProps {
    sprint: Sprint;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (sprintId: string | number) => void;
}

const DeleteSprintModal = ({ sprint, isOpen, onClose, onConfirm }: DeleteSprintModalProps) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>
                        <FaExclamationTriangle className={styles.warningIcon} />
                        Удалить спринт?
                    </h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <p className={styles.warningText}>
                        Вы уверены, что хотите удалить спринт <span className={styles.sprintName}>{sprint.name}</span>? 
                        <br /><br />
                        Это действие нельзя будет отменить. Все задачи из этого спринта будут перемещены в бэклог.
                    </p>
                </div>

                <div className={styles.modalActions}>
                    <button className={styles.cancelButton} onClick={onClose}>
                        Отмена
                    </button>
                    <button 
                        className={styles.deleteButton}
                        onClick={() => {
                            onConfirm(sprint.id);
                            onClose();
                        }}
                    >
                        Удалить
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DeleteSprintModal
