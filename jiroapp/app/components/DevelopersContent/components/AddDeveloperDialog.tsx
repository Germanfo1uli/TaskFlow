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
    Box
} from '@mui/material';
import { FaPlus } from 'react-icons/fa';
import { NewDeveloper, DeveloperRole } from '../types/developer.types';

interface AddDeveloperDialogProps {
    open: boolean;
    onClose: () => void;
    onAdd: (developer: NewDeveloper) => void;
    newDeveloper: NewDeveloper;
    onNewDeveloperChange: (developer: NewDeveloper) => void;
}

export const AddDeveloperDialog = ({
                                       open,
                                       onClose,
                                       onAdd,
                                       newDeveloper,
                                       onNewDeveloperChange
                                   }: AddDeveloperDialogProps) => {
    const handleSubmit = () => {
        if (newDeveloper.name && newDeveloper.username) {
            onAdd(newDeveloper);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    padding: '8px',
                    background: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(20px)'
                }
            }}
        >
            <DialogTitle
                sx={{
                    fontWeight: 700,
                    color: '#1e293b',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}
            >
                Добавить участника
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <TextField
                        label="Полное имя"
                        value={newDeveloper.name}
                        onChange={(e) => onNewDeveloperChange({...newDeveloper, name: e.target.value})}
                        fullWidth
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                '&:hover fieldset': {
                                    borderColor: '#3b82f6'
                                }
                            }
                        }}
                    />
                    <TextField
                        label="Имя пользователя"
                        value={newDeveloper.username}
                        onChange={(e) => onNewDeveloperChange({...newDeveloper, username: e.target.value})}
                        fullWidth
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                '&:hover fieldset': {
                                    borderColor: '#3b82f6'
                                }
                            }
                        }}
                    />
                    <FormControl fullWidth>
                        <InputLabel>Роль</InputLabel>
                        <Select
                            value={newDeveloper.role}
                            label="Роль"
                            onChange={(e) => onNewDeveloperChange({...newDeveloper, role: e.target.value as DeveloperRole})}
                            sx={{
                                borderRadius: '12px'
                            }}
                        >
                            <MenuItem value="executor">Исполнитель</MenuItem>
                            <MenuItem value="assistant">Помощник</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions sx={{ padding: '20px 24px', gap: 1 }}>
                <Button
                    onClick={onClose}
                    sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 600,
                        color: '#64748b'
                    }}
                >
                    Отмена
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    startIcon={<FaPlus />}
                    disabled={!newDeveloper.name || !newDeveloper.username}
                    sx={{
                        background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                            background: 'linear-gradient(135deg, #2563eb, #3b82f6)'
                        }
                    }}
                >
                    Добавить
                </Button>
            </DialogActions>
        </Dialog>
    );
};