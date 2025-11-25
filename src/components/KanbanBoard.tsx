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
import { collection, onSnapshot, query, doc, updateDoc, deleteDoc, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { seedDatabase } from "../lib/seed";
import { Database } from "lucide-react";
import type { Task, Status } from "../types";
import { COLUMN_LABELS } from "../types";
import { Column } from "./Column";
import { TaskCard } from "./TaskCard";
import { NewTaskModal } from "./NewTaskModal";
import { Sidebar } from "./Sidebar";
import type { User } from "firebase/auth";

interface KanbanBoardProps {
    user: User;
    onSignOut: () => void;
}

export function KanbanBoard({ user, onSignOut }: KanbanBoardProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

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

    useEffect(() => {
        const q = query(collection(db, "tasks"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tasksData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Task[];
            setTasks(tasksData);
        });

        return () => unsubscribe();
    }, []);

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
        setActiveId(null);
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeTask = tasks.find((t) => t.id === activeId);
        if (!activeTask) return;

        let newStatus: Status = activeTask.status;

        if (Object.keys(COLUMN_LABELS).includes(overId)) {
            newStatus = overId as Status;
        } else {
            const overTask = tasks.find((t) => t.id === overId);
            if (overTask) {
                newStatus = overTask.status;
            }
        }

        if (activeTask.status !== newStatus) {
            // Optimistic update
            setTasks((prev) =>
                prev.map((t) => (t.id === activeId ? { ...t, status: newStatus } : t))
            );

            // Update Firestore
            const taskRef = doc(db, "tasks", activeId);
            await updateDoc(taskRef, { status: newStatus });
        }
    };

    const handleCreateTask = async (taskData: Omit<Task, "id" | "createdAt" | "assignee">) => {
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
                assignee: "https://i.pravatar.cc/150?u=" + Math.random(),
            });
        }
    };

    const handleDeleteTask = async (id: string) => {
        if (confirm("Are you sure you want to delete this task?")) {
            await deleteDoc(doc(db, "tasks", id));
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
                tasks={tasks}
                onSignOut={onSignOut}
                onNewTask={() => {
                    setEditingTask(null);
                    setIsModalOpen(true);
                }}
            />

            {/* Board Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="p-4 flex justify-end">
                    <button
                        onClick={() => {
                            if (confirm("Isso vai apagar dados existentes e recriar os iniciais. Continuar?")) {
                                seedDatabase();
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200 transition-colors cursor-pointer"
                    >
                        <Database className="w-4 h-4" />
                        Seed Database
                    </button>
                </div>
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
                                    tasks={tasks.filter((t) => t.status === colId)}
                                    onDeleteTask={handleDeleteTask}
                                    onEditTask={handleEditTask}
                                />
                            ))}
                        </div>

                        <DragOverlay>
                            {activeId ? (
                                <TaskCard
                                    task={tasks.find((t) => t.id === activeId)!}
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
