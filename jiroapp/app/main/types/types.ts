export type ActivePage = 'dashboard' | 'board' | 'developers' | 'settings' | 'reports' | 'project' | 'sprints'

export interface Role {
    id: number;
    name: string;
    isOwner: boolean;
    isDefault: boolean;
    permissions: Array<{
        entity: string;
        action: string;
    }>;
}