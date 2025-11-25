import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAx1NQceCmvJcLj8lLYEMfBh3WdkClEADE",
    authDomain: "story2scale-7e039.firebaseapp.com",
    projectId: "story2scale-7e039",
    storageBucket: "story2scale-7e039.firebasestorage.app",
    messagingSenderId: "116406874952",
    appId: "1:116406874952:web:027d12066dd3ee47c1f97d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
