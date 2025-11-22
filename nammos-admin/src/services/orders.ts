import { db } from "./firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

export const listenOrders = (callback: (orders: any[]) => void) => {
  const q = query(
    collection(db, "orders"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(orders);
  });
};
