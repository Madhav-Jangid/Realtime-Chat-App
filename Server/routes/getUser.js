const express = require('express');
const router = express.Router();
const userModel = require('../models/UserModel.js');

router.get('/:userEmail', async (req, res) => {
    try {
        const userEmail = req.params.userEmail;
        console.log(userEmail);
        const user = await userModel.findOne({ email: userEmail });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json({ user });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
