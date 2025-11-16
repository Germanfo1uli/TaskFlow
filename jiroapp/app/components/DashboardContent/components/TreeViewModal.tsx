'use client'

import { JSX, useState } from 'react'
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
    FaTag
} from 'react-icons/fa'
import styles from './TreeViewModal.module.css'

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

interface TreeViewModalProps {
    isOpen: boolean
    onClose: () => void
    boards: Board[]
    getPriorityColor: (priority: Priority) => string
}

interface TreeNode {
    id: string
    name: string
    type: 'board' | 'card' | 'file'
    children?: TreeNode[]
    data?: Card | Board | any
    expanded?: boolean
}

const TreeViewModal = ({ isOpen, onClose, boards, getPriorityColor }: TreeViewModalProps) => {
    const [treeData, setTreeData] = useState<TreeNode[]>(() => {
        const generateFiles = (cardId: number) => [
            { id: `${cardId}-1`, name: 'Техническое задание.docx', size: '2.4 MB', type: 'word' },
            { id: `${cardId}-2`, name: 'Дизайн макет.sketch', size: '5.1 MB', type: 'design' },
            { id: `${cardId}-3`, name: 'requirements.pdf', size: '1.2 MB', type: 'pdf' },
            { id: `${cardId}-4`, name: 'api-specification.json', size: '0.8 MB', type: 'code' },
            { id: `${cardId}-5`, name: 'project-timeline.xlsx', size: '1.5 MB', type: 'excel' }
        ]

        return boards.map(board => ({
            id: `board-${board.id}`,
            name: board.title,
            type: 'board',
            data: board,
            expanded: true,
            children: board.cards.map(card => ({
                id: `card-${card.id}`,
                name: card.title,
                type: 'card',
                data: card,
                expanded: false,
                children: generateFiles(card.id).map(file => ({
                    id: file.id,
                    name: file.name,
                    type: 'file',
                    data: file
                }))
            }))
        }))
    })

    const toggleNode = (nodeId: string) => {
        const updateNode = (nodes: TreeNode[]): TreeNode[] => {
            return nodes.map(node => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        expanded: !node.expanded
                    }
                }
                if (node.children) {
                    return {
                        ...node,
                        children: updateNode(node.children)
                    }
                }
                return node
            })
        }

        setTreeData(prev => updateNode(prev))
    }

    const getFileIcon = (fileType: string) => {
        switch (fileType) {
            case 'pdf': return <FaFilePdf className={styles.fileIconPdf} />
            case 'word': return <FaFileWord className={styles.fileIconWord} />
            case 'excel': return <FaFileExcel className={styles.fileIconExcel} />
            case 'code': return <FaCode className={styles.fileIconCode} />
            case 'design': return <FaImage className={styles.fileIconDesign} />
            default: return <FaFile className={styles.fileIconDefault} />
        }
    }

    const getPriorityLabel = (priority: Priority) => {
        switch (priority) {
            case 'high': return 'Высокий'
            case 'medium': return 'Средний'
            case 'low': return 'Низкий'
            default: return 'Не указан'
        }
    }

    const TreeNode = ({ node, level = 0 }: { node: TreeNode; level?: number }) => {
        const hasChildren = node.children && node.children.length > 0
        const isExpanded = node.expanded
        const isBoard = node.type === 'board'
        const isCard = node.type === 'card'
        const isFile = node.type === 'file'

        return (
            <div className={styles.treeNode}>
                <div
                    className={`${styles.treeNodeHeader} ${
                        isBoard ? styles.boardNode :
                            isCard ? styles.cardNode :
                                styles.fileNode
                    }`}
                    style={{
                        paddingLeft: `${level * 20 + 12}px`,
                        marginLeft: level > 0 ? '8px' : '0'
                    }}
                    onClick={() => hasChildren && toggleNode(node.id)}
                >
                    <div className={styles.treeNodeLeft}>
                        {hasChildren && (
                            <span className={styles.treeExpandIcon}>
                                {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                            </span>
                        )}

                        {!hasChildren && isFile && (
                            getFileIcon(node.data?.type)
                        )}

                        {isCard && (
                            <span className={styles.treeFolderIcon}>
                                {isExpanded ? <FaFolderOpen /> : <FaFolder />}
                            </span>
                        )}

                        {isBoard && (
                            <div
                                className={styles.treeBoardIcon}
                                style={{ backgroundColor: (node.data as Board)?.color }}
                            />
                        )}

                        <span className={styles.treeNodeName}>{node.name}</span>
                    </div>

                    <div className={styles.treeNodeRight}>
                        {isCard && (
                            <div
                                className={styles.treePriorityBadge}
                                style={{
                                    backgroundColor: getPriorityColor((node.data as Card).priority),
                                    color: 'white'
                                }}
                            >
                                {getPriorityLabel((node.data as Card).priority)}
                            </div>
                        )}

                        {isFile && (
                            <span className={styles.fileSize}>{node.data.size}</span>
                        )}

                        {isBoard && (
                            <div className={styles.boardStats}>
                                <span className={styles.cardsCount}>
                                    {(node.data as Board).cards.length} задач
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {isExpanded && hasChildren && (
                    <div className={styles.treeChildren}>
                        {node.children!.map(child => (
                            <TreeNode key={child.id} node={child} level={level + 1} />
                        ))}
                    </div>
                )}
            </div>
        )
    }

    if (!isOpen) return null

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.treeModal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div className={styles.modalHeaderLeft}>
                        <h2 className={styles.modalTitle}>Древовидная структура проекта</h2>
                        <p className={styles.modalSubtitle}>Обзор всех задач и связанных файлов</p>
                    </div>
                    <button className={styles.closeButton} onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className={styles.modalContent}>
                    <div className={styles.treeContainer}>
                        <div className={styles.treeSection}>
                            <div className={styles.treeHeader}>
                                <h3 className={styles.treeSectionTitle}>
                                    <FaFolderOpen className={styles.sectionIcon} />
                                    Структура проекта
                                </h3>
                                <div className={styles.treeStats}>
                                    <span>{boards.length} досок</span>
                                    <span>•</span>
                                    <span>{boards.reduce((acc, board) => acc + board.cards.length, 0)} задач</span>
                                </div>
                            </div>
                            <div className={styles.tree}>
                                {treeData.map(node => (
                                    <TreeNode key={node.id} node={node} />
                                ))}
                            </div>
                        </div>

                        <div className={styles.detailsSection}>
                            <div className={styles.detailsHeader}>
                                <h3 className={styles.detailsTitle}>
                                    <FaTag className={styles.sectionIcon} />
                                    Информация о проекте
                                </h3>
                            </div>

                            <div className={styles.detailsContent}>
                                <div className={styles.projectOverview}>
                                    <h4 className={styles.sectionSubtitle}>Обзор проекта</h4>
                                    <div className={styles.overviewStats}>
                                        <div className={styles.statItem}>
                                            <span className={styles.statNumber}>{boards.length}</span>
                                            <span className={styles.statLabel}>Досок</span>
                                        </div>
                                        <div className={styles.statItem}>
                                            <span className={styles.statNumber}>
                                                {boards.reduce((acc, board) => acc + board.cards.length, 0)}
                                            </span>
                                            <span className={styles.statLabel}>Задач</span>
                                        </div>
                                        <div className={styles.statItem}>
                                            <span className={styles.statNumber}>
                                                {boards.reduce((acc, board) =>
                                                    acc + board.cards.reduce((cardAcc, card) => cardAcc + card.attachments, 0), 0)
                                                }
                                            </span>
                                            <span className={styles.statLabel}>Файлов</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.authorsSection}>
                                    <h4 className={styles.sectionSubtitle}>
                                        <FaUserCircle className={styles.subsectionIcon} />
                                        Команда проекта
                                    </h4>
                                    <div className={styles.authorsList}>
                                        <div className={styles.authorItem}>
                                            <FaUserCircle className={styles.authorAvatar} />
                                            <div className={styles.authorInfo}>
                                                <span className={styles.authorName}>Алексей Петров</span>
                                                <span className={styles.authorRole}>Team Lead</span>
                                            </div>
                                        </div>
                                        <div className={styles.authorItem}>
                                            <FaUserCircle className={styles.authorAvatar} />
                                            <div className={styles.authorInfo}>
                                                <span className={styles.authorName}>Мария Иванова</span>
                                                <span className={styles.authorRole}>Backend Developer</span>
                                            </div>
                                        </div>
                                        <div className={styles.authorItem}>
                                            <FaUserCircle className={styles.authorAvatar} />
                                            <div className={styles.authorInfo}>
                                                <span className={styles.authorName}>Иван Сидоров</span>
                                                <span className={styles.authorRole}>DevOps</span>
                                            </div>
                                        </div>
                                        <div className={styles.authorItem}>
                                            <FaUserCircle className={styles.authorAvatar} />
                                            <div className={styles.authorInfo}>
                                                <span className={styles.authorName}>Елена Козлова</span>
                                                <span className={styles.authorRole}>QA Engineer</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.filesSection}>
                                    <h4 className={styles.sectionSubtitle}>
                                        <FaPaperclip className={styles.subsectionIcon} />
                                        Файлы проекта
                                    </h4>
                                    <div className={styles.filesList}>
                                        {[
                                            { id: '1', name: 'project-roadmap.pdf', size: '3.2 MB', type: 'pdf' },
                                            { id: '2', name: 'database-schema.sql', size: '1.1 MB', type: 'code' },
                                            { id: '3', name: 'ui-design-system.sketch', size: '8.7 MB', type: 'design' },
                                            { id: '4', name: 'meeting-notes.docx', size: '0.9 MB', type: 'word' },
                                            { id: '5', name: 'technical-specification.docx', size: '2.1 MB', type: 'word' }
                                        ].map(file => (
                                            <div key={file.id} className={styles.fileItem}>
                                                {getFileIcon(file.type)}
                                                <div className={styles.fileInfo}>
                                                    <span className={styles.fileName}>{file.name}</span>
                                                    <span className={styles.fileSize}>{file.size}</span>
                                                </div>
                                                <button className={styles.downloadButton}>
                                                    <FaDownload />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TreeViewModal