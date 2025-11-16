'use client'

import {JSX, useState} from 'react'
import {
    FaSearch,
    FaFilter,
    FaSortAlphaDown,
    FaExclamationCircle,
    FaUserCircle,
    FaEllipsisH,
    FaChevronDown,
    FaChevronUp,
    FaPlus,
    FaFlag,
    FaRegFlag,
    FaChevronRight,
    FaSitemap
} from 'react-icons/fa'
import styles from './Dashboard.module.css'
import TaskCard from './components/TaskCard'
import TreeViewModal from './components/TreeViewModal'
import AddCardModal from './components/AddCardModal'
import ConfirmationModal from './components/ConfirmationModal'

type Priority = 'low' | 'medium' | 'high'

interface Author {
    name: string
    avatar: string | null
}

interface Card {
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

interface Board {
    id: number
    title: string
    color: string
    cards: Card[]
}

type SortOption = 'default' | 'alphabet' | 'priority' | 'author'
type FilterOption = 'all' | Priority

const BoardsSection = () => {
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
    const [expandedBoards, setExpandedBoards] = useState<{[key: number]: boolean}>({})
    const [collapsedBoards, setCollapsedBoards] = useState<{[key: number]: boolean}>({})
    const [sortOption, setSortOption] = useState<SortOption>('default')
    const [filterOption, setFilterOption] = useState<FilterOption>('all')
    const [isTreeViewOpen, setIsTreeViewOpen] = useState<boolean>(false)
    const [isAddCardModalOpen, setIsAddCardModalOpen] = useState<boolean>(false)
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        cardId: number | null;
        cardTitle: string;
    }>({
        isOpen: false,
        cardId: null,
        cardTitle: ''
    })
    const [boards, setBoards] = useState<Board[]>([
        {
            id: 1,
            title: 'To Do',
            color: '#3b82f6',
            cards: [
                {
                    id: 1,
                    title: 'Прототип главной страницы',
                    description: 'Создать прототип главной страницы с основными компонентами и интерфейсом пользователя',
                    priority: 'high',
                    priorityLevel: 3,
                    author: {
                        name: 'Алексей Петров',
                        avatar: null
                    },
                    tags: ['Дизайн', 'Прототип', 'UI/UX'],
                    progress: 0,
                    comments: 3,
                    attachments: 2
                }
            ]
        },
        {
            id: 2,
            title: 'In Progress',
            color: '#f59e0b',
            cards: [
                {
                    id: 2,
                    title: 'Разработка API',
                    description: 'Реализовать основные endpoints для работы с задачами и пользователями',
                    priority: 'medium',
                    priorityLevel: 2,
                    author: {
                        name: 'Мария Иванова',
                        avatar: null
                    },
                    tags: ['Бэкенд', 'API', 'Node.js'],
                    progress: 65,
                    comments: 7,
                    attachments: 5
                },
                {
                    id: 3,
                    title: 'Интеграция с базой данных',
                    description: 'Настроить подключение и модели для работы с PostgreSQL и Redis',
                    priority: 'high',
                    priorityLevel: 3,
                    author: {
                        name: 'Иван Сидоров',
                        avatar: null
                    },
                    tags: ['База данных', 'Настройка', 'PostgreSQL'],
                    progress: 40,
                    comments: 2,
                    attachments: 4
                }
            ]
        },
        {
            id: 3,
            title: 'Review',
            color: '#8b5cf6',
            cards: [
                {
                    id: 4,
                    title: 'Тестирование компонентов',
                    description: 'Провести unit и integration тесты для основных компонентов системы',
                    priority: 'medium',
                    priorityLevel: 2,
                    author: {
                        name: 'Елена Козлова',
                        avatar: null
                    },
                    tags: ['Тестирование', 'QA', 'Jest'],
                    progress: 100,
                    comments: 5,
                    attachments: 3
                }
            ]
        },
        {
            id: 4,
            title: 'Done',
            color: '#10b981',
            cards: [
                {
                    id: 5,
                    title: 'Настройка проекта',
                    description: 'Инициализация проекта и настройка базовых конфигураций, инструментов разработки',
                    priority: 'low',
                    priorityLevel: 1,
                    author: {
                        name: 'Алексей Петров',
                        avatar: null
                    },
                    tags: ['Настройка', 'DevOps'],
                    progress: 100,
                    comments: 1,
                    attachments: 0
                }
            ]
        }
    ])

