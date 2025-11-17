import { Chip } from '@mui/material';
import { FaCrown, FaUserCheck, FaUserFriends } from 'react-icons/fa';
import { DeveloperRole } from '../types/developer.types';

interface DeveloperRoleChipProps {
    role: DeveloperRole;
}

export const DeveloperRoleChip = ({ role }: DeveloperRoleChipProps) => {
    const getRoleConfig = (role: DeveloperRole) => {
        switch (role) {
            case 'leader':
                return {
                    label: 'Руководитель',
                    icon: <FaCrown style={{ fontSize: '12px' }} />,
                    color: '#ef4444',
                    gradient: 'linear-gradient(135deg, #ef4444, #f87171)',
                    shadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                };
            case 'executor':
                return {
                    label: 'Исполнитель',
                    icon: <FaUserCheck style={{ fontSize: '12px' }} />,
                    color: '#3b82f6',
                    gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                    shadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                };
            case 'assistant':
                return {
                    label: 'Помощник',
                    icon: <FaUserFriends style={{ fontSize: '12px' }} />,
                    color: '#10b981',
                    gradient: 'linear-gradient(135deg, #10b981, #34d399)',
                    shadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                };
            default:
                return {
                    label: role,
                    icon: <FaUserFriends style={{ fontSize: '12px' }} />,
                    color: '#6b7280',
                    gradient: 'linear-gradient(135deg, #6b7280, #9ca3af)',
                    shadow: '0 4px 12px rgba(107, 114, 128, 0.3)'
                };
        }
    };

    const { label, icon, gradient, shadow } = getRoleConfig(role);

    return (
        <Chip
            icon={icon}
            label={label}
            sx={{
                background: gradient,
                color: 'white',
                fontWeight: 700,
                fontSize: '0.8rem',
                height: '32px',
                boxShadow: shadow,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '& .MuiChip-icon': {
                    color: 'white',
                    marginLeft: '8px'
                },
                '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: `${shadow}, 0 6px 20px rgba(0, 0, 0, 0.15)`
                },
                transition: 'all 0.3s ease'
            }}
        />
    );
};