'use client'

import { useState, useEffect, useCallback } from 'react';
import { Button, Snackbar, Alert, Box, CircularProgress, Typography, IconButton } from '@mui/material';
import { FaUserPlus, FaSync, FaEdit, FaFilter, FaPlus, FaChartLine } from 'react-icons/fa';
import { Developer, NewDeveloper } from './types/developer.types';
import { mockDevelopers } from './data/mockDevelopers';
import { DevelopersTable } from './components/DevelopersTable';
import { AddDeveloperDialog } from './components/AddDeveloperDialog';
import { DeleteConfirmationDialog } from './components/DeleteConfirmationDialog';
import { EditDeveloperDialog } from './components/EditDeveloperDialog';
import { useDeveloperProjects } from './hooks/useDeveloperProjects';
import { useDashboard } from '../DashboardContent/hooks/useDashboard';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './DevelopersPage.module.css';

const DevelopersPage = () => {
    const [developers, setDevelopers] = useState<Developer[]>(mockDevelopers);
    const [isAddDeveloperOpen, setIsAddDeveloperOpen] = useState(false);
    const [isEditDeveloperOpen, setIsEditDeveloperOpen] = useState(false);
    const [editingDeveloper, setEditingDeveloper] = useState<Developer | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [filterRole, setFilterRole] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'name' | 'tasks' | 'role'>('name');

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
        severity: 'success' | 'error' | 'info' | 'warning';
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

    const calculateCompletedTasks = useCallback((developerName: string): number => {
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
    }, [boards]);

    const calculateOverdueTasks = useCallback((developerName: string): number => {
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
    }, [boards]);

    const updateAllDeveloperProjects = useCallback(() => {
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
    }, [developers, getDeveloperProjects, calculateCompletedTasks, calculateOverdueTasks]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
            updateAllDeveloperProjects();
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        updateAllDeveloperProjects();
    }, [boards]);

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

    const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
        setSnackbar({ isOpen: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, isOpen: false });
    };

    const handleManualRefresh = () => {
        updateAllDeveloperProjects();
    };

    const filteredDevelopers = developers.filter(dev => {
        if (filterRole === 'all') return true;
        return dev.role === filterRole;
    });

    const sortedDevelopers = [...filteredDevelopers].sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'tasks':
                return b.completedTasks - a.completedTasks;
            case 'role':
                return a.role.localeCompare(b.role);
            default:
                return 0;
        }
    });

    const stats = {
        total: developers.length,
        leaders: developers.filter(d => d.role === 'leader').length,
        executors: developers.filter(d => d.role === 'executor').length,
        assistants: developers.filter(d => d.role === 'assistant').length,
        totalCompleted: developers.reduce((sum, dev) => sum + dev.completedTasks, 0),
        totalOverdue: developers.reduce((sum, dev) => sum + (dev.overdueTasks || 0), 0)
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={styles.developersSection}
        >
            <div className={styles.developersHeader}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={styles.headerTop}
                >
                    <div className={styles.titleSection}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Box sx={{
                                background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                                borderRadius: '16px',
                                padding: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 8px 20px rgba(139, 92, 246, 0.2)'
                            }}>
                                <FaUserPlus style={{ color: 'white', fontSize: '24px' }} />
                            </Box>
                            <Box>
                                <h1 className={styles.pageTitle}>Команда разработчиков</h1>
                                <Typography
                                    sx={{
                                        color: '#64748b',
                                        fontSize: '0.95rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}
                                >
                                    <FaChartLine />
                                    {stats.total} участников • {stats.totalCompleted} выполненных задач
                                </Typography>
                            </Box>
                        </Box>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className={styles.controlsSection}
                >
                    <Box sx={{
                        display: 'flex',
                        gap: 2,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        mb: 3
                    }}>
                        <Box sx={{
                            display: 'flex',
                            gap: 1,
                            background: 'rgba(255, 255, 255, 0.9)',
                            padding: '4px',
                            borderRadius: '12px',
                            border: '1px solid rgba(139, 92, 246, 0.1)'
                        }}>
                            {['all', 'leader', 'executor', 'assistant'].map((role) => (
                                <Button
                                    key={role}
                                    onClick={() => setFilterRole(role)}
                                    variant={filterRole === role ? 'contained' : 'text'}
                                    size="small"
                                    sx={{
                                        borderRadius: '8px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.8rem',
                                        padding: '6px 16px',
                                        minWidth: 'auto',
                                        background: filterRole === role
                                            ? role === 'all'
                                                ? 'linear-gradient(135deg, #8b5cf6, #a78bfa)'
                                                : role === 'leader'
                                                    ? 'linear-gradient(135deg, #ef4444, #f87171)'
                                                    : role === 'executor'
                                                        ? 'linear-gradient(135deg, #3b82f6, #60a5fa)'
                                                        : 'linear-gradient(135deg, #10b981, #34d399)'
                                            : 'transparent',
                                        '&:hover': {
                                            background: filterRole === role ? undefined : 'rgba(139, 92, 246, 0.05)'
                                        }
                                    }}
                                >
                                    {role === 'all' ? 'Все' :
                                        role === 'leader' ? 'Руководители' :
                                            role === 'executor' ? 'Разработчики' : 'Помощники'}
                                </Button>
                            ))}
                        </Box>

                        <Box sx={{ flex: 1 }} />

                        <Button
                            onClick={handleManualRefresh}
                            disabled={isRefreshing}
                            startIcon={isRefreshing ? <CircularProgress size={16} /> : <FaSync />}
                            sx={{
                                padding: '10px 20px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                                color: 'white',
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: '0.9rem',
                                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
                                    boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)',
                                    transform: 'translateY(-2px)'
                                },
                                '&:disabled': {
                                    background: 'rgba(100, 116, 139, 0.1)',
                                    color: 'rgba(100, 116, 139, 0.3)',
                                    transform: 'none',
                                    boxShadow: 'none'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {isRefreshing ? 'Обновление...' : 'Обновить'}
                        </Button>

                        <Button
                            onClick={() => setIsAddDeveloperOpen(true)}
                            variant="contained"
                            startIcon={<FaPlus />}
                            sx={{
                                padding: '10px 24px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #10b981, #34d399)',
                                color: 'white',
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: '0.9rem',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #059669, #10b981)',
                                    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                                    transform: 'translateY(-2px)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Добавить участника
                        </Button>
                    </Box>
                </motion.div>
            </div>

            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={styles.developersContent}
                    >
                        <Box sx={{
                            display: 'grid',
                            gap: 2,
                            padding: '20px 0'
                        }}>
                            {[1, 2, 3, 4].map((i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Box sx={{
                                        height: '80px',
                                        background: 'rgba(255, 255, 255, 0.8)',
                                        borderRadius: '16px',
                                        animation: 'pulse 1.5s ease-in-out infinite'
                                    }} />
                                </motion.div>
                            ))}
                        </Box>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={styles.developersContent}
                    >
                        <DevelopersTable
                            developers={sortedDevelopers}
                            isLeader={isLeader}
                            onRemoveDeveloper={handleRemoveDeveloper}
                            onEditDeveloper={handleEditDeveloper}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

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
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                        backdropFilter: 'blur(10px)',
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        '& .MuiAlert-message': {
                            padding: '6px 0'
                        }
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </motion.div>
    );
};

export default DevelopersPage;