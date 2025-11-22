import React, { useEffect, useState } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Order, User } from '../types';
import { Users, Award, TrendingDown, Zap, Search, ArrowUpRight } from 'lucide-react';

interface CustomerRFM {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastOrderDate: Date | null;
  totalOrders: number;
  totalSpent: number;
  daysSinceLastOrder: number;
  segment: 'champion' | 'loyal' | 'new' | 'at_risk' | 'lost';
}

const CRM: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerRFM[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Users and Orders
        const [usersSnap, ordersSnap] = await Promise.all([
            getDocs(collection(db, 'users')),
            getDocs(collection(db, 'orders'))
        ]);

        const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as User));
        const orders = ordersSnap.docs.map(d => d.data() as Order);

        // 2. Calculate RFM
        const now = new Date();
        const customerMap: Record<string, CustomerRFM> = {};

        // Initialize with users
        users.forEach(u => {
            customerMap[u.id] = {
                id: u.id,
                name: u.name || 'Sem Nome',
                email: u.email || '-',
                phone: u.phoneNumber || '-',
                lastOrderDate: null,
                totalOrders: 0,
                totalSpent: 0,
                daysSinceLastOrder: 999,
                segment: 'new' // Default
            };
        });

        // Process Orders
        orders.forEach(order => {
            if (order.status === 'cancelled') return;
            if (!customerMap[order.userId]) return; // Skip if user deleted or not found

            const c = customerMap[order.userId];
            c.totalOrders += 1;
            c.totalSpent += order.total;

            const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
            if (!c.lastOrderDate || orderDate > c.lastOrderDate) {
                c.lastOrderDate = orderDate;
            }
        });

        // Classify Segments
        const processedCustomers = Object.values(customerMap).map(c => {
            if (c.lastOrderDate) {
                const diffTime = Math.abs(now.getTime() - c.lastOrderDate.getTime());
                c.daysSinceLastOrder = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            }

            // Logic RFV Simplificada
            // R: Recência (dias), F: Frequência (pedidos), V: Valor (Gasto)
            
            if (c.totalOrders === 0) {
                c.segment = 'new'; // Lead
            } else if (c.totalOrders >= 5 && c.daysSinceLastOrder <= 30) {
                c.segment = 'champion'; // VIP
            } else if (c.totalOrders >= 2 && c.daysSinceLastOrder <= 45) {
                c.segment = 'loyal'; // Fiel
            } else if (c.daysSinceLastOrder <= 15 && c.totalOrders === 1) {
                c.segment = 'new'; // Novo Comprador
            } else if (c.daysSinceLastOrder > 30 && c.daysSinceLastOrder <= 90) {
                c.segment = 'at_risk'; // Risco
            } else {
                c.segment = 'lost'; // Perdido
            }

            return c;
        }).filter(c => c.totalOrders > 0); // Show only active customers for now

        setCustomers(processedCustomers.sort((a, b) => b.totalSpent - a.totalSpent));
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const segmentsConfig = {
      champion: { label: 'Campeões', color: 'text-purple-600', bg: 'bg-purple-50', icon: Award, desc: 'Compram muito e com frequência.' },
      loyal: { label: 'Fiéis', color: 'text-blue-600', bg: 'bg-blue-50', icon: Users, desc: 'Clientes regulares.' },
      new: { label: 'Novos', color: 'text-green-600', bg: 'bg-green-50', icon: Zap, desc: 'Primeira compra recente.' },
      at_risk: { label: 'Em Risco', color: 'text-orange-600', bg: 'bg-orange-50', icon: TrendingDown, desc: 'Não compram há mais de 30 dias.' },
      lost: { label: 'Perdidos', color: 'text-gray-500', bg: 'bg-gray-100', icon: TrendingDown, desc: '+90 dias sem comprar.' },
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  // Metrics
  const totalLTV = customers.reduce((acc, curr) => acc + curr.totalSpent, 0);
  const avgLTV = customers.length ? totalLTV / customers.length : 0;

  if (loading) return <div className="flex h-screen items-center justify-center text-brand-primary font-bold">Analisando base de clientes...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
            <h2 className="text-3xl font-bold text-brand-text">CRM & Inteligência</h2>
            <p className="text-brand-textLight">Análise RFV (Recência, Frequência e Valor) automatizada.</p>
        </div>
        
        {/* Metrics */}
        <div className="flex gap-4">
            <div className="bg-white px-6 py-3 rounded-2xl shadow-soft border border-gray-100">
                <p className="text-xs text-gray-500 font-bold uppercase">Total Clientes</p>
                <p className="text-xl font-bold text-brand-text">{customers.length}</p>
            </div>
            <div className="bg-white px-6 py-3 rounded-2xl shadow-soft border border-gray-100">
                <p className="text-xs text-gray-500 font-bold uppercase">LTV Médio</p>
                <p className="text-xl font-bold text-brand-primary">{formatCurrency(avgLTV)}</p>
            </div>
        </div>
      </div>

      {/* Segment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {(Object.keys(segmentsConfig) as Array<keyof typeof segmentsConfig>).map(key => {
              const conf = segmentsConfig[key];
              const count = customers.filter(c => c.segment === key).length;
              return (
                  <div key={key} className={`p-5 rounded-2xl border transition-all hover:shadow-lg ${conf.bg} border-transparent hover:scale-105`}>
                      <div className="flex justify-between items-start mb-2">
                          <conf.icon className={`w-6 h-6 ${conf.color}`} />
                          <span className={`text-xl font-bold ${conf.color}`}>{count}</span>
                      </div>
                      <h3 className={`font-bold ${conf.color}`}>{conf.label}</h3>
                      <p className="text-xs text-gray-500 mt-1 leading-tight opacity-80">{conf.desc}</p>
                  </div>
              );
          })}
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between gap-4">
              <h3 className="text-lg font-bold text-brand-text">Melhores Clientes (Ranking LTV)</h3>
              <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                      type="text"
                      placeholder="Buscar cliente..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-primary bg-gray-50 focus:bg-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
          </div>
          
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-gray-50">
                      <tr className="text-xs text-gray-400 uppercase font-semibold">
                          <th className="px-6 py-4">Cliente</th>
                          <th className="px-6 py-4">Segmento</th>
                          <th className="px-6 py-4 text-center">Pedidos</th>
                          <th className="px-6 py-4 text-center">Última Compra</th>
                          <th className="px-6 py-4 text-right">Total Gasto (LTV)</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                      {filteredCustomers.map((customer) => (
                          <tr key={customer.id} className="hover:bg-gray-50/80 transition-colors group">
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary font-bold flex items-center justify-center text-xs">
                                          {customer.name.charAt(0)}
                                      </div>
                                      <div>
                                          <p className="font-bold text-sm text-gray-800">{customer.name}</p>
                                          <p className="text-xs text-gray-400">{customer.phone}</p>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-6 py-4">
                                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${segmentsConfig[customer.segment].bg} ${segmentsConfig[customer.segment].color}`}>
                                      {segmentsConfig[customer.segment].label}
                                  </span>
                              </td>
                              <td className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                                  {customer.totalOrders}
                              </td>
                              <td className="px-6 py-4 text-center text-sm text-gray-500">
                                  {customer.daysSinceLastOrder} dias atrás
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <div className="font-bold text-brand-text">{formatCurrency(customer.totalSpent)}</div>
                                  <div className="text-xs text-gray-400">Ticket Médio: {formatCurrency(customer.totalSpent / customer.totalOrders)}</div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};

export default CRM;