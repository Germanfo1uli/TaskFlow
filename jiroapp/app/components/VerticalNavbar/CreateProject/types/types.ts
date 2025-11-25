export interface Project {
    id: string;
    name: string;
    description: string;
    image: string | null;
    createdAt: Date;
}

export interface CreateProjectFormData {
    name: string;
    description: string;
    image: File | null;
    crop?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

export interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProjectCreated: (project: Project) => void;
}

export interface CropArea {
    x: number;
    y: number;
    width: number;
    height: number;
}