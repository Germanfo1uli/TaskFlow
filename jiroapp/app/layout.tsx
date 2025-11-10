import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'TASKFLOW - Управление задачами',
    description: 'Современный менеджер задач для профессионалов',
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="ru">
        <head>
            <link rel="icon" href="/logo1.svg" sizes="32x32" />
        </head>
        <body className={inter.className}>{children}</body>
        </html>
    )
}