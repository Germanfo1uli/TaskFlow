export interface DevelopersPageProps {
    projectId: string | null;
}

export interface RoleFilterOption {
    value: string;
    label: string;
    isOwner?: boolean;
    isDefault?: boolean;
}

export interface SnackbarState {
    isOpen: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
}

export interface DeleteConfirmationState {
    isOpen: boolean;
    developerId: number | null;
    developerName: string;
}