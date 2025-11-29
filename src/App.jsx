import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Wrench, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Trash2, 
  Search,
  Snowflake,
  Menu,
  X,
  Plus,
  ShoppingBag,
  FileText,
  Download,
  Briefcase
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';

// --- Importações do Firebase ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  doc 
} from 'firebase/firestore';

// --- Configuração do Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyBUaOmeMusJ6dljI83y00oYAq6R-NZiuEM",
  authDomain: "instala-control.firebaseapp.com",
  projectId: "instala-control",
  storageBucket: "instala-control.firebasestorage.app",
  messagingSenderId: "359228375008",
  appId: "1:359228375008:web:f91bf7e7e72716abe87585"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// Usamos um ID fixo ou do ambiente para organizar as coleções
const appId = typeof __app_id !== 'undefined' ? __app_id : 'instala-control-app';

// --- Componentes UI Básicos ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-slate-200 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = "", type = "button", disabled = false, ...props }) => {
  const baseStyle = "px-4 py-2 rounded-md font-medium text-sm transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm",
    secondary: "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50",
    danger: "bg-red-50 text-red-700 border border-red-100 hover:bg-red-100",
    outline: "border border-slate-300 text-slate-600 hover:border-slate-800 hover:text-slate-800",
    ghost: "text-slate-600 hover:bg-slate-100",
    success: "bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm"
  };
  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// --- Modal de Novo Serviço ---
