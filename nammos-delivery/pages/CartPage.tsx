import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { OrderType } from '../types';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';

export const CartPage: React.FC = () => {
  const { cartItems, updateCartQuantity, removeFromCart, cartSubtotal, cartTotal, orderType, restaurant } = useApp();
  const navigate = useNavigate();

  const deliveryFee = (orderType === OrderType.DELIVERY && restaurant) ? restaurant.deliveryFeeBase : 0;

  if (cartItems.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-full min-h-[60vh] p-6">
              <div className="bg-gray-100 p-6 rounded-full mb-4">
                  <Trash2 size={48} className="text-gray-400" />
              </div>
              <p className="text-gray-500 mb-6 text-lg">Seu carrinho está vazio.</p>
              <button onClick={() => navigate('/menu')} className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg">
                  Ver Cardápio
              </button>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 md:bg-white md:flex-row md:max-w-5xl md:mx-auto md:gap-8 md:p-8">
      
      {/* Header Mobile */}
      <div className="bg-white p-4 shadow-sm flex items-center gap-4 md:hidden">
          <button onClick={() => navigate('/menu')}><ArrowLeft className="text-gray-600" /></button>
          <h1 className="font-bold text-lg text-gray-800">Seu Carrinho</h1>
      </div>

      {/* Left Side: Items */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 md:p-0">
          <div className="hidden md:flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-2xl font-bold text-gray-800">Seu Carrinho</h2>
              <span className="bg-blue-50 text-primary px-2 py-1 rounded text-sm font-bold">{cartItems.length} itens</span>
          </div>

          {cartItems.map(item => (
              <div key={item.tempId} className="bg-white p-4 rounded-xl shadow-sm md:shadow-none md:border border-gray-100 flex gap-4 transition hover:border-primary/30">
                   <div className="flex-1">
                       <h4 className="font-bold text-gray-800 text-lg">{item.productNameSnapshot}</h4>
                       {item.observation && <p className="text-sm text-gray-500 mt-1 italic">"{item.observation}"</p>}
                       <p className="font-semibold mt-2 text-primary">
                           {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unitPrice * item.quantity)}
                       </p>
                   </div>
                   <div className="flex flex-col items-end justify-between gap-4">
                       <button onClick={() => removeFromCart(item.tempId)} className="text-gray-300 hover:text-red-500 p-1 transition"><Trash2 size={20}/></button>
                       <div className="flex items-center bg-gray-100 rounded-lg border border-gray-200">
                            <button onClick={() => updateCartQuantity(item.tempId, -1)} className="p-2 hover:bg-white rounded-l-lg transition text-gray-600"><Minus size={16}/></button>
                            <span className="w-8 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
                            <button onClick={() => updateCartQuantity(item.tempId, 1)} className="p-2 hover:bg-white rounded-r-lg transition text-gray-600"><Plus size={16}/></button>
                       </div>
                   </div>
              </div>
          ))}
      </div>

      {/* Right Side: Summary (Sticky on Desktop) */}
      <div className="md:w-96 flex-shrink-0">
        <div className="bg-white p-6 md:p-8 rounded-t-2xl md:rounded-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-xl md:border border-gray-100 md:sticky md:top-24">
            <h3 className="font-bold text-lg mb-4 hidden md:block text-gray-800">Resumo</h3>
            
            <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                    <span>Entrega ({orderType === OrderType.PICKUP ? 'Retirada' : 'Delivery'})</span>
                    <span className={deliveryFee === 0 ? 'text-green-600 font-bold' : ''}>
                        {deliveryFee === 0 ? 'Grátis' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(deliveryFee)}
                    </span>
                </div>
                <div className="flex justify-between font-bold text-xl pt-4 border-t border-gray-100">
                    <span className="text-gray-900">Total</span>
                    <span className="text-primary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}</span>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <button 
                    onClick={() => navigate('/checkout')}
                    className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition shadow-lg text-lg"
                >
                    FINALIZAR PEDIDO
                </button>
                <button onClick={() => navigate('/menu')} className="w-full text-gray-500 font-medium py-3 hover:text-primary transition">
                    Adicionar mais itens
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};