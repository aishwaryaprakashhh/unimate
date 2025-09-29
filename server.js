// --- Dependencies ---
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');

// --- Models and Middleware ---
const User = require('./models/User');
const Todo = require('./models/Todo');
const Expense = require('./models/Expense'); // This line was added
const Event = require('./models/Event');
const auth = require('./middleware/auth.js');

// --- App Configuration ---
const app = express();
const PORT = 5001;
const JWT_SECRET = 'a_very_secure_and_matching_secret_key';

// --- Middleware ---
app.use(express.json());
app.use(cors());

// --- Database Connection ---
mongoose.connect('mongodb://127.0.0.1:27017/myapp')
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.log('❌ MongoDB connection error:', err));

// --- Static File Serving ---
// Serve files from the parent directory (where your HTML files are)
app.use(express.static(path.join(__dirname, '../')));


// --- Page Serving Routes ---
app.get(['/', '/login.html'], (req, res) => {
    res.sendFile(path.join(__dirname, '../login.html'));
});
app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../register.html'));
});
app.get('/home.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../home.html'));
});


// --- Authentication API Routes ---
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

        const payload = { id: user._id };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, username: user.username });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});


// --- Feature API Routes ---
app.use('/api/todos', require('./routes/todos'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/events', require('./routes/events'));


// --- Start Server ---
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));