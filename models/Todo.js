// backend/models/Todo.js
const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true }); // `timestamps` adds `createdAt` and `updatedAt` fields automatically

module.exports = mongoose.model('Todo', TodoSchema);