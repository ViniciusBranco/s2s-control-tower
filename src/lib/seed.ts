import { collection, writeBatch, doc, getDocs, query } from "firebase/firestore";
import { db, auth } from "./firebase";

export const seedDatabase = async () => {
    if (!auth.currentUser) {
        alert("Please sign in to seed the database");
        return;
    }

    const batch = writeBatch(db);
    const tasksRef = collection(db, "tasks");
    const projectsRef = collection(db, "projects");

    // Step A: Delete all existing documents (Tasks)
    const tasksQuery = query(tasksRef);
    const tasksSnapshot = await getDocs(tasksQuery);
    tasksSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    // Step B: Delete all existing documents (Projects)
    const projectsQuery = query(projectsRef);
    const projectsSnapshot = await getDocs(projectsQuery);
    projectsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    // Step C: Add Projects
    const projects = [
        { id: "tintas-marfim", name: "Tintas Marfim", color: "orange", icon: "Bot" },
        { id: "openpower-back", name: "OpenPower Backend", color: "blue", icon: "ShieldCheck" },
        { id: "openpower-front", name: "OpenPower Frontend", color: "sky", icon: "Monitor" },
        { id: "equihealth", name: "EquiHealth", color: "green", icon: "PawPrint" },
        { id: "amae", name: "AMAE", color: "red", icon: "Building2" },
        { id: "vita-ai", name: "Vita.AI", color: "purple", icon: "Brain" },
    ];

    projects.forEach((project) => {
        const projectRef = doc(db, "projects", project.id);
        batch.set(projectRef, project);
    });

    const tasks = [
        // Tintas Marfim
        { title: "Implementar Stack de Observabilidade (Prometheus/Grafana/Loki)", status: "backlog", priority: "high", projectId: "tintas-marfim", date: "2025-11-25" },
        { title: "Configuração de CI/CD (GitHub Actions)", status: "todo", priority: "high", projectId: "tintas-marfim", date: "2025-11-25" },
        { title: "Implementar Fila de Mensagens (Celery/Redis)", status: "todo", priority: "medium", projectId: "tintas-marfim", date: "2025-11-25" },
        { title: "Saneamento de Base de Dados (LID & Identidade Persistente)", status: "done", priority: "critical", projectId: "tintas-marfim", date: "2025-11-20" },
        { title: "Migração para PostgreSQL Dockerizado", status: "done", priority: "high", projectId: "tintas-marfim", date: "2025-10-23" },

        // OpenPower Backend
        { title: "Implementar Revogação de Consentimentos (Endpoint DELETE)", status: "todo", priority: "high", projectId: "openpower-back", date: "2025-11-25" },
        { title: "Expandir Endpoints de Gestão (Admin CRUD)", status: "in-progress", priority: "medium", projectId: "openpower-back", date: "2025-11-25" },
        { title: "Implementação Completa do Fluxo de Recuperação de Senha", status: "done", priority: "high", projectId: "openpower-back", date: "2025-11-22" },
        { title: "Refatoração Arquitetural (SQLAlchemy/Alembic)", status: "done", priority: "critical", projectId: "openpower-back", date: "2025-11-19" },

        // OpenPower Frontend
        { title: "Implementar Login com Google (SSO)", status: "backlog", priority: "medium", projectId: "openpower-front", date: "2025-11-25" },
        { title: "Implementar Página Wallet", status: "todo", priority: "high", projectId: "openpower-front", date: "2025-11-25" },
        { title: "Implementar Polling (Home/Wallet) para status de consentimento", status: "in-progress", priority: "medium", projectId: "openpower-front", date: "2025-11-25" },
        { title: "Tela de Perfil Completa (Edição e Senha)", status: "done", priority: "low", projectId: "openpower-front", date: "2025-11-22" },
        { title: "Refatoração UI/UX Geral (Design System)", status: "done", priority: "high", projectId: "openpower-front", date: "2025-11-21" },

        // EquiHealth
        { title: "Treinamento YOLOv8 Nano (Proof of Concept)", status: "todo", priority: "critical", projectId: "equihealth", date: "2025-11-25" },
        { title: "Otimização I/O Frames (Leitura de Vídeo Streamada)", status: "in-progress", priority: "high", projectId: "equihealth", date: "2025-11-25" },
        { title: "Curadoria de Negativos (Baias Vazias) e Safety Mining", status: "done", priority: "medium", projectId: "equihealth", date: "2025-11-14" },
        { title: "Implementação do Split Determinístico 80/20", status: "done", priority: "low", projectId: "equihealth", date: "2025-11-14" },

        // AMAE
        { title: "Levantamento de requisitos funcionais", status: "todo", priority: "high", projectId: "amae", date: "2025-11-25" },

        // Vita.AI
        { title: "Configuração de ambiente Python/Jupyter", status: "todo", priority: "medium", projectId: "vita-ai", date: "2025-11-25" },
    ];

    // Step D: Add new tasks
    tasks.forEach((task) => {
        const taskRef = doc(tasksRef);
        batch.set(taskRef, {
            ...task,
            createdAt: new Date().toISOString(),
            assignee: auth.currentUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.currentUser?.displayName || "User")}&background=random`,
            userId: auth.currentUser?.uid,
        });
    });

    await batch.commit();
    console.log("Database seeded successfully!");
    alert("Database seeded successfully!");
};
