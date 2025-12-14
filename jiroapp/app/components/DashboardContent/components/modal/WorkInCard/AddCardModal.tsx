'use client'

import { useEffect, useCallback, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { z } from 'zod'
import {
    FaTimes,
    FaSave,
    FaUserCircle,
    FaTag,
    FaExclamationTriangle,
    FaPaperclip,
    FaTrash,
    FaCloudUploadAlt,
    FaFile,
    FaFilePdf,
    FaFileWord,
    FaFileExcel,
    FaCode,
    FaImage,
    FaPlus
} from 'react-icons/fa'
import styles from './ModalStyles.module.css'
import { useCardMove } from '../../../hooks/useCardMove'
type Priority = 'low' | 'medium' | 'high'
type TaskType = 'TASK' | 'BUG' | 'EPIC' | 'STORY'

interface Author {
    name: string
    avatar: string | null
}

interface Board {
    id: number
    title: string
    color: string
}

interface UploadedFile {
    id: string
    name: string
    size: number
    type: string
    url: string
    preview?: string
}

interface Tag {
    id: number
    projectId: number
    name: string
}

const schema = z.object({
    title: z.string().min(1, 'Название задачи обязательно').max(200, 'Слишком длинное название'),
    description: z.string().max(2000, 'Описание слишком длинное').optional(),
    type: z.enum(['TASK', 'BUG', 'EPIC', 'STORY']),
    priority: z.enum(['low', 'medium', 'high']),
    authorId: z.string().optional(),
    tags: z.array(z.string()).max(10, 'Максимум 10 тегов'),
    selectedBoard: z.number().min(1, 'Выберите доску'),
})

type FormData = z.infer<typeof schema>

interface AddCardModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: {
        projectId: number
        title: string
        description: string
        type: TaskType
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

// Маппинг досок на статусы API
const boardToStatusMap: Record<string, string> = {
    'TO DO': 'TO_DO',
    'SELECTED FOR DEVELOPMENT': 'SELECTED_FOR_DEVELOPMENT',
    'IN PROGRESS': 'IN_PROGRESS',
    'CODE REVIEW': 'CODE_REVIEW',
    'QA': 'QA',
    'STAGING': 'STAGING',
    'DONE': 'DONE'
};

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
    const { isOwner, isLoading: isMoveLoading, moveCard } = useCardMove(projectId);
    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors, isDirty, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
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

    const tags = watch('tags')
    const selectedBoard = watch('selectedBoard')
    const [showNewTagInput, setShowNewTagInput] = useState(false)
    const [newTagInput, setNewTagInput] = useState('')

    const handleAddExistingTag = useCallback((tagName: string) => {
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

    const handleAddNewTag = useCallback(async () => {
        const trimmed = newTagInput.trim()
        if (!trimmed) {
            toast.error('Введите название тега')
            return
        }
        if (tags.includes(trimmed)) {
            toast.error('Тег уже добавлен')
            return
        }
        if (availableTags.some(tag => tag.name === trimmed)) {
            toast.error('Такой тег уже существует')
            return
        }
        if (tags.length >= 10) {
            toast.error('Максимум 10 тегов')
            return
        }

        try {
            const newTag = await onTagCreate(trimmed)
            if (newTag) {
                setValue('tags', [...tags, newTag.name], { shouldDirty: true })
                setNewTagInput('')
                setShowNewTagInput(false)
                toast.success('Тег создан и добавлен')
            }
        } catch (error) {
            toast.error('Ошибка при создания тега')
        }
    }, [newTagInput, tags, availableTags, onTagCreate, setValue])

    const handleRemoveTag = useCallback((tagToRemove: string) => {
        setValue(
            'tags',
            tags.filter((t) => t !== tagToRemove),
            { shouldDirty: true }
        )
    }, [tags, setValue])

    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles: UploadedFile[] = acceptedFiles.map((file) => {
            const fileId = Math.random().toString(36).substring(2, 11)
            const fileUrl = URL.createObjectURL(file)
            return {
                id: fileId,
                name: file.name,
                size: file.size,
                type: file.type,
                url: fileUrl,
                preview: file.type.startsWith('image/') ? fileUrl : undefined,
            }
        })
        setUploadedFiles((prev) => [...prev, ...newFiles])
        toast.success(`Добавлено ${newFiles.length} файл(ов)`)
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 10,
        maxSize: 50 * 1024 * 1024,
        onDropRejected: (fileRejections) => {
            fileRejections.forEach((rejection) => {
                rejection.errors.forEach((error) => {
                    if (error.code === 'file-too-large') {
                        toast.error('Файл слишком большой (макс. 50MB)')
                    } else {
                        toast.error(error.message)
                    }
                })
            })
        },
    })

    const handleRemoveFile = useCallback((fileId: string) => {
        setUploadedFiles((prev) => {
            const file = prev.find((f) => f.id === fileId)
            if (file?.url) URL.revokeObjectURL(file.url)
            return prev.filter((f) => f.id !== fileId)
        })
        toast.success('Файл удален')
    }, [])

    const formatFileSize = useCallback((bytes: number): string => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
    }, [])

    const getFileIcon = useCallback((fileType: string) => {
        if (fileType.includes('pdf')) return <FaFilePdf className={styles.fileIconPdf} />
        if (fileType.includes('word') || fileType.includes('document'))
            return <FaFileWord className={styles.fileIconWord} />
        if (fileType.includes('excel') || fileType.includes('spreadsheet'))
            return <FaFileExcel className={styles.fileIconExcel} />
        if (fileType.includes('zip') || fileType.includes('archive'))
            return <FaFile className={styles.fileIconDefault} />
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
    }, [])

    const priorityToApiMap: Record<string, string> = {
        'low': 'LOW',
        'medium': 'MEDIUM',
        'high': 'HIGH'
    }

    const typeDisplayNames: Record<TaskType, string> = {
        'TASK': 'Задача',
        'BUG': 'Ошибка',
        'EPIC': 'Эпик',
        'STORY': 'История'
    }

    const onSubmit = useCallback(
        async (data: FormData) => {
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
                // Создаем задачу
                const issueId = await onSave({
                    projectId,
                    title: data.title,
                    description: data.description || '',
                    type: data.type,
                    priority: priorityToApiMap[data.priority] || 'MEDIUM',
                    tagIds: existingTagIds,
                    tagNames: newTagNames
                });

                if (issueId && typeof issueId === 'number') {
                    // Получаем выбранную доску
                    const selectedBoardObj = boards.find(board => board.id === data.selectedBoard);
                    if (selectedBoardObj && isOwner) {
                        // Преобразуем название доски в статус API
                        const targetStatus = boardToStatusMap[selectedBoardObj.title];
                        if (targetStatus && targetStatus !== 'TO_DO') {
                            // Перемещаем задачу в выбранный статус
                            await moveCard(issueId, targetStatus);
                            await refreshIssues();
                        }
                    }
                }

                if (uploadedFiles.length > 0) {
                    toast.info(`Загружено ${uploadedFiles.length} файл(ов) (заглушка)`)
                }

                toast.success('Карточка успешно создана');
                onClose();
            } catch (error) {
                console.error('Ошибка при создании задачи:', error);
                toast.error('Не удалось создать карточку');
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

                                <div className={styles.formSection}>
                                    <label className={styles.formLabel}>
                                        <span className={styles.labelText}>
                                            <FaTag className={styles.labelIcon} />
                                            Теги
                                        </span>
                                        <div className={styles.tagsWrapper}>
                                            <div className={styles.tagsSelection}>
                                                <div className={styles.existingTags}>
                                                    <select
                                                        value=""
                                                        onChange={(e) => {
                                                            if (e.target.value) {
                                                                handleAddExistingTag(e.target.value)
                                                                e.target.value = ''
                                                            }
                                                        }}
                                                        className={styles.select}
                                                    >
                                                        <option value="">Выберите существующий тег</option>
                                                        {availableTags.map(tag => (
                                                            <option key={tag.id} value={tag.name}>
                                                                {tag.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {!showNewTagInput ? (
                                                    <motion.button
                                                        type="button"
                                                        className={styles.addNewTagBtn}
                                                        onClick={() => setShowNewTagInput(true)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <FaPlus /> Новый тег
                                                    </motion.button>
                                                ) : (
                                                    <div className={styles.newTagInputWrapper}>
                                                        <input
                                                            type="text"
                                                            value={newTagInput}
                                                            onChange={(e) => setNewTagInput(e.target.value)}
                                                            placeholder="Введите новый тег"
                                                            className={styles.textInput}
                                                            onKeyPress={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault()
                                                                    handleAddNewTag()
                                                                }
                                                            }}
                                                        />
                                                        <div className={styles.newTagActions}>
                                                            <motion.button
                                                                type="button"
                                                                className={styles.confirmNewTagBtn}
                                                                onClick={handleAddNewTag}
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                            >
                                                                Добавить
                                                            </motion.button>
                                                            <motion.button
                                                                type="button"
                                                                className={styles.cancelNewTagBtn}
                                                                onClick={() => {
                                                                    setShowNewTagInput(false)
                                                                    setNewTagInput('')
                                                                }}
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                            >
                                                                Отмена
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className={styles.selectedTags}>
                                                {tags.map((tag, index) => (
                                                    <motion.span
                                                        key={index}
                                                        className={styles.tag}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.8 }}
                                                        transition={{ delay: index * 0.05 }}
                                                    >
                                                        {tag}
                                                        <motion.button
                                                            type="button"
                                                            className={styles.removeTagButton}
                                                            onClick={() => handleRemoveTag(tag)}
                                                            whileHover={{ scale: 1.2, rotate: 90 }}
                                                        >
                                                            ×
                                                        </motion.button>
                                                    </motion.span>
                                                ))}
                                            </div>
                                        </div>
                                        {errors.tags && (
                                            <span className={styles.errorText}>{errors.tags.message}</span>
                                        )}
                                    </label>
                                </div>

                                <div className={styles.formSection}>
                                    <label className={styles.formLabel}>
                                        <span className={styles.labelText}>
                                            <FaPaperclip className={styles.labelIcon} />
                                            Прикрепленные файлы
                                        </span>

                                        <motion.div
                                            {...getRootProps()}
                                            className={`${styles.fileUploadArea} ${isDragActive ? styles.dragActive : ''}`}
                                            whileHover={{ y: -2 }}
                                        >
                                            <input {...getInputProps()} />
                                            <div className={styles.uploadPlaceholder}>
                                                <FaCloudUploadAlt className={styles.uploadIcon} />
                                                <div className={styles.uploadText}>
                                                    <p>{isDragActive ? 'Отпустите файлы' : 'Перетащите файлы сюда или нажмите'}</p>
                                                    <span>Макс. 50MB, до 10 файлов</span>
                                                </div>
                                            </div>
                                        </motion.div>

                                        <AnimatePresence>
                                            {uploadedFiles.length > 0 && (
                                                <motion.div
                                                    className={styles.uploadedFiles}
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                >
                                                    <h4 className={styles.filesTitle}>
                                                        Прикрепленные файлы ({uploadedFiles.length})
                                                    </h4>
                                                    <div className={styles.filesList}>
                                                        {uploadedFiles.map((file, index) => (
                                                            <motion.div
                                                                key={file.id}
                                                                className={styles.fileItem}
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                exit={{ opacity: 0, x: 20 }}
                                                                transition={{ delay: index * 0.05 }}
                                                            >
                                                                <div className={styles.fileInfo}>
                                                                    <div className={styles.fileIcon}>{getFileIcon(file.type)}</div>
                                                                    <div className={styles.fileDetails}>
                                                                        <span className={styles.fileName}>{file.name}</span>
                                                                        <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
                                                                    </div>
                                                                </div>
                                                                <motion.button
                                                                    type="button"
                                                                    className={styles.removeFileButton}
                                                                    onClick={() => handleRemoveFile(file.id)}
                                                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                >
                                                                    <FaTrash />
                                                                </motion.button>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </label>
                                </div>

                                <div className={styles.formSection}>
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
                                                        onChange={(e) => setValue('selectedBoard', parseInt(e.target.value), { shouldDirty: true })}
                                                        className={styles.boardRadio}
                                                        disabled={!isOwner && isMoveLoading}
                                                    />
                                                    <span className={styles.boardRadioCustom}></span>
                                                    <span className={styles.boardTitle}>{board.title}</span>
                                                    {!isOwner && (
                                                        <span className={styles.boardLockedInfo}>
                                                            (только для владельца)
                                                        </span>
                                                    )}
                                                </motion.label>
                                            ))}
                                        </div>
                                        {errors.selectedBoard && (
                                            <span className={styles.errorText}>
                                                {errors.selectedBoard.message}
                                            </span>
                                        )}
                                    </label>
                                </div>

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