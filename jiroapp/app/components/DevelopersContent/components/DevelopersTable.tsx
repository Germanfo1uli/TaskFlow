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
    Tooltip,
    alpha
} from '@mui/material';
import { FaTrash, FaCrown, FaUserCheck, FaUserFriends } from 'react-icons/fa';
import { Developer } from '../types/developer.types';
import { DeveloperRoleChip } from './DeveloperRoleChip';

interface DevelopersTableProps {
    developers: Developer[];
    isLeader: boolean;
    onRemoveDeveloper: (developerId: number) => void;
}

export const DevelopersTable = ({
                                    developers,
                                    isLeader,
                                    onRemoveDeveloper
                                }: DevelopersTableProps) => {
    const canRemoveDeveloper = (developer: Developer) => {
        return isLeader && !developer.isCurrentUser && developer.role !== 'leader';
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'leader':
                return <FaCrown style={{ fontSize: '14px' }} />;
            case 'executor':
                return <FaUserCheck style={{ fontSize: '14px' }} />;
            case 'assistant':
                return <FaUserFriends style={{ fontSize: '14px' }} />;
            default:
                return <FaUserFriends style={{ fontSize: '14px' }} />;
        }
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
            <Table sx={{ minWidth: 650 }}>
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
                        <TableCell>Выполнено задач</TableCell>
                        <TableCell align="center">Действия</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {developers.map((developer, index) => (
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
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
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
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: '#64748b',
                                                fontSize: '0.85rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5
                                            }}
                                        >
                                            <span style={{ opacity: 0.7 }}>@</span>
                                            {developer.username}
                                        </Typography>
                                    </Box>
                                </Box>
                            </TableCell>

                            <TableCell>
                                <DeveloperRoleChip role={developer.role} />
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

                            <TableCell align="center">
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
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};