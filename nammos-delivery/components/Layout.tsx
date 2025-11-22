import React from 'react';
import { useApp } from '../context/AppContext';
import { Utensils, ShoppingBag, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, cartItems } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // Simple logout by reloading (clears state in this implementation)
    window.location.href = '/';
  };

  const isWelcomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Desktop Header */}
      {!isWelcomePage && (
        <header className="hidden md:flex bg-white text-gray-800 py-4 px-8 justify-between items-center shadow-sm sticky top-0 z-50 border-b border-gray-100">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/menu')}>
             <div className="bg-primary w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md">
                <Utensils size={20} />
             </div>
             <div>
               <h1 className="font-bold text-xl text-primary leading-none">NAMMOS</h1>
               <span className="text-xs tracking-widest text-gray-400">DELIVERY</span>
             </div>
          </div>

          <div className="flex items-center gap-6">
             {currentUser && (
               <div className="flex items-center gap-2">
                 <span className="text-sm text-gray-500">Olá, <span className="font-bold text-primary">{currentUser.name}</span></span>
               </div>
             )}
             
             <button 
                onClick={() => navigate('/cart')}
                className="relative p-2 hover:bg-gray-100 rounded-full transition text-primary"
             >
                <ShoppingBag />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {cartItems.reduce((a, b) => a + b.quantity, 0)}
                  </span>
                )}
             </button>

             {currentUser && (
               <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition" title="Sair">
                 <LogOut size={20} />
               </button>
             )}
          </div>
        </header>
      )}

      {/* Main Content - Responsive Container */}
      <main className={`flex-grow w-full mx-auto bg-white shadow-xl min-h-screen relative flex flex-col ${
        isWelcomePage ? 'max-w-full' : 'md:max-w-6xl md:my-6 md:min-h-[calc(100vh-3rem)] md:rounded-2xl overflow-hidden'
      }`}>
        {children}
      </main>
    </div>
  );
};