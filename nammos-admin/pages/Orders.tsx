import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Order, OrderStatus, User } from '../types';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/Toast';
import { X, Clock, MapPin, ChevronRight, Receipt, ArrowRight, User as UserIcon } from 'lucide-react';

// Helper component for fetching user name
const OrderUserDisplay: React.FC<{ userId: string }> = ({ userId }) => {
  const [name, setName] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    const fetchName = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', userId));
        if (mounted && snap.exists()) setName(snap.data().name.split(' ')[0]); // First name only for cleaner UI
      } catch (e) {}
    };
    fetchName();
    return () => { mounted = false; };
  }, [userId]);

  return <span className="font-semibold text-brand-text">{name || 'Cliente'}</span>;
};

// Kanban Column Definition
const kanbanColumns: { id: OrderStatus; title: string; color: string }[] = [
  { id: 'pending', title: 'Novos', color: 'border-t-4 border-yellow-400' },
  { id: 'accepted', title: 'Aceitos', color: 'border-t-4 border-blue-500' },
  { id: 'in_kitchen', title: 'Preparando', color: 'border-t-4 border-orange-500' },
  { id: 'out_for_delivery', title: 'Entrega', color: 'border-t-4 border-purple-500' },
  { id: 'delivered', title: 'Concluídos', color: 'border-t-4 border-green-500' },
];

