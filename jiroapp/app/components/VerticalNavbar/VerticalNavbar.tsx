'use client'

import { useState } from 'react'
import { FaTasks, FaSearch, FaPlus, FaQuestion, FaUserCircle, FaBell } from 'react-icons/fa'
import NotificationModal from './Notification/NotificationModal'
import styles from './VerticalNavbar.module.css'

const VerticalNavbar = () => {
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)

    const handleNotificationClick = () => {
        setIsNotificationOpen(!isNotificationOpen)
    }

    const closeNotification = () => {
        setIsNotificationOpen(false)
    }

    return (
        <>
            <div className={styles.verticalNavbar}>
                <div className={styles.navTop}>
                    <div className={styles.navLogo}>
                        <FaTasks className={styles.navLogoIcon} />
                    </div>

                    <div className={styles.navActions}>
                        <button className={styles.navButton} aria-label="Поиск">
                            <FaSearch className={styles.navButtonIcon} />
                        </button>

                        <button className={styles.navButton} aria-label="Создать">
                            <FaPlus className={styles.navButtonIcon} />
                        </button>

                        <button
                            className={`${styles.navButton} ${styles.notificationButton}`}
                            aria-label="Уведомления"
                            onClick={handleNotificationClick}
                        >
                            <FaBell className={styles.navButtonIcon} />
                        </button>
                    </div>
                </div>

                <div className={styles.navBottom}>
                    <button className={styles.navButton} aria-label="Помощь">
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
        </>
    )
}

export default VerticalNavbar