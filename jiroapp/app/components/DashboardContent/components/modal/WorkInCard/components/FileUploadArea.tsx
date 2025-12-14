'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaCloudUploadAlt, FaTrash } from 'react-icons/fa'
import styles from '../ModalStyles.module.css'
import { formatFileSize, getFileIcon } from '../hooks/utils'
import { UploadedFile } from '../types/types'

interface FileUploadAreaProps {
    uploadedFiles: UploadedFile[]
    onFilesChange: (files: UploadedFile[]) => void
    onRemoveFile: (fileId: string) => void
}

export default function FileUploadArea({ uploadedFiles = [], onFilesChange, onRemoveFile }: FileUploadAreaProps) {
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
        onFilesChange([...uploadedFiles, ...newFiles])
        toast.success(`Добавлено ${newFiles.length} файл(ов)`)
    }, [uploadedFiles, onFilesChange])

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

    return (
        <label className={styles.formLabel}>
            <span className={styles.labelText}>
                <FaCloudUploadAlt className={styles.labelIcon} />
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
                                        onClick={() => onRemoveFile(file.id)}
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
    )
}