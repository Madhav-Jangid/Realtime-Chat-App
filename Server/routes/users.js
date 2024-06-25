const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
require('dotenv').config();

router.get('/', async (req, res) => {
    try {
        const response = await fetch(process.env.REACT_APP_CLERK_API_URL, {
            headers: {
                'Authorization': `Bearer ${process.env.REACT_APP_CLERK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: response.statusText });
        }

        const data = await response.json();
        return res.json(data);
    } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
