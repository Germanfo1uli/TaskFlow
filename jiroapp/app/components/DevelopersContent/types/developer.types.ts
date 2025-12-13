export type DeveloperRole = 'leader' | 'executor' | 'assistant';

export interface Developer {
    id: number;
    name: string;
    avatar: string | null;
    role: DeveloperRole;
    completedTasks: number;
    overdueTasks: number;
    projects: string[];
    isCurrentUser?: boolean;
    tag?: string;
    bio?: string;
    createdAt?: string;
    roleId?: number;
    originalRole?: string;
}

export interface NewDeveloper {
    name: string;
    role: DeveloperRole;
}
export interface DevelopersPageProps {
    projectId: string | null;
}

export interface ProjectRole {
    id: number;
    name: string;
    description?: string;
    permissions: Array<{
        entity: string;
        action: string;
    }>;
    memberCount?: number;
    isDefault?: boolean;
    isOwner?: boolean;
}