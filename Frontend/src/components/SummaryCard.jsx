import React from 'react';

const SummaryCard = ({ title, amount, icon, color }) => {
    return (
        <div className="bg-bg-secondary p-6 rounded-2xl border border-border hover:border-blue-500/30 transition-all shadow-sm group">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-text-secondary text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-text-primary group-hover:scale-105 transition-transform">
                        ${amount.toLocaleString()}
                    </h3>
                </div>
                <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-white`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default SummaryCard;