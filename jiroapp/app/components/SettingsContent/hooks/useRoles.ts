import { useState, useCallback } from 'react';
import { api } from '@/app/auth/hooks/useTokenRefresh';
import { Role } from '../types/roles';

export const useRoles = (projectId: string) => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRoles = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/projects/${projectId}/roles`);
            const rolesData = response.data.roles || [];

            const processedRoles = rolesData.map(role => ({
                ...role,
                isOwner: role.name === 'Owner'
            }));

            setRoles(processedRoles);
            return processedRoles;
        } catch (err) {
            setError('Не удалось загрузить роли проекта');
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    const createRole = useCallback(async (roleData: Omit<Role, 'id' | 'memberCount'>) => {
        try {
            setLoading(true);
            const response = await api.post(`/projects/${projectId}/roles`, {
                name: roleData.name,
                description: roleData.description || '',
                permissions: roleData.permissions,
                isDefault: roleData.isDefault || false
            });
            const newRole = {
                ...response.data,
                isOwner: false,
                memberCount: 0
            };
            setRoles(prev => [...prev, newRole]);
            return newRole;
        } catch (err) {
            setError('Не удалось создать роль');
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    const updateRole = useCallback(async (roleId: string, roleData: Partial<Role>) => {
        try {
            setLoading(true);
            const roleToUpdate = roles.find(r => r.id === roleId);

            if (roleToUpdate?.isOwner) {
                const { permissions, isOwner, memberCount, ...allowedData } = roleData;
                const response = await api.patch(`/projects/${projectId}/roles/${roleId}`, allowedData);
                const updatedRole = {
                    ...response.data,
                    isOwner: true,
                    permissions: roleToUpdate.permissions,
                    memberCount: roleToUpdate.memberCount
                };
                setRoles(prev => prev.map(role => role.id === roleId ? updatedRole : role));
                return updatedRole;
            } else {
                const response = await api.patch(`/projects/${projectId}/roles/${roleId}`, {
                    name: roleData.name,
                    description: roleData.description,
                    permissions: roleData.permissions
                });
                const updatedRole = {
                    ...response.data,
                    isOwner: false,
                    memberCount: roleToUpdate?.memberCount || 0
                };
                setRoles(prev => prev.map(role => role.id === roleId ? updatedRole : role));
                return updatedRole;
            }
        } catch (err) {
            setError('Не удалось обновить роль');
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [projectId, roles]);

    const deleteRole = useCallback(async (roleId: string) => {
        try {
            setLoading(true);
            const roleToDelete = roles.find(r => r.id === roleId);
            if (roleToDelete?.isOwner) {
                throw new Error('Нельзя удалить роль владельца');
            }
            await api.delete(`/projects/${projectId}/roles/${roleId}`);
            setRoles(prev => prev.filter(role => role.id !== roleId));
        } catch (err) {
            setError('Не удалось удалить роль');
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [projectId, roles]);

    return {
        roles,
        loading,
        error,
        fetchRoles,
        createRole,
        updateRole,
        deleteRole
    };
};