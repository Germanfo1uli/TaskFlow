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

export interface ProjectMember {
    userId: number;
    username: string;
    tag: string;
    bio: string;
    roleId: number;
    role: string;
}

export interface ProjectMembersResponse {
    projectId: number;
    members: ProjectMember[];
}

export interface ProjectRolesResponse {
    projectId: number;
    roles: ProjectRole[];
}
export interface UpdateUserRoleRequest {
    userId: number;
    roleId: number;
}