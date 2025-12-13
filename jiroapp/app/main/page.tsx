'use client'

import { useState } from 'react'
import VerticalNavbar from '../components/VerticalNavbar/VerticalNavbar'
import ControlPanel from '../components/ControlPanel/ControlPanel'
import styles from './MainPage.module.css'
import { Project } from '../components/VerticalNavbar/CreateProject/types/types'
import { useAuthRedirect, useUserRole, usePageLoader } from './hooks/hooks'
import { ContentRenderer } from './ContentRenderer'
import { ActivePage } from './types/types'

const MainPage = () => {
    const [activePage, setActivePage] = useState<ActivePage>('board')
    const [isControlPanelOpen, setIsControlPanelOpen] = useState(false)
    const [activeProject, setActiveProject] = useState<Project | null>(null)

    const { loadComponent } = usePageLoader()
    const { userRole, isLoadingRole } = useUserRole(activeProject)
    useAuthRedirect()

    const handlePageChange = (page: ActivePage) => {
        loadComponent(page)
        setActivePage(page)

        if (page !== 'board' && page !== 'project') {
            setIsControlPanelOpen(true)
        }
    }

    const handleProjectSelect = (project: Project) => {
        if (activeProject?.id !== project.id) {
            setActiveProject(project)
            setActivePage('project')
            setIsControlPanelOpen(true)
        } else {
            setActivePage('project')
            setIsControlPanelOpen(true)
        }
    }

    const handleBackToDashboard = () => {
        setActiveProject(null)
        setActivePage('board')
        setIsControlPanelOpen(false)
    }

    const handleToggleControlPanel = () => {
        setIsControlPanelOpen(!isControlPanelOpen)
    }

    return (
        <div className={styles.mainContainer}>
            <VerticalNavbar
                onToggleControlPanel={handleToggleControlPanel}
                isControlPanelOpen={isControlPanelOpen}
                onProjectSelect={handleProjectSelect}
                activeProjectId={activeProject?.id || null}
            />
            <ControlPanel
                activePage={activePage}
                onPageChange={handlePageChange}
                isOpen={isControlPanelOpen}
                hasActiveProject={!!activeProject}
                onBackToProjects={handleBackToDashboard}
                showFullMenu={!!activeProject}
                userRole={userRole}
                isLoadingRole={isLoadingRole}
            />

            <div className={`${styles.mainContentWrapper} ${!isControlPanelOpen ? styles.panelCollapsed : ''}`}>
                <ContentRenderer
                    activePage={activePage}
                    activeProject={activeProject}
                    onBackToDashboard={handleBackToDashboard}
                />
            </div>
        </div>
    )
}

export default MainPage