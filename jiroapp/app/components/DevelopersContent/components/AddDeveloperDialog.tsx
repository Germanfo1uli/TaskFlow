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
    Typography,
    Alert
} from '@mui/material';
import { FaPlus, FaUserPlus, FaCrown, FaUserCheck, FaUserFriends } from 'react-icons/fa';
import { NewDeveloper, DeveloperRole } from '../types/developer.types';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface AddDeveloperDialogProps {
    open: boolean;
    onClose: () => void;
    onAdd: (developer: NewDeveloper) => void;
    newDeveloper: NewDeveloper;
    onNewDeveloperChange: (developer: NewDeveloper) => void;
}

const schema = yup.object({
    name: yup.string()
        .required('Имя обязательно для заполнения')
        .min(3, 'Минимум 3 символа')
        .max(50, 'Максимум 50 символов'),
    role: yup.string()
        .oneOf(['executor', 'assistant', 'leader'])
        .required('Выберите роль')
});

export const AddDeveloperDialog = ({
                                       open,
                                       onClose,
                                       onAdd,
                                       newDeveloper,
                                       onNewDeveloperChange
                                   }: AddDeveloperDialogProps) => {
    const { control, handleSubmit, reset, formState: { errors, isValid, isSubmitting } } = useForm({
        resolver: yupResolver(schema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            role: 'executor'
        }
    });

    const onSubmit = async (data: NewDeveloper) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500)); // Имитация API
            onAdd(data);
            reset();
            onClose();
        } catch (error) {
            console.error('Error adding developer:', error);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <AnimatePresence>
            {open && (
                <Dialog
                    open={open}
                    onClose={handleClose}
                    PaperComponent={motion.div}
                    PaperProps={{
                        initial: { opacity: 0, scale: 0.9, y: 20 },
                        animate: { opacity: 1, scale: 1, y: 0 },
                        exit: { opacity: 0, scale: 0.9, y: 20 },
                        transition: { type: 'spring', damping: 25, stiffness: 300 }
                    }}
                    PaperProps={{
                        sx: {
                            borderRadius: '20px',
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98))',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(59, 130, 246, 0.1)',
                            boxShadow: '0 20px 60px rgba(59, 130, 246, 0.15)',
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
                                background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
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
                                    <FaUserPlus style={{ fontSize: '24px' }} />
                                </Box>
                                Добавить участника
                            </DialogTitle>
                            <Typography
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Добавьте нового члена команды в проект
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
                                    <Controller
                                        name="name"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Имя и фамилия"
                                                placeholder="Иван Иванов"
                                                fullWidth
                                                autoFocus
                                                error={!!errors.name}
                                                helperText={errors.name?.message}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '12px',
                                                        background: 'rgba(248, 250, 252, 0.8)',
                                                        '&:hover fieldset': {
                                                            borderColor: '#3b82f6',
                                                            borderWidth: '2px'
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: '#3b82f6',
                                                            borderWidth: '2px'
                                                        }
                                                    },
                                                    '& .MuiInputLabel-root': {
                                                        fontWeight: 600
                                                    }
                                                }}
                                            />
                                        )}
                                    />
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
                                                    sx={{
                                                        borderRadius: '12px',
                                                        background: 'rgba(248, 250, 252, 0.8)',
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: 'rgba(59, 130, 246, 0.2)'
                                                        },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#3b82f6'
                                                        }
                                                    }}
                                                >
                                                    <MenuItem value="executor">
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Box sx={{
                                                                background: 'rgba(59, 130, 246, 0.1)',
                                                                borderRadius: '8px',
                                                                padding: '6px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}>
                                                                <FaUserCheck style={{ color: '#3b82f6', fontSize: '14px' }} />
                                                            </Box>
                                                            <Box>
                                                                <Typography sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                                    Разработчик
                                                                </Typography>
                                                                <Typography sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                                                                    Основной исполнитель задач
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </MenuItem>
                                                    <MenuItem value="assistant">
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Box sx={{
                                                                background: 'rgba(16, 185, 129, 0.1)',
                                                                borderRadius: '8px',
                                                                padding: '6px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}>
                                                                <FaUserFriends style={{ color: '#10b981', fontSize: '14px' }} />
                                                            </Box>
                                                            <Box>
                                                                <Typography sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                                    Помощник разработчика
                                                                </Typography>
                                                                <Typography sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                                                                    Вспомогательная роль
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </MenuItem>
                                                    <MenuItem value="leader" disabled>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Box sx={{
                                                                background: 'rgba(239, 68, 68, 0.1)',
                                                                borderRadius: '8px',
                                                                padding: '6px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}>
                                                                <FaCrown style={{ color: '#ef4444', fontSize: '14px' }} />
                                                            </Box>
                                                            <Box>
                                                                <Typography sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                                    Руководитель
                                                                </Typography>
                                                                <Typography sx={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600 }}>
                                                                    Только для существующих участников
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </MenuItem>
                                                </Select>
                                                {errors.role && (
                                                    <Typography sx={{ color: '#ef4444', fontSize: '0.75rem', mt: 0.5 }}>
                                                        {errors.role.message}
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
                                    <Alert
                                        severity="info"
                                        sx={{
                                            borderRadius: '12px',
                                            background: 'rgba(59, 130, 246, 0.05)',
                                            border: '1px solid rgba(59, 130, 246, 0.1)',
                                            '& .MuiAlert-icon': {
                                                color: '#3b82f6'
                                            }
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                            Что происходит дальше?
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                                            Новый участник получит доступ к проектам и будет автоматически добавлен в систему.
                                            Вы сможете назначить ему задачи после добавления.
                                        </Typography>
                                    </Alert>
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
                                        borderColor: '#3b82f6',
                                        background: 'rgba(59, 130, 246, 0.04)',
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Отмена
                            </Button>
                            <Button
                                onClick={handleSubmit(onSubmit)}
                                variant="contained"
                                startIcon={<FaPlus />}
                                disabled={!isValid || isSubmitting}
                                sx={{
                                    background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    padding: '10px 28px',
                                    boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 12px 24px rgba(59, 130, 246, 0.4)'
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
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        Добавление...
                                    </motion.span>
                                ) : (
                                    'Добавить участника'
                                )}
                            </Button>
                        </DialogActions>
                    </motion.div>
                </Dialog>
            )}
        </AnimatePresence>
    );
};