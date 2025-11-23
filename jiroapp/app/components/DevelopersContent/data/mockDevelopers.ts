import { Developer } from '../types/developer.types';

export const mockDevelopers: Developer[] = [
    {
        id: 1,
        name: 'Алексей Петров',
        avatar: null,
        role: 'leader',
        completedTasks: 24,
        overdueTasks: 2,
        projects: ['TASKFLOW PRO', 'Мобильное приложение', 'API Gateway'],
        isCurrentUser: true
    },
    {
        id: 2,
        name: 'Мария Иванова',
        avatar: null,
        role: 'executor',
        completedTasks: 18,
        overdueTasks: 1,
        projects: ['TASKFLOW PRO', 'Дизайн система']
    },
    {
        id: 3,
        name: 'Иван Сидоров',
        avatar: null,
        role: 'executor',
        completedTasks: 15,
        overdueTasks: 0,
        projects: ['TASKFLOW PRO', 'База данных', 'Бэкенд API']
    },
    {
        id: 4,
        name: 'Елена Козлова',
        avatar: null,
        role: 'assistant',
        completedTasks: 8,
        overdueTasks: 3,
        projects: ['TASKFLOW PRO', 'Тестирование']
    },
    {
        id: 5,
        name: 'Дмитрий Волков',
        avatar: null,
        role: 'executor',
        completedTasks: 12,
        overdueTasks: 0,
        projects: ['Мобильное приложение', 'Frontend']
    }
];