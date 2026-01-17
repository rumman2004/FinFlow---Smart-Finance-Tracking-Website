import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import AuthContext from '../context/AuthContext';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { 
    DollarSign, ArrowDownRight, ArrowUpRight, Activity, Wallet, FolderPlus, X, Trash2, Settings, Calculator, Star
} from 'lucide-react';

const Dashboard = () => {
    const { token } = useContext(AuthContext);
    
    // Data States
    const [transactions, setTransactions] = useState([]);
    const [folders, setFolders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Chart Filters
    const [chartView, setChartView] = useState('monthly'); 
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

    // Responsive State
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Transaction Modal States
    const [showModal, setShowModal] = useState(false);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('expense');
    const [selectedFolder, setSelectedFolder] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // --- CUSTOM CARD STATE ---
    const [customCards, setCustomCards] = useState(() => {
        const saved = localStorage.getItem('finflow_custom_cards');
        return saved ? JSON.parse(saved) : [];
    });

    const [showCardModal, setShowCardModal] = useState(false);
    
    const [newCard, setNewCard] = useState({
        title: '',
        color: 'text-blue-500 bg-blue-500/10',
        formula: { income: 'ignore', expense: 'ignore', savings: 'ignore', investment: 'ignore', extra: 'ignore' }
    });

    // Handle Resize
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Load API Data
    useEffect(() => {
        fetchData();
    }, [token]);

    // Save Custom Cards
    useEffect(() => {
        localStorage.setItem('finflow_custom_cards', JSON.stringify(customCards));
    }, [customCards]);

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [txRes, folderRes] = await Promise.all([
                axios.get(`${API_URL}/api/transactions`, config),
                axios.get(`${API_URL}/api/folders`, config)
            ]);
            setTransactions(txRes.data);
            setFolders(folderRes.data);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching data", error);
            setIsLoading(false);
        }
    };

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API_URL}/api/transactions`, {
                amount: Number(amount),
                description,
                type,
                folderId: selectedFolder,
                date: date 
            }, config);
            
            setShowModal(false);
            setAmount(''); 
            setDescription('');
            setDate(new Date().toISOString().split('T')[0]); 
            fetchData(); 
        } catch (error) {
            alert('Error adding transaction');
        }
    };

    // --- CUSTOM CARD LOGIC ---
    const handleCreateCard = (e) => {
        e.preventDefault();
        if (!newCard.title) return alert("Please enter a card title");
        
        setCustomCards([...customCards, { ...newCard, id: Date.now() }]);
        setShowCardModal(false);
        setNewCard({
            title: '',
            color: 'text-blue-500 bg-blue-500/10',
            formula: { income: 'ignore', expense: 'ignore', savings: 'ignore', investment: 'ignore', extra: 'ignore' }
        });
    };

    const deleteCard = (id) => {
        if (window.confirm('Remove this summary card?')) {
            setCustomCards(customCards.filter(c => c.id !== id));
        }
    };

    // --- GLOBAL TOTALS ---
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const totalInvestment = transactions.filter(t => t.type === 'investment').reduce((acc, t) => acc + t.amount, 0);
    const totalSavings = transactions.filter(t => t.type === 'savings').reduce((acc, t) => acc + t.amount, 0);
    const totalExtra = transactions.filter(t => t.type === 'extra').reduce((acc, t) => acc + t.amount, 0);
    
    // Balance Logic: Income + Extra + Savings + Investment - Expense
    const totalBalance = totalIncome - totalExpense + totalSavings + totalInvestment + totalExtra;

    // --- CALCULATE CUSTOM CARD VALUE ---
    const calculateCustomValue = (formula) => {
        let total = 0;
        const applyOp = (val, op) => {
            if (op === 'add') return val;
            if (op === 'subtract') return -val;
            return 0;
        };
        total += applyOp(totalIncome, formula.income);
        total += applyOp(totalExpense, formula.expense);
        total += applyOp(totalSavings, formula.savings);
        total += applyOp(totalInvestment, formula.investment);
        total += applyOp(totalExtra, formula.extra || 'ignore');
        return total;
    };

    // --- CHART DATA GENERATION ---
    const getFilteredTransactions = () => {
        return transactions.filter(t => {
            const d = new Date(t.date);
            const isYearMatch = d.getFullYear() === selectedYear;
            const isMonthMatch = d.getMonth() === selectedMonth;
            if (chartView === 'yearly') return isYearMatch;
            return isYearMatch && isMonthMatch;
        });
    };

    const viewTx = getFilteredTransactions();
    const viewIncome = viewTx.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const viewExpense = viewTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const viewInvestment = viewTx.filter(t => t.type === 'investment').reduce((acc, t) => acc + t.amount, 0);
    const viewSavings = viewTx.filter(t => t.type === 'savings').reduce((acc, t) => acc + t.amount, 0);
    const viewExtra = viewTx.filter(t => t.type === 'extra').reduce((acc, t) => acc + t.amount, 0);

    const getChartData = () => {
        let data = [];
        const processData = (txList, label) => ({
            name: label,
            Income: txList.filter(t => t.type === 'income').reduce((a, t) => a + Number(t.amount), 0),
            Expense: txList.filter(t => t.type === 'expense').reduce((a, t) => a + Number(t.amount), 0),
            Savings: txList.filter(t => t.type === 'savings').reduce((a, t) => a + Number(t.amount), 0),
            Investment: txList.filter(t => t.type === 'investment').reduce((a, t) => a + Number(t.amount), 0),
            Extra: txList.filter(t => t.type === 'extra').reduce((a, t) => a + Number(t.amount), 0),
        });

        if (chartView === 'yearly') {
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            data = months.map((month, index) => {
                const monthlyTx = transactions.filter(t => {
                    const d = new Date(t.date);
                    return d.getFullYear() === selectedYear && d.getMonth() === index;
                });
                return processData(monthlyTx, month);
            });
        } else {
            const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
            for (let i = 1; i <= daysInMonth; i++) {
                const dailyTx = transactions.filter(t => {
                    const d = new Date(t.date);
                    return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth && d.getDate() === i;
                });
                data.push(processData(dailyTx, i.toString()));
            }
        }
        return data;
    };

    const getBarSize = () => (chartView === 'yearly' ? (isMobile ? 12 : 40) : (isMobile ? 6 : 15));
    const getAxisFontSize = () => isMobile ? 10 : 12;

    if (isLoading) return <div className="p-8 text-text-secondary">Loading...</div>;

    return (
        <div className="w-full animate-fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-text-primary">Dashboard</h2>
                    <p className="text-text-secondary">Track your flow, savings, and investments.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button 
                        onClick={() => setShowCardModal(true)}
                        className="bg-bg-secondary hover:bg-bg-primary text-text-primary border border-border px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-all shadow-sm"
                    >
                        <Settings size={18} /> Customize
                    </button>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 font-medium shadow-lg shadow-blue-500/20 active:scale-95 transition-all w-full md:w-auto justify-center"
                    >
                        <FolderPlus size={20} /> Add Transaction
                    </button>
                </div>
            </header>

            {/* --- FIX: Grid uses 3 cols on large screens to fit 6 cards in 2 rows perfectly --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <SummaryCard title="Total Balance" amount={totalBalance} icon={<DollarSign size={24} />} colorClass="text-blue-500 bg-blue-500/10" />
                <SummaryCard title="Savings" amount={totalSavings} icon={<Wallet size={24} />} colorClass="text-amber-500 bg-amber-500/10" />
                <SummaryCard title="Total Income" amount={totalIncome} icon={<ArrowDownRight size={24} />} colorClass="text-emerald-500 bg-emerald-500/10" />
                <SummaryCard title="Total Expenses" amount={totalExpense} icon={<ArrowUpRight size={24} />} colorClass="text-red-500 bg-red-500/10" />
                <SummaryCard title="Investments" amount={totalInvestment} icon={<Activity size={24} />} colorClass="text-violet-500 bg-violet-500/10" />
                
                {/* --- EXTRA CARD --- */}
                <SummaryCard title="Extra" amount={totalExtra} icon={<Star size={24} />} colorClass="text-pink-500 bg-pink-500/10" />
                
                {/* Custom User Cards */}
                {customCards.map(card => (
                    <SummaryCard 
                        key={card.id}
                        title={card.title} 
                        amount={calculateCustomValue(card.formula)} 
                        icon={<Calculator size={24} />} 
                        colorClass={card.color}
                        onDelete={() => deleteCard(card.id)} 
                    />
                ))}
            </div>

            {/* --- FINANCIAL OVERVIEW SECTION --- */}
            <div className="bg-bg-secondary p-4 md:p-6 rounded-2xl border border-border shadow-sm mb-8">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
                    <h3 className="text-xl font-bold text-text-primary">Financial Overview</h3>
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full xl:w-auto">
                        <div className="flex bg-bg-primary rounded-lg p-1 border border-border flex-1 xl:flex-none">
                            <button onClick={() => setChartView('monthly')} className={`flex-1 xl:flex-none px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all ${chartView === 'monthly' ? 'bg-blue-600 text-white' : 'text-text-secondary'}`}>Monthly</button>
                            <button onClick={() => setChartView('yearly')} className={`flex-1 xl:flex-none px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all ${chartView === 'yearly' ? 'bg-blue-600 text-white' : 'text-text-secondary'}`}>Yearly</button>
                        </div>
                        <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="bg-bg-primary text-text-primary text-xs md:text-sm border border-border rounded-lg px-2 md:px-3 py-2 outline-none flex-1 xl:flex-none">
                            {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        {chartView === 'monthly' && (
                            <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="bg-bg-primary text-text-primary text-xs md:text-sm border border-border rounded-lg px-2 md:px-3 py-2 outline-none flex-1 xl:flex-none">
                                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => <option key={i} value={i}>{m}</option>)}
                            </select>
                        )}
                    </div>
                </div>

                {/* Chart Component */}
                <div className="h-64 md:h-80 mb-6 w-full -ml-4 md:ml-0" style={{ minWidth: '100%', minHeight: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getChartData()} barSize={getBarSize()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: getAxisFontSize() }} dy={10} />
                            <YAxis type="number" domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: getAxisFontSize() }} width={45} tickFormatter={(value) => `${value / 1000}k`} />
                            <Tooltip cursor={{ fill: 'var(--bg-primary)', opacity: 0.5 }} contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', fontSize: '12px' }} />
                            {!isMobile && <Legend wrapperStyle={{ paddingTop: '10px' }} />}
                            
                            <Bar dataKey="Income" fill="#10b981" stackId="a" radius={[0, 0, 4, 4]} />
                            <Bar dataKey="Savings" fill="#f59e0b" stackId="a" />
                            <Bar dataKey="Investment" fill="#8b5cf6" stackId="a" />
                            <Bar dataKey="Extra" fill="#ec4899" stackId="a" /> 
                            <Bar dataKey="Expense" fill="#ef4444" stackId="a" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 border-t border-border pt-6">
                    <SummaryItem label="Income" value={viewIncome} color="text-emerald-500" />
                    <SummaryItem label="Expenses" value={viewExpense} color="text-red-500" />
                    <SummaryItem label="Investments" value={viewInvestment} color="text-violet-500" />
                    <SummaryItem label="Savings" value={viewSavings} color="text-amber-500" />
                    <SummaryItem label="Extra" value={viewExtra} color="text-pink-500" />
                </div>
            </div>

            {/* --- TRANSACTION MODAL --- */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
                    <div className="bg-bg-secondary p-8 rounded-2xl w-full max-w-md border border-border shadow-2xl relative">
                        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"><X size={20} /></button>
                        <h3 className="text-2xl font-bold text-text-primary mb-6">New Transaction</h3>
                        <form onSubmit={handleAddTransaction} className="space-y-4">
                            <input type="text" required placeholder="Description" className="w-full bg-bg-primary text-text-primary p-3 rounded-xl border border-border outline-none focus:border-blue-500" value={description} onChange={(e) => setDescription(e.target.value)} />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" required placeholder="Amount" className="w-full bg-bg-primary text-text-primary p-3 rounded-xl border border-border outline-none focus:border-blue-500" value={amount} onChange={(e) => setAmount(e.target.value)} />
                                <select className="w-full bg-bg-primary text-text-primary p-3 rounded-xl border border-border outline-none focus:border-blue-500" value={type} onChange={(e) => setType(e.target.value)}>
                                    <option value="expense">Expense</option>
                                    <option value="income">Income</option>
                                    <option value="savings">Savings</option>
                                    <option value="investment">Investment</option>
                                    <option value="extra">Extra</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-text-secondary ml-1 mb-1 block">Transaction Date</label>
                                <input type="date" required className="w-full bg-bg-primary text-text-primary p-3 rounded-xl border border-border outline-none focus:border-blue-500" value={date} onChange={(e) => setDate(e.target.value)} />
                            </div>
                            <select className="w-full bg-bg-primary text-text-primary p-3 rounded-xl border border-border outline-none focus:border-blue-500" value={selectedFolder} onChange={(e) => setSelectedFolder(e.target.value)} required>
                                <option value="">Select Folder</option>
                                {folders.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                            </select>
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold mt-4 shadow-lg shadow-blue-500/20">Save Transaction</button>
                        </form>
                    </div>
                </div>
            )}

            {/* --- CUSTOM CARD CREATION MODAL --- */}
            {showCardModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
                    <div className="bg-bg-secondary p-8 rounded-2xl w-full max-w-md border border-border shadow-2xl relative">
                        <button onClick={() => setShowCardModal(false)} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"><X size={20} /></button>
                        <h3 className="text-2xl font-bold text-text-primary mb-2">Custom Summary Card</h3>
                        <p className="text-sm text-text-secondary mb-6">Create a rule to calculate this card's value.</p>
                        
                        <form onSubmit={handleCreateCard} className="space-y-4">
                            <div>
                                <label className="text-xs text-text-secondary mb-1 block">Card Title</label>
                                <input type="text" required placeholder="e.g., Net Worth (No Savings)" className="w-full bg-bg-primary text-text-primary p-3 rounded-xl border border-border outline-none focus:border-blue-500" 
                                    value={newCard.title} onChange={(e) => setNewCard({...newCard, title: e.target.value})} 
                                />
                            </div>

                            <div>
                                <label className="text-xs text-text-secondary mb-2 block">Accent Color</label>
                                <div className="flex gap-2">
                                    {[
                                        { bg: 'bg-blue-500', val: 'text-blue-500 bg-blue-500/10' },
                                        { bg: 'bg-emerald-500', val: 'text-emerald-500 bg-emerald-500/10' },
                                        { bg: 'bg-violet-500', val: 'text-violet-500 bg-violet-500/10' },
                                        { bg: 'bg-amber-500', val: 'text-amber-500 bg-amber-500/10' },
                                        { bg: 'bg-red-500', val: 'text-red-500 bg-red-500/10' },
                                        { bg: 'bg-pink-500', val: 'text-pink-500 bg-pink-500/10' }
                                    ].map((c) => (
                                        <button 
                                            key={c.val}
                                            type="button"
                                            onClick={() => setNewCard({...newCard, color: c.val})}
                                            className={`w-8 h-8 rounded-full ${c.bg} ${newCard.color === c.val ? 'ring-2 ring-white ring-offset-2 ring-offset-bg-secondary' : 'opacity-50 hover:opacity-100'}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="bg-bg-primary p-4 rounded-xl border border-border space-y-3">
                                <label className="text-xs font-bold text-text-secondary block">Calculation Formula</label>
                                {['Income', 'Expense', 'Savings', 'Investment', 'Extra'].map((cat) => {
                                    const key = cat.toLowerCase();
                                    return (
                                        <div key={key} className="flex items-center justify-between">
                                            <span className="text-sm text-text-primary">{cat}</span>
                                            <div className="flex bg-bg-secondary rounded-lg p-1 border border-border">
                                                <button type="button" onClick={() => setNewCard({...newCard, formula: {...newCard.formula, [key]: 'add'}})} className={`px-2 py-1 text-xs rounded ${newCard.formula[key] === 'add' ? 'bg-emerald-500/20 text-emerald-500 font-bold' : 'text-text-secondary'}`}>Add</button>
                                                <button type="button" onClick={() => setNewCard({...newCard, formula: {...newCard.formula, [key]: 'subtract'}})} className={`px-2 py-1 text-xs rounded ${newCard.formula[key] === 'subtract' ? 'bg-red-500/20 text-red-500 font-bold' : 'text-text-secondary'}`}>Sub</button>
                                                <button type="button" onClick={() => setNewCard({...newCard, formula: {...newCard.formula, [key]: 'ignore'}})} className={`px-2 py-1 text-xs rounded ${newCard.formula[key] === 'ignore' ? 'bg-gray-500/10 text-text-primary font-bold' : 'text-text-secondary'}`}>Skip</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold mt-4 shadow-lg shadow-blue-500/20">Create Card</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Updated SummaryItem Component
const SummaryItem = ({ label, value, color }) => (
    <div className="text-center p-2 rounded-lg hover:bg-bg-primary transition-colors">
        <p className="text-xs text-text-secondary mb-1">{label}</p>
        <p className={`text-base md:text-xl font-bold ${color}`}>
            {value >= 0 ? '+' : ''}${Math.abs(value).toLocaleString()}
        </p>
    </div>
);

// Updated SummaryCard with Delete Support
const SummaryCard = ({ title, amount, icon, colorClass, onDelete }) => (
    <div className="bg-bg-secondary p-6 rounded-2xl border border-border shadow-sm hover:border-blue-500/30 transition-all group relative">
        {onDelete && (
            <button 
                onClick={(e) => { e.stopPropagation(); onDelete(); }} 
                className="absolute top-2 right-2 p-1.5 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Trash2 size={16} />
            </button>
        )}
        <div className="flex justify-between items-start">
            <div>
                <p className="text-text-secondary text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-text-primary group-hover:scale-105 transition-transform">
                    ${amount.toLocaleString()}
                </h3>
            </div>
            <div className={`p-3 rounded-xl ${colorClass}`}>
                {icon}
            </div>
        </div>
    </div>
);

export default Dashboard;