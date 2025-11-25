export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'backlog' | 'todo' | 'in-progress' | 'done';

export interface Project {
    id: string;
    name: string;
    color: string;
    icon: string;
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: Status;
    priority: Priority;
    projectId: string;
    assignee?: string;
    createdAt?: string;
    date?: string;
    isArchived?: boolean;
    notes?: string;
    userId: string;
}

export const PROJECTS: Project[] = [
    { id: "tintas-marfim", name: "Tintas Marfim", color: "orange", icon: "Bot" },
    { id: "openpower-back", name: "OpenPower Backend", color: "blue", icon: "ShieldCheck" },
    { id: "openpower-front", name: "OpenPower Frontend", color: "sky", icon: "Monitor" },
    { id: "equihealth", name: "EquiHealth", color: "green", icon: "PawPrint" },
    { id: "amae", name: "AMAE", color: "red", icon: "Building2" },
    { id: "vita-ai", name: "Vita.AI", color: "purple", icon: "Brain" },
];

export const COLUMN_LABELS: Record<Status, string> = {
    backlog: "Backlog",
    todo: "A Fazer",
    "in-progress": "Em Andamento",
    done: "Concluído",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
    low: "bg-slate-200 text-slate-700",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
};

export const PROJECT_COLORS: Record<string, string> = {
    orange: "bg-orange-100 text-orange-800 border-orange-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    sky: "bg-sky-100 text-sky-800 border-sky-200",
    green: "bg-green-100 text-green-800 border-green-200",
    red: "bg-red-100 text-red-800 border-red-200",
    purple: "bg-purple-100 text-purple-800 border-purple-200",
};
