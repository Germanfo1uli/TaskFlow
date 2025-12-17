import React, { useState, useMemo } from 'react'
import { Sprint, IssueStatus, SprintStatus, Tasks } from '../types/types'
import styles from './SprintItem.module.css'
import { FaChevronDown, FaChevronRight, FaEllipsisH, FaBug, FaCheckSquare, FaBookmark, FaBolt, FaUserCircle, FaTimes, FaBahai, FaBullseye } from 'react-icons/fa'

interface SprintItemProps {
    sprint: Sprint;
    onStartSprint: (sprintId: string | number) => void;
    onEditSprint: (sprintId: string | number) => void;
    onDeleteSprint: (sprintId: string | number) => void;
    onAddTasks: (sprintId: string | number) => void;
    onRemoveIssueFromSprint: (sprintId: string | number, issueId: string | number) => void;
}

const SprintItem = ({ sprint, onStartSprint, onEditSprint, onDeleteSprint, onAddTasks, onRemoveIssueFromSprint }: SprintItemProps) => {
    const [isExpanded, setIsExpanded] = useState(true)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const toggleExpand = () => setIsExpanded(!isExpanded)
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

    const stats = useMemo(() => {
        const notStarted = sprint.issues.filter(i =>
            [IssueStatus.TO_DO, IssueStatus.SELECTED_FOR_DEVELOPMENT].includes(i.status)
        ).length

        const inProgress = sprint.issues.filter(i =>
            [IssueStatus.IN_PROGRESS, IssueStatus.CODE_REVIEW, IssueStatus.QA, IssueStatus.STAGING].includes(i.status)
        ).length

        const done = sprint.issues.filter(i =>
            i.status === IssueStatus.DONE
        ).length

        const late = sprint.issues.filter(i => {
            if (i.status !== IssueStatus.DONE || !i.completedAt || !sprint.endDate) return false
            return new Date(i.completedAt) > new Date(sprint.endDate)
        }).length

        return { notStarted, inProgress, done, late }
    }, [sprint.issues, sprint.endDate])

    const formatDate = (date: Date | null) => {
        if (!date) return ''
        return new Date(date).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short'
        })
    }

    const getTaskIcon = (type: Tasks) => {
        switch (type) {
            case Tasks.BUG: return <FaBug color="#e5493a" />
            case Tasks.STORY: return <FaBookmark color="#63ba3c" />
            case Tasks.EPIC: return <FaBolt color="#904ee2" />
            case Tasks.TASK: return <FaBullseye color="#4bade8" />
            case Tasks.SUB_TASK: return <FaBahai color="#4bade8" />
            default: return <FaCheckSquare color="#4bade8" />
        }
    }

    return (
        <div className={styles.sprintItem}>
            <div className={`${styles.sprintHeader} ${!isExpanded ? styles.collapsed : ''}`}>
                <div className={styles.headerLeft}>
                    <button className={styles.expandButton} onClick={toggleExpand}>
                        {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                    </button>
                    <div className={styles.headerInfo}>
                        <div className={styles.titleRow}>
                            <h3 className={styles.sprintName}>{sprint.name}</h3>
                            {sprint.startDate && sprint.endDate && (
                                <span className={styles.dates}>
                                    {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                                </span>
                            )}
                            <span className={styles.issueCount}>
                                ({sprint.issues.length} issues)
                            </span>
                        </div>
                        {sprint.goal && <div className={styles.sprintGoal}>{sprint.goal}</div>}
                    </div>
                </div>

                <div className={styles.headerRight}>
                    <div className={styles.statsBadges}>
                        <div className={`${styles.badge} ${styles.badgeGrey}`} title="Не начаты">
                            {stats.notStarted}
                        </div>
                        <div className={`${styles.badge} ${styles.badgeBlue}`} title="В процессе">
                            {stats.inProgress}
                        </div>
                        <div className={`${styles.badge} ${styles.badgeGreen}`} title="Выполнены">
                            {stats.done}
                        </div>
                        {stats.late > 0 && (
                            <div className={`${styles.badge} ${styles.badgeRed}`} title="Выполнены с опозданием">
                                {stats.late}
                            </div>
                        )}
                    </div>

                    {sprint.status === SprintStatus.PLANNED && (
                        <button
                            className={styles.startSprintButton}
                            onClick={() => onStartSprint(sprint.id)}
                        >
                            Начать спринт
                        </button>
                    )}
                    {sprint.status === SprintStatus.ACTIVE && (
                        <button
                            className={`${styles.startSprintButton} ${styles.activeSprintButton}`}
                            disabled
                        >
                            В процессе
                        </button>
                    )}
                    {sprint.status === SprintStatus.COMPLETED && (
                        <button
                            className={`${styles.startSprintButton} ${styles.completedSprintButton}`}
                            disabled
                        >
                            Завершено
                        </button>
                    )}

                    <div className={styles.menuContainer}>
                        <button className={styles.menuButton} onClick={toggleMenu}>
                            <FaEllipsisH />
                        </button>
                        {isMenuOpen && (
                            <div className={styles.dropdownMenu}>
                                <button
                                    className={styles.menuItem}
                                    onClick={() => {
                                        onEditSprint(sprint.id)
                                        setIsMenuOpen(false)
                                    }}
                                >
                                    Изменить спринт
                                </button>
                                <button
                                    className={styles.menuItem}
                                    onClick={() => {
                                        onDeleteSprint(sprint.id)
                                        setIsMenuOpen(false)
                                    }}
                                >
                                    Удалить спринт
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className={styles.sprintBody}>
                    {sprint.issues.length > 0 ? (
                        <ul className={styles.issueList}>
                            {sprint.issues.map(issue => (
                                <li key={issue.id} className={styles.issueItem}>
                                    <div className={styles.issueLeft}>
                                        <span className={styles.issueTypeIcon}>
                                            {getTaskIcon(issue.type)}
                                        </span>
                                        <span className={styles.issueTitle}>{issue.title}</span>
                                    </div>
                                    <div className={styles.issueRight}>
                                        <span className={styles.issueStatus}>{issue.status.replace(/_/g, ' ')}</span>
                                        <div className={styles.issueActions}>
                                            <FaUserCircle size={24} color="#5e6c84" />
                                            <button 
                                                className={styles.removeIssueButton} 
                                                onClick={() => onRemoveIssueFromSprint(sprint.id, issue.id)}
                                                aria-label="Удалить задачу из спринта"
                                            >
                                                <FaTimes size={16} color="#5e6c84" />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className={styles.emptySprint}>
                            Нет задач в этом спринте
                        </div>
                    )}
                    <button className={styles.addTasksButton} onClick={() => onAddTasks(sprint.id)}>
                        + Добавить задачи
                    </button>
                </div>
            )}
        </div>
    )
}

export default SprintItem
