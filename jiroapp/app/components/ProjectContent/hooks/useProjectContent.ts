import { useState, useEffect, useCallback } from 'react';
import { ProjectData, RoleResponse, ApiProjectResponse } from './types/types';
import { api } from '@/app/auth/hooks/useTokenRefresh';

export const useProjectContent = (initialProject: ProjectData) => {
    const [project, setProject] = useState(initialProject);
    const [isLoading, setIsLoading] = useState(false);
    const [userRole, setUserRole] = useState<RoleResponse | null>(null);
    const [isLoadingRole, setIsLoadingRole] = useState(false);

    const fetchProjectData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get<ApiProjectResponse>(`/projects/${initialProject.id}`);
            const apiProject = response.data;
            const updatedProject: ProjectData = {
                ...initialProject,
                name: apiProject.name,
                description: apiProject.description,
                createdAt: apiProject.createdAt,
                yourRole: apiProject.yourRole
            };
            setProject(updatedProject);
        } catch (error) {
            console.error('Ошибка загрузки проекта:', error);
        } finally {
            setIsLoading(false);
        }
    }, [initialProject]);

    const fetchUserRole = useCallback(async () => {
        if (initialProject?.id) {
            setIsLoadingRole(true);
            try {
                const response = await api.get<RoleResponse>(`/projects/${initialProject.id}/roles/me`);
                setUserRole(response.data);
            } catch (error) {
                console.error('Ошибка при получении роли:', error);
            } finally {
                setIsLoadingRole(false);
            }
        }
    }, [initialProject]);

    useEffect(() => {
        if (initialProject?.id) {
            fetchProjectData();
            fetchUserRole();
        }
    }, [initialProject, fetchProjectData, fetchUserRole]);

    return {
        project,
        setProject,
        isLoading,
        userRole,
        isLoadingRole
    };
};