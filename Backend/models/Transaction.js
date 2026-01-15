const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    folder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', required: true },
    type: { type: String, enum: ['income', 'expense', 'investment', 'savings'], required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
    // Specific for investments
    profit: { type: Number, default: 0 }, 
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);