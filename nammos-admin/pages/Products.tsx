import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Product, Category } from '../types';
import { Plus, Pencil, Trash2, X, Image as ImageIcon, Tag, Search } from 'lucide-react';
import { useToast } from '../components/Toast';

const Products: React.FC = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    restaurantId: 'nammos-burgers',
    name: '',
    description: '',
    basePrice: 0,
    categoryId: '',
    imageUrl: '',
    isActive: true,
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    const unsubProd = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    });
    const unsubCat = onSnapshot(query(collection(db, 'categories'), orderBy('order')), (snap) => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() } as Category)));
    });
    return () => { unsubProd(); unsubCat(); };
  }, []);

  const filteredProducts = products.filter(product => {
    const search = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(search) ||
      product.description.toLowerCase().includes(search)
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), formData);
        showToast('Produto atualizado!', 'success');
      } else {
        await addDoc(collection(db, 'products'), formData);
        showToast('Produto criado com sucesso!', 'success');
      }
      closeModal();
    } catch (error) {
      console.error(error);
      showToast('Erro ao salvar produto.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
          await deleteDoc(doc(db, 'products', id));
          showToast('Produto excluído.', 'success');
      } catch (e) {
          showToast('Erro ao excluir.', 'error');
      }
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData(product);
    } else {
      setEditingId(null);
      setFormData({
        restaurantId: 'nammos-burgers',
        name: '',
        description: '',
        basePrice: 0,
        categoryId: categories[0]?.id || '',
        imageUrl: '',
        isActive: true,
        tags: [],
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const addTag = () => {
    if (tagInput && !formData.tags?.includes(tagInput)) {
      setFormData({ ...formData, tags: [...(formData.tags || []), tagInput] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags?.filter(t => t !== tag) });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-soft sticky top-0 z-20 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-brand-text">Produtos</h2>
            <p className="text-brand-textLight text-sm">Gerencie o cardápio da loja</p>
        </div>
        
        <div className="flex flex-col md:flex-row w-full md:w-auto gap-3">
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                    type="text"
                    placeholder="Buscar por nome..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
              onClick={() => openModal()}
              className="bg-brand-primary text-white px-6 py-2.5 rounded-xl font-semibold flex items-center justify-center hover:bg-brand-primaryHover transition shadow-lg shadow-brand-primary/20 whitespace-nowrap"
            >
              <Plus className="w-5 h-5 mr-2" /> Novo Produto
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => {
            const catName = categories.find(c => c.id === product.categoryId)?.name || 'Geral';
            return (
                <div key={product.id} className="group bg-white rounded-2xl shadow-card border border-transparent hover:border-brand-primary/20 overflow-hidden flex flex-col hover:shadow-card-hover transition-all duration-300">
                    <div className="h-52 bg-gray-50 relative overflow-hidden">
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <ImageIcon size={48} />
                            </div>
                        )}
                        <div className="absolute top-3 right-3 flex gap-2">
                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg shadow-sm uppercase tracking-wide ${product.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                {product.isActive ? 'Ativo' : 'Inativo'}
                            </span>
                        </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                        <div className="text-[10px] text-brand-primary font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Tag size={10} /> {catName}
                        </div>
                        <h3 className="text-lg font-bold text-brand-text mb-1 leading-tight">{product.name}</h3>
                        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1 leading-relaxed">{product.description}</p>
                        
                        <div className="flex flex-wrap gap-1 mb-4">
                            {product.tags?.map(tag => (
                                <span key={tag} className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded-md font-medium">{tag}</span>
                            ))}
                        </div>
                        
                        <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                            <span className="font-bold text-xl text-brand-text">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.basePrice)}
                            </span>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openModal(product)} className="p-2 text-gray-500 hover:bg-brand-primary hover:text-white rounded-lg transition-colors"><Pencil size={18} /></button>
                                <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    </div>
                </div>
            );
          })
        ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                <Search size={48} className="mb-4 opacity-20" />
                <p className="text-lg font-medium">Nenhum produto encontrado.</p>
            </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-text/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <form onSubmit={handleSubmit} className="p-8">
              <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                <h3 className="text-2xl font-bold text-brand-text">{editingId ? 'Editar Produto' : 'Novo Produto'}</h3>
                <button type="button" onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition"><X size={24} className="text-gray-500" /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                 <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nome do Produto</label>
                    <input 
                        required
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                        placeholder="Ex: X-Bacon Supremo"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                 </div>
                 
                 <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
                    <textarea 
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                        rows={3}
                        placeholder="Descrição detalhada dos ingredientes..."
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                 </div>

                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Preço Base (R$)</label>
                    <input 
                        type="number"
                        step="0.01"
                        required
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                        value={formData.basePrice}
                        onChange={e => setFormData({...formData, basePrice: parseFloat(e.target.value)})}
                    />
                 </div>

                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria</label>
                    <select 
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                        value={formData.categoryId}
                        onChange={e => setFormData({...formData, categoryId: e.target.value})}
                    >
                        <option value="">Selecione...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                 </div>

                 <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">URL da Imagem</label>
                    <input 
                        type="url"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                        value={formData.imageUrl}
                        onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                        placeholder="https://exemplo.com/imagem.jpg"
                    />
                 </div>

                 <div className="col-span-2">
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
                     <div className="flex gap-2 mb-2 flex-wrap min-h-[32px]">
                        {formData.tags?.map(tag => (
                            <span key={tag} className="bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-3 py-1 rounded-full text-sm flex items-center gap-2 font-medium">
                                {tag} <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-600"><X size={14}/></button>
                            </span>
                        ))}
                     </div>
                     <div className="flex gap-2">
                        <input 
                            className="flex-1 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white bg-gray-50"
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            placeholder="Adicionar tag (Enter)"
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        />
                        <button type="button" onClick={addTag} className="bg-gray-100 px-4 rounded-xl hover:bg-gray-200 font-medium text-gray-600">Add</button>
                     </div>
                 </div>

                 <div className="col-span-2 pt-4">
                    <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={formData.isActive}
                                onChange={e => setFormData({...formData, isActive: e.target.checked})}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                        </div>
                        <span className="ml-3 text-gray-900 font-medium">Produto Ativo</span>
                    </label>
                 </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                <button type="button" onClick={closeModal} className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">Cancelar</button>
                <button type="submit" className="px-8 py-3 bg-brand-primary text-white rounded-xl hover:bg-brand-primaryHover transition font-bold shadow-lg shadow-brand-primary/25">Salvar Produto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;