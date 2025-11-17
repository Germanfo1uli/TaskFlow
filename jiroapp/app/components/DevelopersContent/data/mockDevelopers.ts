import { Developer } from '../types/developer.types';

export const mockDevelopers: Developer[] = [
    {
        id: 1,
        name: 'Алексей Петров',
        avatar: null,
        username: 'alexey_p',
        role: 'leader',
        completedTasks: 24,
        isCurrentUser: true
    },
    {
        id: 2,
        name: 'Мария Иванова',
        avatar: null,
        username: 'maria_i',
        role: 'executor',
        completedTasks: 18
    },
    {
        id: 3,
        name: 'Иван Сидоров',
        avatar: null,
        username: 'ivan_s',
        role: 'executor',
        completedTasks: 15
    },
    {
        id: 4,
        name: 'Елена Козлова',
        avatar: null,
        username: 'elena_k',
        role: 'assistant',
        completedTasks: 8
    },
    {
        id: 5,
        name: 'Дмитрий Волков',
        avatar: null,
        username: 'dmitry_v',
        role: 'executor',
        completedTasks: 12
    }
];