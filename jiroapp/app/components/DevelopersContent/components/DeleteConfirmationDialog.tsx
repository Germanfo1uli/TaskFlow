import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Alert
} from '@mui/material';
import { FaExclamationTriangle, FaTrash, FaUserSlash, FaInfoCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface DeleteConfirmationDialogProps {
    open: boolean;
    developerName: string;
    onClose: () => void;
    onConfirm: () => void;
}

export const DeleteConfirmationDialog = ({
                                             open,
                                             developerName,
                                             onClose,
                                             onConfirm
                                         }: DeleteConfirmationDialogProps) => {
    const handleConfirm = async () => {
        // Имитация API задержки
        await new Promise(resolve => setTimeout(resolve, 300));
        onConfirm();
    };

    return (
        <AnimatePresence>
            {open && (
                <Dialog
                    open={open}
                    onClose={onClose}
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
                            border: '1px solid rgba(239, 68, 68, 0.1)',
                            boxShadow: '0 20px 60px rgba(239, 68, 68, 0.15)',
                            maxWidth: '500px',
                            width: '100%',
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
                                background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
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
                                    <FaExclamationTriangle style={{ fontSize: '24px' }} />
                                </Box>
                                Удаление участника
                            </DialogTitle>
                            <Typography
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Подтвердите удаление участника из проекта
                            </Typography>
                        </Box>

                        <DialogContent sx={{ padding: '32px' }}>
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Box sx={{ textAlign: 'center', py: 2 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            width: 80,
                                            height: 80,
                                            borderRadius: '20px',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            margin: '0 auto 24px',
                                            border: '2px dashed rgba(239, 68, 68, 0.3)'
                                        }}
                                    >
                                        <FaUserSlash
                                            style={{
                                                color: '#ef4444',
                                                fontSize: '36px'
                                            }}
                                        />
                                    </Box>

                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 800,
                                            color: '#1e293b',
                                            marginBottom: 2,
                                            fontSize: '1.25rem'
                                        }}
                                    >
                                        Вы уверены в удалении?
                                    </Typography>

                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: '#64748b',
                                            lineHeight: 1.6,
                                            marginBottom: 3
                                        }}
                                    >
                                        Вы собираетесь удалить участника{' '}
                                        <Typography component="span" sx={{
                                            fontWeight: 800,
                                            color: '#ef4444',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            padding: '2px 8px',
                                            borderRadius: '6px',
                                            margin: '0 4px'
                                        }}>
                                            {developerName}
                                        </Typography>
                                        {' '}из проекта. Это действие нельзя отменить.
                                    </Typography>
                                </Box>

                                <Alert
                                    severity="warning"
                                    icon={<FaInfoCircle />}
                                    sx={{
                                        borderRadius: '12px',
                                        background: 'rgba(245, 158, 11, 0.05)',
                                        border: '1px solid rgba(245, 158, 11, 0.1)',
                                        marginBottom: 2
                                    }}
                                >
                                    <Typography variant="caption" sx={{ color: '#92400e', fontWeight: 600 }}>
                                        Внимание: Все задачи, назначенные этому участнику, будут переназначены.
                                    </Typography>
                                </Alert>

                                <Alert
                                    severity="info"
                                    sx={{
                                        borderRadius: '12px',
                                        background: 'rgba(59, 130, 246, 0.05)',
                                        border: '1px solid rgba(59, 130, 246, 0.1)'
                                    }}
                                >
                                    <Typography variant="caption" sx={{ color: '#1e40af', fontWeight: 600 }}>
                                        Совет: Рассмотрите возможность изменения роли вместо удаления.
                                    </Typography>
                                </Alert>
                            </motion.div>
                        </DialogContent>

                        <DialogActions sx={{
                            padding: '24px 32px',
                            gap: 2,
                            borderTop: '1px solid rgba(0, 0, 0, 0.05)',
                            justifyContent: 'space-between'
                        }}>
                            <Button
                                onClick={onClose}
                                variant="outlined"
                                sx={{
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    color: '#64748b',
                                    borderColor: 'rgba(100, 116, 139, 0.2)',
                                    padding: '10px 24px',
                                    flex: 1,
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
                                onClick={handleConfirm}
                                variant="contained"
                                startIcon={<FaTrash />}
                                sx={{
                                    background: 'linear-gradient(135deg, #ef4444, #f87171)',
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    padding: '10px 28px',
                                    flex: 1,
                                    boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 12px 24px rgba(239, 68, 68, 0.4)'
                                    },
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                Удалить участника
                            </Button>
                        </DialogActions>
                    </motion.div>
                </Dialog>
            )}
        </AnimatePresence>
    );
};