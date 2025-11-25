'use client'

import { useState } from 'react'
import { FaTasks, FaSearch, FaPlus, FaQuestion, FaUserCircle, FaBell, FaBars, FaTimes } from 'react-icons/fa'
import NotificationModal from './Notification/NotificationModal'
import SearchPanel from './Search/SearchPanel'
import HelpModal from './Help/HelpModal'
import { ProfileModal } from '../VerticalNavbar/Profile/ProfileModal'
import CreateProjectModal from './CreateProject/CreateProjectModal'
import { Project } from './CreateProject/types/types'
import styles from './VerticalNavbar.module.css'

interface VerticalNavbarProps {
    onToggleControlPanel?: () => void;
    isControlPanelOpen?: boolean;
}

const VerticalNavbar = ({ onToggleControlPanel, isControlPanelOpen = true }: VerticalNavbarProps) => {
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [isHelpOpen, setIsHelpOpen] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
    const [projects, setProjects] = useState<Project[]>([])

    const handleNotificationClick = () => {
        setIsNotificationOpen(!isNotificationOpen)
        setIsSearchOpen(false)
        setIsHelpOpen(false)
        setIsProfileOpen(false)
        setIsCreateProjectOpen(false)
    }

    const handleSearchClick = () => {
        setIsSearchOpen(!isSearchOpen)
        setIsNotificationOpen(false)
        setIsHelpOpen(false)
        setIsProfileOpen(false)
        setIsCreateProjectOpen(false)
    }

    const handleCreateProjectClick = () => {
        setIsCreateProjectOpen(!isCreateProjectOpen)
        setIsNotificationOpen(false)
        setIsSearchOpen(false)
        setIsHelpOpen(false)
        setIsProfileOpen(false)
    }

    const handleHelpClick = () => {
        setIsHelpOpen(!isHelpOpen)
        setIsNotificationOpen(false)
        setIsSearchOpen(false)
        setIsProfileOpen(false)
        setIsCreateProjectOpen(false)
    }

    const handleProfileClick = () => {
        setIsProfileOpen(!isProfileOpen)
        setIsNotificationOpen(false)
        setIsSearchOpen(false)
        setIsHelpOpen(false)
        setIsCreateProjectOpen(false)
    }

    const handleToggleControlPanel = () => {
        if (onToggleControlPanel) {
            onToggleControlPanel()
        }
    }

    const handleProjectCreated = (project: Project) => {
        setProjects(prev => [project, ...prev])
    }

    const closeNotification = () => setIsNotificationOpen(false)
    const closeSearch = () => setIsSearchOpen(false)
    const closeHelp = () => setIsHelpOpen(false)
    const closeProfile = () => setIsProfileOpen(false)
    const closeCreateProject = () => setIsCreateProjectOpen(false)

    return (
        <>
            <div className={styles.verticalNavbar}>
                <div className={styles.navTop}>
                    <div className={styles.navLogo}>
                        <button
                            className={styles.toggleControlPanelButton}
                            onClick={handleToggleControlPanel}
                            aria-label={isControlPanelOpen ? "Скрыть панель управления" : "Показать панель управления"}
                        >
                            {isControlPanelOpen ? <FaTimes className={styles.toggleIcon} /> : <FaBars className={styles.toggleIcon} />}
                        </button>
                    </div>

                    <div className={styles.navActions}>
                        <button
                            className={`${styles.navButton} ${isSearchOpen ? styles.active : ''}`}
                            aria-label="Поиск"
                            onClick={handleSearchClick}
                        >
                            <FaSearch className={styles.navButtonIcon} />
                        </button>

                        <button
                            className={`${styles.navButton} ${isCreateProjectOpen ? styles.active : ''}`}
                            aria-label="Создать проект"
                            onClick={handleCreateProjectClick}
                        >
                            <FaPlus className={styles.navButtonIcon} />
                        </button>

                        <button
                            className={`${styles.navButton} ${styles.notificationButton} ${isNotificationOpen ? styles.active : ''}`}
                            aria-label="Уведомления"
                            onClick={handleNotificationClick}
                        >
                            <FaBell className={styles.navButtonIcon} />
                        </button>
                    </div>

                    {projects.length > 0 && (
                        <div className={styles.projectsList}>
                            {projects.map(project => (
                                <button
                                    key={project.id}
                                    className={styles.projectButton}
                                    aria-label={`Проект: ${project.name}`}
                                >
                                    {project.image ? (
                                        <img
                                            src={project.image}
                                            alt={project.name}
                                            className={styles.projectImage}
                                        />
                                    ) : (
                                        <div className={styles.projectPlaceholder}>
                                            {project.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className={styles.projectTooltip}>{project.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.navBottom}>
                    <button
                        className={`${styles.navButton} ${isHelpOpen ? styles.active : ''}`}
                        aria-label="Помощь"
                        onClick={handleHelpClick}
                    >
                        <FaQuestion className={styles.navButtonIcon} />
                    </button>

                    <button
                        className={`${styles.navButton} ${styles.profileButton} ${isProfileOpen ? styles.active : ''}`}
                        aria-label="Профиль пользователя"
                        onClick={handleProfileClick}
                    >
                        <div className={styles.profileAvatar}>
                            <FaUserCircle className={styles.avatarIcon} />
                        </div>
                    </button>
                </div>
            </div>

            {isNotificationOpen && <NotificationModal onClose={closeNotification} />}
            {isSearchOpen && <SearchPanel onClose={closeSearch} />}
            {isHelpOpen && <HelpModal onClose={closeHelp} />}
            {isProfileOpen && <ProfileModal isOpen={isProfileOpen} onClose={closeProfile} />}
            {isCreateProjectOpen && (
                <CreateProjectModal
                    isOpen={isCreateProjectOpen}
                    onClose={closeCreateProject}
                    onProjectCreated={handleProjectCreated}
                />
            )}
        </>
    )
}

export default VerticalNavbar