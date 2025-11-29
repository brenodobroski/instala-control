import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Wrench, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar as CalendarIcon, 
  Trash2, 
  Search,
  Snowflake,
  Menu,
  X,
  Plus,
  ShoppingBag,
  FileText,
  Download,
  Briefcase,
  Home,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  CheckCircle,
  MoreVertical,
  Pencil,
  Save,
  History,
  CalendarCheck,
  Hash,
  Eye,
  RotateCcw // Ícone para resetar/novo
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
  doc,
  updateDoc
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
const appId = typeof __app_id !== 'undefined' ? __app_id : 'instala-control-app';

// --- Componentes UI Básicos ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-slate-200 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = "", type = "button", disabled = false, ...props }) => {
  const baseStyle = "px-4 py-3 md:py-2 rounded-md font-medium text-sm transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
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
    price: '' 
  });

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
        price: initialData?.price || '' 
      });
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-[95%] md:w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-blue-50/50">
          <h3 className="font-semibold text-blue-900 text-lg flex items-center gap-2">
            <CalendarIcon size={18} className="text-blue-700" /> 
            Agendar Visita
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-blue-100 rounded text-blue-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto">
          <form id="appointmentForm" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
              <input 
                required
                type="text" 
                className="w-full p-3 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-600 outline-none transition-colors text-base"
                placeholder="Nome do cliente..."
                value={formData.client}
                onChange={e => setFormData({...formData, client: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                <input 
                  required
                  type="date" 
                  className="w-full p-3 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-600 outline-none text-base"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hora</label>
                <input 
                  required
                  type="time" 
                  className="w-full p-3 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-600 outline-none text-base"
                  value={formData.time}
                  onChange={e => setFormData({...formData, time: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Serviço</label>
              <select 
                className="w-full p-3 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-600 outline-none bg-white text-base"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option>Visita Técnica</option>
                <option>Instalação</option>
                <option>Manutenção</option>
                <option>Limpeza</option>
                <option>Orçamento</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
              <input 
                type="text" 
                className="w-full p-3 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-600 outline-none text-base"
                placeholder="Rua, Número, Bairro..."
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
              <textarea 
                className="w-full p-3 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-600 outline-none text-sm"
                rows="2"
                placeholder="Detalhes..."
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
            </div>
            
            {formData.price && (
              <div className="bg-emerald-50 p-2 rounded border border-emerald-100 text-xs text-emerald-700 font-medium flex items-center gap-2">
                <DollarSign size={14} />
                Valor estimado vinculado: R$ {Number(formData.price).toFixed(2)}
              </div>
            )}
          </form>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
          <Button onClick={onClose} variant="secondary" className="flex-1" disabled={isSaving}>Cancelar</Button>
          <Button type="submit" form="appointmentForm" className="flex-1 bg-blue-700 hover:bg-blue-800" disabled={isSaving}>
            {isSaving ? 'Agendando...' : 'Agendar'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- Modal de Novo/Editar Serviço (Financeiro) ---
const AddServiceModal = ({ isOpen, onClose, onSave, isSaving, initialData }) => {
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
        client: initialData?.client || '',
        type: initialData?.type || 'Instalação Split',
        date: initialData?.date || new Date().toISOString().substr(0, 10),
        price: initialData?.price || '',
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
  const modalTitle = isEditing ? 'Editar Serviço' : (initialData?.origin === 'appointment' ? 'Finalizar Serviço' : 'Novo Registro');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-[95%] md:w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
            <PlusCircle size={18} className="text-slate-700" /> 
            {modalTitle}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded text-slate-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto">
          <form id="serviceForm" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">Dados Financeiros</h4>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cliente / Empresa</label>
                <input 
                  required
                  type="text" 
                  className="w-full p-3 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-800 focus:border-slate-800 outline-none transition-colors text-base"
                  placeholder="Ex: Condomínio Solar"
                  value={formData.client}
                  onChange={e => setFormData({...formData, client: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Serviço</label>
                  <select 
                    className="w-full p-3 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-800 outline-none bg-white text-base"
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
                    className="w-full p-3 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-800 outline-none text-base"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor Cobrado</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-500 font-medium">R$</span>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full pl-10 p-3 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none text-lg font-semibold text-slate-800"
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
              
              <div className="bg-slate-50 p-3 md:p-4 rounded-md border border-slate-200 mb-4">
                <div className="flex flex-col md:flex-row gap-2 mb-2">
                  <input 
                    type="text"
                    placeholder="Item (ex: Suporte)"
                    className="flex-1 p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-slate-500"
                    value={newExpense.name}
                    onChange={e => setNewExpense({...newExpense, name: e.target.value})}
                  />
                  <div className="flex gap-2">
                    <input 
                      type="number"
                      placeholder="Valor"
                      className="w-full md:w-24 p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-slate-500"
                      value={newExpense.value}
                      onChange={e => setNewExpense({...newExpense, value: e.target.value})}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExpense())}
                    />
                    <button 
                      type="button"
                      onClick={handleAddExpense}
                      className="bg-slate-800 text-white p-2 rounded-md hover:bg-slate-700 transition-colors shrink-0"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
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
                            <Trash2 size={16} />
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
                className="w-full p-3 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-800 outline-none text-sm"
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

// --- View de Agenda ---
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

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-140px)] md:h-auto pb-20">
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col">
        <div className="p-4 flex items-center justify-between border-b border-slate-100">
          <h2 className="font-bold text-slate-800 text-lg capitalize">
            {["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"][currentDate.getMonth()]} <span className="text-slate-400 font-normal">{currentDate.getFullYear()}</span>
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

      <div className="w-full xl:w-96 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col h-auto xl:h-[600px]">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
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
              <CalendarIcon size={32} className="mx-auto mb-2 opacity-30" />
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

// --- View de Orçamento ---
const BudgetGeneratorView = ({ userId, onScheduleFromBudget }) => {
  const [activeTab, setActiveTab] = useState('new');
  const [savedBudgets, setSavedBudgets] = useState([]);
  const [viewingBudget, setViewingBudget] = useState(null); // Estado para controlar visualização

  // Estados do Formulário
  const [budgetNumber, setBudgetNumber] = useState('');
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

  // Função para limpar o formulário e sair do modo visualização
  const resetForm = () => {
    setViewingBudget(null);
    setBudgetNumber('');
    setClientData({ name: '', address: '', phone: '' });
    setItems([]);
    setPaymentTerms('50% na entrada, 50% na finalização');
    setValidity('15 dias');
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
      alert("Preencha o cliente e adicione itens.");
      return;
    }
    
    try {
      setIsGenerating(true);
      await addDoc(collection(db, 'artifacts', appId, 'users', userId, 'budgets'), {
        budgetNumber: budgetNumber || 'S/N',
        clientData,
        items,
        paymentTerms,
        validity,
        total: totalBudget,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      alert("Orçamento salvo no sistema!");
      setActiveTab('history');
      resetForm();
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (typeof window.html2pdf === 'undefined') {
      alert("Carregando biblioteca... Tente em 2 segundos.");
      return;
    }
    setIsGenerating(true);
    const element = document.getElementById('printable-area');
    const fileName = `Orcamento_${budgetNumber || 'Novo'}_${clientData.name.replace(/\s+/g, '_') || 'Cliente'}.pdf`;
    const options = {
      margin: 0, filename: fileName, image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    try { await window.html2pdf().set(options).from(element).save(); } 
    catch (error) { console.error(error); alert("Erro ao gerar PDF."); } 
    finally { setIsGenerating(false); }
  };

  const handleDeleteBudget = async (id) => {
    if(window.confirm("Apagar este orçamento do histórico?")) {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', userId, 'budgets', id));
    }
  };

  const handleLoadBudget = (budget) => {
    setViewingBudget(budget); // Ativa modo visualização
    setClientData(budget.clientData);
    setItems(budget.items);
    setPaymentTerms(budget.paymentTerms);
    setValidity(budget.validity);
    setBudgetNumber(budget.budgetNumber);
    setActiveTab('new');
  };

  return (
    <div className="animate-fade-in flex flex-col xl:flex-row gap-6 pb-20 md:pb-0 h-full">
      <div className="flex-1 space-y-4 flex flex-col">
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
              {viewingBudget && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Eye size={16} />
                    Modo de Visualização (Apenas Leitura)
                  </div>
                  <button onClick={resetForm} className="text-xs hover:underline">Fechar</button>
                </div>
              )}

              <Card className="p-4 md:p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Hash size={16} className="text-slate-500" />
                  <label className="text-sm font-semibold text-slate-700">Número do Orçamento</label>
                </div>
                <input 
                  type="text" 
                  placeholder="Ex: 001/2023" 
                  className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-800 outline-none text-lg font-bold text-slate-800" 
                  value={budgetNumber} 
                  onChange={e => setBudgetNumber(e.target.value)} 
                />
              </Card>

              <Card className="p-4 md:p-6 space-y-4">
                <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-4 text-sm uppercase tracking-wide">1. Cliente</h3>
                <div className="space-y-3">
                  <input type="text" placeholder="Nome do Cliente" className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-800 outline-none" value={clientData.name} onChange={e => setClientData({...clientData, name: e.target.value})} />
                  <input type="text" placeholder="Endereço / Local" className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-800 outline-none" value={clientData.address} onChange={e => setClientData({...clientData, address: e.target.value})} />
                  <input type="text" placeholder="Telefone / Contato" className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-800 outline-none" value={clientData.phone} onChange={e => setClientData({...clientData, phone: e.target.value})} />
                </div>
              </Card>

              <Card className="p-4 md:p-6 space-y-4">
                <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-4 text-sm uppercase tracking-wide">2. Itens</h3>
                <div className="flex flex-col md:flex-row gap-2">
                  <input type="text" placeholder="Descrição" className="flex-[2] p-2 border border-slate-300 rounded-md focus:outline-none focus:border-slate-800" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
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

              <Card className="p-4 md:p-6 space-y-4">
                <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-4 text-sm uppercase tracking-wide">3. Detalhes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" className="w-full p-2.5 border border-slate-300 rounded-md outline-none" value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} />
                  <input type="text" className="w-full p-2.5 border border-slate-300 rounded-md outline-none" value={validity} onChange={e => setValidity(e.target.value)} />
                </div>
              </Card>
            </div>

            <div className="flex gap-2 pt-2">
              {!viewingBudget ? (
                <Button onClick={handleSaveBudget} variant="secondary" className="flex-1 border-slate-400 text-slate-700" disabled={isGenerating}>
                  <Save size={20} /> Salvar no Sistema
                </Button>
              ) : (
                <Button onClick={resetForm} variant="secondary" className="flex-1 border-slate-400 text-slate-700">
                  <RotateCcw size={20} /> Limpar / Novo
                </Button>
              )}
              
              <Button onClick={handleDownloadPDF} variant="success" className="flex-1 bg-emerald-700 hover:bg-emerald-800" disabled={isGenerating}>
                {isGenerating ? '...' : <><Download size={20} /> Baixar PDF</>}
              </Button>
            </div>
          </>
        )}

        {/* ... Restante do código (histórico e preview) sem alterações ... */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto space-y-3">
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
                        <CalendarIcon size={10} /> {new Date(budget.createdAt).toLocaleDateString('pt-BR')}
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
                      <Eye size={14} /> Visualizar / PDF
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
                        <CalendarCheck size={14} /> Agendar Visita
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

      <div className={`flex-1 bg-slate-300 p-4 md:p-8 overflow-auto rounded-lg flex justify-center items-start min-h-[500px] border-4 border-slate-300 ${activeTab === 'history' ? 'hidden xl:flex opacity-50 pointer-events-none' : ''}`}>
        <div className="w-full overflow-x-auto">
          <div id="printable-area" className="bg-white shadow-2xl min-w-[210mm] w-[210mm] min-h-[297mm] p-[15mm] md:p-[20mm] relative text-slate-800 mx-auto" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
            <div className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">ORÇAMENTO</h1>
                <p className="text-sm text-slate-500">Nº {budgetNumber || '----'} | Emitido em: {new Date().toLocaleDateString('pt-BR')}</p>
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
    </div>
  );
};

// --- Componente Bottom Navigation (Mobile) ---
const MobileBottomNav = ({ currentView, onChangeView, onOpenAdd }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-40 pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        <button 
          onClick={() => onChangeView('dashboard')}
          className={`flex flex-col items-center justify-center w-16 space-y-1 ${currentView === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <Home size={20} />
          <span className="text-[10px] font-medium">Início</span>
        </button>

        <button 
          onClick={() => onChangeView('services')}
          className={`flex flex-col items-center justify-center w-16 space-y-1 ${currentView === 'services' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <Wrench size={20} />
          <span className="text-[10px] font-medium">Serviços</span>
        </button>

        {/* Botão Central de Ação */}
        <div className="relative -top-5">
          <button 
            onClick={onOpenAdd}
            className="flex items-center justify-center w-14 h-14 bg-slate-900 rounded-full text-white shadow-lg shadow-slate-300 active:scale-95 transition-transform"
          >
            <Plus size={28} />
          </button>
        </div>

        <button 
          onClick={() => onChangeView('schedule')}
          className={`flex flex-col items-center justify-center w-16 space-y-1 ${currentView === 'schedule' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <CalendarIcon size={20} />
          <span className="text-[10px] font-medium">Agenda</span>
        </button>

        <button 
          onClick={() => onChangeView('budget')}
          className={`flex flex-col items-center justify-center w-16 space-y-1 ${currentView === 'budget' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <FileText size={20} />
          <span className="text-[10px] font-medium">Orçamento</span>
        </button>
      </div>
    </div>
  );
};

// --- Aplicação Principal ---
export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  
  const [serviceToEdit, setServiceToEdit] = useState(null);
  const [appointmentFromBudget, setAppointmentFromBudget] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
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

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'services'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setServices(data);
    });
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
    });
    return () => unsubscribe();
  }, [user]);

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
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'services'), {
          ...serviceData,
          createdAt: new Date().toISOString()
        });

        const today = new Date();
        today.setHours(0,0,0,0);
        const serviceDate = new Date(serviceData.date + 'T00:00:00');

        if (serviceDate > today) {
           await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'appointments'), {
             client: serviceData.client,
             type: serviceData.type,
             date: serviceData.date,
             time: '08:00', 
             status: 'scheduled_auto',
             createdAt: new Date().toISOString(),
             notes: 'Agendado automaticamente pelo cadastro de serviço.',
             price: serviceData.price 
           });
        }

        if (serviceToEdit && serviceToEdit.origin === 'appointment') {
          await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'appointments', serviceToEdit.id));
        }
      }

      setIsModalOpen(false);
      setServiceToEdit(null);
      setCurrentView('services'); 
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditService = (service) => {
    setServiceToEdit(service);
    setIsModalOpen(true);
  };

  const handleDeleteService = async (id) => {
    if (!user) return;
    if(window.confirm("Confirmar exclusão?")) {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'services', id));
    }
  };

  const handleAddAppointment = async (newAppointment) => {
    if (!user) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'appointments'), {
        ...newAppointment,
        createdAt: new Date().toISOString(),
        status: 'scheduled'
      });

      if (newAppointment.budgetId) {
        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'budgets', newAppointment.budgetId), {
          status: 'scheduled'
        });
      }

      setIsAppointmentModalOpen(false);
      setAppointmentFromBudget(null); 
    } catch (e) {
      console.error(e);
      alert("Erro ao agendar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!user) return;
    if(window.confirm("Cancelar agendamento?")) {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'appointments', id));
    }
  };

  const handleCompleteAppointment = (appointment) => {
    setServiceToEdit({
      ...appointment,
      price: appointment.price || '', 
      origin: 'appointment',
      notes: `(Agendado para ${appointment.time}) ${appointment.notes || ''}`
    });
    setIsModalOpen(true); 
  };

  const handleScheduleFromBudget = (budget) => {
    const formattedData = {
      client: budget.clientData.name,
      address: budget.clientData.address,
      type: 'Instalação', 
      notes: `Ref. Orçamento #${budget.budgetNumber || 'S/N'}. R$ ${budget.total}.`,
      budgetId: budget.id,
      price: budget.total 
    };
    
    setAppointmentFromBudget(formattedData);
    setIsAppointmentModalOpen(true);
  };

  const handleOpenMainAdd = () => {
    if (currentView === 'schedule') {
      setAppointmentFromBudget(null);
      setIsAppointmentModalOpen(true);
    } else {
      setServiceToEdit(null);
      setIsModalOpen(true);
    }
  };

  const DashboardView = () => {
    const totalRevenue = services.reduce((acc, curr) => acc + Number(curr.price), 0);
    const totalCost = services.reduce((acc, curr) => acc + Number(curr.cost), 0);
    const profit = totalRevenue - totalCost;
    const margin = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : 0;
    
    const today = new Date().toISOString().substr(0, 10);
    const visitsToday = appointments.filter(a => a.date === today).length;

    const chartData = services.slice(0, 10).map(s => ({
      name: s.client.split(' ')[0],
      Faturamento: s.price,
      Custo: s.cost
    })).reverse();

    return (
      <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Visão Geral</h2>
            <p className="text-slate-500 text-sm">Performance financeira e operacional.</p>
          </div>
          <div className="hidden md:block">
            <Button onClick={() => setIsModalOpen(true)} className="shadow-lg shadow-slate-200">
              <Plus size={18} /> Novo Serviço
            </Button>
          </div>
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

          <Card className="p-5 border-t-4 border-t-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Visitas Hoje</p>
                <h3 className="text-2xl font-bold text-blue-700 mt-1">{visitsToday}</h3>
              </div>
              <div className="p-2 bg-blue-100 rounded text-blue-600 cursor-pointer" onClick={() => setCurrentView('schedule')}>
                <CalendarIcon size={20} />
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

        <Card className="p-4 md:p-6">
          <h3 className="font-semibold text-slate-800 mb-6 text-sm uppercase tracking-wide">Desempenho Recente</h3>
          <div className="h-64 md:h-72 w-full">
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
      <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
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
            <div className="hidden md:block">
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus size={18} /> <span>Novo</span>
              </Button>
            </div>
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
                      <span className="flex items-center gap-1"><CalendarIcon size={14} /> {new Date(service.date).toLocaleDateString('pt-BR')}</span>
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
                    <div className="flex gap-1">
                      <button onClick={() => handleEditService(service)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Editar">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDeleteService(service.id)} className="p-2 text-slate-300 hover:text-red-600 transition-colors" title="Excluir">
                        <Trash2 size={16} />
                      </button>
                    </div>
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
      {/* Modais */}
      <AddServiceModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setServiceToEdit(null); }} 
        onSave={handleSaveService} 
        isSaving={isSaving} 
        initialData={serviceToEdit}
      />
      
      <AddAppointmentModal 
        isOpen={isAppointmentModalOpen} 
        onClose={() => setIsAppointmentModalOpen(false)} 
        onSave={handleAddAppointment} 
        isSaving={isSaving} 
        initialData={appointmentFromBudget} // Passa dados do orçamento
      />

      {/* Sidebar Desktop */}
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
          <SidebarItem icon={<CalendarIcon size={18} />} label="Agenda" active={currentView === 'schedule'} onClick={() => setCurrentView('schedule')} />
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

      {/* Header Mobile */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 z-30 px-4 py-3 flex items-center justify-center shadow-md">
         <span className="font-bold text-white text-sm flex items-center gap-2">
           <Snowflake size={16} /> InstalaControl
         </span>
      </div>

      {/* Navegação Inferior (Mobile) */}
      <MobileBottomNav 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        onOpenAdd={handleOpenMainAdd} 
      />

      {/* Área Principal */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8 overflow-y-auto">
        <div className={`max-w-5xl mx-auto ${currentView === 'budget' || currentView === 'schedule' ? 'max-w-7xl' : ''}`}>
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'schedule' && <ScheduleView 
              appointments={appointments} 
              onAddAppointment={() => { setAppointmentFromBudget(null); setIsAppointmentModalOpen(true); }}
              onDeleteAppointment={handleDeleteAppointment}
              onCompleteAppointment={handleCompleteAppointment}
          />}
          {currentView === 'services' && <ServiceListView />}
          {currentView === 'budget' && <BudgetGeneratorView 
              userId={user?.uid} 
              onScheduleFromBudget={handleScheduleFromBudget} 
          />}
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