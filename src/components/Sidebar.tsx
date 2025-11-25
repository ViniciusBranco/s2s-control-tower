import { useState } from "react";
import type { User } from "firebase/auth";
import { LogOut, Plus, ShieldAlert, HelpCircle, Archive, Download, Upload, Settings } from "lucide-react";
import { type Task } from "../types";
import { seedDatabase } from "../lib/seed";
import { exportToJSON, importFromJSON } from "../lib/data-management";
import { useProjects } from "../hooks/useProjects";
import { ProjectManagerModal } from "./ProjectManagerModal";
import { ProjectGuideModal } from "./ProjectGuideModal";
import { ArchiveModal } from "./ArchiveModal";
import s2sLogo from "../assets/s2slogo.png";

interface SidebarProps {
    user: User;
    tasks: Task[];
    onSignOut: () => void;
    onNewTask: () => void;
    selectedProjects: string[];
    onToggleProject: (id: string) => void;
}

export function Sidebar({ user, tasks, onSignOut, onNewTask, selectedProjects, onToggleProject }: SidebarProps) {
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [isArchiveOpen, setIsArchiveOpen] = useState(false);
    const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false);
    const [imageError, setImageError] = useState(false);

    const { projects } = useProjects();

    const calculateProgress = (projectId: string) => {
        const projectTasks = tasks.filter((t) => t.projectId === projectId && !t.isArchived);
        const total = projectTasks.length;
        if (total === 0) return 0;
        const done = projectTasks.filter((t) => t.status === "done").length;
        return Math.round((done / total) * 100);
    };

    const PROGRESS_COLORS: Record<string, string> = {
        slate: 'bg-slate-500',
        gray: 'bg-gray-500',
        zinc: 'bg-zinc-500',
        neutral: 'bg-neutral-500',
        stone: 'bg-stone-500',
        red: 'bg-red-500',
        orange: 'bg-orange-500',
        amber: 'bg-amber-500',
        yellow: 'bg-yellow-500',
        lime: 'bg-lime-500',
        green: 'bg-green-500',
        emerald: 'bg-emerald-500',
        teal: 'bg-teal-500',
        cyan: 'bg-cyan-500',
        sky: 'bg-sky-500',
        blue: 'bg-blue-500',
        indigo: 'bg-indigo-500',
        violet: 'bg-violet-500',
        purple: 'bg-purple-500',
        fuchsia: 'bg-fuchsia-500',
        pink: 'bg-pink-500',
        rose: 'bg-rose-500',
    };

    const getProgressColor = (color: string) => {
        return PROGRESS_COLORS[color] || 'bg-gray-500';
    };

    return (
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-full shrink-0">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 shrink-0">
                        <img
                            src={s2sLogo}
                            alt="Story2Scale Logo"
                            className="w-full h-full shadow-lg shadow-blue-900/20 rounded-xl object-cover"
                        />
                    </div>
                    <span className="font-bold text-gray-800 text-lg tracking-tight">
                        Story2Scale Kanban
                    </span>
                </div>

                <button
                    onClick={onNewTask}
                    className="w-full mt-6 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                    <Plus size={18} />
                    Nova Tarefa
                </button>

                {user && user.email === import.meta.env.VITE_ADMIN_EMAIL && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                        <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                            Admin Zone
                        </p>
                        <button
                            onClick={() => {
                                if (confirm("Isso vai apagar dados existentes e recriar os iniciais. Continuar?")) {
                                    seedDatabase();
                                }
                            }}
                            className="w-full py-2 px-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <ShieldAlert size={16} />
                            Seed DB
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={exportToJSON}
                                className="w-full py-2 px-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-medium text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                                title="Exportar Backup"
                            >
                                <Download size={14} />
                                Exportar
                            </button>
                            <label className="w-full py-2 px-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-medium text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer">
                                <Upload size={14} />
                                Importar
                                <input
                                    type="file"
                                    accept=".json"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            if (confirm("ATENÇÃO: Importar um backup irá SUBSTITUIR TODOS os dados atuais. Deseja continuar?")) {
                                                importFromJSON(file).then(() => {
                                                    alert("Importação concluída com sucesso!");
                                                    window.location.reload();
                                                }).catch((err) => {
                                                    alert("Erro na importação: " + err.message);
                                                });
                                            }
                                            // Reset input
                                            e.target.value = '';
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {/* Projects Progress */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Projetos
                    </h3>
                    <button
                        onClick={() => setIsProjectManagerOpen(true)}
                        className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                        title="Gerenciar Projetos"
                    >
                        <Settings size={16} />
                    </button>
                </div>

                <div className="space-y-4">
                    {projects.map((project) => {
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

            {/* Footer Area */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-3">
                {/* Archive Button */}
                <button
                    onClick={() => setIsArchiveOpen(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                >
                    <Archive size={18} />
                    <span>Arquivo</span>
                </button>

                {/* Help Button */}
                <button
                    onClick={() => setIsGuideOpen(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                >
                    <HelpCircle size={18} />
                    <span>Guia de Bordo</span>
                </button>

                {/* User Profile */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200/50">
                    <div className="flex items-center gap-3">
                        {user.photoURL && !imageError ? (
                            <img
                                src={user.photoURL}
                                alt={user.displayName || "User"}
                                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                                onError={() => setImageError(true)}
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

            <ProjectGuideModal
                isOpen={isGuideOpen}
                onClose={() => setIsGuideOpen(false)}
            />

            <ProjectManagerModal
                isOpen={isProjectManagerOpen}
                onClose={() => setIsProjectManagerOpen(false)}
                projects={projects}
            />

            <ArchiveModal
                isOpen={isArchiveOpen}
                onClose={() => setIsArchiveOpen(false)}
                tasks={tasks}
                user={user}
            />
        </div>
    );
}
