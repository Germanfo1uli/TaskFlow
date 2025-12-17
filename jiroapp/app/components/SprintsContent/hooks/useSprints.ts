import { useState, useEffect, useCallback } from 'react';
import { Sprint, Backlog, Issue, IssueStatus, SprintStatus } from '../types/types';
import { api } from '@/app/auth/hooks/useTokenRefresh';
import toast from 'react-hot-toast';

interface ApiIssue {
    id: number;
    projectId: number;
    sprintId: number | null;
    title: string;
    description: string;
    status: string;
    type: string;
    priority: string;
    assigneeId: number | null;
    deadline: string | null;
    createdAt: string;
    updatedAt: string;
}

interface ApiSprint {
    id: number;
    projectId: number;
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
    status: string;
    issueCount: number;
    issues: ApiIssue[];
}

interface ApiResponse {
    projectId: number;
    sprints: ApiSprint[];
}

const transformApiIssueToIssue = (apiIssue: ApiIssue): Issue => ({
    id: apiIssue.id,
    title: apiIssue.title,
    description: apiIssue.description,
    status: apiIssue.status as IssueStatus,
    type: apiIssue.type,
    priority: apiIssue.priority,
    assigneeId: apiIssue.assigneeId,
    deadline: apiIssue.deadline,
});

const transformApiSprintToSprint = (apiSprint: ApiSprint): Sprint => ({
    id: apiSprint.id,
    projectId: apiSprint.id,
    name: apiSprint.name,
    goal: apiSprint.goal,
    startDate: apiSprint.startDate ? new Date(apiSprint.startDate) : null,
    endDate: apiSprint.endDate ? new Date(apiSprint.endDate) : null,
    issues: apiSprint.issues.map(transformApiIssueToIssue),
    status: apiSprint.status as SprintStatus
});

export const useSprints = (projectId: number | null) => {
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [backlog, setBacklog] = useState<Backlog>({ issues: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSprints = useCallback(async () => {
        if (!projectId) {
            setSprints([]);
            setBacklog({ issues: [] });
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get<ApiResponse>(`/sprints/projects/${projectId}`);
            const apiResponse: ApiResponse = response.data;

            let backlogIssues: Issue[] = [];
            const actualSprints: Sprint[] = [];

            apiResponse.sprints.forEach(apiSprint => {
                if (apiSprint.id === 0) {
                    backlogIssues = apiSprint.issues.map(transformApiIssueToIssue);
                } else {
                    actualSprints.push(transformApiSprintToSprint(apiSprint));
                }
            });
            
            setSprints(actualSprints);
            setBacklog({ issues: backlogIssues });

        } catch (err: any) {
            console.error('Ошибка при загрузке спринтов или бэклога:', err);
            setError(err.message || 'Не удалось загрузить данные.');
            toast.error('Не удалось загрузить спринты или бэклог.');
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchSprints();
    }, [fetchSprints]);

    const handleConfirmDelete = useCallback(async (sprintId: string | number) => {
        try {
            await api.delete(`/sprints/${sprintId}`);
            toast.success('Спринт успешно удален!');
            fetchSprints();
        } catch (error) {
            console.error('Ошибка при удалении спринта:', error);
            toast.error('Не удалось удалить спринт.');
        }
    }, [fetchSprints]);

    const handleRemoveIssueFromSprint = useCallback(async (sprintId: string | number, issueId: string | number) => {
        try {
            await api.delete(`/sprints/${sprintId}/issues/${issueId}`);
            toast.success('Задача успешно удалена из спринта!');
            fetchSprints();
        } catch (error) {
            console.error('Ошибка при удалении задачи из спринта:', error);
            toast.error('Не удалось удалить задачу из спринта.');
        }
    }, [fetchSprints]);

    const handleUpdateSprintStatus = useCallback(async (sprintId: string | number, newStatus: SprintStatus) => {
        try {
            await api.patch(`/sprints/${sprintId}/status`, {
                status: newStatus
            });
            toast.success('Статус спринта успешно обновлен!');
            fetchSprints();
        } catch (error) {
            console.error('Ошибка при обновлении статуса спринта:', error);
            toast.error('Не удалось обновить статус спринта.');
        }
    }, [fetchSprints]);

    const startSprintApiCall = useCallback(async (sprintId: string | number) => {
        try {
            await api.post(`/sprints/${sprintId}/start`);
            toast.success('Спринт успешно начат!');
            fetchSprints();
        } catch (error) {
            console.error('Ошибка при запуске спринта:', error);
            toast.error('Не удалось запустить спринт.');
        }
    }, [fetchSprints]);

    return {
        sprints,
        backlog,
        isLoading,
                error,
        fetchSprints,
        handleConfirmDelete,
        handleRemoveIssueFromSprint,
        handleUpdateSprintStatus,
        startSprintApiCall,
        setSprints,
        setBacklog
    };
};