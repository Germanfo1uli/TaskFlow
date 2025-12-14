import { FaFile, FaFilePdf, FaFileWord, FaFileExcel, FaCode, FaImage } from 'react-icons/fa'

export const boardToStatusMap: Record<string, string> = {
    'TO DO': 'TO_DO',
    'SELECTED FOR DEVELOPMENT': 'SELECTED_FOR_DEVELOPMENT',
    'IN PROGRESS': 'IN_PROGRESS',
    'CODE REVIEW': 'CODE_REVIEW',
    'QA': 'QA',
    'STAGING': 'STAGING',
    'DONE': 'DONE'
}

export const priorityToApiMap: Record<string, string> = {
    'low': 'LOW',
    'medium': 'MEDIUM',
    'high': 'HIGH'
}

export const typeDisplayNames: Record<string, string> = {
    'TASK': 'Задача',
    'BUG': 'Ошибка',
    'EPIC': 'Эпик',
    'STORY': 'История'
}

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FaFilePdf className="fileIconPdf" />
    if (fileType.includes('word') || fileType.includes('document'))
        return <FaFileWord className="fileIconWord" />
    if (fileType.includes('excel') || fileType.includes('spreadsheet'))
        return <FaFileExcel className="fileIconExcel" />
    if (fileType.includes('zip') || fileType.includes('archive'))
        return <FaFile className="fileIconDefault" />
    if (fileType.includes('image')) return <FaImage className="fileIconDesign" />
    if (
        fileType.includes('text') ||
        fileType.includes('json') ||
        fileType.includes('xml') ||
        fileType.includes('html') ||
        fileType.includes('css') ||
        fileType.includes('javascript')
    )
        return <FaCode className="fileIconCode" />
    return <FaFile className="fileIconDefault" />
}