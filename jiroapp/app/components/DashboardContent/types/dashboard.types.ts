export type Priority = 'low' | 'medium' | 'high'
export type SortOption = 'default' | 'alphabet' | 'priority' | 'author'
export type FilterOption = 'all' | 'high' | 'medium' | 'low'
export type TaskType = 'TASK' | 'BUG' | 'EPIC' | 'STORY'

export interface Author {
    name: string
    avatar: string | null
    role?: string
}

export interface Attachment {
    id: number
    fileName: string
    fileSize: number
    contentType: string
    createdAt: string
    createdBy: number
}

export interface Comment {
    id: number
    text: string
    creator: {
        id: number
        username: string
        tag: string
        bio: string
    }
    createdAt: string
    updatedAt: string
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
    attachmentsList?: Attachment[]
    commentsList?: Comment[]
    createdAt?: string
}

export interface Board {
    id: number
    title: string
    color: string
    cards: Card[]
}

export interface DashboardState {
    searchQuery: string
    isFilterOpen: boolean
    expandedBoards: { [key: number]: boolean }
    collapsedBoards: { [key: number]: boolean }
    sortOption: SortOption
    filterOption: FilterOption
    isTreeViewOpen: boolean
    isAddCardModalOpen: boolean
    isBoardManagerOpen: boolean
    isViewCardModalOpen: boolean
    viewingCard: Card | null
    editingCard: Card | null
    currentBoardId: number
    deleteConfirmation: {
        isOpen: boolean
        cardId: number | null
        cardTitle: string
    }
}

export interface IssueTag {
    id: number
    projectId: number
    name: string
}