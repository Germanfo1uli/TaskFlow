'use client'

import React, { useState, useMemo } from 'react'
import styles from './SprintComponent.module.css'
import { Sprint, IssueStatus, SprintStatus, Tasks, Priority, Backlog } from './types/types'
import SprintItem from './components/SprintItem'
import EditSprintModal, { EditSprintFormValues } from './modals/EditSprintModal'
import DeleteSprintModal from './modals/DeleteSprintModal'
import BacklogComponent from './components/BacklogComponent'
import CreateSprintModal, { CreateSprintFormValues } from './modals/CreateSprintModal'
import AddTasksToSprintModal from './modals/AddTasksToSprintModal'
import { FaSearch, FaFilter, FaChevronDown } from 'react-icons/fa'
import { useSprints } from './hooks/useSprints'
import { api } from '@/app/auth/hooks/useTokenRefresh'
import toast from 'react-hot-toast'

interface SprintComponentProps {
    projectId: string | number | null;
}

const SprintComponent = ({ projectId }: SprintComponentProps) => {
    const { sprints, backlog, isLoading, error, fetchSprints, handleConfirmDelete, handleRemoveIssueFromSprint, handleUpdateSprintStatus, startSprintApiCall, setSprints, setBacklog } = useSprints(projectId);
    const [sprintToEdit, setSprintToEdit] = useState<Sprint | null>(null)
    const [sprintToDelete, setSprintToDelete] = useState<Sprint | null>(null)
    const [isCreateSprintModalOpen, setIsCreateSprintModalOpen] = useState(false)
    const [addingTasksToSprintId, setAddingTasksToSprintId] = useState<string | number | null>(null)

    const [searchQuery, setSearchQuery] = useState('')
    const [filterTypes, setFilterTypes] = useState<Tasks[]>([])
    const [filterStatuses, setFilterStatuses] = useState<IssueStatus[]>([])
    const [isFilterOpen, setIsFilterOpen] = useState(false)

    const toggleFilterType = (type: Tasks) => {
        setFilterTypes(prev => 
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        )
    }

    const toggleFilterStatus = (status: IssueStatus) => {
        setFilterStatuses(prev => 
            prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
        )
    }

    const filteredSprints = useMemo(() => {
        return sprints
            .filter(sprint => sprint.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(sprint => ({
                ...sprint,
                issues: sprint.issues.filter(issue => {
                    const typeMatch = filterTypes.length === 0 || filterTypes.includes(issue.type)
                    const statusMatch = filterStatuses.length === 0 || filterStatuses.includes(issue.status)
                    return typeMatch && statusMatch
                })
            }))
    }, [sprints, searchQuery, filterTypes, filterStatuses])

    const filteredBacklog = useMemo(() => {
        return {
            ...backlog,
            issues: backlog.issues.filter(issue => {
                const typeMatch = filterTypes.length === 0 || filterTypes.includes(issue.type)
                const statusMatch = filterStatuses.length === 0 || filterStatuses.includes(issue.status)
                return typeMatch && statusMatch
            })
        }
    }, [backlog, filterTypes, filterStatuses])

    const handleStartSprint = (sprintId: string | number) => {
        startSprintApiCall(sprintId);
    }

    const handleEditSprint = (sprintId: string | number) => {
        const sprint = sprints.find(s => s.id === sprintId)
        if (sprint) {
            setSprintToEdit(sprint)
        }
    }

    const handleDeleteSprint = (sprintId: string | number) => {
        console.log('handleDeleteSprint called for sprintId:', sprintId);
        const sprint = sprints.find(s => s.id === sprintId)
        if (sprint) {
            setSprintToDelete(sprint)
        }
    }

    const handleSaveSprint = async (sprintId: string | number, data: EditSprintFormValues) => {
        try {
            const payload = {
                name: data.name,
                goal: data.goal || null,
                startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
                endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
            };

            await api.patch(`/sprints/${sprintId}`, payload);
            toast.success('Спринт успешно обновлен!');
            setSprintToEdit(null);
            fetchSprints(); // Обновляем данные после обновления
        } catch (error) {
            console.error('Ошибка при обновлении спринта:', error);
            toast.error('Не удалось обновить спринт.');
        }
    }

    const handleCreateSprintClick = () => {
        setIsCreateSprintModalOpen(true)
    }

    const handleCreateSprint = async (data: CreateSprintFormValues) => {
        if (!projectId) {
            toast.error('ID проекта не указан.');
            return;
        }

        try {
            const payload = {
                name: data.name,
                goal: data.goal || null,
                startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
                endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
                issueIds: data.selectedIssues.map(Number) || [],
            };

            await api.post(`/sprints/projects/${projectId}`, payload);
            toast.success('Спринт успешно создан!');
            setIsCreateSprintModalOpen(false);
            fetchSprints(); // Обновляем данные после создания
        } catch (error) {
            console.error('Ошибка при создании спринта:', error);
            toast.error('Не удалось создать спринт.');
        }
    }

    const handleAddTasksClick = (sprintId: string | number) => {
        setAddingTasksToSprintId(sprintId)
    }

    const handleAddTasks = async (issueIds: string[]) => {
        if (!addingTasksToSprintId) {
            toast.error('Не выбран спринт для добавления задач.');
            return;
        }

        try {
            const payload = {
                issueIds: issueIds.map(Number),
            };

            await api.post(`/sprints/${addingTasksToSprintId}/issues/batch`, payload);
            toast.success('Задачи успешно добавлены в спринт!');
            setAddingTasksToSprintId(null);
            fetchSprints(); // Обновляем данные после добавления
        } catch (error) {
            console.error('Ошибка при добавлении задач в спринт:', error);
            toast.error('Не удалось добавить задачи в спринт.');
        }
    }

    // Render loading and error states
    if (isLoading) {
        return <div className={styles.loadingMessage}>Загрузка спринтов...</div>;
    }

    if (error) {
        return <div className={styles.errorMessage}>Ошибка: {error}</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Спринты</h1>
                <p className={styles.description}>Здесь будут созданные спринты</p>
            </div>

            <div className={styles.toolbar}>
                <div className={styles.searchContainer}>
                    <FaSearch className={styles.searchIcon} />
                    <input 
                        type="text" 
                        placeholder="Поиск спринтов..." 
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className={styles.filterContainer}>
                    <button 
                        className={`${styles.filterButton} ${(filterTypes.length > 0 || filterStatuses.length > 0) ? styles.activeFilter : ''}`}
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                    >
                        <FaFilter />
                        Фильтр и сортировка
                        <FaChevronDown size={12} style={{ marginLeft: 4 }} />
                    </button>
                    
                    {isFilterOpen && (
                        <div className={styles.filterDropdown}>
                            <div className={styles.filterSection}>
                                <span className={styles.filterLabel}>Тип задачи</span>
                                <div className={styles.filterOptions}>
                                    {Object.values(Tasks).map(task => (
                                        <label key={task} className={styles.checkboxLabel}>
                                            <input 
                                                type="checkbox" 
                                                className={styles.checkbox}
                                                checked={filterTypes.includes(task)}
                                                onChange={() => toggleFilterType(task)}
                                            />
                                            {task}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            
                            <div className={styles.filterSection}>
                                <span className={styles.filterLabel}>Статус</span>
                                <div className={styles.filterOptions}>
                                     {Object.values(IssueStatus).map(status => (
                                        <label key={status} className={styles.checkboxLabel}>
                                            <input 
                                                type="checkbox" 
                                                className={styles.checkbox}
                                                checked={filterStatuses.includes(status)}
                                                onChange={() => toggleFilterStatus(status)}
                                            />
                                            {status.replace(/_/g, ' ')}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.sprintsList}>
                {filteredSprints.map(sprint => (
                    <SprintItem
                        key={sprint.id}
                        sprint={sprint}
                        onStartSprint={handleStartSprint}
                        onEditSprint={handleEditSprint}
                        onDeleteSprint={handleDeleteSprint}
                        onAddTasks={handleAddTasksClick}
                        onRemoveIssueFromSprint={handleRemoveIssueFromSprint}
                    />
                ))}
            </div>

            <BacklogComponent 
                backlog={filteredBacklog} 
                onCreateSprint={handleCreateSprintClick} 
            />

            <CreateSprintModal
                isOpen={isCreateSprintModalOpen}
                onClose={() => setIsCreateSprintModalOpen(false)}
                onCreate={handleCreateSprint}
                backlogIssues={backlog.issues}
            />

            <AddTasksToSprintModal
                isOpen={!!addingTasksToSprintId}
                onClose={() => setAddingTasksToSprintId(null)}
                onAdd={handleAddTasks}
                backlogIssues={backlog.issues}
            />

            {sprintToEdit && (
                <EditSprintModal
                    sprint={sprintToEdit}
                    isOpen={!!sprintToEdit}
                    onClose={() => setSprintToEdit(null)}
                    onSave={handleSaveSprint}
                />
            )}

            {sprintToDelete && (
                <DeleteSprintModal
                    sprint={sprintToDelete}
                    isOpen={!!sprintToDelete}
                    onClose={() => setSprintToDelete(null)}
                    onConfirm={handleConfirmDelete}
                />
            )}
        </div>
    )
}

export default SprintComponent