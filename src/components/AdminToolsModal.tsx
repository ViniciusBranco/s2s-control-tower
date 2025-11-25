import { X, Download, Upload, Database, ShieldAlert } from "lucide-react";
import { exportToJSON, importFromJSON } from "../lib/data-management";
import { seedDatabase } from "../lib/seed";
import type { Task } from "../types";

interface AdminToolsModalProps {
    isOpen: boolean;
    onClose: () => void;
    // tasks prop not needed for export since exportToJSON reads from Firestore directly, but kept for potential future use
    tasks?: Task[];
}

export function AdminToolsModal({ isOpen, onClose }: AdminToolsModalProps) {
    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (confirm("ATENÇÃO: Importar um backup irá SUBSTITUIR TODOS os dados atuais. Deseja continuar?")) {
                importFromJSON(file)
                    .then(() => {
                        alert("Importação concluída com sucesso!");
                        window.location.reload();
                    })
                    .catch((err) => alert("Erro na importação: " + err.message));
            }
        }
        e.target.value = ""; // reset input
    };

    const handleSeed = () => {
        if (confirm("Isso vai apagar dados existentes e recriar os iniciais. Continuar?")) {
            seedDatabase();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Ferramentas Administrativas</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-4 space-y-6">
                    {/* Data Management Section */}
                    <section>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Dados (Backup / Restore)</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={exportToJSON}
                                className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm transition-all shadow-sm"
                            >
                                <Download size={14} /> Exportar
                            </button>
                            <label className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm transition-all shadow-sm cursor-pointer">
                                <Upload size={14} /> Importar
                                <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                            </label>
                        </div>
                    </section>
                    {/* Danger Zone */}
                    <section>
                        <h3 className="text-sm font-medium text-red-600 mb-2">Perigo (Reset DB)</h3>
                        <button
                            onClick={handleSeed}
                            className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm transition-all shadow-sm"
                        >
                            <ShieldAlert size={14} /> Seed DB
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
}
