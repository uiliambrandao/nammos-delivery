import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkUserByPhone, createUser } from '../services/firebase';
import { useApp } from '../context/AppContext';
import { Utensils, ArrowRight } from 'lucide-react';

export const WelcomePage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { setCurrentUser } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    
    setLoading(true);
    try {
      let user = await checkUserByPhone(phone);
      if (!user) {
        user = await createUser(name, phone);
      }
      setCurrentUser(user);
      navigate('/mode');
    } catch (error) {
      alert('Erro ao identificar usuário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Desktop Hero Section */}
      <div className="hidden md:flex md:w-1/2 bg-primary items-center justify-center relative overflow-hidden">
         <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1500&q=80')] bg-cover bg-center mix-blend-overlay"></div>
         <div className="relative z-10 text-center p-12">
            <div className="bg-white w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <Utensils className="text-primary w-16 h-16" />
            </div>
            <h1 className="text-5xl font-extrabold text-white mb-4 drop-shadow-lg">NAMMOS</h1>
            <h2 className="text-2xl font-light text-white tracking-[0.5em]">DELIVERY</h2>
            <p className="mt-8 text-blue-100 max-w-md mx-auto font-medium">
              O melhor burger da cidade, agora a um clique de distância. Peça já o seu.
            </p>
         </div>
      </div>

      {/* Mobile Header / Form Section */}
      <div className="md:w-1/2 flex flex-col bg-white text-slate-900 h-full overflow-y-auto relative">
        
        {/* Mobile Only Header */}
        <div className="md:hidden text-center pt-12 mb-8 px-8 bg-primary pb-12 rounded-b-[3rem] shadow-lg text-white">
          <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
            <Utensils className="text-primary w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold mb-2">NAMMOS</h1>
          <h2 className="text-xl font-light tracking-widest opacity-90">DELIVERY</h2>
        </div>

        <div className="flex-grow flex flex-col justify-center p-8 max-w-md mx-auto w-full -mt-8 md:mt-0 relative z-10">
          <div className="bg-white md:border md:border-gray-100 p-8 rounded-2xl shadow-xl md:shadow-none">
            <h3 className="text-2xl font-bold mb-2 text-center md:text-left hidden md:block text-primary">Bem-vindo!</h3>
            <p className="text-center md:text-left mb-8 text-gray-500">
              Para começar, como podemos te chamar?
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Seu Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                  placeholder="Ex: João Silva"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Celular</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                  placeholder="Ex: 11999999999"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-5 rounded-xl mt-4 hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? 'Carregando...' : 'CONTINUAR'} <ArrowRight size={20} />
              </button>
            </form>
          </div>
        </div>
        
        <div className="md:hidden p-6 text-center text-gray-400 text-xs">
          &copy; 2024 Nammos Burgers
        </div>
      </div>
    </div>
  );
};