export type Priority = 'low' | 'medium' | 'high'
export type TaskType = 'TASK' | 'BUG' | 'EPIC' | 'STORY'

export interface Author {
    name: string
    avatar: string | null
}

export interface Board {
    id: number
    title: string
    color: string
}

export interface Card {
    id: number
    title: string
    description: string
    priority: Priority
    priorityLevel: number
    author: Author
    tags: string[]
    progress: number
    comments: number
    attachments: number
}

export interface UploadedFile {
    id: string
    name: string
    size: number
    type: string
    url: string
    preview?: string
}

export interface Tag {
    id: number
    projectId: number
    name: string
}