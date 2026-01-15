const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());

// --- FIXED CORS SECTION ---
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Allow Localhost AND any Vercel URL (ends with .vercel.app)
        if (origin.startsWith('http://localhost') || origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }
        
        // Block anything else
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
// --------------------------

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/folders', require('./routes/folderRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));

const PORT = process.env.PORT || 5000;

// Export app for Vercel (CRITICAL: Do not remove)
module.exports = app;

if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}