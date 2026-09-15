const User = require('../models/userModel');

const updateProfile = async (req, res) => {
  try {
    const updatedRows = await User.update(req.user.id, req.body);
    
    if (updatedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await User.findById(req.user.id);
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  updateProfile
};