const AddServiceModal = ({ isOpen, onClose, onSave, isSaving }) => {
  const [formData, setFormData] = useState({
    client: '',
    type: 'Instalação Split',
    date: new Date().toISOString().substr(0, 10),
    price: '',
    notes: ''
  });

  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ name: '', value: '' });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        client: '',
        type: 'Instalação Split',
        date: new Date().toISOString().substr(0, 10),
        price: '',
        notes: ''
      });
      setExpenses([]);
      setNewExpense({ name: '', value: '' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalCost = expenses.reduce((acc, item) => acc + Number(item.value), 0);

  const handleAddExpense = () => {
    if (!newExpense.name || !newExpense.value) return;
    setExpenses([...expenses, { id: Date.now(), ...newExpense, value: Number(newExpense.value) }]);
    setNewExpense({ name: '', value: '' });
  };

  const handleRemoveExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      cost: totalCost,
      expenses: expenses
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
            <PlusCircle size={18} className="text-slate-700" /> 
            Novo Registro
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="serviceForm" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">Dados do Serviço</h4>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cliente / Empresa</label>
                <input 
                  required
                  type="text" 
                  className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-800 focus:border-slate-800 outline-none transition-colors"
                  placeholder="Ex: Condomínio Solar"
                  value={formData.client}
                  onChange={e => setFormData({...formData, client: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Serviço</label>
                  <select 
                    className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-800 outline-none bg-white"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option>Instalação Split</option>
                    <option>Instalação ACJ</option>
                    <option>Manutenção Preventiva</option>
                    <option>Manutenção Corretiva</option>
                    <option>Limpeza Química</option>
                    <option>Carga de Gás</option>
                    <option>Infraestrutura</option>
                    <option>Visita Técnica</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                  <input 
                    type="date" 
                    className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-800 outline-none"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor Cobrado</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 font-medium">R$</span>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full pl-10 p-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none text-lg font-semibold text-slate-800"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between items-center mb-2 border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Custos & Despesas</h4>
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                  Total: R$ {totalCost.toFixed(2)}
                </span>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-md border border-slate-200 mb-4">
                <div className="flex gap-2 mb-2">
                  <input 
                    type="text"
                    placeholder="Item (ex: Suporte)"
                    className="flex-1 p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-slate-500"
                    value={newExpense.name}
                    onChange={e => setNewExpense({...newExpense, name: e.target.value})}
                  />
                  <input 
                    type="number"
                    placeholder="Valor"
                    className="w-24 p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-slate-500"
                    value={newExpense.value}
                    onChange={e => setNewExpense({...newExpense, value: e.target.value})}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExpense())}
                  />
                  <button 
                    type="button"
                    onClick={handleAddExpense}
                    className="bg-slate-800 text-white p-2 rounded-md hover:bg-slate-700 transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {expenses.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-2 italic">Nenhum custo registrado.</p>
                  ) : (
                    expenses.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-sm bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-700 truncate max-w-[150px]">{item.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-slate-600">R$ {item.value.toFixed(2)}</span>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveExpense(item.id)}
                            className="text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
              <textarea 
                className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-800 outline-none text-sm"
                rows="2"
                placeholder="Detalhes técnicos..."
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
            </div>

          </form>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
          <Button onClick={onClose} variant="secondary" className="flex-1" disabled={isSaving}>Cancelar</Button>
          <Button type="submit" form="serviceForm" className="flex-1" disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Confirmar'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- View de Orçamento ---
const BudgetGeneratorView = () => {
  const [clientData, setClientData] = useState({ name: '', address: '', phone: '' });
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ description: '', qty: 1, price: '' });
  const [paymentTerms, setPaymentTerms] = useState('50% na entrada, 50% na finalização');
  const [validity, setValidity] = useState('15 dias');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const handleAddItem = () => {
    if (!newItem.description || !newItem.price) return;
    setItems([...items, { id: Date.now(), ...newItem, price: Number(newItem.price), qty: Number(newItem.qty) }]);
    setNewItem({ description: '', qty: 1, price: '' });
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter(i => i.id !== id));
  };

  const totalBudget = items.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const handleDownloadPDF = async () => {
    if (typeof window.html2pdf === 'undefined') {
      alert("Carregando biblioteca... Tente em 2 segundos.");
      return;
    }
    setIsGenerating(true);
    const element = document.getElementById('printable-area');
    const fileName = `Orcamento_${clientData.name.replace(/\s+/g, '_') || 'Cliente'}.pdf`;
    const options = {
      margin: 0, filename: fileName, image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    try { await window.html2pdf().set(options).from(element).save(); } 
    catch (error) { console.error(error); alert("Erro ao gerar PDF."); } 
    finally { setIsGenerating(false); }
  };

  return (
    <div className="animate-fade-in flex flex-col xl:flex-row gap-6">
      <div className="flex-1 space-y-6">
        <header>
          <h2 className="text-2xl font-bold text-slate-800">Novo Orçamento</h2>
          <p className="text-slate-500 text-sm">Preencha os dados para gerar a proposta em PDF.</p>
        </header>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-4 text-sm uppercase tracking-wide">1. Cliente</h3>
          <div className="space-y-3">
            <input type="text" placeholder="Nome do Cliente" className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-800 outline-none" value={clientData.name} onChange={e => setClientData({...clientData, name: e.target.value})} />
            <input type="text" placeholder="Endereço / Local" className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-800 outline-none" value={clientData.address} onChange={e => setClientData({...clientData, address: e.target.value})} />
            <input type="text" placeholder="Telefone / Contato" className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-800 outline-none" value={clientData.phone} onChange={e => setClientData({...clientData, phone: e.target.value})} />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-4 text-sm uppercase tracking-wide">2. Itens</h3>
          <div className="flex flex-col md:flex-row gap-2">
            <input type="text" placeholder="Descrição" className="flex-[2] p-2 border border-slate-300 rounded-md focus:outline-none focus:border-slate-800" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
            <input type="number" placeholder="Qtd" className="w-20 p-2 border border-slate-300 rounded-md focus:outline-none focus:border-slate-800" value={newItem.qty} onChange={e => setNewItem({...newItem, qty: e.target.value})} />
             <input type="number" placeholder="R$ Unit" className="w-28 p-2 border border-slate-300 rounded-md focus:outline-none focus:border-slate-800" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} />
            <Button onClick={handleAddItem} className="py-2 px-3 bg-slate-800"><Plus size={18} /></Button>
          </div>

          <div className="space-y-2 mt-4 bg-slate-50 p-4 rounded-md border border-slate-200">
            {items.length === 0 ? <p className="text-center text-slate-400 text-sm italic">Lista vazia.</p> : 
              items.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm bg-white p-2 rounded border border-slate-100">
                  <div className="flex-1">
                    <span className="font-medium text-slate-700">{item.description}</span>
                    <div className="text-xs text-slate-500">{item.qty}x R$ {item.price.toFixed(2)}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-800">R$ {(item.qty * item.price).toFixed(2)}</span>
                    <button onClick={() => handleRemoveItem(item.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))
            }
            {items.length > 0 && (
              <div className="flex justify-between items-center pt-3 border-t border-slate-200 mt-2">
                <span className="font-bold text-slate-600">Total Estimado</span>
                <span className="font-bold text-xl text-slate-800">R$ {totalBudget.toFixed(2)}</span>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-4 text-sm uppercase tracking-wide">3. Detalhes Finais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pagamento</label>
              <input type="text" className="w-full p-2.5 border border-slate-300 rounded-md outline-none" value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Validade</label>
              <input type="text" className="w-full p-2.5 border border-slate-300 rounded-md outline-none" value={validity} onChange={e => setValidity(e.target.value)} />
            </div>
          </div>
        </Card>

        <Button onClick={handleDownloadPDF} variant="success" className="w-full py-4 text-lg bg-emerald-700 hover:bg-emerald-800" disabled={isGenerating}>
          {isGenerating ? 'Processando...' : <><Download size={20} /> Baixar PDF</>}
        </Button>
      </div>

      <div className="flex-1 bg-slate-300 p-4 md:p-8 overflow-auto rounded-lg flex justify-center items-start min-h-[600px] border-4 border-slate-300">
        <div id="printable-area" className="bg-white shadow-2xl w-full max-w-[210mm] min-h-[297mm] p-[15mm] md:p-[20mm] relative text-slate-800" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
          <div className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">ORÇAMENTO</h1>
              <p className="text-sm text-slate-500">Emitido em: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-bold text-slate-900">InstalaControl</h2>
              <p className="text-sm text-slate-600">Serviços Técnicos</p>
              <p className="text-sm text-slate-600">(XX) 99999-9999</p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-md mb-8 border border-slate-200">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Para:</h3>
            <div className="grid grid-cols-1 gap-1 text-sm">
              <p><span className="font-semibold text-slate-700">Cliente:</span> {clientData.name || '---'}</p>
              <p><span className="font-semibold text-slate-700">Local:</span> {clientData.address || '---'}</p>
              <p><span className="font-semibold text-slate-700">Contato:</span> {clientData.phone || '---'}</p>
            </div>
          </div>

          <div className="mb-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="py-2 text-xs font-bold text-slate-500 uppercase w-1/2">Descrição</th>
                  <th className="py-2 text-xs font-bold text-slate-500 uppercase text-center">Qtd</th>
                  <th className="py-2 text-xs font-bold text-slate-500 uppercase text-right">Unitário</th>
                  <th className="py-2 text-xs font-bold text-slate-500 uppercase text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? ( <tr><td colSpan="4" className="py-8 text-center text-slate-400 italic text-sm">---</td></tr> ) : (
                  items.map(item => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="py-3 text-sm text-slate-700">{item.description}</td>
                      <td className="py-3 text-sm text-slate-700 text-center">{item.qty}</td>
                      <td className="py-3 text-sm text-slate-700 text-right">R$ {item.price.toFixed(2)}</td>
                      <td className="py-3 text-sm text-slate-900 font-bold text-right">R$ {(item.qty * item.price).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="flex justify-end mt-4">
               <div className="text-right">
                 <p className="text-sm text-slate-500 mr-2">Total Geral</p>
                 <p className="text-2xl font-bold text-slate-900">R$ {totalBudget.toFixed(2)}</p>
               </div>
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-slate-200">
             <div className="grid grid-cols-2 gap-8 text-sm">
                <div>
                   <h4 className="font-bold text-slate-800 mb-1">Pagamento:</h4>
                   <p className="text-slate-600">{paymentTerms}</p>
                </div>
                <div>
                   <h4 className="font-bold text-slate-800 mb-1">Validade:</h4>
                   <p className="text-slate-600">{validity}</p>
                </div>
             </div>
             <div className="mt-16 text-center text-xs text-slate-400">
               <p>Documento gerado digitalmente por InstalaControl.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Aplicação Principal ---
export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [services, setServices] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState(null);

  // --- Autenticação ---
  useEffect(() => {
    const initAuth = async () => {
      // Como estamos usando um projeto Firebase externo, o token do ambiente (__initial_auth_token)
      // não é compatível. Forçamos o login anônimo.
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Erro na autenticação anônima:", error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // --- Carregar Dados do Firestore ---
  useEffect(() => {
    if (!user) return;
    
    // Regra 1: Usando caminho seguro do Firestore
    // Regra 2: Query simples sem orderBy complexo (faremos sort no JS)
    const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'services'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Ordenar por data decrescente (mais recente primeiro)
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setServices(data);
    }, (error) => {
      console.error("Erro ao buscar dados:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddService = async (newService) => {
    if (!user) {
      alert("Aguarde a autenticação...");
      return;
    }
    
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'services'), {
        ...newService,
        createdAt: new Date().toISOString()
      });
      setIsModalOpen(false);
      setCurrentView('services'); 
    } catch (e) {
      console.error("Erro ao salvar:", e);
      alert("Erro ao salvar no banco de dados.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteService = async (id) => {
    if (!user) return;
    
    if(window.confirm("Confirmar exclusão? Esta ação não pode ser desfeita.")) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'services', id));
      } catch (e) {
        console.error("Erro ao deletar:", e);
        alert("Erro ao excluir registro.");
      }
    }
  };

  // --- Views ---

  const DashboardView = () => {
    const totalRevenue = services.reduce((acc, curr) => acc + Number(curr.price), 0);
    const totalCost = services.reduce((acc, curr) => acc + Number(curr.cost), 0);
    const profit = totalRevenue - totalCost;
    const margin = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : 0;

    const chartData = services.slice(0, 10).map(s => ({
      name: s.client.split(' ')[0],
      Faturamento: s.price,
      Custo: s.cost
    })).reverse();

    return (
      <div className="space-y-6 animate-fade-in">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Visão Geral</h2>
            <p className="text-slate-500 text-sm">Performance financeira e operacional.</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="shadow-lg shadow-slate-200">
            <Plus size={18} /> Novo Serviço
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-t-4 border-t-slate-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Faturamento</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">R$ {totalRevenue.toFixed(2)}</h3>
              </div>
              <div className="p-2 bg-slate-100 rounded text-slate-600">
                <TrendingUp size={20} />
              </div>
            </div>
          </Card>

          <Card className="p-5 border-t-4 border-t-slate-400">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Custos</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">R$ {totalCost.toFixed(2)}</h3>
              </div>
              <div className="p-2 bg-slate-100 rounded text-slate-600">
                <ShoppingBag size={20} />
              </div>
            </div>
          </Card>

          <Card className="p-5 border-t-4 border-t-emerald-600">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Lucro Líquido</p>
                <h3 className="text-2xl font-bold text-emerald-700 mt-1">R$ {profit.toFixed(2)}</h3>
              </div>
              <div className="p-2 bg-emerald-50 rounded text-emerald-600">
                <DollarSign size={20} />
              </div>
            </div>
          </Card>

          <Card className="p-5 border-t-4 border-t-blue-600">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Margem</p>
                <h3 className="text-2xl font-bold text-blue-700 mt-1">{margin}%</h3>
              </div>
              <div className="p-2 bg-blue-50 rounded text-blue-600">
                <TrendingUp size={20} />
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="font-semibold text-slate-800 mb-6 text-sm uppercase tracking-wide">Desempenho Recente</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}/>
                <Legend iconType="circle" />
                <Bar dataKey="Faturamento" fill="#0f172a" radius={[2, 2, 0, 0]} barSize={40} />
                <Bar dataKey="Custo" fill="#94a3b8" radius={[2, 2, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    );
  };

  const ServiceListView = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const filteredServices = services.filter(service => 
      service.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-6 animate-fade-in">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Serviços</h2>
            <p className="text-slate-500 text-sm">Histórico operacional completo.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Buscar..."
                className="w-full pl-10 p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-800 outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus size={18} /> <span className="hidden md:inline">Novo</span>
            </Button>
          </div>
        </header>

        <div className="space-y-3">
          {filteredServices.length === 0 ? (
            <div className="text-center py-16 text-slate-400 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
              <Snowflake size={48} className="mx-auto mb-3 opacity-30" />
              <p>Nenhum registro encontrado no sistema.</p>
            </div>
          ) : (
            filteredServices.map(service => (
              <Card key={service.id} className="p-4 hover:border-slate-400 transition-colors">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-slate-800">{service.client}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 uppercase tracking-wide font-bold rounded">
                        {service.type}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 flex flex-wrap gap-4 mb-2">
                      <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(service.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    {service.expenses && service.expenses.length > 0 && (
                       <div className="text-xs text-slate-500">
                         <span className="font-medium">Custos:</span> {service.expenses.map(e => e.name).join(', ')}
                       </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-3 md:pt-0 mt-3 md:mt-0">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Lucro</p>
                      <p className="font-bold text-emerald-700">
                        R$ {(service.price - service.cost).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right mr-4">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Total</p>
                      <p className="font-bold text-slate-800">
                        R$ {Number(service.price).toFixed(2)}
                      </p>
                    </div>
                    <button onClick={() => handleDeleteService(service.id)} className="p-2 text-slate-300 hover:text-red-600 transition-colors" title="Excluir">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-600">
      <AddServiceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddService} isSaving={isSaving} />

      {/* Sidebar Dark Mode */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 h-screen fixed">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-lg text-white">
            <Snowflake size={20} />
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight tracking-wide">InstalaControl</h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Professional</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <SidebarItem icon={<LayoutDashboard size={18} />} label="Visão Geral" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
          <SidebarItem icon={<Wrench size={18} />} label="Serviços" active={currentView === 'services'} onClick={() => setCurrentView('services')} />
          <SidebarItem icon={<FileText size={18} />} label="Orçamentos" active={currentView === 'budget'} onClick={() => setCurrentView('budget')} />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800 p-3 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs">TS</div>
              <div>
                <p className="text-xs font-bold text-white">Técnico Silva</p>
                <p className="text-[10px] text-slate-400">Plano Pro</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 w-full bg-slate-900 z-20 px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="bg-white/10 p-1.5 rounded text-white">
            <Snowflake size={16} />
          </div>
          <span className="font-bold text-white text-sm">InstalaControl</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900 z-10 pt-16 px-4 pb-4 md:hidden animate-fade-in">
          <nav className="space-y-2">
            <SidebarItem icon={<LayoutDashboard />} label="Visão Geral" onClick={() => { setCurrentView('dashboard'); setIsMobileMenuOpen(false); }} active={currentView === 'dashboard'} />
            <SidebarItem icon={<Wrench />} label="Serviços" onClick={() => { setCurrentView('services'); setIsMobileMenuOpen(false); }} active={currentView === 'services'} />
            <SidebarItem icon={<FileText />} label="Orçamentos" onClick={() => { setCurrentView('budget'); setIsMobileMenuOpen(false); }} active={currentView === 'budget'} />
          </nav>
        </div>
      )}

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto">
        <div className={`max-w-5xl mx-auto ${currentView === 'budget' ? 'max-w-6xl' : ''}`}>
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'services' && <ServiceListView />}
          {currentView === 'budget' && <BudgetGeneratorView />}
        </div>
      </main>
    </div>
  );
}

const SidebarItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 
      ${active 
        ? 'bg-blue-600 text-white shadow-sm' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
  >
    {React.cloneElement(icon, { size: 18 })}
    {label}
  </button>
);