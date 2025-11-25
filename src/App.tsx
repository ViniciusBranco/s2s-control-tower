import { useEffect, useState } from "react";
import { onAuthStateChanged, type User, signOut } from "firebase/auth";
import { auth } from "./lib/firebase";
import { KanbanBoard } from "./components/KanbanBoard";
import { Login } from "./components/Login";
import { AccessDenied } from "./components/AccessDenied";
import { Loader2 } from "lucide-react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "./lib/firebase";
import type { Task } from "./types";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

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

  const toggleProject = (projectId: string) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const filteredTasks = (selectedProjects.length === 0
    ? tasks
    : tasks.filter((t) => selectedProjects.includes(t.projectId))
  ).filter(t => !t.isArchived);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const allowedEmails = import.meta.env.VITE_ALLOWED_EMAILS?.split(',').map((e: string) => e.trim()) || [];
  const isAllowed = allowedEmails.length === 0 || (user.email && allowedEmails.includes(user.email));

  if (!isAllowed) {
    return <AccessDenied userEmail={user.email} />;
  }

  return (
    <KanbanBoard
      user={user}
      onSignOut={handleSignOut}
      tasks={filteredTasks}
      allTasks={tasks}
      selectedProjects={selectedProjects}
      onToggleProject={toggleProject}
    />
  );
}

export default App;
