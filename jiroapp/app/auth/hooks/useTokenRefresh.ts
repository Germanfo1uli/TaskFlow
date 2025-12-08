import { useEffect, useRef } from 'react';
import axios from 'axios';

type TokenUpdater = (accessToken: string, refreshToken: string) => void;
type LogoutHandler = () => void;

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                const response = await axios.post('http://localhost:8080/api/auth/refresh', { refreshToken });
                const { accessToken, refreshToken: newRefreshToken } = response.data;

                if (accessToken && newRefreshToken) {
                    localStorage.setItem('token', accessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);
                    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                    processQueue(null, accessToken);
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                processQueue(refreshError, null);
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export const useTokenRefresh = (
    updateTokens: TokenUpdater,
    handleLogout: LogoutHandler
) => {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const refreshToken = async (): Promise<boolean> => {
        const currentRefreshToken = localStorage.getItem('refreshToken');

        if (!currentRefreshToken) {
            console.log('Refresh token not found.');
            return false;
        }

        try {
            const response = await axios.post('http://localhost:8080/api/auth/refresh', {
                refreshToken: currentRefreshToken
            });

            if (response.data.accessToken && response.data.refreshToken) {
                updateTokens(response.data.accessToken, response.data.refreshToken);
                console.log('Token successfully refreshed.');
                return true;
            }
        } catch (error) {
            console.error('Failed to refresh token:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            handleLogout();
            return false;
        }

        return false;
    };

    useEffect(() => {
        const startTokenRefreshTimer = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }

            intervalRef.current = setInterval(async () => {
                const token = localStorage.getItem('token');
                if (!token) {
                    return;
                }

                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const expiryTime = payload.exp * 1000;
                    const now = Date.now();
                    const timeLeft = expiryTime - now;

                    console.log(`Token expires in ${Math.round(timeLeft / 1000)} seconds`);

                    if (timeLeft > 0 && timeLeft <= 10000) {
                        console.log(`Token expires soon (${Math.round(timeLeft / 1000)}s). Refreshing...`);
                        const success = await refreshToken();
                        if (success) {
                            console.log('Token refreshed successfully in background');
                        } else {
                            console.warn('Failed to refresh token in background');
                        }
                    } else if (timeLeft <= 0) {
                        console.log('Token has expired. Refreshing now...');
                        const success = await refreshToken();
                        if (!success) {
                            console.warn('Failed to refresh expired token');
                        }
                    }
                } catch (e) {
                    console.error('Failed to parse token payload:', e);
                    const success = await refreshToken();
                    if (!success) {
                        console.warn('Failed to refresh token after parse error');
                    }
                }
            }, 5000);
        };

        startTokenRefreshTimer();

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                console.log('Token refresh timer cleared.');
            }
        };
    }, [updateTokens, handleLogout]);

    return { refreshToken, api };
};

export { api };