const Orders: React.FC = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderUserDetail, setOrderUserDetail] = useState<User | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      setOrders(fetchedOrders);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (selectedOrder) {
        try {
          const userDoc = await getDoc(doc(db, 'users', selectedOrder.userId));
          if (userDoc.exists()) {
            setOrderUserDetail({ id: userDoc.id, ...userDoc.data() } as User);
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        setOrderUserDetail(null);
      }
    };
    fetchUser();
  }, [selectedOrder]);

  const updateStatus = async (orderId: string, newStatus: OrderStatus, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      showToast(`Pedido movido para ${newStatus.replace('_', ' ')}`, 'success');
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      showToast('Erro ao atualizar', 'error');
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '--:--';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date);
  };

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    const flow: OrderStatus[] = ['pending', 'accepted', 'in_kitchen', 'out_for_delivery', 'delivered'];
    const idx = flow.indexOf(current);
    return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : null;
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-brand-primary">Carregando...</div>;

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-brand-text">Kanban de Pedidos</h2>
          <p className="text-brand-textLight text-sm">Fluxo de produção em tempo real</p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex h-full gap-5 min-w-[1200px]">
          {kanbanColumns.map((column) => {
            const columnOrders = orders.filter(o => o.status === column.id);
            
            return (
              <div key={column.id} className="flex flex-col w-1/5 h-full rounded-2xl bg-white shadow-card border border-gray-100 overflow-hidden">
                {/* Column Header */}
                <div className={`p-4 bg-white border-b border-gray-50 ${column.color} sticky top-0 z-10`}>
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-brand-text text-sm uppercase tracking-wider">{column.title}</h3>
                    <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded-full">
                      {columnOrders.length}
                    </span>
                  </div>
                </div>

                {/* Column Content */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50/50 scrollbar-thin scrollbar-thumb-gray-200">
                  {columnOrders.map((order) => {
                     const nextStatus = getNextStatus(order.status);
                     return (
                      <div 
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="bg-white p-4 rounded-xl shadow-card hover:shadow-soft border border-transparent hover:border-brand-primary/20 transition-all duration-200 cursor-pointer group relative"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className="font-mono text-xs text-gray-400">#{order.id.slice(0, 4)}</span>
                          <span className="text-xs font-medium text-gray-500 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                            <Clock size={10} /> {formatTime(order.createdAt)}
                          </span>
                        </div>

                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-xs font-bold">
                              <UserIcon size={12} />
                            </div>
                            <OrderUserDisplay userId={order.userId} />
                          </div>
                          <p className="text-lg font-bold text-brand-text">{formatCurrency(order.total)}</p>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                           <div className="text-xs text-gray-400">{order.items.length} itens</div>
                           {nextStatus && (
                             <button 
                              onClick={(e) => updateStatus(order.id, nextStatus, e)}
                              className="p-1.5 rounded-full bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
                              title="Avançar etapa"
                             >
                               <ArrowRight size={14} />
                             </button>
                           )}
                        </div>
                      </div>
                    );
                  })}
                  {columnOrders.length === 0 && (
                    <div className="h-32 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-200 rounded-xl m-2">
                      <Receipt size={24} className="mb-2 opacity-50" />
                      <span className="text-xs font-medium">Sem pedidos</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cancelled Orders (Separate visual area if needed, currently handled by filter in previous version, but in Kanban, usually a bin. Here handled via modal or a 'Trash' column if we wanted. For now, we focus on active flow.) */}

      {/* Detail Modal - Re-styled */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-4 bg-brand-text/20 backdrop-blur-[2px]">
          <div className="bg-white h-full w-full max-w-md shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col rounded-2xl overflow-hidden border-l border-gray-100">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-brand-surface">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-brand-text">Pedido #{selectedOrder.id.slice(0, 6)}</h2>
                  <p className="text-sm text-gray-500 mt-1">{selectedOrder.createdAt?.toDate().toLocaleString()}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition">
                  <X size={20} />
                </button>
              </div>
              <StatusBadge status={selectedOrder.status} />
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Client Info */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Cliente</h3>
                {orderUserDetail ? (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-lg">
                      {orderUserDetail.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{orderUserDetail.name}</p>
                      <p className="text-xs text-gray-500">{orderUserDetail.phoneNumber}</p>
                    </div>
                  </div>
                ) : <span className="text-sm text-gray-400">Carregando...</span>}
              </div>

              {/* Address */}
              <div>
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                   <MapPin size={12} /> Entrega
                 </h3>
                 {selectedOrder.address ? (
                   <p className="text-sm text-gray-700 leading-relaxed bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
                     <span className="font-semibold block">{selectedOrder.address.street}, {selectedOrder.address.number}</span>
                     {selectedOrder.address.neighborhood} - {selectedOrder.address.city}
                   </p>
                 ) : <p className="text-sm text-gray-500 italic">Retirada no balcão</p>}
              </div>

              {/* Items */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Itens</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-start py-2 border-b border-dashed border-gray-100 last:border-0">
                      <div className="flex gap-3">
                        <span className="font-bold text-brand-primary text-sm w-5">{item.quantity}x</span>
                        <div>
                           <p className="text-sm font-medium text-gray-800">{item.name}</p>
                           {item.observations && <p className="text-xs text-red-400 mt-0.5">{item.observations}</p>}
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-600">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-gray-100">
                 <div className="flex justify-between text-sm text-gray-500 mb-1">
                   <span>Subtotal</span>
                   <span>{formatCurrency(selectedOrder.subtotal)}</span>
                 </div>
                 <div className="flex justify-between text-sm text-gray-500 mb-4">
                   <span>Taxa de Entrega</span>
                   <span>{formatCurrency(selectedOrder.deliveryFee)}</span>
                 </div>
                 <div className="flex justify-between items-center bg-brand-primary/5 p-4 rounded-xl border border-brand-primary/10">
                   <span className="font-bold text-brand-primary">Total</span>
                   <span className="font-bold text-2xl text-brand-primary">{formatCurrency(selectedOrder.total)}</span>
                 </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-3">
              {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                <div className="grid grid-cols-2 gap-3">
                   <button 
                    onClick={() => updateStatus(selectedOrder.id, 'cancelled')}
                    className="px-4 py-3 rounded-xl border border-red-200 text-red-500 font-semibold hover:bg-red-50 transition text-sm"
                   >
                     Cancelar
                   </button>
                   
                   {getNextStatus(selectedOrder.status) && (
                     <button 
                      onClick={() => updateStatus(selectedOrder.id, getNextStatus(selectedOrder.status)!)}
                      className="px-4 py-3 rounded-xl bg-brand-primary text-white font-bold hover:bg-brand-primaryHover shadow-lg shadow-brand-primary/25 transition text-sm flex items-center justify-center gap-2"
                     >
                       Avançar Etapa <ArrowRight size={16} />
                     </button>
                   )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;