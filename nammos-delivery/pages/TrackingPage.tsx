import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { subscribeToOrder } from '../services/firebase';
import { Order, OrderStatus, OrderType } from '../types';
import { CheckCircle2, Clock, ChefHat, Truck, PackageCheck } from 'lucide-react';

export const TrackingPage: React.FC = () => {
  const { activeOrderId, setActiveOrderId } = useApp();
  const [order, setOrder] = useState<Order | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!activeOrderId) {
        navigate('/'); // Reset if lost
        return;
    }

    const unsubscribe = subscribeToOrder(activeOrderId, (updatedOrder) => {
        setOrder(updatedOrder);
    });

    return () => unsubscribe();
  }, [activeOrderId, navigate]);

  const handleReset = () => {
      setActiveOrderId(''); // Type hack, simple string reset
      navigate('/');
  };

  if (!order) return <div className="h-screen flex items-center justify-center font-bold text-gray-500">Carregando pedido...</div>;

  const steps = [
    { status: OrderStatus.PENDING, label: 'Enviado', icon: Clock },
    { status: OrderStatus.ACCEPTED, label: 'Aceito', icon: CheckCircle2 },
    { status: OrderStatus.IN_KITCHEN, label: 'Preparando', icon: ChefHat },
    { status: OrderStatus.OUT_FOR_DELIVERY, label: 'Saiu para entrega', icon: Truck },
    { status: OrderStatus.DELIVERED, label: 'Entregue', icon: PackageCheck },
  ];

  let activeIndex = -1;
  if(order.status !== OrderStatus.CANCELLED) {
     activeIndex = steps.findIndex(s => s.status === order.status);
  }

  return (
    <div className="flex flex-col min-h-screen md:min-h-0 bg-gray-50 md:bg-white h-full">
        <div className="bg-primary text-white p-6 pt-12 md:p-10 md:rounded-t-2xl rounded-b-3xl shadow-lg text-center">
            <div className="inline-block bg-white/20 px-4 py-1 rounded-full text-xs font-bold tracking-wider mb-4 text-white border border-white/20">
                STATUS DO PEDIDO
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Pedido #{order.id?.slice(0,5).toUpperCase()}</h1>
            <p className="text-blue-100">Acompanhe o progresso em tempo real</p>
        </div>

        <div className="flex-grow p-6 md:flex md:gap-12 md:max-w-5xl md:mx-auto w-full">
            
            {/* Timeline Column */}
            <div className="md:flex-1">
                {order.status === OrderStatus.CANCELLED ? (
                    <div className="bg-red-100 text-red-800 p-6 rounded-2xl text-center font-bold border border-red-200">
                        Este pedido foi cancelado pelo restaurante.
                    </div>
                ) : (
                    <div className="relative pl-4 md:pl-0 py-4">
                        {/* Vertical line */}
                        <div className="absolute left-10 md:left-8 top-4 bottom-4 w-1 bg-gray-100 z-0"></div>

                        {steps.map((step, index) => {
                            const isActive = index <= activeIndex;
                            const isCurrent = index === activeIndex;
                            const Icon = step.icon;

                            return (
                                <div key={step.status} className="relative z-10 flex items-center mb-10 last:mb-0 group">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isActive ? 'bg-primary border-white shadow-lg scale-110 text-white' : 'bg-gray-100 border-white text-gray-300'}`}>
                                        <Icon size={24} />
                                    </div>
                                    <div className="ml-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex-1 transition group-hover:shadow-md">
                                        <p className={`font-bold text-lg ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                                        {isCurrent && <p className="text-sm text-primary font-bold animate-pulse mt-1">Em andamento...</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Details Column */}
            <div className="md:w-96 mt-8 md:mt-0">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold mb-4 border-b border-gray-100 pb-3 text-lg text-gray-800">Detalhes do Pedido</h3>
                    
                    <div className="space-y-3 mb-6">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm text-gray-600">
                                <span>{item.quantity}x {item.productNameSnapshot}</span>
                                <span className="font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.totalPrice)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between text-lg mb-6 pt-4 border-t border-gray-100">
                        <span className="text-gray-600">Total</span>
                        <span className="font-bold text-primary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}</span>
                    </div>
                    
                    {order.orderType === OrderType.DELIVERY && (
                        <div className="bg-gray-50 p-4 rounded-xl text-sm">
                            <p className="font-bold text-gray-400 uppercase text-xs mb-2">Endereço de entrega</p>
                            <p className="text-gray-800 font-medium">{order.address?.street}, {order.address?.number}</p>
                            <p className="text-gray-500">{order.address?.neighborhood}</p>
                        </div>
                    )}
                </div>

                <button onClick={handleReset} className="w-full mt-6 bg-white border-2 border-gray-200 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition">
                    FAZER NOVO PEDIDO
                </button>
            </div>
        </div>
    </div>
  );
};