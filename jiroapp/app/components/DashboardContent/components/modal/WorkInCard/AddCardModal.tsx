'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaTimes, FaSave, FaUserCircle, FaExclamationTriangle } from 'react-icons/fa'
import styles from './ModalStyles.module.css'
import { useCardMove } from '../../../hooks/useCardMove'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addCardSchema, AddCardFormData } from './validation/schemas'
import { boardToStatusMap, priorityToApiMap, typeDisplayNames } from './hooks/utils'
import { Board, Author, Tag } from './types/types'
import TagSelector from './components/TagSelector'
import FileUploadArea from './components/FileUploadArea'
import BoardSelector from './components/BoardSelector'
import { api } from '@/app/auth/hooks/useTokenRefresh'

interface AddCardModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: {
        projectId: number
        title: string
        description: string
        type: string
        priority: string
        tagIds: number[]
        tagNames: string[]
    }) => Promise<number | boolean>
    boards: Board[]
    authors: Author[]
    projectId: number | null
    availableTags: Tag[]
    onTagCreate: (tagName: string) => Promise<Tag | null>
    refreshIssues: () => Promise<void>
}

export default function AddCardModal({
                                         isOpen,
                                         onClose,
                                         onSave,
                                         boards,
                                         authors,
                                         projectId,
                                         availableTags,
                                         onTagCreate,
                                         refreshIssues
                                     }: AddCardModalProps) {
    const { isOwner, isLoading: isMoveLoading, moveCard } = useCardMove(projectId)

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isDirty, isSubmitting },
    } = useForm<AddCardFormData>({
        resolver: zodResolver(addCardSchema),
        defaultValues: {
            title: '',
            description: '',
            type: 'TASK',
            priority: 'medium',
            authorId: '',
            tags: [],
            selectedBoard: boards[0]?.id || 1,
        },
    })

    useEffect(() => {
        if (isOpen) {
            reset({
                title: '',
                description: '',
                type: 'TASK',
                priority: 'medium',
                authorId: '',
                tags: [],
                selectedBoard: boards[0]?.id || 1,
            })
            setUploadedFiles([])
            setShowNewTagInput(false)
            setNewTagInput('')
        }
    }, [isOpen, authors, reset, boards])

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [isOpen, onClose])

    const [showNewTagInput, setShowNewTagInput] = useState(false)
    const [newTagInput, setNewTagInput] = useState('')
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

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

    const handleRemoveFile = useCallback((fileIndex: number) => {
        setUploadedFiles((prev) => {
            const newFiles = [...prev]
            newFiles.splice(fileIndex, 1)
            return newFiles
        })
        toast.success('Файл удален')
    }, [])

    const handleUploadFiles = async (issueId: number) => {
        if (uploadedFiles.length === 0) return

        const uploadPromises = uploadedFiles.map(async (file) => {
            const formData = new FormData()
            formData.append('file', file)

            try {
                const response = await api.post(`/issues/${issueId}/attachments`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                })
                return response.data
            } catch (error) {
                console.error('Ошибка при загрузке файла:', error)
                toast.error(`Не удалось загрузить файл ${file.name}`)
                return null
            }
        })

        const results = await Promise.all(uploadPromises)
        const successfulUploads = results.filter(result => result !== null)

        if (successfulUploads.length > 0) {
            toast.success(`Загружено ${successfulUploads.length} файл(ов)`)
        }
    }

    const onSubmit = useCallback(
        async (data: AddCardFormData) => {
            if (!projectId) {
                toast.error('Не выбран проект')
                return
            }

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
                const issueId = await onSave({
                    projectId,
                    title: data.title,
                    description: data.description || '',
                    type: data.type,
                    priority: priorityToApiMap[data.priority] || 'MEDIUM',
                    tagIds: existingTagIds,
                    tagNames: newTagNames
                })

                if (issueId && typeof issueId === 'number') {
                    const selectedBoardObj = boards.find(board => board.id === data.selectedBoard)
                    if (selectedBoardObj && isOwner) {
                        const targetStatus = boardToStatusMap[selectedBoardObj.title]
                        if (targetStatus && targetStatus !== 'TO_DO') {
                            await moveCard(issueId, targetStatus)
                            await refreshIssues()
                        }
                    }

                    // Upload files after card creation
                    if (uploadedFiles.length > 0) {
                        await handleUploadFiles(issueId)
                    }
                }

                toast.success('Карточка успешно создана')
                onClose()
            } catch (error) {
                console.error('Ошибка при создании задачи:', error)
                toast.error('Не удалось создать карточку')
            }
        },
        [projectId, availableTags, uploadedFiles, onSave, boards, isOwner, moveCard, refreshIssues, onClose]
    )

    if (!isOpen) return null

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
                                    Создать новую карточку
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
                                            <span className={styles.labelText}>Тип задачи</span>
                                            <select className={styles.select} {...register('type')}>
                                                {Object.entries(typeDisplayNames).map(([value, label]) => (
                                                    <option key={value} value={value}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                    </div>
                                </div>

                                <div className={styles.formRow}>
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
                                        {isSubmitting || isMoveLoading ? 'Создание...' : 'Создать карточку'}
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