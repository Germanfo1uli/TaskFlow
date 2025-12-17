'use client'

import { useEffect, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaTimes, FaSave, FaUserCircle, FaExclamationTriangle, FaTrash, FaFile, FaFilePdf, FaFileWord, FaFileExcel, FaCode, FaImage } from 'react-icons/fa'
import styles from './ModalStyles.module.css'
import { useCardMove } from '../../../hooks/useCardMove'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { editCardSchema, EditCardFormData } from './validation/schemas'
import { boardToStatusMap, priorityToApiMap } from './hooks/utils'
import { Card, Board, Author } from '../../../types/dashboard.types'
import { Tag } from './types/types'
import TagSelector from './components/TagSelector'
import FileUploadArea from './components/FileUploadArea'
import BoardSelector from './components/BoardSelector'
import { api } from '@/app/auth/hooks/useTokenRefresh'

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
        assigneeId?: number;
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

const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FaFilePdf className={styles.fileIconPdf} />
    if (fileType.includes('word') || fileType.includes('document'))
        return <FaFileWord className={styles.fileIconWord} />
    if (fileType.includes('excel') || fileType.includes('spreadsheet'))
        return <FaFileExcel className={styles.fileIconExcel} />
    if (fileType.includes('image')) return <FaImage className={styles.fileIconDesign} />
    if (
        fileType.includes('text') ||
        fileType.includes('json') ||
        fileType.includes('xml') ||
        fileType.includes('html') ||
        fileType.includes('css') ||
        fileType.includes('javascript')
    )
        return <FaCode className={styles.fileIconCode} />
    return <FaFile className={styles.fileIconDefault} />
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
        getValues,
        formState: { errors, isDirty, isSubmitting },
    } = useForm<EditCardFormData>({
        resolver: zodResolver(editCardSchema),
        defaultValues: {
            title: '',
            description: '',
            priority: 'medium',
            assigneeId: '',
            tags: [],
            selectedBoard: currentBoardId,
        },
    })

    const [showNewTagInput, setShowNewTagInput] = useState(false)
    const [newTagInput, setNewTagInput] = useState('')
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
    const [existingAttachments, setExistingAttachments] = useState<any[]>([])
    const [currentAssigneeId, setCurrentAssigneeId] = useState<number | null>(null)

    useEffect(() => {
        if (card && isOpen) {
            const mainAssignee = card.assignees?.find(a => a.role === 'Исполнитель' || !a.role) || card.assignees?.[0];
            const currentAssignee = mainAssignee?.id || null;

            reset({
                title: card.title,
                description: card.description,
                priority: card.priority,
                assigneeId: currentAssignee?.toString() || '',
                tags: [...card.tags],
                selectedBoard: currentBoardId,
            })

            setCurrentAssigneeId(currentAssignee);
            setExistingAttachments(card.attachmentsList || [])
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
    const assigneeId = watch('assigneeId')

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

    const handleRemoveExistingAttachment = useCallback(async (attachmentId: string) => {
        if (!card) return

        try {
            await api.delete(`/issues/${card.id}/attachments/${attachmentId}`)
            setExistingAttachments(prev => prev.filter(att => att.id !== attachmentId))
            toast.success('Файл удален')
        } catch (error) {
            toast.error('Не удалось удалить файл')
        }
    }, [card])

    const handleAssignAssignee = useCallback(async (issueId: number, userId: number | null, currentAssigneeId?: number | null) => {
        try {
            if (currentAssigneeId && currentAssigneeId !== userId) {
                try {
                    await api.delete(`/issues/${issueId}/assignees`, {
                        data: { type: "ASSIGNEE" }
                    });
                } catch (deleteError: any) {
                    console.warn(deleteError);
                }
            }

            try {
                await api.delete(`/issues/${issueId}/assignees`, {
                    data: {
                        type: "ASSIGNEE"
                    }
                });
            } catch (error) {
                console.log('Старый исполнитель не найден или уже удален');
            }

            if (userId && userId > 0) {
                await api.post(`/issues/${issueId}/assignees`, {
                    userId: userId,
                    type: "ASSIGNEE"
                });
            }

            return true;
        } catch (error: any) {
            toast.error('Не удалось обновить исполнителя');
            throw error;
        }
    }, []);

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
        async (data: EditCardFormData) => {
            if (!card) return

            if (authors.length === 0) {
                toast.error('Не удалось загрузить список пользователей');
                return;
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
                const getAssigneeIdFromForm = (assigneeIdValue: string): number | null => {
                    if (!assigneeIdValue || assigneeIdValue === '' || assigneeIdValue === 'undefined') {
                        return null;
                    }

                    const id = parseInt(assigneeIdValue, 10);
                    return isNaN(id) ? null : id;
                };

                const newAssigneeId = getAssigneeIdFromForm(data.assigneeId);

                if (newAssigneeId !== currentAssigneeId) {
                    await handleAssignAssignee(card.id, newAssigneeId, currentAssigneeId);
                }

                await onSave({
                    issueId: card.id,
                    title: data.title,
                    description: data.description || '',
                    priority: priorityToApiMap[data.priority] || 'MEDIUM',
                    tagIds: existingTagIds,
                    tagNames: newTagNames,
                    assigneeId: newAssigneeId
                })

                if (uploadedFiles.length > 0) {
                    await handleUploadFiles(card.id)
                }

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
                toast.error('Не удалось обновить карточку')
            }
        },
        [card, availableTags, uploadedFiles, onSave, isOwner, currentBoardId, boards, moveCard, refreshIssues, onClose, authors, handleAssignAssignee, currentAssigneeId, getValues]
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
                                            <select
                                                className={styles.select}
                                                {...register('assigneeId')}
                                                onChange={(e) => {
                                                    setValue('assigneeId', e.target.value, { shouldDirty: true, shouldValidate: true });
                                                }}
                                            >
                                                <option value="">Не назначено</option>
                                                {authors.map((author, index) => (
                                                    <option
                                                        key={`author-${author.id || index}`}
                                                        value={author.id?.toString() || '0'}
                                                    >
                                                        {author.name} (ID: {author.id})
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

                                {existingAttachments.length > 0 && (
                                    <div className={styles.formSection}>
                                        <label className={styles.formLabel}>
                                            <span className={styles.labelText}>Существующие файлы</span>
                                            <div className={styles.filesList}>
                                                {existingAttachments.map((file, index) => (
                                                    <div key={file.id} className={styles.fileItem}>
                                                        <div className={styles.fileInfo}>
                                                            <div className={styles.fileIcon}>{getFileIcon(file.type)}</div>
                                                            <div className={styles.fileDetails}>
                                                                <span className={styles.fileName}>{file.name}</span>
                                                                <span className={styles.fileSize}>{file.size}</span>
                                                            </div>
                                                        </div>
                                                        <motion.button
                                                            type="button"
                                                            className={styles.removeFileButton}
                                                            onClick={() => handleRemoveExistingAttachment(file.id)}
                                                            whileHover={{ scale: 1.1, rotate: 90 }}
                                                            whileTap={{ scale: 0.9 }}
                                                        >
                                                            <FaTrash />
                                                        </motion.button>
                                                    </div>
                                                ))}
                                            </div>
                                        </label>
                                    </div>
                                )}

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
                                        disabled={isSubmitting || isMoveLoading}
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