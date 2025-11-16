'use client'

import { useState, useRef, useEffect } from 'react'
import { FaEllipsisH, FaEdit, FaTrash, FaTimes } from 'react-icons/fa'
import styles from './CardMenu.module.css'

interface CardMenuProps {
    onEdit: () => void
    onDelete: () => void
    onClose: () => void
}

const CardMenu = ({ onEdit, onDelete, onClose }: CardMenuProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
                onClose()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [onClose])

    const handleEdit = () => {
        onEdit()
        setIsOpen(false)
    }

    const handleDelete = () => {
        onDelete()
        setIsOpen(false)
    }

    return (
        <div className={styles.cardMenuContainer} ref={menuRef}>
            <button
                className={styles.menuTrigger}
                onClick={(e) => {
                    e.stopPropagation()
                    setIsOpen(!isOpen)
                }}
            >
                <FaEllipsisH />
            </button>

            {isOpen && (
                <div className={styles.menuDropdown}>
                    <div className={styles.menuHeader}>
                        <span className={styles.menuTitle}>Действия с карточкой</span>
                        <button
                            className={styles.closeMenuButton}
                            onClick={() => setIsOpen(false)}
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className={styles.menuItems}>
                        <button
                            className={styles.menuItem}
                            onClick={handleEdit}
                        >
                            <FaEdit className={styles.menuItemIcon} />
                            <span>Редактировать</span>
                        </button>

                        <button
                            className={`${styles.menuItem} ${styles.deleteItem}`}
                            onClick={handleDelete}
                        >
                            <FaTrash className={styles.menuItemIcon} />
                            <span>Удалить</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CardMenu