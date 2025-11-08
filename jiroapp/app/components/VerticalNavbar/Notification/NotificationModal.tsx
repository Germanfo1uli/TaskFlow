'use client'

import { FaRegSadTear, FaTimes } from 'react-icons/fa'
import styles from './NotificationModal.module.css'

interface NotificationModalProps {
    onClose: () => void
}

const NotificationModal = ({ onClose }: NotificationModalProps) => {
    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>Уведомления</h3>
                    <button className={styles.closeButton} onClick={onClose}>
                        <FaTimes className={styles.closeIcon} />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.emptyState}>
                        <FaRegSadTear className={styles.sadIcon} />
                        <p className={styles.emptyText}>Нет уведомлений</p>
                        <p className={styles.emptySubtext}>
                            Здесь пока пусто... Вы никому не нужны :(
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NotificationModal