import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Grid, Store, LogOut, ChevronRight, ClipboardList, Users, Megaphone } from 'lucide-react';

const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Gestão de Pedidos', path: '/orders', icon: ClipboardList },
    { name: 'CRM & Clientes', path: '/crm', icon: Users },
    { name: 'Marketing', path: '/marketing', icon: Megaphone },
    { name: 'Produtos', path: '/products', icon: ShoppingBag },
    { name: 'Categorias', path: '/categories', icon: Grid },
    { name: 'Minha Loja', path: '/settings', icon: Store },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 bg-white w-64 z-40 flex flex-col border-r border-gray-100 shadow-soft transition-transform transform -translate-x-full md:translate-x-0">
      <div className="flex flex-col items-center justify-center h-28 border-b border-gray-50">
        <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center mb-2 shadow-lg shadow-brand-primary/30">
            <span className="text-white font-bold text-xl">N</span>
        </div>
        <h1 className="text-xl font-bold text-brand-text tracking-tight">NAMMOS</h1>
      </div>
      
      <nav className="flex-1 px-4 py-8 space-y-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `group flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25'
                  : 'text-brand-textLight hover:bg-gray-50 hover:text-brand-primary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center">
                  <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-brand-primary'}`} />
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-white opacity-80" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-gray-50">
        <button className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-brand-textLight hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors group">
          <LogOut className="w-4 h-4 mr-2 group-hover:text-red-500 transition-colors" />
          Sair
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;