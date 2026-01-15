import React, { useState, useEffect, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config';
import AuthContext from '../context/AuthContext';
import { 
    ArrowLeft, Trash2, Edit3, Download, ArrowDownRight, ArrowUpRight, Activity, Wallet, X, FileText, Clock 
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const FolderDetails = () => {
    const { id } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);
    
    // Data States
    const [transactions, setTransactions] = useState([]);
    const [history, setHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('transactions');
    const [loading, setLoading] = useState(true);

    // Modal States
    const [editTx, setEditTx] = useState(null); 
    const [withdrawTx, setWithdrawTx] = useState(null); // Tx being withdrawn from
    const [withdrawAmount, setWithdrawAmount] = useState('');

    useEffect(() => {
        fetchFolderData();
    }, [id, token]);

    const fetchFolderData = async () => {
        try {
            const [txRes, historyRes] = await Promise.all([
                axios.get(`${API_URL}/api/transactions?folderId=${id}`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/api/transactions/history/${id}`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setTransactions(txRes.data);
            setHistory(historyRes.data);
            setLoading(false);
        } catch (error) { console.error(error); setLoading(false); }
    };

    // --- ACTIONS ---
    const handleDelete = async (txId) => {
        if(!window.confirm("Delete transaction? This action will be logged.")) return;
        await axios.delete(`${API_URL}/api/transactions/${txId}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchFolderData();
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API_URL}/api/transactions/${editTx._id}`, {
                amount: Number(editTx.amount),
                description: editTx.description,
                type: editTx.type,
                date: editTx.date,
                folderId: editTx.folder._id || editTx.folder
            }, { headers: { Authorization: `Bearer ${token}` } });
            setEditTx(null);
            fetchFolderData();
        } catch (error) { alert("Update failed"); }
    };

    // NEW: Smart Withdraw Handler
    const handleSmartWithdraw = async (e) => {
        e.preventDefault();
        if (!withdrawTx) return;
        
        const amount = Number(withdrawAmount);
        if (amount <= 0 || amount > withdrawTx.amount) {
            alert("Invalid amount. Cannot withdraw more than available balance.");
            return;
        }

        try {
            await axios.post(`${API_URL}/api/transactions/withdraw`, {
                id: withdrawTx._id,
                amount: amount
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            setWithdrawTx(null);
            setWithdrawAmount('');
            alert("Withdrawal successful! Original balance updated.");
            fetchFolderData();
        } catch (error) {
            alert(error.response?.data?.message || "Withdrawal failed");
        }
    };

    // Chart Data
    const chartData = [
        { name: 'Income', value: transactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0), color: '#10b981' },
        { name: 'Expense', value: transactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0), color: '#ef4444' },
        { name: 'Invest', value: transactions.filter(t => t.type === 'investment').reduce((a, t) => a + t.amount, 0), color: '#8b5cf6' },
        { name: 'Savings', value: transactions.filter(t => t.type === 'savings').reduce((a, t) => a + t.amount, 0), color: '#f59e0b' },
    ].filter(d => d.value > 0);

    if (loading) return <div className="p-8 text-text-secondary">Loading...</div>;

    return (
        <div className="w-full animate-fade-in">
            <button onClick={() => navigate('/folders')} className="flex items-center gap-2 text-text-secondary hover:text-blue-500 mb-6 transition-colors"><ArrowLeft size={18} /> Back to Folders</button>

            <div className="flex flex-col lg:flex-row gap-8 mb-8">
                {/* Left Info */}
                <div className="lg:w-1/3 space-y-6">
                    <div><h2 className="text-3xl font-bold text-text-primary">{state?.folderName || 'Folder Details'}</h2><p className="text-text-secondary">{transactions.length} records found</p></div>
                    <div className="bg-bg-secondary p-4 rounded-2xl border border-border h-64 shadow-sm">
                        <h4 className="text-sm font-bold text-text-primary mb-2">Distribution</h4>
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <div className="h-full flex items-center justify-center text-text-secondary text-sm">No data</div>}
                    </div>
                </div>

                {/* Right Lists */}
                <div className="lg:w-2/3 bg-bg-secondary rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col h-[600px]">
                     <div className="flex border-b border-border">
                        <button onClick={() => setActiveTab('transactions')} className={`flex-1 p-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === 'transactions' ? 'text-blue-500 border-b-2 border-blue-500 bg-blue-500/5' : 'text-text-secondary hover:text-text-primary'}`}>
                            <FileText size={16} /> Transactions
                        </button>
                        <button onClick={() => setActiveTab('history')} className={`flex-1 p-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === 'history' ? 'text-blue-500 border-b-2 border-blue-500 bg-blue-500/5' : 'text-text-secondary hover:text-text-primary'}`}>
                            <Clock size={16} /> History Log
                        </button>
                     </div>

                     <div className="overflow-y-auto flex-1 custom-scrollbar p-2">
                        {activeTab === 'transactions' && (
                            transactions.length === 0 ? <p className="text-center text-text-secondary mt-10">No transactions.</p> :
                            transactions.map((t) => (
                                <div key={t._id} className="flex flex-col md:flex-row justify-between items-center p-4 border-b border-border last:border-0 hover:bg-bg-primary transition-colors group">
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <div className={`p-3 rounded-xl shrink-0 ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : t.type === 'expense' ? 'bg-red-500/10 text-red-500' : t.type === 'savings' ? 'bg-amber-500/10 text-amber-500' : 'bg-violet-500/10 text-violet-500'}`}>
                                            {t.type === 'income' ? <ArrowDownRight size={20} /> : t.type === 'expense' ? <ArrowUpRight size={20} /> : t.type === 'savings' ? <Wallet size={20} /> : <Activity size={20} />}
                                        </div>
                                        <div>
                                            <p className="text-text-primary font-bold">{t.description}</p>
                                            <p className="text-xs text-text-secondary">{new Date(t.date).toLocaleDateString()} • {t.type.toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-3 md:mt-0">
                                        <span className={`font-bold text-lg ${t.type === 'income' || t.type === 'savings' ? 'text-emerald-500' : 'text-text-primary'}`}>${t.amount.toLocaleString()}</span>
                                        <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            {/* Show Withdraw button for Investment, Savings, and Income */}
                                            {['investment', 'savings', 'income'].includes(t.type) && (
                                                <button 
                                                    onClick={() => { setWithdrawTx(t); setWithdrawAmount(''); }} 
                                                    title="Withdraw/Transfer" 
                                                    className="p-2 text-text-secondary hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg"
                                                >
                                                    <Download size={18} />
                                                </button>
                                            )}
                                            <button onClick={() => setEditTx(t)} title="Edit" className="p-2 text-text-secondary hover:text-blue-500 hover:bg-blue-500/10 rounded-lg"><Edit3 size={18} /></button>
                                            <button onClick={() => handleDelete(t._id)} title="Delete" className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {activeTab === 'history' && (
                            history.map((log) => (
                                <div key={log._id} className="flex gap-4 p-4 border-b border-border last:border-0 hover:bg-bg-primary transition-colors">
                                    <div className={`p-2 h-fit rounded-full mt-1 ${log.action === 'CREATE' ? 'bg-emerald-500/10 text-emerald-500' : log.action === 'DELETE' ? 'bg-red-500/10 text-red-500' : log.action === 'EDIT' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                        {log.action === 'CREATE' ? <ArrowDownRight size={16} /> : log.action === 'DELETE' ? <Trash2 size={16} /> : log.action === 'EDIT' ? <Edit3 size={16} /> : <Download size={16} />}
                                    </div>
                                    <div>
                                        <p className="text-text-primary text-sm font-medium">{log.description}</p>
                                        <p className="text-xs text-text-secondary mt-1">{new Date(log.createdAt).toLocaleString()} • <span className="font-bold opacity-75">{log.action}</span></p>
                                    </div>
                                </div>
                            ))
                        )}
                     </div>
                </div>
            </div>

            {/* WITHDRAW MODAL */}
            {withdrawTx && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-bg-secondary p-8 rounded-2xl w-full max-w-sm border border-border shadow-2xl relative animate-fade-in">
                        <button onClick={() => setWithdrawTx(null)} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"><X size={20} /></button>
                        <h3 className="text-xl font-bold text-text-primary mb-2">Withdraw / Transfer</h3>
                        <p className="text-text-secondary text-sm mb-6">
                            From: <span className="font-bold text-text-primary">{withdrawTx.description}</span><br/>
                            Available: <span className="font-bold text-emerald-500">${withdrawTx.amount}</span>
                        </p>
                        
                        <form onSubmit={handleSmartWithdraw} className="space-y-4">
                            <div>
                                <label className="text-xs text-text-secondary ml-1 mb-1 block">Amount to Withdraw</label>
                                <input 
                                    type="number" required autoFocus
                                    className="w-full bg-bg-primary text-text-primary p-3 rounded-xl border border-border outline-none focus:border-blue-500 font-bold text-lg" 
                                    placeholder="0.00"
                                    value={withdrawAmount} 
                                    onChange={(e) => setWithdrawAmount(e.target.value)} 
                                />
                            </div>
                            
                            <div className="text-xs text-text-secondary bg-bg-primary p-3 rounded-lg border border-border">
                                {withdrawTx.type === 'investment' && "Money will move to Savings."}
                                {withdrawTx.type === 'savings' && "Money will be recorded as an Expense."}
                                {withdrawTx.type === 'income' && "Money will move to Savings."}
                            </div>

                            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold mt-2 shadow-lg shadow-emerald-500/20">
                                Confirm Withdrawal
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT MODAL (Unchanged) */}
            {editTx && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-bg-secondary p-8 rounded-2xl w-full max-w-md border border-border shadow-2xl relative">
                        <button onClick={() => setEditTx(null)} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"><X size={20} /></button>
                        <h3 className="text-2xl font-bold text-text-primary mb-6">Edit Transaction</h3>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <input type="text" required className="w-full bg-bg-primary text-text-primary p-3 rounded-xl border border-border outline-none focus:border-blue-500" value={editTx.description} onChange={(e) => setEditTx({...editTx, description: e.target.value})} />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" required className="w-full bg-bg-primary text-text-primary p-3 rounded-xl border border-border outline-none focus:border-blue-500" value={editTx.amount} onChange={(e) => setEditTx({...editTx, amount: e.target.value})} />
                                <select className="w-full bg-bg-primary text-text-primary p-3 rounded-xl border border-border outline-none focus:border-blue-500" value={editTx.type} onChange={(e) => setEditTx({...editTx, type: e.target.value})}>
                                    <option value="expense">Expense</option><option value="income">Income</option><option value="savings">Savings</option><option value="investment">Investment</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-text-secondary ml-1 mb-1 block">Date</label>
                                <input type="date" required className="w-full bg-bg-primary text-text-primary p-3 rounded-xl border border-border outline-none focus:border-blue-500" value={editTx.date ? new Date(editTx.date).toISOString().split('T')[0] : ''} onChange={(e) => setEditTx({...editTx, date: e.target.value})} />
                            </div>
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold mt-4">Update</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FolderDetails;