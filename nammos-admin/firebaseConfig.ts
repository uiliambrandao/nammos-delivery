import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase project configuration
// These values typically come from process.env or are hardcoded for the specific client project
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "nammos-burgers.firebaseapp.com",
  projectId: "nammos-burgers", // Hardcoded as per prompt requirement context
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "nammos-burgers.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);