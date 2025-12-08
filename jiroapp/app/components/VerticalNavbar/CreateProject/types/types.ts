export interface CropArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface CreateProjectFormData {
    name: string;
    key: string; // Скрытое поле, генерируется автоматически
    description?: string;
    image?: File;
    crop?: CropArea;
}

export interface Project {
    id: string;
    name: string;
    key: string;
    description: string;
    image?: string | null;
    createdAt: Date;
    members: number;
    tasks: number;
    progress: number;
    tags: string[];
    owner: {
        id: string;
        name: string;
        avatar: string;
    };
}

export interface CreateProjectApiRequest {
    name: string;
    key: string;
}

export interface CreateProjectApiResponse {
    id: number;
    name: string;
    key: string;
}

export interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProjectCreated: (project: Project) => void;
}