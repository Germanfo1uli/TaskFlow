export interface ProjectMember {
    userId: number;
    username: string;
    role: string;
    roleId: number;
    tag?: string;
    bio?: string;
    createdAt?: string;
}

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

export interface RoleFilterOption {
    value: string;
    label: string;
    isOwner?: boolean;
    isDefault?: boolean;
}