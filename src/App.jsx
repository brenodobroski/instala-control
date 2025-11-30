import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Wrench, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Trash2, 
  Search,
  Snowflake,
  X,
  Plus,
  ShoppingBag,
  FileText,
  Download,
  Briefcase,
  Home,
  ChevronLeft,
  ChevronRight,
  MapPin,
  CheckCircle,
  Pencil,
  Save,
  History,
  Shield, 
  User,
  Settings,
  Bell,
  AlertCircle,
  Wallet
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area
} from 'recharts';

// --- Importações do Firebase ---
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  doc, 
  updateDoc, 
  setDoc, 
  getDoc
} from 'firebase/firestore';

// --- Estilos Globais (Animações Customizadas) ---
const GlobalStyles = () => (
  <style>{`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-fade-in {
      animation: fadeIn 0.4s ease-out forwards;
    }
    .animate-slide-in {
      animation: slideIn 0.3s ease-out forwards;
    }
    .pb-safe {
      padding-bottom: env(safe-area-inset-bottom);
    }
    /* Esconde barra de rolagem mas permite scroll */
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    @media print {
      .no-print { display: none !important; }
      .print-only { display: block !important; }
      body { background: white; }
    }
  `}</style>
);

// --- Configuração do Firebase ---
// Tenta pegar a config global (ambiente AI) ou usa fallback
let firebaseConfig;
try {
  firebaseConfig = typeof __firebase_config !== 'undefined' 
    ? JSON.parse(__firebase_config) 
    : {
        apiKey: "AIzaSyBUaOmeMusJ6dljI83y00oYAq6R-NZiuEM", // Chave de exemplo/fallback
        authDomain: "instala-control.firebaseapp.com",
        projectId: "instala-control",
        storageBucket: "instala-control.firebasestorage.app",
        messagingSenderId: "359228375008",
        appId: "1:359228375008:web:f91bf7e7e72716abe87585"
      };
} catch (error) {
  console.error("Erro ao fazer parse da config do Firebase", error);
  firebaseConfig = {}; // Config vazia para não quebrar o app imediatamente
}

// Inicialização segura do Firebase (Singleton)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'instala-control-app-default';

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none no-print">
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className={`
            pointer-events-auto min-w-[300px] p-4 rounded-xl shadow-xl border flex items-center gap-3 animate-slide-in
            ${toast.type === 'success' ? 'bg-white border-emerald-100 text-emerald-800' : ''}
            ${toast.type === 'error' ? 'bg-white border-red-100 text-red-800' : ''}
            ${toast.type === 'info' ? 'bg-white border-blue-100 text-slate-800' : ''}
          `}
        >
          {toast.type === 'success' && <CheckCircle size={20} className="text-emerald-500" />}
          {toast.type === 'error' && <AlertCircle size={20} className="text-red-500" />}
          {toast.type === 'info' && <Bell size={20} className="text-blue-500" />}
          <div>
            <h4 className="font-bold text-sm">{toast.title}</h4>
            <p className="text-xs opacity-90">{toast.message}</p>
          </div>
          <button onClick={() => removeToast(toast.id)} className="ml-auto text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = "", type = "button", disabled = false, ...props }) => {
  const baseStyle = "px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200",
    secondary: "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
    outline: "border border-slate-300 text-slate-600 hover:border-slate-800 hover:text-slate-800",
    ghost: "text-slate-500 hover:bg-slate-100",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200"
  };
  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const SidebarItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    {React.cloneElement(icon, { size: 18 })} {label}
  </button>
);

