export type Priority = 'low' | 'medium' | 'high'
export type TaskType = 'TASK' | 'BUG' | 'EPIC' | 'STORY'

export interface Author {
    name: string
    avatar: string | null
    role?: string
}

export interface Board {
    id: number
    title: string
    color: string
    cards: Card[]
}

export interface Card {
    id: number
    title: string
    description: string
    priority: Priority
    priorityLevel: number
    author: Author
    assignees?: Author[]
    tags: string[]
    progress: number
    comments: number
    attachments: number
    attachmentsList: Attachment[]
    commentsList: Comment[]
    createdAt: string
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

export interface Attachment {
    id: string
    name: string
    size: string
    type: string
    url: string
    uploadedAt: string
}

export interface Comment {
    id: number
    author: Author
    content: string
    createdAt: string
}