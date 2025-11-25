import { collection, writeBatch, doc, getDocs, query } from "firebase/firestore";
import { db, auth } from "./firebase";

export const seedDatabase = async () => {
    if (!auth.currentUser) {
        alert("Please sign in to seed the database");
        return;
    }

    const batch = writeBatch(db);
    const tasksRef = collection(db, "tasks");

    // Step A: Delete all existing documents
    const q = query(tasksRef);
    const snapshot = await getDocs(q);
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    const tasks = [
        // Tintas Marfim
        { title: "Implementar Stack de Observabilidade (Prometheus/Grafana/Loki)", status: "backlog", priority: "high", projectId: "tintas-marfim" },
        { title: "Configuração de CI/CD (GitHub Actions)", status: "todo", priority: "high", projectId: "tintas-marfim" },
        { title: "Implementar Fila de Mensagens (Celery/Redis)", status: "todo", priority: "medium", projectId: "tintas-marfim" },
        { title: "Saneamento de Base de Dados (LID & Identidade Persistente)", status: "done", priority: "critical", projectId: "tintas-marfim" },
        { title: "Migração para PostgreSQL Dockerizado", status: "done", priority: "high", projectId: "tintas-marfim" },

        // OpenPower Backend
        { title: "Implementar Revogação de Consentimentos (Endpoint DELETE)", status: "todo", priority: "high", projectId: "openpower-back" },
        { title: "Expandir Endpoints de Gestão (Admin CRUD)", status: "in-progress", priority: "medium", projectId: "openpower-back" },
        { title: "Implementação Completa do Fluxo de Recuperação de Senha", status: "done", priority: "high", projectId: "openpower-back" },
        { title: "Refatoração Arquitetural (SQLAlchemy/Alembic)", status: "done", priority: "critical", projectId: "openpower-back" },

        // OpenPower Frontend
        { title: "Implementar Login com Google (SSO)", status: "backlog", priority: "medium", projectId: "openpower-front" },
        { title: "Implementar Página Wallet", status: "todo", priority: "high", projectId: "openpower-front" },
        { title: "Implementar Polling (Home/Wallet) para status de consentimento", status: "in-progress", priority: "medium", projectId: "openpower-front" },
        { title: "Tela de Perfil Completa (Edição e Senha)", status: "done", priority: "low", projectId: "openpower-front" },
        { title: "Refatoração UI/UX Geral (Design System)", status: "done", priority: "high", projectId: "openpower-front" },

        // EquiHealth
        { title: "Treinamento YOLOv8 Nano (Proof of Concept)", status: "todo", priority: "critical", projectId: "equihealth" },
        { title: "Otimização I/O Frames (Leitura de Vídeo Streamada)", status: "in-progress", priority: "high", projectId: "equihealth" },
        { title: "Curadoria de Negativos (Baias Vazias) e Safety Mining", status: "done", priority: "medium", projectId: "equihealth" },
        { title: "Implementação do Split Determinístico 80/20", status: "done", priority: "low", projectId: "equihealth" },

        // AMAE
        { title: "Levantamento de requisitos funcionais", status: "todo", priority: "high", projectId: "amae" },

        // Vita.AI
        { title: "Configuração de ambiente Python/Jupyter", status: "todo", priority: "medium", projectId: "vita-ai" },
    ];

    // Step B: Add new tasks
    tasks.forEach((task) => {
        const taskRef = doc(tasksRef);
        batch.set(taskRef, {
            ...task,
            createdAt: new Date().toISOString(),
            assignee: auth.currentUser?.photoURL,
            userId: auth.currentUser?.uid,
        });
    });

    await batch.commit();
    console.log("Database seeded successfully!");
    alert("Database seeded successfully!");
};
