'use client'

import { useState } from 'react'
import { FaTasks, FaSearch, FaPlus, FaQuestion, FaUserCircle, FaBell } from 'react-icons/fa'
import NotificationModal from './Notification/NotificationModal'
import SearchPanel from './Search/SearchPanel'
import HelpModal from './Help/HelpModal'
import styles from './VerticalNavbar.module.css'

const VerticalNavbar = () => {
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [isHelpOpen, setIsHelpOpen] = useState(false)

    const handleNotificationClick = () => {
        setIsNotificationOpen(!isNotificationOpen)
        setIsSearchOpen(false)
        setIsHelpOpen(false)
    }

    const handleSearchClick = () => {
        setIsSearchOpen(!isSearchOpen)
        setIsNotificationOpen(false)
        setIsHelpOpen(false)
    }

    const handleHelpClick = () => {
        setIsHelpOpen(!isHelpOpen)
        setIsNotificationOpen(false)
        setIsSearchOpen(false)
    }

    const closeNotification = () => {
        setIsNotificationOpen(false)
    }

    const closeSearch = () => {
        setIsSearchOpen(false)
    }

    const closeHelp = () => {
        setIsHelpOpen(false)
    }

    return (
        <>
            <div className={styles.verticalNavbar}>
                <div className={styles.navTop}>
                    <div className={styles.navLogo}>
                        <FaTasks className={styles.navLogoIcon} />
                    </div>

                    <div className={styles.navActions}>
                        <button
                            className={`${styles.navButton} ${isSearchOpen ? styles.active : ''}`}
                            aria-label="Поиск"
                            onClick={handleSearchClick}
                        >
                            <FaSearch className={styles.navButtonIcon} />
                        </button>

                        <button className={styles.navButton} aria-label="Создать">
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
                </div>

                <div className={styles.navBottom}>
                    <button
                        className={`${styles.navButton} ${isHelpOpen ? styles.active : ''}`}
                        aria-label="Помощь"
                        onClick={handleHelpClick}
                    >
                        <FaQuestion className={styles.navButtonIcon} />
                    </button>

                    <div className={styles.navProfile} aria-label="Профиль пользователя">
                        <div className={styles.profileAvatar}>
                            <FaUserCircle className={styles.avatarIcon} />
                        </div>
                    </div>
                </div>
            </div>

            {isNotificationOpen && <NotificationModal onClose={closeNotification} />}
            {isSearchOpen && <SearchPanel onClose={closeSearch} />}
            {isHelpOpen && <HelpModal onClose={closeHelp} />}
        </>
    )
}

export default VerticalNavbar