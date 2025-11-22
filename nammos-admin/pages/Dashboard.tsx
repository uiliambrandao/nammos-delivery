import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Order, Product } from '../types';
import { TrendingUp, Users, DollarSign, ShoppingBag, ArrowUpRight, Calendar, Activity } from 'lucide-react';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  activeClients: number;
  averageTicket: number;
  todayRevenue: number;
  todayOrders: number;
}

interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    activeClients: 0,
    averageTicket: 0,
    todayRevenue: 0,
    todayOrders: 0,
  });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Orders
        const ordersSnap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
        const orders = ordersSnap.docs.map(d => d.data() as Order);

        // 2. Fetch Users
        const usersSnap = await getDocs(collection(db, 'users'));
        const totalUsers = usersSnap.size;

        // Calculations
        let revenue = 0;
        let count = 0;
        let todayRev = 0;
        let todayCount = 0;
        const productMap: Record<string, TopProduct> = {};
        const statusCount: Record<string, number> = {
            pending: 0, accepted: 0, in_kitchen: 0, out_for_delivery: 0, delivered: 0, cancelled: 0
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        orders.forEach(order => {
          // Global Stats (excluding cancelled for revenue)
          if (order.status !== 'cancelled') {
            revenue += order.total;
          }
          
          // Count all orders for volume metrics
          count++;
          
          // Status Distribution
          if (statusCount[order.status] !== undefined) {
            statusCount[order.status]++;
          }

          // Today Stats
          if (order.createdAt) {
            const orderDate = (order.createdAt as Timestamp).toDate();
            orderDate.setHours(0,0,0,0);
            if (orderDate.getTime() === today.getTime()) {
                if (order.status !== 'cancelled') todayRev += order.total;
                todayCount++;
            }
          }

          // Top Products Logic
          if (order.status !== 'cancelled') {
            order.items.forEach(item => {
                if (!productMap[item.name]) {
                    productMap[item.name] = { name: item.name, quantity: 0, revenue: 0 };
                }
                productMap[item.name].quantity += item.quantity;
                productMap[item.name].revenue += (item.price * item.quantity);
            });
          }
        });

        // Sort Top Products
        const sortedProducts = Object.values(productMap)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        setStats({
          totalRevenue: revenue,
          totalOrders: count,
          activeClients: totalUsers,
          averageTicket: count > 0 ? revenue / (count - statusCount.cancelled) : 0, // Avg ticket based on valid orders
          todayRevenue: todayRev,
          todayOrders: todayCount
        });
        setTopProducts(sortedProducts);
        setOrdersByStatus(statusCount);
        setLoading(false);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (loading) return <div className="flex items-center justify-center h-screen text-brand-primary font-bold animate-pulse">Carregando Dashboard...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
            <h2 className="text-3xl font-bold text-brand-text">Dashboard Gerencial</h2>
            <p className="text-brand-textLight text-sm">Visão geral de desempenho e resultados</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-soft border border-gray-100 flex items-center text-sm font-medium text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-brand-primary" />
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="bg-white p-6 rounded-2xl shadow-card border border-transparent hover:border-brand-primary/20 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-brand-primary/10 rounded-xl text-brand-primary">
                    <DollarSign size={24} />
                </div>
                <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <ArrowUpRight size={12} className="mr-1" /> Hoje: {formatCurrency(stats.todayRevenue)}
                </span>
            </div>
            <h3 className="text-brand-textLight text-sm font-medium mb-1">Faturamento Total</h3>
            <p className="text-2xl font-bold text-brand-text">{formatCurrency(stats.totalRevenue)}</p>
        </div>

        {/* Orders */}
        <div className="bg-white p-6 rounded-2xl shadow-card border border-transparent hover:border-brand-primary/20 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                    <ShoppingBag size={24} />
                </div>
                <span className="flex items-center text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-full">
                     Hoje: {stats.todayOrders}
                </span>
            </div>
            <h3 className="text-brand-textLight text-sm font-medium mb-1">Total de Pedidos</h3>
            <p className="text-2xl font-bold text-brand-text">{stats.totalOrders}</p>
        </div>

        {/* Clients */}
        <div className="bg-white p-6 rounded-2xl shadow-card border border-transparent hover:border-brand-primary/20 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                    <Users size={24} />
                </div>
            </div>
            <h3 className="text-brand-textLight text-sm font-medium mb-1">Base de Clientes</h3>
            <p className="text-2xl font-bold text-brand-text">{stats.activeClients}</p>
        </div>

        {/* Ticket Average */}
        <div className="bg-white p-6 rounded-2xl shadow-card border border-transparent hover:border-brand-primary/20 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                    <TrendingUp size={24} />
                </div>
            </div>
            <h3 className="text-brand-textLight text-sm font-medium mb-1">Ticket Médio</h3>
            <p className="text-2xl font-bold text-brand-text">{formatCurrency(stats.averageTicket)}</p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Top Products */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-brand-text flex items-center gap-2">
                    <Activity size={20} className="text-brand-primary" /> Produtos Mais Vendidos
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                            <th className="pb-3 font-semibold">Produto</th>
                            <th className="pb-3 font-semibold text-center">Qtd. Vendida</th>
                            <th className="pb-3 font-semibold text-right">Receita Gerada</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {topProducts.map((prod, idx) => (
                            <tr key={idx} className="group hover:bg-gray-50 transition-colors">
                                <td className="py-4">
                                    <div className="flex items-center">
                                        <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center mr-3">
                                            {idx + 1}
                                        </span>
                                        <span className="font-medium text-gray-800">{prod.name}</span>
                                    </div>
                                </td>
                                <td className="py-4 text-center">
                                    <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary rounded-md text-xs font-bold">
                                        {prod.quantity} un
                                    </span>
                                </td>
                                <td className="py-4 text-right font-medium text-gray-600">
                                    {formatCurrency(prod.revenue)}
                                </td>
                            </tr>
                        ))}
                        {topProducts.length === 0 && (
                            <tr>
                                <td colSpan={3} className="py-8 text-center text-gray-400">Nenhum dado de vendas ainda.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Status Breakdown Chart (Visual Only) */}
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 flex flex-col">
            <h3 className="font-bold text-lg text-brand-text mb-6">Status dos Pedidos</h3>
            
            <div className="flex-1 flex flex-col justify-center gap-4">
                {[
                    { label: 'Entregues', key: 'delivered', color: 'bg-green-500', bg: 'bg-green-100' },
                    { label: 'Cancelados', key: 'cancelled', color: 'bg-red-500', bg: 'bg-red-100' },
                    { label: 'Em Processo', key: 'process', color: 'bg-brand-primary', bg: 'bg-brand-primary/20' } // Aggregate active
                ].map((item) => {
                    const count = item.key === 'process' 
                        ? (ordersByStatus.pending + ordersByStatus.accepted + ordersByStatus.in_kitchen + ordersByStatus.out_for_delivery) 
                        : (ordersByStatus[item.key] || 0);
                    
                    const percentage = stats.totalOrders > 0 ? Math.round((count / stats.totalOrders) * 100) : 0;

                    return (
                        <div key={item.label}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-600">{item.label}</span>
                                <span className="font-bold text-gray-800">{count} ({percentage}%)</span>
                            </div>
                            <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                                <div 
                                    className={`h-full rounded-full ${item.color} transition-all duration-1000 ease-out`} 
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 leading-relaxed">
                    <strong className="text-gray-700">Dica:</strong> Mantenha a taxa de cancelamento abaixo de 5% para garantir a saúde financeira da operação.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;