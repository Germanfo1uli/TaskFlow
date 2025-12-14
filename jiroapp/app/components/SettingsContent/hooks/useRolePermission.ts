import { useState, useCallback, useEffect } from 'react';
import { api } from '@/app/auth/hooks/useTokenRefresh';

export const useRolePermission = (projectId: string | null) => {
    const [hasLogsViewPermission, setHasLogsViewPermission] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRolePermission = useCallback(async () => {
        if (!projectId) {
            setHasLogsViewPermission(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await api.get(`/projects/${projectId}/roles/me`);
            const roleData = response.data;

            const hasPermission = roleData.permissions?.some((permission: any) =>
                permission.entity === 'LOGS' && permission.action === 'VIEW'
            ) || false;

            setHasLogsViewPermission(hasPermission);
        } catch (err) {
            setError('Не удалось загрузить права доступа');
            console.error(err);
            setHasLogsViewPermission(false);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchRolePermission();
    }, [fetchRolePermission]);

    const refreshPermission = async () => {
        await fetchRolePermission();
    };

    return {
        hasLogsViewPermission,
        loading,
        error,
        refreshPermission
    };
};