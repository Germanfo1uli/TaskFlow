'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem('token')

        if (!token && pathname !== '/welcome' && pathname !== '/auth') {
            router.push('/welcome')
        }

        if (token && (pathname === '/welcome' || pathname === '/auth')) {
            router.push('/main')
        }
    }, [pathname, router])

    return (
        <html lang="ru">
        <head>
            <link rel="icon" href="/logo1.svg" sizes="32x32" />
        </head>
        <body className={inter.className}>{children}</body>
        </html>
    )
}