'use client'

import { JSX, useState, useEffect, useCallback, useMemo } from 'react'
import {
    FaTimes,
    FaFile,
    FaFolder,
    FaFolderOpen,
    FaChevronRight,
    FaChevronDown,
    FaUserCircle,
    FaPaperclip,
    FaDownload,
    FaCode,
    FaImage,
    FaFilePdf,
    FaFileWord,
    FaFileExcel,
    FaTag,
    FaSearch,
    FaFilter,
    FaSortAmountDown,
    FaUsers,
    FaChartBar,
    FaDatabase,
    FaCheckCircle,
    FaClock,
    FaExclamationTriangle,
    FaCopy,
    FaEye,
    FaEyeSlash,
    FaExternalLinkAlt,
    FaShare,
    FaStar,
    FaRegStar
} from 'react-icons/fa'
import styles from './TreeViewModal.module.css'
import { api } from '@/app/auth/hooks/useTokenRefresh'

type Priority = 'low' | 'medium' | 'high'

interface Author {
    id: number
    name: string
    avatar: string | null
    role: string
    email: string
}

interface Attachment {
    id: number
    fileName: string
    fileSize: number
    contentType: string
    createdAt: string
    createdBy: number
}

interface Card {
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
    createdAt: string
    status: 'todo' | 'in-progress' | 'review' | 'done'
}

interface Board {
    id: number
    title: string
    color: string
    cards: Card[]
}

interface TreeViewModalProps {
    isOpen: boolean
    onClose: () => void
    boards: Board[]
    getPriorityColor: (priority: Priority) => string
}

interface TreeNode {
    id: string
    name: string
    type: 'board' | 'card' | 'file' | 'folder'
    children?: TreeNode[]
    data?: Card | Board | Attachment
    expanded?: boolean
    badge?: {
        count: number
        color: string
    }
}

interface SearchResult {
    node: TreeNode
    path: string[]
    matchScore: number
}

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

