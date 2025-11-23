'use client'

import { useState, useEffect } from 'react';
import { Button, Snackbar, Alert, Box, CircularProgress } from '@mui/material';
import { FaUserPlus, FaSync, FaEdit } from 'react-icons/fa';
import { Developer, NewDeveloper } from './types/developer.types';
import { mockDevelopers } from './data/mockDevelopers';
import { DevelopersTable } from './components/DevelopersTable';
import { AddDeveloperDialog } from './components/AddDeveloperDialog';
import { DeleteConfirmationDialog } from './components/DeleteConfirmationDialog';
import { EditDeveloperDialog } from './components/EditDeveloperDialog';
import { useDeveloperProjects } from './hooks/useDeveloperProjects';
import { useDashboard } from '../DashboardContent/hooks/useDashboard';
import styles from './DevelopersPage.module.css';

export const DevelopersPage = () => {
    const [developers, setDevelopers] = useState<Developer[]>(mockDevelopers);
    const [isAddDeveloperOpen, setIsAddDeveloperOpen] = useState(false);
    const [isEditDeveloperOpen, setIsEditDeveloperOpen] = useState(false);
    const [editingDeveloper, setEditingDeveloper] = useState<Developer | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        developerId: number | null;
        developerName: string;
    }>({
        isOpen: false,
        developerId: null,
        developerName: ''
    });
    const [snackbar, setSnackbar] = useState<{
        isOpen: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({
        isOpen: false,
        message: '',
        severity: 'success'
    });

    const [newDeveloper, setNewDeveloper] = useState<NewDeveloper>({
        name: '',
        role: 'executor'
    });

    const { getDeveloperProjects } = useDeveloperProjects();
    const { boards } = useDashboard();
    const isLeader = developers.some(dev => dev.isCurrentUser && dev.role === 'leader');

    const calculateCompletedTasks = (developerName: string): number => {
        let completedTasks = 0;

        boards.forEach(board => {
            if (board.title === 'Done') {
                board.cards?.forEach(card => {
                    if (card.author.name === developerName) {
                        completedTasks++;
                    }
                });
            }
        });

        return completedTasks;
    };

    const calculateOverdueTasks = (developerName: string): number => {
        let overdueTasks = 0;
        const today = new Date();

        boards.forEach(board => {
            if (board.title !== 'Done') {
                board.cards?.forEach(card => {
                    if (card.author.name === developerName && card.dueDate) {
                        const dueDate = new Date(card.dueDate);
                        if (dueDate < today) {
                            overdueTasks++;
                        }
                    }
                });
            }
        });

        return overdueTasks;
    };

    const updateAllDeveloperProjects = () => {
        setIsRefreshing(true);

        const updatedDevelopers = developers.map(developer => ({
            ...developer,
            projects: getDeveloperProjects(developer),
            completedTasks: calculateCompletedTasks(developer.name),
            overdueTasks: calculateOverdueTasks(developer.name)
        }));

        setDevelopers(updatedDevelopers);

        setTimeout(() => {
            setIsRefreshing(false);
            showSnackbar('Данные разработчиков обновлены', 'success');
        }, 500);
    };

    useEffect(() => {
        updateAllDeveloperProjects();
    }, [boards]);

    useEffect(() => {
        updateAllDeveloperProjects();
    }, []);

    const handleAddDeveloper = (developerData: NewDeveloper) => {
        const newDev: Developer = {
            id: Math.max(0, ...developers.map(d => d.id)) + 1,
            name: developerData.name,
            avatar: null,
            role: developerData.role,
            completedTasks: calculateCompletedTasks(developerData.name),
            overdueTasks: calculateOverdueTasks(developerData.name),
            projects: getDeveloperProjects({
                name: developerData.name,
                role: developerData.role,
                completedTasks: 0,
                overdueTasks: 0,
                projects: [],
                avatar: null,
                id: 0
            })
        };

        setDevelopers(prev => [...prev, newDev]);
        setNewDeveloper({ name: '', role: 'executor' });
        setIsAddDeveloperOpen(false);
        showSnackbar(`Участник ${developerData.name} добавлен в проект`, 'success');
    };

    const handleEditDeveloper = (developer: Developer) => {
        setEditingDeveloper(developer);
        setIsEditDeveloperOpen(true);
    };

    const handleUpdateDeveloper = (updatedDeveloper: Developer) => {
        setDevelopers(prev =>
            prev.map(dev =>
                dev.id === updatedDeveloper.id ? updatedDeveloper : dev
            )
        );
        setIsEditDeveloperOpen(false);
        setEditingDeveloper(null);
        showSnackbar(`Данные участника ${updatedDeveloper.name} обновлены`, 'success');
    };

    const handleRemoveDeveloper = (developerId: number) => {
        const developer = developers.find(dev => dev.id === developerId);
        if (developer) {
            setDeleteConfirmation({
                isOpen: true,
                developerId,
                developerName: developer.name
            });
        }
    };

    const confirmDelete = () => {
        if (deleteConfirmation.developerId) {
            const developerName = developers.find(dev => dev.id === deleteConfirmation.developerId)?.name;
            setDevelopers(prev => prev.filter(dev => dev.id !== deleteConfirmation.developerId));
            setDeleteConfirmation({ isOpen: false, developerId: null, developerName: '' });
            showSnackbar(`Участник ${developerName} удален из проекта`, 'success');
        }
    };

    const cancelDelete = () => {
        setDeleteConfirmation({ isOpen: false, developerId: null, developerName: '' });
    };

    const showSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbar({ isOpen: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, isOpen: false });
    };

    const handleManualRefresh = () => {
        updateAllDeveloperProjects();
    };

    return (
        <div className={styles.developersSection}>
            <div className={styles.developersHeader}>
                <div className={styles.headerTop}>
                    <div className={styles.titleSection}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <h1 className={styles.pageTitle}>Команда разработчиков</h1>
                            <Button
                                onClick={handleManualRefresh}
                                disabled={isRefreshing}
                                startIcon={isRefreshing ? <CircularProgress size={16} /> : <FaSync />}
                                sx={{
                                    minWidth: 'auto',
                                    padding: '8px 16px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                                    color: 'white',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    fontSize: '0.9rem',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                                        boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
                                        transform: 'translateY(-1px)'
                                    },
                                    '&:disabled': {
                                        background: 'rgba(100, 116, 139, 0.2)',
                                        color: 'rgba(100, 116, 139, 0.5)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {isRefreshing ? 'Обновление...' : 'Обновить данные'}
                            </Button>
                        </Box>
                        <p className={styles.pageSubtitle}>
                            Управление участниками проекта и их ролями в системе.
                            Проекты и задачи автоматически обновляются при изменении данных.
                            {isRefreshing && ' (Обновление...)'}
                        </p>
                    </div>
                </div>
            </div>

            <div className={styles.developersContent}>
                <DevelopersTable
                    developers={developers}
                    isLeader={isLeader}
                    onRemoveDeveloper={handleRemoveDeveloper}
                    onEditDeveloper={handleEditDeveloper}
                />
            </div>

            <AddDeveloperDialog
                open={isAddDeveloperOpen}
                onClose={() => setIsAddDeveloperOpen(false)}
                onAdd={handleAddDeveloper}
                newDeveloper={newDeveloper}
                onNewDeveloperChange={setNewDeveloper}
            />

            <EditDeveloperDialog
                open={isEditDeveloperOpen}
                developer={editingDeveloper}
                onClose={() => {
                    setIsEditDeveloperOpen(false);
                    setEditingDeveloper(null);
                }}
                onUpdate={handleUpdateDeveloper}
            />

            <DeleteConfirmationDialog
                open={deleteConfirmation.isOpen}
                developerName={deleteConfirmation.developerName}
                onClose={cancelDelete}
                onConfirm={confirmDelete}
            />

            <Snackbar
                open={snackbar.isOpen}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{
                        borderRadius: '12px',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        '& .MuiAlert-message': {
                            padding: '4px 0'
                        }
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
};