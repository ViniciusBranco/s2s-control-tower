import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../types";
import { PROJECTS, PRIORITY_COLORS, PROJECT_COLORS } from "../types";
import { Trash2, Edit2, Calendar, Clock, AlertCircle, Bot, PawPrint, ShieldCheck, Monitor, Brain, Building2 } from "lucide-react";

interface TaskCardProps {
    task: Task;
    onDelete: (id: string) => void;
    onEdit: (task: Task) => void;
}

const PROJECT_ICONS: Record<string, React.ElementType> = {
    "tintas-marfim": Bot,
    "equihealth": PawPrint,
    "openpower-back": ShieldCheck,
    "openpower-front": Monitor,
    "vita-ai": Brain,
    "amae": Building2,
};

export function TaskCard({ task, onDelete, onEdit }: TaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: "Task",
            task,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const project = PROJECTS.find((p) => p.id === task.projectId);
    const projectColorClass = project ? PROJECT_COLORS[project.color as keyof typeof PROJECT_COLORS] : "bg-gray-100 text-gray-800 border-gray-200";
    const ProjectIcon = project ? PROJECT_ICONS[project.id] : null;

    const getTaskAgeStatus = (dateString: string) => {
        if (task.status === 'done') return { status: 'normal', days: 0 };

        const taskDate = new Date(dateString);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - taskDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 30) return { status: 'critical', days: diffDays };
        if (diffDays > 14) return { status: 'warning', days: diffDays };
        return { status: 'normal', days: diffDays };
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-30 bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-400 h-[150px] w-full cursor-grab"
            />
        );
    }

    const ageInfo = task.date ? getTaskAgeStatus(task.date) : { status: 'normal', days: 0 };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group cursor-grab active:cursor-grabbing"
        >
            <div className="flex justify-between items-start mb-2">
                <span className={`flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${projectColorClass}`}>
                    {ProjectIcon && <ProjectIcon size={12} strokeWidth={2.5} />}
                    {project?.name || "Unknown Project"}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent drag start
                            onEdit(task);
                        }}
                        className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600"
                    >
                        <Edit2 size={14} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(task.id);
                        }}
                        className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-red-600"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{task.title}</h3>

            {task.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{task.description}</p>
            )}

            <div className="flex justify-between items-center mt-3">
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${PRIORITY_COLORS[task.priority]}`}>
                        {task.priority.toUpperCase()}
                    </span>
                    {task.date && (
                        <div
                            className={`flex items-center gap-1 text-xs ${ageInfo.status === 'critical'
                                ? 'text-red-700 font-bold bg-red-50 px-2 py-1 rounded-md border border-red-100'
                                : ageInfo.status === 'warning'
                                    ? 'text-amber-600 font-medium'
                                    : 'text-gray-500'
                                }`}
                            title={
                                ageInfo.status === 'critical'
                                    ? `CRÍTICO: Tarefa aberta há ${ageInfo.days} dias`
                                    : ageInfo.status === 'warning'
                                        ? `Tarefa aberta há ${ageInfo.days} dias`
                                        : undefined
                            }
                        >
                            {ageInfo.status === 'critical' ? (
                                <AlertCircle size={12} />
                            ) : ageInfo.status === 'warning' ? (
                                <Clock size={12} />
                            ) : (
                                <Calendar size={12} />
                            )}
                            <span>{new Date(task.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center">
                    {task.assignee ? (
                        <img
                            src={task.assignee}
                            alt="Assignee"
                            className="w-6 h-6 rounded-full border border-gray-200 object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                        />
                    ) : null}
                    <div className={`w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 ${task.assignee ? 'hidden' : ''}`}>
                        <span className="text-[10px] font-medium text-gray-500">
                            U
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
