'use client'

import { JSX } from 'react'
import { FaUserCircle, FaPaperclip, FaFlag, FaRegFlag } from 'react-icons/fa'
import CardMenu from './CardMenu'
import styles from './TaskCard.module.css'

type Priority = 'low' | 'medium' | 'high'

interface Author {
    name: string
    avatar: string | null
}

interface Card {
    id: number
    title: string
    description: string
    priority: Priority
    priorityLevel: number
    author: Author
    tags: string[]
    progress: number
    comments: number
    attachments: number
}

interface TaskCardProps {
    card: Card
    getPriorityColor: (priority: Priority) => string
    getPriorityBgColor: (priority: Priority) => string
    onEdit?: (card: Card) => void
    onDelete?: (cardId: number) => void
}

const TaskCard = ({ card, getPriorityColor, getPriorityBgColor, onEdit, onDelete }: TaskCardProps) => {
    const getPriorityIcon = (priority: Priority): JSX.Element => {
        switch (priority) {
            case 'high':
                return <FaFlag className={`${styles.priorityIcon} ${styles.highPriority}`} />
            case 'medium':
                return <FaFlag className={`${styles.priorityIcon} ${styles.mediumPriority}`} />
            case 'low':
                return <FaRegFlag className={`${styles.priorityIcon} ${styles.lowPriority}`} />
            default:
                return <FaRegFlag className={styles.priorityIcon} />
        }
    }

    const handleEdit = () => {
        if (onEdit) {
            onEdit(card)
        }
    }

    const handleDelete = () => {
        if (onDelete) {
            onDelete(card.id)
        }
    }

    const handleMenuClose = () => {
        // Дополнительные действия при закрытии меню, если нужны
    }

    return (
        <div className={styles.taskCard}>
            <div
                className={styles.cardPriorityBar}
                style={{ backgroundColor: getPriorityColor(card.priority) }}
            ></div>

            <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                    <div
                        className={styles.cardTitleContainer}
                        style={{ backgroundColor: getPriorityBgColor(card.priority) }}
                    >
                        {getPriorityIcon(card.priority)}
                        <h4 className={styles.cardTitle}>{card.title}</h4>
                    </div>

                    <CardMenu
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onClose={handleMenuClose}
                    />
                </div>

                <p className={styles.cardDescription}>
                    {card.description}
                </p>
                <div className={styles.cardTags}>
                    {card.tags.map((tag, index) => (
                        <span key={index} className={styles.tag}>
                            {tag}
                        </span>
                    ))}
                </div>

                <div className={styles.cardFooter}>
                    <div className={styles.cardMeta}>
                        {card.comments > 0 && (
                            <div className={styles.metaItem}>
                                <FaUserCircle />
                                <span>{card.comments}</span>
                            </div>
                        )}
                        {card.attachments > 0 && (
                            <div className={styles.metaItem}>
                                <FaPaperclip />
                                <span>{card.attachments}</span>
                            </div>
                        )}
                    </div>

                    <div className={styles.authorSection}>
                        <div className={styles.authorAvatar}>
                            {card.author.avatar ? (
                                <img
                                    src={card.author.avatar}
                                    alt={card.author.name}
                                />
                            ) : (
                                <FaUserCircle className={styles.defaultAvatar} />
                            )}
                        </div>
                        <div className={styles.authorInfo}>
                            <span className={styles.authorName}>{card.author.name}</span>
                            {card.attachments > 0 && (
                                <div className={styles.authorAttachments}>
                                    <FaPaperclip className={styles.attachmentIcon} />
                                    <span>{card.attachments}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TaskCard