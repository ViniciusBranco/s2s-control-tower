import { ShieldAlert, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

interface AccessDeniedProps {
    userEmail: string | null;
}

export function AccessDenied({ userEmail }: AccessDeniedProps) {
    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-gray-100">
                <div className="flex justify-center mb-6">
                    <div className="bg-red-100 p-4 rounded-full">
                        <ShieldAlert className="text-red-600" size={48} />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
                    Acesso Restrito
                </h1>
                <p className="text-gray-500 mb-8">
                    Seu email <span className="font-medium text-gray-700">{userEmail}</span> não tem permissão para acessar este painel. Entre em contato com o administrador.
                </p>

                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
                >
                    <LogOut size={18} />
                    Sair
                </button>
            </div>
        </div>
    );
}
