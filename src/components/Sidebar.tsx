import type { User } from "firebase/auth";
import { LogOut, LayoutGrid, Plus, ShieldAlert } from "lucide-react";
import { type Task, PROJECTS } from "../types";
import { seedDatabase } from "../lib/seed";

interface SidebarProps {
    user: User;
    tasks: Task[];
    onSignOut: () => void;
    onNewTask: () => void;
    selectedProjects: string[];
    onToggleProject: (id: string) => void;
}

export function Sidebar({ user, tasks, onSignOut, onNewTask, selectedProjects, onToggleProject }: SidebarProps) {
    const calculateProgress = (projectId: string) => {
        const projectTasks = tasks.filter((t) => t.projectId === projectId);
        const total = projectTasks.length;
        if (total === 0) return 0;
        const done = projectTasks.filter((t) => t.status === "done").length;
        return Math.round((done / total) * 100);
    };

    const getProgressColor = (color: string) => {
        switch (color) {
            case "orange": return "bg-orange-500";
            case "blue": return "bg-blue-500";
            case "sky": return "bg-sky-500";
            case "green": return "bg-green-500";
            case "red": return "bg-red-500";
            case "purple": return "bg-purple-500";
            default: return "bg-gray-500";
        }
    };

    return (
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-full shrink-0">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-1">
                    <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-600/20">
                        <LayoutGrid className="text-white" size={20} />
                    </div>
                    <span className="font-bold text-gray-800 text-lg tracking-tight">
                        Meus Projetos
                    </span>
                </div>
                <p className="text-xs text-gray-500 font-medium pl-1 mb-6">
                    Visualização Unificada
                </p>

                <button
                    onClick={onNewTask}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                    <Plus size={18} />
                    Nova Tarefa
                </button>

                {user && user.email === import.meta.env.VITE_ADMIN_EMAIL && (
                    <button
                        onClick={() => {
                            if (confirm("Isso vai apagar dados existentes e recriar os iniciais. Continuar?")) {
                                seedDatabase();
                            }
                        }}
                        className="w-full mt-3 py-2 px-4 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <ShieldAlert size={18} />
                        Seed Database
                    </button>
                )}
            </div>

            {/* Projects Progress */}
            <div className="flex-1 overflow-y-auto p-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">
                    Progresso Geral
                </h3>

                <div className="space-y-4">
                    {PROJECTS.map((project) => {
                        const progress = calculateProgress(project.id);
                        const isSelected = selectedProjects.includes(project.id);

                        return (
                            <div
                                key={project.id}
                                onClick={() => onToggleProject(project.id)}
                                className={`
                                    cursor-pointer p-3 rounded-xl transition-all duration-200 border
                                    ${isSelected
                                        ? "bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-200"
                                        : "bg-transparent border-transparent hover:bg-gray-50 hover:border-gray-100"
                                    }
                                `}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`text-sm font-medium ${isSelected ? "text-blue-800" : "text-gray-700"}`}>
                                        {project.name}
                                    </span>
                                    <span className="text-xs font-semibold text-gray-500">
                                        {progress}%
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${getProgressColor(project.color)}`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* User Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {user.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt={user.displayName || "User"}
                                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">
                                {user.displayName?.[0] || "U"}
                            </div>
                        )}
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900 leading-tight">
                                {user.displayName || "Usuário"}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-medium text-green-600">Online</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onSignOut}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer"
                        title="Sair"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
