const mongoose = require('mongoose');

const historySchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    folder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', required: true },
    action: { type: String, enum: ['CREATE', 'EDIT', 'DELETE', 'WITHDRAW'], required: true },
    description: { type: String, required: true }, // e.g., "Changed amount from $50 to $60"
    originalDate: { type: Date }, // To track when the actual event happened in real time
}, { timestamps: true });

module.exports = mongoose.model('History', historySchema);