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
}

export interface NewDeveloper {
    name: string;
    role: DeveloperRole;
}