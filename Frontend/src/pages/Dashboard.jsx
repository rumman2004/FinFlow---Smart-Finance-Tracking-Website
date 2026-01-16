import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import AuthContext from '../context/AuthContext';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { 
    DollarSign, ArrowDownRight, ArrowUpRight, Activity, Wallet, FolderPlus, X
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

    // Form States
    const [showModal, setShowModal] = useState(false);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('expense');
    const [selectedFolder, setSelectedFolder] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Handle Resize
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchData();
    }, [token]);

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

    // --- GLOBAL TOTALS ---
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const totalInvestment = transactions.filter(t => t.type === 'investment').reduce((acc, t) => acc + t.amount, 0);
    const totalSavings = transactions.filter(t => t.type === 'savings').reduce((acc, t) => acc + t.amount, 0);
    const totalBalance = totalIncome - totalExpense + totalSavings;

    // --- DYNAMIC VIEW CALCULATIONS ---
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

    // --- CHART DATA GENERATION (Now Includes Investment) ---
    const getChartData = () => {
        let data = [];
        if (chartView === 'yearly') {
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            data = months.map((month, index) => {
                const monthlyTx = transactions.filter(t => {
                    const d = new Date(t.date);
                    return d.getFullYear() === selectedYear && d.getMonth() === index;
                });
                return {
                    name: month,
                    // FIX: Wrap t.amount in Number() to prevent string concatenation
                    Income: monthlyTx.filter(t => t.type === 'income').reduce((a, t) => a + Number(t.amount), 0),
                    Expense: monthlyTx.filter(t => t.type === 'expense').reduce((a, t) => a + Number(t.amount), 0),
                    Savings: monthlyTx.filter(t => t.type === 'savings').reduce((a, t) => a + Number(t.amount), 0),
                    Investment: monthlyTx.filter(t => t.type === 'investment').reduce((a, t) => a + Number(t.amount), 0),
                };
            });
        } else {
            const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
            for (let i = 1; i <= daysInMonth; i++) {
                const dailyTx = transactions.filter(t => {
                    const d = new Date(t.date);
                    return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth && d.getDate() === i;
                });
                data.push({
                    name: i.toString(),
                    // FIX: Wrap t.amount in Number() here too
                    Income: dailyTx.filter(t => t.type === 'income').reduce((a, t) => a + Number(t.amount), 0),
                    Expense: dailyTx.filter(t => t.type === 'expense').reduce((a, t) => a + Number(t.amount), 0),
                    Savings: dailyTx.filter(t => t.type === 'savings').reduce((a, t) => a + Number(t.amount), 0),
                    Investment: dailyTx.filter(t => t.type === 'investment').reduce((a, t) => a + Number(t.amount), 0),
                });
            }
        }
        return data;
    };

    const getBarSize = () => {
        if (chartView === 'yearly') return isMobile ? 12 : 40; 
        return isMobile ? 6 : 15;
    };

    const getAxisFontSize = () => isMobile ? 10 : 12;
    const getAxisInterval = () => isMobile ? 2 : 0; 

    if (isLoading) return <div className="p-8 text-text-secondary">Loading...</div>;

    return (
        <div className="w-full animate-fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-text-primary">Dashboard</h2>
                    <p className="text-text-secondary">Track your flow, savings, and investments.</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 font-medium shadow-lg shadow-blue-500/20 active:scale-95 transition-all w-full md:w-auto justify-center"
                >
                    <FolderPlus size={20} /> Add Transaction
                </button>
            </header>

            {/* Global Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <SummaryCard title="Total Balance" amount={totalBalance} icon={<DollarSign size={24} />} colorClass="text-blue-500 bg-blue-500/10" />
                <SummaryCard title="In Hand (Savings)" amount={totalSavings} icon={<Wallet size={24} />} colorClass="text-amber-500 bg-amber-500/10" />
                <SummaryCard title="Total Income" amount={totalIncome} icon={<ArrowDownRight size={24} />} colorClass="text-emerald-500 bg-emerald-500/10" />
                <SummaryCard title="Total Expenses" amount={totalExpense} icon={<ArrowUpRight size={24} />} colorClass="text-red-500 bg-red-500/10" />
                <SummaryCard title="Investments" amount={totalInvestment} icon={<Activity size={24} />} colorClass="text-violet-500 bg-violet-500/10" />
            </div>

            {/* --- FINANCIAL OVERVIEW SECTION --- */}
            <div className="bg-bg-secondary p-4 md:p-6 rounded-2xl border border-border shadow-sm mb-8">
                {/* Header & Controls */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
                    <h3 className="text-xl font-bold text-text-primary">Financial Overview</h3>
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full xl:w-auto">
                        <div className="flex bg-bg-primary rounded-lg p-1 border border-border flex-1 xl:flex-none">
                            <button onClick={() => setChartView('monthly')} className={`flex-1 xl:flex-none px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all ${chartView === 'monthly' ? 'bg-blue-600 text-white' : 'text-text-secondary'}`}>Monthly</button>
                            <button onClick={() => setChartView('yearly')} className={`flex-1 xl:flex-none px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all ${chartView === 'yearly' ? 'bg-blue-600 text-white' : 'text-text-secondary'}`}>Yearly</button>
                        </div>
                        <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="bg-bg-primary text-text-primary text-xs md:text-sm border border-border rounded-lg px-2 md:px-3 py-2 outline-none flex-1 xl:flex-none">
                            {[2023, 2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        {chartView === 'monthly' && (
                            <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="bg-bg-primary text-text-primary text-xs md:text-sm border border-border rounded-lg px-2 md:px-3 py-2 outline-none flex-1 xl:flex-none">
                                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => <option key={i} value={i}>{m}</option>)}
                            </select>
                        )}
                    </div>
                </div>

                {/* The Responsive Graph */}
                <div className="h-64 md:h-80 mb-6 w-full -ml-4 md:ml-0" style={{ minWidth: '100%', minHeight: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getChartData()} barSize={getBarSize()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: 'var(--text-secondary)', fontSize: getAxisFontSize() }} 
                                dy={10}
                                interval={chartView === 'monthly' ? getAxisInterval() : 0} 
                            />
                            <YAxis 
                                type="number" // <--- CRITICAL FIX: Forces numerical scale
                                domain={['auto', 'auto']} // Ensures the chart scales to fit the biggest bar (250,000)
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: 'var(--text-secondary)', fontSize: getAxisFontSize() }} 
                                width={45} // Increased slightly to fit larger numbers like "250k"
                                tickFormatter={(value) => `${value / 1000}k`} // Optional: Makes 250000 look like "250k" to save space
                            />
                            <Tooltip 
                                cursor={{ fill: 'var(--bg-primary)', opacity: 0.5 }} 
                                contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', fontSize: '12px' }} 
                            />
                            {!isMobile && <Legend wrapperStyle={{ paddingTop: '10px' }} />}
                            
                            {/* BARS: Added Investment Bar */}
                            <Bar dataKey="Income" fill="#10b981" stackId="a" radius={[0, 0, 4, 4]} />
                            <Bar dataKey="Savings" fill="#f59e0b" stackId="a" />
                            <Bar dataKey="Investment" fill="#8b5cf6" stackId="a" />
                            <Bar dataKey="Expense" fill="#ef4444" stackId="a" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Summary Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 border-t border-border pt-6 animate-fade-in">
                    <SummaryItem label="Income" value={viewIncome} color="text-emerald-500" />
                    <SummaryItem label="Expenses" value={viewExpense} color="text-red-500" />
                    <SummaryItem label="Investments" value={viewInvestment} color="text-violet-500" />
                    <SummaryItem label="Savings" value={viewSavings} color="text-amber-500" />
                </div>
            </div>

            {/* Modal Logic (Abbreviated) */}
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
        </div>
    );
};

const SummaryItem = ({ label, value, color }) => (
    <div className="text-center p-2 rounded-lg hover:bg-bg-primary transition-colors">
        <p className="text-xs text-text-secondary mb-1">{label}</p>
        <p className={`text-base md:text-xl font-bold ${color}`}>
            {value >= 0 ? '+' : ''}${Math.abs(value).toLocaleString()}
        </p>
    </div>
);

const SummaryCard = ({ title, amount, icon, colorClass }) => (
    <div className="bg-bg-secondary p-6 rounded-2xl border border-border shadow-sm hover:border-blue-500/30 transition-all group">
        <div className="flex justify-between items-start">
            <div><p className="text-text-secondary text-sm font-medium mb-1">{title}</p><h3 className="text-2xl font-bold text-text-primary group-hover:scale-105 transition-transform">${amount.toLocaleString()}</h3></div>
            <div className={`p-3 rounded-xl ${colorClass}`}>{icon}</div>
        </div>
    </div>
);

export default Dashboard;