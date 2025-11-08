'use client'

import { FaSmile, FaPlus, FaTrello, FaClock, FaCheckCircle, FaUsers, FaStar, FaLightbulb } from 'react-icons/fa'
import styles from './BoardsContent.module.css'

const BoardsContent = () => {
    return (
        <div className={styles.boardsContent}>
            <div className={styles.backgroundElements}>
                <div className={`${styles.glowSpot} ${styles.spot1}`}></div>
                <div className={`${styles.glowSpot} ${styles.spot2}`}></div>
            </div>

            <div className={styles.boardsHeader}>
                <div className={styles.headerContent}>
                    <div className={styles.pageTitleSection}>
                        <h1 className={styles.pageTitle}>Главная панель</h1>
                        <p className={styles.pageSubtitle}>
                            Управляйте проектами и отслеживайте прогресс в TaskFlow
                        </p>
                    </div>
                </div>
            </div>

            <div className={styles.boardsMainContent}>
                <div className={styles.quickStatsSection}>
                    <div className={styles.statCard}>
                        <div className={styles.statDecoration}>
                            <div className={styles.statPulse}></div>
                        </div>
                        <div className={styles.statIconWrapper}>
                            <FaTrello className={styles.statIcon} />
                        </div>
                        <div className={styles.statInfo}>
                            <h3>12</h3>
                            <p>Активных проектов</p>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statDecoration}>
                            <div className={styles.statPulse}></div>
                        </div>
                        <div className={styles.statIconWrapper}>
                            <FaClock className={styles.statIcon} />
                        </div>
                        <div className={styles.statInfo}>
                            <h3>8</h3>
                            <p>В процессе</p>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statDecoration}>
                            <div className={styles.statPulse}></div>
                        </div>
                        <div className={styles.statIconWrapper}>
                            <FaCheckCircle className={styles.statIcon} />
                        </div>
                        <div className={styles.statInfo}>
                            <h3>24</h3>
                            <p>Завершено</p>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statDecoration}>
                            <div className={styles.statPulse}></div>
                        </div>
                        <div className={styles.statIconWrapper}>
                            <FaUsers className={styles.statIcon} />
                        </div>
                        <div className={styles.statInfo}>
                            <h3>6</h3>
                            <p>Участников</p>
                        </div>
                    </div>
                </div>

                <div className={styles.contentGrid}>
                    <div className={styles.welcomeCard}>
                        <div className={styles.welcomeContent}>
                            <div className={styles.welcomeIconContainer}>
                                <div className={styles.welcomeIconGlow}></div>
                                <div className={styles.welcomeIcon}>
                                    <FaSmile className={styles.smileIcon} />
                                </div>
                            </div>

                            <div className={styles.welcomeTextContent}>
                                <h2 className={styles.welcomeTitle}>
                                    Добро пожаловать в
                                    <span className={styles.titleAccent}> TaskFlow</span>
                                </h2>
                                <p className={styles.welcomeDescription}>
                                    Откройте новые возможности для управления проектами.
                                    Создавайте, организуйте и достигайте целей вместе с вашей командой.
                                </p>
                            </div>

                            <div className={styles.featureHighlights}>
                                <div className={styles.featureItem}>
                                    <FaLightbulb className={styles.featureIcon} />
                                    <span>Умное планирование</span>
                                </div>
                                <div className={styles.featureItem}>
                                    <FaUsers className={styles.featureIcon} />
                                    <span>Командная работа</span>
                                </div>
                                <div className={styles.featureItem}>
                                    <FaStar className={styles.featureIcon} />
                                    <span>Профессиональные инструменты</span>
                                </div>
                            </div>

                            <div className={styles.welcomeActions}>
                                <button className={styles.primaryActionBtn}>
                                    <FaPlus className={styles.actionBtnIcon} />
                                    Создать первый проект
                                </button>
                                <button className={styles.secondaryActionBtn}>
                                    Изучить возможности
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={styles.quickActionsPanel}>
                        <div className={styles.panelHeader}>
                            <h3>Быстрый старт</h3>
                        </div>

                        <div className={styles.actionCards}>
                            <div className={styles.actionCard}>
                                <div className={styles.actionIconWrapper}>
                                    <FaPlus />
                                </div>
                                <div className={styles.actionContent}>
                                    <h4>Создать доску</h4>
                                    <p>Начните новый проект</p>
                                </div>
                            </div>

                            <div className={styles.actionCard}>
                                <div className={styles.actionIconWrapper}>
                                    <FaPlus />
                                </div>
                                <div className={styles.actionContent}>
                                    <h4>Пригласить команду</h4>
                                    <p>Добавьте участников</p>
                                </div>
                            </div>

                            <div className={styles.actionCard}>
                                <div className={styles.actionIconWrapper}>
                                    <FaPlus />
                                </div>
                                <div className={styles.actionContent}>
                                    <h4>Настроить сроки</h4>
                                    <p>Планируйте задачи</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BoardsContent