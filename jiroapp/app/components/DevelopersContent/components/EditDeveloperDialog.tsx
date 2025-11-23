import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Box,
    Typography
} from '@mui/material';
import { FaSave, FaUserEdit } from 'react-icons/fa';
import { Developer, DeveloperRole } from '../types/developer.types';
import { useState, useEffect } from 'react';

interface EditDeveloperDialogProps {
    open: boolean;
    developer: Developer | null;
    onClose: () => void;
    onUpdate: (developer: Developer) => void;
}

export const EditDeveloperDialog = ({
                                        open,
                                        developer,
                                        onClose,
                                        onUpdate
                                    }: EditDeveloperDialogProps) => {
    const [editedDeveloper, setEditedDeveloper] = useState<Developer | null>(null);

    useEffect(() => {
        if (developer) {
            setEditedDeveloper({ ...developer });
        }
    }, [developer]);

    const handleSubmit = () => {
        if (editedDeveloper && editedDeveloper.name.trim()) {
            onUpdate(editedDeveloper);
        }
    };

    const handleClose = () => {
        onClose();
    };

    if (!editedDeveloper) return null;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    padding: '8px',
                    background: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(20px)',
                    minWidth: '450px'
                }
            }}
        >
            <DialogTitle
                sx={{
                    fontWeight: 700,
                    color: '#1e293b',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    padding: '24px 24px 16px'
                }}
            >
                <FaUserEdit style={{ fontSize: '20px' }} />
                Редактировать участника
            </DialogTitle>

            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2, padding: '0 8px' }}>
                    <Box>
                        <Typography
                            variant="body2"
                            sx={{
                                color: '#64748b',
                                marginBottom: 1,
                                fontSize: '0.9rem'
                            }}
                        >
                            Измените данные участника команды
                        </Typography>
                        <TextField
                            label="Имя и фамилия участника"
                            placeholder="например: Иван Иванов"
                            value={editedDeveloper.name}
                            onChange={(e) => setEditedDeveloper(prev => prev ? {...prev, name: e.target.value} : null)}
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    '&:hover fieldset': {
                                        borderColor: '#8b5cf6'
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#8b5cf6',
                                        borderWidth: '2px'
                                    }
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#8b5cf6'
                                }
                            }}
                        />
                    </Box>

                    <FormControl fullWidth>
                        <InputLabel>Роль в проекте</InputLabel>
                        <Select
                            value={editedDeveloper.role}
                            label="Роль в проекте"
                            onChange={(e) => setEditedDeveloper(prev => prev ? {...prev, role: e.target.value as DeveloperRole} : null)}
                            sx={{
                                borderRadius: '12px',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(0, 0, 0, 0.23)'
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#8b5cf6'
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#8b5cf6'
                                }
                            }}
                        >
                            <MenuItem value="executor">Разработчик</MenuItem>
                            <MenuItem value="assistant">Помощник разработчика</MenuItem>
                            <MenuItem value="leader">Руководитель</MenuItem>
                        </Select>
                    </FormControl>

                    <Box sx={{
                        background: 'rgba(59, 130, 246, 0.05)',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid rgba(59, 130, 246, 0.1)'
                    }}>
                        <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
                            Статистика участника:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600 }}>
                                Выполнено: {editedDeveloper.completedTasks} задач
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: editedDeveloper.overdueTasks > 0 ? '#ef4444' : '#10b981',
                                    fontWeight: 600
                                }}
                            >
                                Просрочено: {editedDeveloper.overdueTasks || 0} задач
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ padding: '20px 24px', gap: 1 }}>
                <Button
                    onClick={handleClose}
                    variant="outlined"
                    sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 600,
                        color: '#64748b',
                        borderColor: 'rgba(100, 116, 139, 0.3)',
                        padding: '8px 20px',
                        '&:hover': {
                            borderColor: '#64748b',
                            background: 'rgba(100, 116, 139, 0.04)'
                        }
                    }}
                >
                    Отмена
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    startIcon={<FaSave />}
                    disabled={!editedDeveloper.name.trim()}
                    sx={{
                        background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 600,
                        padding: '8px 24px',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)'
                        },
                        '&:disabled': {
                            background: 'rgba(100, 116, 139, 0.2)',
                            color: 'rgba(100, 116, 139, 0.5)'
                        }
                    }}
                >
                    Сохранить изменения
                </Button>
            </DialogActions>
        </Dialog>
    );
};