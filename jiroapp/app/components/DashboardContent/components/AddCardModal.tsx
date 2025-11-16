'use client'

import { JSX, useState, useRef } from 'react'
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
    FaImage
} from 'react-icons/fa'
import styles from './AddCardModal.module.css'

type Priority = 'low' | 'medium' | 'high'

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

interface AddCardModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (cardData: any) => void
    boards: Board[]
    authors: Author[]
}

const AddCardModal = ({ isOpen, onClose, onSave, boards, authors }: AddCardModalProps) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium' as Priority,
        authorId: authors[0]?.name || '',
        tags: [] as string[],
        selectedBoards: [] as number[],
    })
    const [currentTag, setCurrentTag] = useState('')
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleBoardToggle = (boardId: number) => {
        setFormData(prev => ({
            ...prev,
            selectedBoards: prev.selectedBoards.includes(boardId)
                ? prev.selectedBoards.filter(id => id !== boardId)
                : [...prev.selectedBoards, boardId]
        }))
    }

    const addTag = () => {
        if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, currentTag.trim()]
            }))
            setCurrentTag('')
        }
    }

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }))
    }

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (!files) return

        const newFiles: UploadedFile[] = []

        Array.from(files).forEach(file => {
            const fileId = Math.random().toString(36).substr(2, 9)
            const fileUrl = URL.createObjectURL(file)

            const uploadedFile: UploadedFile = {
                id: fileId,
                name: file.name,
                size: file.size,
                type: file.type,
                url: fileUrl
            }

            if (file.type.startsWith('image/')) {
                uploadedFile.preview = fileUrl
            }

            newFiles.push(uploadedFile)
        })

        setUploadedFiles(prev => [...prev, ...newFiles])

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const removeFile = (fileId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        const fileToRemove = uploadedFiles.find(file => file.id === fileId)
        if (fileToRemove?.url) {
            URL.revokeObjectURL(fileToRemove.url)
        }
        setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
    }

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const getFileIcon = (fileType: string): JSX.Element => {
        if (fileType.includes('pdf')) return <FaFilePdf className={styles.fileIconPdf} />
        if (fileType.includes('word') || fileType.includes('document')) return <FaFileWord className={styles.fileIconWord} />
        if (fileType.includes('excel') || fileType.includes('spreadsheet')) return <FaFileExcel className={styles.fileIconExcel} />
        if (fileType.includes('zip') || fileType.includes('archive')) return <FaFile className={styles.fileIconDefault} />
        if (fileType.includes('image')) return <FaImage className={styles.fileIconDesign} />
        if (fileType.includes('text') || fileType.includes('json') || fileType.includes('xml') ||
            fileType.includes('html') || fileType.includes('css') || fileType.includes('javascript')) {
            return <FaCode className={styles.fileIconCode} />
        }
        return <FaFile className={styles.fileIconDefault} />
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.title.trim() || formData.selectedBoards.length === 0) {
            return
        }

        const selectedAuthor = authors.find(author => author.name === formData.authorId) || authors[0]

        const newCard = {
            id: Date.now(),
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            priorityLevel: formData.priority === 'high' ? 3 : formData.priority === 'medium' ? 2 : 1,
            author: selectedAuthor,
            tags: formData.tags,
            progress: 0,
            comments: 0,
            attachments: uploadedFiles.length
        }

        onSave({
            card: newCard,
            boardIds: formData.selectedBoards,
            files: uploadedFiles
        })

        setFormData({
            title: '',
            description: '',
            priority: 'medium',
            authorId: authors[0]?.name || '',
            tags: [],
            selectedBoards: [],
        })
        setUploadedFiles([])
        onClose()
    }

    const getPriorityColor = (priority: Priority): string => {
        const colors: Record<Priority, string> = {
            low: '#10b981',
            medium: '#f59e0b',
            high: '#ef4444'
        }
        return colors[priority] || '#6b7280'
    }

    if (!isOpen) return null

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Создать новую карточку</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.formSection}>
                        <label className={styles.formLabel}>
                            <span className={styles.labelText}>Название задачи *</span>
                            <input
                                type="text"
                                className={styles.textInput}
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                placeholder="Введите название задачи..."
                                required
                            />
                        </label>
                    </div>

                    <div className={styles.formSection}>
                        <label className={styles.formLabel}>
                            <span className={styles.labelText}>Описание</span>
                            <textarea
                                className={styles.textarea}
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Опишите задачу подробнее..."
                                rows={4}
                            />
                        </label>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formSection}>
                            <label className={styles.formLabel}>
                                <span className={styles.labelText}>
                                    <FaExclamationTriangle className={styles.labelIcon} />
                                    Приоритет
                                </span>
                                <select
                                    className={styles.select}
                                    value={formData.priority}
                                    onChange={(e) => handleInputChange('priority', e.target.value as Priority)}
                                >
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
                                    Исполнитель
                                </span>
                                <select
                                    className={styles.select}
                                    value={formData.authorId}
                                    onChange={(e) => handleInputChange('authorId', e.target.value)}
                                >
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
                            <div className={styles.tagsInputContainer}>
                                <input
                                    type="text"
                                    className={styles.textInput}
                                    value={currentTag}
                                    onChange={(e) => setCurrentTag(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                    placeholder="Введите тег и нажмите Enter..."
                                />
                                <button
                                    type="button"
                                    className={styles.addTagButton}
                                    onClick={addTag}
                                >
                                    Добавить
                                </button>
                            </div>
                            <div className={styles.tagsContainer}>
                                {formData.tags.map((tag, index) => (
                                    <span key={index} className={styles.tag}>
                                        {tag}
                                        <button
                                            type="button"
                                            className={styles.removeTagButton}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeTag(tag);
                                            }}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </label>
                    </div>

                    <div className={styles.formSection}>
                        <label className={styles.formLabel}>
                            <span className={styles.labelText}>
                                <FaPaperclip className={styles.labelIcon} />
                                Прикрепленные файлы
                            </span>

                            <div className={styles.fileUploadArea}>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    onChange={handleFileUpload}
                                    className={styles.fileInput}
                                    accept="*/*"
                                />
                                <div className={styles.uploadPlaceholder}>
                                    <FaCloudUploadAlt className={styles.uploadIcon} />
                                    <div className={styles.uploadText}>
                                        <p>Перетащите файлы сюда или нажмите для выбора</p>
                                        <span>Поддерживаются любые типы файлов</span>
                                    </div>
                                </div>
                            </div>

                            {uploadedFiles.length > 0 && (
                                <div className={styles.uploadedFiles}>
                                    <h4 className={styles.filesTitle}>
                                        Прикрепленные файлы ({uploadedFiles.length})
                                    </h4>
                                    <div className={styles.filesList}>
                                        {uploadedFiles.map((file) => (
                                            <div key={file.id} className={styles.fileItem}>
                                                <div className={styles.fileInfo}>
                                                    <div className={styles.fileIcon}>
                                                        {getFileIcon(file.type)}
                                                    </div>
                                                    <div className={styles.fileDetails}>
                                                        <span className={styles.fileName}>
                                                            {file.name}
                                                        </span>
                                                        <span className={styles.fileSize}>
                                                            {formatFileSize(file.size)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    className={styles.removeFileButton}
                                                    onClick={(e) => removeFile(file.id, e)} // Передаем событие
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </label>
                    </div>

                    <div className={styles.formSection}>
                        <label className={styles.formLabel}>
                            <span className={styles.labelText}>Разместить на досках *</span>
                            <div className={styles.boardsGrid}>
                                {boards.map((board) => (
                                    <label
                                        key={board.id}
                                        className={styles.boardCheckboxLabel}
                                        style={{ '--board-color': board.color } as React.CSSProperties}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.selectedBoards.includes(board.id)}
                                            onChange={() => handleBoardToggle(board.id)}
                                            className={styles.boardCheckbox}
                                        />
                                        <span className={styles.boardCheckboxCustom}></span>
                                        <span className={styles.boardTitle}>{board.title}</span>
                                    </label>
                                ))}
                            </div>
                        </label>
                    </div>

                    <div className={styles.modalActions}>
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={onClose}
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className={styles.saveButton}
                            disabled={!formData.title.trim() || formData.selectedBoards.length === 0}
                        >
                            <FaSave className={styles.saveIcon} />
                            Создать карточку
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddCardModal