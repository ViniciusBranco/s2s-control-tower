import { X, Calendar, Clock, AlertCircle, LayoutGrid, Filter, MousePointerClick, ShieldCheck } from "lucide-react";
import { PROJECT_COLORS, PROJECTS } from "../types";

interface ProjectGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProjectGuideModal({ isOpen, onClose }: ProjectGuideModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Guia de Bordo</h2>
                        <p className="text-sm text-gray-500 mt-1">Manual de referência do sistema</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Section 1: Project Colors */}
                    <section>
                        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                            <LayoutGrid size={16} className="text-blue-600" />
                            Mapa de Projetos
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {PROJECTS.map(project => (
                                <div key={project.id} className="flex items-center gap-3 p-2 rounded-lg border border-gray-100 bg-gray-50/50">
                                    <div className={`w-3 h-3 rounded-full ${PROJECT_COLORS[project.color].split(' ')[0].replace('bg-', 'bg-').replace('-100', '-500')}`} />
                                    <span className="text-sm font-medium text-gray-700">{project.name}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 2: Card Anatomy & Aging */}
                    <section>
                        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                            <Clock size={16} className="text-amber-600" />
                            Status & Envelhecimento
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
                                <div className="flex items-center gap-2 text-gray-500 mb-2">
                                    <Calendar size={18} />
                                    <span className="font-semibold text-sm">Recente</span>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Tarefas criadas ou atualizadas nos últimos 14 dias. Fluxo normal de trabalho.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 shadow-sm">
                                <div className="flex items-center gap-2 text-amber-700 mb-2">
                                    <Clock size={18} />
                                    <span className="font-semibold text-sm">Atenção</span>
                                </div>
                                <p className="text-xs text-amber-800 leading-relaxed">
                                    Tarefas paradas há mais de 14 dias. Requerem revisão ou acompanhamento.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl border border-red-200 bg-red-50 shadow-sm">
                                <div className="flex items-center gap-2 text-red-700 mb-2">
                                    <AlertCircle size={18} />
                                    <span className="font-semibold text-sm">Crítico</span>
                                </div>
                                <p className="text-xs text-red-800 leading-relaxed">
                                    Tarefas estagnadas há mais de 30 dias. Ação imediata necessária.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Features */}
                    <section>
                        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                            <MousePointerClick size={16} className="text-purple-600" />
                            Funcionalidades
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-md mt-0.5">
                                    <Filter size={14} />
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-900 block">Filtro de Projetos</span>
                                    <span className="text-xs text-gray-500">Clique nos projetos na barra lateral para filtrar o quadro. Selecione múltiplos para comparar.</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-green-100 text-green-600 rounded-md mt-0.5">
                                    <ShieldCheck size={14} />
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-900 block">Segurança & Auditoria</span>
                                    <span className="text-xs text-gray-500">Login seguro via Google. Apenas administradores podem resetar o banco de dados.</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400 font-medium">
                        Story2Scale Control Tower v1.0 • Desenvolvido com React & Firebase
                    </p>
                </div>
            </div>
        </div>
    );
}
