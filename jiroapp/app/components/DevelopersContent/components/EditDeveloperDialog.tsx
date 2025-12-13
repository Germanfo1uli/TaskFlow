import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    Box,
    Typography,
    MenuItem
} from '@mui/material';
import { FaSave, FaUserEdit, FaTasks, FaCalendarTimes } from 'react-icons/fa';
import { Developer } from '../types/developer.types';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface EditDeveloperDialogProps {
    open: boolean;
    developer: Developer | null;
    onClose: () => void;
    onUpdate: (developer: Developer) => void;
    projectRoles: Array<{
        id: number;
        name: string;
        isOwner?: boolean;
        isDefault?: boolean;
    }>;
}

const schema = yup.object({
    role: yup.string().required('Роль обязательна')
});

export const EditDeveloperDialog = ({
                                        open,
                                        developer,
                                        onClose,
                                        onUpdate,
                                        projectRoles
                                    }: EditDeveloperDialogProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { control, handleSubmit, reset, formState: { errors, isValid } } = useForm({
        resolver: yupResolver(schema),
        mode: 'onChange'
    });

    useEffect(() => {
        if (developer) {
            reset({
                role: developer.originalRole || developer.role
            });
        }
    }, [developer, reset]);

    const onSubmit = async (data: any) => {
        if (!developer) return;

        setIsSubmitting(true);

        try {
            const role = projectRoles.find(r => r.name === data.role);
            if (!role) {
                console.error('Роль не найдена:', data.role);
                return;
            }

            const updatedDeveloper: Developer = {
                ...developer,
                role: data.role,
                originalRole: data.role,
                roleId: Number(role.id)
            };

            onUpdate(updatedDeveloper);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!developer) return null;

    const isOwnerRole = projectRoles.some(role =>
        role.name === developer.originalRole && role.isOwner
    );

    return (
        <AnimatePresence>
            {open && (
                <Dialog
                    open={open}
                    onClose={handleClose}
                    PaperComponent={motion.div}
                    PaperProps={{
                        initial: { opacity: 0, scale: 0.95, y: 20 },
                        animate: { opacity: 1, scale: 1, y: 0 },
                        exit: { opacity: 0, scale: 0.95, y: 20 },
                        transition: { type: 'spring', damping: 25, stiffness: 300 },
                        sx: {
                            borderRadius: '20px',
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98))',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(139, 92, 246, 0.1)',
                            boxShadow: '0 20px 60px rgba(139, 92, 246, 0.15)',
                            minWidth: '500px',
                            maxWidth: '500px',
                            overflow: 'hidden'
                        }
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Box
                            sx={{
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                                padding: '24px 32px 20px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: -50,
                                    right: -50,
                                    width: 150,
                                    height: 150,
                                    borderRadius: '50%',
                                    background: 'rgba(255, 255, 255, 0.1)'
                                }}
                            />
                            <DialogTitle
                                sx={{
                                    fontWeight: 800,
                                    color: 'white',
                                    textAlign: 'left',
                                    padding: 0,
                                    marginBottom: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    fontSize: '1.5rem'
                                }}
                            >
                                <Box
                                    sx={{
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        borderRadius: '12px',
                                        padding: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <FaUserEdit style={{ fontSize: '24px' }} />
                                </Box>
                                Редактировать участника
                            </DialogTitle>
                            <Typography
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Обновите информацию о члене команды
                            </Typography>
                        </Box>

                        <DialogContent sx={{ padding: '32px' }}>
                            <Box
                                component="form"
                                onSubmit={handleSubmit(onSubmit)}
                                sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
                            >
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 600, mb: 1 }}>
                                            Имя участника
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '1.1rem' }}>
                                            {developer.name}
                                        </Typography>
                                    </Box>
                                </motion.div>

                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <Controller
                                        name="role"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControl fullWidth error={!!errors.role}>
                                                <InputLabel>Роль в проекте</InputLabel>
                                                <Select
                                                    {...field}
                                                    label="Роль в проекте"
                                                    disabled={isOwnerRole}
                                                    sx={{
                                                        borderRadius: '12px',
                                                        background: 'rgba(248, 250, 252, 0.8)',
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: 'rgba(139, 92, 246, 0.2)'
                                                        },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#8b5cf6'
                                                        }
                                                    }}
                                                >
                                                    {projectRoles
                                                        .filter(role => !role.isOwner)
                                                        .map((role) => (
                                                            <MenuItem key={role.id} value={role.name}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                    <Box sx={{
                                                                        width: 8,
                                                                        height: 8,
                                                                        borderRadius: '50%',
                                                                        background: role.isDefault ? '#10b981' : '#3b82f6'
                                                                    }} />
                                                                    {role.name}
                                                                </Box>
                                                            </MenuItem>
                                                        ))}
                                                </Select>
                                                {isOwnerRole && (
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: '#ef4444',
                                                            mt: 1,
                                                            display: 'block'
                                                        }}
                                                    >
                                                        Роль Owner нельзя изменить
                                                    </Typography>
                                                )}
                                            </FormControl>
                                        )}
                                    />
                                </motion.div>

                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <Box
                                        sx={{
                                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(167, 139, 250, 0.05))',
                                            borderRadius: '16px',
                                            padding: '20px',
                                            border: '1px solid rgba(139, 92, 246, 0.1)'
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                color: '#64748b',
                                                fontWeight: 600,
                                                marginBottom: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}
                                        >
                                            Статистика участника
                                        </Typography>
                                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                            <Box
                                                sx={{
                                                    background: 'white',
                                                    borderRadius: '12px',
                                                    padding: '16px',
                                                    border: '1px solid rgba(16, 185, 129, 0.1)',
                                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.05)'
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 1 }}>
                                                    <Box sx={{
                                                        background: 'rgba(16, 185, 129, 0.1)',
                                                        borderRadius: '10px',
                                                        padding: '6px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <FaTasks style={{ color: '#10b981', fontSize: '14px' }} />
                                                    </Box>
                                                    <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                                                        Выполнено
                                                    </Typography>
                                                </Box>
                                                <Typography sx={{ color: '#1e293b', fontWeight: 700, fontSize: '1.5rem' }}>
                                                    {developer.completedTasks}
                                                    <Typography component="span" sx={{ color: '#64748b', fontSize: '0.9rem', marginLeft: 0.5 }}>
                                                        задач
                                                    </Typography>
                                                </Typography>
                                            </Box>

                                            <Box
                                                sx={{
                                                    background: 'white',
                                                    borderRadius: '12px',
                                                    padding: '16px',
                                                    border: developer.overdueTasks > 0
                                                        ? '1px solid rgba(239, 68, 68, 0.1)'
                                                        : '1px solid rgba(16, 185, 129, 0.1)',
                                                    boxShadow: developer.overdueTasks > 0
                                                        ? '0 4px 12px rgba(239, 68, 68, 0.05)'
                                                        : '0 4px 12px rgba(16, 185, 129, 0.05)'
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 1 }}>
                                                    <Box sx={{
                                                        background: developer.overdueTasks > 0
                                                            ? 'rgba(239, 68, 68, 0.1)'
                                                            : 'rgba(16, 185, 129, 0.1)',
                                                        borderRadius: '10px',
                                                        padding: '6px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <FaCalendarTimes style={{
                                                            color: developer.overdueTasks > 0 ? '#ef4444' : '#10b981',
                                                            fontSize: '14px'
                                                        }} />
                                                    </Box>
                                                    <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                                                        Просрочено
                                                    </Typography>
                                                </Box>
                                                <Typography sx={{
                                                    color: developer.overdueTasks > 0 ? '#ef4444' : '#1e293b',
                                                    fontWeight: 700,
                                                    fontSize: '1.5rem'
                                                }}>
                                                    {developer.overdueTasks || 0}
                                                    <Typography component="span" sx={{
                                                        color: developer.overdueTasks > 0 ? '#ef4444' : '#64748b',
                                                        fontSize: '0.9rem',
                                                        marginLeft: 0.5
                                                    }}>
                                                        задач
                                                    </Typography>
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </motion.div>
                            </Box>
                        </DialogContent>

                        <DialogActions sx={{ padding: '24px 32px', gap: 2, borderTop: '1px solid rgba(0, 0, 0, 0.05)' }}>
                            <Button
                                onClick={handleClose}
                                variant="outlined"
                                disabled={isSubmitting}
                                sx={{
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    color: '#64748b',
                                    borderColor: 'rgba(100, 116, 139, 0.2)',
                                    padding: '10px 24px',
                                    '&:hover': {
                                        borderColor: '#8b5cf6',
                                        background: 'rgba(139, 92, 246, 0.04)',
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.1)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Отмена
                            </Button>
                            <Button
                                onClick={handleSubmit(onSubmit)}
                                variant="contained"
                                startIcon={<FaSave />}
                                disabled={!isValid || isSubmitting || isOwnerRole}
                                sx={{
                                    background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    padding: '10px 28px',
                                    boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 12px 24px rgba(139, 92, 246, 0.4)'
                                    },
                                    '&:disabled': {
                                        background: 'rgba(100, 116, 139, 0.1)',
                                        color: 'rgba(100, 116, 139, 0.3)',
                                        transform: 'none',
                                        boxShadow: 'none'
                                    },
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            style={{ marginLeft: '8px' }}
                                        >
                                            Сохранение...
                                        </motion.span>
                                    </>
                                ) : (
                                    'Сохранить изменения'
                                )}
                            </Button>
                        </DialogActions>
                    </motion.div>
                </Dialog>
            )}
        </AnimatePresence>
    );
};