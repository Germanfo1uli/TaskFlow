import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export const useAuthRedirect = () => {
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/welcome')
        }
    }, [router])

    return null
}