    const authors: Author[] = [
        {
            name: 'Алексей Петров',
            avatar: null
        },
        {
            name: 'Мария Иванова',
            avatar: null
        },
        {
            name: 'Иван Сидоров',
            avatar: null
        },
        {
            name: 'Елена Козлова',
            avatar: null
        }
    ]

    const getPriorityColor = (priority: Priority): string => {
        const colors: Record<Priority, string> = {
            low: '#10b981',
            medium: '#f59e0b',
            high: '#ef4444'
        }
        return colors[priority] || '#6b7280'
    }

    const getPriorityBgColor = (priority: Priority): string => {
        const colors: Record<Priority, string> = {
            low: 'rgba(16, 185, 129, 0.15)',
            medium: 'rgba(245, 158, 11, 0.15)',
            high: 'rgba(239, 68, 68, 0.15)'
        }
        return colors[priority] || 'rgba(107, 114, 128, 0.1)'
    }

    const getFilterPriorityIcon = (priority: Priority): JSX.Element => {
        switch (priority) {
            case 'high':
                return <FaFlag className={styles.filterPriorityIcon} style={{color: '#ef4444'}} />
            case 'medium':
                return <FaFlag className={styles.filterPriorityIcon} style={{color: '#f59e0b'}} />
            case 'low':
                return <FaRegFlag className={styles.filterPriorityIcon} style={{color: '#10b981'}} />
            default:
                return <FaRegFlag className={styles.filterPriorityIcon} />
        }
    }

    const toggleBoardExpansion = (boardId: number): void => {
        setExpandedBoards(prev => ({
            ...prev,
            [boardId]: !prev[boardId]
        }))
    }

    const toggleBoardCollapse = (boardId: number): void => {
        setCollapsedBoards(prev => ({
            ...prev,
            [boardId]: !prev[boardId]
        }))
    }

    const handleSortChange = (option: SortOption): void => {
        setSortOption(option)
    }

    const handleFilterChange = (option: FilterOption): void => {
        setFilterOption(option)
    }

    const openTreeView = (): void => {
        setIsTreeViewOpen(true)
    }

    const closeTreeView = (): void => {
        setIsTreeViewOpen(false)
    }

    const openAddCardModal = (): void => {
        setIsAddCardModalOpen(true)
    }

    const closeAddCardModal = (): void => {
        setIsAddCardModalOpen(false)
    }

    const handleAddCard = (data: { card: Card; boardIds: number[] }) => {
        const updatedBoards = boards.map(board =>
            data.boardIds.includes(board.id)
                ? { ...board, cards: [...board.cards, data.card] }
                : board
        )
        setBoards(updatedBoards)
    }

    const handleEditCard = (card: Card) => {
        // Здесь будет логика для редактирования карточки
        console.log('Редактировать карточку:', card)
        // Можно открыть модальное окно редактирования
        alert(`Редактирование карточки: ${card.title}`)
    }

    const handleDeleteCard = (cardId: number) => {
        const cardToDelete = boards
            .flatMap(board => board.cards)
            .find(card => card.id === cardId)

        if (cardToDelete) {
            setDeleteConfirmation({
                isOpen: true,
                cardId,
                cardTitle: cardToDelete.title
            })
        }
    }

    const confirmDelete = () => {
        if (deleteConfirmation.cardId) {
            const updatedBoards = boards.map(board => ({
                ...board,
                cards: board.cards.filter(card => card.id !== deleteConfirmation.cardId)
            }))
            setBoards(updatedBoards)
            setDeleteConfirmation({ isOpen: false, cardId: null, cardTitle: '' })
        }
    }

    const cancelDelete = () => {
        setDeleteConfirmation({ isOpen: false, cardId: null, cardTitle: '' })
    }

