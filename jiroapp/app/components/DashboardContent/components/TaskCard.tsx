'use client'

import { JSX } from 'react'
import { FaUserCircle, FaPaperclip, FaFlag, FaRegFlag, FaUsers } from 'react-icons/fa'
import CardMenu from './CardMenu'
import styles from './TaskCard.module.css'
import { Card, Priority } from '../types/dashboard.types'

interface TaskCardProps {
    card: Card
    getPriorityColor: (priority: Priority) => string
    getPriorityBgColor: (priority: Priority) => string
    onEdit?: (card: Card) => void
    onDelete?: (cardId: number) => void
    onView?: (card: Card) => void
}

const TaskCard = ({ card, getPriorityColor, getPriorityBgColor, onEdit, onDelete, onView }: TaskCardProps) => {
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

    const handleView = () => {
        if (onView) {
            onView(card)
        }
    }

    const handleMenuClose = () => {
    }

    const displayAssignees = card.assignees || [card.author]
    const hasMultipleAssignees = displayAssignees.length > 1

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
                        onView={handleView}
                        onClose={handleMenuClose}
                    />
                </div>

                <p className={styles.cardDescription}>
                    {card.description}
                </p>

                {card.tags && card.tags.length > 0 && (
                    <div className={styles.cardTags}>
                        {card.tags.map((tag, index) => (
                            <span key={index} className={styles.tag}>
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

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

                    <div className={styles.assigneesSection}>
                        {hasMultipleAssignees ? (
                            <div className={styles.multipleAssignees}>
                                <div className={styles.assigneesAvatars}>
                                    {displayAssignees.slice(0, 2).map((assignee, index) => (
                                        <div key={index} className={`${styles.assigneeAvatar} ${styles.avatarStacked}`}>
                                            {assignee.avatar ? (
                                                <img
                                                    src={assignee.avatar}
                                                    alt={assignee.name}
                                                />
                                            ) : (
                                                <FaUserCircle className={styles.defaultAvatar} />
                                            )}
                                        </div>
                                    ))}
                                    {displayAssignees.length > 2 && (
                                        <div className={`${styles.assigneeAvatar} ${styles.avatarMore}`}>
                                            <span className={styles.moreCount}>+{displayAssignees.length - 2}</span>
                                        </div>
                                    )}
                                </div>
                                <div className={styles.assigneesInfo}>
                                    <div className={styles.assigneesCount}>
                                        <FaUsers className={styles.assigneesIcon} />
                                        <span>{displayAssignees.length} исполнителя</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.singleAssignee}>
                                <div className={styles.assigneeAvatar}>
                                    {displayAssignees[0].avatar ? (
                                        <img
                                            src={displayAssignees[0].avatar}
                                            alt={displayAssignees[0].name}
                                        />
                                    ) : (
                                        <FaUserCircle className={styles.defaultAvatar} />
                                    )}
                                </div>
                                <div className={styles.assigneeInfo}>
                                    <span className={styles.assigneeName}>{displayAssignees[0].name}</span>
                                    {displayAssignees[0].role && (
                                        <span className={styles.assigneeRole}>{displayAssignees[0].role}</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TaskCard