// backend/routes/todos.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Todo = require('../models/Todo');

// GET all todos for the logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const todos = await Todo.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(todos);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// POST a new todo for the logged-in user
router.post('/', auth, async (req, res) => {
    const { text } = req.body;
    try {
        const newTodo = new Todo({
            text,
            userId: req.userId
        });
        const todo = await newTodo.save();
        res.json(todo);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// PUT (update) a todo's completion status
router.put('/:id', auth, async (req, res) => {
    try {
        let todo = await Todo.findById(req.params.id);
        if (!todo) return res.status(404).json({ msg: 'Todo not found' });
        if (todo.userId.toString() !== req.userId) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        todo.completed = !todo.completed;
        await todo.save();
        res.json(todo);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// DELETE a todo
router.delete('/:id', auth, async (req, res) => {
    try {
        let todo = await Todo.findById(req.params.id);
        if (!todo) return res.status(404).json({ msg: 'Todo not found' });
        if (todo.userId.toString() !== req.userId) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        await todo.deleteOne();
        res.json({ msg: 'Todo removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;