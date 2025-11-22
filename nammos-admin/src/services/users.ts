import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

export const getUsers = async () => {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
