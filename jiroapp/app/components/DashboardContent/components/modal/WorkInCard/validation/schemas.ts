import { z } from 'zod';

export const addCardSchema = z.object({
    title: z.string().min(1, 'Название обязательно').max(100, 'Слишком длинное название'),
    description: z.string().max(1000, 'Описание слишком длинное').optional(),
    type: z.string(),
    priority: z.enum(['low', 'medium', 'high']),
    assigneeId: z.string().optional().default(''),
    tags: z.array(z.string()).max(10, 'Максимум 10 тегов'),
    selectedBoard: z.number(),
});

export const editCardSchema = z.object({
    title: z.string().min(1, 'Название обязательно').max(100, 'Слишком длинное название'),
    description: z.string().max(1000, 'Описание слишком длинное').optional(),
    priority: z.enum(['low', 'medium', 'high']),
    assigneeId: z.string().optional().default(''),
    tags: z.array(z.string()).max(10, 'Максимум 10 тегов'),
    selectedBoard: z.number(),
});

export type AddCardFormData = z.infer<typeof addCardSchema>;
export type EditCardFormData = z.infer<typeof editCardSchema>;