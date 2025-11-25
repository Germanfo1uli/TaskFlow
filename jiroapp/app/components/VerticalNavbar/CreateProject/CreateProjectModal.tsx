'use client'

import { useState } from 'react'
import { FaTimes, FaUpload, FaImage, FaSpinner, FaPlus, FaCrop } from 'react-icons/fa'
import { useCreateProject, useImageUpload } from './hooks/hooks'
import { CreateProjectModalProps, CropArea } from './types/types'
import ImageCropper from './ImageCropper'
import styles from './CreateProjectModal.module.css'

const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) => {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const {
        previewUrl,
        selectedFile,
        cropArea,
        isCropping,
        handleImageSelect,
        setCrop,
        confirmCrop,
        cancelCrop,
        clearImage
    } = useImageUpload()
    const { createProject, isLoading } = useCreateProject()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name.trim()) return

        const formData = {
            name: name.trim(),
            description: description.trim(),
            image: selectedFile,
            crop: cropArea || undefined
        }

        try {
            const project = await createProject(formData)
            onProjectCreated(project)
            handleClose()
        } catch (error) {
            console.error('Error creating project:', error)
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Файл слишком большой. Максимальный размер: 5MB')
                return
            }
            handleImageSelect(file)
        }
    }

    const handleCropChange = (crop: CropArea) => {
        setCrop(crop)
    }

    const handleClose = () => {
        setName('')
        setDescription('')
        clearImage()
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className={styles.modalOverlay} onClick={handleClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div className={styles.headerContent}>
                        <h2 className={styles.modalTitle}>
                            {isCropping ? 'Выбор области' : 'Создать проект'}
                        </h2>
                        <p className={styles.modalSubtitle}>
                            {isCropping ? 'Выберите область для обложки проекта' : 'Начните новый творческий проект'}
                        </p>
                    </div>
                    <button className={styles.closeButton} onClick={handleClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {isCropping && previewUrl ? (
                        <ImageCropper
                            imageUrl={previewUrl}
                            onCropChange={handleCropChange}
                            onConfirm={confirmCrop}
                            onCancel={cancelCrop}
                        />
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.imageSection}>
                                <h3 className={styles.sectionTitle}>Обложка проекта</h3>
                                <div className={styles.imageUpload}>
                                    <input
                                        type="file"
                                        id="project-image"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className={styles.fileInput}
                                    />
                                    <label htmlFor="project-image" className={styles.uploadLabel}>
                                        {previewUrl ? (
                                            <div className={styles.imagePreview}>
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
                                            </div>
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
                                </div>
                            </div>

                            <div className={styles.formSection}>
                                <h3 className={styles.sectionTitle}>Информация о проекте</h3>
                                <div className={styles.formGroup}>
                                    <label htmlFor="project-name" className={styles.inputLabel}>
                                        Название проекта *
                                    </label>
                                    <input
                                        id="project-name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className={styles.textInput}
                                        placeholder="Введите название проекта"
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="project-description" className={styles.inputLabel}>
                                        Описание проекта
                                    </label>
                                    <textarea
                                        id="project-description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className={styles.textarea}
                                        placeholder="Опишите ваш проект..."
                                        rows={4}
                                    />
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {!isCropping && (
                    <div className={styles.modalActions}>
                        <button
                            className={styles.cancelButton}
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Отмена
                        </button>
                        <button
                            className={styles.createButton}
                            onClick={handleSubmit}
                            disabled={!name.trim() || isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <FaSpinner className={styles.spinner} />
                                    Создание...
                                </>
                            ) : (
                                <>
                                    <FaPlus />
                                    Создать проект
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CreateProjectModal