import React, { useState, useMemo } from 'react'
import { Backlog, IssueStatus, Tasks } from '../types/types'
import styles from './SprintItem.module.css'
import { FaChevronDown, FaChevronRight, FaBug, FaCheckSquare, FaBookmark, FaBolt, FaUserCircle } from 'react-icons/fa'

interface BacklogComponentProps {
    backlog: Backlog;
    onCreateSprint: () => void;
}

const BacklogComponent = ({ backlog, onCreateSprint }: BacklogComponentProps) => {
    const [isExpanded, setIsExpanded] = useState(true)

    const toggleExpand = () => setIsExpanded(!isExpanded)

    const stats = useMemo(() => {
        const notStarted = backlog.issues.filter(i =>
            [IssueStatus.TO_DO, IssueStatus.SELECTED_FOR_DEVELOPMENT].includes(i.status)
        ).length

        const inProgress = backlog.issues.filter(i =>
            [IssueStatus.IN_PROGRESS, IssueStatus.CODE_REVIEW, IssueStatus.QA, IssueStatus.STAGING].includes(i.status)
        ).length

        const done = backlog.issues.filter(i =>
            i.status === IssueStatus.DONE
        ).length

        return { notStarted, inProgress, done }
    }, [backlog.issues])

    const getTaskIcon = (type: Tasks) => {
        switch (type) {
            case Tasks.BUG: return <FaBug color="#e5493a" />
            case Tasks.STORY: return <FaBookmark color="#63ba3c" />
            case Tasks.EPIC: return <FaBolt color="#904ee2" />
            case Tasks.SUB_TASK: return <FaCheckSquare color="#4bade8" />
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
                            <h3 className={styles.sprintName}>Backlog</h3>
                            <span className={styles.issueCount}>
                                ({backlog.issues.length} issues)
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.headerRight}>
                    <div className={styles.statsBadges}>
                        <div className={`${styles.badge} ${styles.badgeGrey}`} title="Not Started">
                            {stats.notStarted}
                        </div>
                        <div className={`${styles.badge} ${styles.badgeBlue}`} title="In Progress">
                            {stats.inProgress}
                        </div>
                        <div className={`${styles.badge} ${styles.badgeGreen}`} title="Done">
                            {stats.done}
                        </div>
                    </div>

                    <button
                        className={styles.startSprintButton}
                        style={{ backgroundColor: '#f4f5f7', color: '#172b4d', border: '1px solid #dfe1e6' }}
                        onClick={onCreateSprint}
                    >
                        Создать спринт
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className={styles.sprintBody}>
                    {backlog.issues.length > 0 ? (
                        <ul className={styles.issueList}>
                            {backlog.issues.map(issue => (
                                <li key={issue.id} className={styles.issueItem}>
                                    <div className={styles.issueLeft}>
                                        <span className={styles.issueTypeIcon}>
                                            {getTaskIcon(issue.type)}
                                        </span>
                                        <span className={styles.issueTitle}>{issue.title}</span>
                                    </div>
                                    <div className={styles.issueRight}>
                                        <span className={styles.issueStatus}>{issue.status.replace(/_/g, ' ')}</span>
                                        <div className={styles.assigneeAvatar}>
                                            {issue.assigneeId ? (
                                                //Добавить получение аватара с бэка
                                                <FaUserCircle size={24} color="#5e6c84" />
                                            ) : (
                                                <FaUserCircle size={24} color="#5e6c84" />
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className={styles.emptySprint}>
                            Бэклог пуст
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default BacklogComponent
