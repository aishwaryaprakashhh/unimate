const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Event = require('../models/Event');

// --- GET all events for the logged-in user ---
router.get('/', auth, async (req, res) => {
    try {
        // Find events and send them directly without re-formatting
        const events = await Event.find({ userId: req.userId });
        res.json(events); 
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- POST a new event for the logged-in user ---
router.post('/', auth, async (req, res) => {
    const { title, date, priority } = req.body;
    try {
        const newEvent = new Event({
            title,
            date,
            priority,
            userId: req.userId // Associate the event with the logged-in user
        });
        const event = await newEvent.save();
        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- DELETE an event by its ID ---
router.delete('/:id', auth, async (req, res) => {
    try {
        let event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        // Security Check: Ensure the user owns the event before deleting
        if (event.userId.toString() !== req.userId) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await event.deleteOne();
        res.json({ msg: 'Event removed' });

    } catch (err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;