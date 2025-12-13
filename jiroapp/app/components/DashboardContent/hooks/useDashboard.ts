import { useState, useEffect, useCallback } from 'react';
import { Board, Card, SortOption, FilterOption, DashboardState, Priority, Attachment, Comment, Author } from '../types/dashboard.types';
import { api } from '@/app/auth/hooks/useTokenRefresh';

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

    const authors: Author[] = [];

    const updateState = (updates: Partial<DashboardState>) => {
        setState(prev => ({ ...prev, ...updates }));
    };

    const transformIssueToCard = (issue: IssueResponse): Card => {
        const assignees: Author[] = [];
        if (issue.assignee) {
            assignees.push({
                name: issue.assignee.username,
                avatar: null,
                role: 'Исполнитель'
            });
        }
        if (issue.reviewer) {
            assignees.push({
                name: issue.reviewer.username,
                avatar: null,
                role: 'Ревьюер'
            });
        }
        if (issue.qa) {
            assignees.push({
                name: issue.qa.username,
                avatar: null,
                role: 'QA'
            });
        }

        return {
            id: issue.id,
            title: issue.title,
            description: issue.description || 'Без описания',
            priority: priorityMap[issue.priority] || 'medium',
            priorityLevel: priorityLevelMap[issue.priority] || 2,
            author: {
                name: issue.creator.username,
                avatar: null,
                role: 'Создатель'
            },
            assignees: assignees.length > 0 ? assignees : undefined,
            tags: issue.tags?.map(tag => tag.name) || [],
            progress: 0,
            comments: 0,
            attachments: 0,
            attachmentsList: [],
            commentsList: [],
            createdAt: issue.createdAt ? new Date(issue.createdAt).toLocaleDateString('ru-RU') : 'Дата не указана'
        };
    };

    const fetchIssues = useCallback(async () => {
        if (projectId === null || projectId === undefined) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.get<IssueResponse[]>('/issues', {
                params: { projectId }
            });

            const issues = response.data;

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
    }, [projectId]);

    useEffect(() => {
        if (projectId !== null && projectId !== undefined) {
            fetchIssues();
        } else {
            setBoards(initialBoards);
        }
    }, [projectId, fetchIssues]);

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

    const handleAddCard = async (data: { card: Card; boardIds: number[] }) => {
        const updatedBoards = boards.map(board => {
            if (data.boardIds.includes(board.id)) {
                return {
                    ...board,
                    cards: Array.isArray(board.cards) ? [...board.cards, data.card] : [data.card]
                };
            }
            return board;
        });
        setBoards(updatedBoards);
        closeAddCardModal();
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

    const handleUpdateCard = (data: { card: Card; boardIds: number[] }) => {
        const updatedBoards = boards.map(board => {
            if (board.cards && board.cards.some(c => c.id === data.card.id) && !data.boardIds.includes(board.id)) {
                return {
                    ...board,
                    cards: board.cards.filter(c => c.id !== data.card.id)
                };
            }
            if (data.boardIds.includes(board.id)) {
                const cardExists = board.cards && board.cards.some(c => c.id === data.card.id);

                if (cardExists) {
                    return {
                        ...board,
                        cards: board.cards.map(c =>
                            c.id === data.card.id ? data.card : c
                        )
                    };
                } else {
                    return {
                        ...board,
                        cards: Array.isArray(board.cards) ? [...board.cards, data.card] : [data.card]
                    };
                }
            }

            return board;
        });

        setBoards(updatedBoards);
        updateState({ editingCard: null });
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
                }
            } catch (error) {
                console.error('Ошибка при удалении задачи:', error);
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

    return {
        boards,
        setBoards,
        state,
        updateState,
        authors,
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
        refreshIssues: fetchIssues
    };
};