    const filterAndSortCards = (cards: Card[]): Card[] => {
        let filteredCards = [...cards]

        if (searchQuery) {
            filteredCards = filteredCards.filter(card =>
                card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                card.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                card.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            )
        }

        if (filterOption !== 'all') {
            filteredCards = filteredCards.filter(card => card.priority === filterOption)
        }

        switch (sortOption) {
            case 'alphabet':
                filteredCards.sort((a, b) => a.title.localeCompare(b.title))
                break
            case 'priority':
                filteredCards.sort((a, b) => b.priorityLevel - a.priorityLevel)
                break
            case 'author':
                filteredCards.sort((a, b) => a.author.name.localeCompare(b.author.name))
                break
            default:
                break
        }

        return filteredCards
    }

    return (
        <div className={styles.boardsSection}>
            <div className={styles.boardsHeader}>
                <div className={styles.headerTop}>
                    <div className={styles.titleSection}>
                        <h1 className={styles.pageTitle}>Мои доски</h1>
                        <p className={styles.pageSubtitle}>
                            Управляйте задачами и отслеживайте прогресс по проектам
                        </p>
                    </div>
                </div>

                <div className={styles.controlsSection}>
                    <div className={styles.searchContainer}>
                        <div className={styles.searchBox}>
                            <FaSearch className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Поиск задач..."
                                className={styles.searchInput}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={styles.controlButtons}>
                        <button
                            className={styles.treeViewBtn}
                            onClick={openTreeView}
                        >
                            <FaSitemap className={styles.treeViewIcon} />
                            Показать дерево
                        </button>

                        <div className={styles.filterContainer}>
                            <button
                                className={styles.filterBtn}
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                            >
                                <FaFilter className={styles.filterIcon} />
                                Фильтр и сортировка
                                {isFilterOpen ? <FaChevronUp /> : <FaChevronDown />}
                            </button>

                            {isFilterOpen && (
                                <div className={styles.filterDropdown}>
                                    <div className={styles.filterSection}>
                                        <h4>Сортировка</h4>
                                        <div className={styles.filterOptions}>
                                            <button
                                                className={`${styles.filterOption} ${sortOption === 'default' ? styles.active : ''}`}
                                                onClick={() => handleSortChange('default')}
                                            >
                                                По умолчанию
                                            </button>
                                            <button
                                                className={`${styles.filterOption} ${sortOption === 'alphabet' ? styles.active : ''}`}
                                                onClick={() => handleSortChange('alphabet')}
                                            >
                                                <FaSortAlphaDown /> По алфавиту
                                            </button>
                                            <button
                                                className={`${styles.filterOption} ${sortOption === 'priority' ? styles.active : ''}`}
                                                onClick={() => handleSortChange('priority')}
                                            >
                                                <FaExclamationCircle /> По важности
                                            </button>
                                            <button
                                                className={`${styles.filterOption} ${sortOption === 'author' ? styles.active : ''}`}
                                                onClick={() => handleSortChange('author')}
                                            >
                                                <FaUserCircle /> По исполнителю
                                            </button>
                                        </div>
                                    </div>

                                    <div className={styles.filterSection}>
                                        <h4>Фильтр по приоритету</h4>
                                        <div className={styles.filterOptions}>
                                            <button
                                                className={`${styles.filterOption} ${filterOption === 'all' ? styles.active : ''}`}
                                                onClick={() => handleFilterChange('all')}
                                            >
                                                Все задачи
                                            </button>
                                            <button
                                                className={`${styles.filterOption} ${filterOption === 'high' ? styles.active : ''}`}
                                                onClick={() => handleFilterChange('high')}
                                            >
                                                {getFilterPriorityIcon('high')} Высокий приоритет
                                            </button>
                                            <button
                                                className={`${styles.filterOption} ${filterOption === 'medium' ? styles.active : ''}`}
                                                onClick={() => handleFilterChange('medium')}
                                            >
                                                {getFilterPriorityIcon('medium')} Средний приоритет
                                            </button>
                                            <button
                                                className={`${styles.filterOption} ${filterOption === 'low' ? styles.active : ''}`}
                                                onClick={() => handleFilterChange('low')}
                                            >
                                                {getFilterPriorityIcon('low')} Низкий приоритет
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.boardsContainer}>
                <div className={styles.boardsGrid}>
                    {boards.map((board) => {
                        const filteredCards = filterAndSortCards(board.cards)
                        const isExpanded = expandedBoards[board.id]
                        const isCollapsed = collapsedBoards[board.id]
                        const hasMultipleCards = filteredCards.length > 1
                        const showExpandButton = hasMultipleCards

                        return (
                            <div key={board.id} className={styles.boardColumn}>
                                <div
                                    className={styles.boardHeader}
                                    style={{borderLeftColor: board.color}}
                                    onClick={() => toggleBoardCollapse(board.id)}
                                >
                                    <div className={styles.boardTitleSection}>
                                        <div className={styles.collapseIcon}>
                                            {isCollapsed ? <FaChevronRight /> : <FaChevronDown />}
                                        </div>
                                        <div className={styles.boardColorIndicator} style={{backgroundColor: board.color}}></div>
                                        <h3 className={styles.boardTitle}>{board.title}</h3>
                                    </div>
                                    <div className={styles.boardHeaderRight}>
                                        <span className={styles.cardsCount}>{filteredCards.length}</span>
                                        {showExpandButton && !isCollapsed && (
                                            <button
                                                className={styles.expandBtn}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleBoardExpansion(board.id);
                                                }}
                                            >
                                                {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                                {!isExpanded && (
                                                    <span className={styles.hiddenCardsCount}>+{filteredCards.length - 1}</span>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {!isCollapsed && (
                                    <div className={styles.cardsList}>
                                        {filteredCards.length > 0 ? (
                                            <>
                                                <TaskCard
                                                    key={filteredCards[0].id}
                                                    card={filteredCards[0]}
                                                    getPriorityColor={getPriorityColor}
                                                    getPriorityBgColor={getPriorityBgColor}
                                                    onEdit={handleEditCard}
                                                    onDelete={handleDeleteCard}
                                                />

                                                {isExpanded && filteredCards.slice(1).map((card) => (
                                                    <TaskCard
                                                        key={card.id}
                                                        card={card}
                                                        getPriorityColor={getPriorityColor}
                                                        getPriorityBgColor={getPriorityBgColor}
                                                        onEdit={handleEditCard}
                                                        onDelete={handleDeleteCard}
                                                    />
                                                ))}

                                                {!isExpanded && hasMultipleCards && (
                                                    <div className={styles.hiddenCardsIndicator}>
                                                        <span className={styles.hiddenCardsText}>
                                                            Еще {filteredCards.length - 1} задач{filteredCards.length - 1 > 1 ? 'и' : 'а'}
                                                        </span>
                                                        <button
                                                            className={styles.showMoreBtn}
                                                            onClick={() => toggleBoardExpansion(board.id)}
                                                        >
                                                            Показать все
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className={styles.noCardsMessage}>
                                                Нет задач, соответствующих фильтрам
                                            </div>
                                        )}

                                        <button
                                            className={styles.addCardBtn}
                                            onClick={openAddCardModal}
                                        >
                                            <FaPlus className={styles.addCardIcon} />
                                            Добавить карточку
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            <TreeViewModal
                isOpen={isTreeViewOpen}
                onClose={closeTreeView}
                boards={boards}
                getPriorityColor={getPriorityColor}
            />

            <AddCardModal
                isOpen={isAddCardModalOpen}
                onClose={closeAddCardModal}
                onSave={handleAddCard}
                boards={boards}
                authors={authors}
            />

            <ConfirmationModal
                isOpen={deleteConfirmation.isOpen}
                onClose={cancelDelete}
                onConfirm={confirmDelete}
                title="Удаление карточки"
                message={`Вы уверены, что хотите удалить карточку "${deleteConfirmation.cardTitle}"? Это действие нельзя отменить.`}
                confirmText="Удалить карточку"
                cancelText="Отмена"
            />
        </div>
    )
}

export default BoardsSection