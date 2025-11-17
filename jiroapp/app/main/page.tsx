'use client'

import { useState } from 'react'
import VerticalNavbar from '../components/VerticalNavbar/VerticalNavbar'
import ControlPanel from '../components/ControlPanel/ControlPanel'
import BoardsContent from '../components/BoardsContent/BoardsContent'
import Dashboard from '../components/DashboardContent/Dashboard'
import { DevelopersPage } from '../components/DevelopersContent/DevelopersPage'
import styles from './MainPage.module.css'

type ActivePage = 'dashboard' | 'board' | 'developers'

const MainPage = () => {
    const [activePage, setActivePage] = useState<ActivePage>('board')

    const handlePageChange = (page: ActivePage) => {
        setActivePage(page)
    }

    const renderContent = () => {
        switch (activePage) {
            case 'dashboard':
                return <Dashboard />
            case 'board':
                return <BoardsContent />
            case 'developers':
                return <DevelopersPage />
            default:
                return <BoardsContent />
        }
    }

    return (
        <div className={styles.mainContainer}>
            <VerticalNavbar />
            <ControlPanel
                activePage={activePage}
                onPageChange={handlePageChange}
            />

            <div className={styles.mainContentWrapper}>
                {renderContent()}
            </div>
        </div>
    )
}

export default MainPage