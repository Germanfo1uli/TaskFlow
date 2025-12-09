import { useState, useEffect, useCallback } from 'react';
import { api } from '@/app/auth/hooks/useTokenRefresh';
import { Project } from '../types/types';

export interface ProjectData {
    id: number;
    name: string;
    description: string;
    yourRole: string;
    memberCount: number;
}

export const useProjectData = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProjectAvatar = useCallback(async (projectId: string): Promise<string | null> => {
        try {
            const response = await api.get(`/projects/${projectId}/avatar`, {
                responseType: 'blob'
            });

            if (response.data && response.data.size > 0) {
                const imageUrl = URL.createObjectURL(response.data);
                return imageUrl;
            }
            return null;
        } catch (error) {
            console.log(`Аватар для проекта ${projectId} не найден`);
            return null;
        }
    }, []);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get('/projects/me');
            const projectsData: ProjectData[] = response.data;

            const projectsWithAvatars = await Promise.all(
                projectsData.map(async (project) => {
                    const avatarUrl = await fetchProjectAvatar(project.id.toString());

                    const projectKey = project.name
                        .toUpperCase()
                        .split(/\s+/)
                        .map(word => word.charAt(0))
                        .join('')
                        .replace(/[^A-Z0-9]/g, '')
                        .slice(0, 10) || 'PRJ';

                    return {
                        id: project.id.toString(),
                        name: project.name,
                        key: projectKey,
                        description: project.description,
                        image: avatarUrl,
                        createdAt: new Date(),
                        members: project.memberCount,
                        tasks: 0,
                        progress: 0,
                        tags: [],
                        owner: {
                            id: 'owner-id',
                            name: 'Владелец',
                            avatar: 'https://ui-avatars.com/api/?name=Владелец&background=3d6bb3&color=fff'
                        }
                    };
                })
            );

            setProjects(projectsWithAvatars);
        } catch (err) {
            console.error('Ошибка при загрузке проектов:', err);
            setError('Не удалось загрузить проекты');
        } finally {
            setLoading(false);
        }
    }, [fetchProjectAvatar]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const addProject = useCallback((project: Project) => {
        setProjects(prev => [project, ...prev]);
    }, []);

    const updateProjectAvatar = useCallback(async (projectId: string) => {
        try {
            const avatarUrl = await fetchProjectAvatar(projectId);

            if (avatarUrl) {
                setProjects(prev => prev.map(project =>
                    project.id === projectId
                        ? { ...project, image: avatarUrl }
                        : project
                ));
            }
        } catch (error) {
            console.error('Ошибка при обновлении аватара проекта:', error);
        }
    }, [fetchProjectAvatar]);

    return {
        projects,
        loading,
        error,
        refetch: fetchProjects,
        addProject,
        updateProjectAvatar
    };
};