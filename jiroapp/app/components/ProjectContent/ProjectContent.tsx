'use client'

import { useState, useEffect } from 'react'
import {
    FaSmile,
    FaPlus,
    FaTrello,
    FaLightbulb,
    FaUsers,
    FaStar,
    FaRocket,
    FaChartLine,
    FaMagic,
    FaHandshake,
    FaBullseye,
    FaBell,
    FaQuestionCircle,
    FaCalendar,
    FaTags,
    FaUserCircle,
    FaCheckCircle,
    FaClock,
    FaExclamationCircle,
    FaComments,
    FaCog,
    FaEdit,
    FaShare
} from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { useProjectData } from './hooks/useProjectData'
import { ProjectContentProps } from './types/types'
import styles from './ProjectContent.module.css'
import confetti from 'canvas-confetti'

const ProjectContent = ({ project: initialProject, onBackToDashboard }: ProjectContentProps) => {
    const { project, stats, activities, isLoading, setProject, refreshProject } = useProjectData()
    const [hoveredCard, setHoveredCard] = useState<number | null>(null)
    const [showConfetti, setShowConfetti] = useState(false)

    useEffect(() => {
        if (initialProject) {
            setProject(initialProject)
        }
    }, [initialProject, setProject])

    useEffect(() => {
        if (project && project.progress === 100 && !showConfetti) {
            setTimeout(() => {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                })
                setShowConfetti(true)
            }, 500)
        }
    }, [project, showConfetti])

    const handleCardHover = (index: number) => {
        setHoveredCard(index)
    }

    const handleCardLeave = () => {
        setHoveredCard(null)
    }

    if (isLoading || !project) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}>
                    <div className={styles.spinnerDot}></div>
                    <div className={styles.spinnerDot}></div>
                    <div className={styles.spinnerDot}></div>
                </div>
                <p className={styles.loadingText}>Загружаем проект...</p>
            </div>
        )
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    }

    const cardVariants = {
        initial: { scale: 1 },
        hover: {
            scale: 1.03,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 25
            }
        }
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    return (
        <motion.div
            className={styles.projectContent}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className={styles.backgroundElements}>
                <div className={`${styles.glowSpot} ${styles.spot1}`}></div>
                <div className={`${styles.glowSpot} ${styles.spot2}`}></div>
                <div className={`${styles.glowSpot} ${styles.spot3}`}></div>
                <div className={`${styles.glowSpot} ${styles.spot4}`}></div>

                <div className={styles.particles}>
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className={styles.particle}
                            animate={{
                                y: [0, -20, 0],
                                x: [0, Math.random() * 20 - 10, 0],
                                opacity: [0.3, 0.7, 0.3]
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 2
                            }}
                        />
                    ))}
                </div>
            </div>

            <motion.div
                className={styles.projectHeader}
                variants={itemVariants}
            >
                <div className={styles.headerContent}>
                    <div className={styles.pageTitleSection}>
                        <motion.h1
                            className={styles.pageTitle}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            Добро пожаловать в проект{' '}
                            <span className={styles.titleGradient}>{project.name}</span>
                        </motion.h1>

                        <motion.p
                            className={styles.pageSubtitle}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            Управляйте задачами, отслеживайте прогресс и работайте с командой эффективно
                        </motion.p>

                        <motion.div
                            className={styles.projectMeta}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <span className={styles.metaItem}>
                                <FaCalendar className={styles.metaIcon} />
                                Создан {formatDate(project.createdAt)}
                            </span>
                            {project.owner && (
                                <span className={styles.metaItem}>
                                    <FaUserCircle className={styles.metaIcon} />
                                    Владелец: {project.owner.name}
                                </span>
                            )}
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            <div className={styles.projectMainContent}>
                <motion.div
                    className={styles.contentGrid}
                    variants={containerVariants}
                >
                    <motion.div
                        className={styles.welcomeCard}
                        variants={itemVariants}
                        whileHover={{
                            scale: 1.01,
                            boxShadow: "0 20px 40px rgba(61, 107, 179, 0.15)"
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <div className={styles.cardGlow}></div>

                        <div className={styles.welcomeContent}>
                            <motion.div
                                className={styles.welcomeIconContainer}
                                animate={{
                                    rotate: [0, 10, -10, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 3
                                }}
                            >
                                <div className={styles.welcomeIconGlow}></div>
                                <motion.div
                                    className={styles.welcomeIcon}
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    {project.image ? (
                                        <img
                                            src={project.image}
                                            alt={project.name}
                                            className={styles.projectAvatarImage}
                                        />
                                    ) : (
                                        <span className={styles.projectAvatarText}>
                                            {project.name.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </motion.div>
                            </motion.div>

                            <div className={styles.welcomeTextContent}>
                                <motion.h2
                                    className={styles.welcomeTitle}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    Работаем над проектом{' '}
                                    <span className={styles.titleAccent}>{project.name}</span>
                                </motion.h2>

                                <motion.p
                                    className={styles.welcomeDescription}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    {project.description || 'Описание проекта будет здесь...'}
                                </motion.p>

                                {project.tags && project.tags.length > 0 && (
                                    <div className={styles.projectTags}>
                                        {project.tags.map((tag, index) => (
                                            <motion.span
                                                key={index}
                                                className={styles.projectTag}
                                                whileHover={{ scale: 1.05 }}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.1 * index }}
                                            >
                                                <FaTags className={styles.tagIcon} />
                                                {tag}
                                            </motion.span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <motion.div
                                className={styles.quickMetrics}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className={styles.metric}>
                                    <FaTrello className={styles.metricIcon} />
                                    <div>
                                        <span className={styles.metricValue}>{project.tasks || 0}</span>
                                        <span className={styles.metricLabel}>Задач</span>
                                    </div>
                                </div>
                                <div className={styles.metric}>
                                    <FaUsers className={styles.metricIcon} />
                                    <div>
                                        <span className={styles.metricValue}>{project.members || 1}</span>
                                        <span className={styles.metricLabel}>Участников</span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                className={styles.welcomeActions}
                                variants={containerVariants}
                            >
                                <motion.button
                                    className={`${styles.primaryActionBtn} ${styles.glowButton}`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    variants={itemVariants}
                                >
                                    <FaPlus className={styles.actionBtnIcon} />
                                    Добавить задачу
                                    <div className={styles.buttonGlow}></div>
                                </motion.button>

                                <motion.button
                                    className={styles.secondaryActionBtn}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    variants={itemVariants}
                                >
                                    <FaUsers className={styles.actionBtnIcon} />
                                    Пригласить участника
                                </motion.button>
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.div
                        className={styles.quickActionsPanel}
                        variants={itemVariants}
                    >
                        <div className={styles.panelHeader}>
                            <h3>Быстрые действия</h3>
                            <span className={styles.panelSubtitle}>Управление проектом</span>
                        </div>

                        <div className={styles.actionCards}>
                            <motion.div
                                className={`${styles.actionCard} ${hoveredCard === 0 ? styles.hovered : ''}`}
                                onMouseEnter={() => handleCardHover(0)}
                                onMouseLeave={handleCardLeave}
                                variants={cardVariants}
                                whileHover="hover"
                                initial="initial"
                            >
                                <div className={styles.actionIconWrapper}>
                                    <FaPlus />
                                    <div className={styles.iconGlow}></div>
                                </div>
                                <div className={styles.actionContent}>
                                    <h4>Создать задачу</h4>
                                    <p>Добавьте новую задачу в проект</p>
                                    <span className={styles.actionHint}>Нажмите чтобы начать</span>
                                </div>
                            </motion.div>

                            <motion.div
                                className={`${styles.actionCard} ${hoveredCard === 1 ? styles.hovered : ''}`}
                                onMouseEnter={() => handleCardHover(1)}
                                onMouseLeave={handleCardLeave}
                                variants={cardVariants}
                                whileHover="hover"
                                initial="initial"
                            >
                                <div className={styles.actionIconWrapper}>
                                    <FaEdit />
                                    <div className={styles.iconGlow}></div>
                                </div>
                                <div className={styles.actionContent}>
                                    <h4>Редактировать проект</h4>
                                    <p>Измените настройки проекта</p>
                                    <span className={styles.actionHint}>Настройки</span>
                                </div>
                            </motion.div>

                            <motion.div
                                className={`${styles.actionCard} ${hoveredCard === 2 ? styles.hovered : ''}`}
                                onMouseEnter={() => handleCardHover(2)}
                                onMouseLeave={handleCardLeave}
                                variants={cardVariants}
                                whileHover="hover"
                                initial="initial"
                            >
                                <div className={styles.actionIconWrapper}>
                                    <FaShare />
                                    <div className={styles.iconGlow}></div>
                                </div>
                                <div className={styles.actionContent}>
                                    <h4>Поделиться проектом</h4>
                                    <p>Пригласите коллег для совместной работы</p>
                                    <span className={styles.actionHint}>Приглашения</span>
                                </div>
                            </motion.div>
                        </div>

                        <div className={styles.quickTips}>
                            <div className={styles.tipHeader}>
                                <FaBell className={styles.tipIcon} />
                                <span>Совет дня</span>
                            </div>
                            <p className={styles.tipText}>
                                Регулярно обновляйте статус задач для точного отслеживания прогресса проекта
                            </p>
                        </div>
                    </motion.div>
                </motion.div>

                {activities.length > 0 && (
                    <motion.div
                        className={styles.achievementsSection}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        <h3 className={styles.achievementsTitle}>
                            <FaComments className={styles.achievementsIcon} />
                            Последняя активность
                        </h3>
                        <div className={styles.achievementsGrid}>
                            {activities.slice(0, 3).map((activity) => (
                                <div key={activity.id} className={styles.achievement}>
                                    <div className={styles.achievementIcon}>
                                        {activity.type === 'task_created' && <FaPlus />}
                                        {activity.type === 'task_completed' && <FaCheckCircle />}
                                        {activity.type === 'member_added' && <FaUsers />}
                                        {activity.type === 'comment_added' && <FaComments />}
                                    </div>
                                    <div className={styles.achievementContent}>
                                        <h4>{activity.description}</h4>
                                        <p>{activity.user.name} • {activity.timestamp}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    )
}

export default ProjectContent