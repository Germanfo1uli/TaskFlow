'use client'

import { useEffect, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaTimes, FaSave, FaUserCircle, FaExclamationTriangle } from 'react-icons/fa'
import styles from './ModalStyles.module.css'
import { useCardMove } from '../../../hooks/useCardMove'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { editCardSchema, EditCardFormData } from './validation/schemas'
import { boardToStatusMap, priorityToApiMap } from './hooks/utils'
import { Card, Board, Author, Tag } from './types/types'
import TagSelector from './components/TagSelector'
import FileUploadArea from './components/FileUploadArea'
import BoardSelector from './components/BoardSelector'

interface EditCardModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: {
        issueId: number;
        title: string;
        description: string;
        priority: string;
        tagIds: number[];
        tagNames: string[];
    }) => Promise<void>
    card: Card | null
    boards: Board[]
    authors: Author[]
    currentBoardId: number
    projectId: number | null
    availableTags: Tag[]
    onTagCreate: (tagName: string) => Promise<Tag | null>
    refreshIssues: () => Promise<void>
}

export default function EditCardModal({
                                          isOpen,
                                          onClose,
                                          onSave,
                                          card,
                                          boards,
                                          authors,
                                          currentBoardId,
                                          projectId,
                                          availableTags,
                                          onTagCreate,
                                          refreshIssues
                                      }: EditCardModalProps) {
    const { isOwner, isLoading: isMoveLoading, moveCard } = useCardMove(projectId)

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isDirty, isSubmitting },
    } = useForm<EditCardFormData>({
        resolver: zodResolver(editCardSchema),
        defaultValues: {
            title: '',
            description: '',
            priority: 'medium',
            authorId: '',
            tags: [],
            selectedBoard: currentBoardId,
        },
    })

    const [showNewTagInput, setShowNewTagInput] = useState(false)
    const [newTagInput, setNewTagInput] = useState('')
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([])

    useEffect(() => {
        if (card && isOpen) {
            reset({
                title: card.title,
                description: card.description,
                priority: card.priority,
                authorId: card.author.name || '',
                tags: [...card.tags],
                selectedBoard: currentBoardId,
            })
        }
    }, [card, currentBoardId, isOpen, reset])

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose()
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [isOpen, onClose])

    const tags = watch('tags')
    const selectedBoard = watch('selectedBoard')

    const handleAddTag = useCallback((tagName: string) => {
        if (tags.includes(tagName)) {
            toast.error('Тег уже добавлен')
            return
        }
        if (tags.length >= 10) {
            toast.error('Максимум 10 тегов')
            return
        }
        setValue('tags', [...tags, tagName], { shouldDirty: true })
    }, [tags, setValue])

    const handleRemoveTag = useCallback((tagToRemove: string) => {
        setValue(
            'tags',
            tags.filter((t) => t !== tagToRemove),
            { shouldDirty: true }
        )
    }, [tags, setValue])

    const handleRemoveFile = useCallback((fileId: string) => {
        setUploadedFiles((prev) => {
            const file = prev.find((f) => f.id === fileId)
            if (file?.url) URL.revokeObjectURL(file.url)
            return prev.filter((f) => f.id !== fileId)
        })
        toast.success('Файл удален')
    }, [])

    const onSubmit = useCallback(
        async (data: EditCardFormData) => {
            if (!card) return

            const existingTagIds: number[] = []
            const newTagNames: string[] = []

            data.tags.forEach(tagName => {
                const existingTag = availableTags.find(tag => tag.name === tagName)
                if (existingTag) {
                    existingTagIds.push(existingTag.id)
                } else {
                    newTagNames.push(tagName)
                }
            })

            try {
                await onSave({
                    issueId: card.id,
                    title: data.title,
                    description: data.description || '',
                    priority: priorityToApiMap[data.priority] || 'MEDIUM',
                    tagIds: existingTagIds,
                    tagNames: newTagNames
                })

                if (isOwner && data.selectedBoard !== currentBoardId) {
                    const selectedBoardObj = boards.find(board => board.id === data.selectedBoard)
                    if (selectedBoardObj) {
                        const targetStatus = boardToStatusMap[selectedBoardObj.title]
                        if (targetStatus) {
                            const moved = await moveCard(card.id, targetStatus)
                            if (moved) {
                                await refreshIssues()
                            }
                        }
                    }
                }

                toast.success('Карточка успешно обновлена')
                onClose()
            } catch (error) {
                console.error('Ошибка при обновлении карточки:', error)
                toast.error('Не удалось обновить карточку')
            }
        },
        [card, availableTags, onSave, isOwner, currentBoardId, boards, moveCard, refreshIssues, onClose]
    )

    if (!isOpen || !card) return null

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    >
                        <motion.div
                            className={styles.modalContent}
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 30, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="modal-title"
                        >
                            <div className={styles.modalHeader}>
                                <h2 id="modal-title" className={styles.modalTitle}>
                                    Редактировать карточку
                                </h2>
                                <motion.button
                                    className={styles.closeButton}
                                    onClick={onClose}
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.95 }}
                                    aria-label="Закрыть"
                                >
                                    <FaTimes />
                                </motion.button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className={styles.modalForm}>
                                <div className={styles.formSection}>
                                    <label className={styles.formLabel}>
                                        <span className={styles.labelText}>Название задачи *</span>
                                        <input
                                            type="text"
                                            className={`${styles.textInput} ${errors.title ? styles.error : ''}`}
                                            {...register('title')}
                                            placeholder="Введите название задачи..."
                                            autoFocus
                                        />
                                        {errors.title && (
                                            <span className={styles.errorText}>{errors.title.message}</span>
                                        )}
                                    </label>
                                </div>

                                <div className={styles.formSection}>
                                    <label className={styles.formLabel}>
                                        <span className={styles.labelText}>Описание</span>
                                        <textarea
                                            className={styles.textarea}
                                            {...register('description')}
                                            placeholder="Опишите задачу подробнее..."
                                            rows={4}
                                        />
                                        {errors.description && (
                                            <span className={styles.errorText}>{errors.description.message}</span>
                                        )}
                                    </label>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formSection}>
                                        <label className={styles.formLabel}>
                                            <span className={styles.labelText}>
                                                <FaExclamationTriangle className={styles.labelIcon} />
                                                Приоритет
                                            </span>
                                            <select className={styles.select} {...register('priority')}>
                                                <option value="low">Низкий</option>
                                                <option value="medium">Средний</option>
                                                <option value="high">Высокий</option>
                                            </select>
                                        </label>
                                    </div>

                                    <div className={styles.formSection}>
                                        <label className={styles.formLabel}>
                                            <span className={styles.labelText}>
                                                <FaUserCircle className={styles.labelIcon} />
                                                Исполнитель (опционально)
                                            </span>
                                            <select className={styles.select} {...register('authorId')}>
                                                <option value="">Не назначено</option>
                                                {authors.map((author) => (
                                                    <option key={author.name} value={author.name}>
                                                        {author.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                    </div>
                                </div>

                                <TagSelector
                                    tags={tags}
                                    availableTags={availableTags}
                                    onAddTag={handleAddTag}
                                    onRemoveTag={handleRemoveTag}
                                    onCreateTag={onTagCreate}
                                    showNewTagInput={showNewTagInput}
                                    setShowNewTagInput={setShowNewTagInput}
                                    newTagInput={newTagInput}
                                    setNewTagInput={setNewTagInput}
                                />

                                <FileUploadArea
                                    uploadedFiles={uploadedFiles}
                                    onFilesChange={setUploadedFiles}
                                    onRemoveFile={handleRemoveFile}
                                />

                                <BoardSelector
                                    boards={boards}
                                    selectedBoard={selectedBoard}
                                    onBoardChange={(boardId) => setValue('selectedBoard', boardId, { shouldDirty: true })}
                                    isOwner={isOwner}
                                    isLoading={isMoveLoading}
                                />

                                <div className={styles.modalActions}>
                                    <motion.button
                                        type="button"
                                        className={styles.cancelButton}
                                        onClick={onClose}
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Отмена
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        className={styles.saveButton}
                                        disabled={isSubmitting || isMoveLoading || (!isDirty && uploadedFiles.length === 0)}
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <FaSave className={styles.saveIcon} />
                                        {isSubmitting || isMoveLoading ? 'Сохранение...' : 'Сохранить изменения'}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}