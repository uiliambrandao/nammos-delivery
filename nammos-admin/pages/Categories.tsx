import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Category } from '../types';
import { Plus, Pencil, Trash2, X, GripVertical } from 'lucide-react';
import { useToast } from '../components/Toast';

const Categories: React.FC = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Category>>({
    restaurantId: 'nammos-burgers',
    name: '',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCategories(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Category)));
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'categories', editingId), formData);
        showToast('Categoria atualizada', 'success');
      } else {
        await addDoc(collection(db, 'categories'), formData);
        showToast('Categoria criada', 'success');
      }
      closeModal();
    } catch (error) {
      console.error(error);
      showToast('Erro ao salvar', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Excluir esta categoria?')) {
      try {
        await deleteDoc(doc(db, 'categories', id));
        showToast('Categoria excluída', 'success');
      } catch (e) {
        showToast('Erro ao excluir', 'error');
      }
    }
  };

  const openModal = (cat?: Category) => {
    if (cat) {
      setEditingId(cat.id);
      setFormData(cat);
    } else {
      setEditingId(null);
      setFormData({
        restaurantId: 'nammos-burgers',
        name: '',
        order: categories.length + 1,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-end border-b border-gray-200 pb-6">
        <div>
            <h2 className="text-3xl font-bold text-brand-text">Categorias</h2>
            <p className="text-brand-textLight">Organize a apresentação do menu.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-brand-primary text-white px-6 py-2.5 rounded-xl font-semibold flex items-center hover:bg-brand-primaryHover transition shadow-lg shadow-brand-primary/20"
        >
          <Plus className="w-5 h-5 mr-2" /> Nova Categoria
        </button>
      </div>

      <div className="bg-white shadow-soft rounded-2xl border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center p-5 hover:bg-gray-50/80 transition-colors group">
              <div className="text-gray-300 cursor-grab mr-4">
                 <GripVertical size={20} />
              </div>
              
              <div className="w-12 h-12 rounded-xl bg-brand-primary/5 flex items-center justify-center text-brand-primary font-mono font-bold text-lg mr-4">
                {cat.order}
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-bold text-brand-text">{cat.name}</h3>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {cat.isActive ? 'Visível' : 'Oculto'}
                </span>
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openModal(cat)} className="p-2 text-gray-500 hover:text-brand-primary hover:bg-white rounded-full border border-transparent hover:border-gray-200 transition-all shadow-sm"><Pencil size={18} /></button>
                <button onClick={() => handleDelete(cat.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-full border border-transparent hover:border-red-100 transition-all shadow-sm"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
          {categories.length === 0 && <div className="p-8 text-center text-gray-500">Nenhuma categoria cadastrada.</div>}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-text/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <form onSubmit={handleSubmit} className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-brand-text">{editingId ? 'Editar Categoria' : 'Nova Categoria'}</h3>
                <button type="button" onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} className="text-gray-500" /></button>
              </div>

              <div className="space-y-5">
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nome da Categoria</label>
                    <input 
                        required
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="Ex: Burgers"
                    />
                 </div>
                 
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ordem de Exibição</label>
                    <input 
                        type="number"
                        required
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                        value={formData.order}
                        onChange={e => setFormData({...formData, order: parseInt(e.target.value)})}
                    />
                 </div>

                 <div className="pt-2">
                    <label className="flex items-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                         <div className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={formData.isActive}
                                onChange={e => setFormData({...formData, isActive: e.target.checked})}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                        </div>
                        <span className="ml-3 text-gray-900 font-medium">Ativar Categoria</span>
                    </label>
                 </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-brand-primary text-white rounded-xl hover:bg-brand-primaryHover transition font-bold shadow-lg">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;