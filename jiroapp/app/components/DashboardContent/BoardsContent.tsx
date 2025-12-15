'use client'

import { motion, AnimatePresence } from 'framer-motion'
import styles from './Dashboard.module.css'
import { useDashboard } from './hooks/useDashboard'
import { DashboardHeader } from './dashboardComponent/DashboardHeader'
import { ControlsSection } from './dashboardComponent/ControlsSection'
import { BoardsGrid } from './dashboardComponent/BoardsGrid'
import TreeViewModal from './components/tree/TreeViewModal'
import AddCardModal from './components/modal/WorkInCard/AddCardModal'
import ConfirmationModal from './components/modal/ConfirmationModal'
import BoardManagerModal from './components/modal/BoardManagerModal'
import EditCardModal from './components/modal/WorkInCard/EditCardModal'
import ViewCardModal from './components/modal/WorkInCard/ViewCardModal'
import { useEffect } from 'react'

interface BoardsContentProps {
    projectId: number | null
}

const BoardsContent = ({ projectId }: BoardsContentProps) => {
    const {
        boards,
        state,
        updateState,
        authors,
        availableTags,
        currentUser,
        isLoading,
        getPriorityColor,
        getPriorityBgColor,
        toggleBoardExpansion,
        toggleBoardCollapse,
        handleSortChange,
        handleFilterChange,
        openTreeView,
        closeTreeView,
        openAddCardModal,
        closeAddCardModal,
        openBoardManager,
        closeBoardManager,
        openViewCardModal,
        closeViewCardModal,
        handleSaveBoards,
        handleAddCard,
        handleEditCard,
        handleViewCard,
        handleUpdateCard,
        handleDeleteCard,
        handleAddComment,
        confirmDelete,
        cancelDelete,
        filterAndSortCards,
        getAvailableBoardTitles,
        getBoardByCardId,
        fetchIssues,
        createTag
    } = useDashboard(projectId)

    useEffect(() => {
        const createParticles = () => {
            const particlesContainer = document.getElementById('dashboard-particles')
            if (!particlesContainer) return

            particlesContainer.innerHTML = ''

            for (let i = 0; i < 15; i++) {
                const particle = document.createElement('div')
                particle.className = styles.particle
                particle.style.left = `${Math.random() * 100}%`
                particle.style.top = `${Math.random() * 100}%`
                particle.style.animationDelay = `${Math.random() * 5}s`
                particlesContainer.appendChild(particle)
            }
        }

        createParticles()
        const interval = setInterval(createParticles, 10000)
        return () => clearInterval(interval)
    }, [])

    return (
        <motion.div
            className={styles.boardsSection}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div id="dashboard-particles" className={styles.particlesContainer}></div>

            <motion.div
                className={styles.glowSpot1}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1]
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.div
                className={styles.glowSpot2}
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.1, 0.15, 0.1]
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                }}
            />

            <DashboardHeader
                title={projectId ? `Доски проекта` : "Мои доски"}
                subtitle={projectId ? "Задачи текущего проекта" : "Управляйте задачами и отслеживайте прогресс по проектам"}
            />

            <ControlsSection
                searchQuery={state.searchQuery}
                onSearchChange={(query) => updateState({ searchQuery: query })}
                isFilterOpen={state.isFilterOpen}
                onFilterToggle={() => updateState({ isFilterOpen: !state.isFilterOpen })}
                sortOption={state.sortOption}
                onSortChange={handleSortChange}
                filterOption={state.filterOption}
                onFilterChange={handleFilterChange}
                onTreeViewOpen={openTreeView}
                onBoardManagerOpen={openBoardManager}
            />

            {isLoading ? (
                <div className={styles.skeletonContainer}>
                    {[...Array(4)].map((_, boardIndex) => (
                        <div key={boardIndex} className={styles.boardSkeleton}>
                            <div className={styles.boardHeaderSkeleton}>
                                <div className={styles.boardTitleSkeleton}></div>
                                <div className={styles.cardsCountSkeleton}></div>
                            </div>
                            <div className={styles.cardsListSkeleton}>
                                {[...Array(3)].map((_, cardIndex) => (
                                    <div key={cardIndex} className={styles.cardSkeleton}>
                                        <div className={styles.cardContentSkeleton}>
                                            <div className={styles.cardTitleSkeleton}></div>
                                            <div className={styles.cardDescriptionSkeleton}></div>
                                            <div className={styles.cardTagsSkeleton}>
                                                <div className={styles.tagSkeleton}></div>
                                                <div className={styles.tagSkeleton}></div>
                                            </div>
                                            <div className={styles.cardFooterSkeleton}>
                                                <div className={styles.cardMetaSkeleton}></div>
                                                <div className={styles.assigneeSkeleton}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <BoardsGrid
                    boards={boards}
                    expandedBoards={state.expandedBoards}
                    collapsedBoards={state.collapsedBoards}
                    getPriorityColor={getPriorityColor}
                    getPriorityBgColor={getPriorityBgColor}
                    filterAndSortCards={filterAndSortCards}
                    onToggleCollapse={toggleBoardCollapse}
                    onToggleExpansion={toggleBoardExpansion}
                    onEditCard={handleEditCard}
                    onDeleteCard={handleDeleteCard}
                    onViewCard={handleViewCard}
                    onAddCard={openAddCardModal}
                />
            )}

            <AnimatePresence>
                {state.isTreeViewOpen && (
                    <TreeViewModal
                        isOpen={state.isTreeViewOpen}
                        onClose={closeTreeView}
                        boards={boards}
                        getPriorityColor={getPriorityColor}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {state.isAddCardModalOpen && (
                    <AddCardModal
                        isOpen={state.isAddCardModalOpen}
                        onClose={closeAddCardModal}
                        onSave={handleAddCard}
                        boards={boards}
                        authors={authors}
                        projectId={projectId}
                        availableTags={availableTags}
                        onTagCreate={createTag}
                        refreshIssues={fetchIssues}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {state.isBoardManagerOpen && (
                    <BoardManagerModal
                        isOpen={state.isBoardManagerOpen}
                        onClose={closeBoardManager}
                        boards={boards}
                        onSave={handleSaveBoards}
                        getAvailableBoardTitles={getAvailableBoardTitles}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {state.isViewCardModalOpen && state.viewingCard && (
                    <ViewCardModal
                        isOpen={state.isViewCardModalOpen}
                        onClose={closeViewCardModal}
                        card={state.viewingCard}
                        board={getBoardByCardId(state.viewingCard.id)}
                        getPriorityColor={getPriorityColor}
                        onAddComment={handleAddComment}
                        assignees={state.viewingCard.assignees}
                        currentUser={currentUser} // Передаем текущего пользователя
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {!!state.editingCard && (
                    <EditCardModal
                        isOpen={!!state.editingCard}
                        onClose={() => updateState({ editingCard: null })}
                        onSave={handleUpdateCard}
                        card={state.editingCard}
                        boards={boards}
                        authors={authors}
                        currentBoardId={state.currentBoardId}
                        projectId={projectId}
                        availableTags={availableTags}
                        onTagCreate={createTag}
                        refreshIssues={fetchIssues}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {state.deleteConfirmation.isOpen && (
                    <ConfirmationModal
                        isOpen={state.deleteConfirmation.isOpen}
                        onClose={cancelDelete}
                        onConfirm={confirmDelete}
                        title="Удаление карточки"
                        message={`Вы уверены, что хотите удалить карточку "${state.deleteConfirmation.cardTitle}"? Это действие нельзя отменить.`}
                        confirmText="Удалить карточку"
                        cancelText="Отмена"
                    />
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default BoardsContent