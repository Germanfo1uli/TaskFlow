import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Project } from '../../components/VerticalNavbar/CreateProject/types/types'
import { Role } from '../types/types'
import { api } from '../../auth/hooks/useTokenRefresh'

export const useAuthRedirect = () => {
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/welcome')
        }
    }, [router])
}

export const useUserRole = (activeProject: Project | null) => {
    const [userRole, setUserRole] = useState<Role | null>(null)
    const [isLoadingRole, setIsLoadingRole] = useState(false)

    useEffect(() => {
        const fetchUserRole = async () => {
            if (activeProject?.id) {
                setIsLoadingRole(true)
                try {
                    const response = await api.get(`/projects/${activeProject.id}/roles/me`)
                    setUserRole(response.data)
                } catch (error) {
                    console.error('Ошибка при получении роли:', error)
                } finally {
                    setIsLoadingRole(false)
                }
            } else {
                setUserRole(null)
            }
        }

        fetchUserRole()
    }, [activeProject])

    return { userRole, isLoadingRole }
}

export const usePageLoader = () => {
    const [loadedComponents, setLoadedComponents] = useState<Set<string>>(new Set(['board']))

    const loadComponent = (page: string) => {
        setLoadedComponents(prev => new Set([...prev, page]))
    }

    return { loadedComponents, loadComponent }
}