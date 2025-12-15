import { useState, useEffect, useCallback } from 'react';
import { Board, Card, SortOption, FilterOption, DashboardState, Priority, Attachment, Comment, Author } from '../types/dashboard.types';
import { api } from '@/app/auth/hooks/useTokenRefresh';
import toast from 'react-hot-toast';

interface IssueUser {
    id: number;
    username: string;
    tag: string;
    bio: string;
}

interface IssueTag {
    id: number;
    projectId: number;
    name: string;
}

interface IssueAttachment {
    id: number;
    fileName: string;
    fileSize: number;
    contentType: string;
    createdAt: string;
    createdBy: number;
}

interface IssueComment {
    id: number;
    text: string;
    creator: IssueUser;
    createdAt: string;
    updatedAt: string;
}

interface IssueResponse {
    id: number;
    projectId: number;
    parentId: number | null;
    title: string;
    description: string;
    status: string;
    type: string;
    priority: string;
    deadline: string | null;
    createdAt: string;
    updatedAt: string;
    creator: IssueUser;
    assignee: IssueUser | null;
    reviewer: IssueUser | null;
    qa: IssueUser | null;
    tags: IssueTag[];
    comments: IssueComment[];
    attachments: IssueAttachment[];
}

const initialBoards: Board[] = [
    {
        id: 1,
        title: 'TO DO',
        color: '#3b82f6',
        cards: []
    },
    {
        id: 2,
        title: 'IN PROGRESS',
        color: '#f59e0b',
        cards: []
    },
    {
        id: 3,
        title: 'CODE REVIEW',
        color: '#8b5cf6',
        cards: []
    },
    {
        id: 4,
        title: 'DONE',
        color: '#10b981',
        cards: []
    }
];

const availableBoardTitles = [
    'TO DO',
    'SELECTED FOR DEVELOPMENT',
    'IN PROGRESS',
    'CODE REVIEW',
    'QA',
    'STAGING',
    'DONE'
];

const statusToBoardMap: Record<string, string> = {
    'TO_DO': 'TO DO',
    'TODO': 'TO DO',
    'BACKLOG': 'TO DO',
    'IN_PROGRESS': 'IN PROGRESS',
    'INPROGRESS': 'IN PROGRESS',
    'CODE_REVIEW': 'CODE REVIEW',
    'REVIEW': 'CODE REVIEW',
    'DONE': 'DONE',
    'COMPLETED': 'DONE',
    'SELECTED_FOR_DEVELOPMENT': 'SELECTED FOR DEVELOPMENT',
    'QA': 'QA',
    'STAGING': 'STAGING'
};

const priorityMap: Record<string, Priority> = {
    'LOW': 'low',
    'MEDIUM': 'medium',
    'HIGH': 'high'
};

