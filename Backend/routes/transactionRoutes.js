const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Transaction = require('../models/Transaction');
const History = require('../models/History'); // Import History Model

// ... (Keep existing GET routes) ...
// Get all transactions
router.get('/', protect, async (req, res) => {
    // ... (Your existing search/filter logic) ...
    try {
        const keyword = req.query.search
            ? { description: { $regex: req.query.search, $options: 'i' } }
            : {};
        const folderFilter = req.query.folderId ? { folder: req.query.folderId } : {};

        const transactions = await Transaction.find({ user: req.user.id, ...keyword, ...folderFilter })
            .populate('folder')
            .sort({ date: -1 });

        res.json(transactions);
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});


// NEW ROUTE: Get History Logs for a Folder
router.get('/history/:folderId', protect, async (req, res) => {
    try {
        const logs = await History.find({ 
            user: req.user.id, 
            folder: req.params.folderId 
        }).sort({ createdAt: -1 }); // Newest logs first
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});


// CREATE Transaction (Auto Log)
router.post('/', protect, async (req, res) => {
    try {
        const { folderId, type, amount, description, date } = req.body;
        
        const transaction = await Transaction.create({
            user: req.user.id,
            folder: folderId,
            type,
            amount,
            description,
            date: date || Date.now()
        });

        // LOGGING
        const actionType = description.toLowerCase().includes('withdrawal') ? 'WITHDRAW' : 'CREATE';
        await History.create({
            user: req.user.id,
            folder: folderId,
            action: actionType,
            description: `${actionType === 'WITHDRAW' ? 'Withdrew' : 'Added'} $${amount} - ${description}`,
            originalDate: new Date()
        });

        const populated = await Transaction.findById(transaction._id).populate('folder');
        res.status(201).json(populated);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
});


// UPDATE Transaction (Auto Log Differences)
router.put('/:id', protect, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ message: 'Not found' });
        if (transaction.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        // Capture old values for log
        const oldAmount = transaction.amount;
        const oldDesc = transaction.description;

        // Update
        transaction.amount = req.body.amount || transaction.amount;
        transaction.description = req.body.description || transaction.description;
        transaction.type = req.body.type || transaction.type;
        transaction.date = req.body.date || transaction.date;
        
        await transaction.save();

        // LOGGING
        let changes = [];
        if (oldAmount !== transaction.amount) changes.push(`Amount: $${oldAmount} → $${transaction.amount}`);
        if (oldDesc !== transaction.description) changes.push(`Desc: "${oldDesc}" → "${transaction.description}"`);

        if (changes.length > 0) {
            await History.create({
                user: req.user.id,
                folder: transaction.folder,
                action: 'EDIT',
                description: `Edited ${transaction.description}: ${changes.join(', ')}`,
                originalDate: new Date()
            });
        }

        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});


// DELETE Transaction (Auto Log)
router.delete('/:id', protect, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ message: 'Not found' });
        if (transaction.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        // Store details before delete
        const { folder, amount, description } = transaction;

        await transaction.deleteOne();

        // LOGGING
        await History.create({
            user: req.user.id,
            folder: folder,
            action: 'DELETE',
            description: `Deleted transaction: "${description}" ($${amount})`,
            originalDate: new Date()
        });

        res.json({ message: 'Transaction removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/withdraw', protect, async (req, res) => {
    try {
        const { id, amount } = req.body; // Transaction ID and Amount to withdraw

        // 1. Find the original transaction
        const originalTx = await Transaction.findById(id);
        if (!originalTx) return res.status(404).json({ message: 'Transaction not found' });
        if (originalTx.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        // 2. Validation
        if (amount <= 0) return res.status(400).json({ message: 'Amount must be positive' });
        if (amount > originalTx.amount) return res.status(400).json({ message: 'Insufficient funds in this transaction' });

        // 3. Define Logic based on Type
        let newType = 'savings'; // Default destination
        let actionDesc = '';

        if (originalTx.type === 'investment') {
            // Investment -> Savings (Realizing profit/cash)
            newType = 'savings';
            actionDesc = `Withdrawal from Investment: ${originalTx.description}`;
        } else if (originalTx.type === 'savings') {
            // Savings -> Expense (Spending the savings)
            newType = 'expense';
            actionDesc = `Spent from Savings: ${originalTx.description}`;
        } else if (originalTx.type === 'income') {
            // Income -> Savings (Moving realized income to savings)
            newType = 'savings';
            actionDesc = `Moved from Income: ${originalTx.description}`;
        } else {
            return res.status(400).json({ message: 'Cannot withdraw from this type' });
        }

        // 4. Update Original Transaction (Decrease Amount)
        const oldAmount = originalTx.amount;
        originalTx.amount -= amount;
        
        // If amount becomes 0, should we delete it? 
        // Better to keep it with 0 amount for history, or usually just decrease it.
        await originalTx.save();

        // 5. Create New Transaction (The Withdrawal Result)
        const newTx = await Transaction.create({
            user: req.user.id,
            folder: originalTx.folder,
            type: newType,
            amount: amount,
            description: actionDesc,
            date: new Date()
        });

        // 6. Log to History
        await History.create({
            user: req.user.id,
            folder: originalTx.folder,
            action: 'WITHDRAW',
            description: `Withdrew $${amount} from "${originalTx.description}" (${oldAmount} → ${originalTx.amount}). Created new ${newType}.`,
            originalDate: new Date()
        });

        res.status(200).json({ original: originalTx, new: newTx });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Withdrawal Error' });
    }
});

router.get('/history', protect, async (req, res) => {
    try {
        const logs = await History.find({ user: req.user.id })
            .populate('folder', 'name') // Get folder name to show where it happened
            .sort({ createdAt: -1 })
            .limit(50); 
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;