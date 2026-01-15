const mongoose = require('mongoose');

const folderSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true }, // e.g., "Stock Market", "Personal"
    icon: { type: String, default: '📁' },
    color: { type: String, default: '#3B82F6' } // For UI styling
}, { timestamps: true });

module.exports = mongoose.model('Folder', folderSchema);