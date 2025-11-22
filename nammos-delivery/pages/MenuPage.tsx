import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getMenu } from '../services/firebase';
import { Category, Product, CartItem } from '../types';
import { ShoppingBag, X, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';

// --- BANNER DATA ---
const BANNERS = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    title: "Combo Família",
    subtitle: "4 Smash Burgers + Fritas por R$ 99,90"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    title: "Frete Grátis",
    subtitle: "Em pedidos acima de R$ 60,00"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1561758033-d8f5c665b27d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    title: "Novo Nammos Veggie",
    subtitle: "O sabor de sempre, sem carne."
  }
];

export const MenuPage: React.FC = () => {
  const { restaurant, loadingRestaurant, cartItems, cartSubtotal, addToCart } = useApp();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Banner State
  const [currentBanner, setCurrentBanner] = useState(0);
  const timeoutRef = useRef<any>(null);

  const navigate = useNavigate();

  // Load Data
  useEffect(() => {
    const loadMenu = async () => {
      try {
        const data = await getMenu();
        setCategories(data.categories);
        setProducts(data.products);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadMenu();
  }, []);

  // Banner Rotation Logic
  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(
      () => setCurrentBanner((prev) => (prev === BANNERS.length - 1 ? 0 : prev + 1)),
      4000
    );
    return () => resetTimeout();
  }, [currentBanner]);

  if (loading || loadingRestaurant) {
    return <div className="flex h-screen items-center justify-center text-primary font-bold">Carregando cardápio...</div>;
  }

  const isOpen = restaurant?.isOpen;

  return (
    <div className="relative flex flex-col h-full pb-24 md:pb-0">
      
      {/* --- ROTATING BANNER --- */}
      <div className="relative w-full h-48 md:h-72 overflow-hidden bg-gray-200 group">
        <div 
            className="whitespace-nowrap transition-transform duration-500 ease-in-out h-full"
            style={{ transform: `translateX(${-currentBanner * 100}%)` }}
        >
            {BANNERS.map((banner) => (
                <div key={banner.id} className="inline-block w-full h-full relative">
                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-10">
                        <h2 className="text-white font-bold text-2xl md:text-4xl drop-shadow-lg">{banner.title}</h2>
                        <p className="text-gray-200 font-medium md:text-xl drop-shadow-md">{banner.subtitle}</p>
                    </div>
                </div>
            ))}
        </div>
        
        {/* Banner Dots */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
            {BANNERS.map((_, idx) => (
                <button 
                    key={idx} 
                    onClick={() => setCurrentBanner(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${currentBanner === idx ? 'bg-primary w-6' : 'bg-white/60 hover:bg-white'}`}
                />
            ))}
        </div>

        {/* Banner Arrows (Desktop) */}
        <button 
            className="hidden md:block absolute top-1/2 left-4 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full text-gray-800 opacity-0 group-hover:opacity-100 transition shadow-lg"
            onClick={() => setCurrentBanner(prev => prev === 0 ? BANNERS.length - 1 : prev - 1)}
        >
            <ChevronLeft size={24} />
        </button>
        <button 
            className="hidden md:block absolute top-1/2 right-4 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full text-gray-800 opacity-0 group-hover:opacity-100 transition shadow-lg"
            onClick={() => setCurrentBanner(prev => prev === BANNERS.length - 1 ? 0 : prev + 1)}
        >
            <ChevronRight size={24} />
        </button>
      </div>

      {/* Header Info */}
      <div className="px-4 pt-6 md:px-10">
         <div className="max-w-4xl mx-auto flex justify-between items-center border-b border-gray-100 pb-4">
            <div>
                <h1 className="text-xl md:text-3xl font-bold text-gray-900">{restaurant?.name || 'Nammos Burgers'}</h1>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-sm text-gray-500">{isOpen ? 'Aberto agora' : 'Fechado no momento'}</span>
                </div>
            </div>
         </div>
      </div>

      {/* Menu Content */}
      <div className="flex-grow overflow-y-auto px-4 pt-4 space-y-8 md:px-10 md:py-6">
        <div className="max-w-4xl mx-auto">
            {!isOpen && (
                <div className="bg-red-50 text-red-800 p-4 rounded-xl text-center font-medium mb-6 border border-red-100">
                    Estamos fechados no momento. Você pode navegar, mas não conseguirá finalizar o pedido.
                </div>
            )}

            {categories.map(cat => {
            const items = products.filter(p => p.categoryId === cat.id);

            if (items.length === 0) return null;

            return (
                <div key={cat.id} className="mb-8">
                <h3 className="text-lg md:text-xl font-bold text-primary mb-4">{cat.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {items.map(product => (
                    <div 
                        key={product.id} 
                        onClick={() => setSelectedProduct(product)}
                        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex justify-between items-start cursor-pointer hover:border-primary transition hover:shadow-md group"
                    >
                        <div className="flex-1 pr-4 flex flex-col justify-between h-full">
                            <div>
                                <h4 className="font-bold text-gray-900 group-hover:text-primary transition">{product.name}</h4>
                                <p className="text-gray-500 text-xs md:text-sm mt-1 line-clamp-2">{product.description}</p>
                            </div>
                            <p className="text-gray-900 font-bold mt-3 text-lg">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.basePrice)}
                            </p>
                        </div>
                        {/* Placeholder image */}
                        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full" />
                            ) : (
                            <span className="text-3xl">🍔</span>
                            )}
                        </div>
                    </div>
                    ))}
                </div>
                </div>
            );
            })}
            
            { products.filter(p => !p.categoryId).length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-primary mb-4">Outros</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {products.filter(p => !p.categoryId).map(product => (
                            <div key={product.id} onClick={() => setSelectedProduct(product)} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:border-primary hover:shadow-md transition">
                                <h4 className="font-bold">{product.name}</h4>
                                <p className="font-bold mt-1">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.basePrice)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Sticky Cart Button - Mobile Only */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-4 left-0 w-full px-4 z-20 md:hidden">
          <button 
            onClick={() => navigate('/cart')}
            className="w-full bg-secondary text-white p-4 rounded-xl flex justify-between items-center shadow-xl hover:bg-black transition"
          >
            <div className="flex items-center gap-3">
                <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                    {cartItems.reduce((a,b) => a + b.quantity, 0)}
                </div>
                <span className="font-medium">Ver carrinho</span>
            </div>
            <span className="font-bold text-lg">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartSubtotal)}
            </span>
          </button>
        </div>
      )}

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
            onAdd={(item) => {
                addToCart(item);
                setSelectedProduct(null);
            }}
        />
      )}
    </div>
  );
};

interface ProductModalProps {
    product: Product;
    onClose: () => void;
    onAdd: (item: CartItem) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onAdd }) => {
    const [qty, setQty] = useState(1);
    const [obs, setObs] = useState('');

    const total = product.basePrice * qty;

    const handleAdd = () => {
        onAdd({
            tempId: Date.now().toString(),
            productId: product.id,
            productNameSnapshot: product.name,
            unitPrice: product.basePrice,
            quantity: qty,
            totalPrice: total,
            observation: obs
        });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-2xl p-6 relative shadow-2xl animate-slide-up md:animate-fade-in">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black hover:bg-gray-100 p-2 rounded-full transition">
                    <X size={24} />
                </button>
                
                <h2 className="text-2xl md:text-3xl font-bold pr-8 mb-2 text-gray-800">{product.name}</h2>
                <p className="text-gray-500 text-sm md:text-base mb-6 leading-relaxed">{product.description}</p>
                
                <div className="mb-6">
                    <span className="text-3xl font-bold text-primary">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.basePrice)}
                    </span>
                </div>

                <div className="mb-6">
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Observações</label>
                    <textarea 
                        className="w-full bg-gray-50 p-3 rounded-lg text-sm border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none transition"
                        rows={3}
                        placeholder="Ex: Sem cebola, maionese à parte..."
                        value={obs}
                        onChange={(e) => setObs(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-gray-100 rounded-xl p-1 border border-gray-200">
                        <button onClick={() => setQty(q => Math.max(1, q-1))} className="p-3 hover:bg-white hover:shadow-sm rounded-lg transition"><Minus size={20}/></button>
                        <span className="w-10 text-center font-bold text-lg">{qty}</span>
                        <button onClick={() => setQty(q => q+1)} className="p-3 hover:bg-white hover:shadow-sm rounded-lg transition"><Plus size={20}/></button>
                    </div>
                    <button onClick={handleAdd} className="flex-1 bg-primary text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg transform hover:-translate-y-0.5">
                        Adicionar {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                    </button>
                </div>
            </div>
        </div>
    );
};