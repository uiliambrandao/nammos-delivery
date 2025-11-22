import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 🔥 SEU SDK 100% CORRETO
const firebaseConfig = {
  apiKey: "AIzaSyAAa8vdB9LHJ1GzOaFgy8yE51T_BQTbZS8",
  authDomain: "namos-burgers.firebaseapp.com",
  projectId: "namos-burgers",
  storageBucket: "namos-burgers.firebasestorage.app",
  messagingSenderId: "683624050214",
  appId: "1:683624050214:web:42951fb27f29cee6f400e7"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
