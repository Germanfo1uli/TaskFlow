import { useState, useEffect, useCallback } from 'react';
import { ProjectData, ProjectStats, ProjectActivity } from '../types/types';
import { api } from '@/app/auth/hooks/useTokenRefresh';

interface ApiProjectResponse {
    projectId: number;
    ownerId: number;
    name: string;
    description: string;
    createdAt: string;
    yourRole: string;
}

export const useProjectData = (projectId?: string) => {
    const [project, setProject] = useState<ProjectData | null>(null);
    const [stats, setStats] = useState<ProjectStats>({
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        members: 0,
        overdueTasks: 0
    });
    const [activities, setActivities] = useState<ProjectActivity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProjectData = useCallback(async (projectData: ProjectData) => {
        setIsLoading(true);
        try {
            const projectStats: ProjectStats = {
                totalTasks: projectData.tasks || 0,
                completedTasks: Math.floor((projectData.tasks || 0) * (projectData.progress || 0) / 100),
                pendingTasks: Math.floor((projectData.tasks || 0) * (100 - (projectData.progress || 0)) / 100),
                members: projectData.members || 1,
                overdueTasks: Math.floor((projectData.tasks || 0) * 0.1)
            };

            const mockActivities: ProjectActivity[] = [
                {
                    id: '1',
                    type: 'task_created',
                    user: { name: projectData.owner?.name || 'Вы' },
                    description: `Создан проект "${projectData.name}"`,
                    timestamp: 'Только что'
                }
            ];

            if (projectData.tasks && projectData.tasks > 0) {
                mockActivities.push({
                    id: '2',
                    type: 'task_created',
                    user: { name: projectData.owner?.name || 'Вы' },
                    description: 'Добавлены первые задачи',
                    timestamp: 'Только что'
                });
            }

            setProject(projectData);
            setStats(projectStats);
            setActivities(mockActivities);
        } catch (error) {
            console.error('Ошибка загрузки проекта:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchProjectFromApi = useCallback(async (id: string) => {
        setIsLoading(true);
        try {
            const response = await api.get<ApiProjectResponse>(`/api/projects/${id}`);
            const apiProject = response.data;

            const projectData: ProjectData = {
                id: apiProject.projectId.toString(),
                name: apiProject.name,
                description: apiProject.description,
                createdAt: apiProject.createdAt,
                members: 1,
                tasks: 0,
                progress: 0,
                tags: ['Новый проект'],
                owner: {
                    id: apiProject.ownerId.toString(),
                    name: 'Владелец'
                },
                yourRole: apiProject.yourRole
            };

            await fetchProjectData(projectData);
        } catch (error) {
            console.error('Ошибка загрузки проекта с API:', error);
        } finally {
            setIsLoading(false);
        }
    }, [fetchProjectData]);

    const refreshProject = useCallback(async () => {
        if (project) {
            await fetchProjectData(project);
        }
    }, [project, fetchProjectData]);

    useEffect(() => {
        if (projectId) {
            fetchProjectFromApi(projectId);
        }
    }, [projectId, fetchProjectFromApi]);

    return {
        project,
        stats,
        activities,
        isLoading,
        setProject: fetchProjectData,
        refreshProject
    };
};