import React, { useState } from 'react'
import { Issue } from '../types/types'
import styles from './AddTasksToSprintModal.module.css'
import { FaTimes } from 'react-icons/fa'

interface AddTasksToSprintModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (issueIds: string[]) => void;
    backlogIssues: Issue[];
}

const AddTasksToSprintModal = ({ isOpen, onClose, onAdd, backlogIssues }: AddTasksToSprintModalProps) => {
    const [selectedIssues, setSelectedIssues] = useState<string[]>([])

    if (!isOpen) return null;

    const handleToggleIssue = (issueId: string | number) => {
        const idStr = String(issueId)
        if (selectedIssues.includes(idStr)) {
            setSelectedIssues(prev => prev.filter(id => id !== idStr))
        } else {
            setSelectedIssues(prev => [...prev, idStr])
        }
    }

    const handleSubmit = () => {
        onAdd(selectedIssues)
        setSelectedIssues([])
        onClose()
    }

    const handleClose = () => {
        setSelectedIssues([])
        onClose()
    }

    return (
        <div className={styles.modalOverlay} onClick={handleClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Добавить задачи в спринт</h2>
                    <button className={styles.closeButton} onClick={handleClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.taskList}>
                        {backlogIssues.length > 0 ? (
                            backlogIssues.map(issue => (
                                <div 
                                    key={issue.id} 
                                    className={styles.taskItem} 
                                    onClick={() => handleToggleIssue(issue.id)}
                                >
                                    <input
                                        type="checkbox"
                                        className={styles.checkbox}
                                        checked={selectedIssues.includes(String(issue.id))}
                                        readOnly
                                    />
                                    <span className={styles.taskTitle}>{issue.title}</span>
                                </div>
                            ))
                        ) : (
                            <div className={styles.emptyMessage}>Нет задач в бэклоге</div>
                        )}
                    </div>
                </div>

                <div className={styles.modalActions}>
                    <button type="button" className={styles.cancelButton} onClick={handleClose}>
                        Отмена
                    </button>
                    <button 
                        type="button" 
                        className={styles.saveButton}
                        onClick={handleSubmit}
                        disabled={selectedIssues.length === 0}
                    >
                        Добавить
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AddTasksToSprintModal
