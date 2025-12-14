import { z } from 'zod'

export const editCardSchema = z.object({
    title: z.string().min(1, 'Название задачи обязательно').max(200, 'Слишком длинное название'),
    description: z.string().max(2000, 'Описание слишком длинное').optional(),
    priority: z.enum(['low', 'medium', 'high']),
    authorId: z.string().optional(),
    tags: z.array(z.string()).max(10, 'Максимум 10 тегов'),
    selectedBoard: z.number().min(1, 'Выберите доску'),
})

export const addCardSchema = z.object({
    title: z.string().min(1, 'Название задачи обязательно').max(200, 'Слишком длинное название'),
    description: z.string().max(2000, 'Описание слишком длинное').optional(),
    type: z.enum(['TASK', 'BUG', 'EPIC', 'STORY']),
    priority: z.enum(['low', 'medium', 'high']),
    authorId: z.string().optional(),
    tags: z.array(z.string()).max(10, 'Максимум 10 тегов'),
    selectedBoard: z.number().min(1, 'Выберите доску'),
})

export type EditCardFormData = z.infer<typeof editCardSchema>
export type AddCardFormData = z.infer<typeof addCardSchema>