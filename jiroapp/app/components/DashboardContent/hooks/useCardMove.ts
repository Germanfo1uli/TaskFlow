import { useState, useEffect, useCallback } from 'react';
import { api } from '@/app/auth/hooks/useTokenRefresh';
import toast from 'react-hot-toast';

interface Permission {
    entity: string;
    action: string;
}

interface ProjectRole {
    id: number;
    name: string;
    isOwner: boolean;
    isDefault: boolean;
    permissions: Permission[];
}

export const useCardMove = (projectId: number | null) => {
    const [isOwner, setIsOwner] = useState(false);
    const [isLoading, setIsLoading] = useState(false);


    const fetchUserRole = useCallback(async () => {
        if (!projectId) {
            setIsOwner(false);
            return;
        }

        try {
            setIsLoading(true);
            const response = await api.get<ProjectRole>(`/projects/${projectId}/roles/me`);
            setIsOwner(response.data.isOwner);
        } catch (error) {
            console.error('Ошибка при получении роли пользователя:', error);
            setIsOwner(false);
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchUserRole();
    }, [fetchUserRole]);


    const moveCard = useCallback(async (issueId: number, targetStatus: string) => {
        if (!isOwner) {
            toast.error('Только владелец проекта может перемещать задачи');
            return false;
        }

        try {
            setIsLoading(true);
            await api.post(`/issues/${issueId}/status`, {
                targetStatus
            });
            toast.success('Задача успешно перемещена');
            return true;
        } catch (error) {
            console.error('Ошибка при перемещении задачи:', error);
            toast.error('Не удалось переместить задачу');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [isOwner]);

    return {
        isOwner,
        isLoading,
        moveCard,
        refreshRole: fetchUserRole
    };
};