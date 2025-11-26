import { useState } from "react";
import { X, Plus, Trash2, Edit2, Bot, Code, Database, User, Building2, Brain, ShieldCheck, Monitor, PawPrint, Globe, Smartphone, Cloud, Server, Cpu, Activity, Zap, Layers, Box } from "lucide-react";
import { collection, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Project } from "../types";
import { AVAILABLE_COLORS, COLOR_HEX_MAP } from "../lib/constants";

interface ProjectManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    projects: Project[];
}

const AVAILABLE_ICONS = {
    Bot, Code, Database, User, Building2, Brain, ShieldCheck, Monitor, PawPrint,
    Globe, Smartphone, Cloud, Server, Cpu, Activity, Zap, Layers, Box
};

export function ProjectManagerModal({ isOpen, onClose, projects }: ProjectManagerModalProps) {
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState<Partial<Project>>({
        name: "",
        color: "blue",
        icon: "Box"
    });

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!formData.name) return;

        try {
            if (editingProject) {
                await updateDoc(doc(db, "projects", editingProject.id), {
                    name: formData.name,
                    color: formData.color,
                    icon: formData.icon
                });
            } else {
                await addDoc(collection(db, "projects"), {
                    name: formData.name,
                    color: formData.color,
                    icon: formData.icon,
                    createdAt: new Date().toISOString()
                });
            }
            resetForm();
        } catch (error) {
            console.error("Error saving project:", error);
            alert("Erro ao salvar projeto.");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Tem certeza? As tarefas associadas a este projeto perderão sua tag.")) {
            try {
                await deleteDoc(doc(db, "projects", id));
            } catch (error) {
                console.error("Error deleting project:", error);
            }
        }
    };

    const startEdit = (project: Project) => {
        setEditingProject(project);
        setFormData({
            name: project.name,
            color: project.color,
            icon: project.icon
        });
        setIsCreating(true);
    };

    const resetForm = () => {
        setEditingProject(null);
        setIsCreating(false);
        setFormData({ name: "", color: "blue", icon: "Box" });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Gerenciar Projetos</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {isCreating ? (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Projeto</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ex: Novo Projeto"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cor do Tema</label>
                                <div className="flex flex-wrap gap-2">
                                    {AVAILABLE_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setFormData({ ...formData, color })}
                                            className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${formData.color === color
                                                ? "border-gray-900 scale-110"
                                                : "border-transparent hover:scale-105"
                                                }`}
                                        >
                                            <div
                                                className="w-full h-full rounded-full"
                                                style={{ backgroundColor: COLOR_HEX_MAP[color] }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ícone</label>
                                <div className="grid grid-cols-6 gap-2">
                                    {Object.entries(AVAILABLE_ICONS).map(([name, Icon]) => (
                                        <button
                                            key={name}
                                            onClick={() => setFormData({ ...formData, icon: name })}
                                            className={`p-2 rounded-lg border flex items-center justify-center transition-all ${formData.icon === name
                                                ? "border-blue-500 bg-blue-50 text-blue-600"
                                                : "border-gray-200 hover:bg-gray-50 text-gray-600"
                                                }`}
                                            title={name}
                                        >
                                            <Icon size={20} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={resetForm}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={!formData.name}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {editingProject ? "Salvar Alterações" : "Criar Projeto"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <button
                                onClick={() => setIsCreating(true)}
                                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={20} />
                                Adicionar Novo Projeto
                            </button>

                            {projects.map((project) => {
                                const Icon = AVAILABLE_ICONS[project.icon as keyof typeof AVAILABLE_ICONS] || Box;
                                return (
                                    <div
                                        key={project.id}
                                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition-shadow"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg bg-${project.color}-100 text-${project.color}-600`}>
                                                <Icon size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">{project.name}</h3>
                                                <p className="text-xs text-gray-500 capitalize">{project.color} Theme</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => startEdit(project)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(project.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
