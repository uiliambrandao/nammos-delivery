
import React, { useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Restaurant, RestaurantAddress, RestaurantIntegrations } from '../types';
import { Store, Save, MapPin, Image as ImageIcon, LayoutGrid, Puzzle, MessageCircle, CreditCard, Utensils, Check, Smartphone, Clock, DollarSign, Mail, Phone, FileText } from 'lucide-react';
import { useToast } from '../components/Toast';

type TabType = 'general' | 'integrations';

const Settings: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [docId, setDocId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const defaultAddress: RestaurantAddress = {
    street: '', number: '', neighborhood: '', city: '', state: '', zipCode: ''
  };
  const defaultIntegrations: RestaurantIntegrations = {
    ifood: false, whatsapp: false, stripe: false
  };

  useEffect(() => {
    const fetchRestaurant = async () => {
        const q = query(collection(db, 'restaurants'), where('slug', '==', 'nammos-burgers'));
        const snap = await getDocs(q);
        if (!snap.empty) {
            const d = snap.docs[0];
            setDocId(d.id);
            const data = d.data();
            setRestaurant({ 
                id: d.id, 
                ...data,
                address: data.address || defaultAddress,
                integrations: data.integrations || defaultIntegrations
            } as Restaurant);
            setLoading(false);
        } else {
            setLoading(false);
        }
    };
    fetchRestaurant();
  }, []);

  useEffect(() => {
    if (!docId) return;
    const unsub = onSnapshot(doc(db, 'restaurants', docId), (d) => {
        if(d.exists()) {
            const data = d.data();
            if (!saving) {
                setRestaurant(prev => ({ 
                    id: d.id, 
                    ...data,
                    address: data.address || (prev?.address || defaultAddress),
                    integrations: data.integrations || (prev?.integrations || defaultIntegrations)
                } as Restaurant));
            }
        }
    });
    return () => unsub();
  }, [docId]);

  const handleSave = async (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    if (!docId || !restaurant) return;
    setSaving(true);
    try {
        const { id, ...data } = restaurant;
        await updateDoc(doc(db, 'restaurants', docId), data as any);
        showToast('Informações da loja atualizadas!', 'success');
    } catch (error) {
        console.error(error);
        showToast('Erro ao atualizar.', 'error');
    } finally {
        setSaving(false);
    }
  };

  const updateAddress = (field: keyof RestaurantAddress, value: string) => {
    if (!restaurant) return;
    setRestaurant({
        ...restaurant,
        address: { ...restaurant.address!, [field]: value }
    });
  };

  const toggleIntegration = (key: keyof RestaurantIntegrations) => {
      if (!restaurant) return;
      const newIntegrations = { ...restaurant.integrations!, [key]: !restaurant.integrations![key] };
      setRestaurant({ ...restaurant, integrations: newIntegrations });
  };

  if (loading) return <div className="flex h-64 items-center justify-center text-brand-primary font-bold animate-pulse">Carregando Minha Loja...</div>;
  if (!restaurant) return <div>Loja não encontrada.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      
      {/* Page Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
            <h2 className="text-3xl font-bold text-brand-text">Minha Loja</h2>
            <p className="text-brand-textLight">Gerencie a aparência e as configurações vitais do seu negócio.</p>
        </div>
        
        <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm inline-flex">
            <button 
                onClick={() => setActiveTab('general')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'general' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <LayoutGrid size={18} /> Perfil & Dados
            </button>
            <button 
                onClick={() => setActiveTab('integrations')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'integrations' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <Puzzle size={18} /> Integrações
            </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="relative animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {activeTab === 'general' && (
            <div className="space-y-8">
                
                {/* HERO SECTION (Cover + Logo + Status) */}
                <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden relative group">
                    {/* Cover Image */}
                    <div className="h-48 bg-gray-200 w-full relative overflow-hidden">
                        {restaurant.coverUrl ? (
                            <img src={restaurant.coverUrl} alt="Capa" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-r from-brand-primary/20 to-purple-100 flex items-center justify-center">
                                <ImageIcon className="text-brand-primary/30 w-16 h-16" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <span className="bg-black/50 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm">
                                Editar Capa na URL abaixo
                            </span>
                        </div>
                    </div>

                    <div className="px-8 pb-8 pt-0 relative flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                        
                        {/* Logo & Name Container */}
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-12 relative z-10">
                            <div className="w-32 h-32 rounded-full bg-white p-1 shadow-xl">
                                <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden border-2 border-gray-100 relative group/logo">
                                    {restaurant.logoUrl ? (
                                        <img src={restaurant.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-brand-primary text-white font-bold text-3xl">
                                            {restaurant.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="text-center md:text-left mb-2">
                                <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
                                <p className="text-gray-500 text-sm flex items-center justify-center md:justify-start gap-1">
                                    <MapPin size={14} /> {restaurant.address?.city || 'Localização não definida'} - {restaurant.address?.state}
                                </p>
                            </div>
                        </div>

                        {/* Status Toggle */}
                        <div className="mb-2 flex flex-col items-end">
                             <label className={`flex items-center gap-3 px-5 py-2.5 rounded-full border transition-all cursor-pointer shadow-sm ${restaurant.isOpen ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <div className="flex flex-col text-right mr-1">
                                    <span className={`text-xs font-bold uppercase tracking-wide ${restaurant.isOpen ? 'text-green-700' : 'text-red-700'}`}>
                                        {restaurant.isOpen ? 'Loja Aberta' : 'Loja Fechada'}
                                    </span>
                                </div>
                                <div className="relative inline-flex items-center">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={restaurant.isOpen}
                                        onChange={e => setRestaurant({...restaurant, isOpen: e.target.checked})}
                                    />
                                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* LEFT COLUMN: Visuals & Contact */}
                    <div className="space-y-6">
                        
                        {/* Images Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <ImageIcon size={18} className="text-brand-primary" /> Imagens da Marca
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">URL da Logo</label>
                                    <input 
                                        type="url" 
                                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-brand-primary outline-none"
                                        value={restaurant.logoUrl || ''}
                                        onChange={e => setRestaurant({...restaurant, logoUrl: e.target.value})}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">URL da Capa (Banner)</label>
                                    <input 
                                        type="url" 
                                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-brand-primary outline-none"
                                        value={restaurant.coverUrl || ''}
                                        onChange={e => setRestaurant({...restaurant, coverUrl: e.target.value})}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* App Preview Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                             <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Smartphone size={18} className="text-brand-primary" /> Preview no App
                            </h3>
                            <div className="bg-gray-100 rounded-xl p-4 flex items-start gap-3">
                                <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 overflow-hidden shrink-0">
                                    {restaurant.logoUrl ? <img src={restaurant.logoUrl} className="w-full h-full object-cover" /> : <div className="bg-brand-primary w-full h-full"/>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 text-sm truncate">{restaurant.name}</h4>
                                    <p className="text-xs text-gray-500 truncate">{restaurant.description || 'Melhores burgers da cidade!'}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded flex items-center gap-1 text-gray-600">
                                            <Clock size={8} /> {restaurant.prepTimeMinutesAvg} min
                                        </span>
                                        <span className="text-[10px] text-green-600 font-bold">
                                            {restaurant.deliveryFeeBase === 0 ? 'Entrega Grátis' : `R$ ${restaurant.deliveryFeeBase.toFixed(2)}`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-center text-xs text-gray-400 mt-3">Simulação de visualização na listagem</p>
                        </div>

                    </div>

                    {/* CENTER/RIGHT COLUMN: Info Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Basic Info */}
                        <div className="bg-white p-8 rounded-2xl shadow-soft border border-gray-100">
                             <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-50">
                                <Store size={20} className="text-brand-primary" /> Informações Básicas
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nome da Loja</label>
                                    <input 
                                        type="text"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary outline-none bg-gray-50 focus:bg-white transition-colors"
                                        value={restaurant.name}
                                        onChange={e => setRestaurant({...restaurant, name: e.target.value})}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição / Bio</label>
                                    <textarea 
                                        rows={3}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary outline-none bg-gray-50 focus:bg-white transition-colors resize-none"
                                        value={restaurant.description || ''}
                                        onChange={e => setRestaurant({...restaurant, description: e.target.value})}
                                        placeholder="Ex: A melhor hamburgueria artesanal da zona sul..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><Phone size={14}/> Telefone / WhatsApp</label>
                                    <input 
                                        type="text"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary outline-none bg-gray-50 focus:bg-white transition-colors"
                                        value={restaurant.phoneNumber || ''}
                                        onChange={e => setRestaurant({...restaurant, phoneNumber: e.target.value})}
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><Mail size={14}/> E-mail de Contato</label>
                                    <input 
                                        type="email"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary outline-none bg-gray-50 focus:bg-white transition-colors"
                                        value={restaurant.email || ''}
                                        onChange={e => setRestaurant({...restaurant, email: e.target.value})}
                                        placeholder="contato@nammos.com"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="bg-white p-8 rounded-2xl shadow-soft border border-gray-100">
                            <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-50">
                                <MapPin size={20} className="text-brand-primary" /> Endereço & Localização
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">CEP</label>
                                    <input 
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-brand-primary"
                                        value={restaurant.address?.zipCode}
                                        onChange={e => updateAddress('zipCode', e.target.value)}
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Rua</label>
                                    <input 
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-brand-primary"
                                        value={restaurant.address?.street}
                                        onChange={e => updateAddress('street', e.target.value)}
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Número</label>
                                    <input 
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-brand-primary"
                                        value={restaurant.address?.number}
                                        onChange={e => updateAddress('number', e.target.value)}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bairro</label>
                                    <input 
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-brand-primary"
                                        value={restaurant.address?.neighborhood}
                                        onChange={e => updateAddress('neighborhood', e.target.value)}
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cidade/UF</label>
                                    <input 
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-brand-primary"
                                        value={restaurant.address?.city}
                                        onChange={e => updateAddress('city', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Operation */}
                        <div className="bg-white p-8 rounded-2xl shadow-soft border border-gray-100">
                            <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-50">
                                <DollarSign size={20} className="text-brand-primary" /> Operacional
                            </h3>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tempo (min)</label>
                                    <div className="relative">
                                        <Clock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                                        <input 
                                            type="number"
                                            className="w-full pl-10 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary outline-none transition-colors"
                                            value={restaurant.prepTimeMinutesAvg}
                                            onChange={e => setRestaurant({...restaurant, prepTimeMinutesAvg: parseInt(e.target.value)})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Taxa Entrega (R$)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">R$</span>
                                        <input 
                                            type="number"
                                            step="0.10"
                                            className="w-full pl-10 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary outline-none transition-colors"
                                            value={restaurant.deliveryFeeBase}
                                            onChange={e => setRestaurant({...restaurant, deliveryFeeBase: parseFloat(e.target.value)})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pedido Mínimo (R$)</label>
                                     <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">R$</span>
                                        <input 
                                            type="number"
                                            step="1.00"
                                            className="w-full pl-10 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary outline-none transition-colors"
                                            value={restaurant.minOrderValue}
                                            onChange={e => setRestaurant({...restaurant, minOrderValue: parseFloat(e.target.value)})}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        )}

        {/* TAB: INTEGRATIONS */}
        {activeTab === 'integrations' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                {/* iFood */}
                <div className={`p-6 rounded-2xl border transition-all duration-300 ${restaurant.integrations?.ifood ? 'bg-red-50 border-red-200 shadow-md' : 'bg-white border-gray-100 shadow-soft'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl ${restaurant.integrations?.ifood ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                <Utensils size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">iFood</h3>
                                <p className="text-xs text-gray-500">Marketplace</p>
                            </div>
                        </div>
                        <button 
                            type="button"
                            onClick={() => toggleIntegration('ifood')}
                            className={`w-12 h-6 rounded-full transition-colors relative ${restaurant.integrations?.ifood ? 'bg-red-500' : 'bg-gray-200'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm absolute top-1 transition-transform ${restaurant.integrations?.ifood ? 'left-7' : 'left-1'}`}></div>
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Centralize seus pedidos do iFood no painel Nammos.</p>
                    {restaurant.integrations?.ifood && <div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-100/50 px-3 py-1.5 rounded-lg w-fit"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> Conectado</div>}
                </div>

                {/* WhatsApp */}
                <div className={`p-6 rounded-2xl border transition-all duration-300 ${restaurant.integrations?.whatsapp ? 'bg-green-50 border-green-200 shadow-md' : 'bg-white border-gray-100 shadow-soft'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl ${restaurant.integrations?.whatsapp ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                <MessageCircle size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">WhatsApp</h3>
                                <p className="text-xs text-gray-500">Automação</p>
                            </div>
                        </div>
                        <button 
                            type="button"
                            onClick={() => toggleIntegration('whatsapp')}
                            className={`w-12 h-6 rounded-full transition-colors relative ${restaurant.integrations?.whatsapp ? 'bg-green-500' : 'bg-gray-200'}`}
                        >
                             <div className={`w-4 h-4 bg-white rounded-full shadow-sm absolute top-1 transition-transform ${restaurant.integrations?.whatsapp ? 'left-7' : 'left-1'}`}></div>
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Notificações de status automáticas para o cliente.</p>
                     {restaurant.integrations?.whatsapp && <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-100/50 px-3 py-1.5 rounded-lg w-fit"><Check size={12} /> Ativo</div>}
                </div>

                {/* Stripe */}
                <div className={`p-6 rounded-2xl border transition-all duration-300 ${restaurant.integrations?.stripe ? 'bg-indigo-50 border-indigo-200 shadow-md' : 'bg-white border-gray-100 shadow-soft'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl ${restaurant.integrations?.stripe ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Stripe</h3>
                                <p className="text-xs text-gray-500">Pagamentos</p>
                            </div>
                        </div>
                         <button 
                            type="button"
                            onClick={() => toggleIntegration('stripe')}
                            className={`w-12 h-6 rounded-full transition-colors relative ${restaurant.integrations?.stripe ? 'bg-indigo-600' : 'bg-gray-200'}`}
                        >
                             <div className={`w-4 h-4 bg-white rounded-full shadow-sm absolute top-1 transition-transform ${restaurant.integrations?.stripe ? 'left-7' : 'left-1'}`}></div>
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Receba pagamentos online no cartão e Pix.</p>
                </div>
            </div>
        )}

        {/* Fixed Save Button */}
        <div className="fixed bottom-6 right-6 z-30">
            <button 
                type="submit" 
                disabled={saving}
                className="flex items-center px-8 py-4 bg-brand-primary text-white rounded-2xl hover:bg-brand-primaryHover transition-all disabled:opacity-70 font-bold shadow-2xl hover:shadow-brand-primary/40 transform hover:-translate-y-1"
            >
                {saving ? (
                    <span className="animate-pulse">Salvando...</span>
                ) : (
                    <>
                        <Save className="mr-2 w-5 h-5" />
                        Salvar Alterações
                    </>
                )}
            </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
