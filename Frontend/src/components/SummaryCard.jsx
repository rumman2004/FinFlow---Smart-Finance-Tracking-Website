import React from 'react';

const SummaryCard = ({ title, amount, icon, color }) => {
    return (
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-slate-600 transition-all">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-white">${amount.toLocaleString()}</h3>
                </div>
                <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-white`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default SummaryCard;