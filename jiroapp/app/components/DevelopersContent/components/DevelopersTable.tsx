import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
    Chip,
    IconButton,
    Typography,
    Box,
    Tooltip
} from '@mui/material';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { Developer } from '../types/developer.types';
import { DeveloperRoleChip } from './DeveloperRoleChip';
import { useDeveloperProjects } from '../hooks/useDeveloperProjects';

interface DevelopersTableProps {
    developers: Developer[];
    isLeader: boolean;
    onRemoveDeveloper: (developerId: number) => void;
    onEditDeveloper: (developer: Developer) => void;
}

export const DevelopersTable = ({
                                    developers,
                                    isLeader,
                                    onRemoveDeveloper,
                                    onEditDeveloper
                                }: DevelopersTableProps) => {
    const { getDeveloperProjects } = useDeveloperProjects();

    const canEditDeveloper = (developer: Developer) => {
        return isLeader && !developer.isCurrentUser;
    };

    const canRemoveDeveloper = (developer: Developer) => {
        return isLeader && !developer.isCurrentUser && developer.role !== 'leader';
    };

    const getCurrentProjects = (developer: Developer) => {
        return getDeveloperProjects(developer);
    };

    return (
        <TableContainer
            component={Paper}
            sx={{
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(59, 130, 246, 0.15)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.4), transparent)'
                }
            }}
        >
            <Table sx={{ minWidth: 800 }}>
                <TableHead>
                    <TableRow
                        sx={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                            '& th': {
                                border: 'none',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                padding: '16px 20px',
                                position: 'relative',
                                '&:not(:last-child)::after': {
                                    content: '""',
                                    position: 'absolute',
                                    right: 0,
                                    top: '20%',
                                    height: '60%',
                                    width: '1px',
                                    background: 'rgba(255, 255, 255, 0.3)'
                                }
                            }
                        }}
                    >
                        <TableCell>Участник</TableCell>
                        <TableCell>Роль</TableCell>
                        <TableCell>Проекты</TableCell>
                        <TableCell>Выполнено задач</TableCell>
                        <TableCell>Просроченные задачи</TableCell>
                        <TableCell align="center">Действия</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {developers.map((developer, index) => {
                        const developerProjects = getCurrentProjects(developer);

                        return (
                            <TableRow
                                key={developer.id}
                                sx={{
                                    '&:last-child td': { border: 0 },
                                    '&:hover': {
                                        backgroundColor: 'rgba(59, 130, 246, 0.03)',
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                                    },
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    background: index % 2 === 0
                                        ? 'rgba(255, 255, 255, 0.5)'
                                        : 'rgba(248, 250, 252, 0.7)',
                                    '& td': {
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
                                        padding: '16px 20px',
                                        position: 'relative'
                                    }
                                }}
                            >
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar
                                            sx={{
                                                width: 44,
                                                height: 44,
                                                background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                                border: '2px solid rgba(255, 255, 255, 0.9)',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'scale(1.05)',
                                                    boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)'
                                                }
                                            }}
                                        >
                                            {developer.avatar ? (
                                                <img
                                                    src={developer.avatar}
                                                    alt={developer.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <span style={{
                                                    color: 'white',
                                                    fontWeight: 700,
                                                    fontSize: '14px'
                                                }}>
                                                    {developer.name.split(' ').map(n => n[0]).join('')}
                                                </span>
                                            )}
                                        </Avatar>
                                        <Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        fontWeight: 700,
                                                        color: '#1e293b',
                                                        fontSize: '1rem'
                                                    }}
                                                >
                                                    {developer.name}
                                                </Typography>
                                                {developer.isCurrentUser && (
                                                    <Chip
                                                        label="Вы"
                                                        size="small"
                                                        sx={{
                                                            background: 'linear-gradient(135deg, #10b981, #34d399)',
                                                            color: 'white',
                                                            fontWeight: 700,
                                                            fontSize: '0.7rem',
                                                            height: '20px',
                                                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>
                                </TableCell>

                                <TableCell>
                                    <DeveloperRoleChip role={developer.role} />
                                </TableCell>

                                <TableCell>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: '200px' }}>
                                        {developerProjects.slice(0, 3).map((project, index) => (
                                            <Chip
                                                key={index}
                                                label={project}
                                                size="small"
                                                sx={{
                                                    background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    fontSize: '0.75rem',
                                                    height: '24px',
                                                    boxShadow: '0 2px 6px rgba(139, 92, 246, 0.3)',
                                                    '&:hover': {
                                                        transform: 'translateY(-1px)',
                                                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)'
                                                    },
                                                    transition: 'all 0.2s ease'
                                                }}
                                            />
                                        ))}
                                        {developerProjects.length > 3 && (
                                            <Tooltip
                                                title={developerProjects.slice(3).join(', ')}
                                                arrow
                                            >
                                                <Chip
                                                    label={`+${developerProjects.length - 3}`}
                                                    size="small"
                                                    sx={{
                                                        background: 'rgba(100, 116, 139, 0.1)',
                                                        color: '#64748b',
                                                        fontWeight: 600,
                                                        fontSize: '0.75rem',
                                                        height: '24px',
                                                        border: '1px solid rgba(100, 116, 139, 0.2)'
                                                    }}
                                                />
                                            </Tooltip>
                                        )}
                                        {developerProjects.length === 0 && (
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: '#94a3b8',
                                                    fontStyle: 'italic',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                Нет проектов
                                            </Typography>
                                        )}
                                    </Box>
                                </TableCell>

                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: '10px',
                                                background: 'linear-gradient(135deg, #10b981, #34d399)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: 700,
                                                fontSize: '0.9rem',
                                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                            }}
                                        >
                                            {developer.completedTasks}
                                        </Box>
                                        <Typography
                                            sx={{
                                                fontWeight: 600,
                                                color: '#1e293b',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            задач
                                        </Typography>
                                    </Box>
                                </TableCell>

                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: '10px',
                                                background: developer.overdueTasks > 0
                                                    ? 'linear-gradient(135deg, #ef4444, #f87171)'
                                                    : 'linear-gradient(135deg, #10b981, #34d399)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: 700,
                                                fontSize: '0.9rem',
                                                boxShadow: developer.overdueTasks > 0
                                                    ? '0 4px 12px rgba(239, 68, 68, 0.3)'
                                                    : '0 4px 12px rgba(16, 185, 129, 0.3)'
                                            }}
                                        >
                                            {developer.overdueTasks || 0}
                                        </Box>
                                        <Typography
                                            sx={{
                                                fontWeight: 600,
                                                color: developer.overdueTasks > 0 ? '#ef4444' : '#1e293b',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            {developer.overdueTasks > 0 ? 'просрочено' : 'нет'}
                                        </Typography>
                                    </Box>
                                </TableCell>

                                <TableCell align="center">
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                        {canEditDeveloper(developer) && (
                                            <Tooltip
                                                title="Редактировать участника"
                                                arrow
                                                placement="top"
                                            >
                                                <IconButton
                                                    onClick={() => onEditDeveloper(developer)}
                                                    sx={{
                                                        color: '#3b82f6',
                                                        background: 'rgba(59, 130, 246, 0.1)',
                                                        border: '1px solid rgba(59, 130, 246, 0.2)',
                                                        width: 40,
                                                        height: 40,
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            background: 'rgba(59, 130, 246, 0.2)',
                                                            transform: 'scale(1.1)',
                                                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                                        }
                                                    }}
                                                >
                                                    <FaEdit style={{ fontSize: '16px' }} />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {canRemoveDeveloper(developer) && (
                                            <Tooltip
                                                title="Удалить из проекта"
                                                arrow
                                                placement="top"
                                            >
                                                <IconButton
                                                    onClick={() => onRemoveDeveloper(developer.id)}
                                                    sx={{
                                                        color: '#ef4444',
                                                        background: 'rgba(239, 68, 68, 0.1)',
                                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                                        width: 40,
                                                        height: 40,
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            background: 'rgba(239, 68, 68, 0.2)',
                                                            transform: 'scale(1.1) rotate(5deg)',
                                                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                                                        }
                                                    }}
                                                >
                                                    <FaTrash style={{ fontSize: '16px' }} />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};