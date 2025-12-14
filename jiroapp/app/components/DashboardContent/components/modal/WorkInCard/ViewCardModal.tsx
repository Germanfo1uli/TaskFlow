'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    FaTimes,
    FaUserCircle,
    FaPaperclip,
    FaDownload,
    FaRegComment,
    FaCalendar,
    FaTag,
    FaFlag,
    FaRegFlag,
    FaArrowUp,
    FaArrowDown,
    FaEdit,
    FaFilePdf,
    FaFileImage,
    FaFileAlt,
    FaFileCode,
    FaDatabase,
    FaCog,
    FaClock,
    FaPaperPlane,
    FaUsers,
    FaBriefcase
} from 'react-icons/fa'
import { Card, Board, Comment, Author, Attachment } from '../../../types/dashboard.types'
import styles from './ViewCardModal.module.css'
import { api } from '@/app/auth/hooks/useTokenRefresh'

interface ViewCardModalProps {
    isOpen: boolean
    onClose: () => void
    card: Card
    board: Board | undefined
    getPriorityColor: (priority: string) => string
    onAddComment?: (cardId: number, comment: Comment) => void
    assignees?: Author[]
}

const ViewCardModal = ({ isOpen, onClose, card, board, getPriorityColor, onAddComment, assignees }: ViewCardModalProps) => {
    const [newComment, setNewComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const modalContentRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (!modalContentRef.current) return

            const modalContent = modalContentRef.current
            const isScrollingModal = modalContent.contains(e.target as Node)

            if (isScrollingModal) {
                e.stopPropagation()
            }
        }

        if (isOpen) {
            document.addEventListener('wheel', handleWheel, { passive: false })
        }

        return () => {
            document.removeEventListener('wheel', handleWheel)
        }
    }, [isOpen])

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'high':
                return <FaFlag className={styles.priorityIcon} style={{ color: '#ef4444' }} />
            case 'medium':
                return <FaFlag className={styles.priorityIcon} style={{ color: '#f59e0b' }} />
            case 'low':
                return <FaRegFlag className={styles.priorityIcon} style={{ color: '#10b981' }} />
            default:
                return <FaRegFlag className={styles.priorityIcon} />
        }
    }

    const getFileIcon = (fileType: string) => {
        if (fileType.includes('pdf')) return <FaFilePdf className={styles.fileTypeIcon} style={{ color: '#ef4444' }} />
        if (fileType.includes('image')) return <FaFileImage className={styles.fileTypeIcon} style={{ color: '#8b5cf6' }} />
        if (fileType.includes('yaml') || fileType.includes('json') || fileType.includes('xml'))
            return <FaFileCode className={styles.fileTypeIcon} style={{ color: '#3b82f6' }} />
        if (fileType.includes('markdown') || fileType.includes('text'))
            return <FaFileAlt className={styles.fileTypeIcon} style={{ color: '#64748b' }} />
        if (fileType.includes('sql')) return <FaDatabase className={styles.fileTypeIcon} style={{ color: '#10b981' }} />
        return <FaFileAlt className={styles.fileTypeIcon} style={{ color: '#6b7280' }} />
    }

    const handleDownload = async (attachment: Attachment) => {
        try {
            const response = await api.get(attachment.url, {
                responseType: 'blob'
            })

            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', attachment.name)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Ошибка при скачивании файла:', error)
        }
    }

    const handleAddComment = async () => {
        if (!newComment.trim() || isSubmitting) return

        setIsSubmitting(true)

        const newCommentObj: Comment = {
            id: Date.now(),
            author: { name: 'Текущий пользователь', avatar: null, role: 'Пользователь' },
            content: newComment.trim(),
            createdAt: new Date().toLocaleString('ru-RU', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
        }

        if (onAddComment) {
            onAddComment(card.id, newCommentObj)
        }

        setNewComment('')
        setIsSubmitting(false)

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleAddComment()
        }
    }

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewComment(e.target.value)
        e.target.style.height = 'auto'
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
    }

    const handleEditClick = () => {
        console.log('Edit card clicked')
    }

    const displayAssignees = assignees || [card.author]

    if (!isOpen) return null

    return (
        <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                ref={modalContentRef}
                className={styles.modalContent}
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.modalHeader}>
                    <div className={styles.headerMain}>
                        <div className={styles.titleRow}>
                            {getPriorityIcon(card.priority)}
                            <h2 className={styles.modalTitle}>{card.title}</h2>
                            <div className={styles.statusBadge}>
                                <span className={styles.boardBadge} style={{ backgroundColor: board?.color || '#3b82f6' }}>
                                    {board?.title || 'Неизвестно'}
                                </span>
                            </div>
                        </div>

                        <div className={styles.metaInfo}>
                            <div className={styles.metaItem}>
                                <FaUsers className={styles.metaIcon} />
                                <span className={styles.metaText}>{displayAssignees.length} исполнителя</span>
                            </div>
                            <div className={styles.metaItem}>
                                <FaCalendar className={styles.metaIcon} />
                                <span className={styles.metaText}>
                                    {card.createdAt || 'Дата не указана'}
                                </span>
                            </div>
                            <div className={styles.metaItem}>
                                <FaRegComment className={styles.metaIcon} />
                                <span className={styles.metaText}>{card.comments} комментариев</span>
                            </div>
                            <div className={styles.metaItem}>
                                <FaPaperclip className={styles.metaIcon} />
                                <span className={styles.metaText}>{card.attachments} файлов</span>
                            </div>
                        </div>
                    </div>

                    <button className={styles.closeButton} onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className={styles.cardPriorityBar} style={{ backgroundColor: getPriorityColor(card.priority) }}></div>

                <div className={styles.modalBody}>
                    <div className={styles.contentGrid}>
                        <div className={styles.mainContent}>
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>Описание</h3>
                                <div className={styles.descriptionBox}>
                                    <p className={styles.cardDescription}>{card.description}</p>
                                </div>
                            </div>

                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>Теги</h3>
                                <div className={styles.tagsContainer}>
                                    {card.tags.map((tag, index) => (
                                        <span key={index} className={styles.tag}>
                                            <FaTag className={styles.tagIcon} />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>
                                    <FaRegComment className={styles.sectionIcon} />
                                    Комментарии ({card.comments})
                                </h3>
                                <div className={styles.commentsSection}>
                                    <div className={styles.commentsList}>
                                        {card.commentsList && card.commentsList.length > 0 ? (
                                            card.commentsList.map((comment) => (
                                                <div key={comment.id} className={styles.commentItem}>
                                                    <div className={styles.commentHeader}>
                                                        <div className={styles.commentAuthor}>
                                                            <div className={styles.commentAvatar}>
                                                                {comment.author.avatar ? (
                                                                    <img
                                                                        src={comment.author.avatar}
                                                                        alt={comment.author.name}
                                                                    />
                                                                ) : (
                                                                    <FaUserCircle />
                                                                )}
                                                            </div>
                                                            <div className={styles.commentAuthorInfo}>
                                                                <span className={styles.commentAuthorName}>{comment.author.name}</span>
                                                                {comment.author.role && (
                                                                    <span className={styles.commentAuthorRole}>
                                                                        <FaBriefcase className={styles.roleIcon} />
                                                                        {comment.author.role}
                                                                    </span>
                                                                )}
                                                                <span className={styles.commentDate}>{comment.createdAt}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={styles.commentContent}>
                                                        <p>{comment.content}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className={styles.noComments}>
                                                <FaRegComment className={styles.noCommentsIcon} />
                                                <p>Пока нет комментариев. Будьте первым!</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.addCommentSection}>
                                        <div className={styles.commentInputContainer}>
                                            <textarea
                                                ref={textareaRef}
                                                className={styles.commentInput}
                                                placeholder="Напишите комментарий..."
                                                value={newComment}
                                                onChange={handleTextareaChange}
                                                onKeyPress={handleKeyPress}
                                                rows={3}
                                                maxLength={1000}
                                            />
                                            <div className={styles.commentActions}>
                                                <span className={styles.charCount}>
                                                    {newComment.length}/1000
                                                </span>
                                                <button
                                                    className={`${styles.sendButton} ${!newComment.trim() || isSubmitting ? styles.disabled : ''}`}
                                                    onClick={handleAddComment}
                                                    disabled={!newComment.trim() || isSubmitting}
                                                >
                                                    {isSubmitting ? (
                                                        <FaClock className={styles.sendIcon} />
                                                    ) : (
                                                        <FaPaperPlane className={styles.sendIcon} />
                                                    )}
                                                    Отправить
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.sidebar}>
                            <div className={styles.sidebarSection}>
                                <h3 className={styles.sidebarTitle}>
                                    <FaUsers className={styles.sidebarIcon} />
                                    Исполнители ({displayAssignees.length})
                                </h3>
                                <div className={styles.assigneesCompact}>
                                    {displayAssignees.map((assignee, index) => (
                                        <div key={index} className={styles.assigneeItem}>
                                            <div className={styles.assigneeAvatarCompact}>
                                                {assignee.avatar ? (
                                                    <img
                                                        src={assignee.avatar}
                                                        alt={assignee.name}
                                                    />
                                                ) : (
                                                    <FaUserCircle className={styles.defaultAvatar} />
                                                )}
                                            </div>
                                            <div className={styles.assigneeInfoCompact}>
                                                <span className={styles.assigneeNameCompact}>{assignee.name}</span>
                                                {assignee.role && (
                                                    <span className={styles.assigneeRoleCompact}>
                                                        <FaBriefcase className={styles.roleIconCompact} />
                                                        {assignee.role}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.sidebarSection}>
                                <h3 className={styles.sidebarTitle}>
                                    <FaPaperclip className={styles.sidebarIcon} />
                                    Прикрепленные файлы
                                </h3>
                                <div className={styles.attachmentsCompact}>
                                    {card.attachmentsList && card.attachmentsList.length > 0 ? (
                                        card.attachmentsList.map((file) => (
                                            <div key={file.id} className={styles.fileItemCompact}>
                                                <div className={styles.fileIconCompact}>
                                                    {getFileIcon(file.type)}
                                                </div>
                                                <div className={styles.fileInfoCompact}>
                                                    <span className={styles.fileNameCompact} title={file.name}>
                                                        {file.name}
                                                    </span>
                                                    <span className={styles.fileSizeCompact}>{file.size}</span>
                                                </div>
                                                <button
                                                    className={styles.downloadButtonCompact}
                                                    onClick={() => handleDownload(file)}
                                                    title="Скачать"
                                                >
                                                    <FaDownload />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className={styles.noFilesCompact}>
                                            <FaPaperclip />
                                            <span>Нет файлов</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.sidebarSection}>
                                <h3 className={styles.sidebarTitle}>
                                    <FaCog className={styles.sidebarIcon} />
                                    Детали задачи
                                </h3>
                                <div className={styles.taskDetails}>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Приоритет:</span>
                                        <div className={styles.detailValue}>
                                            <span className={styles.priorityBadge} style={{
                                                backgroundColor: getPriorityColor(card.priority) + '20',
                                                color: getPriorityColor(card.priority)
                                            }}>
                                                {getPriorityIcon(card.priority)}
                                                {card.priority === 'high' && 'Высокий'}
                                                {card.priority === 'medium' && 'Средний'}
                                                {card.priority === 'low' && 'Низкий'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Уровень:</span>
                                        <span className={styles.detailValue}>
                                            {card.priorityLevel}/3
                                            {card.priorityLevel === 3 && <FaArrowUp className={styles.priorityArrow} />}
                                            {card.priorityLevel === 2 && <FaArrowUp className={styles.priorityArrow} style={{ transform: 'rotate(45deg)' }} />}
                                            {card.priorityLevel === 1 && <FaArrowDown className={styles.priorityArrow} />}
                                        </span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>ID карточки:</span>
                                        <span className={styles.detailValue}>#{card.id}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Статус:</span>
                                        <span className={styles.detailValue}>
                                            {board?.title || 'Неизвестно'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.editButton} onClick={handleEditClick}>
                        <FaEdit />
                        Редактировать
                    </button>
                    <button className={styles.closeModalBtn} onClick={onClose}>
                        Закрыть
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default ViewCardModal