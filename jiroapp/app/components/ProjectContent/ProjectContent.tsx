'use client'

import { useState, useEffect } from 'react'
import {
    FaSmile, FaPlus, FaTrello, FaLightbulb, FaUsers, FaStar, FaRocket,
    FaChartLine, FaMagic, FaHandshake, FaBullseye, FaBell, FaQuestionCircle,
    FaCalendar, FaTags, FaUserCircle, FaCheckCircle, FaClock, FaExclamationCircle,
    FaComments, FaCog, FaEdit, FaShare, FaSignOutAlt
} from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { ProjectContentProps } from './types/types'
import { useProjectContent } from './hooks/useProjectContent'
import styles from './ProjectContent.module.css'
import confetti from 'canvas-confetti'
import { api } from '@/app/auth/hooks/useTokenRefresh'

const ProjectContent = ({ project: initialProject, onBackToDashboard }: ProjectContentProps) => {
    const [hoveredCard, setHoveredCard] = useState<number | null>(null)
    const [showConfetti, setShowConfetti] = useState(false)
    const [showLeaveModal, setShowLeaveModal] = useState(false)
    const [isLeaving, setIsLeaving] = useState(false)

    const { project, isLoading, userRole } = useProjectContent(initialProject)

    useEffect(() => {
        if (project && project.progress === 100 && !showConfetti) {
            setTimeout(() => {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
                setShowConfetti(true)
            }, 500)
        }
    }, [project, showConfetti])

    const handleCardHover = (index: number) => setHoveredCard(index)
    const handleCardLeave = () => setHoveredCard(null)

    const handleLeaveProject = async () => {
        if (!project?.id) return
        setIsLeaving(true)
        try {
            await api.delete(`/projects/${project.id}/members/me`)
            window.location.reload()
        } catch (error) {
            console.error('Ошибка при выходе из проекта:', error)
        } finally {
            setIsLeaving(false)
            setShowLeaveModal(false)
        }
    }

    if (isLoading || !project) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}>
                    <div className={styles.spinnerDot} />
                    <div className={styles.spinnerDot} />
                    <div className={styles.spinnerDot} />
                </div>
                <p className={styles.loadingText}>Загружаем проект...</p>
            </div>
        )
    }

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })

    return (
        <>
            <motion.div
                key={project.id}
                className={styles.projectContent}
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
                }}
            >
                <div className={styles.backgroundElements}>
                    <div className={`${styles.glowSpot} ${styles.spot1}`} />
                    <div className={`${styles.glowSpot} ${styles.spot2}`} />
                    <div className={`${styles.glowSpot} ${styles.spot3}`} />
                    <div className={`${styles.glowSpot} ${styles.spot4}`} />
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

                <motion.div className={styles.projectHeader} variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } } }}>
                    <div className={styles.headerContent}>
                        <div className={styles.pageTitleSection}>
                            <motion.h1 className={styles.pageTitle} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                Добро пожаловать в проект <span className={styles.titleGradient}>{project.name}</span>
                            </motion.h1>
                            <motion.p className={styles.pageSubtitle} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                                Управляйте задачами, отслеживайте прогресс и работайте с командой эффективно
                            </motion.p>
                            <motion.div className={styles.projectMeta} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                                <span className={styles.metaItem}><FaCalendar className={styles.metaIcon} />Создан {formatDate(project.createdAt)}</span>
                                {project.yourRole && <span className={styles.metaItem}><FaUserCircle className={styles.metaIcon} />Ваша роль: {project.yourRole}</span>}
                                {userRole && <span className={styles.metaItem}><FaUserCircle className={styles.metaIcon} />Статус: {userRole.isOwner ? 'Владелец' : 'Участник'}</span>}
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                <div className={styles.projectMainContent}>
                    <motion.div
                        className={styles.contentGrid}
                        variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
                        }}
                    >
                        <motion.div
                            className={styles.welcomeCard}
                            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } } }}
                            whileHover={{ scale: 1.01, boxShadow: '0 20px 40px rgba(61, 107, 179, 0.15)' }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <div className={styles.cardGlow} />
                            <div className={styles.welcomeContent}>
                                <motion.div
                                    className={styles.welcomeIconContainer}
                                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                >
                                    <div className={styles.welcomeIconGlow} />
                                    <motion.div className={styles.welcomeIcon} whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                                        {project.image ? (
                                            <img src={project.image} alt={project.name} className={styles.projectAvatarImage} />
                                        ) : (
                                            <span className={styles.projectAvatarText}>{project.name.charAt(0).toUpperCase()}</span>
                                        )}
                                    </motion.div>
                                </motion.div>

                                <div className={styles.welcomeTextContent}>
                                    <motion.h2 className={styles.welcomeTitle} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                        Работаем над проектом <span className={styles.titleAccent}>{project.name}</span>
                                    </motion.h2>
                                    <motion.p className={styles.welcomeDescription} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
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
                                                    <FaTags className={styles.tagIcon} />{tag}
                                                </motion.span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <motion.div className={styles.quickMetrics} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                                    <div className={styles.metric}>
                                        <FaTrello className={styles.metricIcon} />
                                        <div><span className={styles.metricValue}>{project.tasks || 0}</span><span className={styles.metricLabel}>Задач</span></div>
                                    </div>
                                    <div className={styles.metric}>
                                        <FaUsers className={styles.metricIcon} />
                                        <div><span className={styles.metricValue}>{project.members || 1}</span><span className={styles.metricLabel}>Участников</span></div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className={styles.welcomeActions}
                                    variants={{
                                        hidden: { opacity: 0 },
                                        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
                                    }}
                                >
                                    <motion.button
                                        className={`${styles.primaryActionBtn} ${styles.glowButton}`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } } }}
                                    >
                                        <FaPlus className={styles.actionBtnIcon} />Добавить задачу
                                        <div className={styles.buttonGlow} />
                                    </motion.button>

                                    <motion.button
                                        className={styles.secondaryActionBtn}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } } }}
                                    >
                                        <FaUsers className={styles.actionBtnIcon} />Пригласить участника
                                    </motion.button>

                                    {!userRole?.isOwner && (
                                        <motion.button
                                            className={styles.leaveProjectBtn}
                                            onClick={() => setShowLeaveModal(true)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } } }}
                                        >
                                            <FaSignOutAlt className={styles.actionBtnIcon} />Покинуть проект
                                        </motion.button>
                                    )}
                                </motion.div>
                            </div>
                        </motion.div>

                        <motion.div
                            className={styles.quickActionsPanel}
                            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } } }}
                        >
                            <div className={styles.panelHeader}>
                                <h3>Быстрые действия</h3>
                                <span className={styles.panelSubtitle}>Управление проектом</span>
                            </div>

                            <div className={styles.actionCards}>
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        className={`${styles.actionCard} ${hoveredCard === i ? styles.hovered : ''}`}
                                        onMouseEnter={() => handleCardHover(i)}
                                        onMouseLeave={handleCardLeave}
                                        variants={{ initial: { scale: 1 }, hover: { scale: 1.03, transition: { type: 'spring', stiffness: 400, damping: 25 } } }}
                                        whileHover="hover"
                                        initial="initial"
                                    >
                                        <div className={styles.actionIconWrapper}>
                                            {i === 0 && <FaPlus />}
                                            {i === 1 && <FaEdit />}
                                            {i === 2 && <FaShare />}
                                            <div className={styles.iconGlow} />
                                        </div>
                                        <div className={styles.actionContent}>
                                            <h4>{i === 0 ? 'Создать задачу' : i === 1 ? 'Редактировать проект' : 'Поделиться проектом'}</h4>
                                            <p>{i === 0 ? 'Добавьте новую задачу в проект' : i === 1 ? 'Измените настройки проекта' : 'Пригласите коллег для совместной работы'}</p>
                                            <span className={styles.actionHint}>{i === 0 ? 'Нажмите чтобы начать' : i === 1 ? 'Настройки' : 'Приглашения'}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className={styles.quickTips}>
                                <div className={styles.tipHeader}><FaBell className={styles.tipIcon} /><span>Совет дня</span></div>
                                <p className={styles.tipText}>Регулярно обновляйте статус задач для точного отслеживания прогресса проекта</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>

            <AnimatePresence>
                {showLeaveModal && (
                    <motion.div
                        className={styles.leaveModalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowLeaveModal(false)}
                    >
                        <motion.div
                            className={styles.leaveModal}
                            initial={{ scale: 0.8, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={styles.leaveModalHeader}>
                                <div className={styles.leaveModalIcon}><FaSignOutAlt /></div>
                                <h3>Покинуть проект</h3>
                                <p>Вы уверены, что хотите выйти из проекта?</p>
                            </div>
                            <div className={styles.leaveModalBody}>
                                <p className={styles.leaveWarning}>Это действие невозможно отменить. Вы потеряете доступ к проекту «{project.name}»</p>
                                <div className={styles.leaveModalButtons}>
                                    <motion.button
                                        className={styles.cancelBtn}
                                        onClick={() => setShowLeaveModal(false)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={isLeaving}
                                    >
                                        Отмена
                                    </motion.button>
                                    <motion.button
                                        className={styles.confirmLeaveBtn}
                                        onClick={handleLeaveProject}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={isLeaving}
                                    >
                                        {isLeaving ? (
                                            <div className={styles.spinnerSmall}>
                                                <div className={styles.spinnerDot} />
                                                <div className={styles.spinnerDot} />
                                                <div className={styles.spinnerDot} />
                                            </div>
                                        ) : (
                                            'Покинуть'
                                        )}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default ProjectContent