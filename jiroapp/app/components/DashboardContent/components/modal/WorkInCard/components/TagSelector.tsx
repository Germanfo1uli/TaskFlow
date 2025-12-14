'use client'

import { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaTag, FaPlus } from 'react-icons/fa'
import styles from '../ModalStyles.module.css'

interface TagSelectorProps {
    tags: string[]
    availableTags: any[]
    onAddTag: (tagName: string) => void
    onRemoveTag: (tagName: string) => void
    onCreateTag: (tagName: string) => Promise<any>
    showNewTagInput: boolean
    setShowNewTagInput: (show: boolean) => void
    newTagInput: string
    setNewTagInput: (value: string) => void
}

export default function TagSelector({
                                        tags = [],
                                        availableTags = [],
                                        onAddTag,
                                        onRemoveTag,
                                        onCreateTag,
                                        showNewTagInput,
                                        setShowNewTagInput,
                                        newTagInput,
                                        setNewTagInput,
                                    }: TagSelectorProps) {
    const handleAddExistingTag = useCallback((tagName: string) => {
        if (tagName) {
            onAddTag(tagName)
        }
    }, [onAddTag])

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
            const newTag = await onCreateTag(trimmed)
            if (newTag) {
                onAddTag(newTag.name)
                setNewTagInput('')
                setShowNewTagInput(false)
                toast.success('Тег создан и добавлен')
            }
        } catch (error) {
            toast.error('Ошибка при создании тега')
        }
    }, [newTagInput, tags, availableTags, onCreateTag, onAddTag, setShowNewTagInput, setNewTagInput])

    return (
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
                                onClick={() => onRemoveTag(tag)}
                                whileHover={{ scale: 1.2, rotate: 90 }}
                            >
                                ×
                            </motion.button>
                        </motion.span>
                    ))}
                </div>
            </div>
        </label>
    )
}