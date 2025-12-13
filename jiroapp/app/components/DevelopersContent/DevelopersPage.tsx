'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, Snackbar, Alert, Box, CircularProgress, Typography } from '@mui/material';
import { FaUserPlus, FaSync, FaPlus, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';
import { Developer, ProjectRole, DevelopersPageProps } from './types/developer.types';
import { DevelopersTable } from './components/DevelopersTable';
import { AddDeveloperDialog } from './components/AddDeveloperDialog';
import { DeleteConfirmationDialog } from './components/DeleteConfirmationDialog';
import { EditDeveloperDialog } from './components/EditDeveloperDialog';
import { useDeveloperProjects } from './hooks/useDeveloperProjects';
import { useDashboard } from '../DashboardContent/hooks/useDashboard';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjectMembers } from './hooks/useProjectMembers';
import styles from './DevelopersPage.module.css';
import { api } from '@/app/auth/hooks/useTokenRefresh';


const DevelopersPage = ({ projectId }: DevelopersPageProps) => {
    const [developers, setDevelopers] = useState<Developer[]>([]);
    const [projectRoles, setProjectRoles] = useState<ProjectRole[]>([]);
    const [currentUserRole, setCurrentUserRole] = useState<ProjectRole | null>(null);
    const [isAddDeveloperOpen, setIsAddDeveloperOpen] = useState(false);
    const [isEditDeveloperOpen, setIsEditDeveloperOpen] = useState(false);
    const [editingDeveloper, setEditingDeveloper] = useState<Developer | null>(null);
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

    const [newDeveloper, setNewDeveloper] = useState({
        name: '',
        role: 'executor' as Developer['role']
    });

    const { members, loading, error, refetch } = useProjectMembers(projectId);
    const { getDeveloperProjects } = useDeveloperProjects();
    const { boards } = useDashboard();

    const fetchProjectRoles = useCallback(async () => {
        if (!projectId) return;

        try {
            const response = await api.get(`/projects/${projectId}/roles`);
            if (response.data && Array.isArray(response.data.roles)) {
                const rolesWithNumberIds = response.data.roles.map((role: any) => ({
                    ...role,
                    id: Number(role.id)
                }));
                const uniqueRoles = rolesWithNumberIds.filter((role: ProjectRole, index: number, self: ProjectRole[]) =>
                    index === self.findIndex((r) => r.id === role.id)
                );
                setProjectRoles(uniqueRoles);
            }
        } catch (err) {
            console.error('Ошибка при загрузке ролей проекта:', err);
        }
    }, [projectId]);

    const fetchCurrentUserRole = useCallback(async () => {
        if (!projectId) return;

        try {
            const response = await api.get(`/projects/${projectId}/roles/me`);
            if (response.data) {
                const roleWithNumberId = {
                    ...response.data,
                    id: Number(response.data.id)
                };
                setCurrentUserRole(roleWithNumberId);
            }
        } catch (err) {
            console.error('Ошибка при загрузке роли текущего пользователя:', err);
        }
    }, [projectId]);

    const roleMapping = useCallback((roleName: string): Developer['role'] => {
        const roleMap: Record<string, Developer['role']> = {
            'OWNER': 'leader',
            'LEADER': 'leader',
            'ADMIN': 'leader',
            'MANAGER': 'leader',
            'EXECUTOR': 'executor',
            'DEVELOPER': 'executor',
            'PROGRAMMER': 'executor',
            'ASSISTANT': 'assistant',
            'HELPER': 'assistant',
            'VIEWER': 'assistant',
            'OBSERVER': 'assistant'
        };

        const normalizedRoleName = roleName.toUpperCase();
        return roleMap[normalizedRoleName] || 'executor';
    }, []);

    const mapMemberToDeveloper = useCallback((member: ProjectMember): Developer => {
        const roleName = member.role || '';
        const mappedRole = roleMapping(roleName);

        return {
            id: member.userId,
            name: member.username,
            avatar: null,
            role: mappedRole,
            completedTasks: 0,
            overdueTasks: 0,
            projects: [],
            isCurrentUser: false,
            tag: member.tag,
            bio: member.bio,
            createdAt: member.createdAt,
            roleId: member.roleId,
            originalRole: roleName
        };
    }, [roleMapping]);

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

    useEffect(() => {
        if (!projectId) {
            setDevelopers([]);
            return;
        }

        if (!loading && members.length > 0) {
            const initialDevelopers = members.map(mapMemberToDeveloper);

            const developersWithStats = initialDevelopers.map(developer => ({
                ...developer,
                projects: getDeveloperProjects(developer),
                completedTasks: calculateCompletedTasks(developer.name),
                overdueTasks: calculateOverdueTasks(developer.name)
            }));

            setDevelopers(developersWithStats);
        } else if (!loading) {
            setDevelopers([]);
        }
    }, [loading, members, projectId]);

    useEffect(() => {
        if (developers.length > 0) {
            const updatedDevelopers = developers.map(developer => ({
                ...developer,
                projects: getDeveloperProjects(developer),
                completedTasks: calculateCompletedTasks(developer.name),
                overdueTasks: calculateOverdueTasks(developer.name)
            }));
            setDevelopers(updatedDevelopers);
        }
    }, [boards]);

    useEffect(() => {
        fetchProjectRoles();
        fetchCurrentUserRole();
    }, [fetchProjectRoles, fetchCurrentUserRole]);

    const getRoleFilterOptions = useMemo(() => {
        if (projectRoles.length === 0) {
            return [
                { value: 'all', label: 'Все' }
            ];
        }

        const allRoles = [
            { value: 'all', label: 'Все' },
            ...projectRoles.map(role => ({
                value: role.name,
                label: role.name,
                isOwner: role.isOwner,
                isDefault: role.isDefault
            }))
        ];

        const uniqueRoles = allRoles.filter((role, index, self) =>
            index === self.findIndex((r) => r.value === role.value)
        );

        return uniqueRoles;
    }, [projectRoles]);

    const isOwner = useMemo(() => {
        return currentUserRole?.isOwner || false;
    }, [currentUserRole]);

    const handleAddDeveloper = (developerData: { name: string; role: Developer['role'] }) => {
        showSnackbar('Добавление участников через API пока не поддерживается', 'info');
    };

    const handleEditDeveloper = (developer: Developer) => {
        setEditingDeveloper(developer);
        setIsEditDeveloperOpen(true);
    };

    const handleUpdateDeveloper = async (updatedDeveloper: Developer) => {
        if (!projectId || !editingDeveloper) return;

        try {
            const role = projectRoles.find(r => r.name === updatedDeveloper.role);
            if (!role) {
                showSnackbar('Роль не найдена', 'error');
                return;
            }

            await api.patch(`/projects/${projectId}/roles/assign`, {
                userId: editingDeveloper.id,
                roleId: role.id
            });

            showSnackbar('Роль участника успешно обновлена', 'success');

            setDevelopers(prev => prev.map(dev =>
                dev.id === editingDeveloper.id
                    ? { ...dev, role: updatedDeveloper.role, originalRole: updatedDeveloper.role }
                    : dev
            ));

            setIsEditDeveloperOpen(false);
            setEditingDeveloper(null);
            refetch();
        } catch (err: any) {
            console.error('Ошибка при обновлении роли:', err);

            let errorMessage = 'Не удалось обновить роль участника';
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.status === 500) {
                errorMessage = 'Внутренняя ошибка сервера. Попробуйте позже.';
            }

            showSnackbar(errorMessage, 'error');
        }
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

    const confirmDelete = async () => {
        if (!deleteConfirmation.developerId || !projectId) {
            setDeleteConfirmation({ isOpen: false, developerId: null, developerName: '' });
            return;
        }

        try {
            await api.delete(`/projects/${projectId}/members/${deleteConfirmation.developerId}`);

            showSnackbar('Участник успешно удален из проекта', 'success');

            setDevelopers(prev => prev.filter(dev => dev.id !== deleteConfirmation.developerId));

            setDeleteConfirmation({ isOpen: false, developerId: null, developerName: '' });
            refetch();
        } catch (err) {
            console.error('Ошибка при удалении участника:', err);
            showSnackbar('Не удалось удалить участника из проекта', 'error');
            setDeleteConfirmation({ isOpen: false, developerId: null, developerName: '' });
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
        refetch();
        fetchProjectRoles();
        fetchCurrentUserRole();
    };

    const filteredDevelopers = useMemo(() => {
        return developers.filter(dev => {
            if (filterRole === 'all') return true;
            return dev.originalRole === filterRole;
        });
    }, [developers, filterRole]);

    const sortedDevelopers = useMemo(() => {
        return [...filteredDevelopers].sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'tasks':
                    return b.completedTasks - a.completedTasks;
                case 'role':
                    return (a.originalRole || '').localeCompare(b.originalRole || '');
                default:
                    return 0;
            }
        });
    }, [filteredDevelopers, sortBy]);

    const stats = useMemo(() => ({
        total: developers.length,
        leaders: developers.filter(d => d.role === 'leader').length,
        executors: developers.filter(d => d.role === 'executor').length,
        assistants: developers.filter(d => d.role === 'assistant').length,
        totalCompleted: developers.reduce((sum, dev) => sum + dev.completedTasks, 0),
        totalOverdue: developers.reduce((sum, dev) => sum + (dev.overdueTasks || 0), 0),
        totalRoles: projectRoles.length
    }), [developers, projectRoles]);

    const getRoleColor = (roleValue: string) => {
        if (roleValue === 'all') return 'linear-gradient(135deg, #8b5cf6, #a78bfa)';

        const role = projectRoles.find(r => r.name === roleValue);
        if (!role) return 'linear-gradient(135deg, #6b7280, #9ca3af)';

        if (role.isOwner) return 'linear-gradient(135deg, #ef4444, #f87171)';
        if (role.isDefault) return 'linear-gradient(135deg, #60a5fa, #93c5fd)';
        return 'linear-gradient(135deg, #3b82f6, #60a5fa)';
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
                                    {error ? 'Ошибка загрузки' : `${stats.total} участников • ${stats.totalCompleted} выполненных задач • ${stats.totalRoles} ролей`}
                                </Typography>
                                {projectId && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: '#8b5cf6',
                                            fontWeight: 600,
                                            display: 'block',
                                            mt: 0.5
                                        }}
                                    >
                                        Проект ID: {projectId}
                                    </Typography>
                                )}
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
                            border: '1px solid rgba(139, 92, 246, 0.1)',
                            flexWrap: 'wrap'
                        }}>
                            {getRoleFilterOptions.map((role) => (
                                <Button
                                    key={role.value}
                                    onClick={() => setFilterRole(role.value)}
                                    variant={filterRole === role.value ? 'contained' : 'text'}
                                    size="small"
                                    sx={{
                                        borderRadius: '8px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.8rem',
                                        padding: '6px 12px',
                                        minWidth: 'auto',
                                        whiteSpace: 'nowrap',
                                        background: filterRole === role.value ? getRoleColor(role.value) : 'transparent',
                                        color: filterRole === role.value ? 'white' : '#64748b',
                                        '&:hover': {
                                            background: filterRole === role.value ? getRoleColor(role.value) : 'rgba(139, 92, 246, 0.05)',
                                            color: filterRole === role.value ? 'white' : '#3b82f6'
                                        }
                                    }}
                                >
                                    {role.label}
                                </Button>
                            ))}
                        </Box>

                        <Box sx={{ flex: 1 }} />

                        <Button
                            onClick={handleManualRefresh}
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={16} /> : <FaSync />}
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
                            {loading ? 'Обновление...' : 'Обновить'}
                        </Button>

                        {isOwner && (
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
                        )}
                    </Box>
                </motion.div>
            </div>

            <AnimatePresence mode="wait">
                {loading ? (
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
                                    key={`loading-skeleton-${i}`}
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
                ) : error ? (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={styles.developersContent}
                    >
                        <Box sx={{
                            padding: 4,
                            textAlign: 'center',
                            background: 'rgba(239, 68, 68, 0.05)',
                            borderRadius: '16px',
                            border: '1px solid rgba(239, 68, 68, 0.2)'
                        }}>
                            <FaExclamationTriangle style={{ fontSize: '48px', color: '#ef4444', marginBottom: '16px' }} />
                            <Typography variant="h6" sx={{ color: '#ef4444', mb: 1 }}>
                                Ошибка загрузки
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748b' }}>
                                {error}
                            </Typography>
                            <Button
                                onClick={handleManualRefresh}
                                variant="outlined"
                                sx={{ mt: 2 }}
                            >
                                Попробовать снова
                            </Button>
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
                            isLeader={isOwner}
                            onRemoveDeveloper={handleRemoveDeveloper}
                            onEditDeveloper={handleEditDeveloper}
                            projectRoles={projectRoles}
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
                projectRoles={projectRoles}
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