const TreeViewModal = ({ isOpen, onClose, boards, getPriorityColor }: TreeViewModalProps) => {
    const [treeData, setTreeData] = useState<TreeNode[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState<'all' | 'board' | 'card' | 'file'>('all')
    const [sortBy, setSortBy] = useState<'name' | 'priority' | 'date'>('name')
    const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null)
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
    const [isLoading, setIsLoading] = useState(false)
    const [showEmpty, setShowEmpty] = useState(false)
    const [favoriteNodes, setFavoriteNodes] = useState<Set<string>>(new Set())
    const [cardAttachments, setCardAttachments] = useState<Map<number, Attachment[]>>(new Map())
    const [loadingAttachments, setLoadingAttachments] = useState<Set<number>>(new Set())

    useEffect(() => {
        const generateTreeData = () => {
            return boards.map(board => ({
                id: `board-${board.id}`,
                name: board.title,
                type: 'board',
                data: board,
                expanded: true,
                badge: {
                    count: board.cards.length,
                    color: board.color
                },
                children: board.cards.map(card => ({
                    id: `card-${card.id}`,
                    name: card.title,
                    type: 'card',
                    data: card,
                    expanded: false,
                    badge: {
                        count: card.attachments,
                        color: getPriorityColor(card.priority)
                    }
                }))
            }))
        }

        if (isOpen) {
            setIsLoading(true)
            setTreeData(generateTreeData())
            setIsLoading(false)

            const initialExpanded = new Set(['board-1', 'board-2'])
            setExpandedNodes(initialExpanded)
        }
    }, [isOpen, boards, getPriorityColor])

    const loadCardAttachments = useCallback(async (cardId: number) => {
        if (loadingAttachments.has(cardId) || cardAttachments.has(cardId)) return

        setLoadingAttachments(prev => new Set(prev).add(cardId))

        try {
            const response = await api.get(`/issues/${cardId}`)
            const issue = response.data

            if (issue.attachments && issue.attachments.length > 0) {
                setCardAttachments(prev => {
                    const newMap = new Map(prev)
                    newMap.set(cardId, issue.attachments)
                    return newMap
                })
            }
        } catch (error) {
            console.error('Ошибка при загрузке файлов карточки:', error)
        } finally {
            setLoadingAttachments(prev => {
                const newSet = new Set(prev)
                newSet.delete(cardId)
                return newSet
            })
        }
    }, [loadingAttachments, cardAttachments])

    const toggleNode = useCallback((nodeId: string) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev)
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId)
            } else {
                newSet.add(nodeId)
            }
            return newSet
        })
    }, [])

    const toggleAll = useCallback((expand: boolean) => {
        if (expand) {
            const allNodeIds: string[] = []
            const collectIds = (nodes: TreeNode[]) => {
                nodes.forEach(node => {
                    allNodeIds.push(node.id)
                    if (node.children) {
                        collectIds(node.children)
                    }
                })
            }
            collectIds(treeData)
            setExpandedNodes(new Set(allNodeIds))
        } else {
            setExpandedNodes(new Set())
        }
    }, [treeData])

    const getFileIcon = useCallback((fileType: string) => {
        const iconProps = { className: styles.fileIcon }
        const lowerType = fileType.toLowerCase()

        if (lowerType.includes('pdf')) return <FaFilePdf {...iconProps} style={{ color: '#ef4444' }} />
        if (lowerType.includes('word') || lowerType.includes('doc')) return <FaFileWord {...iconProps} style={{ color: '#2563eb' }} />
        if (lowerType.includes('excel') || lowerType.includes('xls')) return <FaFileExcel {...iconProps} style={{ color: '#16a34a' }} />
        if (lowerType.includes('json') || lowerType.includes('js') || lowerType.includes('ts') ||
            lowerType.includes('xml') || lowerType.includes('code')) return <FaCode {...iconProps} style={{ color: '#7c3aed' }} />
        if (lowerType.includes('image') || lowerType.includes('jpg') || lowerType.includes('png') ||
            lowerType.includes('gif') || lowerType.includes('svg')) return <FaImage {...iconProps} style={{ color: '#ec4899' }} />
        return <FaFile {...iconProps} style={{ color: '#64748b' }} />
    }, [])

    const getPriorityLabel = useCallback((priority: Priority) => {
        switch (priority) {
            case 'high': return 'Высокий'
            case 'medium': return 'Средний'
            case 'low': return 'Низкий'
            default: return 'Не указан'
        }
    }, [])

    const getStatusIcon = useCallback((status: string) => {
        switch (status) {
            case 'done': return <FaCheckCircle style={{ color: '#10b981' }} />
            case 'in-progress': return <FaClock style={{ color: '#f59e0b' }} />
            case 'review': return <FaExclamationTriangle style={{ color: '#3b82f6' }} />
            case 'todo': return <FaExclamationTriangle style={{ color: '#64748b' }} />
            default: return <FaClock style={{ color: '#64748b' }} />
        }
    }, [])

    const toggleFavorite = useCallback((nodeId: string) => {
        setFavoriteNodes(prev => {
            const newSet = new Set(prev)
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId)
            } else {
                newSet.add(nodeId)
            }
            return newSet
        })
    }, [])

    const handleDownload = async (attachment: Attachment, cardId: number) => {
        try {
            const response = await api.get(`/issues/${cardId}/attachments/${attachment.id}`, {
                responseType: 'blob'
            })

            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', attachment.fileName)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Ошибка при скачивании файла:', error)
        }
    }

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return []

        const results: SearchResult[] = []

        const searchNode = (node: TreeNode, path: string[] = []): number => {
            let matchScore = 0

            if (node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                matchScore += 100
            }

            if (node.type === filterType || filterType === 'all') {
                matchScore += 50
            }

            if (node.data) {
                if ((node.data as Card).title?.toLowerCase().includes(searchQuery.toLowerCase())) {
                    matchScore += 80
                }
                if ((node.data as Card).description?.toLowerCase().includes(searchQuery.toLowerCase())) {
                    matchScore += 30
                }
                if ((node.data as Card).tags?.some((tag: string) =>
                    tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
                    matchScore += 40
                }
            }

            if (matchScore > 0) {
                results.push({
                    node,
                    path,
                    matchScore
                })
            }

            if (node.children) {
                node.children.forEach(child => {
                    searchNode(child, [...path, node.name])
                })
            }

            return matchScore
        }

        treeData.forEach(node => searchNode(node))

        return results.sort((a, b) => b.matchScore - a.matchScore)
    }, [searchQuery, treeData, filterType])

    const filteredTreeData = useMemo(() => {
        if (!searchQuery.trim()) return treeData

        const shouldShowNode = (node: TreeNode): boolean => {
            return searchResults.some(result => result.node.id === node.id) ||
                node.children?.some(child => shouldShowNode(child))
        }

        const filterNodes = (nodes: TreeNode[]): TreeNode[] => {
            return nodes
                .filter(shouldShowNode)
                .map(node => ({
                    ...node,
                    children: node.children ? filterNodes(node.children) : undefined
                }))
        }

        return filterNodes(treeData)
    }, [treeData, searchQuery, searchResults])

    const TreeNode = ({ node, level = 0, path = [] }: {
        node: TreeNode;
        level?: number;
        path?: string[]
    }) => {
        const hasChildren = node.children && node.children.length > 0
        const isExpanded = expandedNodes.has(node.id)
        const isFavorite = favoriteNodes.has(node.id)
        const isSelected = selectedNode?.id === node.id
        const isBoard = node.type === 'board'
        const isCard = node.type === 'card'
        const isFile = node.type === 'file'
        const isFolder = node.type === 'folder'

        const handleClick = () => {
            if (isCard) {
                const card = node.data as Card
                setSelectedNode(node)
                if (!cardAttachments.has(card.id) && !loadingAttachments.has(card.id)) {
                    loadCardAttachments(card.id)
                }
            } else {
                if (hasChildren) {
                    toggleNode(node.id)
                }
                setSelectedNode(node)
            }
        }

        const handleFavorite = (e: React.MouseEvent) => {
            e.stopPropagation()
            toggleFavorite(node.id)
        }

        const handleCopyPath = (e: React.MouseEvent) => {
            e.stopPropagation()
            const fullPath = [...path, node.name].join(' → ')
            navigator.clipboard.writeText(fullPath)
        }

        const renderNodeIcon = () => {
            if (isFolder) {
                return isExpanded ?
                    <FaFolderOpen className={styles.treeFolderIcon} /> :
                    <FaFolder className={styles.treeFolderIcon} />
            }
            if (isCard) {
                return isExpanded ?
                    <FaFolderOpen className={styles.treeFolderIcon} /> :
                    <FaFolder className={styles.treeFolderIcon} />
            }
            if (isBoard) {
                return (
                    <div
                        className={styles.treeBoardIcon}
                        style={{ backgroundColor: (node.data as Board)?.color }}
                    />
                )
            }
            if (isFile) {
                return getFileIcon((node.data as Attachment).contentType)
            }
            return null
        }

        const renderNodeBadge = () => {
            if (node.badge) {
                return (
                    <span
                        className={styles.treeNodeBadge}
                        style={{
                            backgroundColor: node.badge.color,
                            color: node.badge.color === '#ffffff' ? '#000' : '#fff'
                        }}
                    >
                        {node.badge.count}
                    </span>
                )
            }
            return null
        }

        const renderNodeActions = () => {
            return (
                <div className={styles.treeNodeActions}>
                    <button
                        className={styles.treeNodeAction}
                        onClick={handleFavorite}
                        title={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
                    >
                        {isFavorite ? <FaStar /> : <FaRegStar />}
                    </button>
                    <button
                        className={styles.treeNodeAction}
                        onClick={handleCopyPath}
                        title="Копировать путь"
                    >
                        <FaCopy />
                    </button>
                </div>
            )
        }

        return (
            <div className={styles.treeNode}>
                <div
                    className={`${styles.treeNodeHeader} ${
                        isBoard ? styles.boardNode :
                            isCard ? styles.cardNode :
                                isFolder ? styles.folderNode :
                                    styles.fileNode
                    } ${isSelected ? styles.selectedNode : ''}`}
                    style={{
                        paddingLeft: `${level * 24 + 16}px`,
                    }}
                    onClick={handleClick}
                >
                    <div className={styles.treeNodeLeft}>
                        {hasChildren && (
                            <span
                                className={styles.treeExpandIcon}
                                style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                            >
                                <FaChevronRight />
                            </span>
                        )}

                        {!hasChildren && !isFile && (
                            <span className={styles.treePlaceholder} />
                        )}

                        {renderNodeIcon()}

                        <span className={styles.treeNodeName} title={node.name}>
                            {node.name}
                        </span>

                        {renderNodeBadge()}
                    </div>

                    <div className={styles.treeNodeRight}>
                        {isCard && (
                            <div
                                className={styles.treePriorityBadge}
                                style={{
                                    backgroundColor: getPriorityColor((node.data as Card).priority),
                                }}
                                title={`Приоритет: ${getPriorityLabel((node.data as Card).priority)}`}
                            >
                                {getPriorityLabel((node.data as Card).priority)}
                            </div>
                        )}

                        {renderNodeActions()}
                    </div>
                </div>

                {isExpanded && hasChildren && (
                    <div className={styles.treeChildren}>
                        {node.children!.map(child => (
                            <TreeNode
                                key={child.id}
                                node={child}
                                level={level + 1}
                                path={[...path, node.name]}
                            />
                        ))}
                    </div>
                )}
            </div>
        )
    }

    const handleExport = useCallback(() => {
        const exportData = {
            timestamp: new Date().toISOString(),
            totalBoards: boards.length,
            totalCards: boards.reduce((acc, board) => acc + board.cards.length, 0),
            structure: treeData
        }

        const dataStr = JSON.stringify(exportData, null, 2)
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)

        const exportFileDefaultName = `project-structure-${new Date().toISOString().split('T')[0]}.json`

        const linkElement = document.createElement('a')
        linkElement.setAttribute('href', dataUri)
        linkElement.setAttribute('download', exportFileDefaultName)
        linkElement.click()
    }, [treeData, boards])

    const projectStats = useMemo(() => {
        const totalCards = boards.reduce((acc, board) => acc + board.cards.length, 0)
        const totalAttachments = boards.reduce((acc, board) =>
            acc + board.cards.reduce((cardAcc, card) => cardAcc + (card.attachments || 0), 0), 0
        )
        const completedCards = boards.reduce((acc, board) =>
            acc + board.cards.filter(card => card.status === 'done').length, 0
        )
        const highPriorityCards = boards.reduce((acc, board) =>
            acc + board.cards.filter(card => card.priority === 'high').length, 0
        )

        return {
            totalBoards: boards.length,
            totalCards,
            totalAttachments,
            completedCards,
            completionRate: totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0,
            highPriorityCards
        }
    }, [boards])

    const selectedCard = selectedNode?.type === 'card' ? selectedNode.data as Card : null
    const selectedCardAttachments = selectedCard ? cardAttachments.get(selectedCard.id) : null

    if (!isOpen) return null

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div
                className={styles.treeModal}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.modalHeader}>
                    <div className={styles.modalHeaderLeft}>
                        <h2 className={styles.modalTitle}>
                            <FaDatabase className={styles.titleIcon} />
                            Древовидная структура проекта
                        </h2>
                        <p className={styles.modalSubtitle}>
                            Интерактивное представление всех задач, файлов и взаимосвязей
                        </p>
                    </div>
                    <div className={styles.modalHeaderActions}>
                        <button
                            className={styles.headerButton}
                            onClick={handleExport}
                            title="Экспорт структуры"
                        >
                            <FaShare />
                            Экспорт
                        </button>
                        <button
                            className={styles.closeButton}
                            onClick={onClose}
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>

                <div className={styles.modalContent}>
                    <div className={styles.controlsSection}>
                        <div className={styles.searchContainer}>
                            <FaSearch className={styles.searchIcon} />
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Поиск по названию, тегам, описанию..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    className={styles.clearSearch}
                                    onClick={() => setSearchQuery('')}
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>

                        <div className={styles.controlButtons}>
                            <div className={styles.filterGroup}>
                                <FaFilter className={styles.controlIcon} />
                                <select
                                    className={styles.filterSelect}
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value as any)}
                                >
                                    <option value="all">Все типы</option>
                                    <option value="board">Доски</option>
                                    <option value="card">Задачи</option>
                                    <option value="file">Файлы</option>
                                </select>
                            </div>

                            <div className={styles.sortGroup}>
                                <FaSortAmountDown className={styles.controlIcon} />
                                <select
                                    className={styles.sortSelect}
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                >
                                    <option value="name">По имени</option>
                                    <option value="priority">По приоритету</option>
                                    <option value="date">По дате</option>
                                </select>
                            </div>

                            <div className={styles.viewControls}>
                                <button
                                    className={styles.viewButton}
                                    onClick={() => toggleAll(true)}
                                    title="Развернуть все"
                                >
                                    <FaChevronDown />
                                </button>
                                <button
                                    className={styles.viewButton}
                                    onClick={() => toggleAll(false)}
                                    title="Свернуть все"
                                >
                                    <FaChevronRight />
                                </button>
                                <button
                                    className={styles.viewButton}
                                    onClick={() => setShowEmpty(!showEmpty)}
                                    title={showEmpty ? "Скрыть пустые" : "Показать пустые"}
                                >
                                    {showEmpty ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        {searchQuery && searchResults.length > 0 && (
                            <div className={styles.searchResults}>
                                <span className={styles.resultsCount}>
                                    Найдено: {searchResults.length} совпадений
                                </span>
                            </div>
                        )}
                    </div>

                    <div className={styles.treeContainer}>
                        <div className={styles.treeSection}>
                            <div className={styles.treeHeader}>
                                <div className={styles.treeHeaderLeft}>
                                    <h3 className={styles.treeSectionTitle}>
                                        <FaFolderOpen className={styles.sectionIcon} />
                                        Структура проекта
                                        {isLoading && (
                                            <span className={styles.loadingIndicator}>
                                                Загрузка...
                                            </span>
                                        )}
                                    </h3>
                                    <div className={styles.treeStats}>
                                        <span className={styles.statItem}>
                                            <FaDatabase />
                                            {boards.length} досок
                                        </span>
                                        <span className={styles.statItem}>
                                            <FaTag />
                                            {projectStats.totalCards} задач
                                        </span>
                                        <span className={styles.statItem}>
                                            <FaPaperclip />
                                            {projectStats.totalAttachments} файлов
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.treeWrapper}>
                                {isLoading ? (
                                    <div className={styles.loadingContainer}>
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className={styles.skeletonNode} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className={styles.tree}>
                                        {filteredTreeData.length === 0 ? (
                                            <div className={styles.emptyState}>
                                                <FaDatabase className={styles.emptyIcon} />
                                                <h4>Нет данных для отображения</h4>
                                                <p>Данные проекта не найдены</p>
                                            </div>
                                        ) : (
                                            filteredTreeData.map(node => (
                                                <TreeNode key={node.id} node={node} />
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.detailsSection}>
                            <div className={styles.detailsHeader}>
                                <h3 className={styles.detailsTitle}>
                                    <FaChartBar className={styles.sectionIcon} />
                                    {selectedNode ? 'Детали' : 'Обзор проекта'}
                                </h3>
                                {selectedNode && (
                                    <button className={styles.externalLink}>
                                        <FaExternalLinkAlt />
                                    </button>
                                )}
                            </div>

                            <div className={styles.detailsContent}>
                                {selectedNode ? (
                                    <div className={styles.nodeDetails}>
                                        <div className={styles.nodeHeader}>
                                            <div className={styles.nodeIconLarge}>
                                                {selectedNode.type === 'board' ? (
                                                    <div
                                                        className={styles.boardIconLarge}
                                                        style={{ backgroundColor: (selectedNode.data as Board)?.color }}
                                                    />
                                                ) : selectedNode.type === 'card' ? (
                                                    <FaFolderOpen className={styles.cardIconLarge} />
                                                ) : (
                                                    <FaFolderOpen className={styles.folderIconLarge} />
                                                )}
                                            </div>
                                            <div className={styles.nodeInfo}>
                                                <h4 className={styles.nodeTitle}>{selectedNode.name}</h4>
                                                <span className={styles.nodeType}>
                                                    Тип: {selectedNode.type === 'board' ? 'Доска' :
                                                    selectedNode.type === 'card' ? 'Задача' : 'Папка'}
                                                </span>
                                                {selectedNode.data?.createdAt && (
                                                    <span className={styles.nodeDate}>
                                                        Создано: {new Date(selectedNode.data.createdAt).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {selectedNode.type === 'card' && selectedCard && (
                                            <div className={styles.cardDetails}>
                                                <div className={styles.detailRow}>
                                                    <span className={styles.detailLabel}>Приоритет:</span>
                                                    <div className={styles.detailValue}>
                                                        <div
                                                            className={styles.priorityIndicator}
                                                            style={{ backgroundColor: getPriorityColor(selectedCard.priority) }}
                                                        />
                                                        {getPriorityLabel(selectedCard.priority)}
                                                    </div>
                                                </div>
                                                <div className={styles.detailRow}>
                                                    <span className={styles.detailLabel}>Статус:</span>
                                                    <div className={styles.detailValue}>
                                                        {getStatusIcon(selectedCard.status)}
                                                        {selectedCard.status === 'done' ? 'Завершено' :
                                                            selectedCard.status === 'in-progress' ? 'В работе' :
                                                                selectedCard.status === 'review' ? 'На проверке' : 'К выполнению'}
                                                    </div>
                                                </div>
                                                <div className={styles.detailRow}>
                                                    <span className={styles.detailLabel}>Исполнители:</span>
                                                    <div className={styles.assigneesContainer}>
                                                        {(selectedCard.assignees || [selectedCard.author]).map((assignee, index) => (
                                                            <div key={index} className={styles.assigneeItem}>
                                                                <div className={styles.assigneeAvatar}>
                                                                    {assignee.avatar ? (
                                                                        <img src={assignee.avatar} alt={assignee.name} />
                                                                    ) : (
                                                                        <FaUserCircle />
                                                                    )}
                                                                </div>
                                                                <div className={styles.assigneeInfo}>
                                                                    <span className={styles.assigneeName}>{assignee.name}</span>
                                                                    <span className={styles.assigneeRole}>{assignee.role}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className={styles.detailRow}>
                                                    <span className={styles.detailLabel}>Теги:</span>
                                                    <div className={styles.tagsContainer}>
                                                        {selectedCard.tags?.map((tag: string, index: number) => (
                                                            <span key={index} className={styles.tag}>
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className={styles.detailRow}>
                                                    <span className={styles.detailLabel}>Файлы:</span>
                                                    <div className={styles.attachmentsContainer}>
                                                        {loadingAttachments.has(selectedCard.id) ? (
                                                            <div className={styles.loadingFiles}>
                                                                Загрузка файлов...
                                                            </div>
                                                        ) : selectedCardAttachments && selectedCardAttachments.length > 0 ? (
                                                            selectedCardAttachments.map((file) => (
                                                                <div key={file.id} className={styles.fileItem}>
                                                                    <div className={styles.fileIcon}>
                                                                        {getFileIcon(file.contentType)}
                                                                    </div>
                                                                    <div className={styles.fileInfo}>
                                                                        <span className={styles.fileName} title={file.fileName}>
                                                                            {file.fileName}
                                                                        </span>
                                                                        <span className={styles.fileSize}>{formatFileSize(file.fileSize)}</span>
                                                                    </div>
                                                                    <button
                                                                        className={styles.downloadButton}
                                                                        onClick={() => handleDownload(file, selectedCard.id)}
                                                                        title="Скачать"
                                                                    >
                                                                        <FaDownload />
                                                                    </button>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className={styles.noFiles}>
                                                                <FaPaperclip />
                                                                <span>Нет прикрепленных файлов</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className={styles.projectOverview}>
                                        <div className={styles.overviewStats}>
                                            <div className={styles.statCard}>
                                                <FaDatabase className={styles.statIcon} />
                                                <div className={styles.statContent}>
                                                    <span className={styles.statNumber}>{projectStats.totalBoards}</span>
                                                    <span className={styles.statLabel}>Досок</span>
                                                </div>
                                            </div>
                                            <div className={styles.statCard}>
                                                <FaTag className={styles.statIcon} />
                                                <div className={styles.statContent}>
                                                    <span className={styles.statNumber}>{projectStats.totalCards}</span>
                                                    <span className={styles.statLabel}>Задач</span>
                                                </div>
                                            </div>
                                            <div className={styles.statCard}>
                                                <FaCheckCircle className={styles.statIcon} style={{ color: '#10b981' }} />
                                                <div className={styles.statContent}>
                                                    <span className={styles.statNumber}>{projectStats.completionRate}%</span>
                                                    <span className={styles.statLabel}>Завершено</span>
                                                </div>
                                            </div>
                                            <div className={styles.statCard}>
                                                <FaExclamationTriangle className={styles.statIcon} style={{ color: '#ef4444' }} />
                                                <div className={styles.statContent}>
                                                    <span className={styles.statNumber}>{projectStats.highPriorityCards}</span>
                                                    <span className={styles.statLabel}>Высокий приоритет</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TreeViewModal