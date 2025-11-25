import { X, Archive, RotateCcw, Trash2, Calendar } from "lucide-react";
import { type Task, PROJECTS, PROJECT_COLORS } from "../types";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { User } from "firebase/auth";

interface ArchiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    tasks: Task[];
    user: User;
}

export function ArchiveModal({ isOpen, onClose, tasks, user }: ArchiveModalProps) {
    if (!isOpen) return null;

    const archivedTasks = tasks.filter(t => t.isArchived);
    const isAdmin = user.email === import.meta.env.VITE_ADMIN_EMAIL;

    // Group by Project
    const groupedTasks = archivedTasks.reduce((acc, task) => {
        if (!acc[task.projectId]) acc[task.projectId] = [];
        acc[task.projectId].push(task);
        return acc;
    }, {} as Record<string, Task[]>);

    // Sort tasks by date within groups
    Object.keys(groupedTasks).forEach(projectId => {
        groupedTasks[projectId].sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateA - dateB;
        });
    });

    const handleRestore = async (taskId: string) => {
        const taskRef = doc(db, "tasks", taskId);
        await updateDoc(taskRef, { isArchived: false });
    };

    const handleHardDelete = async (taskId: string) => {
        if (confirm("Tem certeza? Esta ação não pode ser desfeita.")) {
            await deleteDoc(doc(db, "tasks", taskId));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-gray-100 p-2 rounded-lg">
                            <Archive className="text-gray-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Arquivo</h2>
                            <p className="text-sm text-gray-500 mt-1">Tarefas arquivadas e histórico</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {archivedTasks.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <Archive size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Nenhuma tarefa arquivada.</p>
                        </div>
                    ) : (
                        Object.keys(groupedTasks).map(projectId => {
                            const project = PROJECTS.find(p => p.id === projectId);
                            const projectColor = project ? PROJECT_COLORS[project.color].split(' ')[0].replace('bg-', 'text-').replace('-100', '-600') : 'text-gray-600';

                            return (
                                <div key={projectId} className="space-y-3">
                                    <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${projectColor}`}>
                                        {project?.name || "Projeto Desconhecido"}
                                        <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                            {groupedTasks[projectId].length}
                                        </span>
                                    </h3>

                                    <div className="grid gap-3">
                                        {groupedTasks[projectId].map(task => (
                                            <div key={task.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                                                <div className="flex-1 min-w-0 mr-4">
                                                    <h4 className="font-medium text-gray-900 truncate">{task.title}</h4>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                        {task.date && (
                                                            <span className="flex items-center gap-1">
                                                                <Calendar size={12} />
                                                                {new Date(task.date).toLocaleDateString('pt-BR')}
                                                            </span>
                                                        )}
                                                        <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600 capitalize">
                                                            {task.status}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleRestore(task.id)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Restaurar para o quadro"
                                                    >
                                                        <RotateCcw size={18} />
                                                    </button>

                                                    {isAdmin && (
                                                        <button
                                                            onClick={() => handleHardDelete(task.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Excluir permanentemente"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
