'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { FaTimes, FaImage, FaSpinner, FaPlus, FaCrop } from 'react-icons/fa'
import { useCreateProject, useImageUpload } from './hooks/hooks'
import { CreateProjectModalProps, CropArea } from './types/types'
import ImageCropper from './ImageCropper'
import styles from './CreateProjectModal.module.css'

// Убрали валидацию ключа
const schema = z.object({
    name: z.string().min(1, 'Название обязательно').max(100, 'Слишком длинное название'),
    description: z.string().max(500, 'Описание слишком длинное').optional(),
    image: z.any().optional(),
})

type FormData = z.infer<typeof schema>

export default function CreateProjectModal({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) {
    const {
        control,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            description: '',
            image: null,
        },
    })

    const {
        previewUrl,
        selectedFile,
        cropArea,
        isCropping,
        handleImageSelect,
        setCrop,
        confirmCrop,
        cancelCrop,
        clearImage,
    } = useImageUpload()

    const { createProject, isLoading } = useCreateProject()
    const initializedRef = useRef(false)

    const handleClose = useCallback(() => {
        reset()
        clearImage()
        onClose()
    }, [reset, clearImage, onClose])

    useEffect(() => {
        if (isOpen && !initializedRef.current) {
            reset()
            clearImage()
            initializedRef.current = true
        } else if (!isOpen) {
            initializedRef.current = false
        }
    }, [isOpen, reset, clearImage])

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) handleClose()
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [isOpen, handleClose])

    const onSubmit = useCallback(
        async (data: FormData) => {
            try {
                toast.loading('Создание проекта...', { id: 'create-project' })

                const projectData = {
                    name: data.name.trim(),
                    description: data.description?.trim() || '',
                    image: selectedFile,
                    crop: cropArea || undefined,
                }

                const project = await createProject(projectData)

                toast.success('Проект успешно создан!', {
                    id: 'create-project',
                    icon: '🎉',
                })

                onProjectCreated(project)
                handleClose()
            } catch (error) {
                toast.error('Не удалось создать проект', {
                    id: 'create-project',
                    icon: '🚫',
                })
                console.error('Error creating project:', error)
            }
        },
        [createProject, selectedFile, cropArea, onProjectCreated, handleClose]
    )

    const handleImageChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    toast.error('Файл слишком большой. Максимальный размер: 5MB', {
                        icon: '📏',
                    })
                    return
                }
                setValue('image', file, { shouldDirty: true })
                handleImageSelect(file)
            }
        },
        [handleImageSelect, setValue]
    )

    const handleCropChange = useCallback(
        (crop: CropArea) => setCrop(crop),
        [setCrop]
    )

    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className={styles.modalOverlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                >
                    <motion.div
                        className={styles.modalContent}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-title"
                    >
                        <motion.div
                            className={styles.modalHeader}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className={styles.headerContent}>
                                <motion.h2
                                    id="modal-title"
                                    className={styles.modalTitle}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {isCropping ? 'Выбор области' : 'Создать проект'}
                                </motion.h2>
                                <motion.p
                                    className={styles.modalSubtitle}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.25 }}
                                >
                                    {isCropping ? 'Выберите область для обложки проекта' : 'Начните новый творческий проект'}
                                </motion.p>
                            </div>
                            <motion.button
                                className={styles.closeButton}
                                onClick={handleClose}
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                aria-label="Закрыть"
                            >
                                <FaTimes />
                            </motion.button>
                        </motion.div>

                        <motion.div
                            className={styles.modalBody}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {isCropping && previewUrl ? (
                                <ImageCropper
                                    imageUrl={previewUrl}
                                    onCropChange={handleCropChange}
                                    onConfirm={confirmCrop}
                                    onCancel={cancelCrop}
                                />
                            ) : (
                                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                                    <motion.div
                                        className={styles.imageSection}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <h3 className={styles.sectionTitle}>Обложка проекта</h3>
                                        <div className={styles.imageUpload}>
                                            <Controller
                                                name="image"
                                                control={control}
                                                render={() => (
                                                    <>
                                                        <input
                                                            type="file"
                                                            id="project-image"
                                                            accept="image/*"
                                                            onChange={handleImageChange}
                                                            className={styles.fileInput}
                                                        />
                                                        <label htmlFor="project-image" className={styles.uploadLabel}>
                                                            {previewUrl ? (
                                                                <motion.div
                                                                    className={styles.imagePreview}
                                                                    whileHover={{ scale: 1.02 }}
                                                                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                                                                >
                                                                    <img
                                                                        src={previewUrl}
                                                                        alt="Preview"
                                                                        className={styles.previewImage}
                                                                    />
                                                                    <div className={styles.imageOverlay}>
                                                                        <div className={styles.overlayContent}>
                                                                            <FaCrop className={styles.uploadIcon} />
                                                                            <span>Изменить обложку</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className={styles.cropBadge}>
                                                                        <FaCrop /> Область выбрана
                                                                    </div>
                                                                </motion.div>
                                                            ) : (
                                                                <div className={styles.uploadPlaceholder}>
                                                                    <FaImage className={styles.placeholderIcon} />
                                                                    <div className={styles.placeholderText}>
                                                                        <span className={styles.placeholderTitle}>Добавить обложку</span>
                                                                        <span className={styles.placeholderSubtitle}>PNG, JPG до 5MB</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </label>
                                                    </>
                                                )}
                                            />
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        className={styles.formSection}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <h3 className={styles.sectionTitle}>Информация о проекте</h3>

                                        <div className={styles.formGroup}>
                                            <label htmlFor="project-name" className={styles.inputLabel}>
                                                Название проекта *
                                            </label>
                                            <Controller
                                                name="name"
                                                control={control}
                                                render={({ field }) => (
                                                    <>
                                                        <input
                                                            {...field}
                                                            id="project-name"
                                                            type="text"
                                                            className={`${styles.textInput} ${errors.name ? styles.error : ''}`}
                                                            placeholder="Введите название проекта"
                                                            autoFocus
                                                        />
                                                        {errors.name && (
                                                            <span className={styles.errorText}>{errors.name.message}</span>
                                                        )}
                                                    </>
                                                )}
                                            />
                                        </div>

                                        {/* ✅ УБРАНО ПОЛЕ КЛЮЧА */}

                                        <div className={styles.formGroup}>
                                            <label htmlFor="project-description" className={styles.inputLabel}>
                                                Описание проекта
                                            </label>
                                            <Controller
                                                name="description"
                                                control={control}
                                                render={({ field }) => (
                                                    <textarea
                                                        {...field}
                                                        id="project-description"
                                                        className={styles.textarea}
                                                        placeholder="Опишите ваш проект..."
                                                        rows={4}
                                                    />
                                                )}
                                            />
                                        </div>
                                    </motion.div>
                                </form>
                            )}
                        </motion.div>

                        <AnimatePresence>
                            {!isCropping && (
                                <motion.div
                                    className={styles.modalActions}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <motion.button
                                        className={styles.cancelButton}
                                        onClick={handleClose}
                                        disabled={isLoading || isSubmitting}
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Отмена
                                    </motion.button>
                                    <motion.button
                                        className={styles.createButton}
                                        onClick={handleSubmit(onSubmit)}
                                        disabled={!watch('name')?.trim() || isLoading || isSubmitting}
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <AnimatePresence mode="wait">
                                            {isLoading || isSubmitting ? (
                                                <motion.span
                                                    key="loading"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className={styles.buttonContent}
                                                >
                                                    <FaSpinner className={styles.spinner} />
                                                    Создание...
                                                </motion.span>
                                            ) : (
                                                <motion.span
                                                    key="create"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className={styles.buttonContent}
                                                >
                                                    <FaPlus />
                                                    Создать проект
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}