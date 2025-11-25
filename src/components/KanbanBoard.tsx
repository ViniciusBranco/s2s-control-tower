import { useState, useEffect } from "react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragOverEvent,
    type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { collection, doc, updateDoc, addDoc, onSnapshot, query } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Task, Status } from "../types";
import { COLUMN_LABELS } from "../types";
import { Column } from "./Column";
import { TaskCard } from "./TaskCard";
import { NewTaskModal } from "./NewTaskModal";
import { Sidebar } from "./Sidebar";
import type { User } from "firebase/auth";
import { Loader2 } from "lucide-react";

interface KanbanBoardProps {
    user: User;
    onSignOut: () => void;
    selectedProjects: string[];
    onToggleProject: (id: string) => void;
}

import { PROJECTS } from "../types";

export function KanbanBoard({ user, onSignOut, selectedProjects, onToggleProject }: KanbanBoardProps) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, "tasks"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tasksData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Task[];
            setAllTasks(tasksData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching tasks:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredTasks = (selectedProjects.length === 0
        ? allTasks
        : allTasks.filter((t) => selectedProjects.includes(t.projectId))
    ).filter(t => !t.isArchived);

    const [localTasks, setLocalTasks] = useState<Task[]>(filteredTasks);

    useEffect(() => {
        setLocalTasks(filteredTasks);
    }, [allTasks, selectedProjects]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Enable click on buttons inside draggable
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-100">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    const sortTasks = (tasks: Task[]) => {
        return [...tasks].sort((a, b) => {
            const projectA = PROJECTS.find(p => p.id === a.projectId)?.name || "";
            const projectB = PROJECTS.find(p => p.id === b.projectId)?.name || "";

            const projectComparison = projectA.localeCompare(projectB);
            if (projectComparison !== 0) return projectComparison;

            // Secondary: Date Ascending
            // Missing date = newest (bottom), so use MAX_SAFE_INTEGER
            const dateA = a.date ? new Date(a.date).getTime() : Number.MAX_SAFE_INTEGER;
            const dateB = b.date ? new Date(b.date).getTime() : Number.MAX_SAFE_INTEGER;

            return dateA - dateB;
        });
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveTask = active.data.current?.type === "Task";
        const isOverTask = over.data.current?.type === "Task";

        if (!isActiveTask) return;

        // Dropping a Task over another Task
        if (isActiveTask && isOverTask) {
            // Logic handled in DragEnd for simplicity with Firestore
        }

        // Dropping a Task over a Column
        const isOverColumn = Object.keys(COLUMN_LABELS).includes(overId as string);
        if (isActiveTask && isOverColumn) {
            // Logic handled in DragEnd
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        // Clear activeId immediately to remove overlay, but we need it for logic
        // Actually, dnd-kit recommends keeping it until animation done, but for optimistic UI:
        setActiveId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeTask = localTasks.find((t) => t.id === activeId);
        if (!activeTask) return;

        let newStatus: Status = activeTask.status;

        if (Object.keys(COLUMN_LABELS).includes(overId)) {
            newStatus = overId as Status;
        } else {
            const overTask = localTasks.find((t) => t.id === overId);
            if (overTask) {
                newStatus = overTask.status;
            }
        }

        if (activeTask.status !== newStatus) {
            // Optimistic Update
            setLocalTasks((prev) =>
                prev.map((t) => (t.id === activeId ? { ...t, status: newStatus } : t))
            );

            // Update Firestore
            try {
                const taskRef = doc(db, "tasks", activeId);
                await updateDoc(taskRef, { status: newStatus });
            } catch (error) {
                console.error("Failed to update task status:", error);
                // Revert on error (optional, but good practice)
                setLocalTasks((prev) =>
                    prev.map((t) => (t.id === activeId ? { ...t, status: activeTask.status } : t))
                );
            }
        }
    };

    const handleCreateTask = async (taskData: Omit<Task, "id" | "createdAt" | "assignee" | "userId">) => {
        if (editingTask) {
            // Update existing
            const taskRef = doc(db, "tasks", editingTask.id);
            await updateDoc(taskRef, { ...taskData });
            setEditingTask(null);
        } else {
            // Create new
            await addDoc(collection(db, "tasks"), {
                ...taskData,
                createdAt: new Date().toISOString(),
                assignee: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || "User")}&background=random`,
                userId: user.uid,
            });
        }
    };

    const handleDeleteTask = async (id: string) => {
        if (confirm("Deseja arquivar esta tarefa? Você poderá restaurá-la no menu Arquivo.")) {
            const taskRef = doc(db, "tasks", id);
            await updateDoc(taskRef, { isArchived: true });
        }
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const columns: Status[] = ["backlog", "todo", "in-progress", "done"];

    return (
        <div className="h-screen flex flex-row bg-gray-100 text-gray-900 font-sans overflow-hidden">
            <Sidebar
                user={user}
                tasks={allTasks}
                onSignOut={onSignOut}
                onNewTask={() => {
                    setEditingTask(null);
                    setIsModalOpen(true);
                }}
                selectedProjects={selectedProjects}
                onToggleProject={onToggleProject}
            />

            {/* Board Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="flex gap-6 h-full min-w-max mx-auto">
                            {columns.map((colId) => (
                                <Column
                                    key={colId}
                                    id={colId}
                                    tasks={sortTasks(localTasks.filter((t) => t.status === colId))}
                                    onDeleteTask={handleDeleteTask}
                                    onEditTask={handleEditTask}
                                />
                            ))}
                        </div>

                        <DragOverlay>
                            {activeId ? (
                                <TaskCard
                                    task={allTasks.find((t) => t.id === activeId)!}
                                    onDelete={() => { }}
                                    onEdit={() => { }}
                                />
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>

            </div>

            <NewTaskModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingTask(null);
                }}
                onSubmit={handleCreateTask}
                editingTask={editingTask}
            />
        </div>
    );
}
