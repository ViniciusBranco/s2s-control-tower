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
// import { seedDatabase } from "../lib/seed";
import type { Task, Status } from "../types";
import { COLUMN_LABELS } from "../types";
import { Column } from "./Column";
import { TaskCard } from "./TaskCard";
import { NewTaskModal } from "./NewTaskModal";
import { Plus, Database, LogOut } from "lucide-react";
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
        <div className="h-screen flex flex-col bg-gray-100 text-gray-900 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <Database className="text-white" size={20} />
                    </div>
                    <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                        My Projects Control Tower
                    </h1>
                </div>
                <div className="flex gap-3 items-center">
                    <div className="flex items-center gap-2 mr-2">
                        {user.photoURL && (
                            <img
                                src={user.photoURL}
                                alt={user.displayName || "User"}
                                className="w-8 h-8 rounded-full border border-gray-200"
                            />
                        )}
                        <span className="text-sm font-medium text-gray-700 hidden sm:block">
                            {user.displayName}
                        </span>
                    </div>
                    {/* <button
                        onClick={seedDatabase}
                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium text-sm flex items-center gap-2"
                    >
                        <Database size={16} />
                        Seed Database
                    </button> */}
                    <button
                        onClick={() => {
                            setEditingTask(null);
                            setIsModalOpen(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center gap-2 shadow-sm"
                    >
                        <Plus size={18} />
                        New Task
                    </button>
                    <button
                        onClick={onSignOut}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sign Out"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Board Area */}
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
