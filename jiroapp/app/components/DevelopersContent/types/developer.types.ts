export type DeveloperRole = 'leader' | 'executor' | 'assistant';

export interface Developer {
    id: number;
    name: string;
    avatar: string | null;
    username: string;
    role: DeveloperRole;
    completedTasks: number;
    isCurrentUser?: boolean;
}

export interface NewDeveloper {
    name: string;
    username: string;
    role: DeveloperRole;
}