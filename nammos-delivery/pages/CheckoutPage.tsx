import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { createOrder } from '../services/firebase';
import { OrderType, Order } from '../types';
import { ArrowLeft, MapPin, User, Phone, CheckCircle } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { 
    cartItems, cartSubtotal, cartTotal, orderType, 
    currentUser, deliveryAddress, setActiveOrderId, clearCart, restaurant 
  } = useApp();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  if (cartItems.length === 0 || !currentUser) {
      navigate('/menu');
      return null;
  }

  const handleConfirm = async () => {
      if (!restaurant?.isOpen) {
          alert("Restaurante fechado.");
          return;
      }
      setSubmitting(true);
      try {
          const deliveryFee = (orderType === OrderType.DELIVERY && restaurant) ? restaurant.deliveryFeeBase : 0;
          
          const orderPayload: Omit<Order, 'id' | 'createdAt' | 'status'> = {
              userId: currentUser.id!,
              restaurantId: restaurant.id,
              customerName: currentUser.name,
              customerPhone: currentUser.phone,
              orderType: orderType!,
              items: cartItems,
              subtotal: cartSubtotal,
              deliveryFee: deliveryFee,
              total: cartTotal,
             address: orderType === OrderType.DELIVERY ? deliveryAddress : null

          };

          const orderId = await createOrder(orderPayload);
          setActiveOrderId(orderId);
          clearCart();
          navigate('/tracking');
      } catch (error) {
          console.error(error);
          alert("Erro ao enviar pedido. Tente novamente.");
      } finally {
          setSubmitting(false);
      }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 md:bg-white md:flex-row md:max-w-4xl md:mx-auto md:gap-8 md:p-8">
        {/* Mobile Header */}
        <div className="bg-white p-4 shadow-sm flex items-center gap-4 md:hidden">
            <button onClick={() => navigate('/cart')}><ArrowLeft className="text-gray-600" /></button>
            <h1 className="font-bold text-lg text-gray-800">Confirmação</h1>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-4 md:p-0">
            
            <h2 className="text-2xl font-bold text-gray-800 hidden md:block mb-6">Revisar Pedido</h2>

            {/* Customer Info Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <h3 className="font-bold text-gray-500 flex items-center gap-2 uppercase text-xs tracking-wider">
                    <User size={16} /> Seus Dados
                </h3>
                <div className="text-sm text-gray-600 ml-6">
                    <p className="font-semibold text-gray-900">{currentUser.name}</p>
                    <p>{currentUser.phone}</p>
                </div>

                <div className="border-t border-gray-100 my-4"></div>

                <h3 className="font-bold text-gray-500 flex items-center gap-2 uppercase text-xs tracking-wider">
                    <MapPin size={16} /> Entrega
                </h3>
                <div className="ml-6">
                    {orderType === OrderType.DELIVERY && deliveryAddress ? (
                        <div className="text-sm text-gray-600">
                            <p className="font-semibold text-gray-900">{deliveryAddress.street}, {deliveryAddress.number}</p>
                            <p>{deliveryAddress.neighborhood} - {deliveryAddress.city}</p>
                            {deliveryAddress.reference && <p className="italic mt-1">Ref: {deliveryAddress.reference}</p>}
                        </div>
                    ) : (
                        <div className="bg-blue-50 text-primary p-3 rounded-lg text-sm font-bold inline-block">
                            Retirada no Balcão
                        </div>
                    )}
                </div>
            </div>

            {/* Items Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-3">Itens do Pedido</h3>
                {cartItems.map(item => (
                    <div key={item.tempId} className="flex justify-between text-sm py-2">
                        <div className="flex gap-3">
                             <span className="font-bold text-gray-900 w-6">{item.quantity}x</span>
                             <div className="flex flex-col">
                                 <span>{item.productNameSnapshot}</span>
                                 {item.observation && <span className="text-gray-400 text-xs italic">{item.observation}</span>}
                             </div>
                        </div>
                        <span className="font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.totalPrice)}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Summary / Action Column */}
        <div className="md:w-80 flex-shrink-0">
            <div className="p-4 bg-white border-t border-gray-200 md:border md:rounded-2xl md:shadow-xl md:p-6 md:sticky md:top-24">
                <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-gray-500 text-sm">
                        <span>Subtotal</span>
                        <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartSubtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 text-sm">
                        <span>Taxa</span>
                        <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(restaurant?.deliveryFeeBase || 0)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-xl pt-3 border-t text-gray-900">
                        <span>Total</span>
                        <span className="text-primary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}</span>
                    </div>
                </div>

                <button 
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg disabled:opacity-50 flex justify-center items-center gap-2"
                >
                    {submitting ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <>CONFIRMAR <CheckCircle size={18} /></>
                    )}
                </button>
                <p className="text-center text-xs text-gray-400 mt-4">
                    Ao confirmar, seu pedido será enviado para a cozinha imediatamente.
                </p>
            </div>
        </div>
    </div>
  );
};
