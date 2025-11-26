'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import VerticalNavbar from '../components/VerticalNavbar/VerticalNavbar'
import ControlPanel from '../components/ControlPanel/ControlPanel'
import BoardsContent from '../components/BoardsContent/BoardsContent'
import { DashboardContent } from '@/app/components/DashboardContent'
import { DevelopersPage } from '@/app/components/DevelopersContent'
import SettingsContent from '../components/SettingsContent/SettingsContent'
import styles from './MainPage.module.css'

type ActivePage = 'dashboard' | 'board' | 'developers' | 'settings'

const MainPage = () => {
    const [activePage, setActivePage] = useState<ActivePage>('board')
    const [isControlPanelOpen, setIsControlPanelOpen] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/welcome')
        }
    }, [router])

    const handlePageChange = (page: ActivePage) => {
        setActivePage(page)
    }

    const handleToggleControlPanel = () => {
        setIsControlPanelOpen(!isControlPanelOpen)
    }

    const renderContent = () => {
        switch (activePage) {
            case 'dashboard':
                return <DashboardContent />
            case 'board':
                return <BoardsContent />
            case 'developers':
                return <DevelopersPage />
            case 'settings':
                return <SettingsContent onBackClick={() => setActivePage('board')} />
            default:
                return <BoardsContent />
        }
    }

    return (
        <div className={styles.mainContainer}>
            <VerticalNavbar
                onToggleControlPanel={handleToggleControlPanel}
                isControlPanelOpen={isControlPanelOpen}
            />
            <ControlPanel
                activePage={activePage}
                onPageChange={handlePageChange}
                isOpen={isControlPanelOpen}
            />

            <div className={`${styles.mainContentWrapper} ${!isControlPanelOpen ? styles.panelCollapsed : ''}`}>
                {renderContent()}
            </div>
        </div>
    )
}

export default MainPage