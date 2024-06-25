const express = require('express');
const router = express.Router();
const userModel = require('../models/UserModel');

router.post('/', async (req, res) => {
  const { name, email, imgUrl } = req.body;
  console.log(name, email, imgUrl);
  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }

  try {
    let user = await userModel.findOne({ email: email });

    if (user) {
      return res.status(200).json(user);
    }

    user = new userModel({
      name,
      email,
      imgUrl
    });

    const newUser = await user.save();
    res.status(201).json(newUser);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
