'use client'

import { motion } from 'framer-motion'
import { FaExclamationTriangle } from 'react-icons/fa'
import styles from '../ModalStyles.module.css'

interface BoardSelectorProps {
    boards: any[]
    selectedBoard: number
    onBoardChange: (boardId: number) => void
    isOwner: boolean
    isLoading: boolean
}

export default function BoardSelector({ boards = [], selectedBoard, onBoardChange, isOwner, isLoading }: BoardSelectorProps) {
    return (
        <label className={styles.formLabel}>
            <span className={styles.labelText}>Доска *</span>
            <div className={styles.boardsRadioGroup}>
                {boards.map((board) => (
                    <motion.label
                        key={board.id}
                        className={styles.boardRadioLabel}
                        style={{ '--board-color': board.color } as React.CSSProperties}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <input
                            type="radio"
                            value={board.id}
                            checked={selectedBoard === board.id}
                            onChange={(e) => onBoardChange(parseInt(e.target.value))}
                            className={styles.boardRadio}
                            disabled={!isOwner && isLoading}
                        />
                        <span className={styles.boardRadioCustom}></span>
                        <span className={styles.boardTitle}>{board.title}</span>
                        {!isOwner && selectedBoard === board.id && (
                            <span className={styles.boardCurrentInfo}>
                                (текущая доска)
                            </span>
                        )}
                        {!isOwner && selectedBoard !== board.id && (
                            <span className={styles.boardLockedInfo}>
                                (только для владельца)
                            </span>
                        )}
                    </motion.label>
                ))}
            </div>
            {!isOwner && (
                <div className={styles.permissionNote}>
                    <FaExclamationTriangle /> Только владелец проекта может перемещать задачи между досками
                </div>
            )}
        </label>
    )
}