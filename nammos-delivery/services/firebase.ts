import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  doc, 
  getDoc, 
  Timestamp,
  onSnapshot,
  orderBy
} from 'firebase/firestore';
import { User, Order, OrderStatus, Product, Category, Restaurant, OrderType } from '../types';

// Safely access process.env
const getEnv = (key: string) => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
};

const firebaseConfig = {
    apiKey: "AIzaSyAAa8vdB9LHJ1GzOaFgy8yE51T_BQTbZS8",
  authDomain: "namos-burgers.firebaseapp.com",
  projectId: "namos-burgers",
  storageBucket: "namos-burgers.firebasestorage.app",
  messagingSenderId: "683624050214",
  appId: "1:683624050214:web:42951fb27f29cee6f400e7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const NAMMOS_ID = 'nammos-burgers';

// --- MOCK DATA HELPERS ---
const shouldUseMock = () => {
  return firebaseConfig.apiKey === "mock_key" || (typeof navigator !== 'undefined' && !navigator.onLine);
};

const MOCK_RESTAURANT: Restaurant = {
  id: NAMMOS_ID,
  name: 'Nammos Burgers',
  isOpen: true,
  deliveryFeeBase: 5.00
};

const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Burgers', order: 1, isActive: true, restaurantId: NAMMOS_ID },
  { id: '2', name: 'Acompanhamentos', order: 2, isActive: true, restaurantId: NAMMOS_ID },
  { id: '3', name: 'Bebidas', order: 3, isActive: true, restaurantId: NAMMOS_ID },
];

const MOCK_PRODUCTS: Product[] = [
  { id: '101', name: 'Nammos Classic', description: 'Blend 160g, queijo cheddar, maionese verde e bacon crocante no pão brioche.', basePrice: 32, isActive: true, restaurantId: NAMMOS_ID, categoryId: '1' },
  { id: '102', name: 'Nammos Salad', description: 'Blend 160g, queijo prato, alface americana, tomate e cebola roxa.', basePrice: 28, isActive: true, restaurantId: NAMMOS_ID, categoryId: '1' },
  { id: '103', name: 'Double Smash', description: 'Dois smashes de 80g, cheddar duplo, cebola caramelizada.', basePrice: 35, isActive: true, restaurantId: NAMMOS_ID, categoryId: '1' },
  { id: '201', name: 'Fritas Nammos', description: 'Batatas rústicas com páprica e alecrim.', basePrice: 18, isActive: true, restaurantId: NAMMOS_ID, categoryId: '2' },
  { id: '301', name: 'Coca-Cola Lata', description: '350ml', basePrice: 6, isActive: true, restaurantId: NAMMOS_ID, categoryId: '3' },
  { id: '302', name: 'Água com Gás', description: '500ml', basePrice: 4, isActive: true, restaurantId: NAMMOS_ID, categoryId: '3' },
];

// --- Services ---

export const checkUserByPhone = async (phone: string): Promise<User | null> => {
  if (shouldUseMock()) {
    // Return mock user for demo if phone matches a demo number, otherwise null to test creation
    if (phone === '11999999999') {
      return { id: 'mock_user_id', name: 'Cliente Demo', phone, createdAt: Timestamp.now() };
    }
    return null;
  }

  try {
    const q = query(collection(db, 'users'), where('phone', '==', phone));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docData = snapshot.docs[0];
      return { id: docData.id, ...docData.data() } as User;
    }
    return null;
  } catch (error) {
    console.warn("Firestore error (checkUser), using mock:", error);
    return null;
  }
};

export const createUser = async (name: string, phone: string): Promise<User> => {
  if (shouldUseMock()) {
    return { id: `mock_${Date.now()}`, name, phone, createdAt: Timestamp.now() };
  }

  try {
    const newUser = {
      name,
      phone,
      createdAt: Timestamp.now()
    };
    const docRef = await addDoc(collection(db, 'users'), newUser);
    return { id: docRef.id, ...newUser };
  } catch (error) {
    console.warn("Firestore error (createUser), using mock:", error);
    return { id: `mock_${Date.now()}`, name, phone, createdAt: Timestamp.now() };
  }
};

export const getRestaurantDetails = async (): Promise<Restaurant | null> => {
  if (shouldUseMock()) return MOCK_RESTAURANT;

  try {
    const docRef = doc(db, 'restaurants', NAMMOS_ID);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Restaurant;
    }
    return MOCK_RESTAURANT;
  } catch (error) {
    console.warn("Firestore error (getRestaurant), using mock:", error);
    return MOCK_RESTAURANT;
  }
};

export const getMenu = async () => {
  if (shouldUseMock()) {
    return { categories: MOCK_CATEGORIES, products: MOCK_PRODUCTS };
  }

  try {
    const catQuery = query(
      collection(db, 'categories'), 
      where('restaurantId', '==', NAMMOS_ID), 
      where('isActive', '==', true),
      orderBy('order', 'asc')
    );
    
    const prodQuery = query(
      collection(db, 'products'), 
      where('restaurantId', '==', NAMMOS_ID), 
      where('isActive', '==', true)
    );

    const [catSnap, prodSnap] = await Promise.all([getDocs(catQuery), getDocs(prodQuery)]);

    const categories: Category[] = catSnap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
    const products: Product[] = prodSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product));

    if (categories.length === 0) return { categories: MOCK_CATEGORIES, products: MOCK_PRODUCTS };

    return { categories, products };
  } catch (error) {
    console.warn("Firestore error (getMenu), using mock:", error);
    return { categories: MOCK_CATEGORIES, products: MOCK_PRODUCTS };
  }
};

export const createOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<string> => {
  if (shouldUseMock()) {
    return `ORD-${Math.floor(Math.random() * 10000)}`;
  }

  try {
    const newOrder = {
      ...order,
      restaurantId: NAMMOS_ID,
      status: OrderStatus.PENDING,
      createdAt: Timestamp.now()
    };
    const docRef = await addDoc(collection(db, 'orders'), newOrder);
    return docRef.id;
  } catch (error) {
    console.warn("Firestore error (createOrder), using mock:", error);
    return `ORD-${Math.floor(Math.random() * 10000)}`;
  }
};


export const subscribeToOrder = (orderId: string, callback: (order: Order) => void) => {
  // Use mock if config is mock or if the order ID looks like our mock ID
  if (shouldUseMock() || orderId.startsWith('ORD-')) {
    const mockOrder: Order = {
      id: orderId,
      userId: 'mock_user',
      restaurantId: NAMMOS_ID,
      customerName: 'Cliente Demo',
      customerPhone: '11999999999',
      orderType: OrderType.DELIVERY,
      items: [],
      subtotal: 0,
      deliveryFee: 5,
      total: 50,
      status: OrderStatus.PENDING,
      createdAt: Timestamp.now()
    };

    // Return initial state
    callback(mockOrder);
    
    // Simulate progress
    const statuses = [OrderStatus.ACCEPTED, OrderStatus.IN_KITCHEN, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED];
    let i = 0;
    const interval = setInterval(() => {
      if (i < statuses.length) {
        callback({ ...mockOrder, status: statuses[i] });
        i++;
      }
    }, 4000); 

    return () => clearInterval(interval);
  }

  return onSnapshot(doc(db, 'orders', orderId), (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as Order);
    }
  }, (error) => {
     console.error("Snapshot error:", error);
  });
};
