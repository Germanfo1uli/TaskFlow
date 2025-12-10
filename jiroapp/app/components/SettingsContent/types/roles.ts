import {JSX} from "react";

export interface Permission {
    entity: string;
    action: string;
}

export interface Role {
    id: string;
    name: string;
    description?: string;
    permissions: Permission[];
    memberCount?: number;
    isDefault?: boolean;
    isOwner?: boolean;
}

export interface PermissionItem {
    key: string;
    label: string;
    description: string;
    icon: JSX.Element;
    category: string;
    entity: string;
    action: string;
}

export interface RolesSectionProps {
    projectId: string;
}