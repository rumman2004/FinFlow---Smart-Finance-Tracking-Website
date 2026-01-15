const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());

// FIX: Remove the trailing slash from the Vercel URL
app.use(cors({
    origin: [
        "http://localhost:5173",
        // Replace this with your ACTUAL Frontend Vercel URL (no slash at end)
        "https://fin-flow-smart-finance-tracking-web-nine.vercel.app" 
    ],
    credentials: true
}));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/folders', require('./routes/folderRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));

const PORT = process.env.PORT || 5000;

// Export app for Vercel
module.exports = app;

if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}