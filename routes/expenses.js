// backend/routes/expenses.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');

// GET all expenses for the logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(expenses);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// POST a new expense for the logged-in user
router.post('/', auth, async (req, res) => {
    const { description, amount, category } = req.body;
    try {
        const newExpense = new Expense({
            description,
            amount,
            category,
            userId: req.userId
        });
        const expense = await newExpense.save();
        res.json(expense);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// DELETE an expense
router.delete('/:id', auth, async (req, res) => {
    try {
        let expense = await Expense.findById(req.params.id);
        if (!expense) return res.status(404).json({ msg: 'Expense not found' });

        if (expense.userId.toString() !== req.userId) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await expense.deleteOne();
        res.json({ msg: 'Expense removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;