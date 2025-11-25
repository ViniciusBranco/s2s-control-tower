import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "./firebase";
import type { Task } from "../types";

export const exportToJSON = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "tasks"));
        const tasks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        const date = new Date().toISOString().split('T')[0];
        downloadAnchorNode.setAttribute("download", `story2scale-backup-${date}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    } catch (error) {
        console.error("Error exporting data:", error);
        alert("Erro ao exportar dados.");
    }
};

export const importFromJSON = async (file: File) => {
    const reader = new FileReader();

    return new Promise<void>((resolve, reject) => {
        reader.onload = async (e) => {
            try {
                const content = e.target?.result as string;
                const tasks = JSON.parse(content) as Task[];

                if (!Array.isArray(tasks)) {
                    throw new Error("Formato de arquivo inválido. Esperado um array de tarefas.");
                }

                // 1. Delete all existing tasks (in chunks of 500)
                const existingSnapshot = await getDocs(collection(db, "tasks"));
                const existingDocs = existingSnapshot.docs;

                const chunkArray = <T>(arr: T[], size: number): T[][] => {
                    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
                        arr.slice(i * size, i * size + size)
                    );
                };

                const deleteChunks = chunkArray(existingDocs, 500);
                for (const chunk of deleteChunks) {
                    const batch = writeBatch(db);
                    chunk.forEach((doc) => batch.delete(doc.ref));
                    await batch.commit();
                }

                // 2. Import new tasks (in chunks of 500)
                const importChunks = chunkArray(tasks, 500);
                for (const chunk of importChunks) {
                    const batch = writeBatch(db);
                    chunk.forEach((task) => {
                        const { id, ...taskData } = task;
                        // Use the ID from the backup to maintain consistency
                        const docRef = id ? doc(db, "tasks", id) : doc(collection(db, "tasks"));
                        batch.set(docRef, taskData);
                    });
                    await batch.commit();
                }

                resolve();
            } catch (error) {
                console.error("Error importing data:", error);
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
};
