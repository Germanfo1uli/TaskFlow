import React, { lazy, Suspense } from 'react'
import { ActivePage } from './types/types'
import { Project } from '../components/VerticalNavbar/CreateProject/types/types'
import { LoadingFallback } from './LoadingFallback'

const DashboardContent = lazy(() => import('../components/DashboardContent/BoardsContent'))
const DevelopersPage = lazy(() => import('../components/DevelopersContent/DevelopersPage'))
const ReportsPage = lazy(() => import('../components/ReportsContent/ReportsPage'))
const SettingsContent = lazy(() => import('../components/SettingsContent/SettingsContent'))
const ProjectContent = lazy(() => import('../components/ProjectContent/ProjectContent'))
const BoardsContent = lazy(() => import('../components/BoardsContent/BoardsContent'))
const SprintComponent = lazy(() => import('../components/SprintsContent/SprintComponent'))

interface ContentRendererProps {
    activePage: ActivePage
    activeProject: Project | null
    onBackToDashboard: () => void
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({
                                                                    activePage,
                                                                    activeProject,
                                                                    onBackToDashboard
                                                                }) => {
    const renderComponent = () => {
        switch (activePage) {
            case 'dashboard':
                return <DashboardContent projectId={activeProject?.id || null} />
            case 'board':
                return <BoardsContent projectId={activeProject?.id || null} />
            case 'developers':
                return <DevelopersPage projectId={activeProject?.id || null} />
            case 'reports':
                return <ReportsPage projectId={activeProject?.id || null} />
            case 'settings':
                return activeProject ? (
                    <SettingsContent
                        project={activeProject}
                        onBackClick={() => {}}
                    />
                ) : null
            case 'project':
                return activeProject ? (
                    <ProjectContent
                        project={activeProject}
                        onBackToDashboard={onBackToDashboard}
                        key={activeProject.id}
                    />
                ) : null
            case 'sprints':
                return <SprintComponent projectId={activeProject?.id || null} />
            default:
                return <BoardsContent projectId={activeProject?.id || null} />
        }
    }

    return (
        <Suspense fallback={<LoadingFallback />}>
            {renderComponent()}
        </Suspense>
    )
}