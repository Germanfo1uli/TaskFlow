export interface ProjectData {
    id: string;
    name: string;
    description: string;
    image?: string;
    createdAt: string;
    members: number;
    tasks: number;
    progress: number;
    tags: string[];
    owner: {
        id: string;
        name: string;
        avatar?: string;
    };
    key?: string;
    yourRole?: string;
}

export interface ProjectStats {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    members: number;
    overdueTasks: number;
}

export interface ProjectActivity {
    id: string;
    type: 'task_created' | 'task_completed' | 'member_added' | 'comment_added';
    user: {
        name: string;
        avatar?: string;
    };
    description: string;
    timestamp: string;
}

export interface ProjectContentProps {
    project: ProjectData;
    onBackToDashboard: () => void;
}

export interface ProjectContextType {
    project: ProjectData | null;
    stats: ProjectStats;
    activities: ProjectActivity[];
    isLoading: boolean;
    setProject: (project: ProjectData) => void;
    refreshProject: () => Promise<void>;
}

export interface ProjectContentProps {
    project: ProjectData;
    onBackToDashboard: () => void;
}