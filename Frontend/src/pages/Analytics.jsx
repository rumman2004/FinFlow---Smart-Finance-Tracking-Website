import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import AuthContext from '../context/AuthContext';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, 
    LineChart, Line, XAxis, YAxis, CartesianGrid, AreaChart, Area 
} from 'recharts';
import { 
    Activity, ArrowDownRight, ArrowUpRight, Wallet, Clock, Trash2, Edit3, Download, TrendingUp, Star 
} from 'lucide-react';

const Analytics = () => {
    const { token } = useContext(AuthContext);
    const [transactions, setTransactions] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'history'
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const [txRes, historyRes] = await Promise.all([
                    axios.get(`${API_URL}/api/transactions`, config),
                    axios.get(`${API_URL}/api/transactions/history`, config)
                ]);
                
                const sortedTx = txRes.data.sort((a, b) => new Date(a.date) - new Date(b.date));
                setTransactions(sortedTx);
                setHistory(historyRes.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching analytics", error);
                setLoading(false);
            }
        };

        fetchData();
        return () => window.removeEventListener('resize', handleResize);
    }, [token]);

    // --- DATA PROCESSING FOR CHARTS ---

    // 1. Pie Chart Data
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const investment = transactions.filter(t => t.type === 'investment').reduce((acc, t) => acc + t.amount, 0);
    const savings = transactions.filter(t => t.type === 'savings').reduce((acc, t) => acc + t.amount, 0);
    const extra = transactions.filter(t => t.type === 'extra').reduce((acc, t) => acc + t.amount, 0);

    const pieData = [
        { name: 'Income', value: income, color: '#10b981' },
        { name: 'Expenses', value: expense, color: '#ef4444' },
        { name: 'Investments', value: investment, color: '#8b5cf6' },
        { name: 'Savings', value: savings, color: '#f59e0b' },
        { name: 'Extra', value: extra, color: '#ec4899' },
    ].filter(d => d.value > 0);

    // Calculate Total for Donut Center
    const totalVolume = pieData.reduce((acc, item) => acc + item.value, 0);

    // 2. Line Chart Data (Balance History)
    const getTrendData = () => {
        let runningBalance = 0;
        return transactions.map(t => {
            if (t.type === 'income' || t.type === 'extra') runningBalance += t.amount;
            else if (t.type === 'expense') runningBalance -= t.amount;
            // Note: Savings/Investments usually don't change "Net Worth" immediately unless treated as expense, 
            // but for this trend line, we stick to basic cash flow or wealth logic.
            // If you want purely "Cash on Hand", subtract savings/investments. 
            // If "Net Worth", keep them. Assuming Net Worth here:
            
            return {
                date: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                amount: runningBalance,
                fullDate: new Date(t.date).toLocaleDateString()
            };
        });
    };
    
    const trendData = getTrendData();

    // --- CUSTOM TOOLTIPS ---
    const CustomPieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-bg-secondary p-3 border border-border rounded-xl shadow-xl backdrop-blur-sm bg-opacity-95">
                    <p className="text-sm font-bold text-text-primary mb-1">{payload[0].name}</p>
                    <p className="text-sm font-mono font-bold" style={{ color: payload[0].payload.color }}>
                        ${payload[0].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomAreaTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-bg-secondary p-3 border border-border rounded-xl shadow-xl backdrop-blur-sm bg-opacity-95">
                    <p className="text-xs text-text-secondary mb-1">{label}</p>
                    <p className="text-sm font-bold text-blue-500">
                        ${payload[0].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (loading) return <div className="p-8 text-text-secondary">Loading Analytics...</div>;

    return (
        <div className="w-full animate-fade-in">
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-text-primary">Analytics & History</h2>
                <p className="text-text-secondary">Deep dive into your financial behavior.</p>
            </header>

            {/* TABS */}
            <div className="flex bg-bg-secondary p-1 rounded-xl w-full md:w-fit mb-8 border border-border">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-md' : 'text-text-secondary hover:text-text-primary'}`}
                >
                    Overview
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-md' : 'text-text-secondary hover:text-text-primary'}`}
                >
                    Global History
                </button>
            </div>

            {/* --- OVERVIEW TAB --- */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 1. Net Worth Trend */}
                    <div className="bg-bg-secondary p-6 rounded-2xl border border-border shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><TrendingUp size={20} /></div>
                            <div>
                                <h3 className="text-xl font-bold text-text-primary">Wealth Trend</h3>
                                <p className="text-xs text-text-secondary">Cumulative financial growth</p>
                            </div>
                        </div>
                        <div className="h-72 w-full" style={{ minWidth: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                                    <XAxis 
                                        dataKey="date" 
                                        hide={isMobile} 
                                        tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis 
                                        tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
                                    />
                                    <Tooltip content={<CustomAreaTooltip />} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="amount" 
                                        stroke="#3b82f6" 
                                        strokeWidth={3} 
                                        fillOpacity={1} 
                                        fill="url(#colorAmount)" 
                                        activeDot={{ r: 6, strokeWidth: 0, fill: '#60a5fa' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 2. Distribution Pie */}
                    <div className="bg-bg-secondary p-6 rounded-2xl border border-border shadow-sm flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-violet-500/10 rounded-lg text-violet-500"><Activity size={20} /></div>
                            <div>
                                <h3 className="text-xl font-bold text-text-primary">Asset Allocation</h3>
                                <p className="text-xs text-text-secondary">Distribution across categories</p>
                            </div>
                        </div>
                        <div className="h-72 w-full relative flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={pieData} 
                                        innerRadius={80} 
                                        outerRadius={100} 
                                        paddingAngle={5} 
                                        dataKey="value"
                                        stroke="none"
                                        cornerRadius={4}
                                    >
                                        {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip content={<CustomPieTooltip />} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: '20px' }}/>
                                </PieChart>
                            </ResponsiveContainer>
                            
                            {/* Center Text for Donut Chart */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-12">
                                <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">Total Volume</span>
                                <span className="text-2xl font-bold text-text-primary mt-1">${totalVolume.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- GLOBAL HISTORY TAB --- */}
            {activeTab === 'history' && (
                <div className="bg-bg-secondary rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col h-[600px] animate-fade-in">
                    <div className="p-6 border-b border-border flex justify-between items-center bg-bg-secondary sticky top-0 z-10">
                        <h3 className="font-bold text-text-primary flex items-center gap-2">
                            <Clock size={20} className="text-text-secondary" /> Recent Activity Log
                        </h3>
                        <span className="text-xs text-text-secondary bg-bg-primary px-3 py-1 rounded-full border border-border">Last 50 Actions</span>
                    </div>
                    <div className="overflow-y-auto flex-1 custom-scrollbar p-0">
                        {history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                                <Activity size={48} className="mb-4 opacity-20" />
                                <p>No activity recorded yet.</p>
                            </div>
                        ) : (
                            history.map((log) => (
                                <div key={log._id} className="flex gap-4 p-5 border-b border-border last:border-0 hover:bg-bg-primary transition-colors group">
                                    <div className={`p-3 h-fit rounded-full mt-1 shrink-0 ${
                                        log.action === 'CREATE' ? 'bg-emerald-500/10 text-emerald-500' :
                                        log.action === 'DELETE' ? 'bg-red-500/10 text-red-500' :
                                        log.action === 'EDIT' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'
                                    }`}>
                                        {log.action === 'CREATE' ? <ArrowDownRight size={18} /> :
                                         log.action === 'DELETE' ? <Trash2 size={18} /> :
                                         log.action === 'EDIT' ? <Edit3 size={18} /> : <Download size={18} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className="text-text-primary font-medium text-sm md:text-base">{log.description}</p>
                                            <span className={`text-[10px] md:text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ml-2 border border-border text-text-secondary`}>
                                                {log.action}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-2">
                                            <p className="text-xs text-text-secondary flex items-center gap-1">
                                                <Clock size={12} /> {new Date(log.createdAt).toLocaleString()}
                                            </p>
                                            {log.folder && (
                                                <p className="text-xs text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                                                    <Wallet size={10} /> {log.folder.name || 'Folder'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analytics;