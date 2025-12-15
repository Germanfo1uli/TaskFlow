import { useState, useEffect } from 'react';
import { api } from '@/app/auth/hooks/useTokenRefresh';

interface AvatarCache {
    [userId: number]: string;
}

export const useAvatar = (userId: number | undefined) => {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [cache] = useState<AvatarCache>({});

    useEffect(() => {
        const fetchAvatar = async () => {
            if (!userId || cache[userId]) {
                if (cache[userId]) {
                    setAvatarUrl(cache[userId]);
                }
                return;
            }

            try {
                const response = await api.get(`/users/${userId}/avatar`, {
                    responseType: 'blob'
                });

                if (response.data) {
                    const blob = response.data;
                    const url = URL.createObjectURL(blob);
                    cache[userId] = url;
                    setAvatarUrl(url);
                }
            } catch (error) {
                console.error(`Error loading avatar for user ${userId}:`, error);
                setAvatarUrl(null);
            }
        };

        fetchAvatar();

        return () => {
            if (avatarUrl && avatarUrl.startsWith('blob:')) {
                URL.revokeObjectURL(avatarUrl);
            }
        };
    }, [userId]);

    return avatarUrl;
};