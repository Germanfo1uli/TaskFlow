// profile.types.ts
export interface UserProfile {
    id: string;
    name: string;
    email: string;
    tag: string;
    avatar: string | null;
    bio: string;
    position: string;
    joinDate: string;
    completedTasks: number;
    activeProjects: number;
}

export interface ProfileFormData {
    name: string;
    email: string;
    bio: string;
}

export interface UpdateProfileRequest {
    username: string;
    bio: string;
}

export interface UpdateProfileResponse {
    name: string;
    tag: string;
    bio: string;
}

export interface ChangeEmailRequest {
    newEmail: string;
    password: string;
    refreshToken: string;
}

export interface ChangeEmailResponse {
    userId: number;
    changedAt: string;
    message: string;
    newEmail: string;
    pair: {
        accessToken: string;
        refreshToken: string;
    };
}