const priorityLevelMap: Record<string, number> = {
    'LOW': 1,
    'MEDIUM': 2,
    'HIGH': 3
};

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const useDashboard = (projectId: number | null) => {
    const [boards, setBoards] = useState<Board[]>(initialBoards);
    const [isLoading, setIsLoading] = useState(false);
    const [state, setState] = useState<DashboardState>({
        searchQuery: '',
        isFilterOpen: false,
        expandedBoards: {},
        collapsedBoards: {},
        sortOption: 'default',
        filterOption: 'all',
        isTreeViewOpen: false,
        isAddCardModalOpen: false,
        isBoardManagerOpen: false,
        isViewCardModalOpen: false,
        viewingCard: null,
        editingCard: null,
        currentBoardId: 1,
        deleteConfirmation: {
            isOpen: false,
            cardId: null,
            cardTitle: ''
        }
    });

    const [availableTags, setAvailableTags] = useState<IssueTag[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [currentUser, setCurrentUser] = useState<Author | null>(null);

    const updateState = (updates: Partial<DashboardState>) => {
        setState(prev => ({ ...prev, ...updates }));
    };

    const fetchCurrentUser = useCallback(async (): Promise<Author | null> => {
        try {
            const response = await api.get<IssueUser>('/users/me');
            const userData = response.data;
            const user: Author = {
                name: userData.username || 'Текущий пользователь',
                avatar: null,
                role: 'Пользователь'
            };
            setCurrentUser(user);
            return user;
        } catch (error) {
            console.error('Ошибка при получении текущего пользователя:', error);
            // Создаем fallback пользователя
            const fallbackUser: Author = {
                name: 'Текущий пользователь',
                avatar: null,
                role: 'Пользователь'
            };
            setCurrentUser(fallbackUser);
            return fallbackUser;
        }
    }, []);

    const fetchProjectTags = useCallback(async () => {
        if (!projectId) return;

        try {
            const response = await api.get<IssueTag[]>('/tags', {
                params: { projectId }
            });
            setAvailableTags(response.data);
        } catch (error) {
            console.error('Ошибка при загрузке тегов проекта:', error);
        }
    }, [projectId]);

    const transformIssueToCard = (issue: IssueResponse): Card => {
        const assignees: Author[] = [];

        if (issue.assignee && issue.assignee.username) {
            assignees.push({
                name: issue.assignee.username,
                avatar: null,
                role: 'Исполнитель'
            });
        }

        if (issue.reviewer && issue.reviewer.username) {
            assignees.push({
                name: issue.reviewer.username,
                avatar: null,
                role: 'Ревьюер'
            });
        }

        if (issue.qa && issue.qa.username) {
            assignees.push({
                name: issue.qa.username,
                avatar: null,
                role: 'QA'
            });
        }

        const author: Author = issue.creator && issue.creator.username ? {
            name: issue.creator.username,
            avatar: null,
            role: 'Создатель'
        } : {
            name: 'Неизвестный пользователь',
            avatar: null,
            role: 'Создатель'
        };

        const tags = issue.tags?.map(tag => tag.name) || [];

        const attachmentsList: Attachment[] = issue.attachments?.map(attach => ({
            id: attach.id.toString(),
            name: attach.fileName,
            size: formatFileSize(attach.fileSize),
            type: attach.contentType,
            url: `/issues/${issue.id}/attachments/${attach.id}`,
            uploadedAt: new Date(attach.createdAt).toLocaleString('ru-RU')
        })) || [];

        const commentsList: Comment[] = issue.comments?.map(comment => ({
            id: comment.id,
            author: {
                name: comment.creator.username,
                avatar: null,
                role: 'Участник'
            },
            content: comment.text,
            createdAt: new Date(comment.createdAt).toLocaleString('ru-RU')
        })) || [];

        return {
            id: issue.id,
            title: issue.title,
            description: issue.description || 'Без описания',
            priority: priorityMap[issue.priority] || 'medium',
            priorityLevel: priorityLevelMap[issue.priority] || 2,
            author: author,
            assignees: assignees.length > 0 ? assignees : undefined,
            tags: tags,
            progress: 0,
            comments: issue.comments?.length || 0,
            attachments: issue.attachments?.length || 0,
            attachmentsList: attachmentsList,
            commentsList: commentsList,
            createdAt: issue.createdAt ? new Date(issue.createdAt).toLocaleDateString('ru-RU') : 'Дата не указана'
        };
    };

    const fetchProjectData = useCallback(async () => {
        if (!projectId) return;

        try {
            const usersResponse = await api.get<IssueUser[]>(`/projects/${projectId}/members`);

            const authorsData: Author[] = usersResponse.data.map(user => ({
                name: user.username,
                avatar: null,
                role: 'Участник проекта'
            }));

            setAuthors(authorsData);
        } catch (error) {
            console.error('Ошибка при загрузке данных проекта:', error);
        }
    }, [projectId]);

    const fetchIssues = useCallback(async () => {
        if (!projectId) return;

        setIsLoading(true);
        try {
            const [issuesResponse] = await Promise.all([
                api.get<IssueResponse[]>('/issues', {
                    params: { projectId }
                }),
                fetchProjectData(),
                fetchProjectTags()
            ]);

            const issues = issuesResponse.data;

            const updatedBoards = initialBoards.map(board => {
                const boardCards = issues
                    .filter(issue => {
                        const mappedBoardTitle = statusToBoardMap[issue.status];
                        return mappedBoardTitle === board.title;
                    })
                    .map(issue => transformIssueToCard(issue));

                return {
                    ...board,
                    cards: boardCards
                };
            });

            setBoards(updatedBoards);

        } catch (error: any) {
            console.error('Ошибка при загрузке задач:', error);
        } finally {
            setIsLoading(false);
        }
    }, [projectId, fetchProjectData, fetchProjectTags]);

    useEffect(() => {
        if (projectId) {
            fetchIssues();
            fetchCurrentUser();
        } else {
            setBoards(initialBoards);
            fetchCurrentUser();
        }
    }, [projectId, fetchIssues, fetchCurrentUser]);

    const fetchIssueById = async (issueId: number): Promise<Card | null> => {
        try {
            const response = await api.get<IssueResponse>(`/issues/${issueId}`);
            return transformIssueToCard(response.data);
        } catch (error) {
            console.error('Ошибка при загрузке задачи:', error);
            return null;
        }
    };

    const deleteIssue = async (issueId: number): Promise<boolean> => {
        try {
            await api.delete(`/issues/${issueId}`);
            return true;
        } catch (error) {
            console.error('Ошибка при удалении задачи:', error);
            return false;
        }
    };

    const updateIssue = async (issueId: number, data: {
        title: string;
        description: string;
        priority: string;
        tagIds: number[];
        tagNames: string[];
    }) => {
        try {
            let allTagIds = [...data.tagIds];

            if (data.tagNames.length > 0) {
                const newTagPromises = data.tagNames.map(tagName =>
                    api.post('/tags', {
                        projectId,
                        name: tagName
                    }).catch(err => {
                        console.error('Ошибка при создании тега:', err);
                        return null;
                    })
                );

                const newTagResponses = await Promise.all(newTagPromises);
                const newTagIds = newTagResponses
                    .filter(response => response !== null && response.data?.id)
                    .map(response => response.data.id);

                allTagIds = [...allTagIds, ...newTagIds];
            }

            await api.patch(`/issues/${issueId}`, {
                title: data.title,
                description: data.description,
                priority: data.priority,
                tagIds: allTagIds
            });

            return true;
        } catch (error) {
            console.error('Ошибка при обновлении задачи:', error);
            throw error;
        }
    };

    const uploadFiles = async (issueId: number, files: File[]) => {
        if (files.length === 0) return [];

        const uploadPromises = files.map(async (file) => {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await api.post(`/issues/${issueId}/attachments`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                return response.data;
            } catch (error) {
                console.error('Ошибка при загрузке файла:', error);
                return null;
            }
        });

        const results = await Promise.all(uploadPromises);
        return results.filter(result => result !== null);
    };

    const deleteAttachment = async (issueId: number, attachmentId: number): Promise<boolean> => {
        try {
            await api.delete(`/issues/${issueId}/attachments/${attachmentId}`);
            return true;
        } catch (error) {
            console.error('Ошибка при удалении файла:', error);
            return false;
        }
    };

    const getPriorityColor = (priority: Priority): string => {
        const colors: Record<Priority, string> = {
            low: '#10b981',
            medium: '#f59e0b',
            high: '#ef4444'
        };
        return colors[priority] || '#6b7280';
    };

    const getPriorityBgColor = (priority: Priority): string => {
        const colors: Record<Priority, string> = {
            low: 'rgba(16, 185, 129, 0.15)',
            medium: 'rgba(245, 158, 11, 0.15)',
            high: 'rgba(239, 68, 68, 0.15)'
        };
        return colors[priority] || 'rgba(107, 114, 128, 0.1)';
    };

    const toggleBoardExpansion = (boardId: number): void => {
        setState(prev => ({
            ...prev,
            expandedBoards: {
                ...prev.expandedBoards,
                [boardId]: !prev.expandedBoards[boardId]
            }
        }));
    };

    const toggleBoardCollapse = (boardId: number): void => {
        setState(prev => ({
            ...prev,
            collapsedBoards: {
                ...prev.collapsedBoards,
                [boardId]: !prev.collapsedBoards[boardId]
            }
        }));
    };

    const handleSortChange = (option: SortOption): void => {
        updateState({ sortOption: option });
    };

    const handleFilterChange = (option: FilterOption): void => {
        updateState({ filterOption: option });
    };

    const openTreeView = (): void => {
        updateState({ isTreeViewOpen: true });
    };

    const closeTreeView = (): void => {
        updateState({ isTreeViewOpen: false });
    };

    const openAddCardModal = (): void => {
        updateState({ isAddCardModalOpen: true });
    };

    const closeAddCardModal = (): void => {
        updateState({ isAddCardModalOpen: false });
    };

    const openBoardManager = (): void => {
        updateState({ isBoardManagerOpen: true });
    };

    const closeBoardManager = (): void => {
        updateState({ isBoardManagerOpen: false });
    };

    const openViewCardModal = (card: Card): void => {
        updateState({ isViewCardModalOpen: true, viewingCard: card });
        const boardWithCard = boards.find(board =>
            board.cards && board.cards.some(c => c.id === card.id)
        );
        if (boardWithCard) {
            updateState({ currentBoardId: boardWithCard.id });
        }
    };

    const closeViewCardModal = (): void => {
        updateState({ isViewCardModalOpen: false, viewingCard: null });
    };

    const handleSaveBoards = (updatedBoards: Board[]): void => {
        setBoards(updatedBoards);
    };

    const handleAddCard = async (data: {
        projectId: number;
        title: string;
        description: string;
        type: string;
        priority: string;
        tagIds: number[];
        tagNames: string[];
    }) => {
        try {
            let allTagIds = [...data.tagIds];

            if (data.tagNames.length > 0) {
                const newTagPromises = data.tagNames.map(tagName =>
                    api.post('/tags', {
                        projectId: data.projectId,
                        name: tagName
                    }).catch(err => {
                        console.error('Ошибка при создании тега:', err);
                        return null;
                    })
                );

                const newTagResponses = await Promise.all(newTagPromises);
                const newTagIds = newTagResponses
                    .filter(response => response !== null && response.data?.id)
                    .map(response => response.data.id);

                allTagIds = [...allTagIds, ...newTagIds];
            }

            const response = await api.post('/issues', {
                projectId: data.projectId,
                title: data.title,
                description: data.description,
                type: data.type,
                priority: data.priority,
                tagIds: allTagIds
            });

            const newIssue = response.data;
            const newCard = transformIssueToCard(newIssue);

            const targetBoard = boards.find(board => board.title === 'TO DO');

            if (targetBoard) {
                const updatedBoards = boards.map(board => {
                    if (board.id === targetBoard.id) {
                        return {
                            ...board,
                            cards: Array.isArray(board.cards) ? [...board.cards, newCard] : [newCard]
                        };
                    }
                    return board;
                });
                setBoards(updatedBoards);
            }

            await fetchProjectTags();
            toast.success('Карточка успешно создана');
            closeAddCardModal();
            return newIssue.id;
        } catch (error) {
            console.error('Ошибка при создании задачи:', error);
            toast.error('Не удалось создать карточку');
            return false;
        }
    };

    const handleEditCard = (card: Card) => {
        updateState({ editingCard: card });
        const boardWithCard = boards.find(board =>
            board.cards && board.cards.some(c => c.id === card.id)
        );
        if (boardWithCard) {
            updateState({ currentBoardId: boardWithCard.id });
        }
    };

    const handleViewCard = async (card: Card) => {
        try {
            const fullCardData = await fetchIssueById(card.id);
            if (fullCardData) {
                openViewCardModal(fullCardData);
            } else {
                openViewCardModal(card);
            }
        } catch (error) {
            console.error('Ошибка при загрузке деталей задачи:', error);
            openViewCardModal(card);
        }
    };

    const handleUpdateCard = async (data: {
        issueId: number;
        title: string;
        description: string;
        priority: string;
        tagIds: number[];
        tagNames: string[];
    }) => {
        try {
            let allTagIds = [...data.tagIds];

            if (data.tagNames.length > 0) {
                const newTagPromises = data.tagNames.map(tagName =>
                    api.post('/tags', {
                        projectId,
                        name: tagName
                    }).catch(err => {
                        console.error('Ошибка при создании тега:', err);
                        return null;
                    })
                );

                const newTagResponses = await Promise.all(newTagPromises);
                const newTagIds = newTagResponses
                    .filter(response => response !== null && response.data?.id)
                    .map(response => response.data.id);

                allTagIds = [...allTagIds, ...newTagIds];
            }

            await api.patch(`/issues/${data.issueId}`, {
                title: data.title,
                description: data.description,
                priority: data.priority,
                tagIds: allTagIds
            });

            const updatedCard = await fetchIssueById(data.issueId);
            if (updatedCard) {
                const updatedBoards = boards.map(board => ({
                    ...board,
                    cards: board.cards.map(card =>
                        card.id === data.issueId ? updatedCard : card
                    )
                }));
                setBoards(updatedBoards);
            }

            await fetchProjectTags();
            updateState({ editingCard: null });
            toast.success('Карточка успешно обновлена');
        } catch (error) {
            console.error('Ошибка при обновлении карточки:', error);
            toast.error('Не удалось обновить карточку');
        }
    };

    const handleDeleteCard = async (cardId: number) => {
        const cardToDelete = boards
            .flatMap(board => board.cards || [])
            .find(card => card.id === cardId);

        if (cardToDelete) {
            updateState({
                deleteConfirmation: {
                    isOpen: true,
                    cardId,
                    cardTitle: cardToDelete.title
                }
            });
        }
    };

    const confirmDelete = async () => {
        if (state.deleteConfirmation.cardId) {
            try {
                const success = await deleteIssue(state.deleteConfirmation.cardId);
                if (success) {
                    const updatedBoards = boards.map(board => ({
                        ...board,
                        cards: board.cards ? board.cards.filter(card => card.id !== state.deleteConfirmation.cardId) : []
                    }));
                    setBoards(updatedBoards);
                    updateState({
                        deleteConfirmation: { isOpen: false, cardId: null, cardTitle: '' }
                    });
                    toast.success('Карточка успешно удалена');
                }
            } catch (error) {
                console.error('Ошибка при удалении задачи:', error);
                toast.error('Не удалось удалить карточку');
            }
        }
    };

    const cancelDelete = () => {
        updateState({
            deleteConfirmation: { isOpen: false, cardId: null, cardTitle: '' }
        });
    };

    const handleAddComment = (cardId: number, comment: Comment) => {
        const updatedBoards = boards.map(board => ({
            ...board,
            cards: board.cards.map(card => {
                if (card.id === cardId) {
                    const updatedCommentsList = card.commentsList ? [...card.commentsList, comment] : [comment];
                    return {
                        ...card,
                        comments: updatedCommentsList.length,
                        commentsList: updatedCommentsList
                    };
                }
                return card;
            })
        }));
        setBoards(updatedBoards);
    };

    const filterAndSortCards = (cards: Card[]): Card[] => {
        if (!Array.isArray(cards)) {
            console.error('cards is not an array:', cards);
            return [];
        }

        let filteredCards = [...cards];

        if (state.searchQuery) {
            filteredCards = filteredCards.filter(card =>
                card.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                card.description.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                card.tags.some(tag => tag.toLowerCase().includes(state.searchQuery.toLowerCase()))
            );
        }

        if (state.filterOption !== 'all') {
            filteredCards = filteredCards.filter(card => card.priority === state.filterOption);
        }

        switch (state.sortOption) {
            case 'alphabet':
                filteredCards.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'priority':
                filteredCards.sort((a, b) => b.priorityLevel - a.priorityLevel);
                break;
            case 'author':
                filteredCards.sort((a, b) => a.author.name.localeCompare(b.author.name));
                break;
            default:
                break;
        }

        return filteredCards;
    };

    const getAvailableBoardTitles = () => {
        const existingTitles = boards.map(board => board.title);
        return availableBoardTitles.map(title => ({
            title,
            available: !existingTitles.includes(title)
        }));
    };

    const getBoardByCardId = (cardId: number): Board | undefined => {
        return boards.find(board => board.cards.some(card => card.id === cardId));
    };

    const createTag = useCallback(async (tagName: string): Promise<IssueTag | null> => {
        if (!projectId) return null;
        try {
            const response = await api.post('/tags', {
                projectId,
                name: tagName
            });
            await fetchProjectTags();
            return response.data;
        } catch (error) {
            console.error('Ошибка при создании тега:', error);
            return null;
        }
    }, [projectId, fetchProjectTags]);

    return {
        boards,
        setBoards,
        state,
        updateState,
        authors,
        availableTags,
        currentUser,
        isLoading,
        getPriorityColor,
        getPriorityBgColor,
        toggleBoardExpansion,
        toggleBoardCollapse,
        handleSortChange,
        handleFilterChange,
        openTreeView,
        closeTreeView,
        openAddCardModal,
        closeAddCardModal,
        openBoardManager,
        closeBoardManager,
        openViewCardModal,
        closeViewCardModal,
        handleSaveBoards,
        handleAddCard,
        handleEditCard,
        handleViewCard,
        handleUpdateCard,
        handleDeleteCard,
        handleAddComment,
        confirmDelete,
        cancelDelete,
        filterAndSortCards,
        getAvailableBoardTitles,
        getBoardByCardId,
        fetchIssues,
        refreshIssues: fetchIssues,
        createTag,
        uploadFiles,
        deleteAttachment,
        fetchCurrentUser
    };
};