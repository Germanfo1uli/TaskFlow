export enum IssueStatus {
  TO_DO = 'TO_DO',
  SELECTED_FOR_DEVELOPMENT = 'SELECTED_FOR_DEVELOPMENT',
  IN_PROGRESS = 'IN_PROGRESS',
  CODE_REVIEW = 'CODE_REVIEW',
  QA = 'QA',
  STAGING = 'STAGING',
  DONE = 'DONE'
}

export enum SprintStatus {
  PLANNED = 'Planned',
  ACTIVE = 'Active',
  COMPLETED = 'Completed',
}

export enum Tasks {
    TASK = 'TASK',
    BUG = 'BUG',
    STORY = 'STORY',
    EPIC = 'EPIC',
    SUB_TASK = 'SUB_TASK'
}

export enum Priority {
    DEFERRED = 'DEFERRED',
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    MAJOR = 'MAJOR',
    CRITICAL = 'CRITICAL'
}

export interface Issue {
    id: string | number;
    assigneeId: string | number | null;
    title: string;
    status: IssueStatus;
    type: Tasks;
    priority: Priority;
    completedAt: Date | null;
}

export interface Sprint {
    id: string | number;
    projectId: string | number;
    name: string;
    goal: string | null;
    startDate: Date | null;
    endDate: Date | null;
    issues: Issue[];
    status: SprintStatus;
}

export interface Backlog {
    issues: Issue[];
}