const MobileBottomNav = ({ currentView, onChangeView, onOpenBudget }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-[90] pb-safe">
      <div className="flex justify-around items-center h-20 px-4">
        <button 
          onClick={() => onChangeView('dashboard')}
          className={`flex flex-col items-center justify-center w-16 space-y-1.5 ${currentView === 'dashboard' ? 'text-slate-900' : 'text-slate-400'}`}
        >
          <Home size={22} strokeWidth={currentView === 'dashboard' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Início</span>
        </button>

        <button 
          onClick={() => onChangeView('services')}
          className={`flex flex-col items-center justify-center w-16 space-y-1.5 ${currentView === 'services' ? 'text-slate-900' : 'text-slate-400'}`}
        >
          <Wrench size={22} strokeWidth={currentView === 'services' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Serviços</span>
        </button>

        <div className="relative -top-6">
          <button 
            onClick={onOpenBudget} 
            className="flex items-center justify-center w-16 h-16 bg-slate-900 rounded-full text-white shadow-xl shadow-slate-300 active:scale-95 transition-transform border-4 border-white"
          >
            <Plus size={32} />
          </button>
        </div>

        <button 
          onClick={() => onChangeView('schedule')}
          className={`flex flex-col items-center justify-center w-16 space-y-1.5 ${currentView === 'schedule' ? 'text-slate-900' : 'text-slate-400'}`}
        >
          <Calendar size={22} strokeWidth={currentView === 'schedule' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Agenda</span>
        </button>

        <button 
          onClick={() => onChangeView('settings')}
          className={`flex flex-col items-center justify-center w-16 space-y-1.5 ${currentView === 'settings' ? 'text-slate-900' : 'text-slate-400'}`}
        >
          <Settings size={22} strokeWidth={currentView === 'settings' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Ajustes</span>
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// VIEWS E MODAIS
// ============================================================================

const BudgetGeneratorView = ({ userId, onScheduleFromBudget, initialTab = 'new', addToast, companySettings }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [savedBudgets, setSavedBudgets] = useState([]);
  const [viewingBudget, setViewingBudget] = useState(null); 
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const [budgetNumber, setBudgetNumber] = useState('');
  const [clientData, setClientData] = useState({ name: '', address: '', phone: '' });
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ description: '', qty: 1, price: '' });
  const [paymentTerms, setPaymentTerms] = useState('50% na entrada, 50% na finalização');
  const [validity, setValidity] = useState('15 dias');
  const [isGenerating, setIsGenerating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Pix');
  const [serviceType, setServiceType] = useState('Instalação Split');

  // Carrega html2pdf via CDN de forma segura
  useEffect(() => {
    const scriptId = 'html2pdf-script';
    if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.async = true;
        document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    const q = query(collection(db, 'artifacts', appId, 'users', userId, 'budgets'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setSavedBudgets(data);
    });
    return () => unsubscribe();
  }, [userId]);

  const nextBudgetNumber = savedBudgets.reduce((max, b) => {
    const num = parseInt(b.budgetNumber, 10);
    return !isNaN(num) && num > max ? num : max;
  }, 0) + 1;
  const nextBudgetNumberString = String(nextBudgetNumber).padStart(3, '0');

  const resetForm = () => {
    setViewingBudget(null);
    setIsEditing(false);
    setBudgetNumber('');
    setClientData({ name: '', address: '', phone: '' });
    setItems([]);
    setPaymentTerms('50% na entrada, 50% na finalização');
    setValidity('15 dias');
    setPaymentMethod('Pix');
    setServiceType('Instalação Split');
  };

  const handleAddItem = () => {
    if (!newItem.description || !newItem.price) return;
    setItems([...items, { id: Date.now(), ...newItem, price: Number(newItem.price), qty: Number(newItem.qty) }]);
    setNewItem({ description: '', qty: 1, price: '' });
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter(i => i.id !== id));
  };

  const totalBudget = items.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const handleSaveBudget = async () => {
    if (!clientData.name || items.length === 0) {
      addToast('Atenção', 'Preencha o cliente e adicione itens.', 'error');
      return;
    }
    
    setIsGenerating(true);
    try {
      if (viewingBudget && isEditing) {
         await updateDoc(doc(db, 'artifacts', appId, 'users', userId, 'budgets', viewingBudget.id), {
          clientData,
          items,
          paymentTerms,
          validity,
          total: totalBudget,
          updatedAt: new Date().toISOString(),
          paymentMethod,
          serviceType
        });
        addToast('Sucesso', 'Orçamento atualizado!', 'success');
        setIsEditing(false);
        setViewingBudget({
              ...viewingBudget,
              clientData, items, paymentTerms, validity, total: totalBudget, paymentMethod, serviceType
        });
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'users', userId, 'budgets'), {
          budgetNumber: budgetNumber || nextBudgetNumberString, 
          clientData,
          items,
          paymentTerms,
          validity,
          total: totalBudget,
          status: 'pending',
          createdAt: new Date().toISOString(),
          paymentMethod,
          serviceType
        });
        addToast('Sucesso', 'Orçamento salvo no histórico!', 'success');
        setActiveTab('history');
        resetForm();
      }
    } catch (e) {
      console.error(e);
      addToast('Erro', 'Falha ao salvar orçamento.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (typeof window.html2pdf === 'undefined') {
      addToast('Sistema', 'Carregando módulo de PDF... Tente novamente em alguns segundos.', 'info');
      return;
    }
    setIsGenerating(true);
    addToast('PDF', 'Gerando arquivo...', 'info');
    
    try {
      const element = document.getElementById('printable-area');
      if (!element) {
        throw new Error('Elemento de orçamento não encontrado.');
      }

      const clone = element.cloneNode(true);
      
      clone.classList.remove('hidden-for-print');
      clone.style.position = 'fixed';
      clone.style.top = '0';
      clone.style.left = '0';
      clone.style.width = '210mm';
      clone.style.minHeight = '297mm';
      clone.style.zIndex = '99999';
      clone.style.backgroundColor = 'white';
      clone.style.display = 'block'; 

      document.body.appendChild(clone);
      
      await new Promise(resolve => setTimeout(resolve, 1500));

      const fileName = `Orcamento_${budgetNumber || nextBudgetNumberString}_${(clientData.name || 'Cliente').replace(/\s+/g, '_')}.pdf`;
      
      const options = {
        margin: 0, 
        filename: fileName, 
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          scrollY: 0,
          windowWidth: 1024 
        }, 
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      await window.html2pdf().set(options).from(clone).save(); 
      addToast('Sucesso', 'Download iniciado!', 'success');

      document.body.removeChild(clone);

    } catch (error) { 
      console.error(error); 
      addToast('Erro', 'Falha ao gerar PDF.', 'error');
    } finally { 
      setIsGenerating(false); 
    }
  };

  const handleDeleteBudget = async (id) => {
    if(window.confirm("Apagar este orçamento?")) {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', userId, 'budgets', id));
      addToast('Deletado', 'Orçamento removido.', 'info');
    }
  };

  const handleLoadBudget = (budget) => {
    setViewingBudget(budget);
    setIsEditing(false);
    setClientData(budget.clientData);
    setItems(budget.items);
    setPaymentTerms(budget.paymentTerms);
    setValidity(budget.validity);
    setBudgetNumber(budget.budgetNumber);
    setPaymentMethod(budget.paymentMethod || 'Pix');
    setServiceType(budget.serviceType || 'Instalação Split');
    setActiveTab('new');
  };

  const isReadOnly = viewingBudget && !isEditing;

  return (
    <div className="animate-fade-in flex flex-col xl:flex-row gap-6 pb-20 md:pb-0 h-full">
      <style>{`
        #printable-area.hidden-for-print {
           position: fixed;
           left: -9999px;
           top: 0;
           width: 210mm;
           min-height: 297mm;
        }
      `}</style>

      <div className="flex-1 space-y-4 flex flex-col no-print">
        <header>
          <h2 className="text-2xl font-bold text-slate-800">Orçamentos</h2>
          <p className="text-slate-500 text-sm">Gerencie propostas e agende serviços futuros.</p>
        </header>

        <div className="flex p-1 bg-slate-200 rounded-lg w-full md:w-fit">
          <button 
            onClick={() => { setActiveTab('new'); resetForm(); }}
            className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'new' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Novo Orçamento
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Histórico Salvo
          </button>
        </div>

        {activeTab === 'new' && (
          <>
            <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              {viewingBudget && !isEditing && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Search size={16} />
                    Visualizando Orçamento #{budgetNumber}
                  </div>
                  <button onClick={resetForm} className="text-xs hover:underline font-bold">Fechar</button>
                </div>
              )}
              
              {isEditing && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-md flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Pencil size={16} />
                    Editando Orçamento #{budgetNumber}
                  </div>
                </div>
              )}

              <Card className="p-4 md:p-6">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={16} className="text-slate-500" />
                  <label className="text-sm font-semibold text-slate-700">Número do Orçamento</label>
                </div>
                <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Ex: 001" 
                      className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-800 outline-none text-lg font-bold text-slate-800 bg-slate-100 cursor-not-allowed" 
                      value={budgetNumber || (viewingBudget ? '' : nextBudgetNumberString)} 
                      readOnly={true} 
                    />
                    <Shield size={14} className="absolute right-3 top-3.5 text-slate-400" />
                </div>
              </Card>

              <Card className="p-4 md:p-6 space-y-4">
                <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-4 text-sm uppercase tracking-wide">1. Cliente e Local</h3>
                <div className="space-y-3">
                  <input type="text" placeholder="Nome do Cliente" className={`w-full p-2.5 border border-slate-300 rounded-md outline-none transition-all ${isReadOnly ? 'bg-slate-50 text-slate-600' : 'focus:ring-1 focus:ring-slate-800'}`} 
                    value={clientData.name} onChange={e => setClientData({...clientData, name: e.target.value})} readOnly={isReadOnly} />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Telefone / Contato" className={`w-full p-2.5 border border-slate-300 rounded-md outline-none transition-all ${isReadOnly ? 'bg-slate-50 text-slate-600' : 'focus:ring-1 focus:ring-slate-800'}`}
                      value={clientData.phone} onChange={e => setClientData({...clientData, phone: e.target.value})} readOnly={isReadOnly} />
                    
                    <input type="text" placeholder="Endereço / Local da Instalação" className={`w-full p-2.5 border border-slate-300 rounded-md outline-none transition-all ${isReadOnly ? 'bg-slate-50 text-slate-600' : 'focus:ring-1 focus:ring-slate-800'}`}
                    value={clientData.address} onChange={e => setClientData({...clientData, address: e.target.value})} readOnly={isReadOnly} />
                  </div>
                </div>
              </Card>

              <Card className="p-4 md:p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-4">
                    <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">2. Serviço e Itens</h3>
                </div>
                
                {/* SELETOR DE TIPO DE SERVIÇO */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Serviço Principal</label>
                    <select className={`w-full p-2.5 border border-slate-300 rounded-md outline-none transition-all ${isReadOnly ? 'bg-slate-50 text-slate-600 pointer-events-none' : 'focus:ring-1 focus:ring-slate-800'}`}
                      value={serviceType} onChange={e => setServiceType(e.target.value)} disabled={isReadOnly}>
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

                <div className={`flex flex-col md:flex-row gap-2 ${isReadOnly ? 'opacity-50 pointer-events-none' : ''}`}>
                  <input type="text" placeholder="Descrição (Ex: Mão de obra)" className="flex-[2] p-2 border border-slate-300 rounded-md focus:outline-none focus:border-slate-800" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
                  <div className="flex gap-2">
                    <input type="number" placeholder="Qtd" className="w-20 p-2 border border-slate-300 rounded-md focus:outline-none focus:border-slate-800" value={newItem.qty} onChange={e => setNewItem({...newItem, qty: e.target.value})} />
                    <input type="number" placeholder="R$ Unit" className="w-28 p-2 border border-slate-300 rounded-md focus:outline-none focus:border-slate-800" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} />
                    <Button onClick={handleAddItem} className="py-2 px-3 bg-slate-800"><Plus size={18} /></Button>
                  </div>
                </div>

                <div className="space-y-2 mt-4 bg-slate-50 p-4 rounded-md border border-slate-200">
                  {items.length === 0 ? <p className="text-center text-slate-400 text-sm italic">Lista vazia.</p> : 
                    items.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-sm bg-white p-2 rounded border border-slate-100">
                        <div className="flex-1">
                          <span className="font-medium text-slate-700">{item.description}</span>
                          <div className="text-xs text-slate-500">{item.qty}x R$ {item.price}</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-slate-800">R$ {(item.qty * item.price).toFixed(2)}</span>
                          {!isReadOnly && (
                             <button onClick={() => handleRemoveItem(item.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                          )}
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

              <Card className="p-4 md:p-6 space-y-4">
                <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-4 text-sm uppercase tracking-wide">
                  <Wallet size={16} className="inline mr-2 text-slate-500" />
                  3. Pagamento e Validade
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Forma de Pagamento</label>
                    <select className={`w-full p-2.5 border border-slate-300 rounded-md outline-none transition-all ${isReadOnly ? 'bg-slate-50 text-slate-600 pointer-events-none' : 'focus:ring-1 focus:ring-slate-800'}`}
                      value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} disabled={isReadOnly}>
                      <option>Pix</option>
                      <option>Dinheiro</option>
                      <option>Cartão de Crédito</option>
                      <option>Cartão de Débito</option>
                      <option>Boleto Bancário</option>
                      <option>Transferência</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Validade</label>
                    <input type="text" className={`w-full p-2.5 border border-slate-300 rounded-md outline-none transition-all ${isReadOnly ? 'bg-slate-50 text-slate-600' : 'focus:ring-1 focus:ring-slate-800'}`}
                      value={validity} onChange={e => setValidity(e.target.value)} readOnly={isReadOnly} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-slate-500 mb-1 block">Condições de Pagamento</label>
                    <input type="text" className={`w-full p-2.5 border border-slate-300 rounded-md outline-none transition-all ${isReadOnly ? 'bg-slate-50 text-slate-600' : 'focus:ring-1 focus:ring-slate-800'}`}
                      value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} readOnly={isReadOnly} />
                  </div>
                </div>
              </Card>
            </div>

            {/* Barra de Ações Inferior */}
            <div className="flex gap-2 pt-2 no-print">
               {(!viewingBudget || isEditing) ? (
                   <>
                      {isEditing && (
                          <Button onClick={() => handleLoadBudget(viewingBudget)} variant="secondary" className="flex-1 border-slate-400 text-slate-700">
                           Cancelar
                          </Button>
                      )}
                      <Button onClick={handleSaveBudget} variant="secondary" className="flex-1 border-slate-400 text-slate-700" disabled={isGenerating}>
                        <Save size={20} /> {isEditing ? 'Salvar Alterações' : 'Salvar no Sistema'}
                      </Button>
                   </>
               ) : (
                  <>
                    <Button onClick={resetForm} variant="secondary" className="flex-1 border-slate-400 text-slate-700">
                      <Plus size={20} /> Novo
                    </Button>
                    <Button onClick={() => setIsEditing(true)} variant="secondary" className="flex-1 border-blue-400 text-blue-700 hover:bg-blue-50">
                      <Pencil size={20} /> Editar
                    </Button>
                  </>
               )}
              
              <Button onClick={handleDownloadPDF} variant="success" className="flex-1 bg-emerald-700 hover:bg-emerald-800" disabled={isGenerating}>
                {isGenerating ? '...' : <><Download size={20} /> Baixar PDF</>}
              </Button>
            </div>
          </>
        )}

        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto space-y-3 no-print">
            {savedBudgets.length === 0 ? (
              <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                <History size={48} className="mx-auto mb-3 opacity-30" />
                <p>Nenhum orçamento salvo.</p>
              </div>
            ) : (
              savedBudgets.map(budget => (
                <Card key={budget.id} className="p-4 hover:border-blue-400 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                          #{budget.budgetNumber || 'S/N'}
                        </span>
                        {budget.status === 'scheduled' && (
                          <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                            Agendado
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-800 mt-1">{budget.clientData.name}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar size={10} /> {new Date(budget.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded text-sm">
                      R$ {Number(budget.total).toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="text-xs text-slate-500 mb-4 line-clamp-2">
                    {budget.items.map(i => `${i.qty}x ${i.description}`).join(', ')}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button 
                      onClick={() => handleLoadBudget(budget)}
                      className="flex-1 bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-bold py-2 rounded flex items-center justify-center gap-2 transition-colors"
                    >
                      <Search size={14} /> Visualizar / PDF
                    </button>

                    {budget.status === 'scheduled' ? (
                      <button 
                        disabled
                        className="flex-1 bg-slate-100 text-slate-400 text-xs font-bold py-2 rounded flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200"
                      >
                        <CheckCircle size={14} /> Já Agendado
                      </button>
                    ) : (
                      <button 
                        onClick={() => onScheduleFromBudget(budget)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-2 transition-colors"
                      >
                        <Calendar size={14} /> Agendar Visita
                      </button>
                    )}
                    
                    <button 
                      onClick={() => handleDeleteBudget(budget.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Área de Impressão - Oculta via CSS mas acessível para clonagem */}
      <div id="printable-area" className="hidden-for-print">
         {/* Conteúdo do PDF */}
         <div className="bg-white p-10 w-[210mm] min-h-[297mm] text-slate-800 font-sans relative">
            <div className="absolute top-0 left-0 w-full h-3 bg-slate-800"></div>
            
            <div className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-start mt-4">
              <div>
                <h1 className="text-3xl font-bold mb-1 text-slate-900">ORÇAMENTO</h1>
                <p className="text-sm text-slate-500 font-medium">Nº {budgetNumber} | {new Date().toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-slate-900">{companySettings?.companyName || 'InstalaControl'}</h2>
                <p className="text-sm text-slate-600">{companySettings?.companySubtitle || 'Soluções em Climatização'}</p>
                <p className="text-xs text-slate-400 mt-1">{companySettings?.phone || ''}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg mb-8 border border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-slate-400 flex items-center gap-2"><User size={12}/> Dados do Cliente</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                 <p><span className="font-bold text-slate-700">Nome:</span> {clientData.name}</p>
                 <p><span className="font-bold text-slate-700">Telefone:</span> {clientData.phone}</p>
                 <p className="col-span-2"><span className="font-bold text-slate-700">Endereço:</span> {clientData.address}</p>
                 <p className="col-span-2"><span className="font-bold text-slate-700">Tipo de Serviço:</span> {serviceType}</p>
              </div>
            </div>

            <table className="w-full text-left border-collapse mb-8">
              <thead>
                <tr className="border-b-2 border-slate-800">
                  <th className="py-3 font-bold w-1/2 text-sm uppercase tracking-wider">Descrição do Serviço</th>
                  <th className="py-3 font-bold text-center text-sm uppercase tracking-wider">Qtd</th>
                  <th className="py-3 font-bold text-right text-sm uppercase tracking-wider">Unitário</th>
                  <th className="py-3 font-bold text-right text-sm uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-b border-slate-100 text-sm">
                    <td className="py-4 text-slate-700 font-medium">{item.description}</td>
                    <td className="py-4 text-center text-slate-600">{item.qty}</td>
                    <td className="py-4 text-right text-slate-600">R$ {item.price.toFixed(2)}</td>
                    <td className="py-4 text-right font-bold text-slate-900">R$ {(item.qty * item.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mb-12">
               <div className="text-right bg-slate-50 p-6 rounded-lg border border-slate-100 min-w-[250px]">
                 <p className="text-sm text-slate-500 mb-1 uppercase tracking-wider font-bold">Total Geral</p>
                 <p className="text-3xl font-bold text-slate-900">R$ {totalBudget.toFixed(2)}</p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-8 border-t border-slate-200 pt-8">
               <div>
                  <h4 className="font-bold mb-2 text-sm uppercase tracking-wider text-slate-800"><DollarSign size={14} className="inline mr-1"/> Pagamento</h4>
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded border border-slate-100">{paymentMethod} - {paymentTerms}</p>
               </div>
               <div>
                  <h4 className="font-bold mb-2 text-sm uppercase tracking-wider text-slate-800">Validade</h4>
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded border border-slate-100">{validity}</p>
               </div>
            </div>
            
            <div className="absolute bottom-10 left-10 right-10 text-center text-xs text-slate-400 border-t border-slate-100 pt-4">
               <p>{companySettings?.footerText || 'Obrigado pela preferência! Entre em contato para dúvidas.'}</p>
            </div>
         </div>
      </div>
    </div>
  );
};

const SettingsView = ({ userId, addToast, settings, onSaveSettings }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    companySubtitle: '',
    phone: '',
    footerText: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSaveSettings(formData);
      addToast('Sucesso', 'Configurações salvas!', 'success');
    } catch (e) {
      addToast('Erro', 'Erro ao salvar.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Configurações da Empresa</h2>
        <p className="text-slate-500 text-sm">Personalize como sua empresa aparece nos orçamentos.</p>
      </header>

      <Card className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Empresa / Profissional</label>
          <input 
            type="text" 
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
            placeholder="Ex: InstalaTech Climatização"
            value={formData.companyName}
            onChange={e => setFormData({...formData, companyName: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Subtítulo / Slogan</label>
          <input 
            type="text" 
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
            placeholder="Ex: Soluções em Ar Condicionado e Refrigeração"
            value={formData.companySubtitle}
            onChange={e => setFormData({...formData, companySubtitle: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Telefone / Contato</label>
          <input 
            type="text" 
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
            placeholder="Ex: (11) 99999-9999"
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Texto de Rodapé (PDF)</label>
          <input 
            type="text" 
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
            placeholder="Ex: Garantia de 90 dias. Agradecemos a preferência."
            value={formData.footerText}
            onChange={e => setFormData({...formData, footerText: e.target.value})}
          />
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full py-3 bg-slate-900 text-white">
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </Card>
      
      <div className="mt-8 bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-blue-800 text-sm">
        <div className="mt-0.5"><Bell size={16}/></div>
        <div>
          <p className="font-bold">Dica Pro:</p>
          <p>Essas informações aparecerão automaticamente no cabeçalho e rodapé de todos os PDFs gerados na aba de Orçamentos.</p>
        </div>
      </div>
    </div>
  );
};

// --- Modal de Novo Orçamento (Dashboard) ---
const AddBudgetModal = ({ isOpen, onClose, onSave, isSaving, nextBudgetNumber, addToast }) => {
  const [formData, setFormData] = useState({
    budgetNumber: '',
    client: '',
    phone: '',
    address: '',
    serviceType: 'Instalação Split',
    paymentMethod: 'Pix',
    paymentTerms: '50% entrada + 50% final',
    validity: '15 dias'
  });
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ description: '', qty: 1, price: '' });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        budgetNumber: nextBudgetNumber || '001',
        client: '',
        phone: '',
        address: '',
        serviceType: 'Instalação Split',
        paymentMethod: 'Pix',
        paymentTerms: '50% entrada + 50% final',
        validity: '15 dias'
      });
      setItems([]);
      setNewItem({ description: '', qty: 1, price: '' });
    }
  }, [isOpen, nextBudgetNumber]);

  const handleAddItem = () => {
    if (!newItem.description || !newItem.price) return;
    setItems([...items, { id: Date.now(), ...newItem, price: Number(newItem.price), qty: Number(newItem.qty) }]);
    setNewItem({ description: '', qty: 1, price: '' });
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter(i => i.id !== id));
  };

  const totalBudget = items.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.client || items.length === 0) {
      addToast('Atenção', "Preencha o cliente e adicione pelo menos um item.", 'error');
      return;
    }
    
    onSave({
      budgetNumber: formData.budgetNumber,
      clientData: {
        name: formData.client,
        phone: formData.phone,
        address: formData.address
      },
      serviceType: formData.serviceType,
      paymentMethod: formData.paymentMethod,
      items,
      paymentTerms: formData.paymentTerms,
      validity: formData.validity,
      total: totalBudget,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full md:w-full max-w-2xl h-[90vh] md:h-auto md:max-h-[90vh] rounded-t-3xl md:rounded-2xl flex flex-col border-t md:border border-slate-100 shadow-2xl">
        <div className="w-full flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
        </div>
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Novo Orçamento Rápido</h3>
            <p className="text-slate-500 text-xs">Crie uma proposta comercial.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-slate-50/50 flex-1">
          <form id="budgetForm" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Briefcase size={14} /> Dados Principais
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Cliente</label>
                  <input required type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-base" 
                    value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} placeholder="Ex: João Silva" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                  <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-base" 
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="(00) 00000-0000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nº Orçamento</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-bold cursor-not-allowed outline-none text-base" 
                      value={formData.budgetNumber} 
                      readOnly 
                    />
                    <Shield size={14} className="absolute right-3 top-3.5 text-slate-400" />
                  </div>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Endereço da Obra/Cliente</label>
                  <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-base" 
                    value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Rua, Número, Bairro..." />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <ShoppingBag size={14} /> Itens do Serviço
                </h4>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-1 rounded-lg">Total: R$ {totalBudget.toFixed(2)}</span>
              </div>

              <div className="border-b border-slate-100 pb-4 mb-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Serviço Principal</label>
                  <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-base"
                    value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})}>
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
              
              <div className="flex flex-col md:flex-row gap-2">
                <input type="text" placeholder="Descrição (Ex: Instalação 12k BTUs)" className="flex-[2] p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-base"
                  value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
                <div className="flex gap-2">
                  <input type="number" placeholder="Qtd" className="w-20 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-base"
                    value={newItem.qty} onChange={e => setNewItem({...newItem, qty: e.target.value})} />
                  <input type="number" placeholder="R$" className="w-24 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-base"
                    value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} />
                  <Button onClick={handleAddItem} className="px-3 bg-slate-800"><Plus size={18} /></Button>
                </div>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {items.length === 0 ? <p className="text-center text-slate-400 text-sm italic">Lista vazia.</p> : 
                  items.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm bg-white p-2 rounded border border-slate-100">
                      <div>
                        <span className="font-medium text-slate-700">{item.description}</span>
                        <span className="text-xs text-slate-500 ml-2">({item.qty}x R$ {item.price})</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-slate-800">R$ {(item.qty * item.price).toFixed(2)}</span>
                        <button onClick={() => handleRemoveItem(item.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Wallet size={14} /> Pagamento e Condições
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Forma de Pagamento</label>
                  <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-base"
                    value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})}>
                    <option>Pix</option>
                    <option>Dinheiro</option>
                    <option>Cartão de Crédito</option>
                    <option>Cartão de Débito</option>
                    <option>Boleto Bancário</option>
                    <option>Transferência</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Validade do Orçamento</label>
                  <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-base" 
                    value={formData.validity} onChange={e => setFormData({...formData, validity: e.target.value})} placeholder="Ex: 15 dias" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Condições (Entrada/Parcelamento)</label>
                  <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-base" 
                    value={formData.paymentTerms} onChange={e => setFormData({...formData, paymentTerms: e.target.value})} placeholder="Ex: 50% entrada + 50% final" />
                </div>
              </div>
            </div>

          </form>
        </div>

        <div className="p-5 border-t border-slate-100 bg-white flex gap-3 pb-8 md:pb-5">
          <Button onClick={onClose} variant="secondary" className="flex-1" disabled={isSaving}>Cancelar</Button>
          <Button type="submit" form="budgetForm" className="flex-1" disabled={isSaving}>
            {isSaving ? 'Gerando...' : 'Gerar Orçamento'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- Modal de Novo Agendamento ---
const AddAppointmentModal = ({ isOpen, onClose, onSave, isSaving, initialData }) => {
  const [formData, setFormData] = useState({
    client: '',
    type: 'Visita Técnica',
    date: new Date().toISOString().substr(0, 10),
    time: '09:00',
    address: '',
    notes: '',
    budgetId: null,
    price: '',
    paymentMethod: '' 
  });

  const isFromBudget = !!initialData?.budgetId;

  useEffect(() => {
    if (isOpen) {
      setFormData({
        client: initialData?.client || '',
        type: initialData?.type || 'Visita Técnica',
        date: new Date().toISOString().substr(0, 10),
        time: '09:00',
        address: initialData?.address || '',
        notes: initialData?.notes || '',
        budgetId: initialData?.budgetId || null,
        price: initialData?.price || '',
        paymentMethod: initialData?.paymentMethod || ''
      });
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full md:w-full max-w-lg h-[90vh] md:h-auto rounded-t-3xl md:rounded-2xl flex flex-col border-t md:border border-slate-100 shadow-2xl">
        <div className="w-full flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
        </div>
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <Calendar size={20} className="text-blue-600" /> 
            Agendar Visita
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="appointmentForm" onSubmit={handleSubmit} className="space-y-4">
            
            {isFromBudget && (
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-xs text-blue-700 mb-2 flex items-center gap-2">
                <CheckCircle size={14} />
                <span>Dados do Orçamento. Preencha data e hora.</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
              <div className="relative">
                <input required type="text" className={`w-full p-3 border border-slate-200 rounded-xl outline-none transition-all text-base ${isFromBudget ? 'bg-slate-100 text-slate-500' : 'bg-slate-50 focus:ring-2 focus:ring-blue-500'}`}
                  value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} placeholder="Nome do cliente" 
                  readOnly={isFromBudget}
                />
                {isFromBudget && <Shield size={14} className="absolute right-3 top-3.5 text-slate-400" />}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                <input required type="date" className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-base"
                  value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hora</label>
                <input required type="time" className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-base"
                  value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Serviço</label>
              <div className="relative">
                {isFromBudget ? (
                  <div className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 flex justify-between items-center text-base">
                    {formData.type}
                    <Shield size={14} className="text-slate-400" />
                  </div>
                ) : (
                  <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-base"
                    value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option>Visita Técnica</option>
                    <option>Instalação Split</option>
                    <option>Instalação ACJ</option>
                    <option>Manutenção Preventiva</option>
                    <option>Manutenção Corretiva</option>
                    <option>Limpeza Química</option>
                    <option>Carga de Gás</option>
                    <option>Infraestrutura</option>
                  </select>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
              <div className="relative">
                <input type="text" className={`w-full p-3 border border-slate-200 rounded-xl outline-none transition-all text-base ${isFromBudget ? 'bg-slate-100 text-slate-500' : 'bg-slate-50 focus:ring-2 focus:ring-blue-500'}`}
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Local da visita" 
                  readOnly={isFromBudget}
                />
                {isFromBudget && <Shield size={14} className="absolute right-3 top-3.5 text-slate-400" />}
              </div>
            </div>
            
            {formData.price && (
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-sm text-emerald-800 font-medium flex items-center gap-2">
                <DollarSign size={16} />
                Valor Aprovado: R$ {Number(formData.price).toFixed(2)}
              </div>
            )}
          </form>
        </div>

        <div className="p-5 border-t border-slate-100 bg-white flex gap-3 pb-8 md:pb-5">
          <Button onClick={onClose} variant="secondary" className="flex-1" disabled={isSaving}>Cancelar</Button>
          <Button type="submit" form="appointmentForm" className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-blue-200" disabled={isSaving}>
            {isSaving ? 'Agendar' : 'Confirmar'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- Modal de Novo/Editar Serviço (Financeiro - Conclusão) ---
const AddServiceModal = ({ isOpen, onClose, onSave, isSaving, initialData }) => {
  const [formData, setFormData] = useState({
    client: '',
    type: 'Instalação Split',
    date: new Date().toISOString().substr(0, 10),
    price: '',
    paymentMethod: 'Pix',
    notes: ''
  });

  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ name: '', value: '' });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        client: initialData?.client || '',
        type: initialData?.type || 'Instalação Split',
        date: initialData?.date || new Date().toISOString().substr(0, 10),
        price: initialData?.price || '',
        paymentMethod: initialData?.paymentMethod || 'Pix',
        notes: initialData?.notes || ''
      });
      setExpenses(initialData?.expenses || []);
      setNewExpense({ name: '', value: '' });
    }
  }, [isOpen, initialData]);

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

  const isEditing = initialData?.id && initialData?.origin !== 'appointment';
  const modalTitle = isEditing ? 'Editar Registro' : (initialData?.origin === 'appointment' ? 'Concluir Serviço' : 'Novo Registro Financeiro');

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full md:w-full max-w-lg h-[90vh] md:h-auto rounded-t-3xl md:rounded-2xl flex flex-col border-t md:border border-slate-200 shadow-2xl">
        
        <div className="w-full flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
        </div>

        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <CheckCircle size={20} className="text-emerald-600" /> 
            {modalTitle}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="serviceForm" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dados do Fechamento</h4>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                <input required type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                  value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} placeholder="Nome do cliente" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                  <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                    value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
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
                  <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                    value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor Recebido</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-slate-500 font-medium">R$</span>
                    <input required type="number" step="0.01" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-lg font-bold text-slate-800"
                      value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0.00" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pagamento</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-slate-500"><DollarSign size={18}/></span>
                    <select className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                      value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})}>
                      <option>Pix</option>
                      <option>Dinheiro</option>
                      <option>Cartão de Crédito</option>
                      <option>Cartão de Débito</option>
                      <option>Boleto Bancário</option>
                      <option>Transferência</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Custos & Despesas (Opcional)</h4>
                <span className="text-xs font-bold bg-red-50 text-red-600 px-2 py-1 rounded-lg">Total: R$ {totalCost.toFixed(2)}</span>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex gap-2">
                  <input type="text" placeholder="Item (ex: Cobre)" className="flex-1 p-2 bg-white border border-slate-200 rounded-lg outline-none text-sm"
                    value={newExpense.name} onChange={e => setNewExpense({...newExpense, name: e.target.value})} />
                  <input type="number" placeholder="Valor" className="w-20 p-2 bg-white border border-slate-200 rounded-lg outline-none text-sm"
                    value={newExpense.value} onChange={e => setNewExpense({...newExpense, value: e.target.value})} 
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExpense())} />
                  <button type="button" onClick={handleAddExpense} className="bg-slate-800 text-white p-2 rounded-lg"><Plus size={16} /></button>
                </div>

                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {expenses.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center italic">Nenhum custo adicionado.</p>
                  ) : (
                    expenses.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-sm bg-white p-2 rounded-lg border border-slate-100">
                        <span className="text-slate-600 truncate">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-700">R$ {item.value.toFixed(2)}</span>
                          <button type="button" onClick={() => handleRemoveExpense(item.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-slate-100 bg-white flex gap-3 pb-8 md:pb-5">
          <Button onClick={onClose} variant="secondary" className="flex-1" disabled={isSaving}>Cancelar</Button>
          <Button type="submit" form="serviceForm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200" disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Finalizar Serviço'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- View de Agenda (RESTAURADA) ---
const ScheduleView = ({ appointments, onAddAppointment, onDeleteAppointment, onCompleteAppointment }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const changeMonth = (offset) => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + offset)));

  const renderCalendarDays = () => {
    const days = [];
    const totalDays = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 md:h-24 bg-slate-50/50"></div>);
    }

    for (let i = 1; i <= totalDays; i++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayAppointments = appointments.filter(a => a.date === dateString);
      const isSelected = selectedDate.getDate() === i && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
      const isToday = new Date().getDate() === i && new Date().getMonth() === month && new Date().getFullYear() === year;

      days.push(
        <div 
          key={i} 
          onClick={() => setSelectedDate(new Date(year, month, i))}
          className={`h-10 md:h-24 border border-slate-100 p-1 cursor-pointer transition-colors relative flex flex-col items-center md:items-start
            ${isSelected ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300 z-10' : 'hover:bg-slate-50'}
            ${isToday ? 'bg-slate-100 font-bold' : ''}
          `}
        >
          <span className={`text-xs md:text-sm ${isToday ? 'text-blue-600' : 'text-slate-600'} w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-100' : ''}`}>
            {i}
          </span>
          <div className="flex gap-0.5 mt-1 md:hidden">
            {dayAppointments.slice(0, 3).map((_, idx) => (
              <div key={idx} className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
            ))}
          </div>
          <div className="hidden md:flex flex-col gap-1 w-full mt-1">
            {dayAppointments.slice(0, 3).map(app => (
              <div key={app.id} className="text-[10px] bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate w-full">
                {app.time} {app.client.split(' ')[0]}
              </div>
            ))}
            {dayAppointments.length > 3 && (
              <span className="text-[9px] text-slate-400 pl-1">+{dayAppointments.length - 3} mais</span>
            )}
          </div>
        </div>
      );
    }
    return days;
  };

  const selectedDateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const selectedDayAppointments = appointments
    .filter(a => a.date === selectedDateString)
    .sort((a, b) => a.time.localeCompare(b.time));

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-140px)] md:h-auto pb-20">
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
        <div className="p-4 flex items-center justify-between border-b border-slate-100">
          <h2 className="font-bold text-slate-800 text-lg capitalize">
            {monthNames[currentDate.getMonth()]} <span className="text-slate-400 font-normal">{currentDate.getFullYear()}</span>
          </h2>
          <div className="flex gap-2">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-full"><ChevronLeft size={20} /></button>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-full"><ChevronRight size={20} /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <div key={d} className="py-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1">{renderCalendarDays()}</div>
      </div>

      <div className="w-full xl:w-96 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-auto xl:h-[600px]">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center rounded-t-2xl">
          <div>
            <h3 className="font-bold text-slate-800">Agenda do Dia</h3>
            <p className="text-xs text-slate-500 capitalize">{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <Button onClick={onAddAppointment} className="py-1 px-3 text-xs bg-blue-600 hover:bg-blue-700">
            <Plus size={14} /> Agendar
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {selectedDayAppointments.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Calendar size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Agenda livre.</p>
            </div>
          ) : (
            selectedDayAppointments.map(app => (
              <div key={app.id} className="border border-slate-100 rounded-lg p-3 hover:shadow-md transition-shadow bg-white relative group">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center justify-center bg-blue-50 text-blue-700 rounded px-2 min-w-[3.5rem] h-14">
                    <span className="text-sm font-bold">{app.time}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 truncate">{app.client}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1"><Wrench size={10} /> {app.type}</p>
                    {app.address && <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 truncate"><MapPin size={10} /> {app.address}</p>}
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-50 flex justify-between items-center">
                  <button onClick={() => onCompleteAppointment(app)} className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 px-2 py-1 hover:bg-emerald-50 rounded transition-colors">
                    <CheckCircle size={14} /> Concluir Serviço
                  </button>
                  <button onClick={() => onDeleteAppointment(app.id)} className="text-slate-300 hover:text-red-500 p-1"><Trash2 size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// --- View do Dashboard ---
const DashboardView = ({ services, appointments, onOpenBudget, onCompleteAppointment }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // --- Lógica para a Agenda do Dia ---
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const todayAppointments = appointments
    .filter(a => a.date === todayString)
    .sort((a, b) => a.time.localeCompare(b.time));

  const filterByDate = (items) => {
    return items.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.getMonth() === selectedMonth && itemDate.getFullYear() === selectedYear;
    });
  };

  const monthlyServices = filterByDate(services);

  // Cálculo de Lucro e Despesas (Data Science/Analysis)
  const monthlyRevenue = monthlyServices.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  const monthlyExpenses = monthlyServices.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0); // Assumindo que salvamos 'cost' no objeto
  const monthlyProfit = monthlyRevenue - monthlyExpenses;
  const margin = monthlyRevenue > 0 ? (monthlyProfit / monthlyRevenue) * 100 : 0;

  const monthlyCompletedServicesCount = monthlyServices.length;

  // Gráfico de Área (Receita Anual)
  const getMonthlyRevenueData = () => {
    const data = Array(12).fill(0).map((_, i) => ({
      name: new Date(0, i).toLocaleString('pt-BR', { month: 'short' }),
      revenue: 0,
      profit: 0
    }));
    services.forEach(service => {
      const date = new Date(service.date);
      if (date.getFullYear() === selectedYear) {
        data[date.getMonth()].revenue += (Number(service.price) || 0);
        data[date.getMonth()].profit += ((Number(service.price) || 0) - (Number(service.cost) || 0));
      }
    });
    return data;
  };
  const revenueData = getMonthlyRevenueData();

  // Dados para Gráfico de Pizza (Tipos)
  const serviceTypeCount = monthlyServices.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {});
  const serviceTypeData = Object.keys(serviceTypeCount).map(key => ({ name: key, value: serviceTypeCount[key] }));

  return (
    <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Visão Geral</h2>
          <p className="text-slate-500">Acompanhe seus resultados e lucro.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-sm font-medium text-slate-700 outline-none px-2 py-1 cursor-pointer"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>{new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}</option>
              ))}
            </select>
            <div className="w-px bg-slate-200 my-1"></div>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-sm font-medium text-slate-700 outline-none px-2 py-1 cursor-pointer"
            >
              <option value={2023}>2023</option>
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
            </select>
          </div>

          <div className="hidden md:block">
            <Button onClick={onOpenBudget} className="bg-slate-900 text-white shadow-lg shadow-slate-300">
              <Plus size={18} /> Novo Orçamento
            </Button>
          </div>
        </div>
      </header>

      {/* KPIs com Lucro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 relative overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Faturamento</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">
                   R$ {monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><DollarSign size={20} /></div>
            </div>
            <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-blue-500" style={{width: '100%'}}></div>
            </div>
          </Card>

          <Card className="p-6 relative overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lucro Líquido</p>
                <h3 className="text-2xl font-bold text-emerald-700 mt-1">
                   R$ {monthlyProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-xs text-emerald-600 mt-1 font-medium">{margin.toFixed(1)}% de margem</p>
              </div>
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><TrendingUp size={20} /></div>
            </div>
            <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500" style={{width: `${margin}%`}}></div>
            </div>
          </Card>

          <Card className="p-6 relative overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Serviços Realizados</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">
                   {monthlyCompletedServicesCount}
                </h3>
              </div>
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Wrench size={20} /></div>
            </div>
          </Card>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-3 gap-6">
        {/* Agenda do Dia - Ordem 1 no Mobile */}
        <Card className="p-0 order-1 md:order-2 md:col-span-1 h-full flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center rounded-t-2xl">
            <div>
              <h3 className="font-bold text-slate-800">Agenda de Hoje</h3>
              <p className="text-xs text-slate-500 capitalize">{today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] md:min-h-[300px]">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Calendar size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Agenda livre hoje.</p>
              </div>
            ) : (
              todayAppointments.map(app => (
                <div key={app.id} className="border border-slate-100 rounded-lg p-3 hover:shadow-md transition-shadow bg-white relative group flex gap-3 items-center">
                  <div className="flex flex-col items-center justify-center bg-blue-50 text-blue-700 rounded px-2 min-w-[3.5rem] h-14">
                    <span className="text-sm font-bold">{app.time}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 truncate">{app.client}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 truncate"><Wrench size={10} /> {app.type}</p>
                    {app.address && <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 truncate"><MapPin size={10} /> {app.address}</p>}
                  </div>
                  <button onClick={() => onCompleteAppointment(app)} className="text-emerald-600 hover:text-emerald-700 p-2 hover:bg-emerald-50 rounded-full transition-colors" title="Concluir Serviço">
                    <CheckCircle size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Gráfico Principal */}
        <div className="order-2 md:order-1 md:col-span-2">
            <Card className="p-6 md:p-8 h-full">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Análise Financeira</h3>
                    <p className="text-sm text-slate-500">Comparativo Faturamento vs. Lucro em {selectedYear}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold">
                      <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Lucro</span>
                      <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-slate-300"></div> Faturamento</span>
                  </div>
                </div>
                
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `R$${value/1000}k`} />
                      <Tooltip 
                        cursor={{stroke: '#e2e8f0', strokeWidth: 1}}
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Faturamento" />
                      <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" name="Lucro" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [budgetTab, setBudgetTab] = useState('new'); 
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [settings, setSettings] = useState(null);
  
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  
  const [serviceToEdit, setServiceToEdit] = useState(null);
  const [appointmentFromBudget, setAppointmentFromBudget] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState(null);

  // Sistema de Toasts
  const [toasts, setToasts] = useState([]);
  const addToast = (title, message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  };
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Erro na autenticação:", error);
        // Fallback para anônimo em caso de erro (ex: mismatch de token/config)
        try {
          await signInAnonymously(auth);
        } catch (anonError) {
          console.error("Erro na autenticação anônima:", anonError);
        }
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'services'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setServices(data);
    }, (error) => console.error("Erro serviços:", error));
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'appointments'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
      });
      setAppointments(data);
    }, (error) => console.error("Erro agenda:", error));
    return () => unsubscribe();
  }, [user]);

  // Carregar Configurações
  useEffect(() => {
    if (!user) return;
    const loadSettings = async () => {
      try {
        const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data());
        }
      } catch (e) {
        console.error("Erro carregar settings", e);
      }
    };
    loadSettings();
  }, [user]);

  const handleSaveSettings = async (newSettings) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile'), newSettings);
      setSettings(newSettings);
    } catch (e) {
      throw e;
    }
  };

  const handleSaveBudgetFromModal = async (budgetData) => {
    if (!user) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'budgets'), budgetData);
      addToast('Sucesso', 'Orçamento gerado com sucesso!', 'success');
      setIsBudgetModalOpen(false);
      setBudgetTab('history'); 
      setCurrentView('budget');
    } catch (e) {
      console.error(e);
      addToast('Erro', 'Erro ao salvar orçamento.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveService = async (serviceData) => {
    if (!user) return;
    setIsSaving(true);
    try {
      const isEditing = serviceToEdit?.id && serviceToEdit?.origin !== 'appointment';
      if (isEditing) {
        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'services', serviceToEdit.id), {
          ...serviceData,
          updatedAt: new Date().toISOString()
        });
        addToast('Atualizado', 'Serviço atualizado!', 'success');
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'services'), {
          ...serviceData,
          createdAt: new Date().toISOString()
        });
        addToast('Salvo', 'Novo serviço registrado!', 'success');
        
        // Auto-agenda se for data futura
        const today = new Date();
        today.setHours(0,0,0,0);
        const serviceDate = new Date(serviceData.date + 'T00:00:00');
        if (serviceDate > today) {
           await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'appointments'), {
             client: serviceData.client, type: serviceData.type, date: serviceData.date, time: '08:00', status: 'scheduled_auto', createdAt: new Date().toISOString(), notes: 'Agendado automaticamente.', price: serviceData.price 
           });
           addToast('Agenda', 'Visita agendada automaticamente.', 'info');
        }
        if (serviceToEdit && serviceToEdit.origin === 'appointment') {
          await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'appointments', serviceToEdit.id));
        }
      }
      setIsServiceModalOpen(false);
      setServiceToEdit(null);
      setCurrentView('services'); 
    } catch (e) {
      console.error(e); addToast('Erro', 'Erro ao salvar.', 'error');
    } finally { setIsSaving(false); }
  };

  const handleEditService = (service) => { setServiceToEdit(service); setIsServiceModalOpen(true); };
  const handleDeleteService = async (id) => { if (!user) return; if(window.confirm("Confirmar exclusão?")) { await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'services', id)); addToast('Deletado', 'Registro removido.', 'info'); } };
  
  const handleAddAppointment = async (newAppointment) => {
    if (!user) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'appointments'), { ...newAppointment, createdAt: new Date().toISOString(), status: 'scheduled' });
      if (newAppointment.budgetId) await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'budgets', newAppointment.budgetId), { status: 'scheduled' });
      addToast('Agendado', 'Visita confirmada na agenda.', 'success');
      setIsAppointmentModalOpen(false); setAppointmentFromBudget(null); 
    } catch (e) { console.error(e); addToast('Erro', 'Falha ao agendar.', 'error'); } finally { setIsSaving(false); }
  };
  const handleDeleteAppointment = async (id) => { if (!user) return; if(window.confirm("Cancelar?")) { await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'appointments', id)); addToast('Cancelado', 'Agendamento removido.', 'info'); } };
  
  const handleCompleteAppointment = (appointment) => { 
    setServiceToEdit({ 
      ...appointment, 
      price: appointment.price || '', 
      paymentMethod: appointment.paymentMethod || 'Pix', 
      origin: 'appointment', 
      notes: `(Agendado ${appointment.time}) ${appointment.notes || ''}` 
    }); 
    setIsServiceModalOpen(true); 
  };
  
  const handleScheduleFromBudget = (budget) => { 
    setAppointmentFromBudget({ 
      client: budget.clientData.name, 
      address: budget.clientData.address, 
      type: budget.serviceType || 'Instalação Split', 
      notes: `Ref. Orçamento #${budget.budgetNumber}.`, 
      budgetId: budget.id, 
      price: budget.total,
      paymentMethod: budget.paymentMethod 
    }); 
    setIsAppointmentModalOpen(true); 
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-600">
      <GlobalStyles />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Modais */}
      <AddServiceModal isOpen={isServiceModalOpen} onClose={() => { setIsServiceModalOpen(false); setServiceToEdit(null); }} onSave={handleSaveService} isSaving={isSaving} initialData={serviceToEdit} />
      <AddAppointmentModal isOpen={isAppointmentModalOpen} onClose={() => setIsAppointmentModalOpen(false)} onSave={handleAddAppointment} isSaving={isSaving} initialData={appointmentFromBudget} />
      <AddBudgetModal isOpen={isBudgetModalOpen} onClose={() => setIsBudgetModalOpen(false)} onSave={handleSaveBudgetFromModal} isSaving={isSaving} nextBudgetNumber={String(Date.now()).slice(-3)} addToast={addToast} />

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 h-screen fixed z-50">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-xl text-white"><Snowflake size={20} /></div>
          <div><h1 className="font-bold text-white text-base tracking-wide">InstalaControl</h1><p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Professional</p></div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <SidebarItem icon={<LayoutDashboard size={18} />} label="Visão Geral" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
          <SidebarItem icon={<Calendar size={18} />} label="Agenda" active={currentView === 'schedule'} onClick={() => setCurrentView('schedule')} />
          <SidebarItem icon={<Wrench size={18} />} label="Serviços" active={currentView === 'services'} onClick={() => setCurrentView('services')} />
          <SidebarItem icon={<FileText size={18} />} label="Orçamentos" active={currentView === 'budget'} onClick={() => { setBudgetTab('new'); setCurrentView('budget'); }} />
          <SidebarItem icon={<Settings size={18} />} label="Configurações" active={currentView === 'settings'} onClick={() => setCurrentView('settings')} />
        </nav>
      </aside>

      {/* Header Mobile */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 z-30 px-4 py-3 flex items-center justify-center shadow-lg">
         <span className="font-bold text-white text-sm flex items-center gap-2"><Snowflake size={16} /> InstalaControl</span>
      </div>

      <MobileBottomNav currentView={currentView} onChangeView={setCurrentView} onOpenBudget={() => setIsBudgetModalOpen(true)} />

      <main className="flex-1 md:ml-64 p-6 md:p-10 pt-20 md:pt-10 overflow-y-auto">
        <div className={`max-w-6xl mx-auto ${currentView === 'budget' || currentView === 'schedule' ? 'max-w-7xl' : ''}`}>
          {currentView === 'dashboard' && <DashboardView services={services} appointments={appointments} onOpenBudget={() => setIsBudgetModalOpen(true)} onCompleteAppointment={handleCompleteAppointment} />}
          {currentView === 'schedule' && <ScheduleView appointments={appointments} onAddAppointment={() => { setAppointmentFromBudget(null); setIsAppointmentModalOpen(true); }} onDeleteAppointment={handleDeleteAppointment} onCompleteAppointment={handleCompleteAppointment} />}
          {currentView === 'settings' && <SettingsView userId={user?.uid} addToast={addToast} settings={settings} onSaveSettings={handleSaveSettings} />}
          {currentView === 'services' && (
            <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
                <header className="flex justify-between items-center">
                    <div><h2 className="text-2xl font-bold text-slate-800">Serviços</h2><p className="text-slate-500 text-sm">Histórico completo.</p></div>
                    <Button onClick={() => { setServiceToEdit(null); setIsServiceModalOpen(true); }}><Plus size={18} /> Novo</Button>
                </header>
                <div className="grid grid-cols-1 gap-4">
                    {services.map(service => (
                        <Card key={service.id} className="p-4 hover:border-slate-300 transition-colors">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-slate-800">{service.client}</h4>
                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Calendar size={12}/> {new Date(service.date).toLocaleDateString('pt-BR')} <span className="bg-slate-100 px-2 rounded-full text-slate-600 font-medium ml-2">{service.type}</span></p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-emerald-600">R$ {Number(service.price).toFixed(2)}</p>
                                    {service.cost > 0 && <p className="text-xs text-red-400">Custo: -R$ {Number(service.cost).toFixed(2)}</p>}
                                    <div className="flex gap-2 mt-2 justify-end">
                                        <button onClick={() => handleEditService(service)} className="text-slate-400 hover:text-blue-600"><Pencil size={16}/></button>
                                        <button onClick={() => handleDeleteService(service.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
          )}
          {currentView === 'budget' && <BudgetGeneratorView userId={user?.uid} onScheduleFromBudget={handleScheduleFromBudget} initialTab={budgetTab} addToast={addToast} companySettings={settings} />}
        </div>
      </main>
    </div>
  );
}