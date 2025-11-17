import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Icon
} from '@mui/material';
import { FaExclamationTriangle, FaTrash } from 'react-icons/fa';

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
    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    padding: '8px',
                    background: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(20px)',
                    maxWidth: '450px',
                    width: '100%'
                }
            }}
        >
            <DialogContent>
                <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.1)',
                            margin: '0 auto 16px'
                        }}
                    >
                        <FaExclamationTriangle
                            style={{
                                color: '#ef4444',
                                fontSize: '28px'
                            }}
                        />
                    </Box>

                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            color: '#1e293b',
                            marginBottom: 1
                        }}
                    >
                        Удаление участника
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{
                            color: '#64748b',
                            lineHeight: 1.6,
                            marginBottom: 3
                        }}
                    >
                        Вы уверены, что хотите удалить <strong>{developerName}</strong> из проекта?
                        Это действие нельзя отменить.
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions sx={{ padding: '16px 24px', gap: 1 }}>
                <Button
                    onClick={onClose}
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
                    onClick={onConfirm}
                    variant="contained"
                    startIcon={<FaTrash />}
                    sx={{
                        background: 'linear-gradient(135deg, #ef4444, #f87171)',
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 600,
                        padding: '8px 24px',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                        }
                    }}
                >
                    Удалить
                </Button>
            </DialogActions>
        </Dialog>
    );
};