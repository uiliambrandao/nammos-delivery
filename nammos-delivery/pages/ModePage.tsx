import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { OrderType, Address } from '../types';
import { Bike, Store, ArrowLeft } from 'lucide-react';

export const ModePage: React.FC = () => {
  const { setOrderType, setDeliveryAddress } = useApp();
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<OrderType | null>(null);
  
  // Address State
  const [address, setAddress] = useState<Address>({
    street: '', number: '', neighborhood: '', city: '', zipCode: '', reference: ''
  });

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleContinue = () => {
    if (!selectedMode) return;
    
    setOrderType(selectedMode);
    if (selectedMode === OrderType.DELIVERY) {
       // Basic validation
       if (!address.street || !address.number || !address.neighborhood) {
         alert("Preencha os campos obrigatórios do endereço.");
         return;
       }
       setDeliveryAddress(address);
    }
    navigate('/menu');
  };

  return (
    <div className="flex-grow flex flex-col p-6 md:p-12 md:max-w-3xl md:mx-auto w-full">
      <button onClick={() => navigate(-1)} className="self-start mb-6 md:hidden text-gray-500">
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="text-center md:text-left mb-8">
        <h2 className="text-3xl font-bold mb-3 text-gray-800">Como deseja receber?</h2>
        <p className="text-gray-500">Escolha a forma de entrega do seu pedido para continuarmos.</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <button
          onClick={() => setSelectedMode(OrderType.DELIVERY)}
          className={`p-6 md:p-10 rounded-2xl border-2 flex flex-col items-center justify-center gap-4 transition hover:shadow-md ${
            selectedMode === OrderType.DELIVERY 
              ? 'border-primary bg-blue-50 ring-2 ring-primary ring-offset-2' 
              : 'border-gray-100 bg-white hover:border-primary/50'
          }`}
        >
          <div className={`p-4 rounded-full transition ${selectedMode === OrderType.DELIVERY ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
            <Bike size={40} />
          </div>
          <span className={`font-bold text-lg ${selectedMode === OrderType.DELIVERY ? 'text-primary' : 'text-gray-600'}`}>Delivery</span>
        </button>

        <button
          onClick={() => setSelectedMode(OrderType.PICKUP)}
          className={`p-6 md:p-10 rounded-2xl border-2 flex flex-col items-center justify-center gap-4 transition hover:shadow-md ${
            selectedMode === OrderType.PICKUP 
              ? 'border-primary bg-blue-50 ring-2 ring-primary ring-offset-2' 
              : 'border-gray-100 bg-white hover:border-primary/50'
          }`}
        >
          <div className={`p-4 rounded-full transition ${selectedMode === OrderType.PICKUP ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
            <Store size={40} />
          </div>
          <span className={`font-bold text-lg ${selectedMode === OrderType.PICKUP ? 'text-primary' : 'text-gray-600'}`}>Retirada</span>
        </button>
      </div>

      {selectedMode === OrderType.DELIVERY && (
        <div className="flex-grow md:flex-grow-0 animate-fade-in bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-800">
            <span className="w-2 h-6 bg-primary rounded-full block"></span>
            Endereço de Entrega
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
                <input name="zipCode" placeholder="CEP" value={address.zipCode} onChange={handleAddressChange} className="col-span-1 bg-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary border border-gray-200 transition" />
                <input name="city" placeholder="Cidade" value={address.city} onChange={handleAddressChange} className="col-span-2 bg-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary border border-gray-200 transition" />
            </div>
            <div className="grid grid-cols-4 gap-4">
                <input name="street" placeholder="Rua" value={address.street} onChange={handleAddressChange} className="col-span-3 bg-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary border border-gray-200 transition" />
                <input name="number" placeholder="Nº" value={address.number} onChange={handleAddressChange} className="col-span-1 bg-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary border border-gray-200 transition" />
            </div>
            <input name="neighborhood" placeholder="Bairro" value={address.neighborhood} onChange={handleAddressChange} className="w-full bg-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary border border-gray-200 transition" />
            <input name="reference" placeholder="Ponto de referência (opcional)" value={address.reference} onChange={handleAddressChange} className="w-full bg-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary border border-gray-200 transition" />
          </div>
        </div>
      )}

      <div className="mt-auto pt-8 md:mt-8">
        <button
          onClick={handleContinue}
          disabled={!selectedMode}
          className="w-full bg-primary text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition shadow-lg"
        >
          IR PARA O CARDÁPIO
        </button>
      </div>
    </div>
  );
};