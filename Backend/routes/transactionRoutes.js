const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Transaction = require('../models/Transaction');
const History = require('../models/History');

// Get all transactions
router.get('/', protect, async (req, res) => {
    try {
        const keyword = req.query.search
            ? { description: { $regex: req.query.search, $options: 'i' } }
            : {};
        const folderFilter = req.query.folderId ? { folder: req.query.folderId } : {};

        const transactions = await Transaction.find({ 
            user: req.user.id, 
            ...keyword, 
            ...folderFilter 
        })
            .populate('folder')
            .sort({ date: -1 });

        res.json(transactions);
    } catch (error) { 
        console.error('Get transactions error:', error);
        res.status(500).json({ message: 'Server Error' }); 
    }
});

// Get History Logs for a Folder
router.get('/history/:folderId', protect, async (req, res) => {
    try {
        const logs = await History.find({ 
            user: req.user.id, 
            folder: req.params.folderId 
        }).sort({ createdAt: -1 });
        res.json(logs);
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get Global History
router.get('/history', protect, async (req, res) => {
    try {
        const logs = await History.find({ user: req.user.id })
            .populate('folder', 'name')
            .sort({ createdAt: -1 })
            .limit(50); 
        res.json(logs);
    } catch (error) {
        console.error('Get global history error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// CREATE Transaction
router.post('/', protect, async (req, res) => {
    try {
        const { folderId, type, amount, description, date } = req.body;
        
        if (!folderId || !type || !amount || !description) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        if (amount <= 0) {
            return res.status(400).json({ message: 'Amount must be positive' });
        }
        
        const transaction = await Transaction.create({
            user: req.user.id,
            folder: folderId,
            type,
            amount,
            description,
            date: date || Date.now()
        });

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
        console.error('Create transaction error:', error);
        res.status(400).json({ message: 'Invalid data', error: error.message });
    }
});

// UPDATE Transaction
router.put('/:id', protect, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
        if (transaction.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        const oldAmount = transaction.amount;
        const oldDesc = transaction.description;

        transaction.amount = req.body.amount || transaction.amount;
        transaction.description = req.body.description || transaction.description;
        transaction.type = req.body.type || transaction.type;
        transaction.date = req.body.date || transaction.date;
        
        await transaction.save();

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
        console.error('Update transaction error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// DELETE Transaction
router.delete('/:id', protect, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
        if (transaction.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        const { folder, amount, description } = transaction;
        await transaction.deleteOne();

        await History.create({
            user: req.user.id,
            folder: folder,
            action: 'DELETE',
            description: `Deleted transaction: "${description}" ($${amount})`,
            originalDate: new Date()
        });

        res.json({ message: 'Transaction removed' });
    } catch (error) {
        console.error('Delete transaction error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// WITHDRAW/TRANSFER Transaction (FIXED FOR EXTRA)
router.post('/withdraw', protect, async (req, res) => {
    try {
        const { id, amount } = req.body;

        const originalTx = await Transaction.findById(id);
        if (!originalTx) return res.status(404).json({ message: 'Transaction not found' });
        if (originalTx.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        if (!amount || amount <= 0) return res.status(400).json({ message: 'Amount must be positive' });
        if (amount > originalTx.amount) return res.status(400).json({ message: 'Insufficient funds' });

        let newType = 'savings';
        let actionDesc = '';

        if (originalTx.type === 'investment') {
            newType = 'savings';
            actionDesc = `Withdrawal from Investment: ${originalTx.description}`;
        } else if (originalTx.type === 'savings') {
            newType = 'expense';
            actionDesc = `Spent from Savings: ${originalTx.description}`;
        } else if (originalTx.type === 'income') {
            newType = 'savings';
            actionDesc = `Moved from Income: ${originalTx.description}`;
        } else if (originalTx.type === 'extra') { 
            // ADDED: Allow withdrawing from Extra
            newType = 'savings';
            actionDesc = `Moved from Extra: ${originalTx.description}`;
        } else {
            return res.status(400).json({ message: 'Cannot withdraw from this transaction type' });
        }

        const oldAmount = originalTx.amount;
        originalTx.amount -= amount;
        await originalTx.save();

        const newTx = await Transaction.create({
            user: req.user.id,
            folder: originalTx.folder,
            type: newType,
            amount: amount,
            description: actionDesc,
            date: new Date()
        });

        await History.create({
            user: req.user.id,
            folder: originalTx.folder,
            action: 'WITHDRAW',
            description: `Withdrew $${amount} from "${originalTx.description}" (${oldAmount} → ${originalTx.amount}). Created new ${newType}.`,
            originalDate: new Date()
        });

        res.status(200).json({ original: originalTx, new: newTx, message: 'Withdrawal successful' });

    } catch (error) {
        console.error('Withdrawal error:', error);
        res.status(500).json({ message: 'Server Withdrawal Error', error: error.message });
    }
});

module.exports = router;