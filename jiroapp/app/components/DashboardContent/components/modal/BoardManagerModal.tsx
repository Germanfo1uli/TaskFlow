'use client'

import { useState } from 'react'
import { FaPlus, FaTrash, FaEdit, FaTimes, FaSave } from 'react-icons/fa'
import styles from './BoardManagerModal.module.css'

interface Board {
    id: number
    title: string
    color: string
}

interface BoardManagerModalProps {
    isOpen: boolean
    onClose: () => void
    boards: Board[]
    onSave: (boards: Board[]) => void
}

const BoardManagerModal = ({ isOpen, onClose, boards, onSave }: BoardManagerModalProps) => {
    const [boardsList, setBoardsList] = useState<Board[]>([...boards])
    const [newBoardTitle, setNewBoardTitle] = useState('')
    const [newBoardColor, setNewBoardColor] = useState('#3b82f6')
    const [editingBoardId, setEditingBoardId] = useState<number | null>(null)
    const [editBoardTitle, setEditBoardTitle] = useState('')
    const [editBoardColor, setEditBoardColor] = useState('')

    const predefinedColors = [
        '#3b82f6', // blue
        '#f59e0b', // amber
        '#8b5cf6', // violet
        '#10b981', // emerald
        '#ef4444', // red
        '#ec4899', // pink
        '#06b6d4', // cyan
        '#f97316', // orange
    ]

    const handleAddBoard = () => {
        if (newBoardTitle.trim()) {
            const newBoard: Board = {
                id: Date.now(),
                title: newBoardTitle.trim(),
                color: newBoardColor,
            }
            setBoardsList([...boardsList, newBoard])
            setNewBoardTitle('')
            setNewBoardColor('#3b82f6')
        }
    }

    const handleDeleteBoard = (id: number) => {
        setBoardsList(boardsList.filter(board => board.id !== id))
    }

    const startEditingBoard = (board: Board) => {
        setEditingBoardId(board.id)
        setEditBoardTitle(board.title)
        setEditBoardColor(board.color)
    }

    const saveEditedBoard = () => {
        if (editingBoardId !== null && editBoardTitle.trim()) {
            setBoardsList(boardsList.map(board =>
                board.id === editingBoardId
                    ? { ...board, title: editBoardTitle.trim(), color: editBoardColor }
                    : board
            ))
            cancelEditing()
        }
    }

    const cancelEditing = () => {
        setEditingBoardId(null)
        setEditBoardTitle('')
        setEditBoardColor('')
    }

    const handleSave = () => {
        onSave(boardsList)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Управление досками</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.addBoardSection}>
                        <h3 className={styles.sectionTitle}>Добавить новую доску</h3>
                        <div className={styles.addBoardForm}>
                            <input
                                type="text"
                                className={styles.boardInput}
                                value={newBoardTitle}
                                onChange={(e) => setNewBoardTitle(e.target.value)}
                                placeholder="Название доски"
                            />
                            <div className={styles.colorPicker}>
                                {predefinedColors.map(color => (
                                    <button
                                        key={color}
                                        className={`${styles.colorOption} ${newBoardColor === color ? styles.selected : ''}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setNewBoardColor(color)}
                                    />
                                ))}
                            </div>
                            <button className={styles.addButton} onClick={handleAddBoard}>
                                <FaPlus /> Добавить доску
                            </button>
                        </div>
                    </div>

                    <div className={styles.boardsListSection}>
                        <h3 className={styles.sectionTitle}>Существующие доски</h3>
                        <div className={styles.boardsList}>
                            {boardsList.map(board => (
                                <div key={board.id} className={styles.boardItem}>
                                    {editingBoardId === board.id ? (
                                        <div className={styles.editBoardForm}>
                                            <input
                                                type="text"
                                                className={styles.boardInput}
                                                value={editBoardTitle}
                                                onChange={(e) => setEditBoardTitle(e.target.value)}
                                            />
                                            <div className={styles.colorPicker}>
                                                {predefinedColors.map(color => (
                                                    <button
                                                        key={color}
                                                        className={`${styles.colorOption} ${editBoardColor === color ? styles.selected : ''}`}
                                                        style={{ backgroundColor: color }}
                                                        onClick={() => setEditBoardColor(color)}
                                                    />
                                                ))}
                                            </div>
                                            <div className={styles.editActions}>
                                                <button className={styles.saveButton} onClick={saveEditedBoard}>
                                                    <FaSave />
                                                </button>
                                                <button className={styles.cancelButton} onClick={cancelEditing}>
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className={styles.boardInfo}>
                                                <div
                                                    className={styles.boardColorIndicator}
                                                    style={{ backgroundColor: board.color }}
                                                />
                                                <span className={styles.boardTitle}>{board.title}</span>
                                            </div>
                                            <div className={styles.boardActions}>
                                                <button
                                                    className={styles.editButton}
                                                    onClick={() => startEditingBoard(board)}
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    className={styles.deleteButton}
                                                    onClick={() => handleDeleteBoard(board.id)}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles.modalActions}>
                    <button className={styles.cancelButton} onClick={onClose}>
                        Отмена
                    </button>
                    <button className={styles.saveButton} onClick={handleSave}>
                        Сохранить изменения
                    </button>
                </div>
            </div>
        </div>
    )
}

export default BoardManagerModal