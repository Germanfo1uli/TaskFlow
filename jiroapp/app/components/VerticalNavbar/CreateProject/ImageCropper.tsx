'use client'

import { useState, useRef, useEffect } from 'react'
import { FaCheck, FaTimes } from 'react-icons/fa'
import { CropArea } from './types/types'
import styles from './ImageCropper.module.css'

interface ImageCropperProps {
    imageUrl: string;
    onCropChange: (crop: CropArea) => void;
    onConfirm: () => void;
    onCancel: () => void;
}

const ImageCropper = ({ imageUrl, onCropChange, onConfirm, onCancel }: ImageCropperProps) => {
    const [crop, setCrop] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
    const containerRef = useRef<HTMLDivElement>(null)
    const imageRef = useRef<HTMLImageElement>(null)

    const MIN_CROP_SIZE = 80
    const ASPECT_RATIO = 1

    useEffect(() => {
        const updateContainerSize = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect()
                setContainerSize({ width: rect.width, height: rect.height })
            }
        }

        updateContainerSize()
        window.addEventListener('resize', updateContainerSize)

        return () => window.removeEventListener('resize', updateContainerSize)
    }, [])

    useEffect(() => {
        if (imageRef.current) {
            const img = imageRef.current
            img.onload = () => {
                const naturalWidth = img.naturalWidth
                const naturalHeight = img.naturalHeight
                setImageSize({ width: naturalWidth, height: naturalHeight })

                const container = containerRef.current
                if (container) {
                    const containerWidth = container.clientWidth
                    const containerHeight = container.clientHeight

                    const scale = Math.min(
                        containerWidth / naturalWidth,
                        containerHeight / naturalHeight,
                        1
                    )

                    const displayedWidth = naturalWidth * scale
                    const displayedHeight = naturalHeight * scale

                    const cropSize = Math.min(displayedWidth, displayedHeight, 200)
                    const x = (displayedWidth - cropSize) / 2
                    const y = (displayedHeight - cropSize) / 2

                    const newCrop = {
                        x: Math.max(0, x),
                        y: Math.max(0, y),
                        width: cropSize,
                        height: cropSize
                    }
                    setCrop(newCrop)
                    onCropChange(getRealCropCoordinates(newCrop))
                }
            }
        }
    }, [imageUrl])

    const getImageDisplaySize = () => {
        if (!imageSize.width || !imageSize.height || !containerRef.current) {
            return { width: 0, height: 0 }
        }

        const container = containerRef.current
        const containerWidth = container.clientWidth
        const containerHeight = container.clientHeight

        const scale = Math.min(
            containerWidth / imageSize.width,
            containerHeight / imageSize.height,
            1
        )

        return {
            width: imageSize.width * scale,
            height: imageSize.height * scale
        }
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const container = containerRef.current
        if (!container) return

        const rect = container.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        if (mouseX >= crop.x && mouseX <= crop.x + crop.width &&
            mouseY >= crop.y && mouseY <= crop.y + crop.height) {
            setIsDragging(true)
            setDragStart({
                x: mouseX - crop.x,
                y: mouseY - crop.y
            })
        }
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !containerRef.current) return

        const container = containerRef.current
        const rect = container.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        const displaySize = getImageDisplaySize()

        let newX = mouseX - dragStart.x
        let newY = mouseY - dragStart.y

        newX = Math.max(0, Math.min(newX, displaySize.width - crop.width))
        newY = Math.max(0, Math.min(newY, displaySize.height - crop.height))

        const newCrop = { ...crop, x: newX, y: newY }
        setCrop(newCrop)
        onCropChange(getRealCropCoordinates(newCrop))
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    const handleResize = (e: React.MouseEvent, corner: string) => {
        e.preventDefault()
        e.stopPropagation()

        const startX = e.clientX
        const startY = e.clientY
        const startCrop = { ...crop }
        const displaySize = getImageDisplaySize()

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX
            const deltaY = moveEvent.clientY - startY

            let newCrop = { ...startCrop }

            switch (corner) {
                case 'bottom-right':
                    newCrop.width = Math.max(MIN_CROP_SIZE, startCrop.width + deltaX)
                    newCrop.height = newCrop.width
                    break
                case 'bottom-left':
                    newCrop.x = startCrop.x + deltaX
                    newCrop.width = Math.max(MIN_CROP_SIZE, startCrop.width - deltaX)
                    newCrop.height = newCrop.width
                    break
                case 'top-right':
                    newCrop.y = startCrop.y + deltaY
                    newCrop.width = Math.max(MIN_CROP_SIZE, startCrop.width + deltaX)
                    newCrop.height = newCrop.width
                    break
                case 'top-left':
                    newCrop.x = startCrop.x + deltaX
                    newCrop.y = startCrop.y + deltaY
                    newCrop.width = Math.max(MIN_CROP_SIZE, startCrop.width - deltaX)
                    newCrop.height = newCrop.width
                    break
            }

            newCrop.width = Math.min(newCrop.width, displaySize.width - newCrop.x)
            newCrop.height = Math.min(newCrop.height, displaySize.height - newCrop.y)

            const size = Math.min(newCrop.width, newCrop.height)
            newCrop.width = size
            newCrop.height = size

            if (newCrop.x + newCrop.width > displaySize.width) {
                newCrop.x = displaySize.width - newCrop.width
            }
            if (newCrop.y + newCrop.height > displaySize.height) {
                newCrop.y = displaySize.height - newCrop.height
            }
            newCrop.x = Math.max(0, newCrop.x)
            newCrop.y = Math.max(0, newCrop.y)

            setCrop(newCrop)
            onCropChange(getRealCropCoordinates(newCrop))
        }

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }

    const getRealCropCoordinates = (displayCrop: CropArea) => {
        const displaySize = getImageDisplaySize()

        if (!displaySize.width || !displaySize.height || !imageSize.width || !imageSize.height) {
            return displayCrop
        }

        const scaleX = imageSize.width / displaySize.width
        const scaleY = imageSize.height / displaySize.height

        return {
            x: displayCrop.x * scaleX,
            y: displayCrop.y * scaleY,
            width: displayCrop.width * scaleX,
            height: displayCrop.height * scaleY
        }
    }

    const displaySize = getImageDisplaySize()

    return (
        <div className={styles.cropperContainer}>
            <div className={styles.cropperHeader}>
                <h3>Выберите область для обложки</h3>
                <p>Перетащите и измените размер выделенной области</p>
            </div>

            <div
                ref={containerRef}
                className={styles.imageContainer}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <img
                    ref={imageRef}
                    src={imageUrl}
                    alt="Crop preview"
                    className={styles.cropImage}
                    style={{
                        width: `${displaySize.width}px`,
                        height: `${displaySize.height}px`
                    }}
                />

                {displaySize.width > 0 && displaySize.height > 0 && (
                    <div
                        className={styles.cropArea}
                        style={{
                            left: `${crop.x}px`,
                            top: `${crop.y}px`,
                            width: `${crop.width}px`,
                            height: `${crop.height}px`,
                        }}
                    >
                        <div className={styles.cropGrid}>
                            <div className={styles.gridLine} style={{ top: '33%' }} />
                            <div className={styles.gridLine} style={{ top: '66%' }} />
                            <div className={styles.gridLine} style={{ left: '33%' }} />
                            <div className={styles.gridLine} style={{ left: '66%' }} />
                        </div>

                        <div
                            className={`${styles.resizeHandle} ${styles.topLeft}`}
                            onMouseDown={(e) => handleResize(e, 'top-left')}
                        />
                        <div
                            className={`${styles.resizeHandle} ${styles.topRight}`}
                            onMouseDown={(e) => handleResize(e, 'top-right')}
                        />
                        <div
                            className={`${styles.resizeHandle} ${styles.bottomLeft}`}
                            onMouseDown={(e) => handleResize(e, 'bottom-left')}
                        />
                        <div
                            className={`${styles.resizeHandle} ${styles.bottomRight}`}
                            onMouseDown={(e) => handleResize(e, 'bottom-right')}
                        />
                    </div>
                )}
            </div>

            <div className={styles.cropperActions}>
                <button className={styles.cancelButton} onClick={onCancel}>
                    <FaTimes /> Отмена
                </button>
                <button className={styles.confirmButton} onClick={onConfirm}>
                    <FaCheck /> Применить
                </button>
            </div>
        </div>
    )
}

export default ImageCropper