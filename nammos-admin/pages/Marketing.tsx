import React, { useState } from 'react';
import { MessageCircle, Send, Users, Smartphone, CheckCircle, AlertTriangle, Lock } from 'lucide-react';
import { useToast } from '../components/Toast';

const Marketing: React.FC = () => {
  const { showToast } = useToast();
  const [isConnected, setIsConnected] = useState(false); // Mock connection state
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const segments = [
      { id: 'all', name: 'Todos os Clientes', count: 145 },
      { id: 'champion', name: 'VIPs / Campeões', count: 12 },
      { id: 'at_risk', name: 'Clientes em Risco (30+ dias sem comprar)', count: 45 },
      { id: 'lost', name: 'Ex-Clientes (Winback)', count: 23 },
      { id: 'birthday', name: 'Aniversariantes do Mês', count: 5 },
  ];

  const templates = [
      { title: 'Cupom de Saudade', text: 'Olá {nome}! Faz tempo que não te vemos. Aqui está um cupom de 10% OFF para matar a saudade do seu burger favorito: SAUDADE10 🍔' },
      { title: 'Oferta VIP', text: 'Ei {nome}, como você é um dos nossos melhores clientes, liberamos frete grátis hoje! Aproveite. 🛵💨' },
      { title: 'Novidade no Cardápio', text: 'Tem novidade na chapa, {nome}! Conheça o novo X-Bacon Supremo. Peça agora pelo link: nammos.app/menu' },
  ];

  const handleConnect = () => {
      // Simulação de conexão via QR Code
      const loading = window.confirm("Deseja iniciar o processo de conexão via QR Code?");
      if (loading) {
          setTimeout(() => {
              setIsConnected(true);
              showToast('WhatsApp conectado com sucesso!', 'success');
          }, 1500);
      }
  };

  const handleSend = () => {
      if (!isConnected) {
          showToast('Conecte o WhatsApp antes de enviar.', 'error');
          return;
      }
      if (!message) {
          showToast('Escreva uma mensagem.', 'error');
          return;
      }

      setIsSending(true);
      // Simulação de envio em lote
      setTimeout(() => {
          setIsSending(false);
          setMessage('');
          showToast('Campanha enviada com sucesso! 🚀', 'success');
      }, 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
       <div className="flex justify-between items-end">
            <div>
                <h2 className="text-3xl font-bold text-brand-text">Marketing & Automação</h2>
                <p className="text-brand-textLight">Disparos inteligentes via WhatsApp Oficial.</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${isConnected ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                {isConnected ? 'API WhatsApp Conectada' : 'Desconectado'}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Settings */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Connection Card (if disconnected) */}
                {!isConnected && (
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-8 opacity-10">
                             <MessageCircle size={120} />
                         </div>
                         <div className="relative z-10">
                             <h3 className="text-2xl font-bold mb-2">Conectar WhatsApp</h3>
                             <p className="text-gray-300 mb-6 max-w-md">Integre seu número para enviar campanhas automáticas, recuperar carrinhos e fidelizar clientes.</p>
                             <button 
                                onClick={handleConnect}
                                className="bg-green-500 hover:bg-green-400 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-green-900/20 flex items-center gap-2"
                             >
                                 <Smartphone size={20} /> Ler QR Code
                             </button>
                         </div>
                    </div>
                )}

                {/* Campaign Builder */}
                <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 opacity-100 transition-opacity">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-50">
                        <Users className="text-brand-primary" />
                        <h3 className="text-lg font-bold text-brand-text">Configurar Campanha</h3>
                    </div>

                    <div className="space-y-6">
                        {/* Audience */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Público Alvo (Segmentação RFV)</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {segments.map(seg => (
                                    <button
                                        key={seg.id}
                                        onClick={() => setSelectedSegment(seg.id)}
                                        className={`p-4 rounded-xl border text-left transition-all ${
                                            selectedSegment === seg.id 
                                            ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary' 
                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }`}
                                    >
                                        <div className="font-bold text-sm text-gray-800 mb-1">{seg.name}</div>
                                        <div className="text-xs text-gray-500">{seg.count} contatos estimados</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Templates */}
                        <div>
                             <label className="block text-sm font-semibold text-gray-700 mb-3">Modelos Rápidos</label>
                             <div className="flex gap-2 overflow-x-auto pb-2">
                                 {templates.map((t, i) => (
                                     <button 
                                        key={i}
                                        onClick={() => setMessage(t.text)}
                                        className="whitespace-nowrap px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-xs font-medium hover:bg-gray-100 transition-colors"
                                     >
                                         {t.title}
                                     </button>
                                 ))}
                             </div>
                        </div>

                        {/* Message Box */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Mensagem</label>
                            <div className="relative">
                                <textarea 
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={5}
                                    className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-brand-primary outline-none bg-gray-50 focus:bg-white resize-none"
                                    placeholder="Digite sua mensagem aqui... Use {nome} para personalizar."
                                />
                                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                                    {message.length} caracteres
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                <Lock size={10} /> Mensagens protegidas por criptografia de ponta a ponta.
                            </p>
                        </div>

                        <button 
                            onClick={handleSend}
                            disabled={isSending || !isConnected}
                            className="w-full py-4 rounded-xl bg-brand-primary text-white font-bold text-lg shadow-lg shadow-brand-primary/25 hover:bg-brand-primaryHover disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {isSending ? (
                                <span className="animate-pulse">Enviando...</span>
                            ) : (
                                <>
                                    <Send size={20} /> Disparar Campanha Agora
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column: Phone Preview */}
            <div className="lg:col-span-1">
                <div className="sticky top-6">
                    <div className="bg-gray-900 rounded-[3rem] p-4 shadow-2xl border-8 border-gray-800 max-w-[320px] mx-auto">
                        <div className="bg-[#e5ddd5] rounded-[2rem] h-[550px] overflow-hidden relative flex flex-col">
                            {/* Whatsapp Header */}
                            <div className="bg-[#075E54] p-4 text-white flex items-center gap-3 shadow-md z-10">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">N</div>
                                <div>
                                    <p className="font-bold text-sm">Nammos Burgers</p>
                                    <p className="text-[10px] opacity-80">Conta Comercial</p>
                                </div>
                            </div>

                            {/* Chat Body */}
                            <div className="flex-1 p-4 relative overflow-y-auto">
                                {/* Background Pattern Mock */}
                                <div className="absolute inset-0 opacity-10 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]"></div>
                                
                                {/* Message Bubble */}
                                {message ? (
                                    <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-[90%] text-sm text-gray-800 relative z-10 mb-2 break-words whitespace-pre-wrap">
                                        {message.replace('{nome}', 'João')}
                                        <div className="text-[10px] text-gray-400 text-right mt-1 flex items-end justify-end gap-1">
                                            10:42 <CheckCircle size={10} className="text-blue-500" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full opacity-50">
                                        <p className="text-xs text-center text-gray-500 bg-white/50 px-3 py-1 rounded-full">Visualização da mensagem</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="bg-[#f0f0f0] p-3 flex items-center gap-2">
                                <div className="flex-1 h-8 bg-white rounded-full border border-gray-200"></div>
                                <div className="w-8 h-8 bg-[#075E54] rounded-full flex items-center justify-center text-white">
                                    <Send size={14} />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {!isConnected && (
                         <div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex gap-3">
                             <AlertTriangle className="text-yellow-600 shrink-0" />
                             <p className="text-sm text-yellow-700 font-medium">
                                 Conecte seu WhatsApp para habilitar o preview em tempo real e os disparos.
                             </p>
                         </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default Marketing;