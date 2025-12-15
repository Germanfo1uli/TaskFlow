import { useState } from 'react';
import { Comment, Author } from '../types/dashboard.types';
import { api } from '@/app/auth/hooks/useTokenRefresh';
import toast from 'react-hot-toast';

interface ApiComment {
    id: number;
    text: string;
    creator: {
        id: number;
        username: string;
        tag: string;
        bio: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface UseCommentsReturn {
    comments: Comment[];
    isLoading: boolean;
    isSubmitting: boolean;
    commentToDelete: { id: number; authorName: string } | null;
    addComment: (content: string, currentUser: Author) => Promise<any>;
    requestDeleteComment: (commentId: number, authorName: string) => void;
    confirmDeleteComment: () => Promise<boolean>;
    cancelDeleteComment: () => void;
    fetchComments: () => Promise<Comment[]>;
    refreshComments: () => Promise<Comment[]>;
    isDeleting: boolean;
}

export const useComments = (issueId: number, onCommentDeleted?: () => void): UseCommentsReturn => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState<{
        id: number;
        authorName: string;
    } | null>(null);

    const transformApiComment = (comment: ApiComment): Comment => {
        return {
            id: comment.id,
            author: {
                name: comment.creator.username,
                avatar: null,
                role: 'Участник'
            },
            content: comment.text,
            createdAt: new Date(comment.createdAt).toLocaleString('ru-RU', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
        };
    };

    const fetchComments = async (): Promise<Comment[]> => {
        try {
            setIsLoading(true);
            const response = await api.get<ApiComment[]>(`/issues/${issueId}/comments`);
            const transformedComments = response.data.map(transformApiComment);
            setComments(transformedComments);
            return transformedComments;
        } catch (error) {
            console.error('Ошибка при загрузке комментариев:', error);
            toast.error('Не удалось загрузить комментарии');
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    const addComment = async (content: string, currentUser: Author): Promise<any> => {
        if (!content.trim()) return null;

        try {
            setIsSubmitting(true);

            const response = await api.post(`/issues/${issueId}/comments`, {
                message: content.trim()
            });

            const newComment = response.data;
            const transformedComment = transformApiComment(newComment);

            setComments(prev => [...prev, transformedComment]);

            toast.success('Комментарий добавлен');

            if (onCommentDeleted) {
                onCommentDeleted();
            }

            return newComment;
        } catch (error) {
            console.error('Ошибка при добавлении комментария:', error);
            toast.error('Не удалось добавить комментарий');
            return null;
        } finally {
            setIsSubmitting(false);
        }
    };

    const requestDeleteComment = (commentId: number, authorName: string): void => {
        setCommentToDelete({ id: commentId, authorName });
    };

    const confirmDeleteComment = async (): Promise<boolean> => {
        if (!commentToDelete) return false;

        try {
            setIsDeleting(true);

            setComments(prev => prev.filter(comment => comment.id !== commentToDelete.id));

            await api.delete(`/issues/${issueId}/comments/${commentToDelete.id}`);

            toast.success('Комментарий удален');

            if (onCommentDeleted) {
                onCommentDeleted();
            }

            return true;
        } catch (error) {
            console.error('Ошибка при удалении комментария:', error);
            toast.error('Не удалось удалить комментарий');
            return false;
        } finally {
            setIsDeleting(false);
            setCommentToDelete(null);
        }
    };

    const cancelDeleteComment = (): void => {
        setCommentToDelete(null);
    };

    const refreshComments = async (): Promise<Comment[]> => {
        return await fetchComments();
    };

    return {
        comments,
        isLoading,
        isSubmitting,
        commentToDelete,
        addComment,
        requestDeleteComment,
        confirmDeleteComment,
        cancelDeleteComment,
        fetchComments,
        refreshComments,
        isDeleting
    };
};